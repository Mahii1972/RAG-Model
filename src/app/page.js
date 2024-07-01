"use client"
import { useState } from "react";

const models = [
  "gemma-7b-it",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768"
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== "") {
      const newUserMessage = { text: inputMessage, sender: "user" };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputMessage("");
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/groqapi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: inputMessage,
            history: messages,
            model: selectedModel
          }),
        });
        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { text: data.botResponse, sender: "bot" }]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting chat completion:", error);
        setMessages(prevMessages => [...prevMessages, { text: "Sorry, an error occurred.", sender: "bot" }]);
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 text-center">
        <h1 className="text-2xl font-bold">RAG Chat</h1>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-600"
                  : "bg-gray-700"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mt-4">
            <div className="inline-block bg-gray-700 p-2 rounded-lg">
              <div className="flex">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce ml-1" style={{animationDelay: "0.2s"}}></span>
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce ml-1" style={{animationDelay: "0.4s"}}></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex mb-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-2 bg-gray-800 rounded-lg focus:outline-none mr-2"
          >
            {models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-gray-800 rounded-l-lg focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-r-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}