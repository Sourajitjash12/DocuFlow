import { NextRequest, NextResponse } from 'next/server';
import { convertImagesToPdf, ImageToPdfOptions } from '@/lib/processors/image-to-pdf';
import { PaperSizePreset, QualityMode, MarginBounds } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const paperSize = (formData.get('paperSize') || formData.get('pageSize') || 'a4') as PaperSizePreset;
    const orientation = (formData.get('orientation') as ImageToPdfOptions['orientation']) || 'auto';
    const qualityMode = (formData.get('qualityMode') as QualityMode) || 'high';
    const backgroundColor = (formData.get('backgroundColor') as string) || '#ffffff';
    const scaleFactor = parseFloat((formData.get('scaleFactor') as string) || '1.0');
    const customWidth = formData.get('customWidth') ? parseFloat(formData.get('customWidth') as string) : undefined;
    const customHeight = formData.get('customHeight') ? parseFloat(formData.get('customHeight') as string) : undefined;

    // Per-side margins parsing with legacy fallback
    const marginDefault = parseInt((formData.get('margin') as string) || '20', 10);
    const margins: MarginBounds = {
      top: formData.get('marginTop') ? parseInt(formData.get('marginTop') as string, 10) : marginDefault,
      bottom: formData.get('marginBottom') ? parseInt(formData.get('marginBottom') as string, 10) : marginDefault,
      left: formData.get('marginLeft') ? parseInt(formData.get('marginLeft') as string, 10) : marginDefault,
      right: formData.get('marginRight') ? parseInt(formData.get('marginRight') as string, 10) : marginDefault,
    };

    const rotationsRaw = formData.get('rotations') as string | null;
    let rotations: number[] = [];
    if (rotationsRaw) {
      try {
        rotations = JSON.parse(rotationsRaw);
      } catch (e) {
        rotations = [];
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No image files provided.' }, { status: 400 });
    }

    const imageInputs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rotation = rotations[i] || 0;
      const buffer = await file.arrayBuffer();

      imageInputs.push({
        buffer,
        mimeType: file.type || 'image/jpeg',
        rotation,
      });
    }

    const pdfBuffer = await convertImagesToPdf(imageInputs as any, {
      paperSize,
      orientation,
      margins,
      qualityMode,
      backgroundColor,
      scaleFactor,
      customWidth,
      customHeight,
    });

    const fileName = `docuflow_images_${Date.now()}.pdf`;

    // Strict Binary Response Headers Verification
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, X-Page-Count');
    headers.set('X-Page-Count', files.length.toString());

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Image to PDF API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to convert image queue to PDF.' },
      { status: 500 }
    );
  }
}
