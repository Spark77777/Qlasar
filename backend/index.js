import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Health route
app.get("/", (req, res) => {
  res.send("🚀 Qlasar backend is live and running successfully!");
});

// ✅ Chat route (for Grok model via OpenRouter)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: 'messages' must be an array." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`, // 👈 Updated key name
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "x-ai/grok-beta", // ✅ Grok Fast 4 Free model
        messages: messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Grok API error:", data.error);
      return res.status(500).json({ error: data.error.message || "Grok API error" });
    }

    const reply = data.choices?.[0]?.message?.content || "No response from Grok.";
    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to connect to Grok (OpenRouter)." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Qlasar backend running on port ${PORT}`));
