# Involvex Monorepo

[![Android CI](https://github.com/involvex/involvex-android-app/actions/workflows/android.yml/badge.svg)](https://github.com/involvex/involvex-android-app/actions/workflows/android.yml)
[![Deploy Documentation](https://github.com/involvex/involvex-android-app/actions/workflows/docs.yml/badge.svg)](https://github.com/involvex/involvex-android-app/actions/workflows/docs.yml)

**Involvex** is a high-performance, cross-platform ecosystem for discovering and tracking trending GitHub repositories and npm packages. Designed with a minimalist "Hacker" aesthetic, it provides developers with real-time insights into the open-source landscape.

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

## 📱 Android Releases

Draft releases with APK attachments are automatically generated on version tag pushes (e.g., `v0.0.4`). Check the [Releases](https://github.com/involvex/involvex-android-app/releases) page for the latest build.

## 📄 License

MIT © [Involvex](https://github.com/involvex)
