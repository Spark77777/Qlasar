import React from "react";

export default function ProactiveAlerts() {
  const alerts = [
    "AI in Healthcare → New research on diagnostics.",
    "AI Trends → Generative AI advancing fast.",
    "Quantum Computing → Breakthroughs in qubit coherence.",
  ];

  return (
    <div className="w-80 bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Proactive Alerts</h2>
      {alerts.map((alert, idx) => (
        <div key={idx} className="p-2 mb-2 bg-white rounded cursor-pointer">
          {alert}
        </div>
      ))}
    </div>
  );
}
