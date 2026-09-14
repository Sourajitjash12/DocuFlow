'use client';

import React from 'react';
import { Maximize2, Sliders, Lock, Unlock, Percent, LayoutGrid } from 'lucide-react';
import { DimensionScalingConfig, DimensionPreset } from '@/lib/types';

export interface DimensionScalingControlProps {
  config: DimensionScalingConfig;
  onChange: (newConfig: DimensionScalingConfig) => void;
  title?: string;
  description?: string;
}

export const PRESET_DIMENSIONS: Record<Exclude<DimensionPreset, 'fit' | 'custom'>, { name: string; width: number; height: number; desc: string }> = {
  a4: { name: 'A4 Standard', width: 595.28, height: 841.89, desc: '210 × 297 mm (ISO standard)' },
  a5: { name: 'A5 Booklet', width: 419.53, height: 595.28, desc: '148 × 210 mm (Compact)' },
  letter: { name: 'US Letter', width: 612.0, height: 792.0, desc: '8.5 × 11 in (US Standard)' },
  a3: { name: 'A3 Poster', width: 841.89, height: 1190.55, desc: '297 × 420 mm (Large format)' },
  legal: { name: 'US Legal', width: 612.0, height: 1008.0, desc: '8.5 × 14 in (Legal document)' },
};

export const DimensionScalingControl: React.FC<DimensionScalingControlProps> = ({
  config,
  onChange,
  title = 'Dimension & Scaling Controls',
  description = 'Explicitly configure document page standard, scale factor multiplier, or custom pixel/point dimensions before processing.',
}) => {
  const handlePresetChange = (preset: DimensionPreset) => {
    let customWidth = config.customWidth || 595;
    let customHeight = config.customHeight || 842;

    if (preset in PRESET_DIMENSIONS) {
      const target = PRESET_DIMENSIONS[preset as keyof typeof PRESET_DIMENSIONS];
      customWidth = target.width;
      customHeight = target.height;
    }

    onChange({
      ...config,
      preset,
      customWidth,
      customHeight,
    });
  };

  const handleScaleFactorChange = (newScale: number) => {
    const clamped = Math.max(0.25, Math.min(2.0, newScale));
    onChange({
      ...config,
      scaleFactor: Math.round(clamped * 100) / 100,
    });
  };

  const handleWidthChange = (val: number) => {
    const newW = Math.max(10, val || 0);
    let newH = config.customHeight || 842;
    if (config.maintainAspectRatio && config.customWidth && config.customHeight) {
      const ratio = config.customHeight / config.customWidth;
      newH = Math.round(newW * ratio);
    }

    onChange({
      ...config,
      customWidth: newW,
      customHeight: newH,
    });
  };

  const handleHeightChange = (val: number) => {
    const newH = Math.max(10, val || 0);
    let newW = config.customWidth || 595;
    if (config.maintainAspectRatio && config.customWidth && config.customHeight) {
      const ratio = config.customWidth / config.customHeight;
      newW = Math.round(newH * ratio);
    }

    onChange({
      ...config,
      customWidth: newW,
      customHeight: newH,
    });
  };

  const toggleAspectLock = () => {
    onChange({
      ...config,
      maintainAspectRatio: !config.maintainAspectRatio,
    });
  };

  // Helper to calculate target preview display string
  const getPreviewDimensions = () => {
    const scalePct = Math.round(config.scaleFactor * 100);
    let baseW = 595;
    let baseH = 842;
    let name = 'Custom';

    if (config.preset === 'fit') {
      return `Original Content Aspect Ratio (${scalePct}% Scale Multiplier)`;
    }

    if (config.preset in PRESET_DIMENSIONS) {
      const p = PRESET_DIMENSIONS[config.preset as keyof typeof PRESET_DIMENSIONS];
      baseW = p.width;
      baseH = p.height;
      name = p.name;
    } else if (config.customWidth && config.customHeight) {
      baseW = config.customWidth;
      baseH = config.customHeight;
    }

    const effW = Math.round(baseW * config.scaleFactor);
    const effH = Math.round(baseH * config.scaleFactor);

    return `${name} - Target Canvas: ${effW} × ${effH} pt (${Math.round((effW / 72) * 25.4)} × ${Math.round((effH / 72) * 25.4)} mm @ ${scalePct}%)`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5 shadow-subtle">
      {/* Control Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
          Dynamic Sizing
        </span>
      </div>

      <p className="text-xs text-slate-500">{description}</p>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5 text-slate-500" />
          Target Canvas Format Preset
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'a4', label: 'A4 Standard', desc: '595 × 842 pt' },
            { id: 'letter', label: 'US Letter', desc: '612 × 792 pt' },
            { id: 'a3', label: 'A3 Format', desc: '842 × 1191 pt' },
            { id: 'legal', label: 'US Legal', desc: '612 × 1008 pt' },
            { id: 'fit', label: 'Original / Fit', desc: 'Preserve input ratio' },
            { id: 'custom', label: 'Custom Sizing', desc: 'Explicit W × H' },
          ].map((preset) => {
            const isSelected = config.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id as DimensionPreset)}
                className={`rounded-lg border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 text-slate-900'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-bold">{preset.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{preset.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Dimensions Inputs (Visible only when preset === 'custom') */}
      {config.preset === 'custom' && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
              Custom Explicit Points (1 pt = 1/72 inch)
            </span>
            <button
              type="button"
              onClick={toggleAspectLock}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border transition-colors ${
                config.maintainAspectRatio
                  ? 'border-indigo-300 bg-indigo-100 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
              }`}
            >
              {config.maintainAspectRatio ? (
                <>
                  <Lock className="h-3 w-3" /> Aspect Locked
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" /> Lock Aspect Ratio
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Width (pt / px)</label>
              <input
                type="number"
                min="50"
                max="5000"
                value={config.customWidth || 595}
                onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Height (pt / px)</label>
              <input
                type="number"
                min="50"
                max="5000"
                value={config.customHeight || 842}
                onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Scaling Factor Slider */}
      <div className="space-y-2.5 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-indigo-600" />
            Scaling Modifier (Compress / Expand Multiplier)
          </label>
          <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-mono font-bold text-white">
            {Math.round(config.scaleFactor * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0.25"
            max="2.0"
            step="0.05"
            value={config.scaleFactor}
            onChange={(e) => handleScaleFactorChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Quick Scale Buttons */}
        <div className="flex items-center justify-between text-[10px]">
          {[
            { pct: 50, label: '50% (Shrink)' },
            { pct: 75, label: '75%' },
            { pct: 100, label: '100% (Original)' },
            { pct: 125, label: '125%' },
            { pct: 150, label: '150% (Expand)' },
          ].map((btn) => {
            const factor = btn.pct / 100;
            const isMatch = Math.abs(config.scaleFactor - factor) < 0.02;
            return (
              <button
                key={btn.pct}
                type="button"
                onClick={() => handleScaleFactorChange(factor)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  isMatch
                    ? 'bg-indigo-600 font-bold text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Preview Calculation Card */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] flex items-center justify-between text-slate-600 font-medium">
        <span>Target Sizing Preview:</span>
        <span className="font-mono font-bold text-indigo-700">{getPreviewDimensions()}</span>
      </div>
    </div>
  );
};
