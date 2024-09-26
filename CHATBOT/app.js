require('dotenv').config();  // Load .env file
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const apiKey = process.env.GEMINI_API_KEY;  // Get the API key from .env file
const genAI = new GoogleGenerativeAI(apiKey);

app.use(bodyParser.json());
app.use(express.static('public'));

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Introduce yourself as Sparky, a friendly chatbot...",
});

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function sendChatMessage(userMessage) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      { role: "user", parts: [{ text: userMessage }] }
    ],
  });
  const result = await chatSession.sendMessage(userMessage);
  return result.response.text();
}

app.post('/sendMessage', async (req, res) => {
  const userMessage = req.body.message;
  try {
    const reply = await sendChatMessage(userMessage);
    res.json({ reply });
  } catch (error) {
    console.error("Error in AI response:", error);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
