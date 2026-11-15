import React from 'react';
import { 
  Paintbrush, 
  Square, 
  Eraser, 
  Hand, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Scan,
  Eye
} from 'lucide-react';
import type { ToolMode } from '../../types';

interface EditorToolbarProps {
  toolMode: ToolMode;
  onSelectTool: (mode: ToolMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetMask: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitScreen: () => void;
  showComparison: boolean;
  onToggleComparison: () => void;
  hasProcessedResult: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  toolMode,
  onSelectTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetMask,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitScreen,
  showComparison,
  onToggleComparison,
  hasProcessedResult,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
      
      {/* Primary Selection Tools */}
      <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => onSelectTool('brush')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            toolMode === 'brush'
              ? 'bg-white text-indigo-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          title="Paint Brush (Select watermark)"
        >
          <Paintbrush className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Brush</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('rectangle')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            toolMode === 'rectangle'
              ? 'bg-white text-indigo-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          title="Rectangle Box Selection"
        >
          <Square className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Rectangle</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('eraser')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            toolMode === 'eraser'
              ? 'bg-white text-indigo-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          title="Eraser (Remove parts of selection)"
        >
          <Eraser className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Eraser</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('pan')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            toolMode === 'pan'
              ? 'bg-white text-indigo-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
          title="Pan / Hand tool (Drag image canvas)"
        >
          <Hand className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Pan</span>
        </button>
      </div>

      {/* History (Undo / Redo / Clear) */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onResetMask}
          className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
          title="Clear all selections"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom & Screen Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onZoomReset}
          className="px-2 py-1 rounded-md text-xs font-mono font-medium hover:bg-slate-100 text-slate-700"
          title="Reset zoom to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onFitScreen}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          title="Fit to Screen"
        >
          <Scan className="w-4 h-4" />
        </button>
      </div>

      {/* Before/After Split Preview Button */}
      {hasProcessedResult && (
        <button
          type="button"
          onClick={onToggleComparison}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            showComparison
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{showComparison ? 'Back to Editor' : 'Compare Split'}</span>
        </button>
      )}

    </div>
  );
};
