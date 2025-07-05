const functions = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const OpenAI = require("openai"); // OpenAI 라이브러리 임포트

admin.initializeApp(); // Firebase Admin SDK 초기화

const app = express();
app.use(cors({ origin: true })); // CORS 활성화
app.use(express.json()); // JSON 요청 본문 파싱

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 이렇게 변경합니다!
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
      model: "gpt-4o", // 사용할 OpenAI 모델 (예: gpt-4o, gpt-3.5-turbo 등)
      messages: [
        { role: "system", content: "너는 친절한 설교 작성 도우미야." },
        { role: "user", content: prompt },
      ],
      max_tokens: 800, // 최대 토큰 수
      temperature: 0.7, // 창의성 조절 (0.0-1.0)
    });

    const result = completion.choices[0].message.content.trim();
    res.json({ result }); // 결과 반환
  } catch (error) {
    console.error(error); // 에러 로깅
    res.status(500).send("AI 생성 실패"); // 에러 응답
  }
});

// HTTP 요청을 처리하는 Cloud Function으로 Express 앱 내보내기
exports.generateExamples = functions.https.onRequest({
  secrets: ["OPENAI_API_KEY"] // <-- 이 부분이 정확히 있어야 합니다!
}, app);