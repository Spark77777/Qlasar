import React, { useState } from "react";

const API_URL = "https://qlasar.onrender.com";

export default function ProactiveAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlert = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Proactive alert request" }),
      });
      const data = await response.json();
      setAlerts((prev) => [...prev, data.response]);
    } catch (err) {
      console.error(err);
      setAlerts((prev) => [...prev, "Failed to fetch alert."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proactive-alerts">
      <button onClick={fetchAlert} disabled={loading}>
        {loading ? "Fetching..." : "Proactive Alerts"}
      </button>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div key={index} className="alert">{alert}</div>
        ))}
      </div>
    </div>
  );
}
