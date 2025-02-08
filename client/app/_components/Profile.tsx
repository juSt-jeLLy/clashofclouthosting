"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { truncateAddress } from "../utils/formatting";
import Navbar from "../_components/Navbar";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { fetchMemes } from "../utils/fetchMemes";
import contractABI from "../../../server/scripts/abi.json";

interface Meme {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  votes: number;
  stakes: number;
  tags: string[];
  isWinner?: boolean;
}

export default function Profile() {
  const { address } = useAccount();
  const [submittedMemes, setSubmittedMemes] = useState<Meme[]>([]);
  const [stakedMemes, setStakedMemes] = useState<Meme[]>([]);
  const [winningMemes, setWinningMemes] = useState<Meme[]>([]);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
  const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;

  function isEventLog(event: ethers.Log | ethers.EventLog): event is ethers.EventLog {
    return (event as ethers.EventLog).args !== undefined;
  }

  async function fetchProfileMemes() {
    if (!address || !PROVIDER_URL || !CONTRACT_ADDRESS) return;

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    const allMemes = await fetchMemes();

    const submitted = allMemes.filter((meme) => meme.creator.toLowerCase() === address.toLowerCase())
      .map(meme => ({
        ...meme,
        isWinner: meme.isWinner || false
      }));
    setSubmittedMemes(submitted);

    const stakedFilter = contract.filters.TokensStaked();
    const stakedEvents = await contract.queryFilter(stakedFilter);
    const staked = (await Promise.all(
      stakedEvents
        .filter((event) => 
          isEventLog(event) && 
          event.args?.staker && 
          event.args.staker.toLowerCase() === address.toLowerCase()
        )
        .map(async (event) => {
          if (!isEventLog(event)) return null;
    
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
            tags: metadata.tags || [],
            isWinner: false
          } as Meme;
        })
    )).filter((meme): meme is Meme => meme !== null);
    
    setStakedMemes(staked);

    const winningFilter = contract.filters.WinnerDeclared();
    const events = await contract.queryFilter(winningFilter);

    const winning = await Promise.all(
      events
        .filter((event) => 
          isEventLog(event) && 
          event.args?.winner && 
          event.args.winner.toLowerCase() === address.toLowerCase()
        )
        .map(async (event) => {
          if (!isEventLog(event)) return undefined;
          
          const cid = event.args.cid;
          const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
          const metadata = await response.json();

          return {
            id: cid,
            imageUrl: metadata.gif_url,
            title: metadata.meme || "Champion Meme",
            creator: event.args.winner,
            votes: 0,
            stakes: Number(ethers.formatEther(await contract.totalStaked(cid))),
            tags: metadata.tags || [],
            isWinner: true
          } as Meme;
        })
    ).then(memes => memes.filter((meme): meme is Meme => meme !== undefined));

    setWinningMemes(winning);
  }

  useEffect(() => {
    if (address) {
      fetchProfileMemes();
    }
  }, [address]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 to-pink-900">
      <Navbar />
      <main className="relative">
        <div className="container mx-auto px-4 py-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="bg-black/50 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 mt-12"
            >
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 text-center">
                <motion.h1
                  whileHover={{ scale: 1.1 }}
                  className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
                >
                  My Profile
                </motion.h1>
                <motion.p variants={itemVariants} className="text-gray-400 mt-2 hover:text-purple-400 transition-colors">
                  {address ? truncateAddress(address) : "Connect Wallet"}
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8">
                {[
                  { type: "Submitted", memes: submittedMemes },
                  { type: "Staked", memes: stakedMemes },
                  { type: "Winning", memes: winningMemes },
                ].map(({ type, memes }) => (
                  <motion.div
                    key={type}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 hover:border-pink-500/40"
                  >
                    <motion.h2
                      whileHover={{ scale: 1.1 }}
                      className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4"
                    >
                      {type} Memes
                    </motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {memes.map((meme) => (
                        <motion.div
                          key={meme.id}
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-purple-500/20"
                        >
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={meme.imageUrl}
                            alt={meme.title}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <h3 className="text-white font-semibold text-sm">{meme.title}</h3>
                          <p className="text-gray-400 text-xs mt-1">
                            {meme.isWinner ? "🏆 Winner" : `Stakes: ${meme.stakes}`}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
