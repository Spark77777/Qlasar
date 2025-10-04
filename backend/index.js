import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // ensure node-fetch v3+
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Load OpenRouter key from environment
const OR_KEY = process.env.OPENROUTER_KEY;
const MODEL_ID = "x-ai/grok-4-fast:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => res.send("Qlasar backend is live"));

// Chat route
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  // Build messages for OpenRouter
  const messages = [
    {
      role: "system",
      content: "You are Qlasar, an AI scout. Answer in detailed style when needed."
    },
    // convert frontend history to OpenRouter format
    ...(history || []).map(([userMsg, botMsg]) => [
      { role: "user", content: userMsg },
      { role: "assistant", content: botMsg }
    ]).flat(),
    { role: "user", content: message }
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4000
      })
    });

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content || "Qlasar could not generate a response";

    res.json({ reply });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ reply: "❌ Error connecting to model" });
  }
});

app.listen(PORT, () => console.log(`Qlasar backend running on port ${PORT}`));
