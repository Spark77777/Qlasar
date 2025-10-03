import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import SessionSidebar from './components/SessionSidebar';
import ProactiveAlerts from './components/ProactiveAlerts';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [showSessions, setShowSessions] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const toggleSessions = () => {
    setShowSessions(!showSessions);
    if (!showSessions) setShowAlerts(false);
  };

  const toggleAlerts = () => {
    setShowAlerts(!showAlerts);
    if (!showAlerts) setShowSessions(false);
  };

  return (
    <div className="h-screen w-screen relative bg-gray-100">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 shadow-md z-30">
        <button onClick={toggleSessions} className="font-bold text-lg">Qlasar</button>
        <button onClick={toggleAlerts} className="font-medium">Proactive Alerts</button>
      </div>

      {/* Chat Window */}
      <ChatWindow />

      {/* Session Sidebar */}
      <AnimatePresence>
        {showSessions && <SessionSidebar toggle={toggleSessions} />}
      </AnimatePresence>

      {/* Proactive Alerts Sidebar */}
      <AnimatePresence>
        {showAlerts && <ProactiveAlerts toggle={toggleAlerts} />}
      </AnimatePresence>
    </div>
  );
}
