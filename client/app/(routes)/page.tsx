"use client";

import { ReactElement } from "react";
import Navbar from "../_components/Navbar";
import MemeLeaderboard from "../_components/MemeLeaderboard";
import BrainrotAnimation from "../_components/BrainrotAnimation";
import HeroSection from "../_components/HeroSection";
import WinningMemes from "../_components/WinningMemes";

export default function Home(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 to-pink-900">
      <Navbar />
      <main className="relative">
        <BrainrotAnimation />
        <div className="container mx-auto px-4 py-8">
          <HeroSection />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <MemeLeaderboard />
            <WinningMemes />
          </div>
        </div>
      </main>
    </div>
  );
}
