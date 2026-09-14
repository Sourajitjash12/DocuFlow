import sharp from 'sharp';
import { PageLayoutConfig, BackgroundType } from '@/lib/types';
import { computeLayoutMetrics } from './page-layout-engine';

export interface CompressImageOptions {
  outputFormat?: 'original' | 'jpeg' | 'png' | 'webp';
  layoutConfig?: Partial<PageLayoutConfig>;
}

export interface CompressImageResult {
  buffer: Uint8Array;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

/**
 * Parses background configuration into sharp color object
 */
function parseSharpBackground(
  backgroundType: BackgroundType = 'white',
  customHex?: string,
  isJpeg: boolean = false
): sharp.Color {
  if (backgroundType === 'black') {
    return { r: 0, g: 0, b: 0, alpha: 1 };
  }
  if (backgroundType === 'transparent') {
    if (isJpeg) {
      return { r: 255, g: 255, b: 255, alpha: 1 }; // JPEG fallback to clean white
    }
    return { r: 0, g: 0, b: 0, alpha: 0 };
  }
  if (backgroundType === 'custom' && customHex && customHex.startsWith('#')) {
    let hex = customHex.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 255;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 255;
    return { r, g, b, alpha: 1 };
  }

  return { r: 255, g: 255, b: 255, alpha: 1 };
}

/**
 * Dedicated High-Performance Image Compression Engine powered by sharp.
 * Handles Lanczos3 resampling, target dimension scaling, margin padding compositing,
 * format conversion, and 1-100% quality retention optimization.
 */
export async function compressImageFile(
  inputBuffer: ArrayBuffer | Buffer,
  options: CompressImageOptions = {}
): Promise<CompressImageResult> {
  const buffer = Buffer.isBuffer(inputBuffer) ? inputBuffer : Buffer.from(inputBuffer as ArrayBuffer);
  const originalSize = buffer.byteLength;

  const imagePipeline = sharp(buffer);
  const metadata = await imagePipeline.metadata();
  const srcW = metadata.width || 800;
  const srcH = metadata.height || 600;

  // Determine output format
  let targetFormat = options.outputFormat || 'original';
  if (targetFormat === 'original') {
    const fmt = metadata.format?.toLowerCase();
    if (fmt === 'png') targetFormat = 'png';
    else if (fmt === 'webp') targetFormat = 'webp';
    else targetFormat = 'jpeg';
  }

  // Normalize layout configuration
  const layoutConfig: PageLayoutConfig = {
    paperSize: options.layoutConfig?.paperSize || 'fit',
    marginPreset: options.layoutConfig?.marginPreset || 'none',
    margins: options.layoutConfig?.margins || { top: 0, bottom: 0, left: 0, right: 0 },
    orientation: options.layoutConfig?.orientation || 'auto',
    qualityMode: options.layoutConfig?.qualityMode || 'balanced',
    qualityPercentage: options.layoutConfig?.qualityPercentage ?? 80,
    scaleFactor: options.layoutConfig?.scaleFactor ?? 1.0,
    customWidth: options.layoutConfig?.customWidth,
    customHeight: options.layoutConfig?.customHeight,
    backgroundType: options.layoutConfig?.backgroundType || 'white',
    backgroundColor: options.layoutConfig?.backgroundColor || '#ffffff',
  };

  // Compute metrics (target canvas, safe margins, draw width/height, x/y offsets)
  const { pageWidth, pageHeight, drawWidth, drawHeight, x, y } = computeLayoutMetrics(
    srcW,
    srcH,
    layoutConfig
  );

  const targetW = Math.max(10, Math.round(pageWidth));
  const targetH = Math.max(10, Math.round(pageHeight));
  const scaledContentW = Math.max(1, Math.round(drawWidth));
  const scaledContentH = Math.max(1, Math.round(drawHeight));
  const leftPos = Math.max(0, Math.round(x));
  const topPos = Math.max(0, Math.round(y));

  // 1. Resample image with Lanczos3 filter for high sharpness retention
  const resizedBuffer = await imagePipeline
    .resize({
      width: scaledContentW,
      height: scaledContentH,
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
      fastShrinkOnLoad: false,
    })
    .toBuffer();

  // 2. Prepare background container canvas with selected color / transparency
  const isJpeg = targetFormat === 'jpeg';
  const sharpBackground = parseSharpBackground(
    layoutConfig.backgroundType,
    layoutConfig.backgroundColor,
    isJpeg
  );

  const canvas = sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: sharpBackground,
    },
  });

  // 3. Composite resampled content onto centered padding position
  let processedPipeline = canvas.composite([
    {
      input: resizedBuffer,
      left: leftPos,
      top: topPos,
    },
  ]);

  // 4. Encode with granular 1-100% quality slider mapping
  const quality = Math.min(100, Math.max(1, layoutConfig.qualityPercentage));
  let mimeType = 'image/jpeg';

  if (targetFormat === 'png') {
    mimeType = 'image/png';
    const compressionLevel = Math.min(9, Math.max(0, Math.floor((100 - quality) / 10)));
    processedPipeline = processedPipeline.png({
      quality,
      compressionLevel,
      palette: quality < 80,
    });
  } else if (targetFormat === 'webp') {
    mimeType = 'image/webp';
    processedPipeline = processedPipeline.webp({
      quality,
      lossless: quality === 100,
      smartSubsample: true,
    });
  } else {
    mimeType = 'image/jpeg';
    processedPipeline = processedPipeline.jpeg({
      quality,
      mozjpeg: true,
      chromaSubsampling: quality >= 90 ? '4:4:4' : '4:2:0',
    });
  }

  const outputBuffer = await processedPipeline.toBuffer();
  const compressedSize = outputBuffer.byteLength;

  // Calculate percentage reduction
  const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);
  const compressionRatio = reduction > 0 ? reduction : 0;

  return {
    buffer: new Uint8Array(outputBuffer),
    mimeType,
    originalSize,
    compressedSize,
    compressionRatio,
    width: targetW,
    height: targetH,
  };
}
