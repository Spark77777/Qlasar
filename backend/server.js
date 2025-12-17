import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";

// ✅ Import internal logic (if available)
let SYSTEM_PROMPT = "You are Qlasar, a proactive AI that helps users intelligently and creatively.";
try {
  const { systemPrompt } = await import("./internalLogic.js");
  if (systemPrompt && typeof systemPrompt === "string") {
    SYSTEM_PROMPT = systemPrompt;
    console.log("🧠 Internal logic loaded successfully.");
  } else {
    console.warn("⚠️ internalLogic.js found, but systemPrompt invalid. Using fallback.");
  }
} catch (err) {
  console.warn("⚠️ internalLogic.js not found. Using fallback system prompt.");
}

// --- INITIAL SETUP ---
const app = express();
app.use(express.json());
app.use(cors());

// --- ENVIRONMENT VARIABLES ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const NEWSAPI_KEY = process.env.NEWS_API_KEY;

// --- ENVIRONMENT CHECKS ---
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

    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPT.trim(),
    };

    const formattedMessages = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const payload = {
      model: "mistralai/devstral-2512:free",
      messages: [systemMessage, ...formattedMessages],
      temperature: 0.7,
      max_output_tokens: 600,
    };

    console.log("📝 Sending request to OpenRouter...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("⚠️ Could not parse response:", text);
      return res.status(500).json({ error: "Invalid JSON from model", raw: text });
    }

    // --- Extract message ---
    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.output_text ||
      null;

    if (reply) {
      // Remove <think> blocks and reasoning markers
      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      reply = reply.replace(/^(Qlasar\s+thinks[:\-]?\s*|Analyzing[:\-]?\s*)/i, "").trim();
    }

    if (!reply) {
      console.error("⚠️ No message content in model response:", data);
      throw new Error("No valid message content received from model");
    }

    res.json({ reply });
  } catch (err) {
    console.error("❌ Model request failed:", err.message);
    res.status(500).json({ error: `Model request failed: ${err.message}` });
  }
});

// Real-time alerts from NewsAPI
app.get("/api/alerts", async (req, res) => {
  try {
    if (!NEWSAPI_KEY) {
      console.warn("⚠️ NEWSAPI_KEY missing — using fallback alerts.");
      return res.json({
        alerts: [
          { id: 1, title: "AI Chip Breakthrough", summary: "New AI chip reduces power usage by 40%." },
          { id: 2, title: "Quantum Leap", summary: "Researchers achieve stable quantum coherence for 10 seconds." },
          { id: 3, title: "OpenAI releases new model", summary: "GPT-5 outperforms benchmarks with multimodal reasoning." },
          { id: 4, title: "Tesla AI Day", summary: "Elon Musk announces new AI-driven manufacturing process." },
        ],
      });
    }

    const url = `https://newsapi.org/v2/everything?q=artificial%20intelligence%20OR%20AI%20OR%20OpenAI%20OR%20machine%20learning&language=en&sortBy=publishedAt&pageSize=6&apiKey=${NEWSAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.articles) {
      throw new Error(data.message || "Failed to fetch news from API");
    }

    const alerts = data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      summary: article.description || article.content || "No details available.",
      url: article.url,
      source: article.source?.name || "Unknown Source",
      publishedAt: article.publishedAt,
    }));

    res.json({ alerts });
  } catch (err) {
    console.error("❌ Failed to fetch real-time alerts:", err.message);
    res.status(500).json({
      error: `Failed to fetch alerts: ${err.message}`,
    });
  }
});

// Serve frontend (static)
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

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
