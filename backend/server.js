// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ ES Modules (__dirname fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const OR_KEY = process.env.OPENROUTER_KEY;

// ---------------- API Route ----------------
app.post("/api/generate", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📥 User input:", message);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-8b:free", // stable free model
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    console.log("📤 Raw response:", JSON.stringify(data, null, 2));

    // ✅ Robust extraction of AI response
    let aiContent =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      JSON.stringify(data); // fallback: return raw JSON

    console.log("💬 AI reply:", aiContent);
    res.json({ response: aiContent });
  } catch (err) {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ response: "⚠️ Server error. Try again later." });
  }
});

// ---------------- Serve Frontend ----------------
// ✅ Serve the frontend build (from backend/public)
app.use(express.static(path.join(__dirname, "public")));

// ✅ SPA routing (React Router support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------------- Start Server ----------------
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
