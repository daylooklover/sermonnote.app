import React, { useState } from 'react';

function SermonAI() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');

  async function handleGenerate() {
    const response = await fetch('https://us-central1-yourproject.cloudfunctions.net/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'outline', text: inputText }),
    });
    const data = await response.json();
    if (data.result) {
      setResult(data.result);
    } else {
      setResult('AI 호출 실패');
    }
  }

  return (
    <div>
      <textarea value={inputText} onChange={e => setInputText(e.target.value)} />
      <button onClick={handleGenerate}>설교 개요 생성</button>
      <pre>{result}</pre>
    </div>
  );
}

export default SermonAI;
