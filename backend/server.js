// ---------------- Qlasar Chatbot API ----------------
const MODEL_ID = "deepseek/deepseek-chat-v3.1:free"; // updated model

app.post("/api/message", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  const systemMessage = `
You are Qlasar, an AI scout. Respond clearly and helpfully.

- For normal messages, answer concisely or in structured four-section format (Answer, Counterarguments, Blindspots, Conclusion) if the question is complex.
- For gibberish, unclear, or short nonsensical messages, do not try to answer directly. Instead, ask for clarification politely, e.g., "Did you mean this or that?" or "Could you clarify your question?".
- Use clean formatting: no <s> tags, no markdown headers like ###, no trailing <br><br>.
- Use bold <b> and italics <i> only if necessary.
`;

  const payload = {
    model: MODEL_ID,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 512
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OR_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    let reply = data.choices?.[0]?.message?.content || "❌ No response from model";

    // Clean formatting
    reply = reply
      .replace(/<\/?s>/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/^- (.*)/gm, "• $1")
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .replace(/(<br>\s*)+$/g, "")
      .trim();

    res.json({ response: reply });
  } catch (err) {
    console.error("Error:", err);
    res.json({ response: `❌ Error: ${err.message}` });
  }
});
