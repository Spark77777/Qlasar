// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

// ---------------- Serve Frontend ----------------
// ✅ Explicit known path for Render build environment
const frontendPath = "/opt/render/project/src/frontend/dist";

if (fs.existsSync(frontendPath)) {
  console.log(`✅ Serving frontend from: ${frontendPath}`);
  app.use(express.static(frontendPath));
} else {
  console.error(`❌ Frontend path not found: ${frontendPath}`);
  console.error("➡️ Run `npm run build` in the frontend directory.");
}

// ✅ SPA routing (for React Router)
app.get("*", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.error(`❌ index.html not found at: ${indexPath}`);
    return res.status(404).send(`
      <h2>❌ Frontend not found!</h2>
      <p>Expected file: ${indexPath}</p>
    `);
  }

  console.log("📄 Serving index.html");
  res.sendFile(indexPath);
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Qlasar server running on port ${PORT}`);
  console.log(`🌐 Access it at: http://localhost:${PORT}`);
});
