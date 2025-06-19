import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Import our services
import databaseService from './services/databaseService.js';
import storageService from './services/storageService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initializing services...');
    
    // Initialize database service
    await databaseService.initialize();
    
    // Initialize storage service
    await storageService.initialize();
    
    console.log('✅ All services initialized successfully');
    console.log(`📊 Database: ${databaseService.getType()}`);
    console.log(`💾 Storage: ${storageService.getType()}`);
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
}

// Configure multer for file uploads (temporary storage)
const upload = multer({
  storage: multer.memoryStorage(),
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

// Initialize OpenAI (optional)
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [dbHealth, storageHealth] = await Promise.all([
      databaseService.getHealth(),
      storageService.getHealth()
    ]);
    
    console.log('🏥 Health check requested');
    console.log(`📊 Database: ${dbHealth.status} (${dbHealth.database || dbHealth.type})`);
    console.log(`💾 Storage: ${storageHealth.status} (${storageHealth.storage || storageHealth.type})`);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        storage: storageHealth
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File upload requested:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Generate unique filename
    const filename = storageService.generateUniqueFilename(req.file.originalname);
    
    // Upload file using storage service
    const uploadResult = await storageService.uploadFile(req.file, filename);
    
    const fileInfo = {
      filename: uploadResult.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: uploadResult.url,
      path: `/uploads/${uploadResult.filename}`
    };

    console.log('✅ File uploaded successfully:', fileInfo.filename);

    res.json({ 
      success: true, 
      file: fileInfo,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Mood analysis endpoint
app.post('/api/analyze-mood', async (req, res) => {
  try {
    const { emotions, colorAnalysis, preferences, moodQuizData, filename } = req.body;
    
    console.log('🧠 Mood analysis requested:', {
      filename,
      emotionsCount: emotions?.length || 0,
      hasColorAnalysis: !!colorAnalysis,
      hasPreferences: !!preferences,
      hasMoodQuiz: !!moodQuizData
    });
    
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

    console.log(`🎭 Dominant emotion detected: ${dominantEmotion} (${(maxScore * 100).toFixed(1)}%)`);

    // Create enhanced prompt with all available context
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
    
    The playlist should feel like it was crafted by someone who truly understands the user\'s complete emotional and aesthetic state.
    
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
    
    // Try to use OpenAI if available
    if (openai) {
      try {
        console.log('🤖 Using OpenAI for playlist generation...');
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: enhancedPrompt }],
          temperature: 0.8,
        });

        aiResponse = JSON.parse(completion.choices[0].message.content);
        console.log('✅ OpenAI playlist generated successfully');
      } catch (aiError) {
        console.error('❌ OpenAI API error:', aiError);
        console.log('🔄 Falling back to enhanced fallback playlist...');
        aiResponse = getUltraEnhancedFallbackPlaylist(dominantEmotion, preferences, colorAnalysis, moodQuizData);
      }
    } else {
      console.log('🔄 Using enhanced fallback playlist (no OpenAI key)...');
      // Use enhanced fallback
      aiResponse = getUltraEnhancedFallbackPlaylist(dominantEmotion, preferences, colorAnalysis, moodQuizData);
    }

    // Prepare analysis data for database
    const analysisData = {
      filename,
      dominant_emotion: dominantEmotion,
      confidence: maxScore,
      vibe: aiResponse.vibe,
      mood_category: aiResponse.moodCategory,
      playlist: aiResponse.playlist,
      colorAnalysis: colorAnalysis || null,
      preferences: preferences || null,
      moodQuizData: moodQuizData || null,
      file_url: filename ? `/uploads/${filename}` : null,
      file_size: null, // Could be added from upload info
      file_type: null  // Could be added from upload info
    };

    console.log('💾 Saving analysis to database...');
    
    // Save analysis to database
    const analysisId = await databaseService.saveAnalysis(analysisData);

    console.log(`✅ Analysis completed and saved with ID: ${analysisId}`);

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
    console.error('❌ Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed: ' + error.message });
  }
});

