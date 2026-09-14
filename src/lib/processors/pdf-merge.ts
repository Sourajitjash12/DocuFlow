import { PDFDocument, degrees } from 'pdf-lib';
import { DimensionScalingConfig, PageLayoutConfig, MarginBounds, PaperSizePreset } from '@/lib/types';
import { computeLayoutMetrics, hexToRgb } from './page-layout-engine';

export interface MergeFileInput {
  buffer: ArrayBuffer;
  name: string;
  rotation?: number;
}

export async function mergePdfFiles(
  files: MergeFileInput[],
  options: {
    margin?: number;
    margins?: MarginBounds;
    dimensionConfig?: DimensionScalingConfig;
    layoutConfig?: PageLayoutConfig;
  } = {}
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  const isPageLayout = !!options.layoutConfig;
  const marginVal = options.margin ?? 20;
  const margins: MarginBounds = options.margins || options.layoutConfig?.margins || {
    top: marginVal,
    bottom: marginVal,
    left: marginVal,
    right: marginVal,
  };

  const layoutConfig: PageLayoutConfig = isPageLayout
    ? options.layoutConfig!
    : {
        paperSize: (options.dimensionConfig?.preset as PaperSizePreset) || 'a4',
        marginPreset: 'standard',
        margins,
        orientation: 'auto',
        qualityMode: 'high',
        qualityPercentage: 90,
        scaleFactor: options.dimensionConfig?.scaleFactor || 1.0,
        customWidth: options.dimensionConfig?.customWidth,
        customHeight: options.dimensionConfig?.customHeight,
        backgroundType: 'white',
        backgroundColor: '#ffffff',
      };

  const bgColorRgb = hexToRgb(layoutConfig.backgroundColor);

  for (const item of files) {
    const srcPdf = await PDFDocument.load(item.buffer, { ignoreEncryption: true });
    const pageIndices = srcPdf.getPageIndices();

    for (const index of pageIndices) {
      const srcPage = srcPdf.getPage(index);
      const embeddedPage = await mergedPdf.embedPage(srcPage);

      const { pageWidth, pageHeight, drawWidth, drawHeight, x, y } = computeLayoutMetrics(
        embeddedPage.width,
        embeddedPage.height,
        layoutConfig
      );

      const page = mergedPdf.addPage([pageWidth, pageHeight]);

      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: bgColorRgb,
      });

      page.drawPage(embeddedPage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
        rotate: item.rotation ? degrees(item.rotation) : degrees(0),
      });
    }
  }

  return await mergedPdf.save({ useObjectStreams: true });
}
