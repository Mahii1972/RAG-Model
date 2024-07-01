import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Pinecone } from '@pinecone-database/pinecone';
import { HfInference } from '@huggingface/inference';

const model = new ChatGroq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index('rag');

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

const EMBEDDING_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';

// Simple function to estimate token count
function estimateTokens(text) {
  return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
}

// Function to trim history to fit within token limit
function trimHistory(history, currentMessage, maxTokens = 1000) {
  let tokenCount = estimateTokens(currentMessage);
  let trimmedHistory = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    const messageTokens = estimateTokens(message.text);
    
    if (tokenCount + messageTokens > maxTokens) break;
    
    trimmedHistory.unshift(message);
    tokenCount += messageTokens;
  }

  return trimmedHistory;
}

export async function POST(request) {
  const { message, history, model: modelName } = await request.json();

  try {
    const trimmedHistory = trimHistory(history, message);
    
    // Generate embedding for the query
    const queryEmbedding = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: message,
    });

    // Query Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    // Extract relevant context from the query results
    const context = queryResponse.matches
      .map(match => `${match.metadata.filename}: ${match.metadata.text || 'No text available'}`)
      .join("\n\n");

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a limited assistant. You can only respond with greetings or information about uploaded files. For any other type of request or question, respond with "pls send valid response".

Context (information about uploaded files):
${context}

Remember, you can only greet or provide information about the files mentioned above. For anything else, say "pls send valid response".`],
      ...trimmedHistory.map(msg => [msg.sender === "user" ? "human" : "ai", msg.text]),
      ["human", message]
    ]);

    const chain = prompt.pipe(model);
    const response = await chain.invoke({});

    const botResponse = response.content || "Sorry, I couldn't generate a response.";
    return new Response(JSON.stringify({ botResponse }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error getting chat completion:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}