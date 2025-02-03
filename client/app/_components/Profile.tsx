"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { truncateAddress } from "../utils/formatting";
import Navbar from "../_components/Navbar";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";
import { useEffect, useState } from "react";
interface Meme {
  cid: string;
  creator: string;
  title: string;
  score: number;
  isWinner: boolean;
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

  async function fetchUserMemes() {
    if (!address || !PROVIDER_URL || !CONTRACT_ADDRESS) return;

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    // Fetch all MemeSubmitted events
    const submittedFilter = contract.filters.MemeSubmitted();
    const submittedEvents = await contract.queryFilter(submittedFilter);

    // Filter events by creator address
    const submitted = await Promise.all(
      submittedEvents
        .filter((event) => {
          if (isEventLog(event)) {
            return event.args.creator.toLowerCase() === address.toLowerCase();
          }
          return false;
        })
        .map(async (event) => {
          if (isEventLog(event)) {
            const totalStaked = await contract.totalStaked(event.args.cid);
            return {
              cid: event.args.cid.toString(),
              creator: event.args.creator,
              title: "",
              score: Number(ethers.formatEther(totalStaked)),
              isWinner: false,
            };
          }
          return {
            cid: "",
            creator: "",
            title: "",
            score: 0,
            isWinner: false,
          };
        })
    );
    setSubmittedMemes(submitted.filter((meme) => meme.cid !== ""));

    // Repeat similar logic for staked and winning memes
    const stakedFilter = contract.filters.TokensStaked();
    const stakedEvents = await contract.queryFilter(stakedFilter);
    const staked = await Promise.all(
      stakedEvents
        .filter((event) => {
          if (isEventLog(event)) {
            return event.args.staker.toLowerCase() === address.toLowerCase();
          }
          return false;
        })
        .map(async (event) => {
          if (isEventLog(event)) {
            const totalStaked = await contract.totalStaked(event.args.cid);
            return {
              cid: event.args.cid.toString(),
              creator: event.args.creator,
              title: "",
              score: Number(ethers.formatEther(totalStaked)),
              isWinner: false,
            };
          }
          return {
            cid: "",
            creator: "",
            title: "",
            score: 0,
            isWinner: false,
          };
        })
    );
    setStakedMemes(staked.filter((meme) => meme.cid !== ""));

    const winningFilter = contract.filters.WinnerDeclared();
    const winningEvents = await contract.queryFilter(winningFilter);
    const winning = await Promise.all(
      winningEvents
        .filter((event) => {
          if (isEventLog(event)) {
            return event.args.creator.toLowerCase() === address.toLowerCase();
          }
          return false;
        })
        .map(async (event) => {
          if (isEventLog(event)) {
            const totalStaked = await contract.totalStaked(event.args.cid);
            return {
              cid: event.args.cid.toString(),
              creator: event.args.creator,
              title: "",
              score: Number(ethers.formatEther(totalStaked)),
              isWinner: true,
            };
          }
          return {
            cid: "",
            creator: "",
            title: "",
            score: 0,
            isWinner: false,
          };
        })
    );
    setWinningMemes(winning.filter((meme) => meme.cid !== ""));
  }  async function getMemeData(memes: Meme[]): Promise<Meme[]> {
    return await Promise.all(
      memes.map(async (meme) => {
        const response = await fetch(`https://ipfs.io/ipfs/${meme.cid}`);
        const data = await response.json();
        return { ...meme, title: data.title };
      })
    );
  }

  useEffect(() => {
    if (address) {
      fetchUserMemes();
    }
  }, [address]);

  useEffect(() => {
    async function loadMemeData() {
      const submittedWithData = await getMemeData(submittedMemes);
      const stakedWithData = await getMemeData(stakedMemes);
      const winningWithData = await getMemeData(winningMemes);

      setSubmittedMemes(submittedWithData);
      setStakedMemes(stakedWithData);
      setWinningMemes(winningWithData);
    }
    loadMemeData();
  }, [submittedMemes, stakedMemes, winningMemes]);

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
                          key={meme.cid}
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-purple-500/20"
                        >
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={`https://ipfs.io/ipfs/${meme.cid}`}
                            alt={meme.title}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <h3 className="text-white font-semibold text-sm">{meme.title}</h3>
                          <p className="text-gray-400 text-xs mt-1">
                            {meme.isWinner ? "🏆 Winner" : `Score: ${meme.score}`}
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
