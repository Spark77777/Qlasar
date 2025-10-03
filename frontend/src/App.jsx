import React from "react";
import ChatWindow from "./components/ChatWindow.jsx";
import SessionSidebar from "./components/SessionSidebar.jsx";
import ProactiveAlerts from "./components/ProactiveAlerts.jsx";

const App = () => {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <SessionSidebar />

      {/* Center Chat Window */}
      <ChatWindow />

      {/* Right Sidebar */}
      <ProactiveAlerts />
    </div>
  );
};

export default App;
