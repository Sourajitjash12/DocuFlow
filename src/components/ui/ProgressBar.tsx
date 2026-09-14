'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  statusText?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, statusText, className }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {statusText && (
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <span>{statusText}</span>
          <span className="font-mono text-slate-900 font-semibold">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
