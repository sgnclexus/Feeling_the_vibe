import React from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, TrendingUp, Music, Heart } from 'lucide-react';
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
  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'from-yellow-400 to-orange-500',
      sad: 'from-blue-400 to-indigo-600',
      angry: 'from-red-400 to-red-600',
      surprised: 'from-purple-400 to-pink-500',
      calm: 'from-green-400 to-teal-500',
      neutral: 'from-gray-400 to-gray-600',
      fearful: 'from-purple-600 to-indigo-800',
      disgusted: 'from-green-600 to-yellow-600'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprised: '😲',
      calm: '😌',
      neutral: '😐',
      fearful: '😨',
      disgusted: '🤢'
    };
    return emojis[emotion as keyof typeof emojis] || '😐';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Left Column - Image/Video */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
              Your Media
            </h3>
            
            {fileUrl && (
              <div className="rounded-xl overflow-hidden bg-black/20">
                {fileUrl.includes('.mp4') || fileUrl.includes('.webm') || fileUrl.includes('.mov') ? (
                  <video 
                    src={fileUrl} 
                    controls 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : (
                  <img 
                    src={fileUrl} 
                    alt="Uploaded content" 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                )}
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Emotion Analysis</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`text-4xl`}>
                  {getEmotionEmoji(result.dominantEmotion)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white capitalize">
                    {result.dominantEmotion}
                  </p>
                  <p className="text-sm text-gray-400">
                    {(result.confidence * 100).toFixed(1)}% confidence
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <motion.div
                className={`h-3 rounded-full bg-gradient-to-r ${getEmotionColor(result.dominantEmotion)}`}
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-pink-400" />
              Your Vibe
            </h3>
            
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
              <p className="text-lg text-gray-200 leading-relaxed">
                {result.vibe}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Mood Category: <span className="text-purple-400 font-semibold capitalize">{result.moodCategory}</span>
              </div>
              <div className="text-sm text-gray-400">
                Songs: <span className="text-pink-400 font-semibold">{result.playlist.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Music className="w-5 h-5 mr-2 text-green-400" />
              Playlist Preview
            </h4>
            
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {result.playlist.slice(0, 4).map((song, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{song.title}</p>
                      <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {result.playlist.length > 4 && (
                <div className="text-center text-gray-400 text-sm">
                  +{result.playlist.length - 4} more songs
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewPlaylist}
              className="flex-1 flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <Play className="w-5 h-5" />
              <span>View Full Playlist</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartOver}
              className="px-6 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnalysisView;