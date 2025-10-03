import React, { useState } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;
    setMessages([...messages, { type: "user", text: input }]);
    setInput("");
    setMessages((prev) => [...prev, { type: "bot", text: "Qlasar says: (placeholder reply)" }]);
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${msg.type === "user" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded p-2 mr-2"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
