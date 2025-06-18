import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import Database from './database.js';
// Ensure environment variables are loaded
import dotenv from 'dotenv';
dotenv.config();

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
    const { emotions, colorAnalysis, preferences, moodQuizData, filename } = req.body;
    
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

    // Create ultra-enhanced prompt with all available context
    let contextualInfo = `Detected emotion: "${dominantEmotion}" with ${(maxScore * 100).toFixed(1)}% confidence.`;
    
    if (colorAnalysis) {
      contextualInfo += ` Visual analysis shows ${colorAnalysis.mood} colors with ${colorAnalysis.temperature} temperature and ${(colorAnalysis.saturation * 100).toFixed(0)}% saturation.`;
    }
    
    if (moodQuizData) {
      contextualInfo += ` User's mood profile: selected ${moodQuizData.colorPsychology?.name || 'unknown'} color (${moodQuizData.colorPsychology?.mood || 'neutral mood'}), mood words: [${moodQuizData.moodWords.join(', ')}], current activity: ${moodQuizData.activity}.`;
    }
    
    if (preferences) {
      contextualInfo += ` User preferences: genres [${preferences.genres.join(', ')}], energy level: ${preferences.energyLevel}, mood influence: ${preferences.moodInfluence}.`;
    }

    const enhancedPrompt = `${contextualInfo}

    Create an ultra-personalized music vibe description and suggest 8-10 songs that perfectly match this comprehensive multi-modal analysis. 
    ${moodQuizData ? 'Heavily consider the user\'s color psychology insights and mood words to create deep emotional resonance.' : ''}
    ${preferences ? 'Integrate the user\'s genre preferences and energy level while incorporating the detected mood and visual aesthetics.' : 'Focus on the emotional state and visual mood detected.'}
    
    The playlist should feel like it was crafted by someone who truly understands the user's complete emotional and aesthetic state.
    
    Respond in JSON format:
    {
      "vibe": "A detailed, engaging description that weaves together emotional state, color psychology, mood words, visual aesthetics, and personal preferences into a cohesive narrative",
      "moodCategory": "one of: energetic, calm, melancholic, romantic, angry, excited, peaceful, nostalgic",
      "playlist": [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "reason": "Detailed reason explaining how this song matches the emotion, color psychology, mood words, visual mood, and preferences"
        }
      ]
    }`;

    let aiResponse;
    
    // Try to use OpenAI if API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: enhancedPrompt }],
          temperature: 0.8,
        });

        aiResponse = JSON.parse(completion.choices[0].message.content);
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        aiResponse = getUltraEnhancedFallbackPlaylist(dominantEmotion, preferences, colorAnalysis, moodQuizData);
      }
    } else {
      // Use ultra-enhanced fallback
      aiResponse = getUltraEnhancedFallbackPlaylist(dominantEmotion, preferences, colorAnalysis, moodQuizData);
    }

    // Save analysis to database
    const analysisId = await db.saveAnalysis({
      filename,
      dominantEmotion,
      confidence: maxScore,
      vibe: aiResponse.vibe,
      moodCategory: aiResponse.moodCategory,
      playlist: JSON.stringify(aiResponse.playlist),
      colorAnalysis: colorAnalysis ? JSON.stringify(colorAnalysis) : null,
      preferences: preferences ? JSON.stringify(preferences) : null,
      moodQuizData: moodQuizData ? JSON.stringify(moodQuizData) : null
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
    if (analysis.color_analysis) {
      analysis.colorAnalysis = JSON.parse(analysis.color_analysis);
    }
    if (analysis.preferences) {
      analysis.preferences = JSON.parse(analysis.preferences);
    }
    if (analysis.mood_quiz_data) {
      analysis.moodQuizData = JSON.parse(analysis.mood_quiz_data);
    }
    
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
      playlist: JSON.parse(analysis.playlist),
      colorAnalysis: analysis.color_analysis ? JSON.parse(analysis.color_analysis) : null,
      preferences: analysis.preferences ? JSON.parse(analysis.preferences) : null,
      moodQuizData: analysis.mood_quiz_data ? JSON.parse(analysis.mood_quiz_data) : null
    })));
  } catch (error) {
    console.error('Get recent analyses error:', error);
    res.status(500).json({ error: 'Failed to retrieve analyses' });
  }
});

