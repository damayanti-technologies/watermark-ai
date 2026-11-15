import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video as VideoIcon, AlertCircle, FileCheck, Sparkles } from 'lucide-react';

interface FileDropzoneProps {
  accept: 'image' | 'video' | 'both';
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
  onSampleSelect?: (sampleUrl: string, sampleName: string) => void;
  title?: string;
  subtitle?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  onFileSelect,
  maxSizeMB = 100,
  onSampleSelect,
  title,
  subtitle,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedExtensions = () => {
    if (accept === 'image') return '.jpg,.jpeg,.png,.webp';
    if (accept === 'video') return '.mp4,.webm,.mov';
    return '.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';
  };

  const validateAndPass = (file: File) => {
    setErrorMessage(null);

    // Check type
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);

    if (accept === 'image' && !isImage) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (accept === 'video' && !isVideo) {
      setErrorMessage('Please upload a valid video file (MP4, WebM, or MOV).');
      return;
    }

    if (!isImage && !isVideo) {
      setErrorMessage('Unsupported file format. Please upload an image or video.');
      return;
    }

    // Check size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setErrorMessage(`File is too large (${sizeInMB.toFixed(1)} MB). Maximum allowed size is ${maxSizeMB} MB.`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndPass(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01] shadow-lg shadow-indigo-500/10'
            : 'border-slate-300/80 bg-white hover:border-indigo-400 hover:bg-slate-50/60 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedExtensions()}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-xs">
            {accept === 'video' ? (
              <VideoIcon className="w-8 h-8" />
            ) : accept === 'image' ? (
              <ImageIcon className="w-8 h-8" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
              {title || (accept === 'video' ? 'Upload video to remove watermark' : 'Drop your file here, or browse')}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {subtitle || (
                accept === 'video'
                  ? 'Supports MP4, WebM, MOV. Processed 100% in your browser.'
                  : 'Supports JPG, PNG, WebP up to original camera resolution. 100% private.'
              )}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-colors shadow-indigo-600/20">
            <UploadCloud className="w-4 h-4" />
            <span>Select File from Device</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> Max file size: {maxSizeMB}MB
            </span>
            <span>&bull;</span>
            <span>No data leaves your device</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Test Samples */}
      {onSampleSelect && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs text-slate-500">
          <span className="font-medium text-slate-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Or try with a demo sample:
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {accept === 'image' || accept === 'both' ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSampleSelect('/samples/photo-watermark-1.jpg', 'Landscape Photo (Watermarked)');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 font-medium transition-colors shadow-2xs"
                >
                  Nature Landscape with Stamp
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSampleSelect('/samples/photo-watermark-2.png', 'Product Graphic (With Logo)');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 font-medium transition-colors shadow-2xs"
                >
                  Product with Corner Logo
                </button>
              </>
            ) : null}

            {accept === 'video' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSampleSelect('/samples/video-watermark-sample.mp4', 'Sample Video (With Timecode)');
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 font-medium transition-colors shadow-2xs"
              >
                Stock Video with Timestamp
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
