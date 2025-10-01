import React from "react";
import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";

function App() {
  return (
    <div className="flex h-screen w-screen">
      <SessionSidebar />
      <ChatWindow />
      <ProactiveAlerts />
    </div>
  );
}

export default App;
