import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [activeSidebar, setActiveSidebar] = useState(null); 
  // "sessions" | "alerts" | null

  const toggleSidebar = (type) => {
    setActiveSidebar((prev) => (prev === type ? null : type));
  };

  return (
    <div className="flex flex-col h-screen relative">
      {/* Top Navigation Bar */}
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <button
          onClick={() => toggleSidebar("sessions")}
          className="font-bold text-lg"
        >
          Qlasar
        </button>
        <button
          onClick={() => toggleSidebar("alerts")}
          className="bg-blue-500 px-3 py-1 rounded-md text-sm"
        >
          Proactive Alerts
        </button>
      </div>

      {/* Chat Window (Base Layer) */}
      <div
        className={`flex-1 p-4 bg-gray-100 overflow-auto transition ${
          activeSidebar ? "brightness-75" : ""
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 bg-white rounded shadow mb-2">
              Hello! This is your Qlasar chat window.
            </div>
            <div className="p-3 bg-gray-50 rounded shadow mb-2">
              Responses will appear here.
            </div>
          </div>

          {/* Input Bar */}
          <div className="mt-2 flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border p-2 rounded-l"
            />
            <button className="bg-blue-500 text-white px-4 rounded-r">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Session Sidebar (Left Overlay) */}
      <AnimatePresence>
        {activeSidebar === "sessions" && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-3/12 md:w-3/12 sm:w-7/12 bg-white shadow-lg z-20"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold">Sessions</h2>
              <button onClick={() => setActiveSidebar(null)}>✕</button>
            </div>
            <div className="p-4 overflow-y-auto">
              <button className="mb-4 bg-blue-500 text-white px-3 py-1 rounded">
                + New Session
              </button>
              <ul className="space-y-2">
                <li className="p-2 border rounded">Session 1 - Today</li>
                <li className="p-2 border rounded">Session 2 - Yesterday</li>
                <li className="p-2 border rounded">Session 3 - Last week</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive Alerts Sidebar (Right Overlay) */}
      <AnimatePresence>
        {activeSidebar === "alerts" && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-3/12 md:w-3/12 sm:w-7/12 bg-yellow-50 shadow-lg z-20"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold">Proactive Alerts</h2>
              <button onClick={() => setActiveSidebar(null)}>✕</button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm">⚡ New insight detected.</p>
                <p className="text-xs text-gray-500">2 min ago</p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm">📊 Trend: Rising interest in Qlasar AI.</p>
                <p className="text-xs text-gray-500">10 min ago</p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm">🔔 Signal from your last session.</p>
                <p className="text-xs text-gray-500">30 min ago</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
