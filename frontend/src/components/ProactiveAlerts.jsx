import React, { useState } from "react";

export default function ProactiveAlerts() {
  const [topic, setTopic] = useState("");
  const [alerts, setAlerts] = useState("");

  const handleGetAlerts = async () => {
    if (!topic) return;

    try {
      const response = await fetch("/api/proactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      setAlerts(data.response);
    } catch (err) {
      setAlerts("❌ Couldn't fetch proactive alerts");
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h3 style={{ marginBottom: "10px", color: "#1976d2" }}>Proactive Alerts</h3>
      <input
        type="text"
        placeholder="Enter a topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "12px",
          border: "1px solid #ccc",
          marginBottom: "10px",
          fontSize: "16px",
        }}
        onKeyDown={(e) => e.key === "Enter" && handleGetAlerts()}
      />
      <button
        onClick={handleGetAlerts}
        style={{
          padding: "10px",
          borderRadius: "12px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          marginBottom: "10px",
          fontSize: "16px",
        }}
      >
        Get Alerts
      </button>
      <div
        style={{
          flex: 1,
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          padding: "10px",
          overflowY: "auto",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          whiteSpace: "pre-wrap",
        }}
      >
        {alerts || "Proactive insights will appear here."}
      </div>
    </div>
  );
}
