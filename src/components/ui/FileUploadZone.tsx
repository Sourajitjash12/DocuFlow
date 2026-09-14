'use client';

import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, File, X, AlertCircle, ArrowUp, ArrowDown, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { FileItem } from '@/lib/types';
import { formatBytes, validateFiles, generateId } from '@/lib/utils';

interface FileUploadZoneProps {
  acceptedTypes: string[];
  acceptedTypesLabel?: string;
  maxFiles?: number;
  maxSizeBytes?: number;
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  isProcessing?: boolean;
  allowReorder?: boolean;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  acceptedTypes,
  acceptedTypesLabel = 'PDF, DOCX, PNG, JPG',
  maxFiles = 10,
  maxSizeBytes = 50 * 1024 * 1024,
  files,
  onFilesChange,
  isProcessing = false,
  allowReorder = false,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processIncomingFiles = useCallback(
    (rawFiles: File[]) => {
      setErrorMsg(null);
      if (rawFiles.length === 0) return;

      const availableSlots = maxFiles - files.length;
      if (availableSlots <= 0) {
        setErrorMsg(`Maximum of ${maxFiles} file(s) allowed.`);
        return;
      }

      const filesToProcess = rawFiles.slice(0, availableSlots);
      const { valid, errors } = validateFiles(filesToProcess, acceptedTypes, maxSizeBytes);

      if (errors.length > 0) {
        setErrorMsg(errors.join(' '));
      }

      if (valid.length > 0) {
        const newItems: FileItem[] = valid.map((file) => {
          let previewUrl: string | undefined = undefined;
          if (file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
          }
          return {
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl,
            rotation: 0,
          };
        });

        onFilesChange([...files, ...newItems]);
      }
    },
    [acceptedTypes, files, maxFiles, maxSizeBytes, onFilesChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processIncomingFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      processIncomingFiles(selectedFiles);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    const target = files.find(f => f.id === id);
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }
    onFilesChange(files.filter((f) => f.id !== id));
    setErrorMsg(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    const newFiles = [...files];
    const [moved] = newFiles.splice(index, 1);
    newFiles.splice(targetIndex, 0, moved);
    onFilesChange(newFiles);
  };

  const clearAll = () => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    onFilesChange([]);
    setErrorMsg(null);
  };

  const getFileIcon = (mimeOrName: string) => {
    if (mimeOrName.includes('image')) return <ImageIcon className="h-5 w-5 text-indigo-500" />;
    return <FileText className="h-5 w-5 text-indigo-600" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-indigo-600 bg-indigo-50/50 scale-[1.005]'
            : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          onChange={handleFileInput}
          className="hidden"
          accept={acceptedTypes.join(',')}
          disabled={isProcessing}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-card border border-slate-200 group-hover:scale-105 transition-transform">
          <UploadCloud className="h-6 w-6 text-indigo-600" />
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-sm font-semibold text-slate-800">
            <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop files
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Supported: {acceptedTypesLabel} • Max file size: {formatBytes(maxSizeBytes)}
          </p>
        </div>
      </div>

      {/* Validation Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800 border border-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Selected Files ({files.length} / {maxFiles})
            </span>
            <button
              type="button"
              onClick={clearAll}
              disabled={isProcessing}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-subtle">
            {files.map((fileItem, idx) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 transition-colors hover:bg-slate-50/70"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  {fileItem.previewUrl ? (
                    <img
                      src={fileItem.previewUrl}
                      alt={fileItem.name}
                      className="h-10 w-10 rounded object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                      {getFileIcon(fileItem.type || fileItem.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{fileItem.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{formatBytes(fileItem.size)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {allowReorder && files.length > 1 && (
                    <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => moveFile(idx, 'up')}
                        disabled={idx === 0 || isProcessing}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(idx, 'down')}
                        disabled={idx === files.length - 1 || isProcessing}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFile(fileItem.id)}
                    disabled={isProcessing}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                    title="Remove File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
