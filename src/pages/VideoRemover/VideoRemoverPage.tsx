import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  Eye, 
  PlusCircle, 
  Trash2, 
  Upload, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import type { SelectionRect, VideoKeyframe, VideoMetadata } from '../../types';
import { FileDropzone } from '../../components/Upload/FileDropzone';
import { 
  processVideoWatermarkRemoval, 
  inpaintFrameCanvas, 
  getInterpolatedRect 
} from '../../services/videoProcessing/videoProcessor';
import { downloadFile } from '../../services/imageProcessing/imageService';

export const VideoRemoverPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Video State
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  // Video Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Watermark Selection
  const [watermarkMode, setWatermarkMode] = useState<'static' | 'moving'>('static');
  const [selectionRect, setSelectionRect] = useState<SelectionRect>({ x: 50, y: 50, width: 140, height: 60 });
  const [keyframes, setKeyframes] = useState<VideoKeyframe[]>([]);
  const [isDraggingRect, setIsDraggingRect] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ clientX: number; clientY: number; rectX: number; rectY: number }>({ clientX: 0, clientY: 0, rectX: 0, rectY: 0 });

  // Time Range Trimming
  const [rangeStart, setRangeStart] = useState<number>(0);
  const [rangeEnd, setRangeEnd] = useState<number>(0);

  // Frame Preview Modal / State
  const [previewFrameUrl, setPreviewFrameUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

  // Processing & Export
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingState, setProcessingState] = useState<{
    frame: number;
    totalFrames: number;
    percent: number;
    stage: string;
  }>({ frame: 0, totalFrames: 0, percent: 0, stage: '' });
  const cancelProcessingRef = useRef<boolean>(false);

  const [exportQuality, setExportQuality] = useState<'high' | 'balanced' | 'fast'>('high');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle Video Selection
  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    if (processedVideoUrl) URL.revokeObjectURL(processedVideoUrl);
    setProcessedVideoUrl(null);
    setProcessedBlob(null);
    setPreviewFrameUrl(null);
    setKeyframes([]);

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      const dur = video.duration || 5;
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;

      setVideoMetadata({
        file,
        name: file.name,
        duration: dur,
        width: w,
        height: h,
        size: file.size,
        type: file.type || 'video/mp4',
        fps: 30,
        url,
      });

      setDuration(dur);
      setRangeStart(0);
      setRangeEnd(dur);

      // Default watermark box in bottom right
      setSelectionRect({
        x: Math.round(w - 200),
        y: Math.round(h - 100),
        width: 160,
        height: 60,
      });

      setVideoUrl(url);
    };

    video.onerror = () => {
      setErrorMessage('Could not decode video file. Please ensure it is an MP4 or WebM video.');
    };
  };

  useEffect(() => {
    if (location.state && (location.state as any).uploadedFile) {
      handleFileSelect((location.state as any).uploadedFile);
    }
  }, [location.state]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (processedVideoUrl) URL.revokeObjectURL(processedVideoUrl);
      if (previewFrameUrl) URL.revokeObjectURL(previewFrameUrl);
    };
  }, [videoUrl, processedVideoUrl, previewFrameUrl]);

  // Drag handler for watermark bounding box overlay
  useEffect(() => {
    if (!isDraggingRect || !videoContainerRef.current || !videoMetadata) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = videoContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scaleX = videoMetadata.width / rect.width;
      const scaleY = videoMetadata.height / rect.height;

      const deltaX = (e.clientX - dragStartPos.clientX) * scaleX;
      const deltaY = (e.clientY - dragStartPos.clientY) * scaleY;

      const newX = Math.max(0, Math.min(videoMetadata.width - selectionRect.width, Math.round(dragStartPos.rectX + deltaX)));
      const newY = Math.max(0, Math.min(videoMetadata.height - selectionRect.height, Math.round(dragStartPos.rectY + deltaY)));

      setSelectionRect((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    };

    const handleMouseUp = () => {
      setIsDraggingRect(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingRect, dragStartPos, selectionRect.width, selectionRect.height, videoMetadata]);
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (watermarkMode === 'moving' && keyframes.length > 0) {
      const currentBox = getInterpolatedRect(t, selectionRect, keyframes);
      setSelectionRect(currentBox);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const stepFrame = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    handleSeek(target);
  };

  // Keyframe Management
  const addKeyframe = () => {
    const existingIdx = keyframes.findIndex((k) => Math.abs(k.timestamp - currentTime) < 0.2);
    if (existingIdx >= 0) {
      const updated = [...keyframes];
      updated[existingIdx] = { timestamp: currentTime, rect: { ...selectionRect } };
      setKeyframes(updated);
    } else {
      const updated = [...keyframes, { timestamp: currentTime, rect: { ...selectionRect } }].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      setKeyframes(updated);
    }
  };

  const removeKeyframe = (index: number) => {
    setKeyframes(keyframes.filter((_, i) => i !== index));
  };

  // Preview Inpainting on current single frame
  const handlePreviewCurrentFrame = async () => {
    if (!videoRef.current || !videoMetadata) return;
    setIsPreviewing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoMetadata.width;
      canvas.height = videoMetadata.height;
      const ctx = canvas.getContext('2d')!;

      // Draw current paused frame
      ctx.drawImage(videoRef.current, 0, 0, videoMetadata.width, videoMetadata.height);

      // Inpaint the selection rectangle
      await inpaintFrameCanvas(canvas, selectionRect, true);

      // Generate preview data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setPreviewFrameUrl(dataUrl);
    } catch (err: any) {
      setErrorMessage('Frame preview failed: ' + (err?.message || err));
    } finally {
      setIsPreviewing(false);
    }
  };

  // Process Entire Video
  const handleProcessVideo = async () => {
    if (!videoRef.current || !videoMetadata) return;
    setErrorMessage(null);
    setIsProcessing(true);
    cancelProcessingRef.current = false;

    // Pause video
    videoRef.current.pause();
    setIsPlaying(false);

    try {
      const outputBlob = await processVideoWatermarkRemoval({
        videoElement: videoRef.current,
        sourceFile: videoMetadata.file,
        selectionRect,
        keyframes,
        startTime: rangeStart,
        endTime: rangeEnd,
        quality: exportQuality,
        onProgress: (frame, totalFrames, percent, stage) => {
          setProcessingState({ frame, totalFrames, percent, stage });
        },
        shouldCancel: () => cancelProcessingRef.current,
      });

      const url = URL.createObjectURL(outputBlob);
      if (processedVideoUrl) URL.revokeObjectURL(processedVideoUrl);
      setProcessedVideoUrl(url);
      setProcessedBlob(outputBlob);
    } catch (err: any) {
      if (err?.message?.includes('cancelled')) {
        setErrorMessage('Video processing cancelled.');
      } else {
        setErrorMessage('Video processing failed: ' + (err?.message || err));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!processedBlob || !videoMetadata) return;
    const baseName = videoMetadata.name.substring(0, videoMetadata.name.lastIndexOf('.')) || videoMetadata.name;
    const ext = processedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    downloadFile(processedBlob, `${baseName}-restored.${ext}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Video Watermark Remover</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                100% Client-Side Frame Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Frame-by-frame inpainting for channel logos, timestamps, and moving watermarks with audio preservation.
            </p>
          </div>
        </div>

        {videoMetadata && (
          <button
            type="button"
            onClick={() => {
              setVideoMetadata(null);
              setVideoUrl(null);
              setProcessedVideoUrl(null);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Open Different Video</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      {!videoMetadata ? (
        /* Empty State: File Upload */
        <div className="max-w-3xl mx-auto py-12 space-y-8">
          <FileDropzone
            accept="video"
            onFileSelect={handleFileSelect}
            title="Upload video to remove watermark"
            subtitle="Supports MP4, WebM, MOV. Processed entirely inside your browser."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="font-semibold text-slate-800 block">Audio Track Preserved</span>
              <p>Original high-fidelity audio streams are multiplexed back into the output file.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="font-semibold text-slate-800 block">Keyframe Interpolation</span>
              <p>Supports moving logos by interpolating bounding boxes across timestamp keyframes.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="font-semibold text-slate-800 block">Zero Server Uploads</span>
              <p>Video frames are decoded and reconstructed directly in local RAM.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Video Editor Workspace */
        <div className="space-y-6">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 font-bold px-2"
              >
                &times;
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 Cols: Video Player & Selection Canvas */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Video Player Display with Canvas Overlay */}
              <div
                ref={videoContainerRef}
                className="relative rounded-3xl bg-black border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center min-h-[380px] max-h-[600px] select-none"
              >
                <video
                  ref={videoRef}
                  src={videoUrl || undefined}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-auto max-h-[580px] object-contain block mx-auto pointer-events-none"
                  playsInline
                />

                {/* Interactive Watermark Bounding Box Overlay */}
                {videoContainerRef.current && (
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/35 cursor-move flex items-center justify-center shadow-lg"
                    style={{
                      left: `${(selectionRect.x / videoMetadata.width) * 100}%`,
                      top: `${(selectionRect.y / videoMetadata.height) * 100}%`,
                      width: `${(selectionRect.width / videoMetadata.width) * 100}%`,
                      height: `${(selectionRect.height / videoMetadata.height) * 100}%`,
                    }}
                    onMouseDown={(e) => {
                      setIsDraggingRect(true);
                      setDragStartPos({
                        clientX: e.clientX,
                        clientY: e.clientY,
                        rectX: selectionRect.x,
                        rectY: selectionRect.y,
                      });
                    }}
                  >
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white uppercase tracking-wider select-none pointer-events-none shadow-xs">
                      Watermark
                    </span>
                  </div>
                )}
              </div>

              {/* Playback & Timeline Controls */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                
                {/* Timeline Scrubber */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                    <span className="font-semibold text-indigo-600">
                      {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                    </span>
                    <span className="text-slate-400">
                      {new Date(duration * 1000).toISOString().substr(14, 5)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.033"
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* Transport Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepFrame(-0.033)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                      title="Step 1 Frame Back"
                    >
                      &larr; Frame
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => stepFrame(0.033)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                      title="Step 1 Frame Forward"
                    >
                      Frame &rarr;
                    </button>
                  </div>

                  {/* Preview Inpainting on Current Frame */}
                  <button
                    type="button"
                    onClick={handlePreviewCurrentFrame}
                    disabled={isPreviewing}
                    className="px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    {isPreviewing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>Preview Frame Inpainting</span>
                  </button>
                </div>

              </div>

              {/* Single Frame Inpainting Preview Modal / Box */}
              {previewFrameUrl && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Inpainted Frame Preview (At {currentTime.toFixed(2)}s)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setPreviewFrameUrl(null)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                    >
                      &times; Close Preview
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-black max-h-[300px] flex items-center justify-center">
                    <img src={previewFrameUrl} alt="Inpainted frame preview" className="w-full h-auto object-contain max-h-[300px]" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This preview verifies the inpainting quality on this exact video frame before full video rendering.
                  </p>
                </div>
              )}

            </div>

            {/* Right Col: Watermark Settings & Rendering Controls */}
            <div className="space-y-5 p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs text-slate-800">
              
              {/* Primary Action Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleProcessVideo}
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    isProcessing
                      ? 'bg-indigo-400 text-white cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 active:scale-[0.99]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Rendering Video Frames...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Remove Video Watermark</span>
                    </>
                  )}
                </button>

                {/* Progress bar during rendering */}
                {isProcessing && (
                  <div className="space-y-2 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                      <span className="truncate">{processingState.stage}</span>
                      <span className="font-mono">{processingState.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-indigo-200/70 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                        style={{ width: `${processingState.percent}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        cancelProcessingRef.current = true;
                      }}
                      className="w-full py-1 text-center text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline"
                    >
                      Cancel Processing
                    </button>
                  </div>
                )}
              </div>

              {/* Watermark Type Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Watermark Position Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWatermarkMode('static')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      watermarkMode === 'static'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Static Watermark
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatermarkMode('moving')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      watermarkMode === 'moving'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Moving (Keyframes)
                  </button>
                </div>
              </div>

              {/* Keyframe Controls if Moving */}
              {watermarkMode === 'moving' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Keyframe Tracker</span>
                    <button
                      type="button"
                      onClick={addKeyframe}
                      className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Set at {currentTime.toFixed(1)}s</span>
                    </button>
                  </div>

                  {keyframes.length === 0 ? (
                    <p className="text-[11px] text-slate-400">
                      Scrub to the start of the watermark, adjust the red box, and click "Set Keyframe". Then scrub forward and adjust again.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {keyframes.map((kf, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <span className="font-mono text-slate-700">
                            Time: {kf.timestamp.toFixed(2)}s
                          </span>
                          <button
                            type="button"
                            onClick={() => removeKeyframe(i)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bounding Box Dimensions Adjustment */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Selection Box Size</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Width</span>
                    <input
                      type="number"
                      min="20"
                      max={videoMetadata.width}
                      value={selectionRect.width}
                      onChange={(e) =>
                        setSelectionRect({ ...selectionRect, width: parseInt(e.target.value, 10) || 50 })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Height</span>
                    <input
                      type="number"
                      min="10"
                      max={videoMetadata.height}
                      value={selectionRect.height}
                      onChange={(e) =>
                        setSelectionRect({ ...selectionRect, height: parseInt(e.target.value, 10) || 30 })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Quality & Encoding Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Export Video Quality
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['high', 'balanced', 'fast'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setExportQuality(q)}
                      className={`py-1.5 px-2 rounded-lg font-semibold uppercase border transition-all ${
                        exportQuality === q
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Info Panel */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {videoMetadata.width} &times; {videoMetadata.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-mono font-semibold text-slate-800">{duration.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio:</span>
                  <span className="font-semibold text-emerald-600">Preserved (Sync Lock)</span>
                </div>
              </div>

              {/* Download Button if Processed */}
              {processedBlob && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Download Restored Video</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
