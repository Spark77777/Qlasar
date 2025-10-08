import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const SessionSidebar = ({ onClose, onSelectSession, activeSession }) => {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);

  // Fetch user and their sessions
  useEffect(() => {
    const fetchUserAndSessions = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      setUser(userData.user);

      const { data: sessionsData, error } = await supabase
        .from("Session")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching sessions:", error);
      else setSessions(sessionsData || []);
    };

    fetchUserAndSessions();
  }, []);

  // Create a new session
  const handleNewSession = async () => {
    if (!user) return;

    const newSessionName = `Session ${sessions.length + 1}`;
    const { data, error } = await supabase
      .from("Session")
      .insert([{ user_id: user.id, session_name: newSessionName }])
      .select()
      .single();

    if (error) console.error("Error creating session:", error);
    else {
      setSessions((prev) => [...prev, data]);
      onSelectSession(data.id);
      onClose();
    }
  };

  // Handle selecting a session or Proactive Alerts
  const handleSelect = (id) => {
    onSelectSession(id);
    onClose();
  };

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
        onClick={() => handleSelect("proactive")}
        className={`text-left px-4 py-2 hover:bg-gray-100 transition ${
          activeSession === "proactive" ? "bg-gray-200 font-semibold" : ""
        }`}
      >
        Proactive Alerts
      </button>

      {/* + Session */}
      <button
        onClick={handleNewSession}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition text-gray-600 font-medium"
      >
        <Plus size={16} /> + Session
      </button>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto mt-2">
        {sessions.length === 0 && (
          <p className="px-4 py-2 text-gray-400 text-sm">No sessions yet</p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className={`text-left w-full px-4 py-2 hover:bg-gray-100 transition ${
              activeSession === s.id ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            {s.session_name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SessionSidebar;
