import React from "react";

export default function SessionSidebar() {
  return (
    <div className="w-60 bg-gray-200 p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Qlasar Sessions</h2>
      <button className="bg-teal-500 text-white py-2 px-4 rounded mb-4">
        + New Session
      </button>
      <div className="flex-1 overflow-y-auto">
        <ul>
          <li className="p-2 bg-white rounded mb-2 cursor-pointer">Research</li>
          <li className="p-2 bg-white rounded mb-2 cursor-pointer">Learning</li>
          <li className="p-2 bg-white rounded mb-2 cursor-pointer">Weekend</li>
        </ul>
      </div>
      <button className="mt-auto bg-gray-400 py-2 px-4 rounded">
        Account
      </button>
    </div>
  );
}
