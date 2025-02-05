"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";
import { toast } from "react-hot-toast";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
  memeId: string;
}

export default function StakeModal({
  isOpen,
  onClose,
  memeId,
}: StakeModalProps) {
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Initiating stake transaction...");

    try {
      // Check if wallet is connected
      if (!window.ethereum) {
        toast.error("Please install MetaMask to stake", { id: toastId });
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum as unknown as ethers.Eip1193Provider
      );

      // Request account access
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .catch((error: any) => {
          if (error.code === 4001) {
            toast.error("Please connect your wallet", { id: toastId });
            throw new Error("User rejected wallet connection");
          }
        });

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const amount = ethers.parseUnits(stakeAmount, 18);

      // Add approval step
      const approveTx = await contract.approve(CONTRACT_ADDRESS, amount);
      toast.loading("Approving token spend...", { id: toastId });
      await approveTx.wait();

      // Continue with stake transaction
      const stakeTx = await contract.stakeTokens(memeId, amount);
      toast.loading("Staking tokens...", { id: toastId });
      const receipt = await stakeTx.wait();

      if (receipt.status === 1) {
        toast.success("Stake successful! 🎉", { id: toastId });
        setStakeAmount("");
        onClose();
      }
    } catch (err: any) {
      console.error("Staking error:", err);

      // Handle specific error cases
      if (err.message.includes("insufficient funds")) {
        toast.error("Insufficient funds for gas", { id: toastId });
      } else if (err.message.includes("User rejected")) {
        toast.error("Transaction cancelled", { id: toastId });
      } else {
        toast.error(`Staking failed: ${err.message.slice(0, 50)}...`, {
          id: toastId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setStakeAmount("");
      onClose();
      toast.dismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-black/70 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
          Stake on Meme
        </h2>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Enter MTK amount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            disabled={isLoading}
            min="0"
            step="0.000000000000000001"
            className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors disabled:opacity-50"
          />

          <div className="flex gap-4">
            <motion.button
              onClick={handleClose}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg font-bold disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleStake}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold disabled:opacity-50"
            >
              {isLoading ? "Staking..." : "Stake"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
