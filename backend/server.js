import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// --- INITIAL SETUP ---
const app = express();
app.use(express.json());
app.use(cors());

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
setInterval(heartbeat, 240000);
heartbeat();

// --- ROUTES ---

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

    // --- SYSTEM PROMPT ---
    const systemMessage = {
      role: "system",
      content: `
You are **Qlasar**, an AI Scout designed to reason deeply, think critically, and guide wisely.

For each user query:
- If it requires **in-depth reasoning or analysis**, respond in four structured sections:
  1. **Answer** — Provide a direct, reasoned, and insightful explanation.
  2. **Counterarguments** — Present balanced opposing views or interpretations.
  3. **Blindspots** — Reveal missing angles, uncertainties, or overlooked aspects.
  4. **Conclusion** — Summarize the key insight and end with a short *reflective thought*.

- If the query is **simple, factual, or conversational**, respond naturally like a standard AI — concise, direct, and without using the 4-section format.

Rules:
- Never ask your own questions.
- Never assume user intent.
- Stay logical, fluent, and tonally consistent.
- Always focus on clarity and balance.
`.trim(),
    };

    // --- FORMAT MESSAGES ---
    const formattedMessages = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    // --- BUILD PAYLOAD ---
    const payload = {
      model: "qwen/qwen3-235b-a22b:free",
      messages: [systemMessage, ...formattedMessages],
      temperature: 0.7,
      max_output_tokens: 600,
    };

    console.log("📝 Sending request to OpenRouter...");
    console.log(JSON.stringify(payload, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("🌐 OpenRouter HTTP Status:", response.status);

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ OpenRouter Error:", response.status, text);
      return res.status(500).json({
        error: `OpenRouter Error ${response.status}`,
        details: text,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("⚠️ Failed to parse OpenRouter response:", text);
      return res.status(500).json({
        error: "Invalid JSON response from OpenRouter",
        raw: text,
      });
    }

    console.log("📦 Parsed OpenRouter Response:", JSON.stringify(data, null, 2));

    let reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      console.error("⚠️ No valid message content:", data);
      return res.status(500).json({ error: "No valid message from model", raw: data });
    }

    // --- 🧹 CLEAN THINK BLOCKS ---
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // --- SEND RESPONSE ---
    res.json({ reply });
  } catch (err) {
    console.error("❌ Model request failed:", err.message);
    res.status(500).json({ error: `Model request failed: ${err.message}` });
  }
});

// --- SERVE FRONTEND (OPTIONAL) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  const indexFile = path.join(frontendPath, "index.html");
  res.sendFile(indexFile, (err) => {
    if (err) res.status(500).send("Frontend not found.");
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    
