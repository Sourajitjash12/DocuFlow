import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function convertDocxToPdf(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
  // Extract raw text and HTML structure using mammoth
  const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
  const text = result.value || 'Empty document';
  
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const maxLineWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentY -= lineHeight / 2;
      if (currentY < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      continue;
    }

    // Simple word wrapping
    const words = trimmed.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxLineWidth) {
        // Draw current line
        if (currentY < margin + lineHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        currentPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.15),
        });
        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      if (currentY < margin + lineHeight) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      currentPage.drawText(currentLine, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.15),
      });
      currentY -= lineHeight;
    }
  }

  return await pdfDoc.save();
}

export async function convertPdfToDocx(pdfTextContent: string): Promise<Buffer> {
  const paragraphs = pdfTextContent.split('\n\n').map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    return new Paragraph({
      children: lines.map(line => new TextRun({ text: line, size: 24, font: 'Calibri' })),
      spacing: { after: 200 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'Converted Document',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
