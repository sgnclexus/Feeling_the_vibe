import * as faceapi from 'face-api.js';

export class EmotionDetector {
  private modelsLoaded = false;

  async loadModels() {
    if (this.modelsLoaded) return;

    try {
      // Load face-api models from CDN
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);

      this.modelsLoaded = true;
      console.log('Face API models loaded successfully');
    } catch (error) {
      console.error('Error loading face API models:', error);
      throw new Error('Failed to load emotion detection models');
    }
  }

  async detectEmotions(file: File) {
    try {
      await this.loadModels();

      // Create image element
      const img = await this.createImageElement(file);
      
      // Detect faces and expressions
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length === 0) {
        // Return neutral emotion if no face detected
        return [{ name: 'neutral', score: 0.8 }];
      }

      // Get the first face's expressions
      const expressions = detections[0].expressions;
      
      // Convert to our format
      const emotions = Object.entries(expressions).map(([name, score]) => ({
        name,
        score
      }));

      // Sort by confidence score
      return emotions.sort((a, b) => b.score - a.score);

    } catch (error) {
      console.error('Error detecting emotions:', error);
      // Return fallback emotions
      return [
        { name: 'neutral', score: 0.6 },
        { name: 'happy', score: 0.3 },
        { name: 'calm', score: 0.1 }
      ];
    }
  }

  private createImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('video/')) {
        // For videos, create a video element and capture a frame
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.onloadeddata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = canvas.toDataURL();
        };

        video.onerror = reject;
        video.src = URL.createObjectURL(file);
        video.load();
      } else {
        // For images
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      }
    });
  }
}