const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const MODEL_ID = "x-ai/grok-4-fast:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

app.use(cors());
app.use(express.json());

app.post("/api/qlasar", async (req, res) => {
  const { message, history } = req.body;

  const system_message = `You are Qlasar, an AI scout. For questions needing detailed answers, provide four sections: Answer, Counterarguments, Blindspots, Conclusion. For simple questions, give a normal response.`;

  let messages = [{ role: "system", content: system_message }];
  if (history) {
    history.forEach(([userMsg, botMsg]) => {
      messages.push({ role: "user", content: userMsg });
      messages.push({ role: "assistant", content: botMsg });
    });
  }
  messages.push({ role: "user", content: message });

  try {
    const response = await axios.post(API_URL, {
      model: MODEL_ID,
      messages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 2048
    }, {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
