import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Video, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmotionDetector } from '../services/emotionDetector';
import { AnalysisResult } from '../types';

interface UploadZoneProps {
  onAnalysisComplete: (result: AnalysisResult, fileUrl: string) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onAnalysisComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const emotionDetector = new EmotionDetector();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

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

      toast.success('File uploaded successfully! Analyzing emotions...');

      // Analyze emotions
      const emotions = await emotionDetector.detectEmotions(file);
      
      // Send emotions to backend for analysis
      const analysisResponse = await fetch('http://localhost:3001/api/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotions,
          filename: uploadResult.file.filename
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult = await analysisResponse.json();
      setIsAnalyzing(false);
      
      toast.success('Analysis complete! Check out your personalized playlist.');
      onAnalysisComplete(analysisResult, `http://localhost:3001${uploadResult.file.path}`);

    } catch (error) {
      console.error('Error:', error);
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadProgress(0);
      toast.error('Something went wrong. Please try again.');
    }
  }, [emotionDetector, onAnalysisComplete]);

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
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6"
            >
              <Loader2 className="w-8 h-8 text-white" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              {isUploading ? 'Uploading your media...' : 'Analyzing your emotions...'}
            </h3>
            
            {isUploading && (
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
            
            <p className="text-gray-300">
              {isUploading 
                ? 'Please wait while we upload your file...' 
                : 'Our AI is reading your emotions and curating the perfect playlist for your vibe...'
              }
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
          What's Your Vibe Today?
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Upload a photo or short video and let our AI analyze your emotions to create 
          the perfect playlist that matches your current mood and energy.
        </p>
      </motion.div>

      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400'
            : 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-purple-400'
        } backdrop-blur-lg rounded-3xl border-2 border-dashed p-16`}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <motion.div
            animate={{ 
              y: isDragActive ? -10 : 0,
              rotate: isDragActive ? 5 : 0 
            }}
            className="inline-block p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-8"
          >
            {isDragActive ? (
              <Upload className="w-12 h-12 text-white" />
            ) : (
              <Camera className="w-12 h-12 text-white" />
            )}
          </motion.div>

          <h3 className="text-3xl font-bold text-white mb-4">
            {isDragActive ? 'Drop it like it\'s hot!' : 'Ready to feel the vibe?'}
          </h3>
          
          <p className="text-lg text-gray-300 mb-8">
            {isDragActive 
              ? 'Release to upload your media'
              : 'Drag & drop your photo or video here, or click to browse'
            }
          </p>

          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2 text-gray-400">
              <Camera className="w-5 h-5" />
              <span>Photos</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Video className="w-5 h-5" />
              <span>Videos</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Choose Media File
          </motion.button>

          <p className="text-sm text-gray-500 mt-6">
            Supports JPEG, PNG, GIF, MP4, WebM, MOV • Max size: 10MB
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { icon: Camera, title: 'Capture Your Mood', desc: 'Upload any photo or selfie' },
          { icon: Upload, title: 'AI Analysis', desc: 'Our AI reads your facial expressions' },
          { icon: Video, title: 'Perfect Playlist', desc: 'Get music that matches your vibe' }
        ].map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
          >
            <div className="inline-block p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg mb-4">
              <step.icon className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">{step.title}</h4>
            <p className="text-sm text-gray-400">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UploadZone;