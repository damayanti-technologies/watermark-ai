import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  ShieldCheck, 
  Zap, 
  Lock, 
  ArrowRight,
  CheckCircle,
  Sliders,
  Scale
} from 'lucide-react';
import { FileDropzone } from '../../components/Upload/FileDropzone';
import { BeforeAfterSlider } from '../../components/BeforeAfter/BeforeAfterSlider';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleFileSelect = (file: File) => {
    // Determine image or video
    if (file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name)) {
      navigate('/video', { state: { uploadedFile: file } });
    } else {
      navigate('/photo', { state: { uploadedFile: file } });
    }
  };

  const handleSampleSelect = async (sampleUrl: string, sampleName: string) => {
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], sampleName.endsWith('.png') ? sampleName : `${sampleName}.png`, { type: blob.type || 'image/png' });
      navigate('/photo', { state: { uploadedFile: file } });
    } catch {
      navigate('/photo');
    }
  };

  const faqs = [
    {
      q: "Are my photos or videos uploaded to any server?",
      a: "No. Never. WatermarkClear AI runs entirely inside your browser using WebAssembly (WASM), OpenCV.js, and ONNX Runtime Web. Your image and video bytes never leave your device's memory."
    },
    {
      q: "Does watermark removal reduce the original resolution?",
      a: "No. Preserving your exact original resolution is our highest priority. The editor works directly at 100% native resolution. Untouched background pixels remain completely bit-exact, and the inpainting mask is blended seamlessly into the full-resolution master canvas."
    },
    {
      q: "How does the inpainting algorithm work?",
      a: "We offer multiple specialized engines: Fast OpenCV Telea (fast marching method), Navier-Stokes (fluid dynamics PDE inpainting), Context Patch Synthesis (texture pattern matching), and Deep Learning ONNX AI inpainting (LaMa architecture) running directly via browser WebGL/WASM."
    },
    {
      q: "Can I remove watermarks from moving videos?",
      a: "Yes. Our video editor features frame extraction via FFmpeg.wasm, interactive timeline scrubbing, static watermark removal, and keyframed region tracking for moving watermarks, preserving original audio tracks."
    },
    {
      q: "Do I need to create an account or pay a subscription?",
      a: "No account, no sign-up, and no subscription fees. It is completely free, client-side software engineered by Damayanti Technologies."
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-200/40 via-violet-100/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Privacy Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Local Processing — Your Files Never Leave Your Device</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Remove Watermarks. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              Restore Your Visuals.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Remove unwanted marks from your photos and videos with intelligent browser-based processing. 
            Native resolution preservation, zero subscriptions, zero server uploads.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/photo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <ImageIcon className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
              <span>Remove Photo Watermark</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/video"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm shadow-xs hover:border-slate-400 transition-all flex items-center justify-center gap-2 group"
            >
              <VideoIcon className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
              <span>Remove Video Watermark</span>
            </Link>
          </div>

          {/* Quick Dropzone Widget */}
          <div className="pt-8 max-w-2xl mx-auto">
            <FileDropzone
              accept="both"
              onFileSelect={handleFileSelect}
              onSampleSelect={handleSampleSelect}
              title="Drag and drop any photo or video to begin"
              subtitle="Supports JPG, PNG, WebP, MP4, WebM. Instant client-side inspection."
            />
          </div>
        </div>
      </section>

      {/* Interactive Before & After Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5" /> Interactive Demonstration
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            See the Quality with Your Own Eyes
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Drag the slider divider left and right to inspect the inpainting quality. 
            Background gradients, mountain textures, and lake reflections are reconstructed seamlessly.
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <BeforeAfterSlider
            originalSrc="/samples/photo-watermark-1.png"
            processedSrc="/samples/photo-watermark-1-clean.png"
            originalLabel="Watermarked Original (Corner Badge & Diagonal Stamp)"
            processedLabel="Inpainted & Restored (Seamless Fill)"
          />
        </div>
      </section>

      {/* Core Pillars / Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered for Precision, Speed, and Privacy
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Built with modern web standards and client-side computational vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              AI & Mathematical Inpainting
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Combines OpenCV.js Telea & Navier-Stokes differential algorithms with deep ONNX neural networks to intelligently synthesize surrounding texture, color, and geometric structure.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Native Resolution Preservation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never downscale your entire image. Our engine operates with sub-patch bounding-box inference and blends the restored region directly back into the full-resolution master canvas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              100% Private Local Processing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All computation executes inside your browser sandbox via WebAssembly and Web Workers. No files are uploaded to any server. Your media remains strictly on your device.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <VideoIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Full Video Frame Pipeline
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extract, inpaint, and rebuild video frames with FFmpeg.wasm. Supports static channel logos, timestamps, and keyframed moving watermarks while preserving original audio.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Non-Blocking Web Workers
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Heavy image and frame processing runs in separate background threads, keeping the editor interface fluid, responsive, and stutter-free at 60 FPS.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No Sign-Up or Credit Card
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct utility access without mandatory registration, credit card requirements, watermarked exports, or arbitrary daily limits.
            </p>
          </div>

        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Restore photos and video clips in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative text-center space-y-3 p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm shadow-indigo-600/30">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Upload Your File</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drag and drop any JPG, PNG, WebP image or MP4/WebM video. Your file opens instantly in the browser without uploading.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative text-center space-y-3 p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm shadow-indigo-600/30">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Select the Watermark</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use the precision brush or rectangle selection tool to highlight the watermark, logo, date stamp, or unwanted text.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative text-center space-y-3 p-6 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-sm shadow-indigo-600/30">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Preview & Download</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Preview before and after with the interactive split-slider, then export in original full resolution (lossless PNG, high-res JPEG, or WebP).
            </p>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Answers to common questions about privacy, models, and quality.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-colors"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-indigo-600' : ''}`}>
                  &darr;
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to restore your photos and videos?
            </h2>
            <p className="text-sm text-indigo-200 max-w-lg mx-auto">
              Start cleaning up watermarks right now. No setup, no waiting, 100% on your device.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/photo"
                className="px-6 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-indigo-700" />
                <span>Open Photo Remover</span>
              </Link>
              <Link
                to="/video"
                className="px-6 py-3 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-white border border-indigo-600/60 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <VideoIcon className="w-4 h-4 text-indigo-300" />
                <span>Open Video Remover</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
