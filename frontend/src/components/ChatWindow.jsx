import React, { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi there 👋, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 🔹 Check login
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔹 Send message + get AI response
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      console.log("🛰 Sending request to backend...");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }), // ✅ backend expects this
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Server error:", errText);
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ API raw response:", data);

      // Get reply safely
      const reply =
        data.reply ||
        data.message ||
        data.content ||
        data?.choices?.[0]?.message?.content ||
        "❌ No valid response from model.";

      const aiMessage = { sender: "ai", text: reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `❌ Error: ${err.message}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🔹 Auth handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      if (showAuth === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        else alert("Account created! Check your email for verification.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) alert(error.message);
        else setShowAuth(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  };

  // 🔹 Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Bar */}
      <div className="relative flex justify-between items-center px-5 py-3 bg-white shadow-sm border-b">
        <div className="font-bold text-xl text-blue-600">Qlasar</div>
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
                    onClick={handleLogout}
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
              onClick={() => setShowAuth("login")}
              title="Login / Signup"
            >
              <User size={18} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
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
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold text-center mb-4 text-gray-700">
              {showAuth === "signup" ? "Create Account" : "Login"}
            </h2>
            <form onSubmit={handleAuth} className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 transition text-sm"
              >
                {showAuth === "signup" ? "Sign Up" : "Login"}
              </button>
            </form>

            <div className="text-center text-sm mt-3">
              {showAuth === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setShowAuth("login")}
                    className="text-blue-600 hover:underline"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setShowAuth("signup")}
                    className="text-blue-600 hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
