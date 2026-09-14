import { NextRequest, NextResponse } from 'next/server';
import { processStandaloneImage } from '@/lib/processors/image-processor';
import { PaperSizePreset, BackgroundType, MarginBounds } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const outputFormat = (formData.get('outputFormat') as 'jpeg' | 'png' | 'webp') || 'jpeg';

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
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

    const arrayBuffer = await file.arrayBuffer();

    const result = await processStandaloneImage(arrayBuffer, {
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
    const fileName = `docuflow_processed_${Date.now()}.${ext}`;

    const headers = new Headers();
    headers.set('Content-Type', result.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, X-Output-Width, X-Output-Height');
    headers.set('X-Output-Width', result.width.toString());
    headers.set('X-Output-Height', result.height.toString());

    return new NextResponse(result.buffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Standalone Image Processing API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process image file.' },
      { status: 500 }
    );
  }
}
