import { FaGithub, FaBook, FaTwitter, FaDiscord } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-black/30 backdrop-blur-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://docs.clashofclout.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white hover:text-pink-400 transition-all duration-300 transform hover:scale-110"
            >
              <FaBook className="text-xl" />
              <span className="group-hover:underline text-sm">Docs</span>
            </a>
            <a 
              href="https://github.com/juSt-jeLLy/Clash-of-Clout" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white hover:text-pink-400 transition-all duration-300 transform hover:scale-110"
            >
              <FaGithub className="text-xl" />
              <span className="group-hover:underline text-sm">GitHub</span>
            </a>
            <a 
              href="https://twitter.com/clashofclout" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white hover:text-pink-400 transition-all duration-300 transform hover:scale-110"
            >
              <FaTwitter className="text-xl" />
              <span className="group-hover:underline text-sm">Twitter</span>
            </a>
            <a 
              href="https://discord.gg/clashofclout" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white hover:text-pink-400 transition-all duration-300 transform hover:scale-110"
            >
              <FaDiscord className="text-xl" />
              <span className="group-hover:underline text-sm">Discord</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-white/70 text-sm">
            © 2024 Clash of Clout
          </div>
        </div>
      </div>
    </footer>
  );
}