import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fetch from "node-fetch";

// ================= INTERNAL LOGIC =================
let SYSTEM_PROMPT = "You are Qlasar, a proactive AI assistant.";
try {
  const { systemPrompt } = await import("./internalLogic.js");
  if (typeof systemPrompt === "string") SYSTEM_PROMPT = systemPrompt;
} catch {
  console.warn("⚠️ internalLogic.js not found, using fallback.");
}

// ================= APP SETUP =================
const app = express();
app.use(express.json());
app.use(cors());

// ================= ENV =================
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  OPENROUTER_KEY,
  NEWSAPI_KEY,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENROUTER_KEY) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// ================= SUPABASE =================
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// ================= SUPABASE HEARTBEAT =================
const supabaseHeartbeat = async () => {
  try {
    const { error } = await supabase
      .from("profiles") // any lightweight table
      .select("id")
      .limit(1);

    if (error) throw error;
    console.log("💓 Supabase heartbeat OK");
  } catch (err) {
    console.error("⚠️ Supabase heartbeat failed:", err.message);
  }
};

// Run immediately + every 4 minutes
supabaseHeartbeat();
setInterval(supabaseHeartbeat, 4 * 60 * 1000);

// ================= AUTH ROUTES =================

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;

    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({
      access_token: data.session.access_token,
      user: data.user,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ================= AI CHAT =================
app.post("/api/generate", async (req, res) => {
  try {
    const { messages } = req.body;

    const payload = {
      model: "mistralai/devstral-2512:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }))
      ],
      temperature: 0.7,
      max_output_tokens: 600
    };

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    let reply = data?.choices?.[0]?.message?.content || "";

    // Strip internal thoughts
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ALERTS =================
app.get("/api/alerts", async (req, res) => {
  if (!NEWSAPI_KEY) {
    return res.json({
      alerts: [{ title: "AI breakthrough", source: "Qlasar" }],
    });
  }

  const url = `https://newsapi.org/v2/everything?q=AI&apiKey=${NEWSAPI_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  res.json({
    alerts: data.articles.map(a => ({
      title: a.title,
      source: a.source.name,
      url: a.url
    }))
  });
});

// ================= FRONTEND =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));
app.get("*", (_, res) =>
  res.sendFile(path.join(frontendPath, "index.html"))
);

// ================= SERVER =================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Qlasar backend running on ${PORT}`)
);
