import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import AnalysisView from './components/AnalysisView';
import PlaylistView from './components/PlaylistView';
import RecentAnalyses from './components/RecentAnalyses';
import { AnalysisResult } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'analysis' | 'playlist' | 'recent'>('upload');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult, fileUrl: string) => {
    setAnalysisResult(result);
    setUploadedFile(fileUrl);
    setCurrentView('analysis');
  };

  const handleViewPlaylist = () => {
    setCurrentView('playlist');
  };

  const handleStartOver = () => {
    setCurrentView('upload');
    setAnalysisResult(null);
    setUploadedFile(null);
  };

  const handleViewRecent = () => {
    setCurrentView('recent');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onViewRecent={handleViewRecent}
        onStartOver={handleStartOver}
      />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {currentView === 'upload' && (
            <UploadZone onAnalysisComplete={handleAnalysisComplete} />
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
      </main>
    </div>
  );
}

export default App;