import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import MoodColorQuiz from './components/MoodColorQuiz';
import MusicPreferenceQuiz from './components/MusicPreferenceQuiz';
import UploadZone from './components/UploadZone';
import AnalysisView from './components/AnalysisView';
import PlaylistView from './components/PlaylistView';
import RecentAnalyses from './components/RecentAnalyses';
import { AnalysisResult, MusicPreferences, MoodQuizData } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'mood-quiz' | 'music-quiz' | 'upload' | 'analysis' | 'playlist' | 'recent'>('mood-quiz');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<MusicPreferences | null>(null);
  const [moodQuizData, setMoodQuizData] = useState<MoodQuizData | null>(null);

  const handleMoodQuizComplete = (data: MoodQuizData) => {
    setMoodQuizData(data);
    setCurrentView('music-quiz');
  };

  const handleMoodQuizSkip = () => {
    setCurrentView('music-quiz');
  };

  const handlePreferencesComplete = (preferences: MusicPreferences) => {
    setUserPreferences(preferences);
    setCurrentView('upload');
  };

  const handleSkipPreferences = () => {
    setCurrentView('upload');
  };

  const handleAnalysisComplete = (result: AnalysisResult, fileUrl: string) => {
    // Add user preferences and mood quiz data to the result if available
    const enhancedResult = {
      ...result,
      preferences: userPreferences,
      moodQuizData: moodQuizData
    };
    setAnalysisResult(enhancedResult);
    setUploadedFile(fileUrl);
    setCurrentView('analysis');
  };

  const handleViewPlaylist = () => {
    setCurrentView('playlist');
  };

  const handleStartOver = () => {
    setCurrentView('mood-quiz');
    setAnalysisResult(null);
    setUploadedFile(null);
    setUserPreferences(null);
    setMoodQuizData(null);
  };

  const handleViewRecent = () => {
    setCurrentView('recent');
  };

  const handleQuickUpload = () => {
    setCurrentView('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-gradient-xy" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }}
      />
      
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onViewRecent={handleViewRecent}
        onStartOver={handleStartOver}
        onQuickUpload={handleQuickUpload}
        showQuickUpload={currentView === 'mood-quiz'}
      />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {currentView === 'mood-quiz' && (
              <MoodColorQuiz
                onComplete={handleMoodQuizComplete}
                onSkip={handleMoodQuizSkip}
              />
            )}

            {currentView === 'music-quiz' && (
              <MusicPreferenceQuiz
                onComplete={handlePreferencesComplete}
                onSkip={handleSkipPreferences}
              />
            )}

            {currentView === 'upload' && (
              <UploadZone 
                onAnalysisComplete={handleAnalysisComplete}
                userPreferences={userPreferences}
                moodQuizData={moodQuizData}
              />
            )}

            {currentView === 'analysis' && analysisResult && (
              <AnalysisView
                result={analysisResult}
                fileUrl={uploadedFile}
                onViewPlaylist={handleViewPlaylist}
                onStartOver={handleStartOver}
              />
            )}

            {currentView === 'playlist' && analysisResult && (
              <PlaylistView
                result={analysisResult}
                onBack={() => setCurrentView('analysis')}
                onStartOver={handleStartOver}
              />
            )}

            {currentView === 'recent' && (
              <RecentAnalyses
                onSelectAnalysis={(result, fileUrl) => {
                  setAnalysisResult(result);
                  setUploadedFile(fileUrl);
                  setCurrentView('analysis');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;