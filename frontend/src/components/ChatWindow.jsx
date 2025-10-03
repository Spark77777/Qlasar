import React, { useState } from "react";

export default function ChatWindow({ toggleAlerts }) {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { type: "user", text: input }]);
    setInput("");
    // Placeholder for backend API call
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Qlasar response will appear here." },
      ]);
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Current Session</h2>
        <button
          onClick={toggleAlerts}
          className="bg-orange-500 text-white px-3 py-1 rounded"
        >
          Proactive Alerts
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 my-1 rounded max-w-xs ${
              msg.type === "user" ? "bg-teal-200 self-end" : "bg-white self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded mr-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-teal-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
