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

  if (typeof systemPrompt === "string") {
    SYSTEM_PROMPT = systemPrompt;
  }
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
  NEWS_API_KEY,
} = process.env;

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !OPENROUTER_KEY
) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// ================= SUPABASE =================
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// ================= CONFIG =================
const MAX_USERS = 100;

// ================= AUTH MIDDLEWARE =================
async function getUserFromToken(req, res, next) {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({
        error: "Missing auth token"
      });
    }

    const token = auth.replace("Bearer ", "");

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Invalid token"
      });
    }

    req.user = user;

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);

    res.status(500).json({
      error: "Authentication failed"
    });
  }
}

// ================= SUPABASE HEARTBEAT =================
const supabaseRestHeartbeat = async () => {
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`;

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization:
          `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    console.log("💓 Supabase REST heartbeat OK");

  } catch (err) {
    console.error(
      "⚠️ Supabase REST heartbeat failed:",
      err.message
    );
  }
};

supabaseRestHeartbeat();

setInterval(
  supabaseRestHeartbeat,
  4 * 60 * 1000
);

// ================= AUTH ROUTES =================

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { count, error: countError } =
      await supabase
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true
        });

    if (countError) {
      throw countError;
    }

    if (count >= MAX_USERS) {
      return res.status(403).json({
        error:
          "🚫 Beta is full. Only 100 users allowed for now."
      });
    }

    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (error) {
      throw error;
    }

    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
    });

    res.json({
      success: true
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    res.status(400).json({
      error: err.message
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    res.json({
      access_token: data.session.access_token,
      user: data.user,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(401).json({
      error: err.message
    });
  }
});

// ================= USER SESSION ROUTES =================

// CREATE SESSION
app.post(
  "/api/sessions",
  getUserFromToken,
  async (req, res) => {
    try {
      const { title } = req.body;

      const { data, error } = await supabase
        .from("user_sessions")
        .insert({
          user_id: req.user.id,
          title: title || "New chat",
          messages: []
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json(data);

    } catch (err) {
      console.error("CREATE SESSION ERROR:", err);

      res.status(400).json({
        error: err.message
      });
    }
  }
);

// LIST SESSIONS
app.get(
  "/api/sessions",
  getUserFromToken,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("id, title, created_at")
        .eq("user_id", req.user.id)
        .order("created_at", {
          ascending: false
        });

      if (error) {
        throw error;
      }

      res.json(data);

    } catch (err) {
      console.error("LIST SESSIONS ERROR:", err);

      res.status(400).json({
        error: err.message
      });
    }
  }
);

// LOAD SESSION
app.get(
  "/api/sessions/:id",
  getUserFromToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

      if (error) {
        throw error;
      }

      res.json(data);

    } catch (err) {
      console.error("LOAD SESSION ERROR:", err);

      res.status(400).json({
        error: err.message
      });
    }
  }
);

// RENAME SESSION
app.patch(
  "/api/sessions/:id",
  getUserFromToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          error: "Title is required."
        });
      }

      const { error } = await supabase
        .from("user_sessions")
        .update({
          title: title.trim()
        })
        .eq("id", id)
        .eq("user_id", req.user.id);

      if (error) {
        throw error;
      }

      res.json({
        success: true
      });

    } catch (err) {
      console.error("RENAME SESSION ERROR:", err);

      res.status(400).json({
        error: err.message
      });
    }
  }
);

// ADD MESSAGE
app.post(
  "/api/sessions/:id/messages",
  getUserFromToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { sender, text } = req.body;

      const {
        data: session,
        error: e1
      } = await supabase
        .from("user_sessions")
        .select("messages")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

      if (e1) {
        throw e1;
      }

      const updated = [
        ...(session.messages || []),
        { sender, text }
      ];

      const { error: e2 } = await supabase
        .from("user_sessions")
        .update({
          messages: updated
        })
        .eq("id", id)
        .eq("user_id", req.user.id);

      if (e2) {
        throw e2;
      }

      res.json({
        success: true
      });

    } catch (err) {
      console.error("ADD MESSAGE ERROR:", err);

      res.status(400).json({
        error: err.message
      });
    }
  }
);

// DELETE SESSION
app.delete(
  "/api/sessions/:id",
  getUserFromToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", id)
        .eq("user_id", req.user.id);

      if (error) {
        throw error;
      }

      res.json({
        success: true
      });

    } catch (err) {
      console.error("DELETE SESSION ERROR:", err);

      res.status(400).json({
        error: err.message
      });
    }
  }
);

// ================= AI CHAT =================
app.post("/api/generate", async (req, res) => {
  try {
    const { messages } = req.body;

    const payload = {
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },

        ...messages.map(m => ({
          role:
            m.sender === "user"
              ? "user"
              : "assistant",

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
          Authorization:
            `Bearer ${OPENROUTER_KEY}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    let reply =
      data?.choices?.[0]?.message?.content || "";

    reply = reply
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();

    res.json({
      reply
    });

  } catch (err) {
    console.error("AI GENERATE ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

// ================= ALERTS =================
app.get("/api/alerts", async (req, res) => {
  try {

    if (!NEWS_API_KEY) {
      return res.json({
        alerts: [
          {
            title: "AI breakthrough",
            source: "Qlasar"
          }
        ],
      });
    }

    const keywords = [
      "startup",
      "AI business",
      "SaaS",
      "freelancing",
      "funding"
    ];

    const query = keywords.join(" OR ");

    const url =
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevance&pageSize=10&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "❌ NewsAPI HTTP Error:",
        response.status
      );

      return res.status(500).json({
        error: "News API HTTP error"
      });
    }

    const data = await response.json();

    if (data.status !== "ok") {
      console.error(
        "❌ NewsAPI Error:",
        data
      );

      return res.status(500).json({
        error:
          data.message || "NewsAPI failed"
      });
    }

    const articles = (data.articles || [])
      .slice(0, 10)
      .map(article => ({
        title: article.title,
        source: article.source?.name,
        url: article.url,
        type: "opportunity"
      }));

    res.json({
      alerts: articles
    });

  } catch (err) {
    console.error(
      "🔥 ALERT FETCH CRASH:",
      err
    );

    res.status(500).json({
      error:
        "Server error fetching alerts"
    });
  }
});

// ================= PROACTIVE ALERTS =================
app.post("/api/proactive", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Topic is required"
      });
    }

    if (!NEWS_API_KEY) {
      return res.json({
        response:
          "⚠️ NEWS_API_KEY missing."
      });
    }

    const url =
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&pageSize=8&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({
        error:
          `NewsAPI HTTP ${response.status}`
      });
    }

    const data = await response.json();

    if (data.status !== "ok") {
      return res.status(500).json({
        error:
          data.message || "NewsAPI failed"
      });
    }

    const articles = data.articles || [];

    if (!articles.length) {
      return res.json({
        response:
          `No alerts found for "${topic}".`
      });
    }

    const formatted = articles
      .slice(0, 8)
      .map(
        (a, i) =>
          `${i + 1}. ${a.title}\nSource: ${a.source?.name}\n${a.url}`
      )
      .join("\n\n");

    res.json({
      response: formatted
    });

  } catch (err) {
    console.error(
      "🔥 PROACTIVE ALERT ERROR:",
      err
    );

    res.status(500).json({
      error:
        "Server error fetching proactive alerts"
    });
  }
});

// ================= FRONTEND =================
const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

// ✅ React/Vite production build
const frontendPath =
  path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

app.get("*", (_, res) => {
  res.sendFile(
    path.join(frontendPath, "index.html")
  );
});

// ================= SERVER =================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `🚀 Qlasar backend running on ${PORT}`
  );
});
