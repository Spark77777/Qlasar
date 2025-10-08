import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const OR_KEY = process.env.OPENROUTER_KEY; // Your OpenRouter API key

// ======================
// 🔹 API ROUTE
// ======================
app.post("/api/generate", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: message }],
      }),
    });

    if (response.status === 429) {
      return res
        .status(429)
        .json({ error: "Rate limit exceeded. Please wait a few seconds and try again." });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("API Error:", errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json({ response: data.choices[0].message.content });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 🔹 FRONTEND (React) SERVE
// ======================

// Serve static frontend files (assuming built files are in "client/dist")
app.use(express.static(path.join(__dirname, "client/dist")));

// Handle all other routes (React Router or direct URL access)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

// ======================
// 🔹 START SERVER
// ======================
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
