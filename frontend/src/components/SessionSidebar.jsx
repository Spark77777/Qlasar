import React, { useState } from "react";

export default function SessionSidebar({ sessions, onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (session) => {
    setSelected(session);
    onSelect(session);
  };

  return (
    <div className="session-sidebar">
      <h2>Sessions</h2>
      <ul>
        {sessions.map((session, index) => (
          <li
            key={index}
            className={selected === session ? "selected" : ""}
            onClick={() => handleSelect(session)}
          >
            {session.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
