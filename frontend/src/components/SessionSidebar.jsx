import React from "react";

export default function SessionSidebar({ sessions, onSelect }) {
  return (
    <div className="session-sidebar">
      <h3>Sessions</h3>
      <ul>
        {sessions.map((session, index) => (
          <li key={index} onClick={() => onSelect(session)}>
            {session.name || `Session ${index + 1}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
