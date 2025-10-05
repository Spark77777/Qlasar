import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";
import SessionSidebar from "./components/SessionSidebar";

export default function App() {
  const [sessions, setSessions] = useState([{ name: "Session 1" }, { name: "Session 2" }]);
  const [activeSession, setActiveSession] = useState(sessions[0]);

  const handleSessionSelect = (session) => {
    setActiveSession(session);
  };

  return (
    <div style={styles.appContainer}>
      <SessionSidebar sessions={sessions} onSelect={handleSessionSelect} />

      <div style={styles.mainContent}>
        <h1 style={styles.header}>Qlasar</h1>
        <ChatWindow session={activeSession} />
        <ProactiveAlerts />
      </div>
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" },
  mainContent: { flex: 1, padding: "20px", display: "flex", flexDirection: "column" },
  header: { textAlign: "center", marginBottom: "20px" },
};
