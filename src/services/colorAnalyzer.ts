export interface ColorData {
  hex: string;
  name: string;
  percentage: number;
  hue: number;
  saturation: number;
  lightness: number;
}

export interface ColorAnalysis {
  dominantColors: ColorData[];
  mood: string;
  temperature: 'warm' | 'cool' | 'neutral';
  saturation: number;
  harmonyScore: number;
  emotionalImpact: string;
}

export class ColorAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async analyzeImage(file: File): Promise<ColorAnalysis> {
    try {
      const img = await this.loadImage(file);
      return this.extractColorAnalysis(img);
    } catch (error) {
      console.error('Color analysis error:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis();
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private extractColorAnalysis(img: HTMLImageElement): ColorAnalysis {
    // Set canvas size (smaller for performance)
    const maxSize = 200;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    this.canvas.width = img.width * scale;
    this.canvas.height = img.height * scale;

    // Draw and analyze image
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Extract color data
    const colorMap = this.extractColors(imageData);
    const dominantColors = this.getDominantColors(colorMap, 5);
    
    // Analyze color properties
    const mood = this.determineMood(dominantColors);
    const temperature = this.determineTemperature(dominantColors);
    const saturation = this.calculateAverageSaturation(dominantColors);
    const harmonyScore = this.calculateHarmonyScore(dominantColors);
    const emotionalImpact = this.determineEmotionalImpact(dominantColors, mood);

    return {
      dominantColors,
      mood,
      temperature,
      saturation,
      harmonyScore,
      emotionalImpact
    };
  }

  private extractColors(imageData: ImageData): Map<string, { count: number; r: number; g: number; b: number }> {
    const colorMap = new Map();
    const data = imageData.data;

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      // Skip transparent pixels
      if (alpha < 128) continue;

      // Quantize colors to reduce noise
      const quantizedR = Math.floor(r / 32) * 32;
      const quantizedG = Math.floor(g / 32) * 32;
      const quantizedB = Math.floor(b / 32) * 32;

      const key = `${quantizedR},${quantizedG},${quantizedB}`;
      
      if (colorMap.has(key)) {
        colorMap.get(key).count++;
      } else {
        colorMap.set(key, { count: 1, r: quantizedR, g: quantizedG, b: quantizedB });
      }
    }

    return colorMap;
  }

  private getDominantColors(colorMap: Map<string, any>, count: number): ColorData[] {
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, count);

    const totalPixels = Array.from(colorMap.values()).reduce((sum, color) => sum + color.count, 0);

    return sortedColors.map(([key, data]) => {
      const { r, g, b } = data;
      const hsl = this.rgbToHsl(r, g, b);
      
      return {
        hex: this.rgbToHex(r, g, b),
        name: this.getColorName(r, g, b),
        percentage: data.count / totalPixels,
        hue: hsl.h,
        saturation: hsl.s,
        lightness: hsl.l
      };
    });
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private getColorName(r: number, g: number, b: number): string {
    const hsl = this.rgbToHsl(r, g, b);
    const { h, s, l } = hsl;

    // Basic color naming based on HSL
    if (s < 0.1) {
      if (l < 0.2) return 'Black';
      if (l < 0.4) return 'Dark Gray';
      if (l < 0.6) return 'Gray';
      if (l < 0.8) return 'Light Gray';
      return 'White';
    }

    if (h < 15 || h >= 345) return 'Red';
    if (h < 45) return 'Orange';
    if (h < 75) return 'Yellow';
    if (h < 105) return 'Yellow Green';
    if (h < 135) return 'Green';
    if (h < 165) return 'Green Cyan';
    if (h < 195) return 'Cyan';
    if (h < 225) return 'Blue';
    if (h < 255) return 'Blue Violet';
    if (h < 285) return 'Violet';
    if (h < 315) return 'Magenta';
    return 'Red Magenta';
  }

  private determineMood(colors: ColorData[]): string {
    const avgSaturation = colors.reduce((sum, color) => sum + color.saturation, 0) / colors.length;
    const avgLightness = colors.reduce((sum, color) => sum + color.lightness, 0) / colors.length;
    
    // Determine mood based on color properties
    if (avgSaturation > 0.7 && avgLightness > 0.5) return 'energetic';
    if (avgSaturation < 0.3) return 'calm';
    if (avgLightness < 0.3) return 'dramatic';
    
    // Check for warm vs cool colors
    const warmColors = colors.filter(color => 
      (color.hue >= 0 && color.hue <= 60) || (color.hue >= 300 && color.hue <= 360)
    );
    
    if (warmColors.length > colors.length / 2) {
      return avgSaturation > 0.5 ? 'warm' : 'neutral';
    } else {
      return 'cool';
    }
  }

  private determineTemperature(colors: ColorData[]): 'warm' | 'cool' | 'neutral' {
    let warmScore = 0;
    let coolScore = 0;

    colors.forEach(color => {
      if ((color.hue >= 0 && color.hue <= 60) || (color.hue >= 300 && color.hue <= 360)) {
        warmScore += color.percentage;
      } else if (color.hue >= 180 && color.hue <= 240) {
        coolScore += color.percentage;
      }
    });

    if (warmScore > coolScore * 1.5) return 'warm';
    if (coolScore > warmScore * 1.5) return 'cool';
    return 'neutral';
  }

  private calculateAverageSaturation(colors: ColorData[]): number {
    return colors.reduce((sum, color) => sum + color.saturation * color.percentage, 0);
  }

  private calculateHarmonyScore(colors: ColorData[]): number {
    // Simple harmony calculation based on color relationships
    let harmonyScore = 0;
    const totalColors = colors.length;

    for (let i = 0; i < totalColors; i++) {
      for (let j = i + 1; j < totalColors; j++) {
        const hueDiff = Math.abs(colors[i].hue - colors[j].hue);
        const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
        
        // Complementary (180°), triadic (120°), or analogous (30°) relationships
        if (Math.abs(normalizedDiff - 180) < 15 || 
            Math.abs(normalizedDiff - 120) < 15 || 
            normalizedDiff < 30) {
          harmonyScore += 0.2;
        }
      }
    }

    return Math.min(harmonyScore + 0.3, 1); // Base score + harmony bonus
  }

  private determineEmotionalImpact(colors: ColorData[], mood: string): string {
    const impacts = {
      energetic: 'Stimulating and invigorating',
      calm: 'Peaceful and soothing',
      warm: 'Cozy and inviting',
      cool: 'Fresh and crisp',
      dramatic: 'Bold and intense',
      neutral: 'Balanced and stable'
    };
    
    return impacts[mood as keyof typeof impacts] || 'Unique and expressive';
  }

  private getFallbackAnalysis(): ColorAnalysis {
    return {
      dominantColors: [
        { hex: '#6366f1', name: 'Indigo', percentage: 0.4, hue: 239, saturation: 0.84, lightness: 0.63 },
        { hex: '#8b5cf6', name: 'Violet', percentage: 0.3, hue: 258, saturation: 0.90, lightness: 0.68 },
        { hex: '#ec4899', name: 'Pink', percentage: 0.3, hue: 330, saturation: 0.81, lightness: 0.60 }
      ],
      mood: 'energetic',
      temperature: 'cool',
      saturation: 0.75,
      harmonyScore: 0.8,
      emotionalImpact: 'Vibrant and dynamic'
    };
  }
}