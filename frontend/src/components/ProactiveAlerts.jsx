import React, { useState } from "react";

export default function ProactiveAlerts({ close }) {
  const [topic, setTopic] = useState("");
  const [alerts, setAlerts] = useState("");
  const [loading, setLoading] = useState(false);

  const getProactiveAlerts = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("https://qlasar.onrender.com/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      setAlerts(data.reply);
    } catch (err) {
      console.error(err);
      setAlerts("❌ Error fetching proactive alerts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-14 right-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow p-4 overflow-auto z-30">
      <button onClick={close} className="mb-4 text-red-500 font-bold">
        Close
      </button>
      <h2 className="text-lg font-semibold mb-2">Proactive Scout</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic..."
          className="flex-1 border rounded p-2"
          onKeyDown={(e) => e.key === "Enter" && getProactiveAlerts()}
        />
        <button
          onClick={getProactiveAlerts}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Get Alerts
        </button>
      </div>

      {loading && <div className="italic text-gray-500">Fetching alerts...</div>}
      {alerts && <div className="whitespace-pre-wrap">{alerts}</div>}
    </div>
  );
}
