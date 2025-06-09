import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Music, Play, Loader2 } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6"
          >
            <Loader2 className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white">Loading your vibe history...</h3>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Your Vibe History
        </h2>
        <p className="text-xl text-gray-300">
          Revisit your past moods and rediscover amazing playlists
        </p>
      </motion.div>

      {analyses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
        >
          <div className="inline-block p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl mb-6">
            <Clock className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">No vibes yet!</h3>
          <p className="text-gray-300 mb-6">
            Upload your first photo or video to start building your vibe history.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectAnalysis(analysis)}
                className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 cursor-pointer transition-all hover:bg-white/15"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {getEmotionEmoji(analysis.dominant_emotion)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white capitalize group-hover:text-purple-300 transition-colors">
                        {analysis.dominant_emotion}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {(analysis.confidence * 100).toFixed(1)}% confidence
                      </p>
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-purple-400" />
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {analysis.vibe}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Music className="w-3 h-3" />
                      <span>{JSON.parse(analysis.playlist).length} songs</span>
                    </div>
                    <div className="capitalize">{analysis.mood_category}</div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(analysis.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm text-purple-400 font-medium">Click to view details</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RecentAnalyses;