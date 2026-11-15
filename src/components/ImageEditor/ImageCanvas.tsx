import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ToolMode, Point, SelectionRect } from '../../types';

interface ImageCanvasProps {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  toolMode: ToolMode;
  brushSize: number;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  sourceCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onMaskChange?: () => void;
  onPushHistory?: () => void;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  imageSrc,
  imageWidth,
  imageHeight,
  toolMode,
  brushSize,
  zoom,
  pan,
  onPanChange,
  maskCanvasRef,
  sourceCanvasRef,
  onMaskChange,
  onPushHistory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rectStart, setRectStart] = useState<Point | null>(null);
  const [currentRect, setCurrentRect] = useState<SelectionRect | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);

  // Initialize and load source image onto sourceCanvas
  useEffect(() => {
    if (!sourceCanvasRef.current || !maskCanvasRef.current || !imageSrc) return;

    const sourceCanvas = sourceCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    sourceCanvas.width = imageWidth;
    sourceCanvas.height = imageHeight;
    maskCanvas.width = imageWidth;
    maskCanvas.height = imageHeight;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctx = sourceCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, imageWidth, imageHeight);
        ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      }
    };
    img.src = imageSrc;
  }, [imageSrc, imageWidth, imageHeight, sourceCanvasRef, maskCanvasRef]);

  // Convert screen coordinates to canvas coordinate space
  const getCanvasCoords = useCallback((clientX: number, clientY: number): Point | null => {
    if (!sourceCanvasRef.current) return null;
    const rect = sourceCanvasRef.current.getBoundingClientRect();
    
    // Client offset within the displayed canvas element
    const displayX = clientX - rect.left;
    const displayY = clientY - rect.top;

    // Scale by ratio of internal canvas resolution to displayed bounding client size
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;

    const canvasX = Math.round(displayX * scaleX);
    const canvasY = Math.round(displayY * scaleY);

    return {
      x: Math.max(0, Math.min(imageWidth, canvasX)),
      y: Math.max(0, Math.min(imageHeight, canvasY)),
    };
  }, [imageWidth, imageHeight, sourceCanvasRef]);

  // Render brush cursor outline
  useEffect(() => {
    const cursorCanvas = cursorCanvasRef.current;
    if (!cursorCanvas) return;
    const ctx = cursorCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    if (mousePos && (toolMode === 'brush' || toolMode === 'eraser')) {
      const radius = (brushSize / 2) * zoom;
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = toolMode === 'eraser' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(239, 68, 68, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  }, [mousePos, toolMode, brushSize, zoom]);

  // Handle pointer down (Mouse or Touch)
  const handlePointerDown = (clientX: number, clientY: number, button = 0) => {
    // Middle click or spacebar pan
    if (button === 1 || toolMode === 'pan') {
      setIsPanning(true);
      setPanStart({ x: clientX - pan.x, y: clientY - pan.y });
      return;
    }

    const pt = getCanvasCoords(clientX, clientY);
    if (!pt || !maskCanvasRef.current) return;

    onPushHistory?.();

    if (toolMode === 'brush' || toolMode === 'eraser') {
      setIsDrawing(true);
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;

        if (toolMode === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // Translucent red mask
        }

        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        onMaskChange?.();
      }
    } else if (toolMode === 'rectangle') {
      setIsDrawing(true);
      setRectStart(pt);
      setCurrentRect({ x: pt.x, y: pt.y, width: 0, height: 0 });
    }
  };

  // Handle pointer move
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: clientX - containerRect.left,
        y: clientY - containerRect.top,
      });
    }

    if (isPanning) {
      onPanChange({
        x: clientX - panStart.x,
        y: clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing) return;

    const pt = getCanvasCoords(clientX, clientY);
    if (!pt || !maskCanvasRef.current) return;

    if (toolMode === 'brush' || toolMode === 'eraser') {
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        onMaskChange?.();
      }
    } else if (toolMode === 'rectangle' && rectStart) {
      const rx = Math.min(rectStart.x, pt.x);
      const ry = Math.min(rectStart.y, pt.y);
      const rw = Math.abs(pt.x - rectStart.x);
      const rh = Math.abs(pt.y - rectStart.y);
      setCurrentRect({ x: rx, y: ry, width: rw, height: rh });
    }
  };

  // Handle pointer up
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (toolMode === 'brush' || toolMode === 'eraser') {
      if (maskCanvasRef.current) {
        const ctx = maskCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.closePath();
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    } else if (toolMode === 'rectangle' && currentRect && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx && currentRect.width > 2 && currentRect.height > 2) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
        onMaskChange?.();
      }
      setRectStart(null);
      setCurrentRect(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden checkerboard-pattern rounded-2xl flex items-center justify-center select-none cursor-crosshair"
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY, e.button)}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      onMouseLeave={() => {
        handlePointerUp();
        setMousePos(null);
      }}
      onTouchStart={(e) => {
        if (e.touches[0]) {
          handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchMove={(e) => {
        if (e.touches[0]) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchEnd={handlePointerUp}
      style={{
        cursor: toolMode === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair',
      }}
    >
      {/* Zoom and Pan Container */}
      <div
        className="relative shadow-2xl transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: imageWidth,
          height: imageHeight,
        }}
      >
        {/* Layer 1: Source Image */}
        <canvas
          ref={sourceCanvasRef}
          className="absolute inset-0 block pointer-events-none"
        />

        {/* Layer 2: Mask Canvas (Red semi-transparent highlight) */}
        <canvas
          ref={maskCanvasRef}
          className="absolute inset-0 block pointer-events-none z-10"
        />

        {/* Layer 3: Active Rectangle Selection Box Preview */}
        {currentRect && (
          <div
            className="absolute border-2 border-dashed border-red-500 bg-red-500/40 pointer-events-none z-20"
            style={{
              left: currentRect.x,
              top: currentRect.y,
              width: currentRect.width,
              height: currentRect.height,
            }}
          />
        )}
      </div>

      {/* Screen-Space Cursor Overlay for Circular Brush Size Display */}
      <canvas
        ref={cursorCanvasRef}
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 600}
        className="absolute inset-0 pointer-events-none z-30"
      />
    </div>
  );
};
