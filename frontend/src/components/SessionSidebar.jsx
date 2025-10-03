import React from "react";

const sessions = [
  { title: "Research", icon: "📚" },
  { title: "Learning", icon: "🧠" },
  { title: "Weekend", icon: "☕" },
];

const SessionSidebar = () => {
  return (
    <div className="w-60 bg-white shadow-lg p-4 flex flex-col">
      <div className="mb-4 font-bold text-xl">Qlasar</div>
      <button className="bg-teal-500 text-white px-4 py-2 rounded mb-4">
        + New Session
      </button>
      <div className="flex-1 space-y-2">
        {sessions.map((s) => (
          <div
            key={s.title}
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
          >
            <span>{s.icon}</span>
            <span>{s.title}</span>
          </div>
        ))}
      </div>
      <button className="mt-auto bg-gray-200 px-4 py-2 rounded">Account</button>
    </div>
  );
};

export default SessionSidebar;
