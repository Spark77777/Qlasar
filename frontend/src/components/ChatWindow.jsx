export default function ChatWindow({ onToggleAlerts, alertsVisible }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-semibold">Qlasar Chat</h1>
        <button
          onClick={onToggleAlerts}
          className="px-3 py-1 text-sm font-medium text-white bg-teal-500 rounded hover:bg-teal-600"
        >
          {alertsVisible ? "Hide Alerts" : "Show Alerts"}
        </button>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Placeholder chat messages */}
        <div className="space-y-2">
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-lg">
              Hi Qlasar!
            </span>
          </div>
          <div className="text-left">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-lg">
              Hello! How can I assist you today?
            </span>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}
