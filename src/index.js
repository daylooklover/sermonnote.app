// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

import { firebaseApp, auth, firestore } from './firebase';

const rootElement = document.getElementById('root');

if (rootElement && firebaseApp) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App auth={auth} firestore={firestore} firebaseApp={firebaseApp} />
    </React.StrictMode>
  );
} else {
  console.error('⚠️ "root" 요소가 없거나 Firebase가 초기화되지 않았습니다.');
}
const functions = require("firebase-functions");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "sk-...자기 API키...",
});
const openai = new OpenAIApi(configuration);

exports.generateCommentary = functions.https.onRequest(async (req, res) => {
  const { reference, text } = req.body;

  if (!reference || !text) {
    return res.status(400).send("reference and text required.");
  }

  const prompt = `
[성경 주석 생성기]
다음 성경 구절에 대해 다음과 같은 주석을 생성하세요:

1. 해설 요점
2. 적용
3. 원어 설명

[구절]: ${reference}
[본문]: ${text}

[주석]:
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const result = completion.data.choices[0].message.content;
    res.json({ commentary: result });
  } catch (err) {
    res.status(500).send("AI 주석 생성 실패: " + err.message);
  }
});
