import React, { useState } from "react";

export default function ProactiveAlerts({ close }) {
  const [topic, setTopic] = useState("");
  const [alerts, setAlerts] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const fetchAlerts = async () => {
    if (!topic.trim()) return;
    setAlerts("Fetching insights...");
    setIsFetching(true);

    try {
      const res = await fetch("https://qlasar.onrender.com/api/proactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      setAlerts(data.reply || "❌ No insights generated");
    } catch (err) {
      setAlerts("❌ Error connecting to backend");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 z-30 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Proactive Scout</h2>
        <button onClick={close} className="text-red-500 font-bold">X</button>
      </div>

      <input
        type="text"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Enter a topic..."
        className="w-full border rounded p-2 mb-2"
        onKeyDown={e => e.key === "Enter" && fetchAlerts()}
        disabled={isFetching}
      />
      <button
        onClick={fetchAlerts}
        className={`w-full mb-4 bg-blue-500 text-white p-2 rounded ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={isFetching}
      >
        {isFetching ? "Fetching..." : "Get Insights"}
      </button>

      <div className="whitespace-pre-line text-gray-700">{alerts}</div>
    </div>
  );
}
