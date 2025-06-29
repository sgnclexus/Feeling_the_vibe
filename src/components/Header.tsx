import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Upload, BarChart3, History, Home, Sparkles, Zap } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'mood-quiz' | 'music-quiz' | 'upload' | 'analysis' | 'playlist' | 'recent') => void;
  onViewRecent: () => void;
  onStartOver: () => void;
  onQuickUpload?: () => void;
  showQuickUpload?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onNavigate, 
  onViewRecent, 
  onStartOver, 
  onQuickUpload,
  showQuickUpload = false 
}) => {
  const [isWhiteLogo, setIsWhiteLogo] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Automatic spin animation every 15-20 seconds
  useEffect(() => {
    const spinInterval = setInterval(() => {
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 1000);
    }, Math.random() * 5000 + 15000); // Random interval between 15-20 seconds

    return () => clearInterval(spinInterval);
  }, []);

  const handleLogoClick = () => {
    setIsWhiteLogo(!isWhiteLogo);
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
  };

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
            {/* Animated Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogoClick}
              className="relative cursor-pointer group"
            >
              <motion.div
                animate={{ 
                  rotate: isSpinning ? 360 : 0,
                  scale: isSpinning ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 1, ease: "easeInOut" },
                  scale: { duration: 1, ease: "easeInOut" }
                }}
                className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl group-hover:shadow-purple-500/50 transition-shadow duration-300"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={isWhiteLogo ? 'white' : 'black'}
                    src={isWhiteLogo ? '/white_circle_360x360.png' : '/black_circle_360x360.png'}
                    alt="Feeling the Vibe Logo"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    onError={(e) => {
                      console.error('Logo image failed to load:', e);
                      // Fallback to a simple circle with icon if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </AnimatePresence>
                
                {/* Fallback icon if image doesn't load */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Music className="w-8 h-8 text-white" />
                </div>
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    background: [
                      'linear-gradient(0deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3), rgba(168,85,247,0.3))',
                      'linear-gradient(120deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3), rgba(168,85,247,0.3))',
                      'linear-gradient(240deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3), rgba(168,85,247,0.3))',
                      'linear-gradient(360deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3), rgba(168,85,247,0.3))'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Sparkle effect on hover */}
                <motion.div
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
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
                currentView === 'mood-quiz'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg glow-effect'
                  : 'glass-card text-purple-200 hover:text-white hover:bg-white/20'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
              {currentView === 'mood-quiz' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl -z-10"
                />
              )}
            </motion.button>

            {showQuickUpload && onQuickUpload && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onQuickUpload}
                className="group relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 glass-card text-purple-200 hover:text-white hover:bg-white/20 border border-purple-400/50"
              >
                <Zap className="w-5 h-5" />
                <span className="hidden sm:inline">Quick Upload</span>
              </motion.button>
            )}

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