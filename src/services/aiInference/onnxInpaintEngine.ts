import * as ort from 'onnxruntime-web';

// Configure local WASM assets
ort.env.wasm.wasmPaths = '/ort/';
ort.env.wasm.numThreads = Math.min(4, navigator.hardwareConcurrency || 2);

export interface ModelLoadingState {
  status: 'idle' | 'checking_cache' | 'downloading' | 'loading' | 'ready' | 'error';
  progressPercent: number;
  message: string;
  error?: string;
  modelName: string;
  sizeMB?: number;
}

const DB_NAME = 'WatermarkClearAI_DB';
const STORE_NAME = 'onnx_models';
const MODEL_KEY = 'lama_inpaint_model';

// Standard openly licensed LaMa ONNX model mirror on Hugging Face
export const DEFAULT_MODEL_URL = 'https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx';

let session: ort.InferenceSession | null = null;

// IndexedDB Helper to cache large ONNX weights locally
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getCachedModel(): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(MODEL_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function saveCachedModel(buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, MODEL_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore cache save error if storage is restricted
  }
}

export async function hasCachedModel(): Promise<boolean> {
  const cached = await getCachedModel();
  return !!cached;
}

export async function deleteCachedModel(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(MODEL_KEY);
    session = null;
  } catch (err) {
    console.error('Error deleting cached model', err);
  }
}

/**
 * Initializes or downloads the ONNX inpainting model
 */
