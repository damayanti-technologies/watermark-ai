import React from 'react';
import { 
  Sparkles, 
  Video as VideoIcon, 
  Eye, 
  Workflow
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <Workflow className="w-3.5 h-3.5" /> Technical Architecture & Inpainting Science
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How WatermarkClear AI Works
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A deep dive into our client-side computer vision pipeline, neural network inference, 
          and video reconstruction engines.
        </p>
      </div>

      {/* 4 Inpainting Engines */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Four Complementary Inpainting Engines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Different watermarks require different mathematical approaches. We provide four distinct algorithms:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Method 1: Telea */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                cv.INPAINT_TELEA
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Ultra Fast (~50ms)
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Telea Inpainting (Fast Marching Method)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on Alexandru Telea’s seminal algorithm (2004). It starts from the boundary of the masked region and propagates color values inward along the image gradient normal using a weighted average of neighboring known pixels. Ideal for small stamps, thin timestamps, and text lines over smooth gradients.
            </p>
          </div>

          {/* Method 2: Navier-Stokes */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 text-xs font-bold font-mono">
                cv.INPAINT_NS
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Fluid PDE (~90ms)
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Navier-Stokes Partial Differential Equations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adapted from Bertalmio, Sapiro, Caselles, and Ballester (2001). Applies fluid dynamics equations to propagate isophotes (lines of constant brightness and color) into the missing area, maintaining continuous contour lines and edges across the erased watermark.
            </p>
          </div>

          {/* Method 3: Smart Context Patch */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-bold font-mono">
                PATCH_SYNTHESIS
              </span>
              <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                High-Frequency Textures
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Context-Aware Texture Synthesis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Samples high-frequency texture blocks from the surrounding image canvas and synthesizes them into the masked area using normalized cross-correlation and Poisson seam blending. Excellent for natural textures like grass, foliage, sand, and stone walls where gradient-only inpainting would produce blurred spots.
            </p>
          </div>

          {/* Method 4: ONNX AI Inpainting */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold font-mono">
                ONNX_LAMA_AI
              </span>
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Deep Neural Net
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Deep Learning AI (LaMa ONNX Runtime Web)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Large Mask Inpainting (LaMa) model running directly inside your browser via ONNX Runtime Web with WebGL and WebAssembly execution providers. Employs Fast Fourier Convolutions (FFCs) with global receptive fields to imagine and reconstruct complex photographic structures underneath large occlusions.
            </p>
          </div>

        </div>
      </section>

      {/* Sub-Region Context Cropping & Resolution Preservation */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            Resolution Guarantee
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            How We Preserve 100% Native Resolution
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Many online tools secretly downscale your 24-megapixel or 4K photo down to 1024x1024 or 512x512 before processing, destroying the sharpness of your entire photo. Here is our production pipeline:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="text-indigo-400 font-mono text-xs font-semibold">STAGE 1</div>
            <h4 className="text-sm font-semibold text-white">Bounding Box & Context Extraction</h4>
            <p className="text-xs text-slate-300">
              Only the bounding box surrounding the marked area (plus 50% contextual padding) is isolated for inpainting computation. The remaining 95%+ of your high-res image is untouched.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="text-indigo-400 font-mono text-xs font-semibold">STAGE 2</div>
            <h4 className="text-sm font-semibold text-white">Full-Precision Restoration</h4>
            <p className="text-xs text-slate-300">
              OpenCV Telea/NS operates directly at full pixel coordinate space. For AI models with fixed input sizes, the sub-patch is processed and re-projected back to exact crop dimensions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="text-indigo-400 font-mono text-xs font-semibold">STAGE 3</div>
            <h4 className="text-sm font-semibold text-white">Feathered Seam Alpha Blending</h4>
            <p className="text-xs text-slate-300">
              The inpainted region is composited back into your full-resolution master canvas using a Gaussian feather mask, leaving untouched pixels 100% bit-exact with zero compression loss.
            </p>
          </div>
        </div>
      </section>

      {/* Video Processing Architecture */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-indigo-600" />
            Video Watermark Processing Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Demuxing, frame-by-frame inpainting, and remuxing with audio synchronization using WebAssembly:
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">1. Video Demuxing & Frame Extraction</h4>
              <p className="text-xs text-slate-600">
                FFmpeg.wasm demuxes the input MP4/WebM video stream into discrete frame buffers while simultaneously isolating the source audio stream (AAC, Opus, or MP3).
              </p>
            </div>
            <span className="shrink-0 text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              FFmpeg.wasm
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">2. Keyframe Mask Interpolation</h4>
              <p className="text-xs text-slate-600">
                For stationary watermarks (e.g. channel logos), a persistent mask is cached across all frames. For moving watermarks, the user specifies keyframes, and linear coordinates [x, y, w, h] are interpolated smoothly per timestamp.
              </p>
            </div>
            <span className="shrink-0 text-xs font-mono font-medium px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
              Keyframe Engine
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">3. Frame-by-Frame Inpainting</h4>
              <p className="text-xs text-slate-600">
                Each frame's designated mask area is processed through the inpainting pipeline in non-blocking Web Worker threads, displaying real-time frame progress percentage and ETA.
              </p>
            </div>
            <span className="shrink-0 text-xs font-mono font-medium px-2.5 py-1 rounded bg-emerald-50 text-emerald-700">
              Web Worker Pools
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">4. Video Re-encoding & Audio Preservation</h4>
              <p className="text-xs text-slate-600">
                The restored frame sequence is re-encoded using H.264 / VP8/9 at the exact source framerate, and the original audio track is multiplexed back into the container with sample-accurate A/V synchronization.
              </p>
            </div>
            <span className="shrink-0 text-xs font-mono font-medium px-2.5 py-1 rounded bg-violet-50 text-violet-700">
              Audio Remuxing
            </span>
          </div>
        </div>
      </section>

      {/* Honest Technical Limitation Note */}
      <section className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-2">
        <h3 className="text-sm font-bold flex items-center gap-2 text-amber-950">
          <Eye className="w-4 h-4 text-amber-700" />
          Technical Transparency: What Inpainting Can and Cannot Do
        </h3>
        <p className="text-xs leading-relaxed text-amber-800">
          Inpainting algorithms (both mathematical and deep-learning based) synthesize plausible, natural-looking imagery to replace the masked area based on surrounding pixels, textures, edges, and learned patterns. However, once information is occluded by a 100% opaque watermark, the original hidden pixels no longer exist in the file. No technology can miraculously reveal private data that was never recorded.
        </p>
      </section>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/photo"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-colors shadow-indigo-600/20"
        >
          <span>Try WatermarkClear AI Now</span>
          <Sparkles className="w-4 h-4 text-indigo-200" />
        </Link>
      </div>

    </div>
  );
};
