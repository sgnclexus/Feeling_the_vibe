import MongoDatabase from '../database/mongoDatabase.js';
import JSONDatabase from '../database/jsonDatabase.js';

class DatabaseService {
  constructor() {
    this.database = null;
    this.type = null;
  }

  async initialize() {
    try {
      // Try MongoDB first if URI is provided
      if (process.env.MONGODB_URI) {
        console.log('🔄 Attempting to connect to MongoDB...');
        const mongoDb = new MongoDatabase();
        
        try {
          await mongoDb.connect();
          this.database = mongoDb;
          this.type = 'mongodb';
          console.log('✅ Using MongoDB database');
          return true;
        } catch (error) {
          console.log('⚠️ MongoDB connection failed, falling back to JSON database');
          console.error('MongoDB error:', error.message);
        }
      }
      
      // Fallback to JSON database
      console.log('🔄 Initializing JSON file database...');
      const jsonDb = new JSONDatabase();
      await jsonDb.connect();
      this.database = jsonDb;
      this.type = 'json';
      console.log('✅ Using JSON file database');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize any database:', error);
      throw new Error('Database initialization failed');
    }
  }

  async disconnect() {
    if (this.database) {
      await this.database.disconnect();
      this.database = null;
      this.type = null;
    }
  }

  // Analysis operations
  async saveAnalysis(analysisData) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.saveAnalysis(analysisData);
  }

  async getAnalysis(id) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.getAnalysis(id);
  }

  async getRecentAnalyses(limit = 10) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.getRecentAnalyses(limit);
  }

  async searchAnalyses(filters = {}) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.searchAnalyses(filters);
  }

  async getAnalytics() {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.getAnalytics();
  }

  async deleteAnalysis(id) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.deleteAnalysis(id);
  }

  async updateAnalysis(id, updateData) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    // Check if method exists (MongoDB specific)
    if (this.database.updateAnalysis) {
      return await this.database.updateAnalysis(id, updateData);
    }
    
    // For JSON database, we'd need to implement this
    console.log('Update not supported for JSON database');
    return false;
  }

  async toggleFavorite(id) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    // Check if method exists (MongoDB specific)
    if (this.database.toggleFavorite) {
      return await this.database.toggleFavorite(id);
    }
    
    // For JSON database, implement basic toggle
    const analysis = await this.database.getAnalysis(id);
    if (analysis) {
      // This would need to be implemented in JSONDatabase
      console.log('Toggle favorite not fully supported for JSON database');
      return false;
    }
    return false;
  }

  async incrementViewCount(id) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    // Check if method exists (MongoDB specific)
    if (this.database.incrementViewCount) {
      return await this.database.incrementViewCount(id);
    }
    
    // For JSON database, this would need implementation
    console.log('View count increment not supported for JSON database');
    return false;
  }

  // User operations
  async saveUser(userData) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.saveUser(userData);
  }

  async getUser(id) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    return await this.database.getUser(id);
  }

  async getUserByEmail(email) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    // Check if method exists (MongoDB specific)
    if (this.database.getUserByEmail) {
      return await this.database.getUserByEmail(email);
    }
    
    // For JSON database, this would need implementation
    console.log('Get user by email not supported for JSON database');
    return null;
  }

  async updateUser(id, updateData) {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    // Check if method exists (MongoDB specific)
    if (this.database.updateUser) {
      return await this.database.updateUser(id, updateData);
    }
    
    // For JSON database, this would need implementation
    console.log('Update user not supported for JSON database');
    return false;
  }

  // Health and status
  async getHealth() {
    if (!this.database) {
      return {
        status: 'not_initialized',
        database: 'none',
        error: 'Database not initialized'
      };
    }
    
    const health = await this.database.getHealth();
    return {
      ...health,
      type: this.type
    };
  }

  getType() {
    return this.type;
  }

  isConnected() {
    return this.database !== null;
  }

  // Utility methods
  async backup() {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    if (this.type === 'json') {
      console.log('JSON database files are already backed up as files');
      return true;
    }
    
    if (this.type === 'mongodb') {
      console.log('MongoDB backup should be handled by MongoDB tools');
      return true;
    }
    
    return false;
  }

  async migrate() {
    if (!this.database) {
      throw new Error('Database not initialized');
    }
    
    // Future: Implement migration between database types
    console.log('Migration not yet implemented');
    return false;
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;