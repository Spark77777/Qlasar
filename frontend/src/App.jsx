import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import SessionSidebar from "./components/SessionSidebar";
import ProactiveAlerts from "./components/ProactiveAlerts";

function App() {
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const openSession = () => {
    setIsSessionOpen(true);
    setIsAlertsOpen(false);
  };

  const openAlerts = () => {
    setIsAlertsOpen(true);
    setIsSessionOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow p-4 flex justify-between items-center z-20">
        <div className="font-bold cursor-pointer" onClick={openSession}>
          Qlasar
        </div>
        <button
          onClick={openAlerts}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Proactive Alerts
        </button>
      </div>

      {/* Sidebars */}
      {isSessionOpen && <SessionSidebar close={() => setIsSessionOpen(false)} />}
      {isAlertsOpen && <ProactiveAlerts close={() => setIsAlertsOpen(false)} />}

      {/* Main Chat */}
      <ChatWindow isDimmed={isSessionOpen || isAlertsOpen} />
    </div>
  );
}

export default App;
