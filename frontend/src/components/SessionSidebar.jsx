import React from "react";

export default function SessionSidebar({ close }) {
  return (
    <div className="fixed top-14 left-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow p-4 z-30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Sessions</h2>
        <button onClick={close}>X</button>
      </div>
      <div className="overflow-y-auto">
        {/* Example sessions */}
        <p className="border-b py-2">Session 1</p>
        <p className="border-b py-2">Session 2</p>
        <button className="mt-4 bg-blue-500 text-white px-2 py-1 rounded w-full">
          + New Session
        </button>
      </div>
    </div>
  );
}
