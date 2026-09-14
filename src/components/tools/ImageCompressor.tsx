'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageLayoutControl } from '@/components/ui/PageLayoutControl';
import { FileItem, ProcessingResult, PageLayoutConfig } from '@/lib/types';
import { formatBytes, downloadBlob } from '@/lib/utils';
import {
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  FileType,
  Check,
} from 'lucide-react';

export const ImageCompressor: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original');
  const [layoutConfig, setLayoutConfig] = useState<PageLayoutConfig>({
    paperSize: 'fit',
    marginPreset: 'none',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    orientation: 'auto',
    qualityMode: 'balanced',
    qualityPercentage: 80,
    scaleFactor: 1.0,
    backgroundType: 'white',
    backgroundColor: '#ffffff',
  });

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) return;
    const item = files[0];

    setStatus('processing');
    setProgress(20);
    setProgressText('Uploading image payload to compression API...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('outputFormat', outputFormat);
      formData.append('paperSize', layoutConfig.paperSize);
      formData.append('orientation', layoutConfig.orientation);
      formData.append('qualityPercentage', (layoutConfig.qualityPercentage || 80).toString());
      formData.append('backgroundType', layoutConfig.backgroundType);
      formData.append('backgroundColor', layoutConfig.backgroundColor || '#ffffff');
      formData.append('scaleFactor', (layoutConfig.scaleFactor || 1.0).toString());
      formData.append('marginTop', (layoutConfig.margins.top || 0).toString());
      formData.append('marginBottom', (layoutConfig.margins.bottom || 0).toString());
      formData.append('marginLeft', (layoutConfig.margins.left || 0).toString());
      formData.append('marginRight', (layoutConfig.margins.right || 0).toString());

      if (layoutConfig.customWidth) formData.append('customWidth', layoutConfig.customWidth.toString());
      if (layoutConfig.customHeight) formData.append('customHeight', layoutConfig.customHeight.toString());

      setProgress(60);
      setProgressText('Applying sharp Lanczos3 resampling & safe margin padding...');

      const response = await fetch('/api/image/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server image compression processing failed.');
      }

      const origSize = parseInt(response.headers.get('X-Original-Size') || item.size.toString(), 10);
      const compSize = parseInt(response.headers.get('X-Compressed-Size') || '0', 10);
      const compRatio = parseInt(response.headers.get('X-Compression-Ratio') || '0', 10);
      const blob = await response.blob();

      const disposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const ext = outputFormat === 'original' ? item.name.split('.').pop() || 'jpg' : outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      const fileName = filenameMatch ? filenameMatch[1] : `${item.name.replace(/\.[^/.]+$/, '')}_compressed.${ext}`;

      setResult({
        blob,
        fileName,
        mimeType: blob.type || 'image/jpeg',
        originalSize: origSize,
        processedSize: compSize || blob.size,
        compressionRatio: compRatio,
      });

      setProgress(100);
      setStatus('success');
    } catch (err: any) {
      console.error('Image compression error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to compress image file.');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {status === 'idle' && (
        <div className="space-y-6">
          <FileUploadZone
            acceptedTypes={['image/png', 'image/jpeg', 'image/webp', '.png', '.jpg', '.jpeg', '.webp']}
            acceptedTypesLabel="PNG, JPG, WebP Images (.png, .jpg, .webp)"
            maxFiles={1}
            files={files}
            onFilesChange={setFiles}
          />

          {files.length > 0 && (
            <div className="space-y-5">
              {/* Output Format Converter Selection */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-subtle">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileType className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Output Image Format Handling</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Format Optimization
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'original', label: 'Keep Original', desc: 'Preserve input extension' },
                    { id: 'jpeg', label: 'Convert to JPG', desc: 'Best for file size trim' },
                    { id: 'png', label: 'Convert to PNG', desc: 'Lossless text & graphic' },
                    { id: 'webp', label: 'Convert to WebP', desc: 'Next-Gen Web Standard' },
                  ].map((fmt) => {
                    const isSelected = outputFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setOutputFormat(fmt.id as any)}
                        className={`rounded-lg border p-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-600 text-slate-900 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{fmt.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{fmt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Page Layout & Margin Control Panel */}
              <PageLayoutControl
                config={layoutConfig}
                onChange={setLayoutConfig}
                title="Image Sizing, Margin Padding & Compression Control"
                description="Select target image size standard, safe margin padding, quality retention percentage (1-100%), and background fill color."
              />

              <button
                type="button"
                onClick={handleCompress}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md"
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Compress & Optimize Image
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing State */}
      {status === 'processing' && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-6 shadow-subtle">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
            <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-900">Compressing & Optimizing Image...</h3>
            <p className="text-xs text-slate-500 font-mono">{files[0]?.name}</p>
          </div>
          <ProgressBar progress={progress} statusText={progressText} />
        </div>
      )}

      {/* Success State */}
      {status === 'success' && result && (
        <div className="rounded-xl border border-emerald-200 bg-white p-8 space-y-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Image Compression Complete!</h3>
              <p className="text-xs text-slate-500">Your image was processed securely via server-side sharp engine.</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Original File Size:</span>
              <span className="font-mono text-slate-900 font-semibold">{formatBytes(result.originalSize)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Compressed File Size:</span>
              <span className="font-mono text-emerald-600 font-bold">{formatBytes(result.processedSize)}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2">
              <span className="text-slate-700 font-semibold">Total Reduction:</span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800">
                -{result.compressionRatio}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.fileName)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Download Compressed Image
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Compress Another Image
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="rounded-xl border border-rose-200 bg-white p-6 space-y-4 shadow-subtle">
          <p className="text-sm font-semibold text-rose-600">Error: {errorMessage}</p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
