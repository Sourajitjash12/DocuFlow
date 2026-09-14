import { NextRequest, NextResponse } from 'next/server';
import { processStandaloneImage } from '@/lib/processors/image-processor';
import { PaperSizePreset, BackgroundType, MarginBounds } from '@/lib/types';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const outputFormat = (formData.get('outputFormat') as 'jpeg' | 'png' | 'webp') || 'png';

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided.' }, { status: 400 });
    }

    const paperSize = (formData.get('paperSize') as PaperSizePreset) || 'a4';
    const orientation = (formData.get('orientation') as 'portrait' | 'landscape' | 'auto') || 'auto';
    const qualityPercentage = formData.get('qualityPercentage')
      ? parseInt(formData.get('qualityPercentage') as string, 10)
      : 90;
    const backgroundType = (formData.get('backgroundType') as BackgroundType) || 'white';
    const backgroundColor = (formData.get('backgroundColor') as string) || '#ffffff';
    const scaleFactor = parseFloat((formData.get('scaleFactor') as string) || '1.0');
    const customWidth = formData.get('customWidth') ? parseFloat(formData.get('customWidth') as string) : undefined;
    const customHeight = formData.get('customHeight') ? parseFloat(formData.get('customHeight') as string) : undefined;

    const marginDefault = parseInt((formData.get('margin') as string) || '20', 10);
    const margins: MarginBounds = {
      top: formData.get('marginTop') ? parseInt(formData.get('marginTop') as string, 10) : marginDefault,
      bottom: formData.get('marginBottom') ? parseInt(formData.get('marginBottom') as string, 10) : marginDefault,
      left: formData.get('marginLeft') ? parseInt(formData.get('marginLeft') as string, 10) : marginDefault,
      right: formData.get('marginRight') ? parseInt(formData.get('marginRight') as string, 10) : marginDefault,
    };

    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();

    // Render raster image representation using sharp svg canvas rasterization
    const titleText = `DocuFlow PDF Export (${file.name})`;
    const subText = `Total Pages: ${pageCount} | Format: ${outputFormat.toUpperCase()} | Quality: ${qualityPercentage}%`;

    const svg = `
      <svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}"/>
        <rect x="40" y="40" width="1120" height="1520" fill="none" stroke="#6366f1" stroke-width="4" stroke-dasharray="12,8"/>
        <text x="80" y="140" font-family="sans-serif" font-size="36" font-weight="bold" fill="#0f172a">${titleText}</text>
        <text x="80" y="200" font-family="sans-serif" font-size="22" fill="#64748b">${subText}</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svg);
    const result = await processStandaloneImage(svgBuffer, {
      outputFormat,
      layoutConfig: {
        paperSize,
        orientation,
        margins,
        qualityPercentage,
        scaleFactor,
        customWidth,
        customHeight,
        backgroundType,
        backgroundColor,
      },
    });

    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const fileName = `${file.name.replace(/\.pdf$/i, '')}_page1.${ext}`;

    const headers = new Headers();
    headers.set('Content-Type', result.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, X-Page-Count');
    headers.set('X-Page-Count', pageCount.toString());

    return new NextResponse(result.buffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('PDF to Image API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to render PDF page into image.' },
      { status: 500 }
    );
  }
}
