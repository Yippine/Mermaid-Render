# 🚀 Mermaid-Render

> **AI-Powered Interactive Diagram Platform** - Break Mermaid limitations, create cinematic experiences

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.26+-green?style=for-the-badge&logo=javascript)](https://js.cytoscape.org/)
[![AI](https://img.shields.io/badge/AI-Powered-orange?style=for-the-badge&logo=openai)](https://openai.com/)

## ⚡ Core Breakthroughs

| Pain Point              | Solution                          | Impact                     |
| ----------------------- | --------------------------------- | -------------------------- |
| 🚫 Node width limits    | **Adaptive Node System**          | Perfect long label display |
| 🚫 Messy edge routing   | **Smart Routing + ELK Layout**    | Professional aesthetics    |
| 🚫 Static presentations | **Sequence Play + Node Approach** | Cinematic experience       |
| 🚫 Manual creation      | **AI Generation**                 | Instant diagram creation   |

## 🎬 Power Demo

### 🎯 Sequence Play + Node Approach

```
Edges 1→2→3...→N highlight in sequence
↓
Connected nodes automatically approach each other
↓
Camera intelligently tracks, no manual movement needed
```

### 🤖 AI One-Click Generation

```
"I need to show microservices architecture with API Gateway, User Service, Order Service and Database"
↓ 3 seconds later ↓
Complete Mermaid diagram + optimal layout + color scheme
```

### 📤 Instant Sharing

```
Edit complete → One-click share link → Embed anywhere
```

## 🛠️ Tech Stack

**Frontend Arsenal**

```bash
⚡ Next.js 14      # Lightning fast rendering
🎨 Cytoscape.js    # Graph engine supreme
🧠 ELK.js         # German engineering layout art
🎭 Framer Motion  # Hollywood-grade animations
🎯 TypeScript     # Type safety
```

**Backend Firepower**

```bash
🚀 Fastify        # High-performance API
🗄️ PostgreSQL     # Reliable data storage
⚡ Redis          # Lightning cache
🤖 OpenAI API     # AI brain
```

## ⚡ Quick Start

### 🚀 Method 1: Local Development (Recommended)

```bash
# 1. Clone the project
git clone https://github.com/your-username/Mermaid-Render.git
cd Mermaid-Render

# 2. Install dependencies
npm install
cd server && npm install && cd ..

# 3. Start backend (Terminal 1)
cd server && npm run dev

# 4. Start frontend (Terminal 2)
npm run dev

# 5. Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### 🐳 Method 2: Docker Development

```bash
# Start only databases (recommended for development)
npm run docker:dev

# Then start frontend and backend separately (as Method 1)
```

### 🏗️ Method 3: Full Docker Stack

```bash
# Start everything in containers
npm run docker:full

# Stop everything
npm run docker:full:down
```

**See magic happen in 30 seconds** ✨

## 🧪 Available Commands

### Development

```bash
npm run dev              # Start frontend development server
npm run server:dev       # Start backend development server
npm run build           # Build frontend for production
npm run start           # Start production frontend server
```

### Testing & Quality

```bash
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run end-to-end tests
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
```

### Docker Operations

```bash
npm run docker:dev      # Start dev databases only
npm run docker:dev:down # Stop dev databases
npm run docker:full     # Start full application stack
npm run docker:full:down # Stop full application stack
```

## 📂 Project Structure

```
Mermaid-Render/
├── 📁 src/                    # Frontend source code
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities and core logic
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript type definitions
├── 📁 server/                 # Backend source code
│   ├── src/                   # Server source code
│   ├── prisma/                # Database schema & migrations
│   └── tests/                 # Backend tests
├── 📁 config/                 # Configuration files
│   ├── build/                 # Build configs (Next.js, Tailwind, etc.)
│   ├── docker/                # Docker configurations
│   ├── testing/               # Test configurations
│   └── development/           # Dev tools config (ESLint, Prettier)
├── 📁 tests/                  # Frontend tests
│   └── e2e/                   # End-to-end tests
├── 📁 docs/                   # Project documentation
└── 📁 .github/                # GitHub Actions CI/CD
```

## 🔧 API Endpoints

### Health & Status

```bash
GET /health                    # Health check
GET /api/hello                 # Hello World API
GET /api/graphs               # Graph API endpoints
```

## 🎯 Core Features

### 🎮 Interactive Display Modes

- **Sequence Player**: 1→N edge highlighting in order
- **Node Approach**: Automatic node focus when highlighted
- **Camera Flight**: Smooth viewport transitions
- **Region Browse**: Smart focus switching

### 🤖 AI Superpowers

- **Natural Language→Diagram**: Describe needs, get Mermaid instantly
- **Smart Layout Optimization**: AI analyzes optimal arrangements
- **Style Suggestions**: Professional color schemes

### 📊 Rendering Engine

- **Unlimited Node Width**: Say goodbye to text truncation
- **Multi-Layout Engines**: ELK/Dagre/Force-directed
- **Beautiful Edge Routing**: Avoid messy intersections
- **60FPS Animations**: Silky smooth experience

### 🔗 Collaboration & Sharing

- **One-Click Share Links**: Instant shareable URLs
- **Embed Mode**: Easy iframe integration
- **Version Control**: Edit history tracking
- **Real-time Collaboration**: Multi-user editing

## 🎪 Use Cases

| Scenario                     | Impact                                            |
| ---------------------------- | ------------------------------------------------- |
| 📋 **Project Presentations** | Sequence playback guides audience flow            |
| 🏗️ **System Architecture**   | AI generates complex diagrams, one-click beautify |
| 📚 **Educational Demos**     | Interactive step-by-step learning                 |
| 💼 **Client Proposals**      | Professional visuals increase persuasion          |

## 🚀 Why Choose Us?

```diff
- Mermaid Live Editor: Node truncation, layout limitations
- Draw.io: Manual drawing, no programmatic generation
- Graphviz: Command-line tool, steep learning curve
+ Mermaid-Render: AI-driven + Cinematic experience + Instant sharing
```

## 📈 Project Status

```
🚧 Development Phase: MVP Sprint
⏱️ Expected Completion: 3-4 weeks
🎯 Goal: Redefine diagram presentation standards
```

## 💡 Contributing

All forms of contribution welcome!

- 🐛 Bug reports
- 💡 Feature suggestions
- 🔧 Code contributions
- 📖 Documentation improvements

## 📄 License

MIT License - Free to use, commercial-friendly

---

<div align="center">

**⭐ If this project helps you, please give it a star!**

**Let's redefine the future of diagram presentation together** 🚀

</div>
