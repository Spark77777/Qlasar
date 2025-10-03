import React from 'react';
import { motion } from 'framer-motion';

export default function ProactiveAlerts({ toggle }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-14 right-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow-lg z-40 p-4 overflow-y-auto"
    >
      <div className="flex justify-between mb-4">
        <h2 className="font-bold text-lg">Proactive Alerts</h2>
        <button onClick={toggle}>Close</button>
      </div>

      {/* Example alerts */}
      <div className="flex flex-col gap-2">
        <div className="p-2 bg-gray-200 rounded">Fact: Qlasar UI updated!</div>
        <div className="p-2 bg-gray-200 rounded">Trend: AI adoption rising.</div>
        <div className="p-2 bg-gray-200 rounded">Signal: New API version released.</div>
      </div>
    </motion.div>
  );
}
