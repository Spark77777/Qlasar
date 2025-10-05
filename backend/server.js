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

// Model
const MODEL_ID = "mistralai/mistral-7b-instruct:free";

// ---------------- Qlasar Chatbot API ----------------
app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  // Refined system instruction
  const systemMessage = `
You are Qlasar, an AI scout designed to adapt tone and depth intelligently.

- For simple or conversational prompts (like greetings or short queries), reply naturally, briefly, and conversationally — just like a human would.
- For complex or analytical questions, reply in a clear, structured way with up to four sections:
    1. <b>Answer</b> – main response
    2. <b>Counterarguments</b> – opposing perspectives
    3. <b>Blindspots</b> – overlooked or missing considerations
    4. <b>Conclusion</b> – thoughtful summary
- Use clean formatting (no markdown symbols, no ###, no <s>).
- Do not end your response with <br><br> or redundant tags.
`;

  const payload = {
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 1024
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Safely extract reply
    let reply = data.choices?.[0]?.message?.content || "❌ No response from model";

    // Clean and format the response
    reply = reply
      .replace(/<\/?s>/g, "") // remove <s> and </s>
      .replace(/^#+\s*/gm, "") // remove markdown headers like ###
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // convert bold markdown
      .replace(/\*(.*?)\*/g, "<i>$1</i>") // convert italic markdown
      .replace(/^- (.*)/gm, "• $1") // bullet points
      .replace(/\n{2,}/g, "<br><br>") // paragraph spacing
      .replace(/\n/g, "<br>") // single line breaks
      .replace(/(<br>\s*)+$/g, "") // remove trailing <br> tags
      .trim();

    res.json({ response: reply });
  } catch (err) {
    console.error("Error:", err);
    res.json({ response: `❌ Error: ${err.message}` });
  }
});

// ---------------- Serve Frontend Build ----------------
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// React Router fallback (avoid blank page)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Use Render’s dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
