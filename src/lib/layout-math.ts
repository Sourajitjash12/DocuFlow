import {
  PaperSizePreset,
  MarginPreset,
  MarginBounds,
  PageLayoutConfig,
  QualityMode,
  BackgroundType,
} from '@/lib/types';

export const PRESET_PAPER_DIMENSIONS: Record<
  Exclude<PaperSizePreset, 'fit' | 'custom'>,
  { width: number; height: number; name: string; desc: string }
> = {
  a4: { width: 595.28, height: 841.89, name: 'A4 Standard', desc: '210 × 297 mm' },
  a5: { width: 419.53, height: 595.28, name: 'A5 Compact', desc: '148 × 210 mm' },
  letter: { width: 612.0, height: 792.0, name: 'US Letter', desc: '8.5 × 11 in' },
  legal: { width: 612.0, height: 1008.0, name: 'US Legal', desc: '8.5 × 14 in' },
};

export const MARGIN_PRESETS: Record<
  Exclude<MarginPreset, 'custom'>,
  { label: string; desc: string; bounds: MarginBounds }
> = {
  none: { label: 'None (0px)', desc: '0pt margin', bounds: { top: 0, bottom: 0, left: 0, right: 0 } },
  compact: { label: 'Compact (10px)', desc: '10pt margins', bounds: { top: 10, bottom: 10, left: 10, right: 10 } },
  standard: { label: 'Standard (20px)', desc: '20pt margins', bounds: { top: 20, bottom: 20, left: 20, right: 20 } },
  wide: { label: 'Wide (40px)', desc: '40pt margins', bounds: { top: 40, bottom: 40, left: 40, right: 40 } },
};

export const DEFAULT_PAGE_LAYOUT_CONFIG: PageLayoutConfig = {
  paperSize: 'a4',
  marginPreset: 'standard',
  margins: { top: 20, bottom: 20, left: 20, right: 20 },
  orientation: 'auto',
  qualityMode: 'high',
  qualityPercentage: 90,
  scaleFactor: 1.0,
  backgroundType: 'white',
  backgroundColor: '#ffffff',
};

/**
 * Calculates page dimensions (pageWidth, pageHeight) considering paper size, custom width/height, orientation, and scale factor multiplier.
 */
export function calculatePageDimensions(
  contentWidth: number,
  contentHeight: number,
  config: PageLayoutConfig
): { pageWidth: number; pageHeight: number } {
  let baseW = PRESET_PAPER_DIMENSIONS.a4.width;
  let baseH = PRESET_PAPER_DIMENSIONS.a4.height;

  if (config.paperSize in PRESET_PAPER_DIMENSIONS) {
    const preset = PRESET_PAPER_DIMENSIONS[config.paperSize as keyof typeof PRESET_PAPER_DIMENSIONS];
    baseW = preset.width;
    baseH = preset.height;
  } else if (config.paperSize === 'fit') {
    baseW = contentWidth;
    baseH = contentHeight;
  } else if (config.paperSize === 'custom' && config.customWidth && config.customHeight) {
    baseW = config.customWidth;
    baseH = config.customHeight;
  }

  // Handle Orientation swap (portrait vs landscape vs auto)
  if (config.paperSize !== 'fit') {
    if (
      config.orientation === 'landscape' ||
      (config.orientation === 'auto' && contentWidth > contentHeight)
    ) {
      if (baseW < baseH) {
        const temp = baseW;
        baseW = baseH;
        baseH = temp;
      }
    } else if (config.orientation === 'portrait') {
      if (baseW > baseH) {
        const temp = baseW;
        baseW = baseH;
        baseH = temp;
      }
    }
  }

  const scaleMultiplier = config.scaleFactor || 1.0;
  return {
    pageWidth: Math.round(baseW * scaleMultiplier * 100) / 100,
    pageHeight: Math.round(baseH * scaleMultiplier * 100) / 100,
  };
}

/**
 * Calculates available canvas drawing space after subtracting margins:
 * availableWidth = pageWidth - (leftMargin + rightMargin)
 * availableHeight = pageHeight - (topMargin + bottomMargin)
 */
export function calculateAvailableSpace(
  pageWidth: number,
  pageHeight: number,
  margins: MarginBounds
): { availableWidth: number; availableHeight: number } {
  const left = Math.max(0, margins.left);
  const right = Math.max(0, margins.right);
  const top = Math.max(0, margins.top);
  const bottom = Math.max(0, margins.bottom);

  const availableWidth = Math.max(10, pageWidth - (left + right));
  const availableHeight = Math.max(10, pageHeight - (top + bottom));

  return {
    availableWidth: Math.round(availableWidth * 100) / 100,
    availableHeight: Math.round(availableHeight * 100) / 100,
  };
}

/**
 * Scales incoming content dimensions using strict aspect ratio preservation (scaleToFit within available bounding box).
 */
export function scaleContentToFit(
  contentWidth: number,
  contentHeight: number,
  availableWidth: number,
  availableHeight: number
): { drawWidth: number; drawHeight: number; scale: number } {
  if (contentWidth <= 0 || contentHeight <= 0) {
    return { drawWidth: availableWidth, drawHeight: availableHeight, scale: 1 };
  }

  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY);

  return {
    drawWidth: Math.round(contentWidth * scale * 100) / 100,
    drawHeight: Math.round(contentHeight * scale * 100) / 100,
    scale,
  };
}

/**
 * Calculates precise coordinates to center content inside specified margins:
 * x = leftMargin + (availableWidth - drawWidth) / 2
 * y = bottomMargin + (availableHeight - drawHeight) / 2
 */
export function calculateCenteredPosition(
  margins: MarginBounds,
  availableWidth: number,
  availableHeight: number,
  drawWidth: number,
  drawHeight: number
): { x: number; y: number } {
  const x = margins.left + (availableWidth - drawWidth) / 2;
  const y = margins.bottom + (availableHeight - drawHeight) / 2;

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
  };
}

/**
 * Smart layout calculator result helper for UI preview & rendering logic
 */
export function computeLayoutMetrics(
  contentWidth: number,
  contentHeight: number,
  config: PageLayoutConfig
) {
  const { pageWidth, pageHeight } = calculatePageDimensions(contentWidth, contentHeight, config);
  const { availableWidth, availableHeight } = calculateAvailableSpace(pageWidth, pageHeight, config.margins);
  const { drawWidth, drawHeight, scale } = scaleContentToFit(contentWidth, contentHeight, availableWidth, availableHeight);
  const { x, y } = calculateCenteredPosition(config.margins, availableWidth, availableHeight, drawWidth, drawHeight);

  return {
    pageWidth,
    pageHeight,
    availableWidth,
    availableHeight,
    drawWidth,
    drawHeight,
    scale,
    x,
    y,
  };
}
