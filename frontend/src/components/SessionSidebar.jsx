import React from "react";

export default function SessionSidebar({ sessions, onSelect }) {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.header}>Sessions</h2>
      {sessions.map((session, idx) => (
        <div
          key={idx}
          style={styles.sessionItem}
          onClick={() => onSelect(session)}
        >
          {session.name}
        </div>
      ))}
    </div>
  );
}

const styles = {
  sidebar: {
    width: "200px",
    borderRight: "1px solid #ccc",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9f9f9",
  },
  header: {
    marginBottom: "10px",
    fontSize: "18px",
    textAlign: "center",
  },
  sessionItem: {
    padding: "8px",
    marginBottom: "5px",
    cursor: "pointer",
    borderRadius: "4px",
    backgroundColor: "#fff",
    transition: "background-color 0.2s",
  },
  sessionItemHover: {
    backgroundColor: "#e0e0e0",
  },
};
