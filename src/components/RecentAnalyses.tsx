import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Music, Play, Loader2, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { AnalysisResult, StoredAnalysis } from '../types';
import toast from 'react-hot-toast';

interface RecentAnalysesProps {
  onSelectAnalysis: (result: AnalysisResult, fileUrl: string) => void;
}

const RecentAnalyses: React.FC<RecentAnalysesProps> = ({ onSelectAnalysis }) => {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentAnalyses();
  }, []);

  const fetchRecentAnalyses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/recent-analyses');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);
      } else {
        toast.error('Failed to load recent analyses');
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('Failed to load recent analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnalysis = (analysis: StoredAnalysis) => {
    const result: AnalysisResult = {
      analysisId: analysis.id,
      dominantEmotion: analysis.dominant_emotion,
      confidence: analysis.confidence,
      vibe: analysis.vibe,
      moodCategory: analysis.mood_category,
      playlist: JSON.parse(analysis.playlist)
    };

    const fileUrl = `http://localhost:3001/uploads/${analysis.filename}`;
    onSelectAnalysis(result, fileUrl);
  };

  const getMoodTheme = (emotion: string) => {
    const themes = {
      happy: { emoji: '😊', gradient: 'from-yellow-400 to-orange-500', color: 'text-yellow-300' },
      sad: { emoji: '😢', gradient: 'from-blue-400 to-indigo-600', color: 'text-blue-300' },
      angry: { emoji: '😠', gradient: 'from-red-400 to-red-600', color: 'text-red-300' },
      surprised: { emoji: '😲', gradient: 'from-purple-400 to-pink-500', color: 'text-purple-300' },
      calm: { emoji: '😌', gradient: 'from-green-400 to-teal-500', color: 'text-green-300' },
      neutral: { emoji: '😐', gradient: 'from-gray-400 to-gray-600', color: 'text-gray-300' },
      fearful: { emoji: '😨', gradient: 'from-purple-600 to-indigo-800', color: 'text-purple-300' },
      disgusted: { emoji: '🤢', gradient: 'from-green-600 to-yellow-600', color: 'text-green-300' }
    };
    return themes[emotion as keyof typeof themes] || themes.neutral;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-strong rounded-4xl p-16 border border-white/30 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10 animate-gradient-xy" />
          
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="inline-block p-6 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl mb-8 glow-effect relative z-10"
          >
            <Loader2 className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h3 
            className="text-4xl font-bold gradient-text mb-4 relative z-10"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading your vibe history...
          </motion.h3>
          
          <motion.p 
            className="text-xl text-purple-200 relative z-10"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Gathering all your amazing musical moments
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 text-center"
      >
        <motion.h2 
          className="text-6xl font-bold gradient-text mb-6"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          Your Vibe History
        </motion.h2>
        <motion.p 
          className="text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Revisit your past moods and rediscover amazing playlists that captured your essence
        </motion.p>
      </motion.div>

      {analyses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-strong rounded-4xl p-16 border border-white/30 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10" />
          
          <motion.div 
            className="inline-block p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl mb-8 relative z-10"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Clock className="w-16 h-16 text-purple-400" />
          </motion.div>
          
          <motion.h3 
            className="text-4xl font-bold gradient-text mb-6 relative z-10"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            No vibes captured yet!
          </motion.h3>
          
          <motion.p 
            className="text-xl text-purple-200 mb-8 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Upload your first photo or video to start building your personal vibe collection.
          </motion.p>
          
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative z-10"
          >
            <Sparkles className="w-8 h-8 text-yellow-400 mx-auto" />
          </motion.div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence>
            {analyses.map((analysis, index) => {
              const moodTheme = getMoodTheme(analysis.dominant_emotion);
              
              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => handleSelectAnalysis(analysis)}
                  className="group glass-card-strong rounded-3xl p-8 border border-white/30 hover:border-purple-400/60 cursor-pointer transition-all duration-300 hover:shadow-2xl relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-600/5 to-purple-600/5 group-hover:from-purple-600/10 group-hover:via-pink-600/10 group-hover:to-purple-600/10 transition-all duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="text-4xl"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {moodTheme.emoji}
                        </motion.div>
                        <div>
                          <motion.h3 
                            className="font-bold text-xl text-white capitalize group-hover:text-purple-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            {analysis.dominant_emotion}
                          </motion.h3>
                          <p className={`text-sm font-semibold ${moodTheme.color}`}>
                            {(analysis.confidence * 100).toFixed(1)}% confidence
                          </p>
                        </div>
                      </div>
                      
                      <motion.div 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <Play className="w-6 h-6 text-purple-400" />
                      </motion.div>
                    </div>

                    <motion.p 
                      className="text-purple-200 text-sm mb-6 line-clamp-3 leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {analysis.vibe}
                    </motion.p>

                    <div className="flex items-center justify-between text-xs text-purple-300 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Music className="w-4 h-4" />
                          <span className="font-semibold">{JSON.parse(analysis.playlist).length} songs</span>
                        </div>
                        <div className={`capitalize font-semibold ${moodTheme.color}`}>
                          {analysis.mood_category}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{formatDate(analysis.created_at)}</span>
                      </div>
                    </div>

                    <motion.div 
                      className="pt-4 border-t border-white/20"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-400 font-semibold">Click to explore playlist</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Floating sparkles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        animate={{
                          x: [0, 30, 0],
                          y: [0, -20, 0],
                          opacity: [0, 0.6, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                        style={{
                          left: `${20 + i * 25}%`,
                          top: `${15 + i * 20}%`,
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-purple-300" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RecentAnalyses;