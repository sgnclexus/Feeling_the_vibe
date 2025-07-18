import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Heart, Sparkles, ArrowRight, SkipBack as Skip, Check, X, Zap, Activity } from 'lucide-react';
import { MusicPreferences } from '../types';

interface MusicPreferenceQuizProps {
  onComplete: (preferences: MusicPreferences) => void;
  onSkip: () => void;
}

const MusicPreferenceQuiz: React.FC<MusicPreferenceQuizProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<MusicPreferences>({
    genres: [],
    artists: [],
    platforms: [],
    energyLevel: 'medium',
    moodInfluence: 'balanced'
  });

  const platforms = [
    { id: 'spotify', name: 'Spotify', color: 'from-green-400 to-green-600' },
    { id: 'apple', name: 'Apple Music', color: 'from-gray-400 to-gray-600' },
    { id: 'youtube', name: 'YouTube Music', color: 'from-red-400 to-red-600' },
    { id: 'soundcloud', name: 'SoundCloud', color: 'from-orange-400 to-orange-600' }
  ];

  const energyLevels = [
    { id: 'low', name: 'Chill & Relaxed', emoji: '😌', description: 'Calm, peaceful vibes for unwinding' },
    { id: 'medium', name: 'Balanced Energy', emoji: '😊', description: 'Perfect mix of calm and upbeat moments' },
    { id: 'high', name: 'High Energy', emoji: '🔥', description: 'Pumped up, energetic beats that motivate' }
  ];

  const moodInfluences = [
    { id: 'strong', name: 'Mood-Driven', description: 'Let my current emotions heavily guide the playlist selection' },
    { id: 'balanced', name: 'Balanced Mix', description: 'Blend my mood with my established music preferences' },
    { id: 'light', name: 'Preference-First', description: 'Focus on my music taste with subtle mood influences' }
  ];

  const steps = [
    {
      title: "Where do you discover your music?",
      subtitle: "Your preferred streaming platforms",
      component: 'platforms'
    },
    {
      title: "What's your typical energy preference?",
      subtitle: "How do you like to feel when listening?",
      component: 'energy'
    },
    {
      title: "How should your mood influence the playlist?",
      subtitle: "Balance between emotion and musical preferences",
      component: 'influence'
    }
  ];

  const handlePlatformToggle = (platformId: string) => {
    setPreferences(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return preferences.platforms.length > 0;
      case 1: return preferences.energyLevel !== '';
      case 2: return preferences.moodInfluence !== '';
      default: return true;
    }
  };

  const renderPlatformSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {platforms.map((platform) => (
        <motion.button
          key={platform.id}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePlatformToggle(platform.id)}
          className={`relative p-8 rounded-3xl border-2 transition-all duration-300 ${
            preferences.platforms.includes(platform.id)
              ? 'border-purple-400 bg-purple-500/20 shadow-lg glow-effect'
              : 'border-white/30 glass-card hover:border-purple-400/50'
          }`}
        >
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${platform.color} opacity-20`} />
          <div className="relative z-10 text-center">
            <div className="font-bold text-white text-xl mb-2">{platform.name}</div>
            {preferences.platforms.includes(platform.id) && (
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

  const renderEnergySelection = () => (
    <div className="space-y-4 max-w-2xl mx-auto">
      {energyLevels.map((level) => (
        <motion.button
          key={level.id}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPreferences(prev => ({ ...prev, energyLevel: level.id }))}
          className={`w-full p-6 rounded-3xl border-2 transition-all duration-300 ${
            preferences.energyLevel === level.id
              ? 'border-purple-400 bg-purple-500/20 shadow-lg glow-effect'
              : 'border-white/30 glass-card hover:border-purple-400/50'
          }`}
        >
          <div className="flex items-center space-x-6">
            <div className="text-4xl">{level.emoji}</div>
            <div className="text-left">
              <div className="font-bold text-white text-xl">{level.name}</div>
              <div className="text-purple-200">{level.description}</div>
            </div>
            {preferences.energyLevel === level.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );

  const renderInfluenceSelection = () => (
    <div className="space-y-4 max-w-2xl mx-auto">
      {moodInfluences.map((influence) => (
        <motion.button
          key={influence.id}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPreferences(prev => ({ ...prev, moodInfluence: influence.id }))}
          className={`w-full p-6 rounded-3xl border-2 transition-all duration-300 relative ${
            preferences.moodInfluence === influence.id
              ? 'border-purple-400 bg-purple-500/20 shadow-lg glow-effect'
              : 'border-white/30 glass-card hover:border-purple-400/50'
          }`}
        >
          <div className="text-left">
            <div className="font-bold text-white text-xl mb-2">{influence.name}</div>
            <div className="text-purple-200">{influence.description}</div>
            {preferences.moodInfluence === influence.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
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
      case 'platforms': return renderPlatformSelection();
      case 'energy': return renderEnergySelection();
      case 'influence': return renderInfluenceSelection();
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-teal-600/10 to-green-600/10 animate-gradient-xy" />
        
        {/* Header */}
        <div className="relative z-10 p-8 border-b border-white/20">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-3 bg-gradient-to-br from-green-500 via-teal-500 to-green-600 rounded-2xl glow-effect">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold gradient-text">Music Preferences</h2>
                <p className="text-purple-200">Fine-tune your playlist experience</p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSkip}
              className="flex items-center space-x-2 px-6 py-3 glass-card text-purple-200 hover:text-white rounded-2xl border border-white/30 hover:border-purple-400/50 transition-all duration-300"
            >
              <Skip className="w-5 h-5" />
              <span>Skip for now</span>
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 via-teal-500 to-green-600 rounded-full"
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
                        ? 'bg-gradient-to-r from-green-500 to-teal-500'
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
                    ? 'bg-gradient-to-r from-green-600 via-teal-600 to-green-600 text-white shadow-2xl glow-effect hover:shadow-green-500/50'
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{currentStep === steps.length - 1 ? 'Complete' : 'Next'}</span>
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
              <Sparkles className="w-4 h-4 text-green-300" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MusicPreferenceQuiz;