"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import StakeModal from "./StakeModal";

interface MemeCardProps {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  stakes: number;
  tags: string[];
}

export default function MemeCard({ id, imageUrl, title, creator, stakes, tags }: MemeCardProps) {
  const [isStakeModalOpen, setIsStakeModalOpen] = useState<boolean>(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
        className="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-500/20 hover:border-pink-500/40 transition-colors"
      >
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="p-4">
          <motion.h3 
            whileHover={{ scale: 1.02 }}
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
          >
            {title}
          </motion.h3>
          
          <p className="text-gray-400 mt-2">Created by: {creator}</p>
          
          <div className="flex gap-2 mt-3">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsStakeModalOpen(true)}
              className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-bold"
            >
              💎 {stakes} Stake
            </motion.button>
          </div>
        </div>
      </motion.div>

      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        memeId={id}
      />
    </>
  );
}
