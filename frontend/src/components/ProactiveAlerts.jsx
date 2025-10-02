import React, { useState } from "react";

export default function ProactiveAlerts({ topic, setTopic }) {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    const response = await fetch("/proactive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await response.json();
    setAlerts([data.reply]);
  };

  return (
    <div className="w-80 border-l border-gray-300 p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Proactive Alerts</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="mb-2 p-2 border rounded"
        placeholder="Enter a topic..."
      />
      <button onClick={fetchAlerts} className="mb-4 px-4 py-2 bg-orange-500 text-white rounded">
        Get Alerts
      </button>
      <div className="flex-1 overflow-y-auto">
        {alerts.map((a, idx) => (
          <div key={idx} className="mb-2 p-2 rounded bg-gray-200">
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}
