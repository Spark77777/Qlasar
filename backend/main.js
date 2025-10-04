import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MODEL_ID = "x-ai/grok-4-fast:free"; // from your HF PoC
const OR_KEY = process.env.OPENROUTER_KEY;

// ---------------- Qlasar endpoint ----------------
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  const system_message = `
You are Qlasar, an AI scout. Only for detailed questions, provide four sections:
1. Answer
2. Counterarguments
3. Blindspots
4. Conclusion

For simple questions, provide a normal answer without these sections.
`;

  const messages = [{ role: "system", content: system_message }];
  if (history && Array.isArray(history)) {
    history.forEach(([u, b]) => {
      messages.push({ role: "user", content: u });
      messages.push({ role: "assistant", content: b });
    });
  }
  messages.push({ role: "user", content: message });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "❌ No reply received";

    res.json({ reply });
  } catch (err) {
    res.json({ reply: `❌ Error: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Qlasar backend running on port ${PORT}`);
});
