import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('filepond');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", errData => {
        console.error(errData.parserError);
        reject(new Error('PDF parsing error'));
      });
      
      pdfParser.on("pdfParser_dataReady", pdfData => {
        const extractedText = extractTextFromPdfData(pdfData);
        console.log('Extracted Text:', extractedText);
        // console.log('JSON Data:', JSON.stringify(pdfData, null, 2));
        
        resolve(NextResponse.json({
          rawText: extractedText,
          jsonData: pdfData
        }, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'FileName': file.name
          }
        }));
      });

      pdfParser.parseBuffer(buffer);
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}

function extractTextFromPdfData(pdfData) {
  let text = '';
  for (let i = 0; i < pdfData.Pages.length; i++) {
    const page = pdfData.Pages[i];
    for (let j = 0; j < page.Texts.length; j++) {
      text += decodeURIComponent(page.Texts[j].R[0].T) + ' ';
    }
    text += '\n\n'; // Add newlines between pages
  }
  return text.trim();
}