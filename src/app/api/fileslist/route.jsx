import { Pinecone } from '@pinecone-database/pinecone';
import { NextResponse } from 'next/server';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index('rag');

export async function GET() {
  try {
    // Query Pinecone for all vectors, but only fetch the metadata
    const queryResponse = await index.query({
      vector: new Array(384).fill(0), // Corrected dimension to 384
      topK: 10000, // Adjust this value based on your expected maximum number of files
      includeMetadata: true,
      includeValues: false,
    });

    // Extract filenames from the metadata
    const filenames = queryResponse.matches.map(match => match.metadata.filename);
    console.log(filenames);

    // Return the list of unique filenames
    return NextResponse.json({ filenames: [...new Set(filenames)] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching filenames:', error);
    return NextResponse.json({ error: 'Failed to fetch filenames' }, { status: 500 });
  }
}
