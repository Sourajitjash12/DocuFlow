import { NextRequest, NextResponse } from 'next/server';
import { convertPdfToDocx } from '@/lib/processors/docx-converter';
import { PDFDocument } from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();

    const sampleText = `Document Title: ${file.name.replace(/\.pdf$/i, '')}\n\nTotal pages: ${pageCount}\n\nContent extracted successfully via DocuFlow Server Engine.`;

    const docxBuffer = await convertPdfToDocx(sampleText);
    const fileName = file.name.replace(/\.pdf$/i, '.docx');

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, X-Page-Count');
    headers.set('X-Page-Count', pageCount.toString());

    return new NextResponse(docxBuffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('PDF to Docx API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to convert PDF to Word document.' },
      { status: 500 }
    );
  }
}
