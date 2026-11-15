import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lock, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Watermark<span className="text-indigo-600">Clear</span> AI
              </span>
            </div>
            
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Professional, privacy-first watermark removal directly inside your browser. 
              Powered by client-side WebAssembly, OpenCV.js, and ONNX Runtime AI.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 max-w-md">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-normal">
                  <strong className="text-slate-800 font-semibold">100% Client-Side Privacy:</strong> Your photos and videos are processed locally in your browser. We never upload, inspect, or store your files on any external server.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Tools & Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/photo" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Photo Watermark Remover
                </Link>
              </li>
              <li>
                <Link to="/video" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Video Watermark Remover
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  Privacy Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Company */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Engineering & Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                OpenCV.js (Telea & Navier-Stokes)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                ONNX Runtime Web (WASM & WebGL)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                FFmpeg.wasm (Frame Engine)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                Hardware-accelerated HTML5 Canvas
              </li>
              <li className="pt-2">
                <Link to="/about" className="text-indigo-600 font-medium hover:underline text-xs">
                  About Damayanti Technologies &rarr;
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} WatermarkClear AI. <span className="font-semibold text-slate-700">Developed by Damayanti Technologies.</span> All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <Link to="/how-it-works" className="hover:text-slate-800 transition-colors">Documentation</Link>
            <Link to="/about" className="hover:text-slate-800 transition-colors">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
