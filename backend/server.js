import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// OpenRouter API
const OR_KEY = process.env.OPENROUTER_KEY; // Set this in Render
const MODEL_ID = "x-ai/grok-4-fast:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ---------------- Qlasar Chatbot ----------------
async function qlasarRespond(userMessage, history) {
  const systemMessage = `You are Qlasar, an AI scout. Only for questions that need detailed answer, provide 4 sections: Answer, Counterarguments, Blindspots, Conclusion. For simple questions, provide a regular answer.`;

  const messages = [{ role: "system", content: systemMessage }];
  history.forEach(([u, b]) => {
    messages.push({ role: "user", content: u });
    messages.push({ role: "assistant", content: b });
  });
  messages.push({ role: "user", content: userMessage });

  const payload = {
    model: MODEL_ID,
    messages: messages,
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 2048,
  };

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OR_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    const reply = data.choices[0].message.content;
    history.push([userMessage, reply]);
    return reply;
  } catch (err) {
    const errorReply = `❌ Error: ${err.message}`;
    history.push([userMessage, errorReply]);
    return errorReply;
  }
}

// ---------------- API Route ----------------
const chatHistory = []; // store session history (in-memory)

app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  const reply = await qlasarRespond(message, chatHistory);
  res.json({ response: reply });
});

// ---------------- Serve frontend ----------------
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Handle React Router (avoid blank page)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
