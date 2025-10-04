import React, { useState } from "react";

export default function ProactiveAlerts() {
  const [alerts, setAlerts] = useState([]);

  const addAlert = message => {
    setAlerts(prev => [...prev, { message, timestamp: new Date() }]);
  };

  return (
    <div className="proactive-alerts">
      <h3>Proactive Alerts</h3>
      <button onClick={() => addAlert("This is a proactive alert!")}>Add Alert</button>
      <ul>
        {alerts.map((alert, index) => (
          <li key={index}>
            {alert.timestamp.toLocaleTimeString()}: {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
