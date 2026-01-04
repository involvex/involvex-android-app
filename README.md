# Involvex Monorepo

[![Android CI](https://github.com/involvex/involvex-android-app/actions/workflows/android.yml/badge.svg)](https://github.com/involvex/involvex-android-app/actions/workflows/android.yml)
[![Deploy Documentation](https://github.com/involvex/involvex-android-app/actions/workflows/docs.yml/badge.svg)](https://github.com/involvex/involvex-android-app/actions/workflows/docs.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-blue)](https://reactnative.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.0%2B-orange)](https://bun.sh)

**Involvex** is a high-performance, cross-platform ecosystem for discovering and tracking trending GitHub repositories and npm packages. Designed with a minimalist "Hacker" aesthetic, it provides developers with real-time insights into the open-source landscape.

## ✨ Latest Features (v0.0.15+)

- 🤖 **Multi-Provider AI Chat** - OpenRouter, Google Gemini, Ollama support
- 🔍 **Advanced SearchScreen** - npm category filters, recently updated packages
- 📱 **InfoCard Preview** - In-app browser with external link support
- ⚙️ **Comprehensive Settings** - 9+ AI configuration options
- 🎨 **HackerTheme** - Matrix-inspired dark green UI

## 🚀 Project Structure

This is a **Bun monorepo** containing the following packages:

- **`packages/app`**: Mobile application built with **React Native** and **Zustand**. Uses SQLite for offline-first tracking.
- **`packages/web`**: Web dashboard built with **Remix** (React 19) deployed on **Cloudflare Pages**.
- **`packages/api`**: Serverless backend built with **Cloudflare Workers** and **Hono**.
- **`packages/database`**: Database schema and migrations for **Cloudflare D1**.
- **`packages/shared`**: Shared TypeScript types, theme definitions, and utilities used across all platforms.

## 🛠 Tech Stack

- **Runtime:** [Bun](https://bun.sh) (Universal)
- **Frontend:** React 19, Remix, React Native
- **Styling:** Custom "HackerTheme" (Matrix-inspired)
- **State Management:** Zustand
- **Infrastructure:** Cloudflare (Pages, Workers, D1)
- **CI/CD:** GitHub Actions (Android APK releases & GitHub Pages docs)

## 🏁 Quick Start

### Prerequisites
- [Bun](https://bun.sh) installed
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-updates/) (for web/api deployment)

### Installation
```bash
bun install
```

### Development
```bash
# Start Web Dashboard
bun run web

# Start API Development Server
bun run api

# Start Android App (requires Emulator/Device)
bun run android
```

### Deployment
```bash
# Deploy API
bun run deploy:api

# Deploy Web Dashboard (Cross-platform)
bun run deploy:web
```

## 📖 Documentation

Official user documentation is available at [involvex.github.io/involvex-android-app](https://involvex.github.io/involvex-android-app/).

## 🔧 Development Setup

### VSCode Integration
- **Debug Configurations**: `🚀 Launch Android App`, `🤖 Debug Android App (React Native Direct)`
- **Tasks**: Available in Command Palette (`Ctrl+Shift+P` → "Run Task")
  - `📱 Build Android Debug` / `🚀 Build Android Release`
  - `🔍 TypeCheck App` / `✨ Format Code (App)`
  - `📦 Install Dependencies`

### Environment Setup
```bash
# Set ANDROID_HOME and JAVA_HOME environment variables
# Windows (PowerShell):
$env:ANDROID_HOME = "C:\Android\sdk"
$env:JAVA_HOME = "C:\Program Files\temurin\jdk-17.0.x"
```

### Common Development Tasks
```bash
# Start metro bundler
bun start

# Debug Android app
bun run android

# Type check entire monorepo
bun run typecheck

# Format and lint
bun run format && bun run lint:fix

# View web changelog
bun run web  # Navigate to /changelog
```

## 📱 Android Releases

Draft releases with APK attachments are automatically generated on version tag pushes (e.g., `v0.0.4`). Check the [Releases](https://github.com/involvex/involvex-android-app/releases) page for the latest build.

## 📊 Status

| Component | Status | Version |
|-----------|--------|---------|
| Mobile App | ✅ Active | 0.0.15+ |
| Web Dashboard | ✅ Active | - |
| API Server | ✅ Active | - |
| Database | ✅ Active | - |
| TypeScript Types | ✅ All Pass | - |

## 🐛 Known Issues & Solutions

- **sqlite-storage warning**: Non-blocking configuration warning - app works correctly
- **gradle hard link warning**: Fixed with gradle property - uses copy instead of hard links
- **ESLint config**: Using flat config format (ESLint v9.x)

See [BUILD_FIXES.md](./BUILD_FIXES.md) for detailed build solutions.

## 📄 License

MIT © [Involvex](https://github.com/involvex)
