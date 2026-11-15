import type { InpaintAlgorithm, ExportFormat } from '../../types';
import { runOpenCVInpaint } from './opencvInpaint';
import { runPatchInpaint } from './patchInpaint';
import { runONNXAIInpaint, initAIModel } from '../aiInference/onnxInpaintEngine';

export interface InpaintOptions {
  algorithm: InpaintAlgorithm;
  radius?: number; // for OpenCV Telea / NS
  onProgress?: (stage: string, percent: number) => void;
}

export interface InpaintResult {
  resultImageData: ImageData;
  executionTimeMs: number;
  algorithmUsed: string;
}

export async function processImageInpaint(
  imageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: InpaintOptions
): Promise<InpaintResult> {
  const startTime = performance.now();
  const { algorithm, radius = 5, onProgress } = options;

  onProgress?.('Preparing image and mask buffers...', 10);

  let resultImageData: ImageData;
  let algorithmUsed: string = algorithm;

  if (algorithm === 'telea' || algorithm === 'ns') {
    onProgress?.(`Initializing OpenCV.js ${algorithm === 'telea' ? 'Telea' : 'Navier-Stokes'}...`, 30);
    try {
      resultImageData = await runOpenCVInpaint(
        imageCanvas,
        maskCanvas,
        radius,
        algorithm,
        (msg) => onProgress?.(msg, 60)
      );
    } catch (err: any) {
      console.warn('OpenCV inpainting encountered error, falling back to Context Patch engine:', err);
      onProgress?.('OpenCV fallback to Context Patch Synthesis...', 50);
      resultImageData = runPatchInpaint(imageCanvas, maskCanvas, (msg) => onProgress?.(msg, 70));
      algorithmUsed = 'patch';
    }
  } else if (algorithm === 'patch') {
    onProgress?.('Running Context-Aware Texture Patch Inpainting...', 40);
    resultImageData = runPatchInpaint(imageCanvas, maskCanvas, (msg) => onProgress?.(msg, 70));
  } else if (algorithm === 'onnx_ai') {
    onProgress?.('Initializing ONNX Runtime Web...', 25);
    try {
      await initAIModel(undefined, (state) => {
        onProgress?.(state.message, Math.min(80, state.progressPercent));
      });
      resultImageData = await runONNXAIInpaint(
        imageCanvas,
        maskCanvas,
        (msg) => onProgress?.(msg, 85)
      );
    } catch (aiErr: any) {
      console.warn('AI Inpainting unavailable or failed, falling back to OpenCV Telea:', aiErr);
      onProgress?.('Falling back to OpenCV Telea algorithm...', 40);
      resultImageData = await runOpenCVInpaint(imageCanvas, maskCanvas, radius, 'telea');
      algorithmUsed = 'telea (fallback)';
    }
  } else {
    throw new Error(`Unsupported inpainting algorithm: ${algorithm}`);
  }

  onProgress?.('Finalizing restored image...', 100);
  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    resultImageData,
    executionTimeMs,
    algorithmUsed,
  };
}

/**
 * Exports canvas to Blob with exact quality parameters and format preservation.
 */
export async function exportCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality: number = 0.95
): Promise<Blob> {
  const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to encode image to blob'));
        }
      },
      mimeType,
      format === 'png' ? undefined : quality
    );
  });
}

/**
 * Triggers browser download for a blob or object URL
 */
export function downloadFile(blobOrUrl: Blob | string, filename: string): void {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