export async function initAIModel(
  customBufferOrUrl?: ArrayBuffer | string,
  onProgress?: (state: ModelLoadingState) => void
): Promise<ort.InferenceSession> {
  if (session) {
    onProgress?.({
      status: 'ready',
      progressPercent: 100,
      message: 'AI Model is ready for inference.',
      modelName: 'LaMa Inpainting ONNX',
    });
    return session;
  }

  try {
    let modelBuffer: ArrayBuffer | null = null;

    if (customBufferOrUrl instanceof ArrayBuffer) {
      modelBuffer = customBufferOrUrl;
      await saveCachedModel(modelBuffer);
    } else {
      // 1. Check local IndexedDB cache first
      onProgress?.({
        status: 'checking_cache',
        progressPercent: 10,
        message: 'Checking local browser cache for AI model...',
        modelName: 'LaMa Inpainting ONNX',
      });

      modelBuffer = await getCachedModel();

      if (!modelBuffer) {
        // 2. Download model with streaming progress
        const modelUrl = (typeof customBufferOrUrl === 'string' && customBufferOrUrl) ? customBufferOrUrl : DEFAULT_MODEL_URL;
        
        onProgress?.({
          status: 'downloading',
          progressPercent: 15,
          message: 'Downloading openly licensed LaMa inpainting model...',
          modelName: 'LaMa Inpainting ONNX',
        });

        const response = await fetch(modelUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch model weights: HTTP ${response.status}`);
        }

        const contentLength = response.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = response.body?.getReader();

        if (!reader) {
          modelBuffer = await response.arrayBuffer();
        } else {
          const chunks: Uint8Array[] = [];
          let receivedBytes = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              receivedBytes += value.length;
              if (totalBytes > 0) {
                const percent = Math.min(90, Math.round(15 + (receivedBytes / totalBytes) * 75));
                onProgress?.({
                  status: 'downloading',
                  progressPercent: percent,
                  message: `Downloading AI model weights (${(receivedBytes / (1024 * 1024)).toFixed(1)} / ${(totalBytes / (1024 * 1024)).toFixed(1)} MB)...`,
                  modelName: 'LaMa Inpainting ONNX',
                  sizeMB: Math.round(receivedBytes / (1024 * 1024)),
                });
              }
            }
          }

          const combined = new Uint8Array(receivedBytes);
          let offset = 0;
          for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }
          modelBuffer = combined.buffer;
        }

        // Cache for future offline visits
        if (modelBuffer) {
          await saveCachedModel(modelBuffer);
        }
      }
    }

    onProgress?.({
      status: 'loading',
      progressPercent: 92,
      message: 'Compiling neural network into WebAssembly/WebGL session...',
      modelName: 'LaMa Inpainting ONNX',
    });

    // Try WebGL first for GPU hardware acceleration, fallback to WASM
    try {
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['webgl', 'wasm'],
        graphOptimizationLevel: 'all',
      });
    } catch (gpuErr) {
      console.warn('WebGL execution provider failed, falling back to pure WASM:', gpuErr);
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm'],
      });
    }

    onProgress?.({
      status: 'ready',
      progressPercent: 100,
      message: 'AI Model successfully loaded & ready.',
      modelName: 'LaMa Inpainting ONNX',
    });

    return session;
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown error during AI model initialization';
    onProgress?.({
      status: 'error',
      progressPercent: 0,
      message: 'Failed to initialize AI model.',
      error: errorMsg,
      modelName: 'LaMa Inpainting ONNX',
    });
    throw err;
  }
}

/**
 * Runs deep learning inpainting inference on the selected watermark area.
 * Employs sub-region contextual bounding box cropping and high-resolution feather blending.
 */
export async function runONNXAIInpaint(
  imageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  onProgress?: (msg: string) => void
): Promise<ImageData> {
  if (!session) {
    throw new Error('AI Session is not loaded. Please initialize the AI model first.');
  }

  const origWidth = imageCanvas.width;
  const origHeight = imageCanvas.height;

  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  const imgCtx = imageCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx || !imgCtx) throw new Error('Could not get 2D canvas contexts');

  const maskData = maskCtx.getImageData(0, 0, origWidth, origHeight);
  const maskPixels = maskData.data;

  // 1. Find bounding box of watermark
  let minX = origWidth, maxX = 0, minY = origHeight, maxY = 0;
  let hasMark = false;

  for (let y = 0; y < origHeight; y++) {
    for (let x = 0; x < origWidth; x++) {
      const px = (y * origWidth + x) * 4;
      if (maskPixels[px + 3] > 10 && (maskPixels[px] > 10 || maskPixels[px + 1] > 10 || maskPixels[px + 2] > 10)) {
        hasMark = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasMark) {
    return imgCtx.getImageData(0, 0, origWidth, origHeight);
  }

  onProgress?.('Preparing neural network input tensors (512x512)...');

  // Add 60% context padding around bounding box to provide surround imagery
  const boxW = maxX - minX;
  const boxH = maxY - minY;
  const padX = Math.round(Math.max(30, boxW * 0.6));
  const padY = Math.round(Math.max(30, boxH * 0.6));

  const cropX = Math.max(0, minX - padX);
  const cropY = Math.max(0, minY - padY);
  const cropW = Math.min(origWidth - cropX, (maxX + padX) - cropX);
  const cropH = Math.min(origHeight - cropY, (maxY + padY) - cropY);

  // 2. Prepare 512x512 crop canvas
  const MODEL_SIZE = 512;
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = MODEL_SIZE;
  cropCanvas.height = MODEL_SIZE;
  const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true })!;
  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = 'high';
  cropCtx.drawImage(imageCanvas, cropX, cropY, cropW, cropH, 0, 0, MODEL_SIZE, MODEL_SIZE);

  const cropMaskCanvas = document.createElement('canvas');
  cropMaskCanvas.width = MODEL_SIZE;
  cropMaskCanvas.height = MODEL_SIZE;
  const cropMaskCtx = cropMaskCanvas.getContext('2d', { willReadFrequently: true })!;
  cropMaskCtx.imageSmoothingEnabled = true;
  cropMaskCtx.drawImage(maskCanvas, cropX, cropY, cropW, cropH, 0, 0, MODEL_SIZE, MODEL_SIZE);

  // 3. Extract RGB and Mask into Planar Float32 Arrays
  const cropImgData = cropCtx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data;
  const cropMaskData = cropMaskCtx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data;

  const totalPixels = MODEL_SIZE * MODEL_SIZE;
  const imageTensorData = new Float32Array(3 * totalPixels);
  const maskTensorData = new Float32Array(1 * totalPixels);

  const rOffset = 0;
  const gOffset = totalPixels;
  const bOffset = 2 * totalPixels;

  for (let i = 0; i < totalPixels; i++) {
    const px = i * 4;
    // Normalize image to [0, 1]
    imageTensorData[rOffset + i] = cropImgData[px] / 255.0;
    imageTensorData[gOffset + i] = cropImgData[px + 1] / 255.0;
    imageTensorData[bOffset + i] = cropImgData[px + 2] / 255.0;

    // Mask: 1.0 for inpaint, 0.0 for keep
    const isMasked = cropMaskData[px + 3] > 10 && (cropMaskData[px] > 10 || cropMaskData[px + 1] > 10 || cropMaskData[px + 2] > 10);
    maskTensorData[i] = isMasked ? 1.0 : 0.0;
  }

  const imageTensor = new ort.Tensor('float32', imageTensorData, [1, 3, MODEL_SIZE, MODEL_SIZE]);
  const maskTensor = new ort.Tensor('float32', maskTensorData, [1, 1, MODEL_SIZE, MODEL_SIZE]);

  // 4. Run Inference
  onProgress?.('Executing AI neural network inpainting...');
  const feeds: Record<string, ort.Tensor> = {
    image: imageTensor,
    mask: maskTensor,
  };

  const results = await session.run(feeds);
  const outputTensor = results.output || Object.values(results)[0];
  if (!outputTensor) {
    throw new Error('Neural network did not return an output tensor');
  }

  onProgress?.('Postprocessing and compositing at original resolution...');

  // 5. Convert output tensor back to RGBA ImageData
  const outFloatData = outputTensor.data as Float32Array;
  const resultCropCanvas = document.createElement('canvas');
  resultCropCanvas.width = MODEL_SIZE;
  resultCropCanvas.height = MODEL_SIZE;
  const resultCropCtx = resultCropCanvas.getContext('2d')!;
  const resultCropImgData = resultCropCtx.createImageData(MODEL_SIZE, MODEL_SIZE);
  const resPx = resultCropImgData.data;

  // Output format from LaMa is planar [1, 3, 512, 512] in range [0, 255] or [0, 1]
  const isScale255 = outFloatData[0] > 1.5 || outFloatData[100] > 1.5;

  for (let i = 0; i < totalPixels; i++) {
    const px = i * 4;
    const rVal = isScale255 ? outFloatData[rOffset + i] : outFloatData[rOffset + i] * 255;
    const gVal = isScale255 ? outFloatData[gOffset + i] : outFloatData[gOffset + i] * 255;
    const bVal = isScale255 ? outFloatData[bOffset + i] : outFloatData[bOffset + i] * 255;

    resPx[px] = Math.max(0, Math.min(255, Math.round(rVal)));
    resPx[px + 1] = Math.max(0, Math.min(255, Math.round(gVal)));
    resPx[px + 2] = Math.max(0, Math.min(255, Math.round(bVal)));
    resPx[px + 3] = 255;
  }
  resultCropCtx.putImageData(resultCropImgData, 0, 0);

  // 6. Scale restored crop back to original crop bounds and feather blend with original image
  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = origWidth;
  masterCanvas.height = origHeight;
  const masterCtx = masterCanvas.getContext('2d', { willReadFrequently: true })!;

  // Copy full pristine original image first (100% preservation)
  masterCtx.drawImage(imageCanvas, 0, 0);

  // Create temporary scaled canvas for the inpaint result
  const scaledPatchCanvas = document.createElement('canvas');
  scaledPatchCanvas.width = cropW;
  scaledPatchCanvas.height = cropH;
  const scaledPatchCtx = scaledPatchCanvas.getContext('2d')!;
  scaledPatchCtx.imageSmoothingQuality = 'high';
  scaledPatchCtx.drawImage(resultCropCanvas, 0, 0, MODEL_SIZE, MODEL_SIZE, 0, 0, cropW, cropH);

  // Clip through the exact original mask boundary to guarantee zero bleeding
  const patchImgData = scaledPatchCtx.getImageData(0, 0, cropW, cropH);
  const masterImgData = masterCtx.getImageData(0, 0, origWidth, origHeight);
  const masterData = masterImgData.data;
  const patchData = patchImgData.data;

  for (let dy = 0; dy < cropH; dy++) {
    for (let dx = 0; dx < cropW; dx++) {
      const origX = cropX + dx;
      const origY = cropY + dy;
      const origIdx = (origY * origWidth + origX) * 4;
      const patchIdx = (dy * cropW + dx) * 4;

      // Check if this pixel was in the watermark mask
      const isMask = maskPixels[origIdx + 3] > 10 && (maskPixels[origIdx] > 10 || maskPixels[origIdx + 1] > 10 || maskPixels[origIdx + 2] > 10);
      if (isMask) {
        masterData[origIdx] = patchData[patchIdx];
        masterData[origIdx + 1] = patchData[patchIdx + 1];
        masterData[origIdx + 2] = patchData[patchIdx + 2];
        masterData[origIdx + 3] = 255;
      }
    }
  }

  onProgress?.('AI Inpainting completed successfully.');
  return masterImgData;
}
