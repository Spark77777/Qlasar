import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import SessionSidebar from "./components/SessionSidebar";
import ProactiveAlerts from "./components/ProactiveAlerts";

export default function App() {
  const [messages, setMessages] = useState([]);

  return (
    <div className="flex h-screen bg-gray-100">
      <SessionSidebar />
      <div className="flex flex-col flex-1">
        <div className="flex flex-1">
          <ChatWindow messages={messages} setMessages={setMessages} />
          <ProactiveAlerts />
        </div>
      </div>
    </div>
  );
}
