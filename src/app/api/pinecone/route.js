import { Pinecone } from '@pinecone-database/pinecone';
import { HfInference } from '@huggingface/inference';
import PDFParser from 'pdf2json';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index('rag');

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

// Update the model name to a supported one
const EMBEDDING_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';

export async function POST(request) {
  console.log('Starting POST request processing');
  const formData = await request.formData();
  const files = formData.getAll('file');
  console.log(`Received ${files.length} files`);

  try {
    for (const file of files) {
      console.log(`Processing file: ${file.name}`);
      let content;

      if (file.type === 'application/pdf') {
        content = await extractTextFromPDF(file);
      } else {
        content = await file.text();
      }

      console.log(`File content extracted for: ${file.name}`);
      
      // Generate embedding using the Hugging Face Inference API
      console.log(`Generating embedding for file: ${file.name}`);
      const embedding = await hf.featureExtraction({
        model: EMBEDDING_MODEL,
        inputs: content,
      });
      console.log(`Embedding generated for file: ${file.name}`);
      

      // Upsert to Pinecone
      console.log(`Upserting to Pinecone for file: ${file.name}`);
      await index.upsert([
        {
          id: file.name,
          values: embedding,
          metadata: { filename: file.name, type: file.type,text: content }
        }
      ]);

      console.log(`Processed and upserted file: ${file.name}`);
    }

    console.log('All files processed successfully');
    return new Response(JSON.stringify({ message: 'Files processed and stored successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing files:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing files', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function extractTextFromPDF(file) {
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
      console.log(`Extracted text from PDF: ${extractedText}`);
      resolve(extractedText);
    });

    pdfParser.parseBuffer(buffer);
  });
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