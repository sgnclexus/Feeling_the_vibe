// Mock data for testing without database
export const mockAnalyses = [
  {
    id: 1,
    filename: 'happy-selfie-1.jpg',
    dominant_emotion: 'happy',
    confidence: 0.92,
    vibe: 'You\'re absolutely glowing with pure joy and infectious positivity! Your radiant smile and bright energy create the perfect atmosphere for upbeat, feel-good music that celebrates life\'s beautiful moments. This playlist captures that wonderful euphoric feeling when everything just feels right.',
    mood_category: 'energetic',
    playlist: JSON.stringify([
      {
        title: "Good 4 U",
        artist: "Olivia Rodrigo",
        reason: "Upbeat energy that perfectly matches your joyful, confident vibe"
      },
      {
        title: "Levitating",
        artist: "Dua Lipa",
        reason: "Feel-good disco vibes that amplify your radiant happiness"
      },
      {
        title: "Blinding Lights",
        artist: "The Weeknd",
        reason: "Energetic and uplifting, just like your glowing expression"
      },
      {
        title: "Can't Stop the Feeling",
        artist: "Justin Timberlake",
        reason: "Pure joy in musical form - exactly what your smile radiates"
      },
      {
        title: "Uptown Funk",
        artist: "Mark Ronson ft. Bruno Mars",
        reason: "Infectious groove that matches your positive energy"
      },
      {
        title: "Happy",
        artist: "Pharrell Williams",
        reason: "The ultimate happiness anthem for your current mood"
      },
      {
        title: "Shake It Off",
        artist: "Taylor Swift",
        reason: "Carefree pop energy that celebrates your joyful spirit"
      },
      {
        title: "Walking on Sunshine",
        artist: "Katrina and the Waves",
        reason: "Classic feel-good vibes that match your radiant energy"
      }
    ]),
    color_analysis: JSON.stringify({
      dominantColors: [
        { hex: '#f59e0b', name: 'Golden Yellow', percentage: 0.35, hue: 45, saturation: 0.91, lightness: 0.59 },
        { hex: '#fb923c', name: 'Orange', percentage: 0.28, hue: 25, saturation: 0.95, lightness: 0.64 },
        { hex: '#fbbf24', name: 'Amber', percentage: 0.22, hue: 48, saturation: 0.95, lightness: 0.57 },
        { hex: '#fde047', name: 'Yellow', percentage: 0.15, hue: 54, saturation: 0.96, lightness: 0.68 }
      ],
      mood: 'energetic',
      temperature: 'warm',
      saturation: 0.85,
      harmonyScore: 0.92,
      emotionalImpact: 'Vibrant and uplifting'
    }),
    preferences: JSON.stringify({
      genres: ['pop', 'indie', 'electronic'],
      artists: [],
      platforms: ['spotify', 'apple'],
      energyLevel: 'high',
      moodInfluence: 'balanced'
    }),
    mood_quiz_data: JSON.stringify({
      selectedColor: 'yellow',
      moodWords: ['excited', 'confident', 'grateful'],
      genres: ['pop', 'indie'],
      activity: 'partying',
      colorPsychology: {
        mood: 'Happy, excited, optimistic',
        psychology: 'uplifting',
        hex: '#f59e0b',
        name: 'Happy Yellow'
      }
    }),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 2,
    filename: 'calm-nature-2.jpg',
    dominant_emotion: 'calm',
    confidence: 0.88,
    vibe: 'You\'re in a beautifully serene state, radiating peaceful energy and inner tranquility. The gentle calmness in your expression suggests a perfect moment for soothing, ambient music that enhances your meditative mood and helps you stay centered in this peaceful space.',
    mood_category: 'calm',
    playlist: JSON.stringify([
      {
        title: "Weightless",
        artist: "Marconi Union",
        reason: "Scientifically designed to reduce anxiety and promote deep relaxation"
      },
      {
        title: "Clair de Lune",
        artist: "Claude Debussy",
        reason: "Peaceful classical beauty that matches your serene state"
      },
      {
        title: "River",
        artist: "Joni Mitchell",
        reason: "Gentle folk for quiet contemplation and inner peace"
      },
      {
        title: "Holocene",
        artist: "Bon Iver",
        reason: "Serene indie folk that complements your tranquil energy"
      },
      {
        title: "Mad About You",
        artist: "Sting",
        reason: "Gentle romantic calm that soothes the soul"
      },
      {
        title: "Breathe",
        artist: "Pink Floyd",
        reason: "Meditative rock that enhances your peaceful mindset"
      }
    ]),
    color_analysis: JSON.stringify({
      dominantColors: [
        { hex: '#10b981', name: 'Emerald Green', percentage: 0.42, hue: 160, saturation: 0.84, lightness: 0.39 },
        { hex: '#06b6d4', name: 'Cyan', percentage: 0.31, hue: 188, saturation: 0.91, lightness: 0.43 },
        { hex: '#3b82f6', name: 'Blue', percentage: 0.18, hue: 217, saturation: 0.91, lightness: 0.59 },
        { hex: '#8b5cf6', name: 'Violet', percentage: 0.09, hue: 258, saturation: 0.90, lightness: 0.68 }
      ],
      mood: 'calm',
      temperature: 'cool',
      saturation: 0.65,
      harmonyScore: 0.89,
      emotionalImpact: 'Peaceful and soothing'
    }),
    preferences: JSON.stringify({
      genres: ['ambient', 'classical', 'indie'],
      artists: [],
      platforms: ['spotify'],
      energyLevel: 'low',
      moodInfluence: 'strong'
    }),
    mood_quiz_data: JSON.stringify({
      selectedColor: 'green',
      moodWords: ['peaceful', 'centered', 'grateful'],
      genres: ['ambient', 'classical'],
      activity: 'relaxing',
      colorPsychology: {
        mood: 'Balanced, peaceful, harmonious',
        psychology: 'calming',
        hex: '#10b981',
        name: 'Balanced Green'
      }
    }),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    id: 3,
    filename: 'melancholy-portrait-3.jpg',
    dominant_emotion: 'sad',
    confidence: 0.85,
    vibe: 'You\'re embracing a beautifully melancholic moment, where deep emotions flow like gentle rain. There\'s something profoundly beautiful about allowing yourself to feel deeply, and this playlist honors that emotional depth with songs that understand and accompany your contemplative journey.',
    mood_category: 'melancholic',
    playlist: JSON.stringify([
      {
        title: "Someone Like You",
        artist: "Adele",
        reason: "Beautiful ballad that honors deep emotional moments"
      },
      {
        title: "Hurt",
        artist: "Johnny Cash",
        reason: "Raw emotion and reflection that resonates with your current state"
      },
      {
        title: "Mad World",
        artist: "Gary Jules",
        reason: "Atmospheric melancholy that understands your feelings"
      },
      {
        title: "The Night We Met",
        artist: "Lord Huron",
        reason: "Nostalgic sadness with beautiful, comforting melody"
      },
      {
        title: "Skinny Love",
        artist: "Bon Iver",
        reason: "Haunting beauty for introspective, emotional moments"
      },
      {
        title: "Black",
        artist: "Pearl Jam",
        reason: "Deep emotional resonance that validates your feelings"
      }
    ]),
    color_analysis: JSON.stringify({
      dominantColors: [
        { hex: '#1e40af', name: 'Deep Blue', percentage: 0.38, hue: 217, saturation: 0.83, lightness: 0.40 },
        { hex: '#6366f1', name: 'Indigo', percentage: 0.29, hue: 239, saturation: 0.84, lightness: 0.63 },
        { hex: '#374151', name: 'Gray Blue', percentage: 0.21, hue: 210, saturation: 0.11, lightness: 0.29 },
        { hex: '#1f2937', name: 'Dark Gray', percentage: 0.12, hue: 210, saturation: 0.29, lightness: 0.18 }
      ],
      mood: 'melancholic',
      temperature: 'cool',
      saturation: 0.45,
      harmonyScore: 0.76,
      emotionalImpact: 'Contemplative and introspective'
    }),
    preferences: JSON.stringify({
      genres: ['indie', 'alternative', 'folk'],
      artists: [],
      platforms: ['spotify', 'apple'],
      energyLevel: 'low',
      moodInfluence: 'strong'
    }),
    mood_quiz_data: JSON.stringify({
      selectedColor: 'blue',
      moodWords: ['reflective', 'nostalgic', 'contemplative'],
      genres: ['indie', 'folk'],
      activity: 'relaxing',
      colorPsychology: {
        mood: 'Calm, introspective, serene',
        psychology: 'soothing',
        hex: '#3b82f6',
        name: 'Calm Blue'
      }
    }),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 4,
    filename: 'energetic-workout-4.jpg',
    dominant_emotion: 'excited',
    confidence: 0.94,
    vibe: 'You\'re absolutely electric with high-energy excitement! Your dynamic presence and intense focus radiate pure motivation and determination. This playlist is designed to fuel your fire with powerful, driving beats that match your incredible energy and push you to achieve greatness.',
    mood_category: 'energetic',
    playlist: JSON.stringify([
      {
        title: "Till I Collapse",
        artist: "Eminem",
        reason: "High-energy motivation that matches your intense determination"
      },
      {
        title: "Stronger",
        artist: "Kanye West",
        reason: "Pump-up anthem that amplifies your powerful energy"
      },
      {
        title: "Eye of the Tiger",
        artist: "Survivor",
        reason: "Classic motivation track for your focused intensity"
      },
      {
        title: "Thunder",
        artist: "Imagine Dragons",
        reason: "Electric energy that matches your dynamic presence"
      },
      {
        title: "Believer",
        artist: "Imagine Dragons",
        reason: "Driving beats that fuel your determination"
      },
      {
        title: "Lose Yourself",
        artist: "Eminem",
        reason: "Ultimate focus and motivation for peak performance"
      },
      {
        title: "Pump It",
        artist: "Black Eyed Peas",
        reason: "High-energy beats that amplify your excitement"
      }
    ]),
    color_analysis: JSON.stringify({
      dominantColors: [
        { hex: '#ef4444', name: 'Red', percentage: 0.41, hue: 0, saturation: 0.91, lightness: 0.59 },
        { hex: '#f97316', name: 'Orange', percentage: 0.33, hue: 25, saturation: 0.95, lightness: 0.54 },
        { hex: '#eab308', name: 'Yellow', percentage: 0.16, hue: 48, saturation: 0.89, lightness: 0.49 },
        { hex: '#dc2626', name: 'Dark Red', percentage: 0.10, hue: 0, saturation: 0.84, lightness: 0.50 }
      ],
      mood: 'energetic',
      temperature: 'warm',
      saturation: 0.92,
      harmonyScore: 0.88,
      emotionalImpact: 'Stimulating and powerful'
    }),
    preferences: JSON.stringify({
      genres: ['hip-hop', 'rock', 'electronic'],
      artists: [],
      platforms: ['spotify'],
      energyLevel: 'high',
      moodInfluence: 'balanced'
    }),
    mood_quiz_data: JSON.stringify({
      selectedColor: 'red',
      moodWords: ['powerful', 'focused', 'determined'],
      genres: ['hip-hop', 'rock'],
      activity: 'gym',
      colorPsychology: {
        mood: 'Energetic, passionate, powerful',
        psychology: 'stimulating',
        hex: '#ef4444',
        name: 'Passionate Red'
      }
    }),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 5,
    filename: 'creative-artistic-5.jpg',
    dominant_emotion: 'surprised',
    confidence: 0.79,
    vibe: 'You\'re radiating creative wonder and artistic inspiration! There\'s a beautiful spark of curiosity and imagination in your expression that calls for music that stimulates creativity and celebrates the magic of artistic discovery. This playlist is crafted to enhance your creative flow.',
    mood_category: 'excited',
    playlist: JSON.stringify([
      {
        title: "Bohemian Rhapsody",
        artist: "Queen",
        reason: "Epic artistic expression that matches your creative energy"
      },
      {
        title: "Imagine",
        artist: "John Lennon",
        reason: "Inspirational creativity that fuels artistic vision"
      },
      {
        title: "Space Oddity",
        artist: "David Bowie",
        reason: "Innovative artistry that celebrates creative exploration"
      },
      {
        title: "Karma Police",
        artist: "Radiohead",
        reason: "Alternative creativity that inspires artistic thinking"
      },
      {
        title: "Midnight City",
        artist: "M83",
        reason: "Atmospheric inspiration for creative moments"
      },
      {
        title: "Time",
        artist: "Pink Floyd",
        reason: "Progressive artistry that enhances creative flow"
      }
    ]),
    color_analysis: JSON.stringify({
      dominantColors: [
        { hex: '#8b5cf6', name: 'Purple', percentage: 0.35, hue: 258, saturation: 0.90, lightness: 0.68 },
        { hex: '#ec4899', name: 'Pink', percentage: 0.28, hue: 330, saturation: 0.81, lightness: 0.60 },
        { hex: '#06b6d4', name: 'Cyan', percentage: 0.22, hue: 188, saturation: 0.91, lightness: 0.43 },
        { hex: '#f59e0b', name: 'Amber', percentage: 0.15, hue: 45, saturation: 0.91, lightness: 0.59 }
      ],
      mood: 'creative',
      temperature: 'cool',
      saturation: 0.88,
      harmonyScore: 0.85,
      emotionalImpact: 'Inspiring and imaginative'
    }),
    preferences: JSON.stringify({
      genres: ['alternative', 'indie', 'electronic'],
      artists: [],
      platforms: ['spotify', 'soundcloud'],
      energyLevel: 'medium',
      moodInfluence: 'balanced'
    }),
    mood_quiz_data: JSON.stringify({
      selectedColor: 'purple',
      moodWords: ['creative', 'inspired', 'curious'],
      genres: ['alternative', 'indie'],
      activity: 'working',
      colorPsychology: {
        mood: 'Creative, mysterious, spiritual',
        psychology: 'inspiring',
        hex: '#8b5cf6',
        name: 'Creative Purple'
      }
    }),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
  }
];

// Generate a unique ID for new analyses
let nextId = mockAnalyses.length + 1;

export function generateMockAnalysisId() {
  return nextId++;
}

// Mock function to simulate saving analysis
export function saveMockAnalysis(data) {
  const newAnalysis = {
    id: generateMockAnalysisId(),
    filename: data.filename,
    dominant_emotion: data.dominantEmotion,
    confidence: data.confidence,
    vibe: data.vibe,
    mood_category: data.moodCategory,
    playlist: JSON.stringify(data.playlist),
    color_analysis: data.colorAnalysis ? JSON.stringify(data.colorAnalysis) : null,
    preferences: data.preferences ? JSON.stringify(data.preferences) : null,
    mood_quiz_data: data.moodQuizData ? JSON.stringify(data.moodQuizData) : null,
    created_at: new Date().toISOString()
  };
  
  mockAnalyses.unshift(newAnalysis); // Add to beginning of array
  return newAnalysis.id;
}

// Mock function to get analysis by ID
export function getMockAnalysis(id) {
  return mockAnalyses.find(analysis => analysis.id === parseInt(id));
}

// Mock function to get recent analyses
export function getRecentMockAnalyses(limit = 10) {
  return mockAnalyses.slice(0, limit);
}