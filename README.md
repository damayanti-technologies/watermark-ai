# WatermarkClear AI — AI Watermark Remover Website
### Developed by Damayanti Technologies

A complete, production-grade, responsive AI-powered Watermark Remover website that enables users to remove watermarks from photos and videos directly inside their web browsers with 100% on-device privacy, zero server uploads, and native resolution preservation.

---

## 🌟 Key Features

1. **100% Privacy-First Local Processing**:
   - Zero file uploads. All computation executes locally inside the browser's WebAssembly sandbox.
   - Works offline once assets are cached. No telemetry, no cloud storage, and no backend database required.
2. **Native Resolution & Quality Preservation**:
   - Bit-exact preservation of untouched pixels.
   - Sub-patch context cropping and feathered seam alpha-blending ensures your 4K/8K photos and HD videos retain their sharpness without destructive downscaling.
3. **Four Complementary Inpainting Engines**:
   - **OpenCV.js Telea (Fast Marching Method)**: Rapid color and gradient propagation for timestamps, text, and logos (~50ms).
   - **OpenCV.js Navier-Stokes**: Fluid dynamics partial differential equations (PDEs) for smooth contour and continuous edge preservation.
   - **Context-Aware Texture Synthesis (Patch Inpainting)**: High-frequency texture synthesis for natural foliage, grass, sand, and architectural patterns.
   - **Deep Learning AI (ONNX Runtime Web)**: Large Mask Inpainting (LaMa) running via WebGL/WASM acceleration with Fast Fourier Convolutions.
4. **Studio-Grade Drawing & Selection Tools**:
   - Precision adjustable brush with live circular cursor outline.
   - Drag-to-select rectangle tool for timestamps and watermark banners.
   - Precision eraser to refine selection masks.
   - 20-step Undo / Redo history stack.
   - Pan (spacebar / middle-click / touch drag) and Zoom (10% to 500% with fit-to-screen).
5. **Interactive Before/After Comparison**:
   - Draggable split-slider comparison.
   - Side-by-side comparison mode.
   - "Hold for Original" peek toggle.
   - Fullscreen inspection mode.
6. **Video Watermark Remover Pipeline**:
   - Supports MP4, WebM, and MOV formats.
   - Timeline scrubber with frame-by-frame step controls (±1 frame navigation).
   - Static watermark removal and keyframed moving watermark interpolation.
   - Audio preservation with synchronization lock.
   - Frame inpainting preview before full video render.
7. **Production SaaS Design**:
   - Clean, light minimalist UI, subtle violet/indigo accents (`#4f46e5`), Inter typography, gentle shadows, and fluid animations.
   - Fully responsive across desktop, laptops, tablets, Android smartphones, and iPhones.

---

## 🏗️ Architecture & Technology Stack

```
ai-watermark-remover/
├── public/
│   ├── libs/
│   │   └── opencv.js          # Local OpenCV.js 4.x WebAssembly binary
│   ├── ffmpeg/
│   │   ├── ffmpeg-core.js     # FFmpeg.wasm core loader
│   │   └── ffmpeg-core.wasm   # FFmpeg.wasm core engine (32MB)
│   ├── ort/
│   │   └── *.wasm             # ONNX Runtime WebAssembly execution providers
│   ├── samples/               # High-resolution demo test images
│   ├── _redirects             # Netlify SPA routing fallback
│   └── 404.html               # GitHub Pages SPA redirect
├── src/
│   ├── components/
│   │   ├── Navbar/            # Responsive header with mobile menu
│   │   ├── Footer/            # Footer by Damayanti Technologies
│   │   ├── Upload/            # Drag-and-drop file dropzone with demo samples
│   │   ├── ImageEditor/       # Canvas engine, tools, and sidebar
│   │   └── BeforeAfter/       # Interactive split slider comparison
│   ├── pages/
│   │   ├── Home/              # Landing page, hero, 3-step workflow, FAQ
│   │   ├── PhotoRemover/      # Full-featured photo inpainting workspace
│   │   ├── VideoRemover/      # Video timeline inpainting workspace
│   │   ├── HowItWorks/        # Technical architecture documentation
│   │   ├── Privacy/           # Zero-data-collection policy
│   │   └── About/             # Damayanti Technologies brand story
│   ├── services/
│   │   ├── imageProcessing/   # OpenCV Telea, Navier-Stokes, Patch Synthesis
│   │   ├── aiInference/       # ONNX Runtime Web engine & IndexedDB cache
│   │   └── videoProcessing/   # Video frame extraction, keyframing & remuxing
│   ├── types/                 # TypeScript interfaces and type definitions
│   ├── App.tsx                # Code-split routing with React.lazy
│   └── main.tsx
├── netlify.toml               # Netlify configuration with COOP/COEP headers
└── vite.config.ts             # Vite build configuration with isolation headers
```

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js v18+ or v20+ / v22+
- npm v9+

### Commands

```bash
# 1. Clone or navigate to the directory
cd "C:\Users\Damayanti Crest\.gemini\antigravity\scratch\ai-watermark-remover"

# 2. Install dependencies (already installed)
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build locally
npm run preview
```

The production preview runs at: `http://localhost:4173/`

---

## 🌐 Free Static Deployment Guide

Because WatermarkClear AI is a pure client-side application with zero backend or database requirements, it can be hosted completely free on **Netlify** or **GitHub Pages**.

### Deploying to Netlify (Recommended)
1. Push this repository to GitHub or drag the `dist` folder into Netlify Drop.
2. Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. The included `netlify.toml` file automatically configures:
   - `Cross-Origin-Opener-Policy: same-origin` (required for multi-threaded WASM)
   - `Cross-Origin-Embedder-Policy: require-corp`
   - Single Page Application (SPA) redirect rewrite (`/* -> /index.html 200`)

### Deploying to GitHub Pages
1. Push the code to a GitHub repository.
2. Go to repository **Settings > Pages > Build and deployment > Source**, select **GitHub Actions**.
3. The included workflow `.github/workflows/deploy.yml` will automatically build and deploy the site upon push.

---

## 🛡️ Privacy Guarantee

> **"Your photos and videos are processed locally in your browser. We do not upload or store your files."**

- **Zero Cloud APIs**: No data is transmitted to third-party AI APIs (no OpenAI, no Replicate, no Google Cloud).
- **Zero Server Uploads**: No S3 buckets, no Supabase, no Firebase.
- **Immediate Memory Release**: Temporary canvas buffers and blob URLs are explicitly revoked when files are closed.

---

&copy; 2026 **Damayanti Technologies**. All rights reserved.
