import React from 'react';
import { motion } from 'framer-motion';

export default function ProactiveAlerts({ toggle }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-14 right-0 bottom-0 w-3/4 md:w-1/3 bg-white shadow
