# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Involvex** is a cross-platform application for discovering and tracking trending GitHub repositories and npm packages. It consists of:
- **Mobile App** (`packages/app`): React Native with Zustand state management and SQLite database
- **Web Platform** (`packages/web`): Remix SSR on Cloudflare Pages
- **API** (`packages/api`): Cloudflare Workers serverless functions
- **Database** (`packages/database`): Cloudflare D1 (SQLite) schema and migrations
- **Shared** (`packages/shared`): Common theme, types, and utilities used across packages

This is a Bun monorepo using workspace protocol (`workspace:*` dependencies).

## Tech Stack & Versions

- **Runtime**: Bun >= 1.0.0, Node >= 20
- **React Native**: 0.83.1 (mobile app)
- **React**: 19.2.3 (web - use React 19 types: `@types/react@^19.0.0`)
- **Remix**: 2.15+ (web framework)
- **TypeScript**: 5.8.3
- **Cloudflare Stack**: Workers, Pages, D1 (SQLite)
- **State Management**: Zustand
- **Build Tools**: Vite (web), Metro (mobile)
- **Package Manager**: Bun (primary), npm/yarn compatible

## Monorepo Structure

```
packages/
├── app/           React Native mobile app (iOS/Android)
├── web/           Remix SSR landing page + dashboard on Cloudflare Pages
├── api/           Cloudflare Workers API endpoints
├── database/      D1 database schema and migrations
└── shared/        Theme colors, TypeScript types, shared utilities
```

Each package has its own `package.json`, `wrangler.toml` (for Cloudflare packages), and build configuration.

## Common Commands

### Monorepo-level Commands (from root)

```bash
# Development servers (run in parallel)
bun run web          # Remix dev server on :5173
bun run api          # Workers dev server on :8787
bun run android      # React Native android
bun run ios          # React Native iOS

# Building
bun run build:web    # Remix build for Cloudflare Pages
bun run build:api    # (Note: API uses deploy, not build)

# Type checking and linting
bun run typecheck    # TypeScript check (app, api, shared)
bun run lint         # ESLint (app, api)
bun run lint:fix     # ESLint auto-fix

# Formatting
bun run format       # Prettier (app, web)

# Database setup (run these once after cloning)
bun run db:create    # Create D1 database in Cloudflare (outputs database_id)
bun run db:migrate   # Run migrations against Cloudflare D1
```

### Deployment

```bash
# Deploy all services
bun run deploy:api   # Deploy API to Cloudflare Workers
bun run deploy:web   # Deploy web to Cloudflare Pages (includes deploy.sh script)
bun run deploy:db    # Deploy database migrations

# Note: Web deployment runs packages/web/deploy.sh which:
# 1. Builds Remix app
# 2. Copies functions/[[path]].js to build/client/functions
# 3. Deploys to Cloudflare Pages with wrangler pages deploy
```

### Package-specific Commands

Go to individual package directories and run their scripts:
```bash
cd packages/app && bun run android
cd packages/web && bun run dev
cd packages/api && bun run deploy
```

## Critical Setup Steps

### First-time Setup

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Create D1 database** (Cloudflare account required)
   ```bash
   bun run db:create
   ```
   Copy the `database_id` from output and update:
   - `packages/database/wrangler.toml` line 7
   - `packages/api/wrangler.toml` line 8

3. **Run migrations**
   ```bash
   bun run db:migrate
   ```

4. **Set API secrets** (for OAuth)
   ```bash
   cd packages/api
   wrangler secret put GITHUB_CLIENT_ID
   wrangler secret put GITHUB_CLIENT_SECRET
   ```

### Cloudflare Prerequisites

- Must be logged in: `wrangler login`
- D1 database created with ID populated in `wrangler.toml` files
- GitHub OAuth secrets configured for API authentication

## Known Issues & Solutions

### CSS Not Loading in Web Deployment
- **Symptom**: Deployed web app at Pages URL returns 404 for CSS
- **Root Cause**: Incorrect deployment structure or missing Remix SSR handler
- **Fix**: Ensure `packages/web/deploy.sh` copies functions to `build/client/functions/` and deploy path includes both assets and functions

### React Type Mismatch Errors
- **Issue**: React 19.2.3 runtime with React 18 type definitions causes Outlet type errors
- **Solution**: Use `@types/react@^19.0.0` and `@types/react-dom@^19.0.0` in web package.json devDependencies
- **Note**: When upgrading React, always upgrade type definitions simultaneously

### CSS Import in Web App
- Use relative paths for CSS: `import stylesheet from "./styles/global.css?url";`
- Avoid path aliases (`~/`) in Vite bundled CSS imports
- Vite marks CSS modules as external by default - remove from rollupOptions if causing issues

### Cloudflare Pages Functions Path
- For Remix SSR on Pages, functions handler must be at: `build/client/functions/[[path]].js`
- Import path relative to deployed directory: `import * as build from '../../server';`
- The deploy script handles copying this automatically

### Gradle Hard Link Warnings (Windows)
- **Issue**: Hard link failures when gradle cache is on different drive (C: vs D:)
- **Solution**: Added `android.disablePreferentialLibraryBuilding=true` to gradle.properties
- **Effect**: Uses slower copy instead of hard links (no performance impact)

### React Native SQLite Storage Configuration
- **Issue**: `react-native-sqlite-storage` contains invalid iOS configuration
- **Impact**: Non-blocking warning during build - app functions correctly
- **Status**: Waiting on package maintainers for update

## Architecture Notes

