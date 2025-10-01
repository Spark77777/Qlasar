import React, { useState } from "react";

export default function ProactiveAlerts() {
  const [topic, setTopic] = useState("");
  const [alerts, setAlerts] = useState([]);

  const getInsights = async () => {
    if (!topic.trim()) return;
    try {
      const res = await fetch("/proactive", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `topic=${encodeURIComponent(topic)}`
      });
      const data = await res.json();
      setAlerts([data.reply]);
    } catch {
      setAlerts(["❌ Error: Could not fetch insights"]);
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col p-4">
      <div className="font-bold mb-2">Proactive Alerts</div>
      <input
        type="text"
        className="border rounded p-2 mb-2"
        placeholder="Enter topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button className="bg-orange-500 text-white px-4 py-2 rounded mb-2" onClick={getInsights}>
        Get Insights
      </button>
      <div className="flex-1 overflow-y-auto space-y-2">
        {alerts.map((a, idx) => (
          <div key={idx} className="p-2 bg-gray-100 rounded">{a}</div>
        ))}
      </div>
    </div>
  );
}
