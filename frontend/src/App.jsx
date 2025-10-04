import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import ProactiveAlerts from "./ProactiveAlerts";
import SessionSidebar from "./SessionSidebar";

export default function App() {
  const [sessions, setSessions] = useState([
    { name: "Session 1" },
    { name: "Session 2" },
  ]);
  const [activeSession, setActiveSession] = useState(sessions[0]);

  const handleSessionSelect = (session) => {
    setActiveSession(session);
    // If needed, you can load previous messages for this session here
  };

  return (
    <div className="app-container" style={styles.appContainer}>
      {/* Sidebar for Sessions */}
      <SessionSidebar sessions={sessions} onSelect={handleSessionSelect} />

      {/* Main Chat Area */}
      <div style={styles.mainContent}>
        <h1 style={styles.header}>Qlasar</h1>
        
        {/* Chat Window */}
        <ChatWindow key={activeSession.name} />

        {/* Proactive Alerts */}
        <ProactiveAlerts />
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  mainContent: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
};
