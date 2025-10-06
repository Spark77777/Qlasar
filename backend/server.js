// backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// ---------------- Environment Variables ----------------
const OR_KEY = process.env.OPENROUTER_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ---------------- Initialize Supabase ----------------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------------- Qlasar AI Chat API ----------------
const MODEL_ID = "deepseek/deepseek-chat-v3.1:free";

app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  const systemMessage = `
You are Qlasar, an AI scout. Respond clearly and helpfully.

- Answer concisely or in structured four-section format (Answer, Counterarguments, Blindspots, Conclusion).
- For gibberish or unclear questions, ask for clarification politely.
- Use clean formatting; bold <b> and italics <i> only if necessary.
`;

  const payload = {
    model: MODEL_ID,
    input: [
      { role: "system", content: systemMessage },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    max_output_tokens: 512
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
    console.log("OpenRouter Response:", JSON.stringify(data, null, 2));

    let reply = "❌ No response from model";

    if (data?.choices?.length > 0) {
      reply = data.choices[0]?.message?.content || data.choices[0]?.text || reply;
    }

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
    console.error("Error calling DeepSeek:", err);
    res.json({ response: `❌ Error: ${err.message}` });
  }
});

// ---------------- Authentication APIs ----------------
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Account created successfully", user: data.user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Logged in successfully", session: data.session });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- Serve Frontend ----------------
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------- Supabase Heartbeat ----------------
const heartbeat = async () => {
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/sessions?select=id&limit=1`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!resp.ok) {
      console.warn("⚠️ Supabase heartbeat failed:", resp.status);
      return;
    }

    const data = await resp.json();
    console.log(`💓 Supabase heartbeat successful. Sample ID: ${data?.[0]?.id || "N/A"}`);
  } catch (err) {
    console.error("❌ Heartbeat error:", err.message);
  }
};

// Run heartbeat every 4 minutes to prevent idle pause
setInterval(heartbeat, 4 * 60 * 1000);
heartbeat(); // Initial heartbeat

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Qlasar server running on port ${PORT}`));
