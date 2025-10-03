import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import SessionSidebar from "./components/SessionSidebar";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [sessionOpen, setSessionOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const toggleSession = () => {
    setSessionOpen(!sessionOpen);
    if (alertsOpen) setAlertsOpen(false);
  };

  const toggleAlerts = () => {
    setAlertsOpen(!alertsOpen);
    if (sessionOpen) setSessionOpen(false);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white shadow flex justify-between items-center px-4 z-20">
        <div
          className="font-bold text-lg cursor-pointer"
          onClick={toggleSession}
        >
          Qlasar
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          onClick={toggleAlerts}
        >
          Proactive Alerts
        </button>
      </div>

      {/* Main Chat Window */}
      <ChatWindow sessionOpen={sessionOpen} alertsOpen={alertsOpen} />

      {/* Sidebars */}
      {sessionOpen && <SessionSidebar close={toggleSession} />}
      {alertsOpen && <ProactiveAlerts close={toggleAlerts} />}
    </div>
  );
}
