import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const ANALYSES_FILE = path.join(DATA_DIR, 'analyses.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(ANALYSES_FILE)) {
  fs.writeFileSync(ANALYSES_FILE, JSON.stringify([]));
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

class JSONDatabase {
  constructor() {
    this.connected = true;
  }

  async connect() {
    console.log('📁 Using JSON file database');
    return true;
  }

  async disconnect() {
    console.log('📁 JSON database disconnected');
    return true;
  }

  // Analysis operations
  async saveAnalysis(analysisData) {
    try {
      const analyses = this.readAnalyses();
      const newAnalysis = {
        id: Date.now(),
        ...analysisData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      analyses.unshift(newAnalysis);
      this.writeAnalyses(analyses);
      
      console.log(`💾 Analysis saved with ID: ${newAnalysis.id}`);
      return newAnalysis.id;
    } catch (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
  }

  async getAnalysis(id) {
    try {
      const analyses = this.readAnalyses();
      return analyses.find(analysis => analysis.id === parseInt(id));
    } catch (error) {
      console.error('Error getting analysis:', error);
      return null;
    }
  }

  async getRecentAnalyses(limit = 10) {
    try {
      const analyses = this.readAnalyses();
      return analyses.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent analyses:', error);
      return [];
    }
  }

  async searchAnalyses(filters = {}) {
    try {
      let analyses = this.readAnalyses();
      
      // Apply filters
      if (filters.emotion) {
        analyses = analyses.filter(a => 
          a.dominant_emotion.toLowerCase().includes(filters.emotion.toLowerCase())
        );
      }
      
      if (filters.mood) {
        analyses = analyses.filter(a => 
          a.mood_category.toLowerCase().includes(filters.mood.toLowerCase())
        );
      }
      
      if (filters.dateFrom) {
        analyses = analyses.filter(a => 
          new Date(a.created_at) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        analyses = analyses.filter(a => 
          new Date(a.created_at) <= new Date(filters.dateTo)
        );
      }
      
      if (filters.keyword) {
        analyses = analyses.filter(a => 
          a.vibe.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          JSON.stringify(a.playlist).toLowerCase().includes(filters.keyword.toLowerCase())
        );
      }
      
      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        analyses: analyses.slice(startIndex, endIndex),
        total: analyses.length,
        page,
        totalPages: Math.ceil(analyses.length / limit)
      };
    } catch (error) {
      console.error('Error searching analyses:', error);
      return { analyses: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async getAnalytics() {
    try {
      const analyses = this.readAnalyses();
      
      // Emotion distribution
      const emotionCounts = {};
      analyses.forEach(analysis => {
        emotionCounts[analysis.dominant_emotion] = 
          (emotionCounts[analysis.dominant_emotion] || 0) + 1;
      });
      
      // Mood distribution
      const moodCounts = {};
      analyses.forEach(analysis => {
        moodCounts[analysis.mood_category] = 
          (moodCounts[analysis.mood_category] || 0) + 1;
      });
      
      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAnalyses = analyses.filter(a => 
        new Date(a.created_at) >= thirtyDaysAgo
      );
      
      // Daily activity for last 7 days
      const dailyActivity = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyActivity[dateStr] = analyses.filter(a => 
          a.created_at.startsWith(dateStr)
        ).length;
      }
      
      return {
        totalAnalyses: analyses.length,
        recentAnalyses: recentAnalyses.length,
        emotionDistribution: emotionCounts,
        moodDistribution: moodCounts,
        dailyActivity,
        averageConfidence: analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length || 0
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
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
      const analyses = this.readAnalyses();
      const filteredAnalyses = analyses.filter(analysis => analysis.id !== parseInt(id));
      this.writeAnalyses(filteredAnalyses);
      
      console.log(`🗑️ Analysis deleted with ID: ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting analysis:', error);
      return false;
    }
  }

  // User operations
  async saveUser(userData) {
    try {
      const users = this.readUsers();
      const newUser = {
        id: Date.now(),
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      users.push(newUser);
      this.writeUsers(users);
      
      console.log(`👤 User saved with ID: ${newUser.id}`);
      return newUser.id;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(id) {
    try {
      const users = this.readUsers();
      return users.find(user => user.id === parseInt(id));
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Helper methods
  readAnalyses() {
    try {
      const data = fs.readFileSync(ANALYSES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading analyses file:', error);
      return [];
    }
  }

  writeAnalyses(analyses) {
    try {
      fs.writeFileSync(ANALYSES_FILE, JSON.stringify(analyses, null, 2));
    } catch (error) {
      console.error('Error writing analyses file:', error);
      throw error;
    }
  }

  readUsers() {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  }

  writeUsers(users) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error writing users file:', error);
      throw error;
    }
  }

  async getHealth() {
    try {
      const analyses = this.readAnalyses();
      const users = this.readUsers();
      
      return {
        status: 'healthy',
        database: 'json',
        totalAnalyses: analyses.length,
        totalUsers: users.length,
        lastAnalysis: analyses[0]?.created_at || null,
        diskSpace: this.getDiskSpace()
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'json',
        error: error.message
      };
    }
  }

  getDiskSpace() {
    try {
      const stats = fs.statSync(ANALYSES_FILE);
      return {
        analysesFileSize: stats.size,
        lastModified: stats.mtime
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default JSONDatabase;