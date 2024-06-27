"use client"
import { useState } from "react";
import { AiOutlineCloudUpload, AiOutlineFile } from "react-icons/ai";

export default function AddFiles() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => 
      file.type === "application/pdf" || file.type === "text/plain"
    );
    setFiles(validFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type === "application/pdf" || file.type === "text/plain"
    );
    setFiles(validFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the files to your backend
    console.log("Files to upload:", files);
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 text-center">
        <h1 className="text-2xl font-bold">Add to Knowledge Base</h1>
      </header>
      <div className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div 
            className="border-2 border-dashed border-gray-400 rounded-lg p-8 mb-4 text-center cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <AiOutlineCloudUpload className="mx-auto text-4xl mb-2" />
            <p>Drag and drop files here or click to select</p>
            <p className="text-sm text-gray-400">(PDF and TXT files only)</p>
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {files.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Selected Files:</h2>
              <ul>
                {files.map((file, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <AiOutlineFile className="mr-2" />
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Files
          </button>
        </form>
      </div>
    </main>
  );
}
