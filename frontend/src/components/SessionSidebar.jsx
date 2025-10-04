import React from "react";

export default function SessionSidebar({ close }) {
  return (
    <div className="fixed top-14 left-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow p-4 z-30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Sessions</h2>
        <button onClick={close} className="text-red-500">Close</button>
      </div>
      <div className="overflow-y-auto h-full">
        <div className="p-2 border-b">Session 1</div>
        <div className="p-2 border-b">Session 2</div>
        <button className="mt-4 bg-blue-500 text-white px-3 py-1 rounded">+ New Session</button>
      </div>
    </div>
  );
}
