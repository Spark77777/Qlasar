import React, { useState } from "react";
import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div className="flex h-screen">
      <SessionSidebar />
      <div className="flex-1 flex flex-col">
        <ChatWindow toggleAlerts={() => setShowAlerts(!showAlerts)} />
      </div>
      {showAlerts && <ProactiveAlerts />}
    </div>
  );
}
