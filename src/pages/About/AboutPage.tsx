import React from 'react';
import { Sparkles, Code2, ShieldCheck, Cpu, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Innovation & Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Damayanti Technologies
        </h1>
        <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
          Pioneering edge AI and browser-native computational intelligence that puts privacy, quality, and user freedom first.
        </p>
      </div>

      {/* Mission Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Our Vision: Professional AI Without the Cloud Compromise
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          For years, modern AI tools have forced users to make an unacceptable trade-off: in exchange for intelligent photo and video editing, users had to upload their private files, family photos, and proprietary creative assets to remote corporate clouds and pay recurring subscription fees.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          At <strong>Damayanti Technologies</strong>, we believe the browser is an operating system in its own right. With modern WebAssembly (WASM), WebGL, WebGPU, and multi-threaded Web Workers, today’s computers and mobile phones have sufficient processing power to execute sophisticated computer vision models and neural networks locally.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>WatermarkClear AI</strong> is the embodiment of this philosophy: a studio-grade, responsive photo and video restoration workstation that runs 100% on your device, with zero subscriptions and complete privacy.
        </p>
      </div>

      {/* Engineering Principles */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Our Core Engineering Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Knowledge Privacy</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an application does not strictly require a backend server to function, it should not have one. All image buffers and video streams stay confined to your browser's local sandbox.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Edge AI Acceleration</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We leverage browser hardware acceleration via ONNX Runtime Web (WASM and WebGL) to deliver deep learning inference without expensive cloud GPU clusters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Code2 className="w-4 h-4" />
              <span>Open Standards & Free Access</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built on battle-tested open-source libraries: OpenCV.js, FFmpeg.wasm, and standard HTML5 Canvas APIs, ensuring longevity and trust.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>Bit-Exact Quality Preservation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We reject arbitrary downscaling. Every pipeline we design preserves the original image dimensions, aspect ratios, and color accuracy down to individual pixels.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Callout */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <h4 className="text-sm font-bold text-slate-800">
          The Damayanti Technologies Stack
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-700">React 19 & TypeScript</span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-700">OpenCV.js 4.x (WASM)</span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-700">ONNX Runtime Web</span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-700">FFmpeg.wasm Core</span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-700">Web Workers & SharedBuffers</span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-700">Tailwind CSS</span>
        </div>
      </div>

      {/* Developed By Notice */}
      <div className="text-center pt-4">
        <p className="text-sm font-semibold text-slate-800">
          Developed with care by <span className="text-indigo-600 font-bold">Damayanti Technologies</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Empowering creators, photographers, and developers worldwide.
        </p>
      </div>

    </div>
  );
};
