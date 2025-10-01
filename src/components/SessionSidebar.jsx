import React from "react";

const sessions = [
  { title: "Research", icon: "📚" },
  { title: "Learning", icon: "🧠" },
  { title: "Weekend", icon: "🌴" },
];

export default function SessionSidebar({ activeSession, setActiveSession }) {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 font-bold text-xl flex items-center justify-between">
        Qlasar
        <button className="bg-teal-500 text-white px-2 py-1 rounded">+ New</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.map((s) => (
          <div
            key={s.title}
            className={`p-3 flex items-center cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              s.title === activeSession ? "bg-teal-100 dark:bg-teal-800" : ""
            }`}
            onClick={() => setActiveSession(s.title)}
          >
            <span className="mr-2">{s.icon}</span>
            {s.title}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full bg-gray-300 dark:bg-gray-700 px-3 py-2 rounded">Account</button>
      </div>
    </div>
  );
}
