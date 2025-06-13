import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, Sparkles, TrendingUp } from 'lucide-react';
import { ColorAnalysis } from '../types';

interface ColorAnalysisViewProps {
  colorAnalysis: ColorAnalysis;
  className?: string;
}

const ColorAnalysisView: React.FC<ColorAnalysisViewProps> = ({ colorAnalysis, className = '' }) => {
  const getColorMoodDescription = (mood: string) => {
    const descriptions = {
      energetic: "Vibrant and dynamic colors that boost energy and excitement",
      calm: "Soothing and peaceful tones that promote relaxation",
      warm: "Cozy and inviting colors that create comfort and intimacy",
      cool: "Fresh and crisp tones that inspire clarity and focus",
      dramatic: "Bold and intense colors that evoke strong emotions",
      neutral: "Balanced and harmonious tones that provide stability"
    };
    return descriptions[mood as keyof typeof descriptions] || "Unique color palette with distinctive character";
  };

  const getColorTheme = (mood: string) => {
    const themes = {
      energetic: {
        gradient: 'from-orange-400 via-red-500 to-pink-500',
        accent: 'text-orange-300',
        bg: 'bg-gradient-to-br from-orange-500/20 to-red-500/20'
      },
      calm: {
        gradient: 'from-blue-400 via-cyan-500 to-teal-500',
        accent: 'text-blue-300',
        bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
      },
      warm: {
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        accent: 'text-yellow-300',
        bg: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
      },
      cool: {
        gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
        accent: 'text-cyan-300',
        bg: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
      },
      dramatic: {
        gradient: 'from-purple-400 via-pink-500 to-red-500',
        accent: 'text-purple-300',
        bg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
      },
      neutral: {
        gradient: 'from-gray-400 via-slate-500 to-gray-600',
        accent: 'text-gray-300',
        bg: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20'
      }
    };
    return themes[mood as keyof typeof themes] || themes.neutral;
  };

  const theme = getColorTheme(colorAnalysis.mood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card-strong rounded-3xl p-8 border border-white/30 relative overflow-hidden ${className}`}
    >
      <div className={`absolute inset-0 ${theme.bg} opacity-30`} />
      
      <div className="relative z-10">
        <motion.h3 
          className="text-2xl font-bold text-white mb-6 flex items-center"
          whileHover={{ scale: 1.02 }}
        >
          <Palette className="w-6 h-6 mr-3 text-purple-400" />
          Visual Color Analysis
        </motion.h3>

        {/* Dominant Colors */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-cyan-400" />
            Dominant Colors
          </h4>
          <div className="flex flex-wrap gap-3">
            {colorAnalysis.dominantColors.map((color, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex items-center space-x-3 bg-white/10 rounded-2xl p-4 border border-white/20"
              >
                <div
                  className="w-8 h-8 rounded-xl shadow-lg border-2 border-white/30"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <div className="text-white font-semibold">{color.name}</div>
                  <div className="text-purple-200 text-sm">{(color.percentage * 100).toFixed(1)}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Color Mood */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Color Psychology
          </h4>
          <motion.div 
            className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold capitalize">{colorAnalysis.mood}</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              </div>
              <p className="text-white/90 leading-relaxed">
                {getColorMoodDescription(colorAnalysis.mood)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Color Harmony Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Color Harmony</span>
            <span className={`font-bold ${theme.accent}`}>
              {(colorAnalysis.harmonyScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${colorAnalysis.harmonyScore * 100}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="text-purple-200 text-sm mb-1">Temperature</div>
            <div className="text-white font-bold capitalize">{colorAnalysis.temperature}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="text-purple-200 text-sm mb-1">Saturation</div>
            <div className="text-white font-bold">{(colorAnalysis.saturation * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ColorAnalysisView;