import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "https://qlasar.pages.dev" })); // allow frontend
app.use(bodyParser.json());

// Dummy in-memory session store
let sessions = [];

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ response: "No message received." });

    // Placeholder response logic (replace with your AI model integration)
    const response = `You said: "${message}"`;

    sessions.push({ role: "user", content: message });
    sessions.push({ role: "assistant", content: response });

    res.json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ response: "Error generating response." });
  }
});

// Proactive alerts endpoint
app.get("/alerts", (req, res) => {
  res.json({
    alerts: [
      { id: 1, message: "Reminder: You have a pending task." },
      { id: 2, message: "Qlasar update available!" },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Qlasar backend running on port ${PORT}`);
});
