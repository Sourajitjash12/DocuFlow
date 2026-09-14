import sharp from 'sharp';
import { PageLayoutConfig, BackgroundType } from '@/lib/types';
import {
  computeLayoutMetrics,
  calculatePageDimensions,
  calculateAvailableSpace,
  scaleContentToFit,
  calculateCenteredPosition,
} from './page-layout-engine';

export interface ProcessStandaloneImageOptions {
  outputFormat?: 'jpeg' | 'png' | 'webp';
  layoutConfig?: Partial<PageLayoutConfig>;
}

export interface ProcessStandaloneImageResult {
  buffer: Uint8Array;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * Helper to parse background color configuration into sharp RGBA object
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
      // JPEG does not support alpha transparency, fall back to clean white
      return { r: 255, g: 255, b: 255, alpha: 1 };
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

  // Default white background
  return { r: 255, g: 255, b: 255, alpha: 1 };
}

/**
 * Standalone Image Processor powered by sharp.
 * Applies high-fidelity Lanczos3 kernel resampling, safe margin canvas padding,
 * background compositing, and 1-100% quality retention output encoding.
 */
export async function processStandaloneImage(
  inputBuffer: ArrayBuffer | Buffer,
  options: ProcessStandaloneImageOptions = {}
): Promise<ProcessStandaloneImageResult> {
  const buffer = Buffer.isBuffer(inputBuffer) ? inputBuffer : Buffer.from(inputBuffer as ArrayBuffer);
  const outputFormat = options.outputFormat || 'jpeg';

  // Normalize layout configuration
  const layoutConfig: PageLayoutConfig = {
    paperSize: options.layoutConfig?.paperSize || 'a4',
    marginPreset: options.layoutConfig?.marginPreset || 'standard',
    margins: options.layoutConfig?.margins || { top: 20, bottom: 20, left: 20, right: 20 },
    orientation: options.layoutConfig?.orientation || 'auto',
    qualityMode: options.layoutConfig?.qualityMode || 'high',
    qualityPercentage: options.layoutConfig?.qualityPercentage ?? 90,
    scaleFactor: options.layoutConfig?.scaleFactor ?? 1.0,
    customWidth: options.layoutConfig?.customWidth,
    customHeight: options.layoutConfig?.customHeight,
    backgroundType: options.layoutConfig?.backgroundType || 'white',
    backgroundColor: options.layoutConfig?.backgroundColor || '#ffffff',
  };

  // Inspect source image dimensions
  const imagePipeline = sharp(buffer);
  const metadata = await imagePipeline.metadata();
  const srcW = metadata.width || 800;
  const srcH = metadata.height || 600;

  // Calculate page target metrics & safe margin bounding box
  const { pageWidth, pageHeight, availableWidth, availableHeight, drawWidth, drawHeight, x, y } =
    computeLayoutMetrics(srcW, srcH, layoutConfig);

  const targetW = Math.max(10, Math.round(pageWidth));
  const targetH = Math.max(10, Math.round(pageHeight));
  const scaledContentW = Math.max(1, Math.round(drawWidth));
  const scaledContentH = Math.max(1, Math.round(drawHeight));
  const leftPos = Math.max(0, Math.round(x));
  const topPos = Math.max(0, Math.round(y));

  // 1. Resize incoming image using Lanczos3 resampling kernel for maximum sharpness & quality retention
  const resizedBuffer = await imagePipeline
    .resize({
      width: scaledContentW,
      height: scaledContentH,
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
      fastShrinkOnLoad: false,
    })
    .toBuffer();

  // 2. Create blank background canvas of target dimensions with selected background color / transparency
  const isJpeg = outputFormat === 'jpeg';
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

  // 3. Composite scaled image onto centered safe margin coordinates
  let processedPipeline = canvas.composite([
    {
      input: resizedBuffer,
      left: leftPos,
      top: topPos,
    },
  ]);

  // 4. Encode output format mapping 1-100% quality slider directly
  const quality = Math.min(100, Math.max(1, layoutConfig.qualityPercentage));

  let mimeType = 'image/jpeg';
  if (outputFormat === 'png') {
    mimeType = 'image/png';
    const compressionLevel = Math.min(9, Math.max(0, Math.floor((100 - quality) / 10)));
    processedPipeline = processedPipeline.png({
      quality,
      compressionLevel,
      palette: false,
    });
  } else if (outputFormat === 'webp') {
    mimeType = 'image/webp';
    processedPipeline = processedPipeline.webp({
      quality,
      lossless: quality === 100,
    });
  } else {
    // Default JPEG format
    mimeType = 'image/jpeg';
    processedPipeline = processedPipeline.jpeg({
      quality,
      mozjpeg: true,
      chromaSubsampling: quality >= 90 ? '4:4:4' : '4:2:0',
    });
  }

  const outputBuffer = await processedPipeline.toBuffer();

  return {
    buffer: new Uint8Array(outputBuffer),
    mimeType,
    width: targetW,
    height: targetH,
  };
}
