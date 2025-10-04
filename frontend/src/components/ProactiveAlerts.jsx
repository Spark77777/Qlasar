import React, { useState } from "react";

export default function ProactiveAlerts() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("https://qlasar.onrender.com/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error(err);
      setAlerts([{ id: 0, message: "Error fetching alerts." }]);
    }
  };

  return (
    <div className="proactive-alerts">
      <button onClick={fetchAlerts}>Load Alerts</button>
      <ul>
        {alerts.map(alert => (
          <li key={alert.id}>{alert.message}</li>
        ))}
      </ul>
    </div>
  );
}
