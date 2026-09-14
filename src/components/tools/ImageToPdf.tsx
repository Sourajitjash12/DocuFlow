'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageLayoutControl } from '@/components/ui/PageLayoutControl';
import { FileItem, ProcessingResult, PageLayoutConfig } from '@/lib/types';
import { downloadBlob, formatBytes } from '@/lib/utils';
import {
  Download,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Trash2,
  Grid,
  Sparkles,
} from 'lucide-react';

export const ImageToPdf: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<PageLayoutConfig>({
    paperSize: 'a4',
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

  // Move item left in array
  const moveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...files];
    const [moved] = updated.splice(index, 1);
    updated.splice(index - 1, 0, moved);
    setFiles(updated);
  };

  // Move item right in array
  const moveRight = (index: number) => {
    if (index === files.length - 1) return;
    const updated = [...files];
    const [moved] = updated.splice(index, 1);
    updated.splice(index + 1, 0, moved);
    setFiles(updated);
  };

  // Rotate item 90 degrees
  const rotateImage = (index: number) => {
    const updated = [...files];
    const currentRot = updated[index].rotation || 0;
    updated[index] = {
      ...updated[index],
      rotation: (currentRot + 90) % 360,
    };
    setFiles(updated);
  };

  // Remove single image item from queue
  const removeImage = (id: string) => {
    const target = files.find((f) => f.id === id);
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(15);
    setProgressText('Packaging image queue for server conversion...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      let totalSize = 0;
      const rotations: number[] = [];

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        formData.append('files', item.file);
        rotations.push(item.rotation || 0);
        totalSize += item.size;
      }

      formData.append('rotations', JSON.stringify(rotations));
      formData.append('paperSize', layoutConfig.paperSize);
      formData.append('orientation', layoutConfig.orientation);
      formData.append('qualityMode', layoutConfig.qualityMode);
      formData.append('qualityPercentage', (layoutConfig.qualityPercentage || 90).toString());
      formData.append('backgroundColor', layoutConfig.backgroundColor || '#ffffff');
      formData.append('scaleFactor', (layoutConfig.scaleFactor || 1.0).toString());
      formData.append('marginTop', (layoutConfig.margins.top || 20).toString());
      formData.append('marginBottom', (layoutConfig.margins.bottom || 20).toString());
      formData.append('marginLeft', (layoutConfig.margins.left || 20).toString());
      formData.append('marginRight', (layoutConfig.margins.right || 20).toString());

      if (layoutConfig.customWidth) formData.append('customWidth', layoutConfig.customWidth.toString());
      if (layoutConfig.customHeight) formData.append('customHeight', layoutConfig.customHeight.toString());

      setProgress(50);
      setProgressText(`Formatting ${files.length} pages via server PDF engine...`);

      const response = await fetch('/api/convert/image-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to convert images to PDF.');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const fileName = filenameMatch ? filenameMatch[1] : `docuflow_images_${Date.now()}.pdf`;

      setResult({
        blob,
        fileName,
        mimeType: 'application/pdf',
        originalSize: totalSize,
        processedSize: blob.size,
      });

      setProgress(100);
      setStatus('success');
    } catch (err: any) {
      console.error('Image to PDF conversion error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to convert image queue to PDF.');
    }
  };

  const handleReset = () => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {status === 'idle' && (
        <div className="space-y-6">
          {/* File Upload Zone */}
          <FileUploadZone
            acceptedTypes={['image/png', 'image/jpeg', 'image/webp', '.png', '.jpg', '.jpeg', '.webp']}
            acceptedTypesLabel="PNG, JPG, WebP Images (Select Multiple)"
            maxFiles={50}
            files={files}
            onFilesChange={setFiles}
          />

          {/* Interactive Multi-Image Reordering Thumbnail Grid */}
          {files.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6 shadow-subtle">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Image Page Queue & Layout Reordering ({files.length} pages)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Total Input: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
                </span>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((item, idx) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 transition-all hover:border-slate-300 hover:shadow-card"
                  >
                    {/* Page Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Page {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail Viewport */}
                    <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="h-full w-full object-contain transition-transform duration-300"
                          style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      )}
                    </div>

                    {/* File Meta */}
                    <div className="mt-2 text-[11px]">
                      <p className="truncate font-semibold text-slate-800" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-slate-400 font-mono">{formatBytes(item.size)}</p>
                    </div>

                    {/* Reordering & Rotation Action Bar */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2 bg-white rounded p-1">
                      <button
                        type="button"
                        onClick={() => moveLeft(idx)}
                        disabled={idx === 0}
                        className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Left (Earlier Page)"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => rotateImage(idx)}
                        className="rounded p-1 text-indigo-600 hover:bg-indigo-50"
                        title="Rotate 90°"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveRight(idx)}
                        disabled={idx === files.length - 1}
                        className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Right (Later Page)"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Layout & Margin Configuration Control Panel */}
              <PageLayoutControl
                config={layoutConfig}
                onChange={setLayoutConfig}
                title="Page Layout & Safe Margin Control Panel"
                description="Select target paper format (A4, A5, Letter, Legal, Auto-Fit, Custom), define top/bottom/left/right safe margins, and adjust density preservation mode."
              />

              {/* Action Trigger */}
              <button
                type="button"
                onClick={handleConvert}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md"
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Generate Formatted PDF ({files.length} Pages)
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
            <h3 className="text-base font-semibold text-slate-900">Building Formatted PDF Document...</h3>
            <p className="text-xs text-slate-500 font-mono">Applying safe margins & precision scaling across {files.length} images</p>
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
              <h3 className="text-base font-semibold text-slate-900">PDF Ready for Download!</h3>
              <p className="text-xs text-slate-500">{files.length} image(s) formatted into unified PDF document.</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Output File Name:</span>
              <span className="font-mono text-slate-900 font-semibold">{result.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Output File Size:</span>
              <span className="font-mono text-emerald-600 font-bold">{formatBytes(result.processedSize)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.fileName)}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Download Formatted PDF
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto rounded-lg border border-slate-200 px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Convert Another Queue
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
