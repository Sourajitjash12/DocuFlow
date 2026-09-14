import { NextRequest, NextResponse } from 'next/server';
import { compressPdfFile } from '@/lib/processors/pdf-compress';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const level = (formData.get('level') as 'low' | 'medium' | 'high') || 'medium';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file format. Only PDF files are supported.' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 50MB.' }, { status: 400 });
    }

    const preset = (formData.get('preset') as any) || 'fit';
    const scaleFactor = parseFloat((formData.get('scaleFactor') as string) || '1.0');
    const customWidth = formData.get('customWidth') ? parseFloat(formData.get('customWidth') as string) : undefined;
    const customHeight = formData.get('customHeight') ? parseFloat(formData.get('customHeight') as string) : undefined;

    const arrayBuffer = await file.arrayBuffer();
    const { buffer, originalSize, compressedSize } = await compressPdfFile(arrayBuffer, level, {
      preset,
      scaleFactor,
      customWidth,
      customHeight,
    });


    const outFileName = file.name.replace(/\.pdf$/i, '_compressed.pdf');

    // Strict Binary Response Headers Verification
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${outFileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, X-Original-Size, X-Compressed-Size');
    headers.set('X-Original-Size', originalSize.toString());
    headers.set('X-Compressed-Size', compressedSize.toString());

    return new NextResponse(buffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('PDF compression API error:', err);
    return NextResponse.json(
      { error: err?.message || 'An error occurred during PDF compression processing.' },
      { status: 500 }
    );
  }
}
