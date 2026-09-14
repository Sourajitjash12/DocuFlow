'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageLayoutControl } from '@/components/ui/PageLayoutControl';
import { FileItem, ProcessingResult, PageLayoutConfig } from '@/lib/types';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { Download, Image as ImageIcon, CheckCircle2, RefreshCw } from 'lucide-react';

export const PdfToImage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [layoutConfig, setLayoutConfig] = useState<PageLayoutConfig>({
    paperSize: 'fit',
    marginPreset: 'standard',
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    orientation: 'auto',
    qualityMode: 'high',
    qualityPercentage: 90,
    scaleFactor: 1.0,
    backgroundType: 'white',
    backgroundColor: '#ffffff',
  });

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    const item = files[0];

    setStatus('processing');
    setProgress(20);
    setProgressText('Packaging PDF file for image rasterization API...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('outputFormat', imageFormat);
      formData.append('paperSize', layoutConfig.paperSize);
      formData.append('orientation', layoutConfig.orientation);
      formData.append('qualityPercentage', (layoutConfig.qualityPercentage || 90).toString());
      formData.append('backgroundType', layoutConfig.backgroundType);
      formData.append('backgroundColor', layoutConfig.backgroundColor || '#ffffff');
      formData.append('scaleFactor', (layoutConfig.scaleFactor || 1.0).toString());
      formData.append('marginTop', (layoutConfig.margins.top || 20).toString());
      formData.append('marginBottom', (layoutConfig.margins.bottom || 20).toString());
      formData.append('marginLeft', (layoutConfig.margins.left || 20).toString());
      formData.append('marginRight', (layoutConfig.margins.right || 20).toString());

      if (layoutConfig.customWidth) formData.append('customWidth', layoutConfig.customWidth.toString());
      if (layoutConfig.customHeight) formData.append('customHeight', layoutConfig.customHeight.toString());

      setProgress(60);
      setProgressText(`Applying Lanczos safe margins & rendering PDF page to ${imageFormat.toUpperCase()}...`);

      const response = await fetch('/api/convert/pdf-to-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'PDF to image conversion server error.');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const ext = imageFormat === 'jpeg' ? 'jpg' : imageFormat;
      const fileName = filenameMatch ? filenameMatch[1] : `${item.name.replace(/\.pdf$/i, '')}_page1.${ext}`;

      setResult({
        blob,
        fileName,
        mimeType: blob.type || `image/${imageFormat}`,
        originalSize: item.size,
        processedSize: blob.size,
      });

      setProgress(100);
      setStatus('success');
    } catch (err: any) {
      console.error('PDF to Image conversion error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to render PDF pages into images.');
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
            acceptedTypes={['application/pdf', '.pdf']}
            acceptedTypesLabel="PDF Documents (.pdf)"
            maxFiles={1}
            files={files}
            onFilesChange={setFiles}
          />

          {files.length > 0 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-subtle">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Output Image Format</h3>
                  </div>
                  <div className="flex gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setImageFormat(fmt)}
                        className={`px-3 py-1 text-xs font-semibold uppercase rounded transition-colors ${
                          imageFormat === fmt
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Page Layout & Safe Margin Configuration Control Panel */}
              <PageLayoutControl
                config={layoutConfig}
                onChange={setLayoutConfig}
                title="Page Layout, Margin & Image Quality Control"
                description="Select target image paper standard (A4, A5, Letter, Legal, Fit, Custom), safe margin padding, quality percentage slider (1-100%), and background color."
              />

              <button
                type="button"
                onClick={handleConvert}
                className="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md"
              >
                Convert PDF to {imageFormat.toUpperCase()} with Layout Engine
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'processing' && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-6 shadow-subtle">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
            <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-900">Converting PDF Pages to Images...</h3>
            <p className="text-xs text-slate-500 font-mono">{files[0]?.name}</p>
          </div>
          <ProgressBar progress={progress} statusText={progressText} />
        </div>
      )}

      {status === 'success' && result && (
        <div className="rounded-xl border border-emerald-200 bg-white p-8 space-y-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">PDF Converted to Images!</h3>
              <p className="text-xs text-slate-500">High-resolution image rendered with safe margins & quality settings.</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Exported File Size:</span>
            <span className="font-mono text-slate-900 font-bold">{formatBytes(result.processedSize)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.fileName)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Download Formatted Image
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Convert Another
            </button>
          </div>
        </div>
      )}

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
