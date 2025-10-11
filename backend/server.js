// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ ES Modules (__dirname fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const OR_KEY = process.env.OPENROUTER_KEY;

// ---------------- API Route ----------------
app.post("/api/generate", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📥 User input:", message);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-8b:free",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const aiContent =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      JSON.stringify(data);

    console.log("💬 AI reply:", aiContent);
    res.json({ response: aiContent });
  } catch (err) {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ response: "⚠️ Server error. Try again later." });
  }
});

// ---------------- Frontend Path Resolver (Auto from vite.config.js) ----------------
function resolveFrontendPath() {
  const viteConfigPath = path.join(__dirname, "../frontend/vite.config.js");
  if (!fs.existsSync(viteConfigPath)) {
    console.warn("⚠️ vite.config.js not found, falling back to default paths.");
    return defaultFrontendPaths();
  }

  try {
    // Dynamically import vite config
    const require = createRequire(import.meta.url);
    const viteConfig = require(viteConfigPath);

    let outDir = "dist"; // default
    if (viteConfig?.build?.outDir) {
      outDir = viteConfig.build.outDir;
    }

    // Resolve absolute path
    const frontendBuildPath = path.isAbsolute(outDir) ? outDir : path.join(__dirname, "../frontend", outDir);

    if (fs.existsSync(frontendBuildPath) && fs.existsSync(path.join(frontendBuildPath, "index.html"))) {
      console.log(`✅ Frontend build detected at: ${frontendBuildPath}`);
      return frontendBuildPath;
    } else {
      console.warn(`⚠️ Frontend build folder not found at: ${frontendBuildPath}`);
      return defaultFrontendPaths();
    }
  } catch (err) {
    console.error("❌ Error reading vite.config.js:", err);
    return defaultFrontendPaths();
  }
}

function defaultFrontendPaths() {
  const possiblePaths = [
    path.join(__dirname, "public"),
    path.join(__dirname, "../frontend/dist"),
    path.join(__dirname, "../frontend/build"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      console.log(`✅ Frontend build detected at: ${p}`);
      return p;
    }
  }

  console.error("❌ No frontend build detected! Run `npm run build` in frontend.");
  process.exit(1);
}

const frontendPath = resolveFrontendPath();

// ---------------- Serve Frontend ----------------
app.use(express.static(frontendPath));

// ✅ SPA routing (React Router support)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Qlasar server running on port ${PORT}`);
  console.log(`🌐 Access it at: http://localhost:${PORT}`);
});
