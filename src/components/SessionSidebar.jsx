export default function SessionSidebar() {
  return (
    <div className="w-1/5 bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">Qlasar Sessions</h1>
      <button className="mb-4 bg-teal-500 text-white px-4 py-2 rounded">+ New Session</button>
      {/* List of sessions will go here */}
    </div>
  );
}
