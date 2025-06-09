import React from 'react';
import { motion } from 'framer-motion';
import { Music, Upload, BarChart3, History, Home } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'upload' | 'analysis' | 'playlist' | 'recent') => void;
  onViewRecent: () => void;
  onStartOver: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onViewRecent, onStartOver }) => {
  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Feeling the Vibe 🎧
              </h1>
              <p className="text-sm text-gray-400">AI-powered mood playlist generator</p>
            </div>
          </motion.div>

          <nav className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartOver}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewRecent}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'recent'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Recent</span>
            </motion.button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;