### Shared Package
The `packages/shared` package exports:
- `HackerTheme` - Colors, typography, spacing (Matrix-style dark green aesthetic)
- TypeScript type definitions used across packages
- Utility functions

Import from shared: `import { HackerTheme } from '@involvex/shared'`

### Database Schema
Tables in D1 match React Native SQLite schema:
- `subscriptions` - User follows for repos/packages
- `releases` - Release notifications
- `notifications` - Push notification queue
- `cache` - API response caching with TTL

### Web Deployment to Pages
- **Framework**: Remix with Vite
- **Handler**: Cloudflare Pages Functions (`functions/[[path]].js`)
- **Build Output**: `build/client` (static assets) + `build/server` (compiled handler)
- **Deployment**: `wrangler pages deploy build/client --project-name=app`
- **Live URL**: Check `wrangler.toml` for project name

### API Deployment to Workers
- **Framework**: Hono or Itty Router on Workers runtime
- **Database**: D1 binding via `wrangler.toml`
- **Environment**: Secrets stored in Cloudflare dashboard
- **Deployment**: `wrangler deploy`
- **Live URL**: Check Cloudflare Workers dashboard for route

## Environment Files

- `.env` - Git committed (contains GitHub OAuth test credentials) - **Consider moving to .gitignore**
- `packages/app/.env` - Git committed
- `packages/web/assets/` - CSS and other static assets
- `.wrangler/` - Ignored (local dev state)

## Git Workflow

- **Current Branch**: `monorepo-migration` (development)
- **Main Branch**: `main` (production) - merge when ready to deploy

Commands to merge to production:
```bash
git checkout main
git merge monorepo-migration
git push origin main
```

## Debugging & Development

### Enable Verbose Logging
- Workers: `wrangler tail` in one terminal, `wrangler dev` in another
- Web: Dev server logs show Vite and Remix build info
- Mobile: Use React Native Debugger or native dev tools

### Local Database Testing
```bash
cd packages/database
wrangler d1 execute involvex-production --command "SELECT * FROM subscriptions LIMIT 1"
```

### Type Checking
```bash
bun run typecheck  # Check all packages
cd packages/web && bun run typecheck  # Just web
```

## Performance Considerations

- **Mobile**: Uses FlashList for 100k+ item lists, SQLite for offline caching
- **Web**: Remix Server Components for code splitting, CSS?url imports for asset handling
- **API**: D1 database with connection pooling, should paginate large result sets
- **Build Size**: Tree-shake unused code, avoid polyfills in web package

## Security Notes

- GitHub OAuth credentials in `.env` are test app - rotate before production
- API secrets stored securely in Cloudflare dashboard, not in code
- Database ID is non-sensitive (read-only without auth)
- `.wrangler/` folder contains local Cloudflare session tokens - never commit

## File Patterns to Know

- `*.tsx` - React components (web, mobile)
- `wrangler.toml` - Cloudflare service configuration
- `vite.config.ts` - Web build configuration
- `metro.config.js` - Mobile bundler configuration
- `eslint.config.ts` - Linting rules (flat config format)
- `tsconfig.json` - TypeScript configuration (inherits from shared if present)

## Testing

No test framework is currently configured at the monorepo level. Individual packages may have Jest setup (mobile).

## Important: Workspace Protocol

Dependencies use `workspace:*` to reference local packages:
```json
{
  "@involvex/shared": "workspace:*"
}
```

When adding new packages, use `workspace:*` for internal dependencies and run `bun install` to resolve.

## Recent Implementation Status (v0.0.15)

### ✅ Completed Features

#### Mobile App (packages/app)
1. **OpenRouter AI Provider**
   - Complete client implementation with OpenAI-compatible API
   - Settings UI with API key storage
   - Model selector (Claude 3.5 Sonnet, GPT-4, Llama 2)
   - Integrated with Zustand store

2. **SearchScreen Enhancements**
   - UI improvements: better spacing, styling, borders
   - npm category filters (12 categories: Frontend, Backend, CLI, etc.)
   - Recently Updated Packages section with horizontal scroll
   - Auto-search on category selection

3. **InfoCard Modal**
   - Two-mode interface: Preview + optional WebView
   - External browser + in-app browser options
   - Share functionality
   - Settings toggle to enable/disable

4. **Settings Screen**
   - OpenRouter API key configuration
   - Model selection for each provider
   - Secure storage using device keychain
   - 9+ total AI configuration options

### 📝 Files Modified (v0.0.15)
- `packages/app/src/api/ai/aiClient.ts` - OpenRouter client
- `packages/app/src/api/npm/npmService.ts` - getRecentlyUpdated()
- `packages/app/src/screens/SearchScreen.tsx` - UI + filters + categories
- `packages/app/src/screens/SettingsScreen.tsx` - OpenRouter settings
- `packages/app/src/utils/secureStorage.ts` - OPENROUTER_API_KEY
- `packages/app/android/gradle.properties` - Hard link fix
- `.vscode/launch.json` - Enhanced debug configs
- `.vscode/tasks.json` - Build tasks (NEW)
- `.vscode/settings.json` - Development settings

## Deployment Checklist

Before deploying to production:
- [x] All `bun run typecheck` pass ✅
- [ ] All `bun run lint` pass (requires ESLint config)
- [ ] Tested on Android emulator/device
- [ ] CSS assets load correctly in Pages deployment
- [ ] Database migrations applied
- [ ] GitHub OAuth secrets configured in Workers
- [ ] OpenRouter API keys configured in mobile app
- [ ] Environmental differences between branches understood
