// OpenCV.js lazy-loader and inpainting service

declare global {
  interface Window {
    cv: any;
    Module?: any;
  }
}

let openCvLoadingPromise: Promise<any> | null = null;

export const loadOpenCV = (onProgress?: (msg: string) => void): Promise<any> => {
  if (window.cv && window.cv.Mat) {
    return Promise.resolve(window.cv);
  }

  if (openCvLoadingPromise) {
    return openCvLoadingPromise;
  }

  openCvLoadingPromise = new Promise((resolve, reject) => {
    onProgress?.('Loading OpenCV.js WebAssembly engine...');

    const existingScript = document.getElementById('opencv-script');
    if (existingScript) {
      if (window.cv && window.cv.Mat) {
        resolve(window.cv);
        return;
      }
    }

    // Set Module callbacks before loading script
    window.Module = {
      onRuntimeInitialized: () => {
        onProgress?.('OpenCV.js WebAssembly initialized.');
        resolve(window.cv);
      },
    };

    const script = document.createElement('script');
    script.id = 'opencv-script';
    script.src = '/libs/opencv.js';
    script.async = true;

    script.onload = () => {
      // In case onRuntimeInitialized already fired or fires shortly
      if (window.cv && window.cv.Mat) {
        resolve(window.cv);
      }
    };

    script.onerror = (err) => {
      openCvLoadingPromise = null;
      reject(new Error('Failed to load OpenCV.js script from local assets: ' + err));
    };

    document.head.appendChild(script);

    // Timeout fallback after 30 seconds
    setTimeout(() => {
      if (window.cv && window.cv.Mat) {
        resolve(window.cv);
      } else {
        openCvLoadingPromise = null;
        reject(new Error('OpenCV.js initialization timed out.'));
      }
    }, 30000);
  });

  return openCvLoadingPromise;
};

/**
 * Runs OpenCV Inpainting (Telea or Navier-Stokes) on the given image canvas and mask canvas.
 * Preserves exact pixel dimensions.
 */
export async function runOpenCVInpaint(
  imageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  radius: number = 5,
  algorithm: 'telea' | 'ns' = 'telea',
  onProgress?: (msg: string) => void
): Promise<ImageData> {
  const cv = await loadOpenCV(onProgress);
  onProgress?.(`Applying OpenCV ${algorithm === 'telea' ? 'Telea' : 'Navier-Stokes'} inpainting...`);

  const width = imageCanvas.width;
  const height = imageCanvas.height;

  // 1. Read source image into cv.Mat
  const imgCtx = imageCanvas.getContext('2d', { willReadFrequently: true });
  if (!imgCtx) throw new Error('Could not get image canvas context');
  const imgData = imgCtx.getImageData(0, 0, width, height);

  const srcMat = cv.matFromImageData(imgData);

  // 2. Read mask into 8-bit single-channel cv.Mat
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) {
    srcMat.delete();
    throw new Error('Could not get mask canvas context');
  }
  const maskData = maskCtx.getImageData(0, 0, width, height);

  // Convert mask RGBA to single channel binary (0 or 255)
  const maskMat = new cv.Mat(height, width, cv.CV_8UC1);
  const maskPixels = maskData.data;
  const maskMatData = maskMat.data;

  let totalMaskedPixels = 0;
  for (let i = 0, j = 0; i < maskPixels.length; i += 4, j++) {
    // If alpha > 10 and (r > 10 or g > 10 or b > 10), it's marked
    const isMarked = maskPixels[i + 3] > 10 && (maskPixels[i] > 10 || maskPixels[i + 1] > 10 || maskPixels[i + 2] > 10);
    if (isMarked) {
      maskMatData[j] = 255;
      totalMaskedPixels++;
    } else {
      maskMatData[j] = 0;
    }
  }

  // If no pixels are masked, return copy of original
  if (totalMaskedPixels === 0) {
    srcMat.delete();
    maskMat.delete();
    return imgData;
  }

  // 3. OpenCV inpainting requires 3-channel (RGB) or 1-channel, so convert RGBA to RGB
  const srcRgb = new cv.Mat();
  cv.cvtColor(srcMat, srcRgb, cv.COLOR_RGBA2RGB);

  // 4. Inpaint output Mat
  const dstRgb = new cv.Mat();
  const inpaintFlag = algorithm === 'telea' ? cv.INPAINT_TELEA : cv.INPAINT_NS;

  cv.inpaint(srcRgb, maskMat, dstRgb, radius, inpaintFlag);

  // 5. Convert back to RGBA and retain original alpha channel where appropriate
  const dstRgba = new cv.Mat();
  cv.cvtColor(dstRgb, dstRgba, cv.COLOR_RGB2RGBA);

  // Create resulting ImageData
  const resultImgData = new ImageData(new Uint8ClampedArray(dstRgba.data), width, height);

  // Preserve original alpha values for transparent PNGs where not masked
  const origData = imgData.data;
  const resData = resultImgData.data;
  for (let i = 0, j = 0; i < origData.length; i += 4, j++) {
    if (maskMatData[j] === 0) {
      resData[i + 3] = origData[i + 3];
    } else {
      resData[i + 3] = 255;
    }
  }

  // Clean up native OpenCV memory
  srcMat.delete();
  maskMat.delete();
  srcRgb.delete();
  dstRgb.delete();
  dstRgba.delete();

  onProgress?.('Inpainting complete.');
  return resultImgData;
}
