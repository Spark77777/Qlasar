import React from "react";
import { X, Plus } from "lucide-react";

const SessionSidebar = ({ onClose, onSelectSession, sessions = [] }) => {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold text-lg text-blue-600">Qlasar</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Proactive Alerts */}
      <button
        onClick={() => onSelectSession("proactive")}
        className="text-left px-4 py-2 hover:bg-gray-100 transition"
      >
        Proactive Alerts
      </button>

      {/* + Session */}
      <button
        onClick={() => onSelectSession("new")}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition text-gray-600 font-medium"
      >
        <Plus size={16} /> + Session
      </button>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto mt-2">
        {sessions.length === 0 && (
          <p className="px-4 py-2 text-gray-400 text-sm">No sessions yet</p>
        )}
        {sessions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSession(s.id)}
            className="text-left w-full px-4 py-2 hover:bg-gray-100 transition"
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SessionSidebar;
