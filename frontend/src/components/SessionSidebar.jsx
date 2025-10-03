import React from "react";

export default function SessionSidebar() {
  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-4">Qlasar</h1>
      <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4">
        + New Session
      </button>
      <div className="flex-1 overflow-y-auto">
        <ul>
          <li className="p-2 bg-gray-200 mb-2 rounded">Research</li>
          <li className="p-2 bg-gray-200 mb-2 rounded">Learning</li>
          <li className="p-2 bg-gray-200 mb-2 rounded">Weekend</li>
        </ul>
      </div>
      <button className="mt-auto bg-gray-300 py-2 px-4 rounded">Account</button>
    </div>
  );
}
