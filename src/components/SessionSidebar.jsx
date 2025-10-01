import React from "react";

export default function SessionSidebar({ sessions, activeSession, setActiveSession }) {
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-4 font-bold text-xl border-b">Qlasar</div>
      <div className="flex-1 overflow-y-auto">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`p-3 cursor-pointer ${
              s.id === activeSession.id ? "bg-teal-100 font-semibold" : ""
            }`}
            onClick={() => setActiveSession(s)}
          >
            {s.title}
          </div>
        ))}
      </div>
      <div className="p-4 border-t cursor-pointer hover:bg-gray-100">+ New Session</div>
    </div>
  );
}
