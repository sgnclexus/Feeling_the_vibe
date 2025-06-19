import AWS from 'aws-sdk';

class S3Storage {
  constructor() {
    this.s3 = null;
    this.bucket = process.env.AWS_S3_BUCKET;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.initialized = false;
    
    this.init();
  }

  init() {
    try {
      // Configure AWS
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: this.region
      });

      this.s3 = new AWS.S3();
      this.initialized = true;
      console.log('☁️ AWS S3 storage initialized');
    } catch (error) {
      console.error('Error initializing S3:', error);
      this.initialized = false;
    }
  }

  async uploadFile(file, filename) {
    try {
      if (!this.initialized || !this.bucket) {
        throw new Error('S3 not properly configured');
      }

      let fileBuffer;
      
      // Handle different file input types
      if (Buffer.isBuffer(file)) {
        fileBuffer = file;
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.path) {
        // Read file from path
        const fs = await import('fs');
        fileBuffer = fs.readFileSync(file.path);
      } else {
        throw new Error('Invalid file format for S3 upload');
      }

      const params = {
        Bucket: this.bucket,
        Key: filename,
        Body: fileBuffer,
        ContentType: file.mimetype || 'application/octet-stream',
        ACL: 'public-read' // Make files publicly accessible
      };

      const result = await this.s3.upload(params).promise();
      
      console.log(`☁️ File uploaded to S3: ${filename}`);
      
      return {
        success: true,
        filename,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  async deleteFile(filename) {
    try {
      if (!this.initialized || !this.bucket) {
        throw new Error('S3 not properly configured');
      }

      const params = {
        Bucket: this.bucket,
        Key: filename
      };

      await this.s3.deleteObject(params).promise();
      console.log(`🗑️ File deleted from S3: ${filename}`);
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      return false;
    }
  }

  async getFileInfo(filename) {
    try {
      if (!this.initialized || !this.bucket) {
        return null;
      }

      const params = {
        Bucket: this.bucket,
        Key: filename
      };

      const result = await this.s3.headObject(params).promise();
      
      return {
        filename,
        size: result.ContentLength,
        created: result.LastModified,
        modified: result.LastModified,
        etag: result.ETag,
        contentType: result.ContentType,
        url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filename}`
      };
    } catch (error) {
      if (error.code === 'NotFound') {
        return null;
      }
      console.error('Error getting file info from S3:', error);
      return null;
    }
  }

  async listFiles(prefix = '', maxKeys = 1000) {
    try {
      if (!this.initialized || !this.bucket) {
        return [];
      }

      const params = {
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      };

      const result = await this.s3.listObjectsV2(params).promise();
      
      const fileInfos = await Promise.all(
        result.Contents.map(async (object) => {
          return {
            filename: object.Key,
            size: object.Size,
            created: object.LastModified,
            modified: object.LastModified,
            etag: object.ETag,
            url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${object.Key}`
          };
        })
      );
      
      return fileInfos;
    } catch (error) {
      console.error('Error listing files from S3:', error);
      return [];
    }
  }

  async getStorageStats() {
    try {
      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      return {
        totalFiles: files.length,
        totalSize,
        averageFileSize: files.length > 0 ? totalSize / files.length : 0,
        oldestFile: files.length > 0 ? Math.min(...files.map(f => new Date(f.created).getTime())) : null,
        newestFile: files.length > 0 ? Math.max(...files.map(f => new Date(f.created).getTime())) : null
      };
    } catch (error) {
      console.error('Error getting S3 storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        averageFileSize: 0,
        oldestFile: null,
        newestFile: null
      };
    }
  }

  async cleanupOldFiles(daysOld = 30) {
    try {
      const files = await this.listFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let deletedCount = 0;
      
      for (const file of files) {
        if (new Date(file.created) < cutoffDate) {
          const deleted = await this.deleteFile(file.filename);
          if (deleted) deletedCount++;
        }
      }
      
      console.log(`🧹 Cleaned up ${deletedCount} old files from S3`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old files from S3:', error);
      return 0;
    }
  }

  async generatePresignedUrl(filename, expiresIn = 3600) {
    try {
      if (!this.initialized || !this.bucket) {
        throw new Error('S3 not properly configured');
      }

      const params = {
        Bucket: this.bucket,
        Key: filename,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      return null;
    }
  }

  async getHealth() {
    try {
      if (!this.initialized || !this.bucket) {
        return {
          status: 'not_configured',
          storage: 's3',
          configured: false,
          error: 'S3 credentials or bucket not configured'
        };
      }

      // Test S3 connection by listing bucket
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
      
      const stats = await this.getStorageStats();
      
      return {
        status: 'healthy',
        storage: 's3',
        configured: true,
        bucket: this.bucket,
        region: this.region,
        ...stats
      };
    } catch (error) {
      return {
        status: 'error',
        storage: 's3',
        configured: true,
        error: error.message
      };
    }
  }
}

export default S3Storage;