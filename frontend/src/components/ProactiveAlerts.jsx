import React, { useEffect, useState } from "react";

export default function ProactiveAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const response = await fetch(
        "https://qlasar-qx6y.onrender.com/api/alerts"
      );

      const data = await response.json();

      console.log("ALERTS:", data);

      setAlerts(data.alerts || []);
    } catch (err) {
      console.error("ALERT FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "20px",
        color: "white",
      }}
    >
      <h1
        style={{
          color: "#00e5ff",
          marginBottom: "20px",
        }}
      >
        Scouted Alerts
      </h1>

      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p>No alerts available.</p>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={index}
            style={{
              background: "#111827",
              padding: "16px",
              borderRadius: "16px",
              marginBottom: "14px",
              border: "1px solid #1f2937",
            }}
          >
            <h3>{alert.title}</h3>

            <p>{alert.source}</p>

            {alert.url && (
              <a
                href={alert.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#00e5ff",
                }}
              >
                Open Article
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}
