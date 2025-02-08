"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi.json";
import { toast, Toaster } from "react-hot-toast";

export default function HexPit() {
  const [keywords, setKeywords] = useState<string>("");
  const [memeUrl, setMemeUrl] = useState<string>("");
  const [memeText, setMemeText] = useState<string>("");
  const [cidHash, setCidHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

  const generateMeme = async () => {
    if (!keywords.trim()) {
      toast.error("Please enter keywords to generate a meme.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/generate/" + keywords,
        {
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failed to generate meme");

      const data = await response.json();

      const responseIpfs = await fetch(
        `https://gray-tough-gull-222.mypinata.cloud/ipfs/${data.cid}`
      );
      const metadata = await responseIpfs.json();

      setMemeUrl(metadata.gif_url);
      setMemeText(metadata.meme);
      setCidHash(data.cid);
      toast.success("Meme generated successfully!");
    } catch (err) {
      toast.error("Failed to generate meme. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitMeme = async () => {
    if (!memeUrl) {
      toast.error("Please generate a meme first.");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as unknown as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      provider.on("debug", console.log);

      // Upload meme to IPFS
      /*
      const ipfsResponse = await fetch("/api/upload-to-ipfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: memeUrl }),
      });

      if (!ipfsResponse.ok) throw new Error("Failed to upload to IPFS");

      const ipfsData = await ipfsResponse.json();
      const cid = ipfsData.cid;*/

      // Submit meme to smart contract
      const tx = await contract.submitMeme(cidHash, await signer.getAddress(), {
        gasLimit: ethers.toNumber("500000"),
        gasPrice: ethers.parseUnits("0.1", "gwei"),
        value: ethers.parseEther("0")
      });
      await tx.wait();

      toast.success("Meme submitted successfully!");
      setMemeUrl("");
      setKeywords("");
    } catch (err) {
      toast.error("Failed to submit meme. Please try again.");
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black pt-24 px-4"
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 text-transparent bg-clip-text">
            The Hex Pit
          </h1>
          <p className="text-purple-300 mt-4">Forge Your Meme Magic</p>
        </motion.div>

        {/* Meme Generation Section */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-lg w-full max-w-2xl"
          >
            <h2 className="text-3xl font-bold text-purple-300 mb-6">
              Meme Generator
            </h2>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Enter keywords for your meme"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors"
              />
              <motion.button
                onClick={generateMeme}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate Meme"}
              </motion.button>
            </div>
          </motion.div>

          {memeUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-lg w-full max-w-2xl"
            >
              <h2 className="text-3xl font-bold text-purple-300 mb-6">
                Your Meme
              </h2>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-lg border border-purple-500/30 overflow-hidden">
                  <img
                    src={memeUrl}
                    alt="Generated Meme"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-xl font-semibold text-purple-300">
                {memeText}
              </p>
              <motion.button
                onClick={submitMeme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
              >
                Submit to Contest
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
