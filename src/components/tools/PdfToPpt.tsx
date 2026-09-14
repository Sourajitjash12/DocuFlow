'use client';

import React, { useState } from 'react';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FileItem, ProcessingResult } from '@/lib/types';
import { downloadBlob, formatBytes } from '@/lib/utils';
import {
  Download,
  Presentation,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Maximize2,
  Grid,
  Sparkles,
} from 'lucide-react';

export type SlideLayoutOption = '16:9' | '4:3' | 'match';
export type MarginOption = 'none' | 'compact' | 'standard' | 'wide';

export const PdfToPpt: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [slideLayout, setSlideLayout] = useState<SlideLayoutOption>('16:9');
  const [dpi, setDpi] = useState<number>(150);
  const [margin, setMargin] = useState<MarginOption>('standard');

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
    setProgressText('Uploading PDF document to conversion pipeline...');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('slideLayout', slideLayout);
      formData.append('dpi', dpi.toString());
      formData.append('margin', margin);

      setProgress(55);
      setProgressText(`Rasterizing PDF pages at ${dpi} DPI & building PowerPoint (.pptx) presentation...`);

      const response = await fetch('/api/pdf-to-ppt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'PDF to PowerPoint conversion failed.');
      }

      setProgress(85);
      setProgressText('Finalizing OpenXML PowerPoint file download stream...');

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const defaultName = `${item.name.replace(/\.pdf$/i, '')}-presentation.pptx`;
      const fileName = filenameMatch ? filenameMatch[1] : defaultName;

      const pageCountHeader = response.headers.get('X-Page-Count');
      const pageCount = pageCountHeader ? parseInt(pageCountHeader, 10) : item.pageCount || 1;

      setResult({
        blob,
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        originalSize: item.size,
        processedSize: blob.size,
      });

      setProgress(100);
      setStatus('success');
    } catch (err: any) {
      console.error('PDF to PowerPoint conversion error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to convert PDF to PowerPoint presentation.');
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
          {/* File Upload Zone */}
          <FileUploadZone
            acceptedTypes={['application/pdf', '.pdf']}
            acceptedTypesLabel="PDF Documents (.pdf)"
            maxFiles={1}
            files={files}
            onFilesChange={setFiles}
          />

          {files.length > 0 && (
            <div className="space-y-5">
              {/* File Info Header */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-subtle">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Presentation className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{files[0].name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{formatBytes(files[0].size)}</p>
                    </div>
                  </div>
                  <span className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                    PDF Document
                  </span>
                </div>

                {/* Unified Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* 1. Slide Dimension Options */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
                      Slide Dimension Options
                    </label>

                    <div className="space-y-2">
                      {[
                        {
                          id: '16:9',
                          label: 'Standard 16:9 Widescreen',
                          desc: '10 × 5.625 in • Modern TVs & displays',
                        },
                        {
                          id: '4:3',
                          label: 'Standard 4:3 Presentation',
                          desc: '10 × 7.5 in • Legacy projectors',
                        },
                        {
                          id: 'match',
                          label: 'Match PDF Page Size',
                          desc: 'Preserves original document proportions',
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSlideLayout(opt.id as SlideLayoutOption)}
                          className={`w-full rounded-lg border p-3 text-left transition-all ${
                            slideLayout === opt.id
                              ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 text-slate-900'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{opt.label}</span>
                            {slideLayout === opt.id && (
                              <span className="h-2 w-2 rounded-full bg-indigo-600" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Quality & Resolution Settings */}
                  <div className="space-y-4">
                    {/* Quality / Resolution Slider */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                          Raster Quality / Resolution (DPI)
                        </label>
                        <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-mono font-bold text-white">
                          {dpi} DPI
                        </span>
                      </div>

                      <input
                        type="range"
                        min="90"
                        max="300"
                        step="15"
                        value={dpi}
                        onChange={(e) => setDpi(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />

                      <div className="flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => setDpi(150)}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            dpi === 150
                              ? 'bg-indigo-600 font-bold text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          150 DPI (Balanced)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDpi(300)}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            dpi === 300
                              ? 'bg-indigo-600 font-bold text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          300 DPI (Ultra Crisp)
                        </button>
                      </div>
                    </div>

                    {/* Margin Padding Selector */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Grid className="h-3.5 w-3.5 text-slate-500" />
                        Slide Safe Margins
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'none', label: 'None' },
                          { id: 'compact', label: 'Compact' },
                          { id: 'standard', label: 'Standard' },
                          { id: 'wide', label: 'Wide' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMargin(m.id as MarginOption)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded border text-center transition-all ${
                              margin === m.id
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Convert Action */}
                <button
                  type="button"
                  onClick={handleConvert}
                  className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Convert PDF to PowerPoint (.pptx)
                </button>
              </div>
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
            <h3 className="text-base font-semibold text-slate-900">Converting PDF to PowerPoint Presentation...</h3>
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
              <h3 className="text-base font-bold text-slate-900">PowerPoint Presentation Ready!</h3>
              <p className="text-xs text-slate-500">Your PDF pages were successfully converted into PowerPoint slides.</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Generated File Size:</span>
            <span className="font-mono text-slate-900 font-bold">{formatBytes(result.processedSize)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.fileName)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Download PowerPoint Presentation (.pptx)
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Convert Another PDF
            </button>
          </div>
        </div>
      )}

      {/* Error Boundary State */}
      {status === 'error' && (
        <div className="rounded-xl border border-rose-200 bg-white p-6 space-y-4 shadow-subtle">
          <div className="flex items-center gap-2 text-rose-600">
            <h4 className="text-sm font-bold">Conversion Failed</h4>
          </div>
          <p className="text-xs text-rose-600 font-mono bg-rose-50 p-3 rounded border border-rose-100">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
