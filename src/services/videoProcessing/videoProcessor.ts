import type { SelectionRect, VideoKeyframe } from '../../types';
import { runOpenCVInpaint, loadOpenCV } from '../imageProcessing/opencvInpaint';
import { runPatchInpaint } from '../imageProcessing/patchInpaint';

export interface VideoProcessOptions {
  videoElement: HTMLVideoElement;
  sourceFile: File;
  selectionRect: SelectionRect;
  keyframes: VideoKeyframe[];
  startTime: number;
  endTime: number;
  fps?: number;
  quality?: 'high' | 'balanced' | 'fast';
  onProgress?: (frame: number, totalFrames: number, percent: number, stage: string) => void;
  shouldCancel?: () => boolean;
}

/**
 * Interpolates watermark selection rectangle between keyframes for a specific timestamp
 */
export function getInterpolatedRect(
  timestamp: number,
  defaultRect: SelectionRect,
  keyframes: VideoKeyframe[]
): SelectionRect {
  if (keyframes.length === 0) return defaultRect;
  if (keyframes.length === 1) return keyframes[0].rect;

  // Sort keyframes by timestamp
  const sorted = [...keyframes].sort((a, b) => a.timestamp - b.timestamp);

  if (timestamp <= sorted[0].timestamp) return sorted[0].rect;
  if (timestamp >= sorted[sorted.length - 1].timestamp) return sorted[sorted.length - 1].rect;

  // Find surrounding keyframes
  let prev = sorted[0];
  let next = sorted[1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (timestamp >= sorted[i].timestamp && timestamp <= sorted[i + 1].timestamp) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  const duration = next.timestamp - prev.timestamp;
  if (duration <= 0) return prev.rect;

  const t = (timestamp - prev.timestamp) / duration;

  return {
    x: Math.round(prev.rect.x + (next.rect.x - prev.rect.x) * t),
    y: Math.round(prev.rect.y + (next.rect.y - prev.rect.y) * t),
    width: Math.round(prev.rect.width + (next.rect.width - prev.rect.width) * t),
    height: Math.round(prev.rect.height + (next.rect.height - prev.rect.height) * t),
  };
}

/**
 * Inpaints a single video frame canvas using the interpolated watermark rectangle.
 */
export async function inpaintFrameCanvas(
  frameCanvas: HTMLCanvasElement,
  rect: SelectionRect,
  useOpenCV: boolean = true
): Promise<void> {
  const w = frameCanvas.width;
  const h = frameCanvas.height;

  // Create temporary mask canvas
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d')!;

  maskCtx.fillStyle = 'rgba(239, 68, 68, 1.0)';
  maskCtx.fillRect(rect.x, rect.y, rect.width, rect.height);

  try {
    if (useOpenCV) {
      const restoredData = await runOpenCVInpaint(frameCanvas, maskCanvas, 4, 'telea');
      const ctx = frameCanvas.getContext('2d')!;
      ctx.putImageData(restoredData, 0, 0);
    } else {
      const restoredData = runPatchInpaint(frameCanvas, maskCanvas);
      const ctx = frameCanvas.getContext('2d')!;
      ctx.putImageData(restoredData, 0, 0);
    }
  } catch (err) {
    // Fallback: Patch inpaint
    const restoredData = runPatchInpaint(frameCanvas, maskCanvas);
    const ctx = frameCanvas.getContext('2d')!;
    ctx.putImageData(restoredData, 0, 0);
  }
}

/**
 * Processes full video frame-by-frame, inpaints watermark regions,
 * and reconstructs the video with audio preservation into a downloadable Blob.
 */
export async function processVideoWatermarkRemoval(
  options: VideoProcessOptions
): Promise<Blob> {
  const {
    videoElement,
    selectionRect,
    keyframes,
    startTime,
    endTime,
    fps = 30,
    quality = 'high',
    onProgress,
    shouldCancel,
  } = options;

  onProgress?.(0, 100, 5, 'Initializing video processing engine...');

  const videoW = videoElement.videoWidth;
  const videoH = videoElement.videoHeight;
  const duration = Math.max(0.1, endTime - startTime);
  const totalFrames = Math.max(1, Math.round(duration * fps));

  // Initialize OpenCV ahead of time so frames process rapidly
  let hasOpenCV = false;
  try {
    await loadOpenCV();
    hasOpenCV = true;
  } catch {
    hasOpenCV = false;
  }

  // Setup offscreen canvas at exact video resolution
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = videoW;
  renderCanvas.height = videoH;
  const renderCtx = renderCanvas.getContext('2d', { willReadFrequently: true })!;

  // Setup audio extraction from source video file
  onProgress?.(0, totalFrames, 10, 'Configuring audio track preservation...');
  let audioStreamTrack: MediaStreamTrack | null = null;
  let audioCtx: AudioContext | null = null;

  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sourceNode = audioCtx.createMediaElementSource(videoElement);
    const destNode = audioCtx.createMediaStreamDestination();
    sourceNode.connect(destNode);
    audioStreamTrack = destNode.stream.getAudioTracks()[0] || null;
  } catch (audioErr) {
    console.warn('Audio extraction through AudioContext not permitted or video is silent:', audioErr);
  }

  // Create output MediaStream from canvas + audio track
  const canvasStream = renderCanvas.captureStream(fps);
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((vt) => combinedStream.addTrack(vt));
  if (audioStreamTrack) {
    combinedStream.addTrack(audioStreamTrack);
  }

  // Determine optimal video bitrate based on quality setting
  const bitrates = {
    high: 8000000,     // 8 Mbps
    balanced: 4000000, // 4 Mbps
    fast: 2000000,     // 2 Mbps
  };
  const videoBitsPerSecond = bitrates[quality] || 6000000;

  // MediaRecorder setup with supported MIME types
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/mp4';
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  recorder.start();

  // Step through frames sequentially
  const frameInterval = 1 / fps;
  let currentFrame = 0;

  // Helper to seek video element to timestamp
  const seekVideo = (time: number): Promise<void> => {
    return new Promise((resolve) => {
      const onSeeked = () => {
        videoElement.removeEventListener('seeked', onSeeked);
        resolve();
      };
      videoElement.addEventListener('seeked', onSeeked);
      videoElement.currentTime = time;
    });
  };

  try {
    for (let t = startTime; t < endTime; t += frameInterval) {
      if (shouldCancel?.()) {
        recorder.stop();
        throw new Error('Video processing was cancelled by user.');
      }

      currentFrame++;
      const percent = Math.min(98, Math.round(15 + (currentFrame / totalFrames) * 80));
      onProgress?.(
        currentFrame,
        totalFrames,
        percent,
        `Processing frame ${currentFrame} / ${totalFrames} (${(t - startTime).toFixed(1)}s)...`
      );

      // Seek to frame time
      await seekVideo(t);

      // Draw current video frame onto master canvas
      renderCtx.drawImage(videoElement, 0, 0, videoW, videoH);

      // Interpolate watermark bounding box for this frame
      const currentBox = getInterpolatedRect(t, selectionRect, keyframes);

      // Inpaint watermark region on this frame
      if (currentBox.width > 2 && currentBox.height > 2) {
        await inpaintFrameCanvas(renderCanvas, currentBox, hasOpenCV);
      }

      // Small tick to allow stream capture to process frame
      await new Promise((r) => setTimeout(r, 12));
    }

    onProgress?.(totalFrames, totalFrames, 99, 'Finalizing video stream recording...');
    recorder.stop();

    const outputBlob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunks, { type: mimeType });
        resolve(fullBlob);
      };
    });

    onProgress?.(totalFrames, totalFrames, 100, 'Video restoration complete.');
    return outputBlob;
  } finally {
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  }
}
