import React, { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import SessionSidebar from "./SessionSidebar";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 🔹 Check login and load sessions
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        await loadSessions(data.user.id);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user || null;
        setUser(u);
        if (u) loadSessions(u.id);
        else {
          setSessions([]);
          setActiveSession(null);
          setMessages([]);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔹 Load sessions
  const loadSessions = async (userId) => {
    const { data, error } = await supabase
      .from("Session")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setSessions(data);
      if (data.length > 0 && !activeSession) selectSession(data[0].id);
    }
  };

  // 🔹 Load messages
  const loadMessages = async (sessionId) => {
    if (!sessionId) return setMessages([]);
    const { data, error } = await supabase
      .from("Messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data)
      setMessages(data.map((m) => ({ sender: m.sender, text: m.text })));
    else setMessages([]);
  };

  // 🔹 Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 🔹 Send message
  const handleSend = async () => {
    if (!input.trim() || isTyping || !activeSession) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      // Insert user message
      await supabase.from("Messages").insert({
        session_id: activeSession,
        sender: "user",
        text: input,
      });

      // AI response
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      let reply = "❌ No valid response from model.";
      if (res.ok) {
        const data = await res.json();
        reply = data.response || reply;

        // Store AI response
        await supabase.from("Messages").insert({
          session_id: activeSession,
          sender: "ai",
          text: reply,
        });
      } else {
        const errData = await res.json();
        reply =
          res.status === 429
            ? "⚠️ Rate limit exceeded. Try again later."
            : errData.error || `Server returned ${res.status}`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `❌ Error: ${err.message}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🔹 Select / create session
  const selectSession = async (id) => {
    if (!user) return alert("Login first to manage sessions.");

    if (id === "new") {
      // Create new session
      const { data, error } = await supabase
        .from("Session")
        .insert({
          user_id: user.id,
          session_name: `Session ${sessions.length + 1}`,
        })
        .select()
        .single();

      if (!error && data) {
        setSessions((prev) => [...prev, data]);
        setActiveSession(data.id);
        setMessages([]);
      } else console.error("Error creating session:", error);
    } else {
      setActiveSession(id);
      await loadMessages(id);
    }

    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      {showSidebar && (
        <SessionSidebar
          onClose={() => setShowSidebar(false)}
          onSelectSession={selectSession}
          sessions={sessions}
        />
      )}

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="relative flex justify-between items-center px-5 py-3 bg-white shadow-sm border-b">
          <div
            className="font-bold text-xl text-blue-600 cursor-pointer"
            onClick={() => setShowSidebar(true)}
          >
            Qlasar
          </div>

          <div className="relative">
            {user ? (
              <>
                <div
                  className="w-9 h-9 flex items-center justify-center bg-blue-500 text-white rounded-full font-semibold cursor-pointer hover:bg-blue-600 transition"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-md text-sm z-50">
                    <div className="px-4 py-2 border-b text-gray-600 truncate">
                      {user.email}
                    </div>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setUser(null);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 rounded-b-xl"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition"
                title="Login / Signup"
                onClick={() => setShowSidebar(true)}
              >
                <User size={18} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 text-sm rounded-2xl shadow-sm ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
                dangerouslySetInnerHTML={
                  msg.sender === "ai" ? { __html: msg.text } : undefined
                }
              >
                {msg.sender === "user" ? msg.text : null}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                <span className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="w-full flex justify-end px-4 pb-5">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border shadow-md rounded-full px-4 py-2 max-w-md w-full sm:w-[70%] md:w-[50%] lg:w-[40%]">
            <textarea
              ref={textareaRef}
              placeholder="What shall we explore?"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              rows={1}
              className="flex-1 bg-transparent border-none text-sm px-2 py-2 resize-none focus:outline-none overflow-hidden"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-full shadow-md"
              disabled={isTyping || !input.trim() || !activeSession}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
