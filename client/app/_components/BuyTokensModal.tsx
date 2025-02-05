"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";
import { toast } from "react-hot-toast";

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyTokensModal({ isOpen, onClose }: BuyTokensModalProps) {
  const [ethAmount, setEthAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

  const buyTokens = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error("Please enter a valid ETH amount.");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed. Please install it to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const amountInWei = ethers.parseEther(ethAmount);
      const approveTx = await contract.approve(CONTRACT_ADDRESS, amountInWei);
      await approveTx.wait();
      toast.success("Approval successful!");
      const tx = await contract.buyTokens({ value: amountInWei });
      await tx.wait();
      toast.success("Tokens purchased successfully!");
      setEthAmount(""); // Reset input
      onClose();
    } catch (err: any) {
      if (err.message.includes("Send ETH to buy tokens")) {
        toast.error("You need to send ETH to buy tokens.");
      } else if (err.message.includes("Not enough tokens in contract")) {
        toast.error("Not enough tokens available.");
      } else {
        toast.error("Failed to buy tokens. Please try again.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-black/70 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
          Buy Meme Tokens
        </h2>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Enter ETH amount"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors"
          />

          <div className="flex gap-4">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg font-bold"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={buyTokens}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Buy Tokens"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
