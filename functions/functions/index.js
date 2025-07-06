const functions = require("firebase-functions");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.ai = functions.https.onRequest(async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const result = completion.data.choices[0].message.content;
    res.status(200).send({ result });
  } catch (error) {
    console.error("AI 호출 실패:", error);
    res.status(500).send({ error: "AI 호출 실패" });
  }
});
