import React, { useState } from "react";
import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [sessions, setSessions] = useState([
    { id: 1, title: "Research" },
    { id: 2, title: "Learning" },
  ]);
  const [activeSession, setActiveSession] = useState(sessions[0]);
  const [proactiveVisible, setProactiveVisible] = useState(true);

  return (
    <div className="flex h-screen">
      <SessionSidebar
        sessions={sessions}
        activeSession={activeSession}
        setActiveSession={setActiveSession}
      />
      <ChatWindow
        session={activeSession}
        proactiveVisible={proactiveVisible}
      />
      {proactiveVisible && <ProactiveAlerts />}
    </div>
  );
}
