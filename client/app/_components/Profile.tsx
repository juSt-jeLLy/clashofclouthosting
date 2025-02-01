"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { truncateAddress } from "../utils/formatting";
import Navbar from "../_components/Navbar";

export default function Profile() {
  const { address } = useAccount();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 to-pink-900">
      <Navbar />
      <main className="relative">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="bg-black/50 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 mt-12"
            >
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-8 text-center"
              >
                <motion.h1 
                  whileHover={{ scale: 1.1 }}
                  className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
                >
                  My Profile
                </motion.h1>
                <motion.p 
                  variants={itemVariants}
                  className="text-gray-400 mt-2 hover:text-purple-400 transition-colors"
                >
                  {address ? truncateAddress(address) : "Connect Wallet"}
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8">
                {["Staked", "Winning", "Submitted"].map((type) => (
                  <motion.div 
                    key={type}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 hover:border-pink-500/40"
                  >
                    <motion.h2 
                      whileHover={{ scale: 1.1 }}
                      className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4"
                    >
                      {type} Memes
                    </motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Meme grid content */}
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
