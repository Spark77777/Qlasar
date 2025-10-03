import React, { useState } from 'react';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');

    // Call backend
    try {
      const res = await fetch("http://localhost:8000/ask", {  // change to your Render URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error contacting backend" }]);
    }
  };

  return (
    <div className="pt-16 px-4 pb-24 h-full overflow-y-auto">
      <div className="flex flex-col gap-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role==='user' ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex p-2 bg-white shadow-inner">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a message..." />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Send</button>
      </div>
    </div>
  );
}
