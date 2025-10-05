import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenRouter key from environment
const OR_KEY = process.env.OPENROUTER_KEY; 
const MODEL_ID = "x-ai/grok-4-fast:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Middleware
app.use(express.json());
app.use(cors());

// ---------------- Qlasar Chatbot ----------------
app.post("/api/message", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ response: "No message provided" });

  const system_message = `
You are Qlasar, an AI scout. Only for those questions that need detailed and well-structured answer, provide four sections:
1. Answer: main response
2. Counterarguments: possible opposing views
3. Blindspots: missing considerations or overlooked aspects
4. Conclusion: encourage the user to think critically and gain insight
For simple questions, provide short direct answers.
`;

  const messagesPayload = [{ role: "system", content: system_message }];
  history.forEach(([u, b]) => {
    messagesPayload.push({ role: "user", content: u });
    messagesPayload.push({ role: "assistant", content: b });
  });
  messagesPayload.push({ role: "user", content: message });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    console.log("OpenRouter response:", JSON.stringify(data));

    const reply =
      data?.choices?.[0]?.message?.content ??
      data?.error?.message ??
      "❌ No response from AI";

    // Append to history
    const newHistory = [...history, [message, reply]];

    res.json({ response: reply, history: newHistory });
  } catch (err) {
    console.error("AI request error:", err);
    res.json({ response: `❌ Error: ${err.message}` });
  }
});

// ---------------- Proactive Scout ----------------
app.post("/api/scout", async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ response: "No topic provided" });

  const system_message = `
You are the Proactive Scout. Provide concise, actionable facts, alerts, and insights about the topic.
`;

  const messagesPayload = [
    { role: "system", content: system_message },
    { role: "user", content: `Provide insights about: ${topic}` },
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    const data = await response.json();
    console.log("Scout response:", JSON.stringify(data));

    const reply =
      data?.choices?.[0]?.message?.content ??
      data?.error?.message ??
      "❌ No response from AI";

    res.json({ response: reply });
  } catch (err) {
    console.error("Scout request error:", err);
    res.json({ response: `❌ Error: ${err.message}` });
  }
});

// ---------------- Serve Frontend ----------------
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Handle React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
