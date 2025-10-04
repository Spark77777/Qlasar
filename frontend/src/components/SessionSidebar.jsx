import React from "react";

export default function SessionSidebar({ close }) {
  return (
    <div className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-lg z-30 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Sessions</h2>
        <button onClick={close} className="text-gray-500 hover:text-gray-800">✕</button>
      </div>
      <div className="flex flex-col gap-2">
        {/* Example session items */}
        <div className="p-2 rounded bg-gray-100 cursor-pointer">Session 1</div>
        <div className="p-2 rounded bg-gray-100 cursor-pointer">Session 2</div>
        <div className="p-2 rounded bg-gray-100 cursor-pointer">Session 3</div>
      </div>
    </div>
  );
}
