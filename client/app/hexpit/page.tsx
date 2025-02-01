"use client";

import { motion } from "framer-motion";

export default function HexPit() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black pt-24 px-4"
    >
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
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">Meme Generator</h2>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Top Text"
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors"
              />
              <input 
                type="text"
                placeholder="Bottom Text"
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors"
              />
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50">
                Generate Meme
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">Preview</h2>
            <div className="aspect-square bg-black/30 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-500/30">
              <p className="text-purple-400">Your meme will appear here</p>
            </div>
          </div>
        </motion.div>

        {/* Submit to Colosseum Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-lg"
        >
          <h2 className="text-2xl font-bold text-purple-300 mb-4">Submit to Colosseum</h2>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Meme Title"
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors"
            />
            <textarea 
              placeholder="Description"
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white focus:border-pink-500 transition-colors h-32"
            />
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50">
              Submit to Colosseum
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
