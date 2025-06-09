export interface AnalysisResult {
  analysisId: number;
  dominantEmotion: string;
  confidence: number;
  vibe: string;
  moodCategory: string;
  playlist: PlaylistItem[];
}

export interface PlaylistItem {
  title: string;
  artist: string;
  reason: string;
}

export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface EmotionData {
  name: string;
  score: number;
}

export interface StoredAnalysis {
  id: number;
  filename: string;
  dominant_emotion: string;
  confidence: number;
  vibe: string;
  mood_category: string;
  playlist: string;
  created_at: string;
}