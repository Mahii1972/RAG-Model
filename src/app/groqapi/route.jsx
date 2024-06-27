import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });

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
  const { message, history, model } = await request.json();

  try {
    const trimmedHistory = trimHistory(history, message);
    
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      ...trimmedHistory.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: model, // Use the model selected by the user
    });

    const botResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
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