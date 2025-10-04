import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Root route for chat
app.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      max_tokens: 2000
    });

    const answer = response.choices?.[0]?.message?.content || "Qlasar couldn't generate a response.";
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Qlasar couldn't generate a response." });
  }
});

app.listen(port, () => {
  console.log(`Qlasar backend running at http://localhost:${port}`);
});
