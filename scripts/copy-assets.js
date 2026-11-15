import fs from 'fs';
import path from 'path';

const root = process.cwd();

function copyIfSrcExists(src, dest) {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied ${path.basename(src)} -> ${dest}`);
  }
}

// 1. Copy OpenCV
const cvSrc = path.join(root, 'node_modules', '@techstark', 'opencv-js', 'dist', 'opencv.js');
const cvDest = path.join(root, 'public', 'libs', 'opencv.js');
copyIfSrcExists(cvSrc, cvDest);

// 2. Copy FFmpeg core
const ffmpegJsSrc = path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.js');
const ffmpegJsDest = path.join(root, 'public', 'ffmpeg', 'ffmpeg-core.js');
copyIfSrcExists(ffmpegJsSrc, ffmpegJsDest);

const ffmpegWasmSrc = path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.wasm');
const ffmpegWasmDest = path.join(root, 'public', 'ffmpeg', 'ffmpeg-core.wasm');
copyIfSrcExists(ffmpegWasmSrc, ffmpegWasmDest);
