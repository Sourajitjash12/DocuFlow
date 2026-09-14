import { NextRequest, NextResponse } from 'next/server';
import { mergePdfFiles } from '@/lib/processors/pdf-merge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json({ error: 'At least 2 PDF files are required for merging.' }, { status: 400 });
    }

    const mergeInputs = [];
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        return NextResponse.json({ error: `File "${file.name}" is not a valid PDF.` }, { status: 400 });
      }
      const buffer = await file.arrayBuffer();
      mergeInputs.push({
        buffer,
        name: file.name,
      });
    }

    const preset = (formData.get('preset') as any) || 'a4';
    const scaleFactor = parseFloat((formData.get('scaleFactor') as string) || '1.0');
    const customWidth = formData.get('customWidth') ? parseFloat(formData.get('customWidth') as string) : undefined;
    const customHeight = formData.get('customHeight') ? parseFloat(formData.get('customHeight') as string) : undefined;

    const mergedBuffer = await mergePdfFiles(mergeInputs, {
      margin: 20,
      dimensionConfig: {
        preset,
        scaleFactor,
        customWidth,
        customHeight,
      },
    });

    const fileName = `docuflow_merged_${Date.now()}.pdf`;

    // Strict Binary Response Headers Verification
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, X-Page-Count');
    headers.set('X-Page-Count', files.length.toString());

    return new NextResponse(mergedBuffer as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('PDF merge API error:', err);
    return NextResponse.json(
      { error: err?.message || 'An error occurred while merging PDF files.' },
      { status: 500 }
    );
  }
}
