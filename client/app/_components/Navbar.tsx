"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { useAccount } from 'wagmi'

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const buttonStyles =
  "text-white font-bold px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 h-[40px] flex items-center justify-center";

export default function Navbar() {
  const { login, authenticated, logout } = usePrivy();
  const [showDropdown, setShowDropdown] = useState(false);
  const { address } = useAccount()

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, rotate: -10 }}
      animate={{
        y: 0,
        rotate: 0,
        transition: {
          type: "spring",
          bounce: 0.7,
        },
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-purple-500/20"
  >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        <Link href="/">
          <motion.div
            whileHover={{
              scale: 1.2,
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 },
            }}
            whileTap={{ scale: 0.9 }}
            className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 text-transparent bg-clip-text bg-size-200 animate-gradient cursor-pointer"
          >
            <span className="hover:text-pink-400 transition-colors">C</span>
            <span className="hover:text-purple-400 transition-colors">l</span>
            <span className="hover:text-pink-400 transition-colors">a</span>
            <span className="hover:text-purple-400 transition-colors">s</span>
            <span className="hover:text-pink-400 transition-colors">h</span> 
            <span className="hover:text-purple-400 transition-colors">o</span>
            <span className="hover:text-pink-400 transition-colors">f</span> 
            <span className="hover:text-purple-400 transition-colors">C</span>
            <span className="hover:text-pink-400 transition-colors">l</span>
            <span className="hover:text-purple-400 transition-colors">o</span>
            <span className="hover:text-pink-400 transition-colors">u</span>
            <span className="hover:text-purple-400 transition-colors">t</span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-8">
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/"
            className={buttonStyles}
          >
            Home
          </motion.a>
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/hexpit"
            className={buttonStyles}
          >
            🔮 HexPit
          </motion.a>
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/memepool"
            className={buttonStyles}
          >
            🏆 Colosseum
          </motion.a>
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/profile"
            className={buttonStyles}
          >
            👤 Profile
          </motion.a>
          <motion.div className="relative">
            {authenticated ? (
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                whileHover={{
                  scale: 1.1,
                  y: [-2, 2, -2],
                  transition: {
                    y: {
                      repeat: Infinity,
                      duration: 0.5,
                    },
                  },
                }}
                whileTap={{ scale: 0.95 }}
                className={buttonStyles}
              >
                <div className="flex items-center gap-2">
                  <span>{address ? truncateAddress(address) : '0x0'}</span>
                </div>
              </motion.button>
            ) : (
              <motion.button
                onClick={login}
                whileHover={{
                  scale: 1.1,
                  y: [-2, 2, -2],
                  transition: {
                    y: {
                      repeat: Infinity,
                      duration: 0.5,
                    },
                  },
                }}
                whileTap={{ scale: 0.95 }}
                className={buttonStyles}
              >
                Connect Wallet
              </motion.button>
            )}
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-black/70 backdrop-blur-lg border border-purple-500/30 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20"
                >
                  <div className="py-1">
                    <motion.button 
                      onClick={handleLogout}
                      whileHover={{ backgroundColor: "rgba(236, 72, 153, 0.1)" }}
                      className="w-full text-left text-white hover:text-pink-500 py-2 px-4 text-sm transition-colors duration-200 flex items-center gap-2"
                    >
                      <span>🔓</span> Disconnect
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
