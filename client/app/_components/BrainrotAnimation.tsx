"use client";

import { motion } from "framer-motion";

export default function BrainrotAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
      />
    </div>
  );
}
