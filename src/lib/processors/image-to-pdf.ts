import { PDFDocument } from 'pdf-lib';
import { PageLayoutConfig, MarginBounds, PaperSizePreset, QualityMode } from '@/lib/types';
import {
  computeLayoutMetrics,
  hexToRgb,
  DEFAULT_PAGE_LAYOUT_CONFIG,
} from './page-layout-engine';

export interface ImageToPdfOptions {
  pageSize?: PaperSizePreset;
  paperSize?: PaperSizePreset;
  orientation?: 'portrait' | 'landscape' | 'auto';
  margin?: number; // legacy uniform margin in points
  margins?: MarginBounds; // per-side margin bounds
  scaleFactor?: number;
  customWidth?: number;
  customHeight?: number;
  qualityMode?: QualityMode;
  backgroundColor?: string;
  layoutConfig?: PageLayoutConfig;
}

export async function convertImagesToPdf(
  images: { buffer: ArrayBuffer; mimeType: string; width?: number; height?: number }[],
  options: ImageToPdfOptions = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Consolidate options into a normalized PageLayoutConfig
  const paperSize: PaperSizePreset = options.paperSize || options.pageSize || options.layoutConfig?.paperSize || 'a4';
  const marginVal = options.margin !== undefined ? options.margin : 20;
  const margins: MarginBounds = options.margins || options.layoutConfig?.margins || {
    top: marginVal,
    bottom: marginVal,
    left: marginVal,
    right: marginVal,
  };
  const orientation = options.orientation || options.layoutConfig?.orientation || 'auto';
  const qualityMode = options.qualityMode || options.layoutConfig?.qualityMode || 'high';
  const scaleFactor = options.scaleFactor ?? options.layoutConfig?.scaleFactor ?? 1.0;
  const customWidth = options.customWidth ?? options.layoutConfig?.customWidth;
  const customHeight = options.customHeight ?? options.layoutConfig?.customHeight;
  const backgroundColor = options.backgroundColor || options.layoutConfig?.backgroundColor || '#ffffff';

  const config: PageLayoutConfig = {
    paperSize,
    marginPreset: options.layoutConfig?.marginPreset || 'standard',
    margins,
    orientation,
    qualityMode,
    qualityPercentage: options.layoutConfig?.qualityPercentage ?? 85,
    scaleFactor,
    customWidth,
    customHeight,
    backgroundType: options.layoutConfig?.backgroundType || 'white',
    backgroundColor,
  };

  const bgColorRgb = hexToRgb(backgroundColor);

  for (const imgData of images) {
    let embedImg;
    if (imgData.mimeType.includes('png')) {
      embedImg = await pdfDoc.embedPng(imgData.buffer);
    } else {
      // JPEG or WebP converted buffer
      embedImg = await pdfDoc.embedJpg(imgData.buffer);
    }

    const { pageWidth, pageHeight, drawWidth, drawHeight, x, y } = computeLayoutMetrics(
      embedImg.width,
      embedImg.height,
      config
    );

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Fill background color cleanly
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: bgColorRgb,
    });

    // Draw scaled image centered inside specified safe margin bounding box
    page.drawImage(embedImg, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  // Save PDF document with object stream compression based on quality mode
  const useObjectStreams = qualityMode !== 'high';
  return await pdfDoc.save({ useObjectStreams });
}
