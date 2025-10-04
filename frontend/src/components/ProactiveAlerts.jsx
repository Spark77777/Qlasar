import React from "react";

export default function ProactiveAlerts({ close }) {
  return (
    <div className="fixed top-14 right-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow p-4 z-30 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Proactive Alerts</h2>
        <button onClick={close} className="text-red-500">Close</button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="p-2 border rounded">Alert 1: Sample insight</div>
        <div className="p-2 border rounded">Alert 2: Sample trend</div>
      </div>
    </div>
  );
}