// Ultra-enhanced fallback playlist generator
function getUltraEnhancedFallbackPlaylist(emotion, preferences, colorAnalysis, moodQuizData) {
  const basePlaylist = getDefaultPlaylist(emotion);
  
  // Create ultra-enhanced vibe description
  let vibeDescription = `You're radiating ${emotion} energy`;
  
  if (moodQuizData?.colorPsychology) {
    vibeDescription += ` with a beautiful ${moodQuizData.colorPsychology.name.toLowerCase()} aura that speaks to your ${moodQuizData.colorPsychology.psychology} nature`;
  }
  
  if (moodQuizData?.moodWords?.length > 0) {
    vibeDescription += `. Your chosen words - ${moodQuizData.moodWords.slice(0, 2).join(' and ')} - reveal the depth of your current emotional landscape`;
  }
  
  if (colorAnalysis) {
    vibeDescription += `. The ${colorAnalysis.mood} colors in your image with their ${colorAnalysis.temperature} tones perfectly complement your inner state`;
  }
  
  if (moodQuizData?.activity) {
    vibeDescription += `. Since you're ${moodQuizData.activity}, we've crafted something that enhances this moment`;
  }
  
  if (preferences) {
    vibeDescription += `. Your love for ${preferences.genres.slice(0, 2).join(' and ')} music with ${preferences.energyLevel} energy creates the perfect foundation for this sonic journey`;
  }
  
  vibeDescription += `. This playlist is a reflection of your complete emotional and aesthetic essence - every song chosen to resonate with your unique vibe!`;

  // Adjust playlist based on all available context
  let enhancedPlaylist = basePlaylist;
  
  if (preferences && preferences.genres.length > 0) {
    enhancedPlaylist = getGenreSpecificPlaylist(emotion, preferences.genres[0]);
  }
  
  if (moodQuizData?.activity) {
    enhancedPlaylist = getActivitySpecificPlaylist(emotion, moodQuizData.activity, enhancedPlaylist);
  }

  return {
    vibe: vibeDescription,
    moodCategory: emotion === 'surprised' ? 'excited' : emotion,
    playlist: enhancedPlaylist
  };
}

// Activity-specific playlist adjustments
function getActivitySpecificPlaylist(emotion, activity, basePlaylist) {
  const activityAdjustments = {
    working: {
      happy: [
        { title: "Good as Hell", artist: "Lizzo", reason: "Uplifting energy perfect for productive work sessions" },
        { title: "Sunflower", artist: "Post Malone & Swae Lee", reason: "Positive vibes that keep you motivated" }
      ],
      calm: [
        { title: "Weightless", artist: "Marconi Union", reason: "Scientifically designed to reduce anxiety while working" },
        { title: "Lofi Hip Hop Radio", artist: "ChilledCow", reason: "Perfect background music for focus" }
      ]
    },
    gym: {
      happy: [
        { title: "Till I Collapse", artist: "Eminem", reason: "High-energy motivation for your workout" },
        { title: "Stronger", artist: "Kanye West", reason: "Pump-up anthem that matches your energy" }
      ],
      angry: [
        { title: "Bodies", artist: "Drowning Pool", reason: "Channel that intensity into your workout" },
        { title: "Break Stuff", artist: "Limp Bizkit", reason: "Perfect outlet for aggressive energy" }
      ]
    },
    relaxing: {
      calm: [
        { title: "Weightless", artist: "Marconi Union", reason: "Ultimate relaxation track" },
        { title: "Clair de Lune", artist: "Claude Debussy", reason: "Peaceful classical for deep relaxation" }
      ],
      sad: [
        { title: "Mad World", artist: "Gary Jules", reason: "Atmospheric melancholy for contemplative moments" },
        { title: "The Night We Met", artist: "Lord Huron", reason: "Beautiful sadness for quiet reflection" }
      ]
    }
  };

  return activityAdjustments[activity]?.[emotion] || basePlaylist;
}

