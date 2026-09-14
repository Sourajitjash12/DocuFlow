'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FileItem, ProcessingResult } from '@/lib/types';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { Download, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export const PdfToDocx: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    const item = files[0];

    setStatus('processing');
    setProgress(25);
    setProgressText('Sending PDF payload to Word extraction API...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', item.file);

      setProgress(65);
      setProgressText('Parsing document structure & building Word (.docx) schema...');

      const response = await fetch('/api/convert/pdf-to-docx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'PDF to Word conversion server error.');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const fileName = filenameMatch ? filenameMatch[1] : item.name.replace(/\.pdf$/i, '.docx');

      setResult({
        blob,
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        originalSize: item.size,
        processedSize: blob.size,
      });

      setProgress(100);
      setStatus('success');
    } catch (err: any) {
      console.error('PDF to Docx error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to convert PDF to Word document.');
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
    <div className="mx-auto max-w-3xl space-y-6">
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">PDF Document Selected</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">{formatBytes(files[0].size)}</span>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                className="w-full rounded-lg bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Convert PDF to Word (.docx)
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
            <h3 className="text-base font-semibold text-slate-900">Converting PDF to Word...</h3>
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
              <h3 className="text-base font-semibold text-slate-900">PDF Converted to Word!</h3>
              <p className="text-xs text-slate-500">Your Word document was generated successfully.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.fileName)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Download Word File
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
