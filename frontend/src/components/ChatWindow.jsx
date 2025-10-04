import React, { useState } from "react";

export default function ChatWindow({ isDimmed }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages([...messages, { role: "user", content: userMsg }, { role: "assistant", content: "Qlasar is thinking..." }]);
    setInput("");

    try {
      // Send message and get requestId
      const res = await fetch("https://qlasar.onrender.com/api/qlasar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map(m => [m.role === "user" ? m.content : "", m.role === "assistant" ? m.content : ""]).filter(([u,b])=>u||b)
        })
      });
      const { requestId } = await res.json();

      // Poll for response
      const poll = setInterval(async () => {
        const resp = await fetch(`https://qlasar.onrender.com/api/qlasar/${requestId}`);
        const data = await resp.json();
        if (data.status === "done" || data.status === "error") {
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: "assistant", content: data.reply };
            return newMsgs;
          });
          clearInterval(poll);
        }
      }, 2000); // poll every 2 seconds

    } catch (err) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: "assistant", content: "❌ Error connecting to backend" };
        return newMsgs;
      });
    }
  };

  return (
    <div className={`transition-opacity duration-300 ${isDimmed ? "opacity-30" : "opacity-100"} pt-20 p-4`}>
      <div className="flex flex-col gap-2 max-w-xl mx-auto">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-2 rounded ${m.role==="user"?"bg-blue-100 self-end":"bg-gray-200 self-start"}`}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 flex gap-2 shadow">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Type your message..."
          onKeyDown={e => e.key==="Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded">Send</button>
      </div>
    </div>
  );
}
