import mongoose from 'mongoose';

// Analysis Schema
const analysisSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  dominant_emotion: { type: String, required: true },
  confidence: { type: Number, required: true },
  vibe: { type: String, required: true },
  mood_category: { type: String, required: true },
  playlist: { type: String, required: true }, // JSON string
  color_analysis: { type: String, default: null }, // JSON string
  preferences: { type: String, default: null }, // JSON string
  mood_quiz_data: { type: String, default: null }, // JSON string
  file_url: { type: String, default: null },
  file_size: { type: Number, default: null },
  file_type: { type: String, default: null },
  user_id: { type: String, default: null },
  tags: [{ type: String }],
  is_favorite: { type: Boolean, default: false },
  view_count: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  username: { type: String, unique: true, sparse: true },
  preferences: { type: String, default: null }, // JSON string
  mood_quiz_data: { type: String, default: null }, // JSON string
  total_analyses: { type: Number, default: 0 },
  favorite_emotions: [{ type: String }],
  favorite_genres: [{ type: String }],
  last_active: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better performance
analysisSchema.index({ dominant_emotion: 1 });
analysisSchema.index({ mood_category: 1 });
analysisSchema.index({ created_at: -1 });
analysisSchema.index({ user_id: 1 });
analysisSchema.index({ is_favorite: 1 });

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ last_active: -1 });

const Analysis = mongoose.model('Analysis', analysisSchema);
const User = mongoose.model('User', userSchema);

