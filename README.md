# Feeling the Vibe 🎧

An AI-powered emotional playlist generator that analyzes your photos/videos to create personalized music playlists based on your mood, facial expressions, color psychology, and music preferences.

## Features

- **Multi-Modal Analysis**: Combines facial emotion detection, color psychology, and user preferences
- **Mood & Color Quiz**: Interactive personality assessment for deeper personalization
- **Music Preference Profiling**: Customizable genre and energy preferences
- **Real-time Emotion Detection**: Advanced facial expression analysis using face-api.js
- **Color Psychology**: Visual mood analysis from uploaded images
- **AI-Powered Curation**: Smart playlist generation with detailed song reasoning
- **Beautiful UI**: Modern, responsive design with smooth animations

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **AI/ML**: face-api.js, OpenAI GPT (optional), Custom color analysis
- **Data**: Mock data (no database required for testing)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd feeling-the-vibe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp server/.env.example server/.env
```

4. (Optional) Add your OpenAI API key to `server/.env` for enhanced playlist generation:
```
OPENAI_API_KEY=your-openai-api-key-here
```

### Running the Application

Start both frontend and backend:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend (port 3001)
npm run server

# Frontend (port 5173)
npm run client
```

## How It Works

1. **Mood Quiz** (Optional): Complete color psychology and mood assessment
2. **Music Preferences** (Optional): Set your genre preferences and energy levels  
3. **Upload Media**: Share a photo or video capturing your current vibe
4. **AI Analysis**: Multi-modal analysis of emotions, colors, and context
5. **Playlist Generation**: Receive a personalized playlist with detailed explanations
6. **Explore & Share**: View your complete analysis and share your vibe

## Current Mode: Mock Data

The application is currently running in **test mode** with mock data. This means:

- ✅ All features work without database setup
- ✅ Rich sample data for testing all scenarios
- ✅ No external dependencies required
- ✅ Perfect for development and demonstration

## API Endpoints

- `POST /api/upload` - Upload media files
- `POST /api/analyze-mood` - Analyze emotions and generate playlist
- `GET /api/analysis/:id` - Get specific analysis
- `GET /api/recent-analyses` - Get recent analyses

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── services/           # AI services (emotion detection, color analysis)
│   ├── types.ts           # TypeScript type definitions
│   └── App.tsx            # Main application component
├── server/
│   ├── index.js           # Express server
│   ├── mockData.js        # Mock data for testing
│   └── uploads/           # File upload directory
└── public/                # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.