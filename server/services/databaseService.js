import MongoDatabase from "../database/mongoDatabase.js";
import JSONDatabase from "../database/jsonDatabase.js";

class DatabaseService {
  constructor() {
    this.database = null;
    this.type = null;
  }

  async initialize() {
    try {
      console.log("🔄 Initializing database service...");

      // Always try MongoDB first if URI is provided
      if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== "") {
        console.log("🔄 MongoDB URI detected, attempting connection...");
        const mongoDb = new MongoDatabase();

        try {
          const connected = await mongoDb.connect();
          if (connected && mongoDb.connected) {
            this.database = mongoDb;
            this.type = "mongodb";
            console.log("✅ Successfully connected to MongoDB database");
            console.log(`📊 Database type: ${this.type}`);
            return true;
          }
        } catch (error) {
          console.log("⚠️ MongoDB connection failed:", error.message);
          console.log("🔄 Falling back to JSON database...");
        }
      } else {
        console.log("ℹ️ No MongoDB URI provided, using JSON database");
      }

      // Fallback to JSON database
      console.log("🔄 Initializing JSON file database...");
      const jsonDb = new JSONDatabase();
      await jsonDb.connect();
      this.database = jsonDb;
      this.type = "json";
      console.log("✅ Using JSON file database");
      console.log(`📊 Database type: ${this.type}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize any database:", error);
      throw new Error("Database initialization failed");
    }
  }

  async disconnect() {
    if (this.database) {
      console.log(`🔌 Disconnecting from ${this.type} database...`);
      await this.database.disconnect();
      this.database = null;
      this.type = null;
    }
  }

  // Analysis operations
  async saveAnalysis(analysisData) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(`💾 Saving analysis to ${this.type} database...`);
    const result = await this.database.saveAnalysis(analysisData);
    console.log(`✅ Analysis saved with ID: ${result}`);
    return result;
  }

  async getAnalysis(id) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(`🔍 Fetching analysis ${id} from ${this.type} database...`);
    return await this.database.getAnalysis(id);
  }

  async getRecentAnalyses(limit = 10) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(
      `📋 Fetching ${limit} recent analyses from ${this.type} database...`
    );
    return await this.database.getRecentAnalyses(limit);
  }

  async searchAnalyses(filters = {}) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(
      `🔍 Searching analyses in ${this.type} database with filters:`,
      filters
    );
    return await this.database.searchAnalyses(filters);
  }

  async getAnalytics() {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(`📊 Fetching analytics from ${this.type} database...`);
    return await this.database.getAnalytics();
  }

  async deleteAnalysis(id) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(`🗑️ Deleting analysis ${id} from ${this.type} database...`);
    return await this.database.deleteAnalysis(id);
  }

  async updateAnalysis(id, updateData) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }

    console.log(`✏️ Updating analysis ${id} in ${this.type} database...`);

    // Check if method exists (MongoDB specific)
    if (this.database.updateAnalysis) {
      return await this.database.updateAnalysis(id, updateData);
    }

    // For JSON database, we'd need to implement this
    console.log("⚠️ Update not supported for JSON database");
    return false;
  }

  async toggleFavorite(id) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }

    console.log(
      `❤️ Toggling favorite for analysis ${id} in ${this.type} database...`
    );

    // Check if method exists (MongoDB specific)
    if (this.database.toggleFavorite) {
      return await this.database.toggleFavorite(id);
    }

    // For JSON database, implement basic toggle
    const analysis = await this.database.getAnalysis(id);
    if (analysis) {
      console.log("⚠️ Toggle favorite not fully supported for JSON database");
      return false;
    }
    return false;
  }

  async incrementViewCount(id) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }

    console.log(
      `👁️ Incrementing view count for analysis ${id} in ${this.type} database...`
    );

    // Check if method exists (MongoDB specific)
    if (this.database.incrementViewCount) {
      return await this.database.incrementViewCount(id);
    }

    // For JSON database, this would need implementation
    console.log("⚠️ View count increment not supported for JSON database");
    return false;
  }

  // User operations
  async saveUser(userData) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(`👤 Saving user to ${this.type} database...`);
    return await this.database.saveUser(userData);
  }

  async getUser(id) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    console.log(`👤 Fetching user ${id} from ${this.type} database...`);
    return await this.database.getUser(id);
  }

  async getUserByEmail(email) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }

    console.log(`📧 Fetching user by email from ${this.type} database...`);

    // Check if method exists (MongoDB specific)
    if (this.database.getUserByEmail) {
      return await this.database.getUserByEmail(email);
    }

    // For JSON database, this would need implementation
    console.log("⚠️ Get user by email not supported for JSON database");
    return null;
  }

  async updateUser(id, updateData) {
    if (!this.database) {
      throw new Error("Database not initialized");
    }

    console.log(`👤 Updating user ${id} in ${this.type} database...`);

    // Check if method exists (MongoDB specific)
    if (this.database.updateUser) {
      return await this.database.updateUser(id, updateData);
    }

    // For JSON database, this would need implementation
    console.log("⚠️ Update user not supported for JSON database");
    return false;
  }

  // Health and status
  async getHealth() {
    if (!this.database) {
      return {
        status: "not_initialized",
        database: "none",
        error: "Database not initialized",
      };
    }

    const health = await this.database.getHealth();
    return {
      ...health,
      type: this.type,
    };
  }

  getType() {
    return this.type;
  }

  isConnected() {
    return this.database !== null;
  }

  // Force MongoDB connection (for debugging)
  async forceMongoConnection() {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not provided");
    }

    console.log("🔄 Force connecting to MongoDB...");
    const mongoDb = new MongoDatabase();

    try {
      await mongoDb.connect();

      // Disconnect current database if any
      if (this.database) {
        await this.database.disconnect();
      }

      this.database = mongoDb;
      this.type = "mongodb";
      console.log("✅ Force connected to MongoDB successfully");
      return true;
    } catch (error) {
      console.error("❌ Force MongoDB connection failed:", error);
      throw error;
    }
  }

  // Utility methods
  async backup() {
    if (!this.database) {
      throw new Error("Database not initialized");
    }

    if (this.type === "json") {
      console.log("📁 JSON database files are already backed up as files");
      return true;
    }

    if (this.type === "mongodb") {
      console.log("🍃 MongoDB backup should be handled by MongoDB tools");
      return true;
    }

    return false;
  }

  async migrate() {
    if (!this.database) {
      throw new Error("Database not initialized");
    }

    // Future: Implement migration between database types
    console.log("🔄 Migration not yet implemented");
    return false;
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;
