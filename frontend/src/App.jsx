import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow";
import SessionSidebar from "./components/SessionSidebar";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [isSessionOpen, setSessionOpen] = useState(false);
  const [isAlertsOpen, setAlertsOpen] = useState(false);

  const openSession = () => {
    setSessionOpen(true);
    setAlertsOpen(false);
  };

  const openAlerts = () => {
    setAlertsOpen(true);
    setSessionOpen(false);
  };

  return (
    <div className="relative h-screen w-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="flex justify-between items-center p-4 bg-white shadow fixed w-full z-20">
        <div className="font-bold text-xl cursor-pointer" onClick={openSession}>
          Qlasar
        </div>
        <button
          className="px-3 py-1 bg-teal-500 text-white rounded"
          onClick={openAlerts}
        >
          Proactive Alerts
        </button>
      </div>

      {/* Chat Window */}
      <ChatWindow
        dimBackground={isSessionOpen || isAlertsOpen}
      />

      {/* Session Sidebar */}
      <AnimatePresence>
        {isSessionOpen && (
          <motion.div
            key="session"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-3/5 md:w-1/3 bg-white shadow z-30"
          >
            <SessionSidebar close={() => setSessionOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive Alerts Sidebar */}
      <AnimatePresence>
        {isAlertsOpen && (
          <motion.div
            key="alerts"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-3/5 md:w-1/3 bg-white shadow z-30"
          >
            <ProactiveAlerts close={() => setAlertsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