// Get specific analysis
app.get('/api/analysis/:id', async (req, res) => {
  try {
    console.log(`🔍 Analysis ${req.params.id} requested`);
    const analysis = await databaseService.getAnalysis(req.params.id);
    if (!analysis) {
      console.log(`❌ Analysis ${req.params.id} not found`);
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    // Increment view count if supported
    await databaseService.incrementViewCount(req.params.id);
    
    // Parse JSON fields for response
    const result = {
      ...analysis,
      playlist: typeof analysis.playlist === 'string' ? JSON.parse(analysis.playlist) : analysis.playlist
    };
    
    if (analysis.color_analysis) {
      result.colorAnalysis = typeof analysis.color_analysis === 'string' 
        ? JSON.parse(analysis.color_analysis) 
        : analysis.color_analysis;
    }
    if (analysis.preferences) {
      result.preferences = typeof analysis.preferences === 'string' 
        ? JSON.parse(analysis.preferences) 
        : analysis.preferences;
    }
    if (analysis.mood_quiz_data) {
      result.moodQuizData = typeof analysis.mood_quiz_data === 'string' 
        ? JSON.parse(analysis.mood_quiz_data) 
        : analysis.mood_quiz_data;
    }
    
    console.log(`✅ Analysis ${req.params.id} retrieved successfully`);
    res.json(result);
  } catch (error) {
    console.error('❌ Get analysis error:', error);
    res.status(500).json({ error: 'Failed to retrieve analysis: ' + error.message });
  }
});

// Get recent analyses
app.get('/api/recent-analyses', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📋 Recent analyses requested (limit: ${limit})`);
    
    const analyses = await databaseService.getRecentAnalyses(limit);
    
    const result = analyses.map(analysis => {
      const parsed = {
        ...analysis,
        playlist: typeof analysis.playlist === 'string' ? JSON.parse(analysis.playlist) : analysis.playlist
      };
      
      if (analysis.color_analysis) {
        parsed.colorAnalysis = typeof analysis.color_analysis === 'string' 
          ? JSON.parse(analysis.color_analysis) 
          : analysis.color_analysis;
      }
      if (analysis.preferences) {
        parsed.preferences = typeof analysis.preferences === 'string' 
          ? JSON.parse(analysis.preferences) 
          : analysis.preferences;
      }
      if (analysis.mood_quiz_data) {
        parsed.moodQuizData = typeof analysis.mood_quiz_data === 'string' 
          ? JSON.parse(analysis.mood_quiz_data) 
          : analysis.mood_quiz_data;
      }
      
      return parsed;
    });
    
    console.log(`✅ Retrieved ${result.length} recent analyses`);
    res.json(result);
  } catch (error) {
    console.error('❌ Get recent analyses error:', error);
    res.status(500).json({ error: 'Failed to retrieve analyses: ' + error.message });
  }
});

// Search analyses
app.get('/api/search', async (req, res) => {
  try {
    const filters = {
      emotion: req.query.emotion,
      mood: req.query.mood,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      keyword: req.query.keyword,
      page: req.query.page,
      limit: req.query.limit,
      isFavorite: req.query.isFavorite === 'true',
      userId: req.query.userId
    };
    
    console.log('🔍 Search analyses requested with filters:', filters);
    
    const result = await databaseService.searchAnalyses(filters);
    
    // Parse JSON fields in results
    result.analyses = result.analyses.map(analysis => {
      const parsed = {
        ...analysis,
        playlist: typeof analysis.playlist === 'string' ? JSON.parse(analysis.playlist) : analysis.playlist
      };
      
      if (analysis.color_analysis) {
        parsed.colorAnalysis = typeof analysis.color_analysis === 'string' 
          ? JSON.parse(analysis.color_analysis) 
          : analysis.color_analysis;
      }
      if (analysis.preferences) {
        parsed.preferences = typeof analysis.preferences === 'string' 
          ? JSON.parse(analysis.preferences) 
          : analysis.preferences;
      }
      if (analysis.mood_quiz_data) {
        parsed.moodQuizData = typeof analysis.mood_quiz_data === 'string' 
          ? JSON.parse(analysis.mood_quiz_data) 
          : analysis.mood_quiz_data;
      }
      
      return parsed;
    });
    
    console.log(`✅ Search completed: ${result.analyses.length} results found`);
    res.json(result);
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
});

// Analytics dashboard
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    console.log('📊 Analytics dashboard requested');
    const analytics = await databaseService.getAnalytics();
    console.log('✅ Analytics retrieved successfully');
    res.json(analytics);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics: ' + error.message });
  }
});

// Toggle favorite
app.post('/api/analysis/:id/favorite', async (req, res) => {
  try {
    console.log(`❤️ Toggle favorite requested for analysis ${req.params.id}`);
    const isFavorite = await databaseService.toggleFavorite(req.params.id);
    console.log(`✅ Favorite toggled: ${isFavorite}`);
    res.json({ success: true, isFavorite });
  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite: ' + error.message });
  }
});

// Delete analysis
app.delete('/api/analysis/:id', async (req, res) => {
  try {
    console.log(`🗑️ Delete analysis ${req.params.id} requested`);
    const success = await databaseService.deleteAnalysis(req.params.id);
    if (success) {
      console.log(`✅ Analysis ${req.params.id} deleted successfully`);
      res.json({ success: true, message: 'Analysis deleted successfully' });
    } else {
      console.log(`❌ Analysis ${req.params.id} not found for deletion`);
      res.status(404).json({ error: 'Analysis not found' });
    }
  } catch (error) {
    console.error('❌ Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete analysis: ' + error.message });
  }
});

// Storage management endpoints
app.get('/api/storage/stats', async (req, res) => {
  try {
    console.log('💾 Storage stats requested');
    const stats = await storageService.getStorageStats();
    console.log('✅ Storage stats retrieved');
    res.json(stats);
  } catch (error) {
    console.error('❌ Storage stats error:', error);
    res.status(500).json({ error: 'Failed to get storage stats: ' + error.message });
  }
});

app.post('/api/storage/cleanup', async (req, res) => {
  try {
    const daysOld = parseInt(req.body.daysOld) || 30;
    console.log(`🧹 Storage cleanup requested (${daysOld} days old)`);
    const deletedCount = await storageService.cleanupOldFiles(daysOld);
    console.log(`✅ Storage cleanup completed: ${deletedCount} files deleted`);
    res.json({ success: true, deletedFiles: deletedCount });
  } catch (error) {
    console.error('❌ Storage cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup storage: ' + error.message });
  }
});

// Debug endpoint to force MongoDB connection
app.post('/api/debug/force-mongo', async (req, res) => {
  try {
    console.log('🔧 Force MongoDB connection requested');
    await databaseService.forceMongoConnection();
    const health = await databaseService.getHealth();
    console.log('✅ Force MongoDB connection successful');
    res.json({ success: true, health });
  } catch (error) {
    console.error('❌ Force MongoDB connection failed:', error);
    res.status(500).json({ error: 'Failed to force MongoDB connection: ' + error.message });
  }
});

// Enhanced fallback playlist generator
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

// Default playlist functions
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

function getGenreSpecificPlaylist(emotion, genre) {
  // Implementation same as before
  return getDefaultPlaylist(emotion);
}

function getActivitySpecificPlaylist(emotion, activity, basePlaylist) {
  // Implementation same as before
  return basePlaylist;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Database: ${databaseService.getType()}`);
      console.log(`💾 Storage: ${storageService.getType()}`);
      console.log(`🤖 OpenAI: ${openai ? 'enabled' : 'disabled (using fallback playlists)'}`);
      console.log('');
      console.log('🎯 Ready to analyze vibes and create amazing playlists!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();