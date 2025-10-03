import React from "react";

export default function SessionSidebar() {
  const sessions = ["Session 1", "Session 2", "Session 3"];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Sessions</h2>
      <ul className="space-y-2">
        {sessions.map((s, i) => (
          <li
            key={i}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
          >
            {s}
          </li>
        ))}
      </ul>
      <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
        + New Session
      </button>
    </div>
  );
}