// Genre-specific playlist generator (enhanced)
function getGenreSpecificPlaylist(emotion, genre) {
  const genrePlaylists = {
    pop: {
      happy: [
        { title: "Good 4 U", artist: "Olivia Rodrigo", reason: "Upbeat pop energy that matches your joyful vibe" },
        { title: "Levitating", artist: "Dua Lipa", reason: "Feel-good disco-pop vibes perfect for your mood" },
        { title: "As It Was", artist: "Harry Styles", reason: "Melodic pop that captures positive energy" },
        { title: "Anti-Hero", artist: "Taylor Swift", reason: "Catchy pop with emotional depth" }
      ],
      sad: [
        { title: "Someone Like You", artist: "Adele", reason: "Emotional pop ballad for contemplative moments" },
        { title: "All Too Well", artist: "Taylor Swift", reason: "Deeply emotional storytelling in pop form" },
        { title: "Someone You Loved", artist: "Lewis Capaldi", reason: "Heart-wrenching pop that resonates with sadness" },
        { title: "Drivers License", artist: "Olivia Rodrigo", reason: "Raw emotional vulnerability in modern pop" }
      ]
    },
    rock: {
      happy: [
        { title: "Don't Stop Me Now", artist: "Queen", reason: "Classic rock anthem for pure joy and energy" },
        { title: "Mr. Blue Sky", artist: "Electric Light Orchestra", reason: "Uplifting rock with orchestral elements" },
        { title: "Walking on Sunshine", artist: "Katrina and the Waves", reason: "Feel-good rock that radiates happiness" },
        { title: "Good Times Bad Times", artist: "Led Zeppelin", reason: "Classic rock energy for good vibes" }
      ],
      angry: [
        { title: "Break Stuff", artist: "Limp Bizkit", reason: "Aggressive rock to channel your intensity" },
        { title: "Killing in the Name", artist: "Rage Against the Machine", reason: "Powerful rock for releasing anger" },
        { title: "Bodies", artist: "Drowning Pool", reason: "High-energy rock outlet for frustration" },
        { title: "Chop Suey!", artist: "System of a Down", reason: "Intense rock for emotional release" }
      ]
    },
    'hip-hop': {
      happy: [
        { title: "Good Times", artist: "Nile Rodgers & Chic", reason: "Classic feel-good hip-hop foundation" },
        { title: "I Can", artist: "Nas", reason: "Positive hip-hop with uplifting message" },
        { title: "Happy", artist: "Pharrell Williams", reason: "Pure joy in hip-hop form" },
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", reason: "Funky hip-hop energy" }
      ],
      angry: [
        { title: "Lose Yourself", artist: "Eminem", reason: "Intense hip-hop for channeling determination" },
        { title: "HUMBLE.", artist: "Kendrick Lamar", reason: "Powerful hip-hop with aggressive energy" },
        { title: "Till I Collapse", artist: "Eminem", reason: "Motivational anger in hip-hop form" },
        { title: "DNA.", artist: "Kendrick Lamar", reason: "Raw hip-hop intensity" }
      ]
    }
  };

  return genrePlaylists[genre]?.[emotion] || getDefaultPlaylist(emotion);
}

