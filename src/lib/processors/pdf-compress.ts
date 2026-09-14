import { PDFDocument } from 'pdf-lib';
import { DimensionScalingConfig, PageLayoutConfig } from '@/lib/types';
import { computeLayoutMetrics, hexToRgb } from './page-layout-engine';

export async function compressPdfFile(
  fileBuffer: ArrayBuffer,
  level: 'low' | 'medium' | 'high' = 'medium',
  dimensionConfig?: DimensionScalingConfig | PageLayoutConfig
): Promise<{ buffer: Uint8Array; originalSize: number; compressedSize: number }> {
  const originalSize = fileBuffer.byteLength;

  // Load PDF with pdf-lib
  const pdfDoc = await PDFDocument.load(fileBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Strip unnecessary metadata for compression
  if (level === 'high' || level === 'medium') {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('DocuFlow Engine');
    pdfDoc.setCreator('DocuFlow');
  }

  const compressedDoc = await PDFDocument.create();
  const pageIndices = pdfDoc.getPageIndices();

  // Normalize config
  const isPageLayout = 'paperSize' in (dimensionConfig || {});
  const layoutConfig: PageLayoutConfig = isPageLayout
    ? (dimensionConfig as PageLayoutConfig)
    : {
        paperSize: ((dimensionConfig as any)?.preset as any) || 'fit',
        marginPreset: 'none',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        orientation: 'auto',
        qualityMode: 'balanced',
        qualityPercentage: 80,
        scaleFactor: dimensionConfig?.scaleFactor || 1.0,
        customWidth: dimensionConfig?.customWidth,
        customHeight: dimensionConfig?.customHeight,
        backgroundType: 'white',
        backgroundColor: '#ffffff',
      };

  const isDefaultSizing =
    layoutConfig.paperSize === 'fit' &&
    layoutConfig.scaleFactor === 1.0 &&
    layoutConfig.margins.top === 0 &&
    layoutConfig.margins.bottom === 0 &&
    layoutConfig.margins.left === 0 &&
    layoutConfig.margins.right === 0;

  if (isDefaultSizing) {
    // Fast path: copy pages directly to clear orphaned streams
    const copiedPages = await compressedDoc.copyPages(pdfDoc, pageIndices);
    for (const page of copiedPages) {
      compressedDoc.addPage(page);
    }
  } else {
    // Dynamic Resizing & Safe Margin Bounds Engine
    const bgColorRgb = hexToRgb(layoutConfig.backgroundColor);

    for (const index of pageIndices) {
      const srcPage = pdfDoc.getPage(index);
      const embeddedPage = await compressedDoc.embedPage(srcPage);

      const { pageWidth, pageHeight, drawWidth, drawHeight, x, y } = computeLayoutMetrics(
        embeddedPage.width,
        embeddedPage.height,
        layoutConfig
      );

      const page = compressedDoc.addPage([pageWidth, pageHeight]);

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
      });
    }
  }

  // Save with stream compression options enabled
  const compressedBytes = await compressedDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return {
    buffer: compressedBytes,
    originalSize,
    compressedSize: compressedBytes.byteLength,
  };
}
