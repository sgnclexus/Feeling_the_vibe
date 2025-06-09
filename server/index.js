import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import Database from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Initialize OpenAI (you'll need to set your API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Routes
app.post('/api/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`
    };

    res.json({ 
      success: true, 
      file: fileInfo,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/analyze-mood', async (req, res) => {
  try {
    const { emotions, filename } = req.body;
    
    if (!emotions || !Array.isArray(emotions)) {
      return res.status(400).json({ error: 'Invalid emotions data' });
    }

    // Find dominant emotion
    let dominantEmotion = 'neutral';
    let maxScore = 0;
    
    emotions.forEach(emotion => {
      if (emotion.score > maxScore) {
        maxScore = emotion.score;
        dominantEmotion = emotion.name;
      }
    });

    // Generate mood description and playlist using OpenAI
    const moodPrompt = `Based on the detected emotion "${dominantEmotion}" with confidence ${(maxScore * 100).toFixed(1)}%, create a music vibe description and suggest 8-10 songs that would match this mood. 

    Respond in JSON format:
    {
      "vibe": "A brief, engaging description of the mood and vibe",
      "moodCategory": "one of: energetic, calm, melancholic, romantic, angry, excited, peaceful, nostalgic",
      "playlist": [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "reason": "Brief reason why this song fits the mood"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: moodPrompt }],
      temperature: 0.8,
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      // Fallback if AI doesn't return valid JSON
      aiResponse = {
        vibe: `You're feeling ${dominantEmotion} with ${(maxScore * 100).toFixed(1)}% confidence. Let's find some music that matches your energy!`,
        moodCategory: dominantEmotion,
        playlist: getDefaultPlaylist(dominantEmotion)
      };
    }

    // Save analysis to database
    const analysisId = await db.saveAnalysis({
      filename,
      dominantEmotion,
      confidence: maxScore,
      vibe: aiResponse.vibe,
      moodCategory: aiResponse.moodCategory,
      playlist: JSON.stringify(aiResponse.playlist)
    });

    res.json({
      success: true,
      analysisId,
      dominantEmotion,
      confidence: maxScore,
      vibe: aiResponse.vibe,
      moodCategory: aiResponse.moodCategory,
      playlist: aiResponse.playlist
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/api/analysis/:id', async (req, res) => {
  try {
    const analysis = await db.getAnalysis(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    analysis.playlist = JSON.parse(analysis.playlist);
    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis' });
  }
});

app.get('/api/recent-analyses', async (req, res) => {
  try {
    const analyses = await db.getRecentAnalyses();
    res.json(analyses.map(analysis => ({
      ...analysis,
      playlist: JSON.parse(analysis.playlist)
    })));
  } catch (error) {
    console.error('Get recent analyses error:', error);
    res.status(500).json({ error: 'Failed to retrieve analyses' });
  }
});

// Fallback playlists for different moods
function getDefaultPlaylist(emotion) {
  const playlists = {
    happy: [
      { title: "Good 4 U", artist: "Olivia Rodrigo", reason: "Upbeat energy matches your positive vibe" },
      { title: "Levitating", artist: "Dua Lipa", reason: "Feel-good disco vibes" },
      { title: "Blinding Lights", artist: "The Weeknd", reason: "Energetic and uplifting" }
    ],
    sad: [
      { title: "Someone Like You", artist: "Adele", reason: "Beautiful ballad for contemplative moments" },
      { title: "Hurt", artist: "Johnny Cash", reason: "Raw emotion and reflection" },
      { title: "Mad World", artist: "Gary Jules", reason: "Atmospheric melancholy" }
    ],
    angry: [
      { title: "Break Stuff", artist: "Limp Bizkit", reason: "Channel that intensity" },
      { title: "Killing in the Name", artist: "Rage Against the Machine", reason: "Powerful release energy" },
      { title: "Bodies", artist: "Drowning Pool", reason: "High-energy outlet" }
    ],
    surprised: [
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", reason: "Unexpected groove to match your surprise" },
      { title: "Can't Stop the Feeling", artist: "Justin Timberlake", reason: "Joyful surprise energy" }
    ],
    neutral: [
      { title: "Weightless", artist: "Marconi Union", reason: "Balanced and centering" },
      { title: "Clair de Lune", artist: "Claude Debussy", reason: "Peaceful and contemplative" },
      { title: "Lofi Hip Hop Mix", artist: "Various Artists", reason: "Chill background vibes" }
    ]
  };
  
  return playlists[emotion] || playlists.neutral;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});