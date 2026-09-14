'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageLayoutControl } from '@/components/ui/PageLayoutControl';
import { FileItem, ProcessingResult, PageLayoutConfig } from '@/lib/types';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { Download, Layers, CheckCircle2, RefreshCw } from 'lucide-react';

export const PdfMerger: React.FC = () => {
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

  const handleMerge = async () => {
    if (files.length < 2) return;

    setStatus('processing');
    setProgress(20);
    setProgressText('Packaging PDF files for merge API...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      let totalSize = 0;

      for (const item of files) {
        formData.append('files', item.file);
        totalSize += item.size;
      }

      formData.append('preset', layoutConfig.paperSize);
      formData.append('scaleFactor', (layoutConfig.scaleFactor || 1.0).toString());
      if (layoutConfig.customWidth) formData.append('customWidth', layoutConfig.customWidth.toString());
      if (layoutConfig.customHeight) formData.append('customHeight', layoutConfig.customHeight.toString());

      setProgress(60);
      setProgressText('Combining document pages & applying layout engine on server...');

      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server PDF merge failed.');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const fileName = filenameMatch ? filenameMatch[1] : 'docuflow_merged.pdf';

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
      console.error('Merge error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to merge PDF files.');
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
            maxFiles={15}
            files={files}
            onFilesChange={setFiles}
            allowReorder={true}
          />

          {files.length >= 2 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-subtle">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Merge Configuration</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{files.length} Documents ready</span>
                </div>

                <p className="text-xs text-slate-500">
                  Tip: You can use the arrow icons in the list above to reorder your PDF documents before merging.
                </p>
              </div>

              {/* Page Layout & Safe Margin Configuration Control Panel */}
              <PageLayoutControl
                config={layoutConfig}
                onChange={setLayoutConfig}
                title="Unified Page Format & Margin Control Panel"
                description="Select output target canvas format (A4, A5, Letter, Legal, Fit, Custom) and adjust safe margins for merged documents."
              />

              <button
                type="button"
                onClick={handleMerge}
                className="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md"
              >
                Merge {files.length} PDF Documents & Apply Layout
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
            <h3 className="text-base font-semibold text-slate-900">Merging PDF Documents...</h3>
            <p className="text-xs text-slate-500 font-mono">Combining {files.length} files into one PDF</p>
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
              <h3 className="text-base font-semibold text-slate-900">PDFs Successfully Merged!</h3>
              <p className="text-xs text-slate-500">{files.length} files combined into {result.fileName}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Final Output Size:</span>
            <span className="font-mono text-slate-900 font-bold">{formatBytes(result.processedSize)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.fileName)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Download Merged PDF
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Merge More PDFs
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
