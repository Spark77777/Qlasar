import { useState } from "react";

export default function App() {
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <h1 className="text-lg font-bold">Qlasar</h1>
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="bg-blue-500 px-3 py-1 rounded-md text-sm"
        >
          {showAlerts ? "Hide Alerts" : "Proactive Alerts"}
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left panel */}
        <div className="md:w-1/2 p-4 bg-gray-100 overflow-auto">
          <h2 className="font-semibold mb-2">Input</h2>
          <textarea
            className="w-full border rounded p-2"
            rows={6}
            placeholder="Type your thoughts..."
          />
        </div>

        {/* Right panel */}
        <div className="md:w-1/2 p-4 bg-gray-200 overflow-auto">
          <h2 className="font-semibold mb-2">Response</h2>
          <div className="bg-white p-3 rounded shadow">
            Model responses will appear here.
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <>
          {/* Mobile view - drawer from bottom */}
          <div className="fixed inset-x-0 bottom-0 bg-yellow-100 border-t border-yellow-300 p-4 max-h-[40%] overflow-auto shadow-lg md:hidden">
            <h2 className="font-semibold mb-2">Proactive Alerts</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>New insight generated...</li>
              <li>Recent trend detected...</li>
              <li>Signal from your past activity...</li>
            </ul>
          </div>

          {/* Desktop view - right side panel */}
          <div className="hidden md:block absolute right-0 top-14 w-1/3 h-[calc(100%-3.5rem)] bg-yellow-100 border-l border-yellow-300 p-4 shadow-lg overflow-auto">
            <h2 className="font-semibold mb-2">Proactive Alerts</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>New insight generated...</li>
              <li>Recent trend detected...</li>
              <li>Signal from your past activity...</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
