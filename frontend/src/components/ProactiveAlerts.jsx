import React from "react";

export default function ProactiveAlerts({ close }) {
  return (
    <div className="fixed top-14 right-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow p-4 z-30 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Proactive Alerts</h2>
        <button onClick={close}>X</button>
      </div>
      <div className="space-y-2">
        <div className="p-2 border rounded">Fact: AI is advancing fast.</div>
        <div className="p-2 border rounded">Trend: Quantum computing news.</div>
        <div className="p-2 border rounded">Signal: Market analysis update.</div>
      </div>
    </div>
  );
}
