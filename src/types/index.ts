export type ToolMode = 'brush' | 'rectangle' | 'eraser' | 'pan';

export type InpaintAlgorithm = 'telea' | 'ns' | 'patch' | 'onnx_ai';

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawStroke {
  points: Point[];
  size: number;
  isEraser: boolean;
}

export interface MaskAction {
  type: 'stroke' | 'rect' | 'clear';
  stroke?: DrawStroke;
  rect?: SelectionRect;
}

export interface ImageMetadata {
  file: File;
  name: string;
  width: number;
  height: number;
  size: number;
  type: string;
  url: string;
  aspectRatio: number;
}

export interface ProcessingProgress {
  stage: string;
  percent: number;
  details?: string;
}

export interface VideoMetadata {
  file: File;
  name: string;
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
  fps: number;
  url: string;
}

export interface VideoKeyframe {
  timestamp: number;
  rect: SelectionRect;
}

export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type VideoExportQuality = 'high' | 'balanced' | 'fast';
