import express from "express";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// --- ENVIRONMENT VARIABLES ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

// --- CHECK ENV ---
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials in environment variables!");
  process.exit(1);
}
if (!OPENROUTER_KEY) {
  console.error("❌ Missing OpenRouter API key in environment variables!");
  process.exit(1);
}

// --- SUPABASE CLIENT ---
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- OPENROUTER KEY CHECK ---
(async () => {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log("✅ OpenRouter Key Status:\n", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error checking OpenRouter key:", err.message);
  }
})();

// --- SUPABASE HEARTBEAT ---
const heartbeat = async () => {
  try {
    const { error } = await supabase.from("Session").select("id").limit(1);
    if (error) throw error;
    console.log("💓 Supabase heartbeat OK");
  } catch (err) {
    console.error("⚠️ Supabase heartbeat failed:", err.message);
  }
};
setInterval(heartbeat, 240000); // every 4 minutes
heartbeat();

// --- API ROUTES ---

// Health check
app.get("/api/health", (req, res) => {
  res.send("🚀 Server is running and healthy!");
});

// Store session
app.post("/api/session", async (req, res) => {
  try {
    const { session_name, messages } = req.body;
    const { error } = await supabase
      .from("Session")
      .insert([{ name: session_name, messages }]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to store session:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generate AI response
app.post("/api/generate", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      console.warn("⚠️ Invalid messages payload:", messages);
      return res.status(400).json({ error: "Invalid messages array." });
    }

    // Map messages to OpenRouter format (role + content)
    const input = messages.map(msg => ({
      role: msg.role,        // 'system', 'user', or 'assistant'
      content: msg.content   // message text
    }));

    const payload = {
      model: "deepseek/deepseek-chat-v3.1:free",
      input,                  // <-- OpenRouter expects 'input' array
      temperature: 0.7,
      max_output_tokens: 512
    };

    console.log("📝 Sending request to OpenRouter:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log("📦 OpenRouter response:", JSON.stringify(data, null, 2));

    if (!data?.choices?.[0]?.message?.content) {
      console.error("⚠️ No valid response from model.");
      return res.status(500).json({
        error: "Couldn't get AI response. See server logs for details.",
        rawResponse: data,
      });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("❌ Model request failed:", err.message);
    res.status(500).json({ error: `Model request failed: ${err.message}` });
  }
});

// --- SERVE FRONTEND ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// React/Vite SPA fallback
app.get("*", (req, res) => {
  const indexFile = path.join(frontendPath, "index.html");
  console.log("📂 Serving frontend:", indexFile);
  res.sendFile(indexFile, (err) => {
    if (err) {
      console.error("❌ Error serving frontend:", err);
      res.status(500).send("Frontend not found.");
    }
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
