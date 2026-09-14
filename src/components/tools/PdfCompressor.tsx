'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageLayoutControl } from '@/components/ui/PageLayoutControl';
import { FileItem, ProcessingResult, PageLayoutConfig } from '@/lib/types';
import { formatBytes, downloadBlob } from '@/lib/utils';
import { Download, Sliders, CheckCircle2, RefreshCw } from 'lucide-react';

export const PdfCompressor: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
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
    const fileItem = files[0];

    setStatus('processing');
    setProgress(15);
    setProgressText('Uploading PDF to compression server engine...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', fileItem.file);
      formData.append('level', compressionLevel);
      formData.append('preset', layoutConfig.paperSize);
      formData.append('scaleFactor', (layoutConfig.scaleFactor || 1.0).toString());
      if (layoutConfig.customWidth) formData.append('customWidth', layoutConfig.customWidth.toString());
      if (layoutConfig.customHeight) formData.append('customHeight', layoutConfig.customHeight.toString());

      setProgress(50);
      setProgressText('Compressing object streams and scaling document dimensions...');

      const response = await fetch('/api/pdf/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'PDF compression server execution failed.');
      }

      const origSize = parseInt(response.headers.get('X-Original-Size') || fileItem.size.toString(), 10);
      const compSize = parseInt(response.headers.get('X-Compressed-Size') || '0', 10);
      const blob = await response.blob();

      const reduction = Math.round(((origSize - (compSize || blob.size)) / origSize) * 100);

      setResult({
        blob,
        fileName: fileItem.name.replace(/\.pdf$/i, '_compressed.pdf'),
        mimeType: 'application/pdf',
        originalSize: origSize,
        processedSize: compSize || blob.size,
        compressionRatio: reduction > 0 ? reduction : 0,
      });

      setProgress(100);
      setStatus('success');
    } catch (err: any) {
      console.error('Compression failed:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to compress PDF file.');
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
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 space-y-4 shadow-card">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Sliders className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">Compression Stream Level</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'low', label: 'Low Compression', desc: 'High quality, minimal reduction' },
                    { key: 'medium', label: 'Recommended', desc: 'Optimal balance of size & quality' },
                    { key: 'high', label: 'Extreme', desc: 'Maximum size reduction' },
                  ].map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setCompressionLevel(preset.key as any)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        compressionLevel === preset.key
                          ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20'
                          : 'border-stone-200/80 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{preset.label}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Layout & Margin Configuration Control Panel */}
              <PageLayoutControl
                config={layoutConfig}
                onChange={setLayoutConfig}
                title="Page Layout & Margin Configuration"
                description="Resize output page format (A4, A5, Letter, Legal, Fit, Custom) or configure page margin safe bounds before compression."
              />

              <button
                type="button"
                onClick={handleCompress}
                className="w-full rounded-full bg-gradient-btn py-4 text-sm font-bold text-white shadow-glow hover:scale-[1.01] transition-transform active:scale-[0.99]"
              >
                Compress PDF & Format Layout
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'processing' && (
        <div className="rounded-3xl border border-stone-200/80 bg-white p-8 text-center space-y-6 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
            <RefreshCw className="h-7 w-7 text-purple-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Compressing PDF...</h3>
            <p className="text-xs text-slate-500 font-mono">{files[0]?.name}</p>
          </div>
          <ProgressBar progress={progress} statusText={progressText} />
        </div>
      )}

      {status === 'success' && result && (
        <div className="rounded-3xl border border-emerald-200/80 bg-white p-8 space-y-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Compression Complete!</h3>
              <p className="text-xs text-slate-500">Your document was compressed via server engine.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Original Size:</span>
              <span className="font-mono text-slate-900 font-semibold">{formatBytes(result.originalSize)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Compressed Size:</span>
              <span className="font-mono text-emerald-600 font-bold">{formatBytes(result.processedSize)}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-stone-200 pt-2">
              <span className="text-slate-700 font-semibold">Total Reduction:</span>
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 font-mono text-xs font-bold text-emerald-800">
                -{result.compressionRatio}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.fileName)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-btn py-3.5 text-sm font-bold text-white shadow-glow hover:scale-[1.02] transition-transform"
            >
              <Download className="h-4 w-4" /> Download Compressed PDF
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-stone-200 px-6 py-3.5 text-xs font-bold text-slate-700 hover:bg-stone-50 transition-colors"
            >
              Compress Another
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-3xl border border-rose-200 bg-white p-6 space-y-4 shadow-subtle">
          <p className="text-sm font-bold text-rose-600">Error: {errorMessage}</p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
