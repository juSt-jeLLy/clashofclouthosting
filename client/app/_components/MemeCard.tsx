"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import StakeModal from "./StakeModal";
import BuyTokensModal from "./BuyTokensModal";
import { toast } from "react-hot-toast"; // Add toast import
import {useAccount} from "wagmi";
import {ethers} from "ethers";
import contractABI from "../abi.json";

interface MemeCardProps {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  stakes: number;
  tags: string[];
}



const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  try {
    if (!address) throw new Error("Invalid address");
    if (address.length <= startLength + endLength) return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  } catch (error) {
    toast.error("Invalid address format");
    return "Invalid Address";
  }
};

export default function MemeCard({ id, imageUrl, title, creator, stakes, tags }: MemeCardProps) {
  const [isStakeModalOpen, setIsStakeModalOpen] = useState<boolean>(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
  const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;
  const {address} = useAccount();
  const [isOwner, setIsOwner]= useState<boolean>(false);
  const handleStakeSuccess = () => {
    toast.success("Stake transaction completed!");
    setIsStakeModalOpen(false);
    setIsLoading(false);
  };

  const handleBuySuccess = () => {
    toast.success("Token purchase successful!");
    setIsBuyModalOpen(false);
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    toast.error(error.message || "Transaction failed. Please try again.");
  };

  const handleStakeClick = () => {
    setIsLoading(true);
    setIsStakeModalOpen(true);
  };

  const handleBuyClick = () => {
    setIsLoading(true);
    setIsBuyModalOpen(true);
  };

  async function getOwner() {
    if (!address || !PROVIDER_URL || !CONTRACT_ADDRESS) return;
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
    const owner = await contract.owner();
    console.log("the owner of the contract is ", owner);
    if (address) {
      if (owner.toLowerCase() === address.toLowerCase()) {
        console.log("You are the owner");
        setIsOwner(true);
      }
      else{
        console.log("You are not the owner");
        setIsOwner(false);
      }
    }
    
  }

  async function declareWinner(cid: string) {
    if (!address || !PROVIDER_URL || !CONTRACT_ADDRESS) return;
  
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
  
    try {
      const tx = await contract.declareWinner(cid);
      await tx.wait();
      console.log(`Winner declared for meme with CID: ${cid}`);
    } catch (error) {
      console.error("Error declaring winner:", error);
    }
  }

  const handleDeclareWinner = () => {
    try {
      setIsLoading(true);
      declareWinner(id);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    getOwner();
  }, []);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
        className="bg-black/40 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-500/20 hover:border-pink-500/40 transition-colors"
      >
        <div className="relative h-48 w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              onError={() => toast.error("Failed to load image")}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <motion.h3 
            whileHover={{ scale: 1.02 }}
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
          >
            {title || "Untitled Meme"}
          </motion.h3>
          
          <p className="text-gray-400 mt-2">Created by: {truncateAddress(creator)}</p>
          
          <div className="flex gap-2 mt-3 flex-wrap">
            {tags?.length > 0 ? tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">
                {tag}
              </span>
            )) : (
              <span className="text-gray-400 text-sm">No tags</span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Total Staked: <span className="font-bold text-emerald-400">{stakes || 0} 💎</span>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleStakeClick}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-bold disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Stake"}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBuyClick}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-bold disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Buy Tokens"}
              </motion.button>
              {isOwner? (<motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDeclareWinner}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-bold disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Declare Winner"}
              </motion.button>): null}
            </div>
          </div>
        </div>
      </motion.div>

      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => {
          setIsStakeModalOpen(false);
          setIsLoading(false);
        }}
        onSuccess={handleStakeSuccess}
        onError={handleError}
        memeId={id}
      />
      
      <BuyTokensModal
        isOpen={isBuyModalOpen}
        onClose={() => {
          
          setIsBuyModalOpen(false);
          setIsLoading(false);
        }}
        onSuccess={handleBuySuccess}
        onError={handleError}
      />
    </>
  );
}
