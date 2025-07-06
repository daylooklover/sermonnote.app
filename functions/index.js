const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");  // ✅ 최신 openai 방식

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: functions.config().openai.key, // 🔐 Firebase 환경변수 사용
});

app.post("/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const result = chatCompletion.choices[0].message.content;
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error from OpenAI:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Firebase Functions로 export
exports.ai = functions.https.onRequest(app);
