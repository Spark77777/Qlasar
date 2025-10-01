export default function MessageCard({ message, type }) {
  const alignment = type === "user" ? "text-right" : "text-left";
  return (
    <div className={`mb-2 p-2 rounded ${alignment} ${type === "user" ? "bg-teal-100" : "bg-gray-200"}`}>
      {message}
    </div>
  );
}
