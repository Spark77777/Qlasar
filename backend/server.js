// backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// Load OpenRouter key from environment
const OR_KEY = process.env.OPENROUTER_KEY;

// Mistral 7B Instruct (Free)
const MODEL_ID = "mistralai/mistral-7b-instruct:free";

// ---------------- Qlasar Chatbot API ----------------
app.post("/api/message", async (req, res) => {
const { message } = req.body;
if (!message) return res.status(400).json({ error: "No message provided" });

const systemMessage = `You are Qlasar, an AI scout. Only for those questions that need detailed and well-structured answer, provide four sections:
1. Answer: main response
2. Counterarguments: possible opposing views
3. Blindspots: missing considerations or overlooked aspects
4. Conclusion: encourage the user to think critically and gain insight
Format the response clearly with headings and end with a reflective thought for the user.
For simple questions or those questions which do not need detailed or in-depth answer, provide answers as a General AI would. Do not provide answer in four sections. Also do not provide reflective thought.`;

const payload = {
model: MODEL_ID,
messages: [
{ role: "system", content: systemMessage },
{ role: "user", content: message }
],
temperature: 0.7,
top_p: 0.95,
max_tokens: 1024
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

// Safely extract reply  
let reply = data.choices && data.choices[0]?.message?.content  
  ? data.choices[0].message.content  
  : "❌ No response from model";  

// Clean and reformat response  
reply = reply  
  .replace(/<\/?s>/g, "")                   // remove <s> or </s>  
  .replace(/^#+\s*/gm, "")                  // remove markdown headers  
  .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")   // convert bold  
  .replace(/\*(.*?)\*/g, "<i>$1</i>")       // convert italics  
  .replace(/\n{2,}/g, "<br><br>")           // handle spacing  
  .replace(/^- (.*)/gm, "• $1")             // format bullets  
  .trim();  

res.json({ response: reply });

} catch (err) {
console.error("Error:", err);
res.json({ response: `❌ Error: ${err.message}` });
}
});

// ---------------- Serve Frontend Build ----------------
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Handle React Router fallback (avoid blank page)
app.get("*", (req, res) => {
res.sendFile(path.join(frontendPath, "index.html"));
});

// Use Render’s dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(🚀 Qlasar server running on port ${PORT}));