// Enhanced fallback playlists for different moods
function getDefaultPlaylist(emotion) {
  const playlists = {
    happy: [
      { title: "Good 4 U", artist: "Olivia Rodrigo", reason: "Upbeat energy matches your positive vibe" },
      { title: "Levitating", artist: "Dua Lipa", reason: "Feel-good disco vibes" },
      { title: "Blinding Lights", artist: "The Weeknd", reason: "Energetic and uplifting" },
      { title: "Can't Stop the Feeling", artist: "Justin Timberlake", reason: "Pure joy in musical form" },
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", reason: "Infectious groove for happy moments" },
      { title: "Happy", artist: "Pharrell Williams", reason: "The ultimate happiness anthem" },
      { title: "Shake It Off", artist: "Taylor Swift", reason: "Carefree pop energy" },
      { title: "Walking on Sunshine", artist: "Katrina and the Waves", reason: "Classic feel-good vibes" }
    ],
    sad: [
      { title: "Someone Like You", artist: "Adele", reason: "Beautiful ballad for contemplative moments" },
      { title: "Hurt", artist: "Johnny Cash", reason: "Raw emotion and reflection" },
      { title: "Mad World", artist: "Gary Jules", reason: "Atmospheric melancholy" },
      { title: "The Night We Met", artist: "Lord Huron", reason: "Nostalgic sadness with beautiful melody" },
      { title: "Skinny Love", artist: "Bon Iver", reason: "Haunting beauty for introspective moments" },
      { title: "Black", artist: "Pearl Jam", reason: "Deep emotional resonance" },
      { title: "Tears in Heaven", artist: "Eric Clapton", reason: "Gentle sadness with hope" },
      { title: "Everybody Hurts", artist: "R.E.M.", reason: "Comforting sadness that understands" }
    ],
    angry: [
      { title: "Break Stuff", artist: "Limp Bizkit", reason: "Channel that intensity" },
      { title: "Killing in the Name", artist: "Rage Against the Machine", reason: "Powerful release energy" },
      { title: "Bodies", artist: "Drowning Pool", reason: "High-energy outlet" },
      { title: "Chop Suey!", artist: "System of a Down", reason: "Aggressive energy for anger release" },
      { title: "B.Y.O.B.", artist: "System of a Down", reason: "Intense rock for emotional outlet" },
      { title: "One Step Closer", artist: "Linkin Park", reason: "Raw anger with melody" },
      { title: "Freak on a Leash", artist: "Korn", reason: "Heavy energy for frustration" },
      { title: "Down with the Sickness", artist: "Disturbed", reason: "Aggressive release" }
    ],
    surprised: [
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", reason: "Unexpected groove to match your surprise" },
      { title: "Can't Stop the Feeling", artist: "Justin Timberlake", reason: "Joyful surprise energy" },
      { title: "Happy", artist: "Pharrell Williams", reason: "Infectious positivity for surprising moments" },
      { title: "Shut Up and Dance", artist: "Walk the Moon", reason: "Spontaneous energy" },
      { title: "I Gotta Feeling", artist: "Black Eyed Peas", reason: "Unexpected excitement" },
      { title: "Dynamite", artist: "BTS", reason: "Explosive surprise energy" }
    ],
    calm: [
      { title: "Weightless", artist: "Marconi Union", reason: "Scientifically designed for relaxation" },
      { title: "Clair de Lune", artist: "Claude Debussy", reason: "Peaceful classical beauty" },
      { title: "River", artist: "Joni Mitchell", reason: "Gentle folk for quiet contemplation" },
      { title: "Holocene", artist: "Bon Iver", reason: "Serene indie folk" },
      { title: "Mad About You", artist: "Sting", reason: "Gentle romantic calm" },
      { title: "The Night We Met", artist: "Lord Huron", reason: "Peaceful melancholy" },
      { title: "Breathe", artist: "Pink Floyd", reason: "Meditative rock" },
      { title: "Aqueous Transmission", artist: "Incubus", reason: "Flowing calm energy" }
    ],
    neutral: [
      { title: "Weightless", artist: "Marconi Union", reason: "Balanced and centering" },
      { title: "Clair de Lune", artist: "Claude Debussy", reason: "Peaceful and contemplative" },
      { title: "Lofi Hip Hop Mix", artist: "Various Artists", reason: "Chill background vibes" },
      { title: "Breathe", artist: "Pink Floyd", reason: "Meditative and balanced" },
      { title: "Porcelain", artist: "Moby", reason: "Ambient electronic calm" },
      { title: "Teardrop", artist: "Massive Attack", reason: "Atmospheric neutrality" }
    ]
  };
  
  return playlists[emotion] || playlists.neutral;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});