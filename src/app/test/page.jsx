'use client';

import { useState } from 'react';

export default function PDFExtractor() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');

  const extractText = async (file) => {
    try {
      const formData = new FormData();
      formData.append('filepond', file);

      const response = await fetch('/api/text-extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text');
      }

      const extractedText = await response.text();
      setFileName(response.headers.get('FileName') || 'Unnamed PDF');
      setText(extractedText);
    } catch (error) {
      console.error('Error extracting text:', error);
      setText('Error extracting text from PDF');
    }
  };

  return (
    <div>
      <h1>PDF Text Extractor</h1>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files && extractText(e.target.files[0])}
      />
      {text && (
        <div>
          <h2>Extracted Text from {fileName}:</h2>
          <pre>{text}</pre>
        </div>
      )}
    </div>
  );
}