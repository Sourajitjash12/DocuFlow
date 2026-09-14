import { PDFDocument, rgb, degrees, PDFPage, PDFImage } from 'pdf-lib';
export * from '@/lib/layout-math';

/**
 * Helper to parse hex string into pdf-lib RGB color
 */
export function hexToRgb(hexColor?: string) {
  if (!hexColor || !hexColor.startsWith('#') || (hexColor.length !== 7 && hexColor.length !== 4)) {
    return rgb(1, 1, 1); // Default clean white
  }

  let hex = hexColor.slice(1);
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return rgb(isNaN(r) ? 1 : r, isNaN(g) ? 1 : g, isNaN(b) ? 1 : b);
}
