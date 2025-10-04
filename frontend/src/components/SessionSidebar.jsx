import React from "react";

export default function SessionSidebar({ close }) {
  return (
    <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-lg z-30 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Sessions</h2>
        <button onClick={close} className="text-gray-500 hover:text-gray-700">
          ✖
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-400">No sessions yet. Start chatting!</p>
      </div>
    </div>
  );
}
