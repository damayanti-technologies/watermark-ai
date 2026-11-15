/**
 * High-performance Context-Aware Patch / Texture Inpainting Engine
 * Pure TypeScript implementation for fast client-side execution with zero external library dependencies.
 */

export function runPatchInpaint(
  imageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  onProgress?: (msg: string) => void
): ImageData {
  const width = imageCanvas.width;
  const height = imageCanvas.height;

  const imgCtx = imageCanvas.getContext('2d', { willReadFrequently: true });
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!imgCtx || !maskCtx) throw new Error('Could not get canvas 2D contexts');

  const srcImgData = imgCtx.getImageData(0, 0, width, height);
  const maskImgData = maskCtx.getImageData(0, 0, width, height);

  const src = srcImgData.data;
  const mask = maskImgData.data;

  // Create an output buffer cloned from source
  const outData = new Uint8ClampedArray(src);

  // 1. Find bounding box of masked region
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let hasMaskedPixels = false;

  const isMasked = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x);
      const px = idx * 4;
      if (mask[px + 3] > 10 && (mask[px] > 10 || mask[px + 1] > 10 || mask[px + 2] > 10)) {
        isMasked[idx] = 1;
        hasMaskedPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasMaskedPixels) {
    return srcImgData;
  }

  onProgress?.('Synthesizing context texture patches...');

  // Add search padding around bounding box
  const pad = 40;
  const searchMinX = Math.max(0, minX - pad);
  const searchMaxX = Math.min(width - 1, maxX + pad);
  const searchMinY = Math.max(0, minY - pad);
  const searchMaxY = Math.min(height - 1, maxY + pad);

  // Patch matching configuration
  const patchRadius = 4;

  // Multi-pass onion-peel inpainting from outer boundary inward
  let remainingMasked = 0;
  for (let i = 0; i < isMasked.length; i++) {
    if (isMasked[i] === 1) remainingMasked++;
  }

  const maxPasses = 30;
  let pass = 0;

  while (remainingMasked > 0 && pass < maxPasses) {
    pass++;
    const boundaryPixels: { x: number; y: number; idx: number }[] = [];

    // Find boundary pixels (masked pixels having at least one unmasked 4-neighbor)
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const idx = y * width + x;
        if (isMasked[idx] === 1) {
          const hasUnmaskedNeighbor =
            (x > 0 && isMasked[idx - 1] === 0) ||
            (x < width - 1 && isMasked[idx + 1] === 0) ||
            (y > 0 && isMasked[idx - width] === 0) ||
            (y < height - 1 && isMasked[idx + width] === 0);

          if (hasUnmaskedNeighbor) {
            boundaryPixels.push({ x, y, idx });
          }
        }
      }
    }

    if (boundaryPixels.length === 0) break;

    // Inpaint each boundary pixel by searching closest matching texture patch in the valid surrounding area
    for (const { x, y, idx } of boundaryPixels) {
      let bestSSD = Infinity;
      let bestR = 0, bestG = 0, bestB = 0;
      let bestWeight = 0;

      // Sample candidate source positions in local contextual window
      const step = 2;
      for (let sy = searchMinY + patchRadius; sy <= searchMaxY - patchRadius; sy += step) {
        for (let sx = searchMinX + patchRadius; sx <= searchMaxX - patchRadius; sx += step) {
          const sIdx = sy * width + sx;
          if (isMasked[sIdx] === 1) continue; // Skip candidate if it is also masked

          // Calculate patch similarity SSD on known pixels
          let ssd = 0;
          let count = 0;

          for (let dy = -patchRadius; dy <= patchRadius; dy++) {
            for (let dx = -patchRadius; dx <= patchRadius; dx++) {
              const tx = x + dx;
              const ty = y + dy;
              const cx = sx + dx;
              const cy = sy + dy;

              if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;
              if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;

              const tIdx = ty * width + tx;
              const cIdx = cy * width + cx;

              if (isMasked[tIdx] === 0 && isMasked[cIdx] === 0) {
                const tPx = tIdx * 4;
                const cPx = cIdx * 4;
                const dr = outData[tPx] - outData[cPx];
                const dg = outData[tPx + 1] - outData[cPx + 1];
                const db = outData[tPx + 2] - outData[cPx + 2];
                ssd += dr * dr + dg * dg + db * db;
                count++;
              }
            }
          }

          if (count > 0) {
            const normalizedSSD = ssd / count;
            // Prefer candidates closer to target
            const dist = Math.hypot(sx - x, sy - y) * 0.2;
            const score = normalizedSSD + dist;

            if (score < bestSSD) {
              bestSSD = score;
              const cPx = sIdx * 4;
              bestR = outData[cPx];
              bestG = outData[cPx + 1];
              bestB = outData[cPx + 2];
              bestWeight = 1;
            }
          }
        }
      }

      // If a valid patch match was found, fill pixel
      const px = idx * 4;
      if (bestWeight > 0) {
        outData[px] = bestR;
        outData[px + 1] = bestG;
        outData[px + 2] = bestB;
        outData[px + 3] = 255;
      } else {
        // Fallback: smooth local average
        let avgR = 0, avgG = 0, avgB = 0, avgCount = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (isMasked[nIdx] === 0) {
                const nPx = nIdx * 4;
                avgR += outData[nPx];
                avgG += outData[nPx + 1];
                avgB += outData[nPx + 2];
                avgCount++;
              }
            }
          }
        }
        if (avgCount > 0) {
          outData[px] = Math.round(avgR / avgCount);
          outData[px + 1] = Math.round(avgG / avgCount);
          outData[px + 2] = Math.round(avgB / avgCount);
          outData[px + 3] = 255;
        }
      }

      // Mark pixel as filled in this pass
      isMasked[idx] = 0;
      remainingMasked--;
    }
  }

  onProgress?.('Texture synthesis complete.');
  return new ImageData(outData, width, height);
}
