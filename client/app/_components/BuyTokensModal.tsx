"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";
import { toast } from "react-hot-toast";

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
}

export default function BuyTokensModal({
  isOpen,
  onClose,
}: BuyTokensModalProps) {
  const [ethAmount, setEthAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

  const validateInput = () => {
    if (!ethAmount.trim()) {
      toast.error("FLOW amount is required");
      return false;
    }
    if (isNaN(parseFloat(ethAmount)) || parseFloat(ethAmount) <= 0) {
      toast.error("Please enter a valid positive FLOW amount");
      return false;
    }
    return true;
  };

  const handleClose = () => {
    setEthAmount("");
    setIsLoading(false);
    onClose();
  };

  const buyTokens = async () => {
    if (!validateInput()) return;

    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask to continue", {
        duration: 4000,
        icon: "🦊",
      });
      return;
    }

    const toastId = toast.loading("Initializing transaction...");
    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as unknown as ethers.Eip1193Provider
      );

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const amountInWei = ethers.parseEther(ethAmount);
      const amt = amountInWei.toString();

      toast.loading("Purchasing tokens...", { id: toastId });
      const tx = await contract.buyTokens({ value: amt });

      toast.loading("Waiting for confirmation...", { id: toastId });
      await tx.wait();

      toast.loading("Approving transaction...", { id: toastId });
      const approveTx = await contract.approve(CONTRACT_ADDRESS, amt);
      await approveTx.wait();

      toast.success("🎉 Transaction completed successfully!", {
        id: toastId,
        duration: 5000,
      });

      // Reset and close modal
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message || "Transaction failed";

      if (errorMessage.includes("user rejected")) {
        toast.error("Transaction rejected by user", { id: toastId });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient FLOW balance", { id: toastId });
      } else if (errorMessage.includes("Send ETH to buy tokens")) {
        toast.error("Please send FLOW to buy tokens", { id: toastId });
      } else if (errorMessage.includes("Not enough tokens")) {
        toast.error("Insufficient token supply in contract", { id: toastId });
      } else {
        toast.error(`Transaction failed: ${errorMessage.slice(0, 50)}...`, {
          id: toastId,
        });
      }

      console.error("Transaction Error:", err);
    } finally {
      setIsLoading(false);
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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-black/70 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
          Buy Meme Tokens
        </h2>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Enter FLOW amount"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            disabled={isLoading}
            className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors disabled:opacity-50"
          />

          <div className="flex gap-4">
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
              className="flex-1 py-2 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg font-bold disabled:opacity-50"
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
