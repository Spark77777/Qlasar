import React from "react";

export default function ChatWindow({ sessionOpen, alertsOpen }) {
  const leftOffset = sessionOpen ? "30%" : "0";
  const rightOffset = alertsOpen ? "30%" : "0";

  return (
    <div
      className="absolute top-14 bottom-0 left-0 right-0 p-4 overflow-y-auto"
      style={{ marginLeft: leftOffset, marginRight: rightOffset, transition: "0.3s" }}
    >
      <div className="bg-white h-full rounded shadow p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Chat messages go here */}
          <p className="text-gray-500">Qlasar: Welcome! Ask me anything.</p>
        </div>
        <div className="mt-2 flex">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1 mr-2"
            placeholder="Type your message..."
          />
          <button className="bg-blue-500 text-white px-4 py-1 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
