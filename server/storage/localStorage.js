import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LocalStorage {
  constructor() {
    this.uploadsDir = path.join(__dirname, "../uploads");
    this.ensureUploadsDir();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      console.log("📁 Created uploads directory");
    }
  }

  async uploadFile(file, filename) {
    try {
      const filePath = path.join(this.uploadsDir, filename);

      // If file is a buffer or stream, write it
      if (Buffer.isBuffer(file)) {
        fs.writeFileSync(filePath, file);
      } else if (file.buffer && Buffer.isBuffer(file.buffer)) {
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.path) {
        fs.copyFileSync(file.path, filePath);
      } else {
        throw new Error("Invalid file format for local storage");
      }

      const stats = fs.statSync(filePath);

      console.log(`📁 File uploaded locally: ${filename}`);

      return {
        success: true,
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        path: filePath,
      };
    } catch (error) {
      console.error("Error uploading file locally:", error);
      throw error;
    }
  }

  async deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadsDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ File deleted locally: ${filename}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting file locally:", error);
      return false;
    }
  }

  async getFileInfo(filename) {
    try {
      const filePath = path.join(this.uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);

      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`,
        path: filePath,
      };
    } catch (error) {
      console.error("Error getting file info:", error);
      return null;
    }
  }

  async listFiles() {
    try {
      const files = fs.readdirSync(this.uploadsDir);

      const fileInfos = await Promise.all(
        files.map(async (filename) => {
          const info = await this.getFileInfo(filename);
          return info;
        })
      );

      return fileInfos.filter((info) => info !== null);
    } catch (error) {
      console.error("Error listing files:", error);
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
        oldestFile:
          files.length > 0
            ? Math.min(...files.map((f) => new Date(f.created).getTime()))
            : null,
        newestFile:
          files.length > 0
            ? Math.max(...files.map((f) => new Date(f.created).getTime()))
            : null,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        totalFiles: 0,
        totalSize: 0,
        averageFileSize: 0,
        oldestFile: null,
        newestFile: null,
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

      console.log(`🧹 Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old files:", error);
      return 0;
    }
  }

  async getHealth() {
    try {
      const stats = await this.getStorageStats();
      const isWritable = fs.constants.W_OK;

      // Test write access
      const testFile = path.join(this.uploadsDir, ".write-test");
      fs.writeFileSync(testFile, "test");
      fs.unlinkSync(testFile);

      return {
        status: "healthy",
        storage: "local",
        writable: true,
        uploadsDir: this.uploadsDir,
        ...stats,
      };
    } catch (error) {
      return {
        status: "error",
        storage: "local",
        writable: false,
        error: error.message,
      };
    }
  }
}

export default LocalStorage;
