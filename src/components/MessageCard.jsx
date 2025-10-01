import React from "react";

export default function MessageCard({ type, content }) {
  return (
    <div
      className={`my-2 p-3 rounded max-w-xl ${
        type === "user" ? "bg-teal-100 text-right self-end" : "bg-gray-200 dark:bg-gray-700 text-left self-start"
      }`}
    >
      {content}
    </div>
  );
}
