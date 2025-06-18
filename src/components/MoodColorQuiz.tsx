import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Heart, Music, Activity, ArrowRight, SkipForward, Sparkles, Check } from 'lucide-react';
import { MoodQuizData } from '../types';

interface MoodColorQuizProps {
  onComplete: (data: MoodQuizData) => void;
  onSkip: () => void;
}

const MoodColorQuiz: React.FC<MoodColorQuizProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizData, setQuizData] = useState<MoodQuizData>({
    selectedColor: '',
    moodWords: [],
    genres: [],
    activity: '',
    colorPsychology: null
  });

  const colorOptions = [
    { 
      id: 'red', 
      name: 'Passionate Red', 
      hex: '#ef4444', 
      mood: 'Energetic, passionate, powerful',
      psychology: 'stimulating',
      gradient: 'from-red-400 to-red-600',
      emoji: '🔥'
    },
    { 
      id: 'green', 
      name: 'Balanced Green', 
      hex: '#10b981', 
      mood: 'Balanced, peaceful, harmonious',
      psychology: 'calming',
      gradient: 'from-green-400 to-green-600',
      emoji: '🌿'
    },
    { 
      id: 'blue', 
      name: 'Calm Blue', 
      hex: '#3b82f6', 
      mood: 'Calm, introspective, serene',
      psychology: 'soothing',
      gradient: 'from-blue-400 to-blue-600',
      emoji: '🌊'
    },
    { 
      id: 'yellow', 
      name: 'Happy Yellow', 
      hex: '#f59e0b', 
      mood: 'Happy, excited, optimistic',
      psychology: 'uplifting',
      gradient: 'from-yellow-400 to-yellow-600',
      emoji: '☀️'
    },
    { 
      id: 'purple', 
      name: 'Creative Purple', 
      hex: '#8b5cf6', 
      mood: 'Creative, mysterious, spiritual',
      psychology: 'inspiring',
      gradient: 'from-purple-400 to-purple-600',
      emoji: '🔮'
    },
    { 
      id: 'pink', 
      name: 'Loving Pink', 
      hex: '#ec4899', 
      mood: 'Loving, playful, romantic',
      psychology: 'nurturing',
      gradient: 'from-pink-400 to-pink-600',
      emoji: '💖'
    },
    { 
      id: 'gray', 
      name: 'Reflective Gray', 
      hex: '#6b7280', 
      mood: 'Moody, reflective, contemplative',
      psychology: 'neutral',
      gradient: 'from-gray-400 to-gray-600',
      emoji: '🌫️'
    },
    { 
      id: 'orange', 
      name: 'Vibrant Orange', 
      hex: '#f97316', 
      mood: 'Enthusiastic, warm, social',
      psychology: 'energizing',
      gradient: 'from-orange-400 to-orange-600',
      emoji: '🧡'
    }
  ];

  const moodWords = [
    { id: 'chill', name: 'Chill', category: 'calm', emoji: '😌' },
    { id: 'grateful', name: 'Grateful', category: 'positive', emoji: '🙏' },
    { id: 'lonely', name: 'Lonely', category: 'melancholy', emoji: '😔' },
    { id: 'powerful', name: 'Powerful', category: 'energetic', emoji: '💪' },
    { id: 'heartbroken', name: 'Heartbroken', category: 'sad', emoji: '💔' },
    { id: 'confident', name: 'Confident', category: 'positive', emoji: '😎' },
    { id: 'dreamy', name: 'Dreamy', category: 'calm', emoji: '✨' },
    { id: 'anxious', name: 'Anxious', category: 'tense', emoji: '😰' },
    { id: 'excited', name: 'Excited', category: 'energetic', emoji: '🤩' },
    { id: 'nostalgic', name: 'Nostalgic', category: 'melancholy', emoji: '🌅' },
    { id: 'focused', name: 'Focused', category: 'calm', emoji: '🎯' },
    { id: 'rebellious', name: 'Rebellious', category: 'energetic', emoji: '🔥' }
  ];

  const genres = [
    { id: 'pop', name: 'Pop', emoji: '🎵', color: 'from-pink-400 to-rose-500' },
    { id: 'rnb', name: 'R&B', emoji: '💜', color: 'from-purple-400 to-indigo-500' },
    { id: 'indie', name: 'Indie', emoji: '🌻', color: 'from-yellow-400 to-orange-500' },
    { id: 'reggaeton', name: 'Reggaeton', emoji: '🔥', color: 'from-orange-400 to-red-500' },
    { id: 'lofi', name: 'Lo-Fi', emoji: '🌙', color: 'from-blue-400 to-cyan-500' },
    { id: 'electronic', name: 'Electronic', emoji: '⚡', color: 'from-cyan-400 to-teal-500' },
    { id: 'jazz', name: 'Jazz', emoji: '🎺', color: 'from-amber-400 to-yellow-500' },
    { id: 'rock', name: 'Rock', emoji: '🎸', color: 'from-gray-400 to-slate-600' },
    { id: 'hip-hop', name: 'Hip-Hop', emoji: '🎤', color: 'from-red-400 to-pink-500' },
    { id: 'classical', name: 'Classical', emoji: '🎼', color: 'from-emerald-400 to-green-500' }
  ];

  const activities = [
    { id: 'working', name: 'Working', emoji: '💻', description: 'Focus and productivity' },
    { id: 'partying', name: 'Partying', emoji: '🎉', description: 'Dancing and celebration' },
    { id: 'relaxing', name: 'Relaxing', emoji: '🛋️', description: 'Unwinding and chilling' },
    { id: 'driving', name: 'Driving', emoji: '🚗', description: 'Road trip vibes' },
    { id: 'studying', name: 'Studying', emoji: '📚', description: 'Deep concentration' },
    { id: 'gym', name: 'Working Out', emoji: '💪', description: 'High energy motivation' },
    { id: 'cooking', name: 'Cooking', emoji: '👨‍🍳', description: 'Creative and fun' },
    { id: 'walking', name: 'Walking', emoji: '🚶', description: 'Peaceful movement' }
  ];

  const steps = [
    {
      title: "What color matches your current vibe?",
      subtitle: "Colors reveal deep emotional states",
      component: 'color'
    },
    {
      title: "Pick words that reflect how you feel",
      subtitle: "Choose 2-3 that resonate with you right now",
      component: 'mood'
    },
    {
      title: "What genres speak to your soul?",
      subtitle: "Select your musical preferences",
      component: 'genres'
    },
    {
      title: "What's your current activity?",
      subtitle: "Context helps us match the perfect vibe",
      component: 'activity'
    }
  ];

  const handleColorSelect = (colorId: string) => {
    const selectedColor = colorOptions.find(c => c.id === colorId);
    setQuizData(prev => ({
      ...prev,
      selectedColor: colorId,
      colorPsychology: selectedColor ? {
        mood: selectedColor.mood,
        psychology: selectedColor.psychology,
        hex: selectedColor.hex,
        name: selectedColor.name
      } : null
    }));
  };

  const handleMoodWordToggle = (wordId: string) => {
    setQuizData(prev => ({
      ...prev,
      moodWords: prev.moodWords.includes(wordId)
        ? prev.moodWords.filter(w => w !== wordId)
        : prev.moodWords.length < 3 
          ? [...prev.moodWords, wordId]
          : prev.moodWords
    }));
  };

  const handleGenreToggle = (genreId: string) => {
    setQuizData(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(g => g !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const handleActivitySelect = (activityId: string) => {
    setQuizData(prev => ({ ...prev, activity: activityId }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(quizData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return quizData.selectedColor !== '';
      case 1: return quizData.moodWords.length >= 1;
      case 2: return quizData.genres.length >= 1;
      case 3: return quizData.activity !== '';
      default: return true;
    }
  };

  const selectedColorData = colorOptions.find(c => c.id === quizData.selectedColor);

  const renderColorSelection = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {colorOptions.map((color) => (
        <motion.button
          key={color.id}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleColorSelect(color.id)}
          className={`relative p-6 rounded-3xl border-2 transition-all duration-300 group ${
            quizData.selectedColor === color.id
              ? 'border-white shadow-2xl glow-effect scale-105'
              : 'border-white/30 hover:border-white/60'
          }`}
          style={{
            background: `linear-gradient(135deg, ${color.hex}20, ${color.hex}40)`
          }}
        >
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow"
            style={{ backgroundColor: color.hex }}
          />
          <div className="text-center">
            <div className="text-2xl mb-2">{color.emoji}</div>
            <div className="font-bold text-white text-lg mb-1">{color.name}</div>
            <div className="text-sm text-purple-200 leading-relaxed">{color.mood}</div>
          </div>
          {quizData.selectedColor === color.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );

  const renderMoodSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-purple-200 text-lg">
          Select {3 - quizData.moodWords.length} more {quizData.moodWords.length === 2 ? 'word' : 'words'}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {moodWords.map((word) => (
          <motion.button
            key={word.id}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoodWordToggle(word.id)}
            disabled={!quizData.moodWords.includes(word.id) && quizData.moodWords.length >= 3}
            className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
              quizData.moodWords.includes(word.id)
                ? 'border-purple-400 bg-purple-500/20 shadow-lg glow-effect'
                : quizData.moodWords.length >= 3
                  ? 'border-white/20 bg-white/5 opacity-50 cursor-not-allowed'
                  : 'border-white/30 glass-card hover:border-purple-400/50'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{word.emoji}</div>
              <div className="font-semibold text-white">{word.name}</div>
            </div>
            {quizData.moodWords.includes(word.id) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderGenreSelection = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {genres.map((genre) => (
        <motion.button
          key={genre.id}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleGenreToggle(genre.id)}
          className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${
            quizData.genres.includes(genre.id)
              ? 'border-purple-400 bg-purple-500/20 shadow-lg glow-effect'
              : 'border-white/30 glass-card hover:border-purple-400/50'
          }`}
        >
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${genre.color} opacity-20`} />
          <div className="relative z-10 text-center">
            <div className="text-4xl mb-3">{genre.emoji}</div>
            <div className="font-bold text-white text-lg">{genre.name}</div>
            {quizData.genres.includes(genre.id) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );

  const renderActivitySelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {activities.map((activity) => (
        <motion.button
          key={activity.id}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleActivitySelect(activity.id)}
          className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${
            quizData.activity === activity.id
              ? 'border-purple-400 bg-purple-500/20 shadow-lg glow-effect'
              : 'border-white/30 glass-card hover:border-purple-400/50'
          }`}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">{activity.emoji}</div>
            <div className="font-bold text-white text-xl mb-2">{activity.name}</div>
            <div className="text-purple-200 text-sm">{activity.description}</div>
            {quizData.activity === activity.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].component) {
      case 'color': return renderColorSelection();
      case 'mood': return renderMoodSelection();
      case 'genres': return renderGenreSelection();
      case 'activity': return renderActivitySelection();
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong rounded-4xl border border-white/30 overflow-hidden relative"
      >
        {/* Dynamic background based on selected color */}
        <div 
          className={`absolute inset-0 transition-all duration-1000 ${
            selectedColorData 
              ? `bg-gradient-to-br ${selectedColorData.gradient} opacity-10`
              : 'bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10'
          } animate-gradient-xy`} 
        />
        
        {/* Header */}
        <div className="relative z-10 p-8 border-b border-white/20">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl glow-effect">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold gradient-text">Mood & Music Personality</h2>
                <p className="text-purple-200">Help us understand your emotional vibe</p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSkip}
              className="flex items-center space-x-2 px-6 py-3 glass-card text-purple-200 hover:text-white rounded-2xl border border-white/30 hover:border-purple-400/50 transition-all duration-300"
            >
              <SkipForward className="w-5 h-5" />
              <span>Skip Quiz</span>
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all duration-500 ${
                selectedColorData 
                  ? `bg-gradient-to-r ${selectedColorData.gradient}`
                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-sm text-purple-300 mt-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-12"
            >
              <motion.h3 
                className="text-4xl font-bold text-white mb-4"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                {steps[currentStep].title}
              </motion.h3>
              <motion.p 
                className="text-xl text-purple-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {steps[currentStep].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="relative z-10 p-8 border-t border-white/20">
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : 'glass-card text-purple-200 hover:text-white hover:bg-white/20 border border-white/30 hover:border-purple-400/50'
              }`}
            >
              <span>Back</span>
            </motion.button>

            <div className="flex items-center space-x-4">
              {/* Step indicators */}
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index <= currentStep
                        ? selectedColorData
                          ? `bg-gradient-to-r ${selectedColorData.gradient}`
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-white/20'
                    }`}
                    animate={{ scale: index === currentStep ? 1.2 : 1 }}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  canProceed()
                    ? selectedColorData
                      ? `bg-gradient-to-r ${selectedColorData.gradient} text-white shadow-2xl glow-effect hover:shadow-lg`
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl glow-effect hover:shadow-purple-500/50'
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{currentStep === steps.length - 1 ? 'Complete Quiz' : 'Next'}</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${15 + i * 10}%`,
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MoodColorQuiz;