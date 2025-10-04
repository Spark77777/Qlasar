import React, { useState } from "react";

export default function ProactiveAlerts({ close }) {
  const [topic, setTopic] = useState("");
  const [alerts, setAlerts] = useState("");
  const [thinking, setThinking] = useState(false);

  const getAlerts = async () => {
    if (!topic.trim()) return;
    setThinking(true);
    try {
      const res = await fetch("https://qlasar.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Provide concise, frequent, actionable insights and alerts about: ${topic}`,
          history: [],
        }),
      });
      const data = await res.json();
      setAlerts(data.reply);
    } catch (err) {
      setAlerts("❌ Error connecting to backend");
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-lg z-30 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Proactive Alerts</h2>
        <button onClick={close} className="text-gray-500 hover:text-gray-800">✕</button>
      </div>

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full border rounded p-2 mb-2"
        placeholder="Enter a topic..."
        onKeyDown={(e) => e.key === "Enter" && getAlerts()}
      />
      <button onClick={getAlerts} className="bg-blue-500 text-white px-4 py-1 rounded mb-2">
        Get Insights
      </button>

      {thinking && <div className="italic text-yellow-600">Qlasar is thinking...</div>}

      <div className="mt-2 whitespace-pre-wrap">{alerts}</div>
    </div>
  );
}
