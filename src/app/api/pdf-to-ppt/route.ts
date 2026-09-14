import { NextRequest, NextResponse } from 'next/server';
import { convertPdfToPpt, SlideLayoutOption, MarginOption } from '@/lib/processors/pdf-to-ppt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Uploaded file must be a PDF document.' }, { status: 400 });
    }

    const slideLayout = (formData.get('slideLayout') as SlideLayoutOption) || '16:9';
    const dpi = formData.get('dpi') ? parseInt(formData.get('dpi') as string, 10) : 150;
    const margin = (formData.get('margin') as MarginOption) || 'standard';

    const arrayBuffer = await file.arrayBuffer();

    // Convert PDF to PowerPoint presentation buffer
    const result = await convertPdfToPpt(arrayBuffer, {
      slideLayout,
      dpi,
      margin,
      fileName: file.name,
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    headers.set('Content-Disposition', `attachment; filename="${result.fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, X-Page-Count');
    headers.set('X-Page-Count', result.pageCount.toString());

    return new NextResponse(result.buffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('PDF to PPT API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to convert PDF to PowerPoint presentation.' },
      { status: 500 }
    );
  }
}
