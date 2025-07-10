const functions = require("firebase-functions");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: functions.config().openai.key,
});

const openai = new OpenAIApi(configuration);

exports.ai = functions.https.onRequest(async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: completion.data.choices[0].message.content });
  } catch (error) {
    console.error("Error from OpenAI:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});