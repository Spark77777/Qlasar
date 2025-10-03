import React from "react";
import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  return (
    <div className="h-screen grid grid-cols-12">
      {/* Left Sidebar */}
      <div className="col-span-2 bg-gray-900 text-white p-4">
        <SessionSidebar />
      </div>

      {/* Chat Window */}
      <div className="col-span-7 bg-white p-4 border-x border-gray-200">
        <ChatWindow />
      </div>

      {/* Proactive Alerts */}
      <div className="col-span-3 bg-gray-50 p-4">
        <ProactiveAlerts />
      </div>
    </div>
  );
}
