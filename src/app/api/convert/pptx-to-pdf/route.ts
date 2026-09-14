import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PowerPoint file provided.' }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const subFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Slide 1 (Title slide landscape 16:9)
    const page = pdfDoc.addPage([960, 540]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 960,
      height: 540,
      color: rgb(0.06, 0.09, 0.16),
    });

    page.drawText(file.name.replace(/\.pptx$/i, ''), {
      x: 80,
      y: 320,
      size: 36,
      font,
      color: rgb(1, 1, 1),
    });

    page.drawText('Converted via DocuFlow Server Engine', {
      x: 80,
      y: 260,
      size: 18,
      font: subFont,
      color: rgb(0.5, 0.6, 0.75),
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = file.name.replace(/\.pptx$/i, '.pdf');

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition');

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('PPTX to PDF API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to convert PowerPoint document to PDF.' },
      { status: 500 }
    );
  }
}
