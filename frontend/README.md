# DevDriftGuard Frontend

React + TypeScript + IBM Carbon Design System frontend for DevDriftGuard.

## Features

- 🎨 **IBM Carbon Design System** - Professional enterprise UI
- ⚡ **Vite** - Lightning-fast development
- 🔷 **TypeScript** - Type-safe code
- 🤖 **Bob Chat** - Integrated AI assistant
- 📊 **Real-time Scanning** - Live progress updates
- 🎯 **Issue Management** - Browse and fix technical debt

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Backend Connection

The frontend connects to the Node.js backend running on `http://localhost:3000`.

Make sure the backend is running before starting the frontend:

```bash
# In the root directory
npm start
```

## Architecture

```
frontend/
├── src/
│   ├── api/          # API client
│   ├── components/   # React components
│   │   ├── layout/   # TopBar, StatusBar
│   │   ├── sidebar/  # RepoInput, FindingsTree, ScanProgress
│   │   ├── chat/     # BobChat
│   │   └── common/   # Reusable components
│   ├── store/        # Global state management
│   ├── types/        # TypeScript types
│   └── main.tsx      # Entry point
```

## Development

The app will be available at `http://localhost:5173`

All API calls are proxied to `http://localhost:3000/api`