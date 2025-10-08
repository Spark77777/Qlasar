// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ For ES Modules (__dirname fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const OR_KEY = process.env.OPENROUTER_KEY;

// ---------------- API Route ----------------
app.post("/api/generate", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free", // can replace with another available model
        messages: [{ role: "user", content: message }],
      }),
    });

    // Handle rate limit
    if (response.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a few seconds and try again.",
      });
    }

    // Handle other API errors
    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ OpenRouter API Error:", errText);
      return res.status(response.status).json({
        error: `OpenRouter API returned ${response.status}: ${errText}`,
      });
    }

    // Parse response safely
    const data = await response.json();
    console.log("✅ OpenRouter Response:", JSON.stringify(data, null, 2));

    let aiReply =
      data?.choices?.[0]?.message?.content ||
      data?.message ||
      "⚠️ No valid response from AI.";

    res.json({ response: aiReply });
  } catch (err) {
    console.error("💥 Server Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Serve Vite Frontend ----------------
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// ✅ Handle SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------- Start Server ----------------
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
