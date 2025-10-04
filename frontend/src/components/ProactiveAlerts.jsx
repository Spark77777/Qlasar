import React, { useState } from "react";

export default function ProactiveAlerts({ close }) {
  const [topic, setTopic] = useState("");
  const [insight, setInsight] = useState("");

  const fetchInsights = async () => {
    if (!topic.trim()) return;
    try {
      const res = await fetch("https://qlasar.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setInsight(data.reply);
    } catch (err) {
      setInsight("❌ Error fetching proactive insights");
    }
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-30 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Proactive Alerts</h2>
        <button onClick={close} className="text-gray-500 hover:text-gray-700">
          ✖
        </button>
      </div>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic..."
        className="border p-2 rounded mb-2"
      />
      <button onClick={fetchInsights} className="bg-blue-500 text-white px-3 py-1 rounded mb-4">
        Get Insights
      </button>
      <div className="flex-1 overflow-y-auto">
        <p>{insight}</p>
      </div>
    </div>
  );
}
