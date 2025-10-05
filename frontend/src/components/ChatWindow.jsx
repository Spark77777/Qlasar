import React, { useState } from "react";

export default function ChatWindow() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await fetch(`${backendUrl}/api/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { sender: "bot", text: "Couldn't reach backend" };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(err);
    }

    setInput("");
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", flex: 1 }}>
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "5px 0" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "80%", marginRight: "5px" }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
