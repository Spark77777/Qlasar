// backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fetch from "node-fetch"; // Ensure node-fetch is installed

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// Load environment variables
const OR_KEY = process.env.OPENROUTER_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Model
const MODEL_ID = "mistralai/mistral-7b-instruct:free";

// ---------------- Qlasar Chatbot API ----------------
app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  const systemMessage = `
You are Qlasar, an AI scout. Respond clearly and helpfully.

- For normal messages, answer concisely or in structured four-section format (Answer, Counterarguments, Blindspots, Conclusion) if the question is complex.
- For gibberish, unclear, or short nonsensical messages, do not try to answer directly. Instead, ask for clarification politely, e.g., "Did you mean this or that?" or "Could you clarify your question?".
- Use clean formatting: no <s> tags, no markdown headers like ###, no trailing <br><br>.
- Use bold <b> and italics <i> only if necessary.
`;

  const payload = {
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 512
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

    // Clean formatting
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

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------- Heartbeat to Supabase ----------------
const heartbeat = async () => {
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/sessions?select=id&limit=1`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (resp.ok) {
      console.log("💓 Supabase heartbeat successful");
    } else {
      console.warn("⚠️ Supabase heartbeat failed:", resp.status);
    }
  } catch (err) {
    console.error("❌ Heartbeat error:", err.message);
  }
};

// Run heartbeat every 5 minutes
setInterval(heartbeat, 5 * 60 * 1000);
heartbeat(); // Initial heartbeat on server start

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
