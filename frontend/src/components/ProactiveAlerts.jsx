import React from "react";

export default function ProactiveAlerts() {
  const alerts = [
    "💡 Did you know? Qlasar will soon support personalization.",
    "📈 Your most active session is 'Session 1'.",
    "⚡ Pro Tip: Use short prompts to get faster insights.",
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Proactive Alerts</h2>
      <ul className="space-y-2">
        {alerts.map((a, i) => (
          <li
            key={i}
            className="p-2 bg-yellow-100 border border-yellow-300 rounded"
          >
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
