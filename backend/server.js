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

  // Determine if input looks unclear / gibberish
  const unclearPatterns = [/^[a-z]{1,3}$/i, /^[^a-zA-Z0-9\s]{1,3}$/]; // short random letters
  const isUnclear = unclearPatterns.some((pat) => pat.test(message.trim()));

  // Refined system instruction
  const systemMessage = `
You are Qlasar, an AI scout. Answer questions intelligently.

- For short or unclear messages (like random letters or gibberish), respond with a polite clarification question, e.g., "Did you mean...?" or "Could you clarify that?" Keep it concise and friendly.
- For regular user questions, provide answers normally.
- For detailed or analytical questions, provide up to four sections:
    1. <b>Answer</b> – main response
    2. <b>Counterarguments</b> – opposing perspectives
    3. <b>Blindspots</b> – overlooked or missing considerations
    4. <b>Conclusion</b> – thoughtful summary
- Use clean formatting (no markdown ###, no <s>, no redundant <br><br> tags)
`;

  const payload = {
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: isUnclear ? 200 : 1024, // enough tokens for clarification
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

    let reply = data.choices?.[0]?.message?.content || "❌ No response from model";

    // Clean and format response
    reply = reply
      .replace(/<\/?s>/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/^- (.*)/gm, "• $1")
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .replace(/(<br>\s*)+$/g, "")
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
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
