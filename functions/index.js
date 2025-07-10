const functions = require("firebase-functions");
const OpenAI = require("openai");

// 🔐 OpenAI 초기화
const openai = new OpenAI({ apiKey: functions.config().openai.key });

// 📘 Firebase HTTPS 함수
exports.generateCommentary = functions.https.onRequest(async (req, res) => {
  try {
    const { reference, text } = req.body;

    if (!reference || !text) {
      return res.status(400).send("❌ 'reference'와 'text'가 필요합니다.");
    }

    const prompt = `
[성경 주석 생성기]
다음 성경 구절에 대해 다음을 포함한 AI 주석을 생성하세요:

1. 핵심 해설
2. 원어 단어 및 의미
3. 현대적인 적용 포인트

[구절]: ${reference}
[본문]: ${text}

[주석]:
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content;
    return res.status(200).json({ commentary: result });

  } catch (error) {
    console.error("🔥 AI 오류:", error.message);
    return res.status(500).send("AI 주석 생성 실패: " + error.message);
  }
});
