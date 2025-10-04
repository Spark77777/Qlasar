import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// OpenRouter config
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const MODEL_ID = "x-ai/grok-4-fast:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Middleware
app.use(cors());
app.use(express.json());

// ---------------- Qlasar Chat Endpoint ----------------
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  const systemMessage = `
You are Qlasar, an AI scout. For questions needing detailed answers, provide four sections:
1. Answer
2. Counterarguments
3. Blindspots
4. Conclusion

For simple questions, answer as a general AI without these sections.
End detailed responses with a reflective thought.
`;

  // Prepare messages
  const messages = [{ role: "system", content: systemMessage }];
  if (Array.isArray(history)) {
    for (let [userMsg, botMsg] of history) {
      messages.push({ role: "user", content: userMsg });
      messages.push({ role: "assistant", content: botMsg });
    }
  }
  messages.push({ role: "user", content: message });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "❌ Error: No response from model";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ Error connecting to OpenRouter" });
  }
});

// ---------------- Proactive Scout Endpoint ----------------
app.post("/api/scout", async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  const systemMessage = `
You are the Proactive Scout. Provide concise, frequent, and actionable facts, alerts, and insights about the topic.
`;

  const messages = [
    { role: "system", content: systemMessage },
    { role: "user", content: `Provide facts, alerts, and insights about: ${topic}` }
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 512
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "❌ Error: No response from model";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ Error connecting to OpenRouter" });
  }
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Qlasar backend running on port ${PORT}`);
});
