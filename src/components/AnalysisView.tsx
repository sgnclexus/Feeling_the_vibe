import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, TrendingUp, Music, Heart, Sparkles, Zap } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisViewProps {
  result: AnalysisResult;
  fileUrl: string | null;
  onViewPlaylist: () => void;
  onStartOver: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  result, 
  fileUrl, 
  onViewPlaylist, 
  onStartOver 
}) => {
  const getMoodTheme = (emotion: string) => {
    const themes = {
      happy: {
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        bg: 'bg-mood-happy',
        emoji: '😊',
        color: 'text-yellow-300',
        description: 'Radiating pure joy and positivity!'
      },
      sad: {
        gradient: 'from-blue-400 via-blue-600 to-indigo-700',
        bg: 'bg-mood-sad',
        emoji: '😢',
        color: 'text-blue-300',
        description: 'Embracing the beauty in melancholy'
      },
      angry: {
        gradient: 'from-red-400 via-red-600 to-red-800',
        bg: 'bg-mood-angry',
        emoji: '😠',
        color: 'text-red-300',
        description: 'Channeling that fierce energy!'
      },
      surprised: {
        gradient: 'from-purple-400 via-pink-500 to-purple-600',
        bg: 'bg-mood-excited',
        emoji: '😲',
        color: 'text-purple-300',
        description: 'Full of wonder and excitement!'
      },
      calm: {
        gradient: 'from-green-400 via-teal-500 to-blue-500',
        bg: 'bg-mood-calm',
        emoji: '😌',
        color: 'text-green-300',
        description: 'In perfect harmony and peace'
      },
      neutral: {
        gradient: 'from-gray-400 via-gray-600 to-gray-800',
        bg: 'bg-mood-neutral',
        emoji: '😐',
        color: 'text-gray-300',
        description: 'Balanced and centered'
      },
      fearful: {
        gradient: 'from-purple-600 via-indigo-700 to-purple-900',
        bg: 'bg-gradient-to-br from-purple-600/20 to-indigo-800/20',
        emoji: '😨',
        color: 'text-purple-300',
        description: 'Navigating through uncertainty'
      },
      disgusted: {
        gradient: 'from-green-600 via-yellow-600 to-green-700',
        bg: 'bg-gradient-to-br from-green-600/20 to-yellow-600/20',
        emoji: '🤢',
        color: 'text-green-300',
        description: 'Processing complex feelings'
      }
    };
    return themes[emotion as keyof typeof themes] || themes.neutral;
  };

  const moodTheme = getMoodTheme(result.dominantEmotion);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-10"
      >
        {/* Left Column - Media & Emotion Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-8"
        >
          {/* Media Display */}
          <div className="glass-card-strong rounded-4xl p-8 border border-white/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10" />
            
            <motion.h3 
              className="text-2xl font-bold text-white mb-6 flex items-center relative z-10"
              whileHover={{ scale: 1.02 }}
            >
              <TrendingUp className="w-6 h-6 mr-3 text-purple-400" />
              Your Captured Moment
            </motion.h3>
            
            {fileUrl && (
              <motion.div 
                className="rounded-3xl overflow-hidden bg-black/30 relative z-10 group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {fileUrl.includes('.mp4') || fileUrl.includes('.webm') || fileUrl.includes('.mov') ? (
                  <video 
                    src={fileUrl} 
                    controls 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : (
                  <img 
                    src={fileUrl} 
                    alt="Your vibe capture" 
                    className="w-full h-auto max-h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            )}
          </div>

          {/* Emotion Analysis Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="glass-card-strong rounded-4xl p-8 border border-white/30 relative overflow-hidden"
          >
            <div className={`absolute inset-0 ${moodTheme.bg} opacity-20`} />
            
            <motion.h3 
              className="text-2xl font-bold text-white mb-8 relative z-10"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="w-6 h-6 mr-3 text-yellow-400 inline" />
              Emotion Analysis
            </motion.h3>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl"
                  >
                    {moodTheme.emoji}
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-3xl font-bold text-white capitalize mb-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      {result.dominantEmotion}
                    </motion.p>
                    <p className={`text-lg ${moodTheme.color} font-semibold`}>
                      {(result.confidence * 100).toFixed(1)}% confidence
                    </p>
                    <p className="text-purple-200 text-sm mt-1">
                      {moodTheme.description}
                    </p>
                  </div>
                </div>
                
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              {/* Confidence Bar */}
              <div className="w-full bg-white/10 rounded-full h-4 mb-6 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${moodTheme.gradient} relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence * 100}%` }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/30"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Vibe & Playlist */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-8"
        >
          {/* Vibe Description */}
          <motion.div
            className="glass-card-strong rounded-4xl p-8 border border-white/30 relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 via-purple-600/10 to-pink-600/10" />
            
            <motion.h3 
              className="text-3xl font-bold text-white mb-6 flex items-center relative z-10"
              whileHover={{ scale: 1.02 }}
            >
              <Heart className="w-8 h-8 mr-3 text-pink-400" />
              Your Vibe
            </motion.h3>
            
            <motion.div 
              className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl p-8 border border-purple-500/30 relative z-10"
              whileHover={{ scale: 1.02 }}
            >
              <motion.p 
                className="text-xl text-gray-100 leading-relaxed font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {result.vibe}
              </motion.p>
            </motion.div>

            <div className="mt-8 flex items-center justify-between text-sm relative z-10">
              <div className="flex items-center space-x-6">
                <div className={`${moodTheme.color} font-bold text-lg`}>
                  Mood: <span className="capitalize">{result.moodCategory}</span>
                </div>
                <div className="text-pink-400 font-bold text-lg">
                  Songs: <span>{result.playlist.length}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Playlist Preview */}
          <motion.div
            className="glass-card-strong rounded-4xl p-8 border border-white/30 relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-teal-600/10 to-green-600/10" />
            
            <motion.h4 
              className="text-2xl font-bold text-white mb-6 flex items-center relative z-10"
              whileHover={{ scale: 1.02 }}
            >
              <Music className="w-6 h-6 mr-3 text-green-400" />
              Playlist Preview
            </motion.h4>
            
            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar relative z-10">
              <AnimatePresence>
                {result.playlist.slice(0, 5).map((song, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="glass-card rounded-2xl p-4 border border-white/20 group hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow"
                        whileHover={{ rotate: 5 }}
                      >
                        <Music className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.p 
                          className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate"
                          whileHover={{ scale: 1.02 }}
                        >
                          {song.title}
                        </motion.p>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-5 h-5 text-purple-400" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {result.playlist.length > 5 && (
                <motion.div 
                  className="text-center text-purple-300 text-sm font-medium py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  +{result.playlist.length - 5} more amazing songs waiting for you!
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewPlaylist}
              className="flex-1 flex items-center justify-center space-x-3 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl glow-effect hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Play className="w-6 h-6" />
              <span>Explore Full Playlist</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartOver}
              className="px-8 py-5 glass-card-strong text-white font-bold rounded-2xl border border-white/30 hover:border-purple-400/50 hover:bg-white/20 transition-all duration-300"
            >
              <RefreshCw className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnalysisView;