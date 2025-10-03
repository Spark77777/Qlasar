import React from "react";

const alerts = [
  { title: "AI in Healthcare", text: "AI use in healthcare is growing with new applications." },
  { title: "AI Trends", text: "Generative AI is driving new advancements." },
  { title: "Quantum Computing", text: "Research is accelerating with new breakthroughs." },
];

const ProactiveAlerts = () => {
  return (
    <div className="w-80 bg-white shadow-lg p-4 flex flex-col">
      <div className="font-bold text-lg mb-4">Proactive Alerts</div>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {alerts.map((alert, idx) => (
          <div key={idx} className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
            <div className="font-semibold">{alert.title}</div>
            <div className="text-sm">{alert.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProactiveAlerts;
