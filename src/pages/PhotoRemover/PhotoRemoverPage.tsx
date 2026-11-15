import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  AlertCircle
} from 'lucide-react';
import type { ToolMode, InpaintAlgorithm, ExportFormat, ImageMetadata } from '../../types';
import { FileDropzone } from '../../components/Upload/FileDropzone';
import { ImageCanvas } from '../../components/ImageEditor/ImageCanvas';
import { EditorToolbar } from '../../components/ImageEditor/EditorToolbar';
import { EditorSidebar } from '../../components/ImageEditor/EditorSidebar';
import { BeforeAfterSlider } from '../../components/BeforeAfter/BeforeAfterSlider';
import { processImageInpaint, exportCanvasToBlob, downloadFile } from '../../services/imageProcessing/imageService';

export const PhotoRemoverPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Image & Metadata
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  // Editor Tools & Viewport
  const [toolMode, setToolMode] = useState<ToolMode>('brush');
  const [brushSize, setBrushSize] = useState<number>(32);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inpainting Algorithm Settings
  const [algorithm, setAlgorithm] = useState<InpaintAlgorithm>('telea');
  const [inpaintRadius, setInpaintRadius] = useState<number>(5);

  // Export Settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState<number>(0.95);

  // Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<{ stage: string; percent: number }>({ stage: '', percent: 0 });
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>(undefined);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Undo / Redo History Stack for Mask
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Canvas References
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle uploaded file from route state or dropzone
  const handleFileSelect = useCallback((file: File) => {
    setErrorMessage(null);
    setProcessedImageUrl(null);
    setHistory([]);
    setHistoryIndex(-1);
    setHasMask(false);
    setPan({ x: 0, y: 0 });

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageMetadata({
        file,
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type || 'image/png',
        url,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
      setOriginalImageUrl(url);

      // Auto-fit initial zoom level
      const viewportW = Math.min(window.innerWidth - 380, 900);
      const viewportH = Math.min(window.innerHeight - 250, 600);
      const scaleX = viewportW / img.naturalWidth;
      const scaleY = viewportH / img.naturalHeight;
      const fitZoom = Math.min(1, Math.min(scaleX, scaleY));
      setZoom(Math.max(0.2, fitZoom));
    };
    img.onerror = () => {
      setErrorMessage('Failed to decode image file. Please ensure it is a valid JPG, PNG, or WebP.');
    };
    img.src = url;
  }, []);

  // Check if a file was passed via React Router navigation state
  useEffect(() => {
    if (location.state && (location.state as any).uploadedFile) {
      handleFileSelect((location.state as any).uploadedFile);
    }
  }, [location.state, handleFileSelect]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    };
  }, [originalImageUrl, processedImageUrl]);

  // Save mask history snapshot before new stroke
  const handlePushHistory = useCallback(() => {
    if (!maskCanvasRef.current || !imageMetadata) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const snap = ctx.getImageData(0, 0, imageMetadata.width, imageMetadata.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snap);
    if (newHistory.length > 20) newHistory.shift();

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, imageMetadata]);

  // Check whether any pixels in mask are active
  const checkMaskActive = useCallback(() => {
    if (!maskCanvasRef.current || !imageMetadata) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, imageMetadata.width, imageMetadata.height);
    const d = imgData.data;
    let active = false;
    for (let i = 0; i < d.length; i += 16) {
      if (d[i + 3] > 10) {
        active = true;
        break;
      }
    }
    setHasMask(active);
  }, [imageMetadata]);

  // Undo Action
  const handleUndo = () => {
    if (historyIndex < 0 || !maskCanvasRef.current || !imageMetadata) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;

    if (historyIndex === 0) {
      ctx.clearRect(0, 0, imageMetadata.width, imageMetadata.height);
      setHistoryIndex(-1);
    } else {
      const prev = history[historyIndex - 1];
      ctx.putImageData(prev, 0, 0);
      setHistoryIndex(historyIndex - 1);
    }
    checkMaskActive();
  };

  // Redo Action
  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const next = history[historyIndex + 1];
    ctx.putImageData(next, 0, 0);
    setHistoryIndex(historyIndex + 1);
    checkMaskActive();
  };

  // Reset Mask
  const handleResetMask = () => {
    if (!maskCanvasRef.current || !imageMetadata) return;
    handlePushHistory();
    const ctx = maskCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, imageMetadata.width, imageMetadata.height);
    }
    setHasMask(false);
  };

  // Fit to screen
  const handleFitScreen = () => {
    if (!imageMetadata) return;
    const viewportW = Math.min(window.innerWidth - 380, 900);
    const viewportH = Math.min(window.innerHeight - 250, 600);
    const fitZoom = Math.min(1, Math.min(viewportW / imageMetadata.width, viewportH / imageMetadata.height));
    setZoom(Math.max(0.1, fitZoom));
    setPan({ x: 0, y: 0 });
  };

  // Process Watermark Removal
  const handleProcessInpaint = async () => {
    if (!sourceCanvasRef.current || !maskCanvasRef.current || !imageMetadata) return;
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingProgress({ stage: 'Starting inpainting engine...', percent: 5 });

    try {
      const result = await processImageInpaint(
        sourceCanvasRef.current,
        maskCanvasRef.current,
        {
          algorithm,
          radius: inpaintRadius,
          onProgress: (stage, percent) => {
            setProcessingProgress({ stage, percent });
          },
        }
      );

      // Render restored ImageData onto the sourceCanvas
      const sourceCtx = sourceCanvasRef.current.getContext('2d')!;
      sourceCtx.putImageData(result.resultImageData, 0, 0);

      // Convert result to ObjectURL for Before/After comparison
      const blob = await exportCanvasToBlob(sourceCanvasRef.current, 'png');
      const restoredUrl = URL.createObjectURL(blob);
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
      setProcessedImageUrl(restoredUrl);

      // Clear mask so user can make another selection if needed
      const maskCtx = maskCanvasRef.current.getContext('2d')!;
      maskCtx.clearRect(0, 0, imageMetadata.width, imageMetadata.height);
      setHasMask(false);
      setExecutionTimeMs(result.executionTimeMs);
    } catch (err: any) {
      console.error('Inpainting error:', err);
      setErrorMessage(err?.message || 'Inpainting failed. Please try a different algorithm or refine selection.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Restored Image
  const handleDownload = async () => {
    if (!sourceCanvasRef.current || !imageMetadata) return;
    try {
      const blob = await exportCanvasToBlob(sourceCanvasRef.current, exportFormat, exportQuality);
      const baseName = imageMetadata.name.substring(0, imageMetadata.name.lastIndexOf('.')) || imageMetadata.name;
      const downloadName = `${baseName}-restored.${exportFormat}`;
      downloadFile(blob, downloadName);
    } catch (err: any) {
      setErrorMessage('Export failed: ' + (err?.message || err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Photo Watermark Remover</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                100% In-Browser
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Paint over unwanted watermarks, logos, or timestamps to erase them in native resolution.
            </p>
          </div>
        </div>

        {/* Change Image / Reset button */}
        {imageMetadata && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setImageMetadata(null);
                setOriginalImageUrl(null);
                setProcessedImageUrl(null);
                setHistory([]);
                setHistoryIndex(-1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Open Different Image</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      {!imageMetadata ? (
        /* Empty State: File Upload */
        <div className="max-w-3xl mx-auto py-12 space-y-8">
          <FileDropzone
            accept="image"
            onFileSelect={handleFileSelect}
            onSampleSelect={(url, name) => {
              fetch(url)
                .then((r) => r.blob())
                .then((b) => handleFileSelect(new File([b], name, { type: 'image/png' })));
            }}
            title="Upload your photo to remove watermarks"
            subtitle="JPG, PNG, WebP up to full camera resolution. 100% private."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="font-semibold text-slate-800 block">Preserves 100% Resolution</span>
              <p>Untouched background pixels remain bit-exact. No forced resizing or compression.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="font-semibold text-slate-800 block">4 Inpainting Engines</span>
              <p>OpenCV Telea, Navier-Stokes, Smart Texture Patch, and ONNX Deep Learning AI.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="font-semibold text-slate-800 block">Zero Server Uploads</span>
              <p>Everything executes inside your local browser memory via WebAssembly.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Editor Layout */
        <div className="space-y-4">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 font-bold px-2"
              >
                &times;
              </button>
            </div>
          )}

          {/* Main Grid: Left Toolbar & Center Canvas & Right Sidebar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            
            {/* Center Area (Toolbar + Canvas / Comparison) */}
            <div className="flex-1 w-full space-y-3">
              <EditorToolbar
                toolMode={toolMode}
                onSelectTool={setToolMode}
                canUndo={historyIndex >= 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onResetMask={handleResetMask}
                zoom={zoom}
                onZoomIn={() => setZoom((z) => Math.min(5, z + 0.15))}
                onZoomOut={() => setZoom((z) => Math.max(0.1, z - 0.15))}
                onZoomReset={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                onFitScreen={handleFitScreen}
                showComparison={showComparison}
                onToggleComparison={() => setShowComparison(!showComparison)}
                hasProcessedResult={!!processedImageUrl}
              />

              {/* Viewport: Interactive Canvas OR Before/After Slider */}
              <div className="relative w-full h-[65vh] min-h-[460px] max-h-[750px] bg-slate-900/5 rounded-3xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center p-2">
                {showComparison && processedImageUrl && originalImageUrl ? (
                  <div className="w-full h-full p-4 flex flex-col justify-center">
                    <BeforeAfterSlider
                      originalSrc={originalImageUrl}
                      processedSrc={processedImageUrl}
                      originalLabel="Original with Watermark"
                      processedLabel="Restored with WatermarkClear"
                    />
                  </div>
                ) : (
                  <ImageCanvas
                    imageSrc={originalImageUrl || ''}
                    imageWidth={imageMetadata.width}
                    imageHeight={imageMetadata.height}
                    toolMode={toolMode}
                    brushSize={brushSize}
                    zoom={zoom}
                    pan={pan}
                    onPanChange={setPan}
                    sourceCanvasRef={sourceCanvasRef}
                    maskCanvasRef={maskCanvasRef}
                    onMaskChange={checkMaskActive}
                    onPushHistory={handlePushHistory}
                  />
                )}
              </div>
            </div>

            {/* Right Control Sidebar */}
            <EditorSidebar
              algorithm={algorithm}
              onAlgorithmChange={setAlgorithm}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              inpaintRadius={inpaintRadius}
              onInpaintRadiusChange={setInpaintRadius}
              exportFormat={exportFormat}
              onExportFormatChange={setExportFormat}
              exportQuality={exportQuality}
              onExportQualityChange={setExportQuality}
              isProcessing={isProcessing}
              processingProgress={processingProgress}
              onProcess={handleProcessInpaint}
              onDownload={handleDownload}
              hasProcessedResult={!!processedImageUrl}
              hasMask={hasMask}
              metadata={imageMetadata}
              executionTimeMs={executionTimeMs}
            />

          </div>
        </div>
      )}

    </div>
  );
};
