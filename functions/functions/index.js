const functions = require("firebase-functions");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

exports.ai = functions.https.onRequest(async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    res.status(200).json({ result: chat.choices[0].message.content });
  } catch (err) {
    console.error("❌ AI 호출 오류:", err);
    res.status(500).json({ error: "AI 처리 중 오류 발생" });
  }
});
