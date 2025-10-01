import React, { useState } from "react";

export default function ProactiveAlerts({ activeSession }) {
  const [topic, setTopic] = useState("");
  const [alerts, setAlerts] = useState([]);

  const getInsights = async () => {
    if (!topic.trim()) return;

    const formData = new URLSearchParams();
    formData.append("topic", topic);

    try {
      const res = await fetch("http://localhost:8000/proactive", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const data = await res.json();
      setAlerts([data.reply]);
    } catch (err) {
      setAlerts(["❌ Error fetching alerts."]);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col p-4">
      <h2 className="font-bold text-lg mb-2">Proactive Alerts</h2>
      <input
        type="text"
        placeholder="Enter a topic..."
        className="p-2 rounded border border-gray-300 dark:border-gray-600 mb-2"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button onClick={getInsights} className="bg-teal-500 text-white px-3 py-1 rounded mb-2">
        Get Insights
      </button>

      <div className="flex-1 overflow-y-auto">
        {alerts.map((a, idx) => (
          <div key={idx} className="p-2 mb-2 bg-gray-100 dark:bg-gray-700 rounded">
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}
