"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import StakeModal from "./StakeModal";
import BuyTokensModal from "./BuyTokensModal";

interface MemeCardProps {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  stakes: number;
  tags: string[];
}

// Utility function to truncate the address
const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export default function MemeCard({ id, imageUrl, title, creator, stakes, tags }: MemeCardProps) {
  const [isStakeModalOpen, setIsStakeModalOpen] = useState<boolean>(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);


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
          
          {/* Truncated creator address */}
          <p className="text-gray-400 mt-2">Created by: {truncateAddress(creator)}</p>
          
          <div className="flex gap-2 mt-3">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">
                {tag}
              </span>
            ))}
          </div>

          {/* Show total staked amount here */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Total Staked: <span className="font-bold text-emerald-400">{stakes} 💎</span>
            </div>

            {/* Stake button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsStakeModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-bold"
            >
              Stake
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsBuyModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-bold"
            >
              Buy Meme Tokens
            </motion.button>
          </div>
        </div>
      </motion.div>

      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        memeId={id}
      />
      <BuyTokensModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        
      />
    </>
  );
}
