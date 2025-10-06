import React, { useState, useRef, useEffect } from "react";

export default function ChatWindow({ sessionName = "Session 1" }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response, timestamp: new Date() };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { sender: "bot", text: "❌ Couldn't reach backend", timestamp: new Date() };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(to bottom, #ffffff, #f5f5f5)" }}>
      
      {/* Top Bar */}
      <div style={{
        height: "60px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ fontWeight: "bold", fontSize: "18px", cursor: "pointer" }}>Qlasar</div>
        <div style={{ fontSize: "16px", color: "#333" }}>{sessionName}</div>
        <div style={{ cursor: "pointer" }}>⚙️</div>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 16px",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "6px 0", display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              backgroundColor: msg.sender === "user" ? "#4A90E2" : "#F1F1F1",
              color: msg.sender === "user" ? "#fff" : "#333",
              padding: "10px 14px",
              borderRadius: "20px",
              maxWidth: "80%",
              wordWrap: "break-word",
              boxShadow: msg.sender === "bot" ? "0px 1px 3px rgba(0,0,0,0.1)" : "none"
            }}>
              {msg.text}
              {/* Optional timestamp */}
              <div style={{ fontSize: "10px", color: "#666", marginTop: "4px", textAlign: "right" }}>
                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start", margin: "6px 0" }}>
            <div style={{
              backgroundColor: "#F1F1F1",
              padding: "10px 14px",
              borderRadius: "20px",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              gap: "4px"
            }}>
              <div className="dot" style={{
                width: "6px", height: "6px", backgroundColor: "#333", borderRadius: "50%",
                animation: "bounce 1s infinite alternate"
              }}></div>
              <div className="dot" style={{
                width: "6px", height: "6px", backgroundColor: "#333", borderRadius: "50%",
                animation: "bounce 1s infinite alternate 0.2s"
              }}></div>
              <div className="dot" style={{
                width: "6px", height: "6px", backgroundColor: "#333", borderRadius: "50%",
                animation: "bounce 1s infinite alternate 0.4s"
              }}></div>
            </div>
          </div>
        )}

        {/* Typing animation */}
        <style>{`
          @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-4px); }
          }
        `}</style>
      </div>

      {/* Input Area */}
      <div style={{
        display: "flex",
        padding: "10px 16px",
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        position: "sticky",
        bottom: 0,
        alignItems: "center",
        gap: "8px"
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "30px",
            border: "1px solid #CCC",
            outline: "none",
            fontSize: "16px",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)"
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#4A90E2",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
