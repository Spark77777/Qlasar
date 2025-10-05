import React, { useState, useRef, useEffect } from "react";

export default function ChatWindow() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [dots, setDots] = useState("");
  const scrollRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, dots]);

  // Animate dots while thinking
  useEffect(() => {
    if (!isThinking) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { sender: "bot", text: "❌ Couldn't reach backend" };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              margin: "8px 0",
              textAlign: msg.sender === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: msg.sender === "user" ? "#1976d2" : "#e0e0e0",
                color: msg.sender === "user" ? "#fff" : "#000",
                maxWidth: "80%",
                wordWrap: "break-word",
              }}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          </div>
        ))}

        {/* Qlasar is thinking indicator */}
        {isThinking && (
          <div style={{ margin: "8px 0", textAlign: "left" }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: "#e0e0e0",
                color: "#555",
                fontStyle: "italic",
              }}
            >
               Qlasar is thinking{dots}
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "5px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "16px",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
