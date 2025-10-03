import React from 'react';
import { motion } from 'framer-motion';

export default function SessionSidebar({ toggle }) {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      className="fixed top-14 left-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow-lg z-40 p-4 overflow-y-auto"
    >
      <div className="flex justify-between mb-4">
        <h2 className="font-bold text-lg">Sessions</h2>
        <button onClick={toggle}>Close</button>
      </div>
      {/* Add session list here */}
    </motion.div>
  );
}
