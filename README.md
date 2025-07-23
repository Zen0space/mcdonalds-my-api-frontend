# 🍟 McDonald's Malaysia Frontend

A modern, responsive web application for finding McDonald's outlets in Malaysia with AI-powered chatbot assistance and interactive mapping capabilities.

![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green)

## 🌟 Features

### 🗺️ Interactive Map
- **Real-time outlet locations** with GPS coordinates
- **5km radius visualization** for intersection analysis
- **Responsive markers** with detailed outlet information
- **Zoom controls** and map interaction
- **Geolocation integration** for finding nearby outlets

### 🤖 AI Chatbot
- **Google Gemini 2.5 Flash** powered assistant
- **Natural language queries** in English and Bahasa Malaysia
- **Location-based search** ("Find McDonald's near KLCC")
- **Operating hours information**
- **Waze navigation links**
- **Multi-session support**

### 🔍 Advanced Search & Filtering
- **Text search** across outlet names and addresses
- **Feature filtering** (24hrs, Drive-Thru, McCafe)
- **Nearby search** with configurable radius
- **Real-time results** with distance calculations

### 📱 Responsive Design
- **Mobile-first approach** with touch-friendly interface
- **Progressive Web App** capabilities
- **Dark/Light mode** support
- **Accessibility features** (WCAG compliant)

## 🚀 Tech Stack

### Frontend
- **[Next.js 15.1.3](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Leaflet](https://leafletjs.com)** - Interactive map library

### Backend Integration
- **REST API** - McDonald's Malaysia API
- **Axios** - HTTP client with interceptors
- **Real-time chat** - WebSocket-ready architecture

### Deployment
- **[Netlify](https://netlify.com)** - Automated deployment and hosting
- **GitHub Actions** - CI/CD pipeline
- **Edge functions** - Serverless API endpoints

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Zen0space/mcdonalds-my-api-frontend.git
   cd mcdonalds-my-api-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://mcdonalds-malaysia-api.onrender.com
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` | ✅ |
| `NODE_ENV` | Environment mode | `development` | ⚠️ |

## 🔗 API Integration

### Backend API
- **Base URL**: `https://mcdonalds-malaysia-api.onrender.com`
- **Documentation**: `/docs` endpoint
- **Health Check**: `/health` endpoint

### Available Endpoints
```bash
# Outlets
GET /api/v1/outlets              # List all outlets
GET /api/v1/outlets/{id}         # Get outlet by ID
GET /api/v1/outlets/nearby       # Find nearby outlets
GET /api/v1/outlets/search       # Search outlets

# Chat
POST /api/v1/chat/session        # Create chat session
POST /api/v1/chat/message        # Send message
GET /api/v1/chat/history/{id}    # Get chat history
DELETE /api/v1/chat/session/{id} # Delete session

# Statistics
GET /api/v1/stats                # Database statistics
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat/             # Chat-related components
│   ├── ApiStatus.tsx     # API health indicator
│   ├── Map.tsx           # Interactive map
│   └── ...               # Other components
├── hooks/                # Custom React hooks
│   ├── useChatSession.ts # Chat functionality
│   └── useGeolocation.ts # Location services
├── services/             # API services
│   ├── api.ts           # Main API configuration
│   ├── chat.ts          # Chat service
│   └── outlets.ts       # Outlets service
├── types/               # TypeScript definitions
├── utils/               # Utility functions
│   ├── apiMonitor.ts    # API monitoring
│   ├── distance.ts      # Geolocation calculations
│   └── testConnection.ts # Connection testing
└── ...
```

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect to GitHub**
   - Login to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Environment variables: `NEXT_PUBLIC_API_URL`

3. **Deploy**
   - Click "Deploy site"
   - Your site will be available at a Netlify URL

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 🧪 Testing & Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:check      # Check linting without fixing
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
npm run type-check      # TypeScript type checking

# Testing
npm run test:connection # Test API connection
```

### API Testing

```bash
# Test API health
curl https://mcdonalds-malaysia-api.onrender.com/health

# Test outlets endpoint
curl https://mcdonalds-malaysia-api.onrender.com/api/v1/outlets?limit=5
```

### Browser Console Utilities

Open browser console and use:

```javascript
// Test API connection
testConnection.quick()

// Run full connection tests
testConnection.full()

// Test specific service
testConnection.service('chat')

// Measure API latency
testConnection.latency(10)
```

## 🐛 Troubleshooting

### Common Issues

1. **ERR_CONNECTION_REFUSED**
   - Check if API URL is correct in `.env.local`
   - Verify backend is running
   - Clear browser cache

2. **Build Failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Map Not Loading**
   - Check browser console for errors
   - Verify Leaflet CSS is loaded
   - Check network requests

4. **Chat Not Working**
   - Backend database might be down (500 errors)
   - Check API status at `/health` endpoint
   - Clear chat session and retry

### Performance Optimization

- **Lazy loading** for map components
- **Image optimization** with Next.js
- **Bundle analysis** with `npm run analyze`
- **Lighthouse** performance audits

## 📝 API Documentation

### Chat API Usage

```javascript
import { chatService } from '@/services/chat'

// Create session
const session = await chatService.createSession()

// Send message
const response = await chatService.sendMessage({
  session_id: session.session_id,
  message: "Find McDonald's near KLCC",
  user_location: { lat: 3.1570, lng: 101.7123 }
})

// Get history
const history = await chatService.getHistory(session.session_id)
```

### Outlets API Usage

```javascript
import { outletService } from '@/services/outlets'

// Get all outlets
const outlets = await outletService.getOutlets()

// Search outlets
const results = await outletService.searchOutlets({
  q: "KLCC",
  limit: 10
})

// Find nearby
const nearby = await outletService.getNearbyOutlets({
  lat: 3.1570,
  lng: 101.7123,
  radius: 2
})
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **McDonald's Malaysia** for outlet data inspiration
- **Google Gemini** for AI chat capabilities
- **Leaflet** for mapping functionality
- **Next.js** team for the amazing framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Zen0space/mcdonalds-my-api-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zen0space/mcdonalds-my-api-frontend/discussions)
- **Email**: [Contact](mailto:your-email@example.com)

---

**Made with ❤️ for the McDonald's Malaysia community**

*Find your nearest McDonald's with ease! 🍟*