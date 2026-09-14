import { NextRequest, NextResponse } from 'next/server';
import { convertDocxToPdf } from '@/lib/processors/docx-converter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json({ error: 'Only Word (.docx) documents are supported.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const pdfBuffer = await convertDocxToPdf(buffer);

    const fileName = file.name.replace(/\.docx$/i, '.pdf');

    // Strict Binary Response Headers Verification
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition');

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Docx to PDF API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to convert Word document to PDF.' },
      { status: 500 }
    );
  }
}
