const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: "https://qlasarai.onrender.com", // frontend URL
  credentials: true, // if sending cookies/auth headers
}));

app.use(express.json());

// Example endpoint for Chat
app.post("/api/message", (req, res) => {
  const { message } = req.body;
  
  // TODO: Replace with your actual AI response logic
  res.json({ response: `You sent: ${message}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
