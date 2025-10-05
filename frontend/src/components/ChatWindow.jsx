import React, { useState } from "react";

export default function ChatWindow({ session }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;
    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      console.log("API response:", data); // Debug log
      setMessages((prev) => [...prev, { sender: "bot", text: data.response || "No response" }]);
    } catch (err) {
      console.error("API call failed:", err); // Network error log
      setMessages((prev) => [...prev, { sender: "bot", text: "Error: Could not reach backend." }]);
    }

    setInput("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.sender === "user" ? styles.userMsg : styles.botMsg}>
            {msg.text}
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message for ${session.name}`}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: { flex: 1, display: "flex", flexDirection: "column", border: "1px solid #ccc", borderRadius: "5px", padding: "10px" },
  messages: { flex: 1, overflowY: "auto", marginBottom: "10px" },
  userMsg: { textAlign: "right", margin: "5px", color: "blue" },
  botMsg: { textAlign: "left", margin: "5px", color: "green" },
  inputContainer: { display: "flex" },
  input: { flex: 1, padding: "5px" },
  button: { padding: "5px 10px", marginLeft: "5px" },
};
