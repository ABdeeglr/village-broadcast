# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 开发状态

**当前开发阶段**: 前后端联调测试
**详细进度**: 见 [doc/DEVELOPMENT.md](./doc/DEVELOPMENT.md)

## Project Overview

This is a React + TypeScript frontend application for village broadcasting, built with Vite. The app is designed for real-time video streaming and communication.

**Key technologies:**
- React 19.2.0 with TypeScript
- Vite 7.2.4 for development and building
- hls.js for HTTP Live Streaming (video playback)
- socket.io-client for real-time WebSocket communication
- Zustand for state management
- react-router-dom for routing

## Commands

The project uses **pnpm** as the package manager.

```bash
# Install dependencies
pnpm install

# Start development server with HMR
pnpm dev

# Build for production (runs TypeScript check then Vite build)
pnpm build

# Run ESLint
pnpm lint

# Preview production build locally
pnpm preview
```

## Architecture

### Entry Points
- **`src/main.tsx`** - Application entry point, creates React root with StrictMode
- **`src/App.tsx`** - Root component (currently minimal)

### TypeScript Configuration
The project uses strict TypeScript with several important settings in `tsconfig.app.json`:
- `strict: true` - All strict type-checking options enabled
- `noUnusedLocals: true` - Errors on unused local variables
- `noUnusedParameters: true` - Errors on unused function parameters
- `jsx: "react-jsx"` - New JSX transform (no need to import React)
- `moduleResolution: "bundler"` - Vite-style module resolution

When adding code, ensure all variables and parameters are used to satisfy the linter.

### ESLint Configuration
Uses modern flat config format in `eslint.config.js` with:
- React Hooks rules
- React Refresh for HMR
- TypeScript ESLint integration

## Dependencies

### Production Dependencies
- **hls.js** (v1.6.15) - For HLS video stream playback
- **socket.io-client** (v4.8.3) - For real-time bidirectional communication

These indicate the app will likely connect to a backend for streaming live video and handling real-time updates.
