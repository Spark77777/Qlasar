import React from "react";
import ChatWindow from "./components/ChatWindow";
import SessionSidebar from "./components/SessionSidebar";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  return (
    <div className="flex h-screen">
      <SessionSidebar />
      <ChatWindow />
      <ProactiveAlerts />
    </div>
  );
}
