import { NextRequest, NextResponse } from 'next/server';
import { compressImageFile } from '@/lib/processors/image-compress';
import { PaperSizePreset, BackgroundType, MarginBounds } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const outputFormat = (formData.get('outputFormat') as 'original' | 'jpeg' | 'png' | 'webp') || 'original';

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded for compression.' }, { status: 400 });
    }

    const paperSize = (formData.get('paperSize') as PaperSizePreset) || 'fit';
    const orientation = (formData.get('orientation') as 'portrait' | 'landscape' | 'auto') || 'auto';
    const qualityPercentage = formData.get('qualityPercentage')
      ? parseInt(formData.get('qualityPercentage') as string, 10)
      : 80;
    const backgroundType = (formData.get('backgroundType') as BackgroundType) || 'white';
    const backgroundColor = (formData.get('backgroundColor') as string) || '#ffffff';
    const scaleFactor = parseFloat((formData.get('scaleFactor') as string) || '1.0');
    const customWidth = formData.get('customWidth') ? parseFloat(formData.get('customWidth') as string) : undefined;
    const customHeight = formData.get('customHeight') ? parseFloat(formData.get('customHeight') as string) : undefined;

    const marginDefault = parseInt((formData.get('margin') as string) || '0', 10);
    const margins: MarginBounds = {
      top: formData.get('marginTop') ? parseInt(formData.get('marginTop') as string, 10) : marginDefault,
      bottom: formData.get('marginBottom') ? parseInt(formData.get('marginBottom') as string, 10) : marginDefault,
      left: formData.get('marginLeft') ? parseInt(formData.get('marginLeft') as string, 10) : marginDefault,
      right: formData.get('marginRight') ? parseInt(formData.get('marginRight') as string, 10) : marginDefault,
    };

    const arrayBuffer = await file.arrayBuffer();

    const result = await compressImageFile(arrayBuffer, {
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

    const ext = result.mimeType.split('/')[1] === 'jpeg' ? 'jpg' : result.mimeType.split('/')[1];
    const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_compressed.${ext}`;

    const headers = new Headers();
    headers.set('Content-Type', result.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set(
      'Access-Control-Expose-Headers',
      'Content-Disposition, X-Original-Size, X-Compressed-Size, X-Compression-Ratio, X-Output-Width, X-Output-Height'
    );
    headers.set('X-Original-Size', result.originalSize.toString());
    headers.set('X-Compressed-Size', result.compressedSize.toString());
    headers.set('X-Compression-Ratio', result.compressionRatio.toString());
    headers.set('X-Output-Width', result.width.toString());
    headers.set('X-Output-Height', result.height.toString());

    return new NextResponse(result.buffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Image Compressor API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to compress image file.' },
      { status: 500 }
    );
  }
}
