export default function SessionSidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">Qlasar Sessions</div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">Research</div>
        <div className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">Learning</div>
        <div className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">Weekend</div>
      </div>
    </div>
  );
}
