import React, { useState } from "react";
import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [activeSession, setActiveSession] = useState("Research");
  const [mode, setMode] = useState("serious"); // serious/casual

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Left Sidebar */}
      <SessionSidebar activeSession={activeSession} setActiveSession={setActiveSession} />

      {/* Center Chat Window */}
      <ChatWindow activeSession={activeSession} mode={mode} setMode={setMode} />

      {/* Right Sidebar */}
      <ProactiveAlerts activeSession={activeSession} />
    </div>
  );
}
