import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import ProactiveAlerts from "./ProactiveAlerts";
import SessionSidebar from "./SessionSidebar";

export default function App() {
  // Session state
  const [sessions, setSessions] = useState([
    { name: "Session 1", messages: [] },
    { name: "Session 2", messages: [] },
  ]);
  const [activeSession, setActiveSession] = useState(sessions[0]);

  const handleSessionSelect = (session) => {
    setActiveSession(session);
  };

  const updateSessionMessages = (newMessage) => {
    const updatedSessions = sessions.map((session) =>
      session.name === activeSession.name
        ? { ...session, messages: [...session.messages, newMessage] }
        : session
    );
    setSessions(updatedSessions);
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      <SessionSidebar
        sessions={sessions}
        onSelect={handleSessionSelect}
        activeSession={activeSession}
      />

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.header}>Qlasar</h1>

        {/* Chat Window */}
        <ChatWindow
          key={activeSession.name}
          session={activeSession}
          updateSessionMessages={updateSessionMessages}
        />

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
