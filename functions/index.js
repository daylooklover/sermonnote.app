const functions = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

// ✅ OPTIONS 프리플라이트 요청 처리
app.options("/", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.status(204).send("");
});

app.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("프롬프트가 필요합니다.");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "너는 친절한 설교 작성 도우미야." },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content.trim();
    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).send("AI 생성 실패");
  }
});

exports.generateExamples = functions.https.onRequest(app);