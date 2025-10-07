// backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// Load OpenRouter key from environment
const OR_KEY = process.env.OPENROUTER_KEY;

// Mistral 7B Instruct (Free model)
const MODEL_ID = "mistralai/mistral-7b-instruct:free";

// ---------------- Qlasar Chatbot API ----------------
app.post("/api/generate", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  const systemMessage = `You are Qlasar, an AI scout. 
Only for those questions that need detailed and well-structured answers, provide four sections:
1. Answer: main response
2. Counterarguments: possible opposing views
3. Blindspots: missing considerations or overlooked aspects
4. Conclusion: encourage the user to think critically and gain insight.
Format the response clearly with headings and end with a reflective thought for the user.
For simple questions or those which do not need detailed or in-depth answers, provide answers as a General AI would — no four sections or reflective thought.`;

  const payload = {
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: message },
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 1024,
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(500).json({ error: "Failed to get response from AI." });
    }

    // Safely extract reply
    let reply = data.choices?.[0]?.message?.content || "❌ No response from model";

    // Clean and format response
    reply = reply
      .replace(/<\/?s>/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/^- (.*)/gm, "• $1")
      .trim();

    res.json({ response: reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: `❌ ${err.message}` });
  }
});

// ---------------- Serve Frontend Build ----------------
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Handle React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
