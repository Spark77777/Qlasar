import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// Path setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// API route
app.post("/api/message", (req, res) => {
  const { message } = req.body;
  res.json({ reply: `Qlasar says: I received '${message}'` });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
