import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import SessionSidebar from "./components/SessionSidebar";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [activeSession, setActiveSession] = useState("General");
  const [alertsTopic, setAlertsTopic] = useState("");

  return (
    <div className="flex h-screen">
      <SessionSidebar activeSession={activeSession} setActiveSession={setActiveSession} />
      <ChatWindow activeSession={activeSession} />
      <ProactiveAlerts topic={alertsTopic} setTopic={setAlertsTopic} />
    </div>
  );
}
