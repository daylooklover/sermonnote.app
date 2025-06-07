const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const OpenAI = require("openai");

// OpenAI 클라이언트 생성 (최신 SDK)
// 이 부분은 변경 없음
const openai = new OpenAI({
  apiKey: functions.config().openai.key, // OpenAI API 키 환경변수에서 가져오기
});

exports.generateExamples = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // POST 요청만 처리
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      // 요청 본문에서 prompt 추출
      const { prompt } = req.body;

      // prompt가 없으면 400 오류 응답
      if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
        return res.status(400).json({ error: "Prompt is required." });
      }

      // OpenAI 챗컴플리션 호출
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });

      // 결과 텍스트 정리
      const examples = completion.choices[0].message.content.trim();

      // 클라이언트에 JSON 응답
      res.json({ examples });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });
});

// END of index.js