class MongoDatabase {
  constructor() {
    this.connected = false;
    this.Analysis = Analysis;
    this.User = User;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/feeling-the-vibe';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      this.connected = true;
      console.log('🍃 Connected to MongoDB successfully');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      this.connected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.connected = false;
      console.log('🍃 Disconnected from MongoDB');
      return true;
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      return false;
    }
  }

  // Analysis operations
  async saveAnalysis(analysisData) {
    try {
      const analysis = new this.Analysis({
        ...analysisData,
        playlist: JSON.stringify(analysisData.playlist),
        color_analysis: analysisData.colorAnalysis ? JSON.stringify(analysisData.colorAnalysis) : null,
        preferences: analysisData.preferences ? JSON.stringify(analysisData.preferences) : null,
        mood_quiz_data: analysisData.moodQuizData ? JSON.stringify(analysisData.moodQuizData) : null
      });
      
      const savedAnalysis = await analysis.save();
      console.log(`💾 Analysis saved to MongoDB with ID: ${savedAnalysis._id}`);
      return savedAnalysis._id.toString();
    } catch (error) {
      console.error('Error saving analysis to MongoDB:', error);
      throw error;
    }
  }

  async getAnalysis(id) {
    try {
      const analysis = await this.Analysis.findById(id);
      if (!analysis) return null;
      
      // Convert to format expected by frontend
      return {
        id: analysis._id.toString(),
        filename: analysis.filename,
        dominant_emotion: analysis.dominant_emotion,
        confidence: analysis.confidence,
        vibe: analysis.vibe,
        mood_category: analysis.mood_category,
        playlist: analysis.playlist,
        color_analysis: analysis.color_analysis,
        preferences: analysis.preferences,
        mood_quiz_data: analysis.mood_quiz_data,
        created_at: analysis.created_at.toISOString(),
        file_url: analysis.file_url,
        is_favorite: analysis.is_favorite,
        view_count: analysis.view_count
      };
    } catch (error) {
      console.error('Error getting analysis from MongoDB:', error);
      return null;
    }
  }

  async getRecentAnalyses(limit = 10) {
    try {
      const analyses = await this.Analysis
        .find()
        .sort({ created_at: -1 })
        .limit(limit)
        .lean();
      
      return analyses.map(analysis => ({
        id: analysis._id.toString(),
        filename: analysis.filename,
        dominant_emotion: analysis.dominant_emotion,
        confidence: analysis.confidence,
        vibe: analysis.vibe,
        mood_category: analysis.mood_category,
        playlist: analysis.playlist,
        color_analysis: analysis.color_analysis,
        preferences: analysis.preferences,
        mood_quiz_data: analysis.mood_quiz_data,
        created_at: analysis.created_at.toISOString(),
        is_favorite: analysis.is_favorite
      }));
    } catch (error) {
      console.error('Error getting recent analyses from MongoDB:', error);
      return [];
    }
  }

  async searchAnalyses(filters = {}) {
    try {
      const query = {};
      
      // Build query based on filters
      if (filters.emotion) {
        query.dominant_emotion = new RegExp(filters.emotion, 'i');
      }
      
      if (filters.mood) {
        query.mood_category = new RegExp(filters.mood, 'i');
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.created_at = {};
        if (filters.dateFrom) {
          query.created_at.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.created_at.$lte = new Date(filters.dateTo);
        }
      }
      
      if (filters.keyword) {
        query.$or = [
          { vibe: new RegExp(filters.keyword, 'i') },
          { playlist: new RegExp(filters.keyword, 'i') }
        ];
      }
      
      if (filters.isFavorite) {
        query.is_favorite = true;
      }
      
      if (filters.userId) {
        query.user_id = filters.userId;
      }
      
      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const skip = (page - 1) * limit;
      
      const [analyses, total] = await Promise.all([
        this.Analysis
          .find(query)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.Analysis.countDocuments(query)
      ]);
      
      return {
        analyses: analyses.map(analysis => ({
          id: analysis._id.toString(),
          filename: analysis.filename,
          dominant_emotion: analysis.dominant_emotion,
          confidence: analysis.confidence,
          vibe: analysis.vibe,
          mood_category: analysis.mood_category,
          playlist: analysis.playlist,
          color_analysis: analysis.color_analysis,
          preferences: analysis.preferences,
          mood_quiz_data: analysis.mood_quiz_data,
          created_at: analysis.created_at.toISOString(),
          is_favorite: analysis.is_favorite
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error searching analyses in MongoDB:', error);
      return { analyses: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async getAnalytics() {
    try {
      const [
        totalAnalyses,
        recentAnalyses,
        emotionDistribution,
        moodDistribution,
        dailyActivity
      ] = await Promise.all([
        this.Analysis.countDocuments(),
        this.Analysis.countDocuments({
          created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        this.Analysis.aggregate([
          { $group: { _id: '$dominant_emotion', count: { $sum: 1 } } }
        ]),
        this.Analysis.aggregate([
          { $group: { _id: '$mood_category', count: { $sum: 1 } } }
        ]),
        this.Analysis.aggregate([
          {
            $match: {
              created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);
      
      // Calculate average confidence
      const confidenceResult = await this.Analysis.aggregate([
        { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
      ]);
      
      // Format results
      const emotionCounts = {};
      emotionDistribution.forEach(item => {
        emotionCounts[item._id] = item.count;
      });
      
      const moodCounts = {};
      moodDistribution.forEach(item => {
        moodCounts[item._id] = item.count;
      });
      
      const dailyActivityMap = {};
      dailyActivity.forEach(item => {
        dailyActivityMap[item._id] = item.count;
      });
      
      return {
        totalAnalyses,
        recentAnalyses,
        emotionDistribution: emotionCounts,
        moodDistribution: moodCounts,
        dailyActivity: dailyActivityMap,
        averageConfidence: confidenceResult[0]?.avgConfidence || 0
      };
    } catch (error) {
      console.error('Error getting analytics from MongoDB:', error);
      return {
        totalAnalyses: 0,
        recentAnalyses: 0,
        emotionDistribution: {},
        moodDistribution: {},
        dailyActivity: {},
        averageConfidence: 0
      };
    }
  }

  async deleteAnalysis(id) {
    try {
      const result = await this.Analysis.findByIdAndDelete(id);
      if (result) {
        console.log(`🗑️ Analysis deleted from MongoDB with ID: ${id}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting analysis from MongoDB:', error);
      return false;
    }
  }

  async updateAnalysis(id, updateData) {
    try {
      const result = await this.Analysis.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: new Date() },
        { new: true }
      );
      return result ? true : false;
    } catch (error) {
      console.error('Error updating analysis in MongoDB:', error);
      return false;
    }
  }

  async toggleFavorite(id) {
    try {
      const analysis = await this.Analysis.findById(id);
      if (!analysis) return false;
      
      analysis.is_favorite = !analysis.is_favorite;
      await analysis.save();
      
      return analysis.is_favorite;
    } catch (error) {
      console.error('Error toggling favorite in MongoDB:', error);
      return false;
    }
  }

  async incrementViewCount(id) {
    try {
      await this.Analysis.findByIdAndUpdate(id, { $inc: { view_count: 1 } });
      return true;
    } catch (error) {
      console.error('Error incrementing view count in MongoDB:', error);
      return false;
    }
  }

  // User operations
  async saveUser(userData) {
    try {
      const user = new this.User({
        ...userData,
        preferences: userData.preferences ? JSON.stringify(userData.preferences) : null,
        mood_quiz_data: userData.moodQuizData ? JSON.stringify(userData.moodQuizData) : null
      });
      
      const savedUser = await user.save();
      console.log(`👤 User saved to MongoDB with ID: ${savedUser._id}`);
      return savedUser._id.toString();
    } catch (error) {
      console.error('Error saving user to MongoDB:', error);
      throw error;
    }
  }

  async getUser(id) {
    try {
      const user = await this.User.findById(id);
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        preferences: user.preferences,
        mood_quiz_data: user.mood_quiz_data,
        total_analyses: user.total_analyses,
        favorite_emotions: user.favorite_emotions,
        favorite_genres: user.favorite_genres,
        last_active: user.last_active.toISOString(),
        created_at: user.created_at.toISOString()
      };
    } catch (error) {
      console.error('Error getting user from MongoDB:', error);
      return null;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.User.findOne({ email });
      return user ? this.getUser(user._id) : null;
    } catch (error) {
      console.error('Error getting user by email from MongoDB:', error);
      return null;
    }
  }

  async updateUser(id, updateData) {
    try {
      const result = await this.User.findByIdAndUpdate(
        id,
        { ...updateData, last_active: new Date() },
        { new: true }
      );
      return result ? true : false;
    } catch (error) {
      console.error('Error updating user in MongoDB:', error);
      return false;
    }
  }

  async getHealth() {
    try {
      const isConnected = mongoose.connection.readyState === 1;
      const dbStats = await mongoose.connection.db.stats();
      
      const [totalAnalyses, totalUsers] = await Promise.all([
        this.Analysis.countDocuments(),
        this.User.countDocuments()
      ]);
      
      const lastAnalysis = await this.Analysis
        .findOne()
        .sort({ created_at: -1 })
        .select('created_at');
      
      return {
        status: isConnected ? 'healthy' : 'disconnected',
        database: 'mongodb',
        connected: isConnected,
        totalAnalyses,
        totalUsers,
        lastAnalysis: lastAnalysis?.created_at?.toISOString() || null,
        dbStats: {
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          indexSize: dbStats.indexSize,
          storageSize: dbStats.storageSize
        }
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'mongodb',
        connected: false,
        error: error.message
      };
    }
  }
}

export default MongoDatabase;