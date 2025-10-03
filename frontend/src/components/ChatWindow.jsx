import React, { useState } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: "Qlasar", text: "Hello! I'm Qlasar. How can I help you today?" },
    { role: "You", text: "Show me how the UI looks!" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "You", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-xs ${
              msg.role === "You"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200"
            }`}
          >
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex">
        <input
          className="flex-1 border border-gray-300 rounded-l p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}
