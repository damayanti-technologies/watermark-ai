import React from 'react';
import { 
  Sparkles, 
  Download, 
  Cpu, 
  RefreshCw,
  Scale
} from 'lucide-react';
import type { InpaintAlgorithm, ExportFormat, ImageMetadata } from '../../types';

interface EditorSidebarProps {
  algorithm: InpaintAlgorithm;
  onAlgorithmChange: (algo: InpaintAlgorithm) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  inpaintRadius: number;
  onInpaintRadiusChange: (radius: number) => void;
  exportFormat: ExportFormat;
  onExportFormatChange: (fmt: ExportFormat) => void;
  exportQuality: number;
  onExportQualityChange: (quality: number) => void;
  isProcessing: boolean;
  processingProgress: { stage: string; percent: number };
  onProcess: () => void;
  onDownload: () => void;
  hasProcessedResult: boolean;
  hasMask: boolean;
  metadata: ImageMetadata | null;
  executionTimeMs?: number;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  algorithm,
  onAlgorithmChange,
  brushSize,
  onBrushSizeChange,
  inpaintRadius,
  onInpaintRadiusChange,
  exportFormat,
  onExportFormatChange,
  exportQuality,
  onExportQualityChange,
  isProcessing,
  processingProgress,
  onProcess,
  onDownload,
  hasProcessedResult,
  hasMask,
  metadata,
  executionTimeMs,
}) => {
  return (
    <div className="w-full lg:w-80 flex flex-col gap-5 p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs text-slate-800">
      
      {/* Primary Action Button */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onProcess}
          disabled={isProcessing || !hasMask}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
            isProcessing
              ? 'bg-indigo-400 text-white cursor-wait'
              : !hasMask
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 active:scale-[0.99]'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{hasProcessedResult ? 'Re-Inpaint Selection' : 'Remove Watermark'}</span>
            </>
          )}
        </button>

        {/* Live Progress Bar when processing */}
        {isProcessing && (
          <div className="space-y-1.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-medium text-indigo-900">
              <span className="truncate">{processingProgress.stage || 'Processing image...'}</span>
              <span className="font-mono">{processingProgress.percent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-indigo-200/60 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {!hasMask && !isProcessing && (
          <p className="text-[11px] text-slate-400 text-center">
            Paint or drag a rectangle over the watermark to enable removal.
          </p>
        )}
      </div>

      {/* Inpainting Algorithm Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            Inpainting Engine
          </span>
          {algorithm === 'onnx_ai' ? (
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-semibold">
              Deep Neural Net
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-semibold">
              WASM Verified
            </span>
          )}
        </label>

        <div className="space-y-1.5">
          {/* Mode 1: OpenCV Telea */}
          <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
            algorithm === 'telea' ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="algorithm"
              value="telea"
              checked={algorithm === 'telea'}
              onChange={() => onAlgorithmChange('telea')}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">OpenCV Telea (Quick)</span>
                <span className="text-[10px] text-indigo-600 font-medium">Recommended</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Fast Marching Method. Ideal for timestamps, logos, and discrete marks.
              </p>
            </div>
          </label>

          {/* Mode 2: OpenCV Navier-Stokes */}
          <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
            algorithm === 'ns' ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="algorithm"
              value="ns"
              checked={algorithm === 'ns'}
              onChange={() => onAlgorithmChange('ns')}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">OpenCV Navier-Stokes</span>
              <p className="text-[11px] text-slate-500 leading-tight">
                Fluid dynamics PDEs. Preserves continuous lines and soft gradients.
              </p>
            </div>
          </label>

          {/* Mode 3: Context Patch Synthesis */}
          <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
            algorithm === 'patch' ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="algorithm"
              value="patch"
              checked={algorithm === 'patch'}
              onChange={() => onAlgorithmChange('patch')}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">Context Texture Synthesis</span>
              <p className="text-[11px] text-slate-500 leading-tight">
                Texture matching for complex patterns, grass, foliage, and textures.
              </p>
            </div>
          </label>

          {/* Mode 4: ONNX AI Inpainting */}
          <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
            algorithm === 'onnx_ai' ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="algorithm"
              value="onnx_ai"
              checked={algorithm === 'onnx_ai'}
              onChange={() => onAlgorithmChange('onnx_ai')}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900">ONNX AI Inpainting (LaMa)</span>
              <p className="text-[11px] text-slate-500 leading-tight">
                Deep neural net with Fast Fourier Convolutions for large watermarks.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Brush Size Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Brush Size</span>
          <span className="font-mono text-indigo-600 font-semibold">{brushSize}px</span>
        </div>
        <input
          type="range"
          min="4"
          max="120"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />
      </div>

      {/* Inpaint Radius Slider (for OpenCV) */}
      {(algorithm === 'telea' || algorithm === 'ns') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Inpainting Radius</span>
            <span className="font-mono text-indigo-600 font-semibold">{inpaintRadius}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={inpaintRadius}
            onChange={(e) => onInpaintRadiusChange(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>
      )}

      {/* Quality Information & Preservation Panel */}
      {metadata && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              Quality Preservation
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
              Bit-Exact Native
            </span>
          </h4>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-white p-2 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">Original Dimensions</span>
              <span className="font-semibold font-mono text-slate-800">{metadata.width} &times; {metadata.height}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">Export Dimensions</span>
              <span className="font-semibold font-mono text-emerald-600">{metadata.width} &times; {metadata.height}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">Source Size</span>
              <span className="font-semibold font-mono text-slate-800">{(metadata.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 block text-[10px]">Original Format</span>
              <span className="font-semibold uppercase text-slate-800">{metadata.type.split('/')[1] || 'Image'}</span>
            </div>
          </div>

          {executionTimeMs !== undefined && executionTimeMs > 0 && (
            <p className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
              <span>Restored in:</span>
              <span className="font-mono font-medium text-slate-700">{executionTimeMs} ms</span>
            </p>
          )}
        </div>
      )}

      {/* Export Settings & Download */}
      {hasProcessedResult && (
        <div className="space-y-3 pt-2 border-t border-slate-200/80">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Export Options
          </label>

          <div className="grid grid-cols-3 gap-1.5">
            {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onExportFormatChange(fmt)}
                className={`py-1.5 text-xs font-semibold rounded-lg uppercase border transition-all ${
                  exportFormat === fmt
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {fmt === 'png' ? 'PNG (Lossless)' : fmt}
              </button>
            ))}
          </div>

          {exportFormat !== 'png' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Export Quality</span>
                <span className="font-mono text-indigo-600 font-semibold">{Math.round(exportQuality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="1.00"
                step="0.05"
                value={exportQuality}
                onChange={(e) => onExportQualityChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>
          )}

          <button
            type="button"
            onClick={onDownload}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Download Restored Image</span>
          </button>
        </div>
      )}

    </div>
  );
};
