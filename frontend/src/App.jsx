import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ProactiveAlerts from "./components/ProactiveAlerts";
import SessionSidebar from "./components/SessionSidebar";

export default function App() {
  const [sessions, setSessions] = useState([{ name: "Session 1" }]);
  const [activeSession, setActiveSession] = useState(sessions[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* Desktop Sidebar */}
      <div
        style={{
          flexShrink: 0,
          width: "250px",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          backgroundColor: "#fff",
          boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
        }}
        className="desktop-sidebar"
      >
        <SessionSidebar sessions={sessions} onSelect={setActiveSession} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "250px",
            height: "100vh",
            backgroundColor: "#fff",
            borderRight: "1px solid #ddd",
            zIndex: 1000,
            overflowY: "auto",
            boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              margin: "10px",
              padding: "5px 10px",
              cursor: "pointer",
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Close
          </button>
          <SessionSidebar
            sessions={sessions}
            onSelect={(s) => {
              setActiveSession(s);
              setSidebarOpen(false);
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          overflow: "hidden",
        }}
      >
        {/* Mobile Hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mobile-hamburger"
          style={{
            display: "none",
            marginBottom: "10px",
            padding: "5px 10px",
            cursor: "pointer",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          ☰ Sessions
        </button>

        <h1 style={{ textAlign: "center", marginBottom: "15px", color: "#1976d2" }}>
          Qlasar
        </h1>

        {/* Chat + Alerts Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            minHeight: 0,
            gap: "10px",
          }}
        >
          {/* Chat Window */}
          <div
            style={{
              flex: 2,
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <ChatWindow key={activeSession.name} />
          </div>

          {/* Proactive Alerts */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            <ProactiveAlerts />
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-sidebar {
              display: none;
            }
            .mobile-hamburger {
              display: block;
            }
            div[style*="flexDirection: row"] {
              flex-direction: column;
            }
          }
        `}
      </style>
    </div>
  );
}
