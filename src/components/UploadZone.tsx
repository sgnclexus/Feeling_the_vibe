import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Video, Loader2, Sparkles, Music, Heart, Zap, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmotionDetector } from '../services/emotionDetector';
import { ColorAnalyzer } from '../services/colorAnalyzer';
import { AnalysisResult, MusicPreferences } from '../types';

interface UploadZoneProps {
  onAnalysisComplete: (result: AnalysisResult, fileUrl: string) => void;
  userPreferences?: MusicPreferences | null;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onAnalysisComplete, userPreferences }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');

  const emotionDetector = new EmotionDetector();
  const colorAnalyzer = new ColorAnalyzer();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress with smooth animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 8, 90));
      }, 120);

      // Upload file
      const formData = new FormData();
      formData.append('media', file);

      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      setIsUploading(false);
      setIsAnalyzing(true);

      toast.success('✨ File uploaded! Analyzing your vibe...', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
        },
      });

      // Step 1: Emotion Analysis
      setAnalysisStep('Detecting emotions from your expression...');
      const emotions = await emotionDetector.detectEmotions(file);
      
      // Step 2: Color Analysis
      setAnalysisStep('Analyzing visual colors and mood...');
      const colorAnalysis = await colorAnalyzer.analyzeImage(file);
      
      // Step 3: Generate enhanced playlist
      setAnalysisStep('Creating your personalized playlist...');
      
      // Send comprehensive analysis to backend
      const analysisResponse = await fetch('http://localhost:3001/api/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotions,
          colorAnalysis,
          preferences: userPreferences,
          filename: uploadResult.file.filename
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult = await analysisResponse.json();
      
      // Add color analysis to result
      const enhancedResult = {
        ...analysisResult,
        colorAnalysis,
        preferences: userPreferences
      };
      
      setIsAnalyzing(false);
      
      toast.success('🎵 Your personalized vibe playlist is ready!', {
        style: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          border: 'none',
        },
      });
      
      onAnalysisComplete(enhancedResult, `http://localhost:3001${uploadResult.file.path}`);

    } catch (error) {
      console.error('Error:', error);
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadProgress(0);
      setAnalysisStep('');
      toast.error('Oops! Something went wrong. Please try again.', {
        style: {
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          border: 'none',
        },
      });
    }
  }, [emotionDetector, colorAnalyzer, onAnalysisComplete, userPreferences]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (isUploading || isAnalyzing) {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative glass-card-strong rounded-4xl p-16 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 animate-gradient-xy" />
          
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="inline-block p-6 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl mb-8 glow-effect"
            >
              <Loader2 className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h3 
              className="text-4xl font-bold gradient-text mb-6"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isUploading ? '🚀 Uploading your vibe...' : '🧠 Analyzing your essence...'}
            </motion.h3>
            
            {isUploading && (
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <motion.p 
                  className="text-purple-200 mt-3 font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {uploadProgress}% complete
                </motion.p>
              </div>
            )}

            {isAnalyzing && analysisStep && (
              <motion.p 
                className="text-xl text-purple-100 max-w-lg mx-auto leading-relaxed mb-6"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {analysisStep}
              </motion.p>
            )}
            
            <motion.p 
              className="text-lg text-purple-200 max-w-lg mx-auto leading-relaxed"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {isUploading 
                ? 'Preparing your media for deep emotional and visual analysis...' 
                : userPreferences 
                  ? 'Our AI is combining your preferences with emotional cues and color psychology to craft the perfect soundtrack for your soul...'
                  : 'Our AI is diving deep into your emotions and visual aesthetics to curate the perfect soundtrack for your soul...'
              }
            </motion.p>

            {/* Enhanced floating icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[Music, Heart, Sparkles, Zap, Palette].map((Icon, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    rotate: [0, 180, 360],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    left: `${10 + i * 18}%`,
                    top: `${20 + i * 12}%`,
                  }}
                >
                  <Icon className="w-6 h-6 text-purple-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <motion.h2 
          className="text-6xl md:text-7xl font-bold gradient-text mb-8 text-shadow-lg"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          {userPreferences ? 'Now Share Your Vibe!' : 'What\'s Your Vibe Today?'}
        </motion.h2>
        <motion.p 
          className="text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {userPreferences 
            ? 'Upload a photo or video and let our AI combine your music preferences with emotional analysis and color psychology to create your perfect personalized playlist.'
            : 'Upload a photo or video and let our AI analyze your emotions and visual aesthetics to create the perfect playlist that matches your current mood and energy.'
          }
        </motion.p>

        {userPreferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 glass-card rounded-3xl border border-purple-400/30 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-bold text-white">Your Preferences Loaded</span>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {userPreferences.genres.slice(0, 4).map((genre, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm font-medium">
                  {genre}
                </span>
              ))}
              {userPreferences.genres.length > 4 && (
                <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm font-medium">
                  +{userPreferences.genres.length - 4} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative cursor-pointer transition-all duration-500 group ${
          isDragActive
            ? 'glass-card-strong border-purple-400 shadow-2xl glow-effect'
            : 'glass-card border-white/30 hover:border-purple-400 hover:shadow-2xl'
        } rounded-4xl border-2 border-dashed p-20 overflow-hidden`}
      >
        <input {...getInputProps()} />
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isDragActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
        } bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 animate-gradient-xy`} />
        
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ 
              y: isDragActive ? -15 : 0,
              rotate: isDragActive ? 10 : 0,
              scale: isDragActive ? 1.1 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-block p-8 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl mb-10 glow-effect group-hover:shadow-2xl transition-shadow duration-500"
          >
            <AnimatePresence mode="wait">
              {isDragActive ? (
                <motion.div
                  key="upload"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <Upload className="w-16 h-16 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="camera"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  className="relative"
                >
                  <Camera className="w-16 h-16 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.h3 
            className="text-4xl font-bold text-white mb-6"
            animate={{ 
              color: isDragActive ? '#f0abfc' : '#ffffff'
            }}
          >
            {isDragActive ? 'Drop it like it\'s hot! 🔥' : 'Ready to feel the vibe? ✨'}
          </motion.h3>
          
          <motion.p 
            className="text-xl text-purple-100 mb-10 font-medium"
            animate={{
              scale: isDragActive ? 1.05 : 1,
              color: isDragActive ? '#e879f9' : '#e2e8f0'
            }}
          >
            {isDragActive 
              ? 'Release to upload your media and discover your personalized vibe'
              : 'Drag & drop your photo or video here, or click to browse'
            }
          </motion.p>

          <div className="flex justify-center space-x-12 mb-10">
            {[
              { icon: Camera, label: 'Photos', color: 'from-blue-400 to-purple-500' },
              { icon: Video, label: 'Videos', color: 'from-pink-400 to-red-500' },
              { icon: Palette, label: 'Color Analysis', color: 'from-green-400 to-teal-500' }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center space-x-3 text-purple-200 group-hover:text-white transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <div className={`p-2 bg-gradient-to-r ${item.color} rounded-xl`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl glow-effect hover:shadow-purple-500/50 transition-all duration-300 group-hover:from-purple-500 group-hover:to-pink-500"
          >
            Choose Your Vibe File
          </motion.button>

          <motion.p 
            className="text-sm text-purple-300 mt-8 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Supports JPEG, PNG, GIF, MP4, WebM, MOV • Max size: 10MB
          </motion.p>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-40"
              animate={{
                x: [0, 100, 0],
                y: [0, -80, 0],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                delay: i * 0.8,
              }}
              style={{
                left: `${5 + i * 10}%`,
                top: `${10 + i * 8}%`,
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8"
      >
        {[
          { 
            icon: Camera, 
            title: 'Capture Your Mood', 
            desc: 'Upload any photo or selfie to start',
            gradient: 'from-blue-500 to-purple-600'
          },
          { 
            icon: Palette, 
            title: 'Color Psychology', 
            desc: 'AI analyzes visual colors and aesthetics',
            gradient: 'from-green-500 to-teal-600'
          },
          { 
            icon: Zap, 
            title: 'Emotion Detection', 
            desc: 'Advanced facial expression analysis',
            gradient: 'from-purple-500 to-pink-600'
          },
          { 
            icon: Music, 
            title: 'Perfect Playlist', 
            desc: 'Personalized music that matches your vibe',
            gradient: 'from-pink-500 to-red-600'
          }
        ].map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="text-center p-8 glass-card rounded-3xl border border-white/20 group hover:border-purple-400/50 transition-all duration-300"
          >
            <motion.div 
              className={`inline-block p-4 bg-gradient-to-r ${step.gradient} rounded-2xl mb-6 group-hover:shadow-lg transition-shadow`}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <step.icon className="w-8 h-8 text-white" />
            </motion.div>
            <h4 className="font-bold text-xl text-white mb-3 group-hover:text-purple-300 transition-colors">{step.title}</h4>
            <p className="text-purple-200 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UploadZone;