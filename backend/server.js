import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

app.get("/", (req, res) => {
  res.json({ message: "Qlasar backend is running" });
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "You are Qlasar, a helpful AI assistant." },
          { role: "user", content: question },
        ],
      }),
    });
    const data = await response.json();
    const answer = data.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Error connecting to OpenRouter API." });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
