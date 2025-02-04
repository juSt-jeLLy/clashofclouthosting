"use client";

import { motion } from "framer-motion";
import MemeCard from "../_components/MemeCard";
import Navbar from "../_components/Navbar";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";

interface Meme {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  votes: number;
  stakes: number;
  tags: string[];
}

export default function MemePool() {
  const [memes, setMemes] = useState<Meme[]>([]);

  async function fetchMemes() {
    const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!providerUrl || !contractAddress) {
      throw new Error("Missing required environment variables");
    }

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const filter = contract.filters.MemeSubmitted();
    const events = await contract.queryFilter(filter);

    const memesData = await Promise.all(
      events.map(async (event): Promise<Meme | undefined> => {
        const cid = event.args.cid.toString();
        const totalStaked = await contract.totalStaked(cid);
      
        const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
        const metadata = await response.json();

        return {
          id: cid,
          imageUrl: metadata.gif_url,
          title: metadata.meme || "Untitled Meme",
          creator: event.args.creator,
          votes: 0,
          stakes: Number(ethers.formatEther(totalStaked)),
          tags: metadata.tags || []
        };
      })
    );

    // Filter out undefined values and explicitly type as Meme[]
    const validMemes: Meme[] = memesData.filter((meme): meme is Meme => meme !== undefined);
    setMemes(validMemes);
  }
  useEffect(() => {
    fetchMemes();
  }, []);

  // Rest of your existing UI code remains the same
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 text-transparent bg-clip-text drop-shadow-lg hover:scale-105 transition-transform"
          >
            🔥 Colosseum 🔥
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {memes.map((meme, index) => (
              <motion.div
                key={meme.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { delay: index * 0.1 },
                }}
              >
                <MemeCard {...meme} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const AnimatedBackground = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-purple-900 via-pink-800 to-purple-900"
    animate={{
      background: [
        "linear-gradient(45deg, #4a148c, #e91e63)",
        "linear-gradient(45deg, #311b92, #ff1744)",
        "linear-gradient(45deg, #4a148c, #e91e63)",
      ],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);
