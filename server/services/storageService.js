import S3Storage from '../storage/s3Storage.js';
import LocalStorage from '../storage/localStorage.js';

class StorageService {
  constructor() {
    this.storage = null;
    this.type = null;
  }

  async initialize() {
    try {
      // Try S3 first if credentials are provided
      if (this.hasS3Credentials()) {
        console.log('🔄 Attempting to initialize S3 storage...');
        const s3Storage = new S3Storage();
        
        try {
          const health = await s3Storage.getHealth();
          if (health.status === 'healthy') {
            this.storage = s3Storage;
            this.type = 's3';
            console.log('✅ Using AWS S3 storage');
            return true;
          } else {
            console.log('⚠️ S3 not healthy, falling back to local storage');
          }
        } catch (error) {
          console.log('⚠️ S3 initialization failed, falling back to local storage');
          console.error('S3 error:', error.message);
        }
      }
      
      // Fallback to local storage
      console.log('🔄 Initializing local file storage...');
      const localStorage = new LocalStorage();
      const health = await localStorage.getHealth();
      
      if (health.status === 'healthy') {
        this.storage = localStorage;
        this.type = 'local';
        console.log('✅ Using local file storage');
        return true;
      } else {
        throw new Error('Local storage initialization failed');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize any storage:', error);
      throw new Error('Storage initialization failed');
    }
  }

  hasS3Credentials() {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET
    );
  }

  // File operations
  async uploadFile(file, filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.uploadFile(file, filename);
  }

  async deleteFile(filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.deleteFile(filename);
  }

  async getFileInfo(filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.getFileInfo(filename);
  }

  async listFiles() {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.listFiles();
  }

  async getStorageStats() {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.getStorageStats();
  }

  async cleanupOldFiles(daysOld = 30) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    return await this.storage.cleanupOldFiles(daysOld);
  }

  // S3 specific methods
  async generatePresignedUrl(filename, expiresIn = 3600) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    
    if (this.type === 's3' && this.storage.generatePresignedUrl) {
      return await this.storage.generatePresignedUrl(filename, expiresIn);
    }
    
    // For local storage, return the direct URL
    if (this.type === 'local') {
      const fileInfo = await this.storage.getFileInfo(filename);
      return fileInfo ? fileInfo.url : null;
    }
    
    return null;
  }

  // Health and status
  async getHealth() {
    if (!this.storage) {
      return {
        status: 'not_initialized',
        storage: 'none',
        error: 'Storage not initialized'
      };
    }
    
    const health = await this.storage.getHealth();
    return {
      ...health,
      type: this.type
    };
  }

  getType() {
    return this.type;
  }

  isInitialized() {
    return this.storage !== null;
  }

  // Utility methods
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = originalName.split('.').pop();
    return `upload-${timestamp}-${random}.${extension}`;
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  isValidFileType(filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov']) {
    const extension = this.getFileExtension(filename);
    return allowedTypes.includes(extension);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Batch operations
  async uploadMultipleFiles(files) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    
    const results = [];
    
    for (const file of files) {
      try {
        const filename = this.generateUniqueFilename(file.originalname || file.name);
        const result = await this.uploadFile(file, filename);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ 
          success: false, 
          filename: file.originalname || file.name, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  async deleteMultipleFiles(filenames) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    
    const results = [];
    
    for (const filename of filenames) {
      try {
        const deleted = await this.deleteFile(filename);
        results.push({ success: deleted, filename });
      } catch (error) {
        results.push({ success: false, filename, error: error.message });
      }
    }
    
    return results;
  }

  // Maintenance operations
  async performMaintenance() {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }
    
    console.log('🔧 Starting storage maintenance...');
    
    try {
      // Clean up old files (older than 30 days)
      const deletedCount = await this.cleanupOldFiles(30);
      
      // Get updated stats
      const stats = await this.getStorageStats();
      
      console.log('✅ Storage maintenance completed');
      
      return {
        success: true,
        deletedFiles: deletedCount,
        currentStats: stats
      };
    } catch (error) {
      console.error('❌ Storage maintenance failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;