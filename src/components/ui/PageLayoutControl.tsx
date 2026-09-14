'use client';

import React, { useState, useMemo } from 'react';
import {
  Layout,
  Maximize2,
  Sliders,
  Lock,
  Unlock,
  Percent,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Square,
  Scaling,
  Link,
  Unlink,
  Palette,
  Gauge,
  CircleDot,
} from 'lucide-react';
import {
  PageLayoutConfig,
  PaperSizePreset,
  MarginPreset,
  QualityMode,
  MarginBounds,
  BackgroundType,
} from '@/lib/types';
import {
  PRESET_PAPER_DIMENSIONS,
  MARGIN_PRESETS,
  computeLayoutMetrics,
} from '@/lib/layout-math';

export interface PageLayoutControlProps {
  config: PageLayoutConfig;
  onChange: (newConfig: PageLayoutConfig) => void;
  title?: string;
  description?: string;
  sampleContentWidth?: number;
  sampleContentHeight?: number;
  showImageSpecificControls?: boolean;
}

export const PageLayoutControl: React.FC<PageLayoutControlProps> = ({
  config,
  onChange,
  title = 'Page Layout & Margin Configuration',
  description = 'Configure output page standard, dynamic margin safe boundaries, content scale-to-fit behavior, quality percentage, and margin background color.',
  sampleContentWidth = 600,
  sampleContentHeight = 800,
  showImageSpecificControls = true,
}) => {
  const [marginsLinked, setMarginsLinked] = useState<boolean>(true);

  // Helper for computing layout metrics for the live preview
  const metrics = useMemo(() => {
    return computeLayoutMetrics(sampleContentWidth, sampleContentHeight, config);
  }, [sampleContentWidth, sampleContentHeight, config]);

  // Handle Paper Size Selector change
  const handlePaperSizeChange = (paperSize: PaperSizePreset) => {
    let customWidth = config.customWidth || 595;
    let customHeight = config.customHeight || 842;

    if (paperSize in PRESET_PAPER_DIMENSIONS) {
      const preset = PRESET_PAPER_DIMENSIONS[paperSize as keyof typeof PRESET_PAPER_DIMENSIONS];
      customWidth = preset.width;
      customHeight = preset.height;
    }

    onChange({
      ...config,
      paperSize,
      customWidth,
      customHeight,
    });
  };

  // Handle Margin Preset selection
  const handleMarginPresetChange = (preset: MarginPreset) => {
    let margins: MarginBounds = { ...config.margins };

    if (preset in MARGIN_PRESETS) {
      margins = { ...MARGIN_PRESETS[preset as keyof typeof MARGIN_PRESETS].bounds };
    }

    onChange({
      ...config,
      marginPreset: preset,
      margins,
    });
  };

  // Handle Linked Uniform Margin slider update
  const handleUniformMarginChange = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    onChange({
      ...config,
      marginPreset: 'custom',
      margins: {
        top: clamped,
        bottom: clamped,
        left: clamped,
        right: clamped,
      },
    });
  };

  // Handle Per-Side Margin update
  const handleSingleMarginChange = (side: keyof MarginBounds, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    const updatedMargins = {
      ...config.margins,
      [side]: clamped,
    };

    onChange({
      ...config,
      marginPreset: 'custom',
      margins: updatedMargins,
    });
  };

  // Handle Quality Mode selection
  const handleQualityModeChange = (qualityMode: QualityMode) => {
    let qualityPercentage = config.qualityPercentage || 90;
    if (qualityMode === 'high') qualityPercentage = 95;
    if (qualityMode === 'balanced') qualityPercentage = 80;
    if (qualityMode === 'max_compression') qualityPercentage = 60;

    onChange({
      ...config,
      qualityMode,
      qualityPercentage,
    });
  };

  // Handle 1-100% Quality Slider adjustment
  const handleQualityPercentageChange = (qualityPercentage: number) => {
    const clamped = Math.max(1, Math.min(100, qualityPercentage));
    let qualityMode: QualityMode = config.qualityMode;

    if (clamped >= 90) qualityMode = 'high';
    else if (clamped >= 70) qualityMode = 'balanced';
    else qualityMode = 'max_compression';

    onChange({
      ...config,
      qualityPercentage: clamped,
      qualityMode,
    });
  };

  // Handle Background Type change (White, Black, Transparent, Custom)
  const handleBackgroundTypeChange = (backgroundType: BackgroundType) => {
    let backgroundColor = config.backgroundColor || '#ffffff';
    if (backgroundType === 'white') backgroundColor = '#ffffff';
    if (backgroundType === 'black') backgroundColor = '#000000';
    if (backgroundType === 'transparent') backgroundColor = 'transparent';

    onChange({
      ...config,
      backgroundType,
      backgroundColor,
    });
  };

  // Handle Custom Hex Color Picker
  const handleCustomColorChange = (hex: string) => {
    onChange({
      ...config,
      backgroundType: 'custom',
      backgroundColor: hex,
    });
  };

  // Handle Orientation
  const handleOrientationChange = (orientation: 'portrait' | 'landscape' | 'auto') => {
    onChange({
      ...config,
      orientation,
    });
  };

  // Scaling Factor slider change
  const handleScaleFactorChange = (newScale: number) => {
    const clamped = Math.max(0.25, Math.min(2.0, newScale));
    onChange({
      ...config,
      scaleFactor: Math.round(clamped * 100) / 100,
    });
  };

  // Custom Width / Height Inputs
  const handleCustomWidthChange = (val: number) => {
    const newW = Math.max(50, val || 50);
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

  const handleCustomHeightChange = (val: number) => {
    const newH = Math.max(50, val || 50);
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

  // Determine actual canvas color for live preview
  const getCanvasPreviewBgStyle = () => {
    if (config.backgroundType === 'transparent') {
      return {
        backgroundImage:
          'repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%)',
        backgroundPosition: '0 0, 8px 8px',
        backgroundSize: '16px 16px',
      };
    }
    if (config.backgroundType === 'black') {
      return { backgroundColor: '#000000' };
    }
    if (config.backgroundType === 'custom') {
      return { backgroundColor: config.backgroundColor || '#ffffff' };
    }
    return { backgroundColor: '#ffffff' };
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Layout className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white shadow-xs">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          Lanczos3 & Safe Scaling Engine
        </span>
      </div>

      {/* Main Grid: Left Controls & Right Live Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Options Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Paper Size & Format Dropdown / Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scaling className="h-4 w-4 text-indigo-600" />
                Target Paper Size & Format Standard
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">
                Dropdown & Fast Presets
              </span>
            </label>

            {/* Dropdown Selector */}
            <select
              value={config.paperSize}
              onChange={(e) => handlePaperSizeChange(e.target.value as PaperSizePreset)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition-all focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-xs"
            >
              <option value="a4">A4 Standard (210 × 297 mm / 595 × 842 pt)</option>
              <option value="a5">A5 Compact (148 × 210 mm / 420 × 595 pt)</option>
              <option value="letter">US Letter (8.5 × 11 in / 612 × 792 pt)</option>
              <option value="legal">US Legal (8.5 × 14 in / 612 × 1008 pt)</option>
              <option value="fit">Auto-Fit / Original Material Size (Dynamic Aspect Ratio)</option>
              <option value="custom">Custom Canvas Dimensions (Explicit W × H)</option>
            </select>

            {/* Quick Button Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'a4', label: 'A4 Standard', desc: '595 × 842 pt' },
                { id: 'a5', label: 'A5 Compact', desc: '420 × 595 pt' },
                { id: 'letter', label: 'US Letter', desc: '612 × 792 pt' },
                { id: 'legal', label: 'US Legal', desc: '612 × 1008 pt' },
                { id: 'fit', label: 'Auto-Fit', desc: 'Original ratio' },
                { id: 'custom', label: 'Custom', desc: 'Explicit W × H' },
              ].map((item) => {
                const isSelected = config.paperSize === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePaperSizeChange(item.id as PaperSizePreset)}
                    className={`rounded-lg border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{item.label}</span>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom Explicit Dimension Inputs (if paperSize === 'custom') */}
            {config.paperSize === 'custom' && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
                    Custom Canvas Dimensions (Points / Pixels)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...config, maintainAspectRatio: !config.maintainAspectRatio })
                    }
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                      config.maintainAspectRatio
                        ? 'border-indigo-300 bg-indigo-100 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {config.maintainAspectRatio ? (
                      <>
                        <Lock className="h-3 w-3" /> Ratio Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3" /> Lock Ratio
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Width (pt / px)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="5000"
                      value={config.customWidth || 595}
                      onChange={(e) => handleCustomWidthChange(parseFloat(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Height (pt / px)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="5000"
                      value={config.customHeight || 842}
                      onChange={(e) => handleCustomHeightChange(parseFloat(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Margin Controls & Presets */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Square className="h-4 w-4 text-indigo-600" />
                Page Safe Margins (None, Compact, Standard, Wide, Custom)
              </label>

              <button
                type="button"
                onClick={() => setMarginsLinked(!marginsLinked)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                title={marginsLinked ? 'Unlink margins for custom per-side control' : 'Link all margins uniformly'}
              >
                {marginsLinked ? (
                  <>
                    <Link className="h-3 w-3" /> Uniform Margins
                  </>
                ) : (
                  <>
                    <Unlink className="h-3 w-3" /> Per-Side Margins
                  </>
                )}
              </button>
            </div>

            {/* Margin Preset Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'None (0px)', desc: 'Full Bleed' },
                { id: 'compact', label: 'Compact (10px)', desc: '10pt margins' },
                { id: 'standard', label: 'Standard (20px)', desc: '20pt margins' },
                { id: 'wide', label: 'Wide (40px)', desc: '40pt margins' },
              ].map((m) => {
                const isSelected = config.marginPreset === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMarginPresetChange(m.id as MarginPreset)}
                    className={`rounded-lg border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{m.label}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{m.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom Margin Sliders */}
            {marginsLinked ? (
              /* Uniform Single Slider */
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Uniform Margin Size:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {config.margins.top} pt / px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="2"
                  value={config.margins.top}
                  onChange={(e) => handleUniformMarginChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            ) : (
              /* Per-Side Top / Bottom / Left / Right Sliders */
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 grid grid-cols-2 gap-3.5">
                {(['top', 'bottom', 'left', 'right'] as (keyof MarginBounds)[]).map((side) => (
                  <div key={side} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold capitalize text-slate-700">{side} Margin:</span>
                      <span className="font-mono font-bold text-indigo-700">
                        {config.margins[side]} pt
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="2"
                      value={config.margins[side]}
                      onChange={(e) => handleSingleMarginChange(side, parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Margin Background Color Selection (White, Black, Transparent, Custom) */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-indigo-600" />
                Margin & Canvas Background Color
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">
                Solid vs Transparent
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'white', label: 'White', color: '#ffffff', border: 'border-slate-300' },
                { id: 'black', label: 'Black', color: '#000000', border: 'border-slate-800' },
                { id: 'transparent', label: 'Transparent', color: 'transparent', border: 'border-slate-300' },
                { id: 'custom', label: 'Custom Hex', color: config.backgroundColor || '#4f46e5', border: 'border-indigo-400' },
              ].map((bg) => {
                const isSelected = config.backgroundType === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => handleBackgroundTypeChange(bg.id as BackgroundType)}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-600 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {/* Color Swatch Circle */}
                    <div
                      className={`h-4 w-4 rounded-full border ${bg.border} shadow-xs flex-shrink-0 relative overflow-hidden`}
                      style={
                        bg.id === 'transparent'
                          ? {
                              backgroundImage:
                                'repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%)',
                              backgroundSize: '8px 8px',
                            }
                          : { backgroundColor: bg.color }
                      }
                    />
                    <span className="text-xs font-bold truncate">{bg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color Picker Input */}
            {config.backgroundType === 'custom' && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-indigo-600" />
                  Select Custom Color Hex:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor || '#ffffff'}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-slate-300 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor || '#ffffff'}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-bold text-slate-800 uppercase focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Granular 1-100% Quality & Compression Slider */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-indigo-600" />
                Quality & Compression Retention Slider (1–100%)
              </label>

              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {config.qualityPercentage || 90}% Quality
              </span>
            </div>

            {/* Range Slider */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>1% (Max Compression)</span>
                <span className="font-semibold text-slate-700">
                  {config.qualityPercentage || 90}% (Sharpness / Density)
                </span>
                <span>100% (Lossless / Original)</span>
              </div>

              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={config.qualityPercentage || 90}
                onChange={(e) => handleQualityPercentageChange(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between pt-1 gap-1 text-[10px]">
                {[
                  { pct: 60, label: '60% (Web Size)' },
                  { pct: 80, label: '80% (Balanced)' },
                  { pct: 95, label: '95% (High Quality)' },
                  { pct: 100, label: '100% (Lossless)' },
                ].map((qBtn) => {
                  const isMatch = Math.abs((config.qualityPercentage || 90) - qBtn.pct) <= 2;
                  return (
                    <button
                      key={qBtn.pct}
                      type="button"
                      onClick={() => handleQualityPercentageChange(qBtn.pct)}
                      className={`px-2 py-1 rounded transition-colors ${
                        isMatch
                          ? 'bg-indigo-600 font-bold text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {qBtn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Page Orientation & Scale Factor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-indigo-600" /> Page Orientation
              </label>
              <select
                value={config.orientation}
                onChange={(e) => handleOrientationChange(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-xs"
              >
                <option value="auto">Auto (Detect Landscape / Portrait)</option>
                <option value="portrait">Portrait Mode</option>
                <option value="landscape">Landscape Mode</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-indigo-600" /> Scale Multiplier
                </label>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {Math.round(config.scaleFactor * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.25"
                max="2.0"
                step="0.05"
                value={config.scaleFactor}
                onChange={(e) => handleScaleFactorChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Right Live Interactive Visual Bounding Box Canvas Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-900 p-5 text-white shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" /> Safe Margin & Layout Preview
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Lanczos3 Engine
            </span>
          </div>

          {/* Interactive Bounding Box Render with Dynamic Background */}
          <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-950/80 p-4 border border-slate-800">
            {/* Outer Canvas Container (Page Outer Bounds) */}
            <div
              className="relative flex items-center justify-center transition-all duration-300 shadow-2xl rounded border border-slate-700 overflow-hidden"
              style={{
                width: `${Math.min(180, (metrics.pageWidth / Math.max(metrics.pageWidth, metrics.pageHeight)) * 200)}px`,
                height: `${Math.min(220, (metrics.pageHeight / Math.max(metrics.pageWidth, metrics.pageHeight)) * 200)}px`,
                ...getCanvasPreviewBgStyle(),
              }}
            >
              {/* Dashed Safe Margin Bounding Box */}
              <div
                className="absolute border-2 border-dashed border-indigo-500/80 flex items-center justify-center transition-all duration-300 rounded-xs bg-indigo-500/5"
                style={{
                  top: `${(config.margins.top / metrics.pageHeight) * 100}%`,
                  bottom: `${(config.margins.bottom / metrics.pageHeight) * 100}%`,
                  left: `${(config.margins.left / metrics.pageWidth) * 100}%`,
                  right: `${(config.margins.right / metrics.pageWidth) * 100}%`,
                }}
              >
                {/* Scaled Content Box Centered Inside Safe Margins */}
                <div
                  className="relative flex items-center justify-center rounded bg-indigo-600 text-white font-bold text-[9px] shadow-md border border-indigo-400/50 transition-all duration-300 overflow-hidden"
                  style={{
                    width: `${Math.max(10, (metrics.drawWidth / metrics.availableWidth) * 100)}%`,
                    height: `${Math.max(10, (metrics.drawHeight / metrics.availableHeight) * 100)}%`,
                  }}
                >
                  <div className="text-center p-1 leading-tight">
                    <p className="font-extrabold text-[10px]">CONTENT</p>
                    <p className="text-[8px] font-mono opacity-80">{Math.round(metrics.drawWidth)}×{Math.round(metrics.drawHeight)} pt</p>
                  </div>
                </div>
              </div>

              {/* Page Paper Label */}
              <span className="absolute bottom-1 right-1 font-mono text-[8px] text-slate-800 font-bold px-1 rounded bg-white/80 border border-slate-300">
                {config.paperSize.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Engine Dimension Metrics Log */}
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2 text-[11px] font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Canvas Dimensions:</span>
              <span className="font-bold text-slate-200">
                {metrics.pageWidth} × {metrics.pageHeight} pt
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Safe Drawing Box:</span>
              <span className="font-bold text-indigo-400">
                {metrics.availableWidth} × {metrics.availableHeight} pt
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Resampling Quality:</span>
              <span className="font-bold text-emerald-400">
                Lanczos3 @ {config.qualityPercentage || 90}%
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center leading-relaxed">
            Formula: <code className="text-indigo-300">availableW = pageWidth - (left + right)</code>
            <br />
            <code className="text-indigo-300">availableH = pageHeight - (top + bottom)</code>
          </div>
        </div>
      </div>
    </div>
  );
};
