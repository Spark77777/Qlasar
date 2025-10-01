export default function ChatWindow() {
  return (
    <div className="flex-1 flex flex-col bg-white p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {/* Conversation stream */}
      </div>
      <div className="flex">
        <input className="flex-1 border rounded px-4 py-2 mr-2" placeholder="Type a message..." />
        <button className="bg-teal-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
