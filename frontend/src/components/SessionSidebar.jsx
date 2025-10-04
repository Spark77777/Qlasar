import React from "react";

export default function SessionSidebar({ close, sessions = [] }) {
  return (
    <div className="fixed top-14 left-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow-lg z-30 overflow-y-auto transition-transform transform">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-bold text-lg">Sessions</h2>
        <button
          onClick={close}
          className="text-gray-500 hover:text-gray-800 font-bold"
        >
          ✕
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {sessions.length === 0 ? (
          <div className="text-gray-400">No sessions yet.</div>
        ) : (
          sessions.map((session, idx) => (
            <div
              key={idx}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
            >
              <div className="font-semibold">{session.name || `Session ${idx + 1}`}</div>
              <div className="text-sm text-gray-600 truncate">{session.preview || "No preview available"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
