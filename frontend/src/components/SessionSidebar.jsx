import React from "react";

export default function SessionSidebar({ activeSession, setActiveSession }) {
  const sessions = ["General", "Research", "Learning"];

  return (
    <div className="w-64 border-r border-gray-300 p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Sessions</h2>
      {sessions.map((s) => (
        <div
          key={s}
          onClick={() => setActiveSession(s)}
          className={`p-2 mb-2 rounded cursor-pointer ${
            s === activeSession ? "bg-teal-500 text-white" : "bg-gray-200"
          }`}
        >
          {s}
        </div>
      ))}
      <button className="mt-auto p-2 bg-gray-400 text-white rounded">New Session</button>
    </div>
  );
}
