import React from 'react';
import { ShieldCheck, Lock, HardDrive, Trash2, Database, WifiOff, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Zero Server Uploads &bull; 100% Client-Side
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Architecture
        </h1>
        <p className="text-sm text-slate-500">
          Last updated: November 2026 &bull; Developed by Damayanti Technologies
        </p>
      </div>

      {/* Main Guarantee Callout */}
      <div className="p-6 sm:p-8 rounded-3xl bg-emerald-900 text-white space-y-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-emerald-300">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Our Ironclad Privacy Commitment</h2>
        </div>
        <p className="text-sm text-emerald-100 leading-relaxed font-medium">
          "Your photos and videos are processed locally in your browser. We do not upload, transmit, or store your files on any remote server."
        </p>
        <p className="text-xs text-emerald-200/90 leading-relaxed">
          Unlike traditional online editors that require sending your private photos, personal videos, and intellectual property to remote cloud servers, WatermarkClear AI executes all computer vision algorithms, neural network inference, and video frame rendering strictly inside your computer's local RAM.
        </p>
      </div>

      {/* Privacy Architecture Checklist */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          How We Ensure Complete Privacy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <WifiOff className="w-4 h-4 text-emerald-600" />
              <span>Offline & Disconnected Capable</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once the web app loads into your browser, you can disconnect your internet connection entirely. The photo editor and video processor will continue to function seamlessly without network access.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>No Remote Databases or Analytics</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We do not use Supabase, Firebase, AWS S3, or any external database. We do not track, log, or fingerprint the images, filenames, or content you process.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Trash2 className="w-4 h-4 text-emerald-600" />
              <span>Immediate Memory Clean-Up</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Temporary canvas buffers and blob URLs are explicitly revoked (`URL.revokeObjectURL`) when you reset or close your tab, freeing your system memory and preventing leakage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>Local Model Execution</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI inference runs via WebGL and WebAssembly using ONNX Runtime Web. Neural network weights are stored in standard local browser cache (IndexedDB) on your machine.
            </p>
          </div>

        </div>
      </div>

      {/* Legal & Compliance Points */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4 text-xs text-slate-600 leading-relaxed">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          Data Handling Principles
        </h4>
        <ul className="space-y-2 list-disc list-inside">
          <li><strong>No Personal Identifiable Information (PII) Collected:</strong> We do not ask for your name, email, phone number, or payment details.</li>
          <li><strong>No Cookies for Tracking:</strong> We do not employ third-party advertising cookies, cross-site trackers, or behavioral profiling tools.</li>
          <li><strong>Your Copyright Remains Yours:</strong> Because your images and videos never touch our systems, Damayanti Technologies asserts zero rights, claims, or licenses over any material you process.</li>
          <li><strong>Responsible Use:</strong> You are responsible for ensuring that you have legal authorization to edit and remove watermarks from any media you import, in accordance with applicable copyright laws and terms of service.</li>
        </ul>
      </div>

      {/* Damayanti Technologies Signature */}
      <div className="p-4 rounded-xl bg-slate-100/80 text-center text-xs text-slate-500">
        Developed with privacy-by-design by <strong className="text-slate-800">Damayanti Technologies</strong>.
      </div>

    </div>
  );
};
