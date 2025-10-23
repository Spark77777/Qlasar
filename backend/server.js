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
const NEWS_API_KEY = process.env.NEWS_API_KEY; // 🆕 Add this
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;
const PROACTIVE_SYSTEM_PROMPT = process.env.PROACTIVE_SYSTEM_PROMPT;

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

    const systemMessage = { role: "system", content: SYSTEM_PROMPT.trim() };

    const formattedMessages = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const payload = {
      model: "qwen/qwen3-235b-a22b:free",
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

    console.log("🌐 OpenRouter HTTP Status:", response.status);
    const text = await response.text();

    if (!response.ok) {
      console.error("❌ OpenRouter Error:", response.status, text);
      return res.status(500).json({ error: `OpenRouter Error ${response.status}`, details: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("⚠️ Failed to parse OpenRouter response:", text);
      return res.status(500).json({ error: "Invalid JSON response", raw: text });
    }

    let reply = data?.choices?.[0]?.message?.content;
    reply = reply?.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (!reply) throw new Error("No valid message content");

    res.json({ reply });
  } catch (err) {
    console.error("❌ Model request failed:", err.message);
    res.status(500).json({ error: `Model request failed: ${err.message}` });
  }
});


// 🆕 --- PROACTIVE ALERTS ROUTE ---
app.get("/api/alerts", async (req, res) => {
  try {
    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: "Missing NEWS_API_KEY in environment variables." });
    }

    console.log("📰 Fetching latest tech news...");
    const newsResponse = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    const newsData = await newsResponse.json();

    if (!newsResponse.ok) {
      console.error("❌ NewsAPI Error:", newsData);
      return res.status(500).json({ error: "Failed to fetch news", details: newsData });
    }

    const articles = newsData.articles || [];
    const combinedText = articles
      .map((a) => `Title: ${a.title}\nDescription: ${a.description}`)
      .join("\n\n");

    console.log("🧠 Summarizing tech news via OpenRouter...");

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-235b-a22b:free",
        messages: [
          { role: "system", content: PROACTIVE_SYSTEM_PROMPT },
          { role: "user", content: combinedText },
        ],
        temperature: 0.7,
        max_output_tokens: 500,
      }),
    });

    const aiText = await aiResponse.text();
    if (!aiResponse.ok) {
      console.error("❌ OpenRouter (Proactive) Error:", aiResponse.status, aiText);
      return res.status(500).json({ error: `OpenRouter Proactive Error ${aiResponse.status}`, details: aiText });
    }

    let aiData;
    try {
      aiData = JSON.parse(aiText);
    } catch (parseErr) {
      console.error("⚠️ Failed to parse AI response:", aiText);
      return res.status(500).json({ error: "Invalid AI response JSON", raw: aiText });
    }

    let summary = aiData?.choices?.[0]?.message?.content || "No summary generated.";
    summary = summary.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    res.json({ alerts: summary });
  } catch (err) {
    console.error("❌ Proactive Alerts failed:", err.message);
    res.status(500).json({ error: `Proactive Alerts failed: ${err.message}` });
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
