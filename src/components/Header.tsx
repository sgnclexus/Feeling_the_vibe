import React from 'react';
import { motion } from 'framer-motion';
import { Music, Upload, BarChart3, History, Home, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'upload' | 'analysis' | 'playlist' | 'recent') => void;
  onViewRecent: () => void;
  onStartOver: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onViewRecent, onStartOver }) => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative glass-card-strong border-b border-white/20 overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 animate-gradient-x" />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl shadow-2xl glow-effect"
            >
              <Music className="w-8 h-8 text-white" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
            </motion.div>
            
            <div>
              <motion.h1 
                className="text-3xl font-bold gradient-text text-shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                Feeling the Vibe 🎧
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-purple-200/80 font-medium"
              >
                AI-powered emotional playlist generator
              </motion.p>
            </div>
          </motion.div>

          <nav className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartOver}
              className={`group relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                currentView === 'upload'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg glow-effect'
                  : 'glass-card text-purple-200 hover:text-white hover:bg-white/20'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
              {currentView === 'upload' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl -z-10"
                />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewRecent}
              className={`group relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                currentView === 'recent'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg glow-effect'
                  : 'glass-card text-purple-200 hover:text-white hover:bg-white/20'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">Recent</span>
              {currentView === 'recent' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl -z-10"
                />
              )}
            </motion.button>
          </nav>
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
          />
        ))}
      </div>
    </motion.header>
  );
};

export default Header;