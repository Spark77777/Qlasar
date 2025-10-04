import React, { useState } from "react";

export default function SessionSidebar() {
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => {
    try {
      const res = await fetch("https://qlasar.onrender.com/sessions"); // optional endpoint
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
      setSessions([{ id: 0, name: "Error loading sessions" }]);
    }
  };

  return (
    <div className="session-sidebar">
      <button onClick={loadSessions}>Load Sessions</button>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>{session.name || "Unnamed Session"}</li>
        ))}
      </ul>
    </div>
  );
}
