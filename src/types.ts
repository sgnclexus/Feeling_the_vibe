export interface AnalysisResult {
  analysisId: number;
  dominantEmotion: string;
  confidence: number;
  vibe: string;
  moodCategory: string;
  playlist: PlaylistItem[];
  colorAnalysis?: ColorAnalysis;
  preferences?: MusicPreferences;
  moodQuizData?: MoodQuizData;
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
  color_analysis?: string;
  preferences?: string;
  mood_quiz_data?: string;
  file_url?: string; // Added file_url property to handle both local and S3 URLs
}

export interface MusicPreferences {
  genres: string[];
  artists: string[];
  platforms: string[];
  energyLevel: string;
  moodInfluence: string;
}

export interface MoodQuizData {
  selectedColor: string;
  moodWords: string[];
  genres: string[];
  activity: string;
  colorPsychology: {
    mood: string;
    psychology: string;
    hex: string;
    name: string;
  } | null;
}

export interface ColorData {
  hex: string;
  name: string;
  percentage: number;
  hue: number;
  saturation: number;
  lightness: number;
}

export interface ColorAnalysis {
  dominantColors: ColorData[];
  mood: string;
  temperature: 'warm' | 'cool' | 'neutral';
  saturation: number;
  harmonyScore: number;
  emotionalImpact: string;
}