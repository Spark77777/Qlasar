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

const PORT = process.env.PORT || 5000;
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
    console.log("📤 Raw response:", JSON.stringify(data, null, 2));

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
const publicDir = path.join(__dirname, "public");
console.log("🧭 Public directory path:", publicDir);

// ✅ Verify directory exists before serving
if (!fs.existsSync(publicDir)) {
  console.warn("⚠️ WARNING: Public directory does not exist!");
  console.warn("➡️ Run `npm run build` in /frontend to generate it.");
} else {
  console.log("✅ Public directory found!");
}

app.use(express.static(publicDir));

// ✅ SPA routing (React Router support)
app.get("*", (req, res) => {
  const indexPath = path.join(publicDir, "index.html");

  // Debug if index.html exists
  if (!fs.existsSync(indexPath)) {
    console.error("❌ index.html not found at:", indexPath);
    return res
      .status(404)
      .send(
        `<h2>❌ Frontend not found!</h2>
         <p>Check if <code>frontend/dist</code> or <code>backend/public</code> was built properly.</p>
         <p>Expected file: ${indexPath}</p>`
      );
  }

  console.log("📄 Serving frontend index.html");
  res.sendFile(indexPath);
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Qlasar server running on port ${PORT}`);
  console.log(`🌐 Access it at: http://localhost:${PORT}`);
});
