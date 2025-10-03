import { useState } from "react";
import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [showAlerts, setShowAlerts] = useState(false);

  const toggleAlerts = () => {
    setShowAlerts((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      <SessionSidebar />

      {/* Center Chat Window */}
      <div className={`flex-1 transition-all duration-300 ${showAlerts ? "md:w-2/3" : "w-full"}`}>
        <ChatWindow onToggleAlerts={toggleAlerts} alertsVisible={showAlerts} />
      </div>

      {/* Right Panel (Proactive Alerts) */}
      {showAlerts && (
        <div className="w-1/3 border-l border-gray-200 bg-white transition-all duration-300">
          <ProactiveAlerts />
        </div>
      )}
    </div>
  );
}
