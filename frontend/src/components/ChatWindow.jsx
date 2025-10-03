import React, { useState } from "react";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();
    const input = e.target.elements.message;
    if (!input.value.trim()) return;
    setMessages([...messages, { type: "user", text: input.value }]);
    input.value = "";
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded max-w-xs ${
              msg.type === "user" ? "bg-teal-200 self-end" : "bg-white self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex">
        <input
          name="message"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-l border border-gray-300"
        />
        <button
          type="submit"
          className="bg-teal-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
