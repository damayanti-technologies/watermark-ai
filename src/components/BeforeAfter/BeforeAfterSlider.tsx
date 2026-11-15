import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Columns, SplitSquareVertical, Maximize2, Minimize2, Eye, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalSrc: string;
  processedSrc: string;
  originalLabel?: string;
  processedLabel?: string;
  className?: string;
  aspectRatio?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalSrc,
  processedSrc,
  originalLabel = 'Original',
  processedLabel = 'Restored',
  className = '',
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [holdOriginal, setHoldOriginal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-white border border-slate-200/90 rounded-xl shadow-xs text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'slider'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Press and hold to view original */}
          <button
            type="button"
            onMouseDown={() => setHoldOriginal(true)}
            onMouseUp={() => setHoldOriginal(false)}
            onMouseLeave={() => setHoldOriginal(false)}
            onTouchStart={() => setHoldOriginal(true)}
            onTouchEnd={() => setHoldOriginal(false)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-[11px] font-medium text-slate-700 active:bg-slate-200 select-none"
            title="Hold to see original"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Hold for Original</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Comparison Area */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-inner select-none flex items-center justify-center min-h-[300px] max-h-[70vh]"
      >
        {viewMode === 'slider' ? (
          <div
            className="relative w-full h-full flex items-center justify-center cursor-ew-resize overflow-hidden"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              if (e.touches[0]) handleMove(e.touches[0].clientX);
            }}
          >
            {/* Processed (Restored) Image - Background Base */}
            <img
              src={holdOriginal ? originalSrc : processedSrc}
              alt="Result"
              className="w-full h-auto max-h-[70vh] object-contain block mx-auto pointer-events-none"
              draggable={false}
            />

            {/* Original Image - Clipped Layer on Top */}
            {!holdOriginal && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={originalSrc}
                  alt="Original"
                  className="w-full h-auto max-h-[70vh] object-contain block mx-auto"
                  draggable={false}
                />
              </div>
            )}

            {/* Slider Divider Line */}
            {!holdOriginal && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                {/* Drag Handle Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700">
                  <div className="flex gap-0.5 items-center">
                    <span className="w-0.5 h-3 bg-slate-400 rounded-full"></span>
                    <span className="w-0.5 h-3 bg-slate-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-sm">
                {originalLabel}
              </span>
            </div>
            <div className="absolute top-3 right-3 z-30 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-indigo-600/80 backdrop-blur-md text-white text-[11px] font-semibold border border-indigo-400/30 shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-200" />
                {processedLabel}
              </span>
            </div>
          </div>
        ) : (
          /* Side by Side View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full p-2 h-full">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium border border-white/10">
                {originalLabel}
              </span>
              <img
                src={originalSrc}
                alt="Original"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-indigo-600/80 text-white text-[10px] font-semibold border border-indigo-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-200" />
                {processedLabel}
              </span>
              <img
                src={processedSrc}
                alt="Restored"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
