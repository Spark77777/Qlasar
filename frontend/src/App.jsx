import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";
import SessionSidebar from "./components/SessionSidebar";

export default function App() {
  const [sessions, setSessions] = useState([{ name: "Session 1" }]);
  const [activeSession, setActiveSession] = useState(sessions[0]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <SessionSidebar sessions={sessions} onSelect={setActiveSession} />
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Qlasar</h1>
        <ChatWindow key={activeSession.name} />
        <ProactiveAlerts />
      </div>
    </div>
  );
}
