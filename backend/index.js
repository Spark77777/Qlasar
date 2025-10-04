import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const MODEL_ID = "x-ai/grok-4-fast:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Middleware
app.use(cors({ origin: "*" })); // allow all origins
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Qlasar backend is live!");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) return res.status(400).json({ reply: "No message provided." });

  // Format history for OpenRouter
  const formattedHistory = [];
  if (history && Array.isArray(history)) {
    history.forEach(([userMsg, botMsg]) => {
      if (userMsg) formattedHistory.push({ role: "user", content: userMsg });
      if (botMsg) formattedHistory.push({ role: "assistant", content: botMsg });
    });
  }

  // Add current user message
  formattedHistory.push({ role: "user", content: message });

  try {
    // First, send a temporary "Qlasar is thinking..." message (frontend can display this)
    // You can implement this in frontend for instant feedback
    // Then call OpenRouter
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: "system",
            content: "You are Qlasar, an AI scout. Provide detailed and structured answers when necessary."
          },
          ...formattedHistory
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No response from model.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ Error connecting to OpenRouter API." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Qlasar backend running on port ${PORT}`);
});
