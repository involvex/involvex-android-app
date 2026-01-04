# Involvex Development Guide

Complete guide for developing, debugging, and deploying Involvex.

## 📋 Quick Start

### Prerequisites
- **Bun** >= 1.0.0 ([install](https://bun.sh))
- **Node** >= 20
- **Android SDK** (for mobile development)
- **Java 17** (Temurin/Eclipse Adoptium)
- **VSCode** (recommended) with React Native Tools extension

### Initial Setup
```bash
# Install all dependencies
bun install

# Type check all packages
bun run typecheck

# Start development environment
bun run android      # Mobile app
bun run web         # Web dashboard
bun run api         # API server
```

---

## 🎯 VSCode Development Setup

### Debug Configurations
Available in **Run and Debug** (Ctrl+Shift+D):

1. **🚀 Launch Android App** - Full build + install + run
2. **🤖 Debug Android App (React Native Direct)** - Attach to running app
3. **📱 Debug Android (Hermes Engine)** - Hermes-specific debugging
4. **🔍 Debug TypeScript (App Package)** - Run TypeScript compiler
5. **📦 Debug NPM Package** - Monorepo typecheck
6. **🎯 Full Android Debug Stack** - Compound: Launch + Direct attach

### Build Tasks
Available in **Command Palette** (Ctrl+Shift+P → "Run Task"):

| Task | Purpose |
|------|---------|
| `📱 Build Android Debug` | Build debug APK |
| `🚀 Build Android Release` | Build release APK |
| `🔍 TypeCheck App` | Check app package types |
| `🔍 TypeCheck All` | Check all packages |
| `✨ Format Code (App)` | Format with Prettier |
| `📋 Lint App` | Run ESLint |
| `🔧 Gradle Clean` | Clean gradle cache |
| `📦 Install Dependencies` | Run bun install |
| `🌐 Start Web Dev` | Dev server (port 5173) |
| `🔌 Start API Dev` | Dev server (port 8787) |

### Editor Settings
The `.vscode/settings.json` includes:
- Auto-format on save (Prettier)
- ESLint auto-fix on save
- Bracket pair colorization (HackerTheme colors)
- File watcher exclusions (gradle, node_modules, build)
- TypeScript workspace configuration

---

## 🏗️ Project Architecture

### Monorepo Structure
```
packages/
├── app/                React Native mobile (0.83.1)
│   ├── src/
│   │   ├── screens/    Home, Search, Settings, Subscriptions
│   │   ├── components/ UI components, modals, cards
│   │   ├── store/      Zustand state management
│   │   ├── api/        GitHub, npm, AI service clients
│   │   ├── models/     TypeScript data models
│   │   ├── database/   SQLite schema and repositories
│   │   ├── utils/      Helpers, secure storage, theme
│   │   └── theme/      HackerTheme colors & typography
│   ├── android/        Android native configuration
│   └── package.json    App dependencies & scripts
│
├── web/                Remix web dashboard
│   ├── app/
│   │   ├── routes/     Page routes (changelog, dashboard, etc.)
│   │   ├── types/      TypeScript definitions
│   │   └── components/ Reusable components
│   ├── public/         Static assets
│   ├── functions/      Cloudflare Pages handlers
│   └── deploy.sh       Build & deploy script
│
├── api/                Cloudflare Workers
│   ├── src/
│   │   └── index.ts    API handlers
│   └── wrangler.toml   Worker configuration
│
├── database/           Cloudflare D1
│   ├── schema.sql      Database schema
│   └── migrations/     Migration scripts
│
└── shared/             Shared exports
    ├── theme/          HackerTheme
    └── types/          Common TypeScript types
```

---

## 🔄 Development Workflow

### Mobile App Development

#### 1. Start Metro Bundler
```bash
cd packages/app
bun start
```

#### 2. Run on Device/Emulator
```bash
# In another terminal
bun run android
```

#### 3. Debug in VSCode
- Open **Run and Debug** (Ctrl+Shift+D)
- Select **🚀 Launch Android App** or **🤖 Debug Android App (React Native Direct)**
- Set breakpoints and step through code

#### 4. Make Changes
- Edit code in `packages/app/src/`
- Metro bundler automatically reloads (hot reload)
- Check TypeScript: `bun run typecheck`

### Web Dashboard Development

#### 1. Start Development Server
```bash
bun run web
```
Server runs on `http://localhost:5173`

#### 2. Make Changes
- Edit files in `packages/web/app/`
- Vite automatically refreshes browser
- TypeScript check: `bun run typecheck`

#### 3. Build for Production
```bash
bun run build:web
```

### API Development

#### 1. Start Development Server
```bash
bun run api
```
Server runs on `http://localhost:8787`

#### 2. Configure Database
```bash
# Create database (first time)
bun run db:create

# Copy database_id to wrangler.toml files

# Run migrations
bun run db:migrate
```

---

## 📱 Recent Features (v0.0.15)

### Mobile App

#### OpenRouter AI Provider ✨
- **File**: `packages/app/src/api/ai/aiClient.ts`
- **Models**: Claude 3.5 Sonnet, GPT-4 Turbo, Llama 2
- **Settings**: Settings → 🤖 AI Assistant → OpenRouter
- **Storage**: Secure keychain storage for API keys

#### SearchScreen Enhancements 🔍
- **Categories**: 12 npm package categories with auto-search
- **Recently Updated**: Horizontal scroll section showing latest packages
- **UI**: Improved spacing, styling, and visual hierarchy
- **File**: `packages/app/src/screens/SearchScreen.tsx`

#### InfoCard Modal 📱
- **Preview Mode**: Stats, description, action buttons
- **WebView Mode**: Optional in-app browser
- **Settings**: Enable/disable in Settings
- **Files**: `packages/app/src/store/InfoCard.ts`, `packages/app/src/components/InfoCard/InfoCardModal.tsx`

#### Settings Improvements ⚙️
- **AI Section**: 9+ configuration options
- **OpenRouter**: API key + model selector
- **Secure Storage**: All API keys in device keychain
- **File**: `packages/app/src/screens/SettingsScreen.tsx`

### Web Dashboard

#### Changelog Page 📝
- **Route**: `/changelog`
- **Features**: Version history, highlights, changes, technical details
- **File**: `packages/web/app/routes/changelog.tsx`
- **Types**: `packages/web/app/types/changelog.ts`
- **Styling**: HackerTheme colors, responsive design

---

## 🧪 Testing & Validation

### Type Checking
```bash
# Check all packages
bun run typecheck

# Check specific package
cd packages/app && bun run typecheck
```

### Formatting & Linting
```bash
# Format code
bun run format

# Lint code
cd packages/app && bun run lint

# Auto-fix
cd packages/app && bun run lint:fix
```

### Build Validation
```bash
# Build mobile app
cd packages/app && bun run build:android

# Build mobile release
bun run release:android

# Build web
bun run build:web
```

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Reset cache and restart
bun run gradle:clean
bun start --reset-cache
```

### Android Build Issues
```bash
# Clean gradle
cd packages/app && bun run gradle:clean

# Rebuild
bun run android
```

### Type Errors
```bash
# Check for issues
bun run typecheck

# Fix auto-fixable issues
cd packages/app && bun run lint:fix
```

### Hard Link Warnings (Windows)
- **Fixed**: `android.disablePreferentialLibraryBuilding=true` in gradle.properties
- **Effect**: Uses file copy instead of hard links (no performance impact)

---

## 📦 Monorepo Commands Reference

### Development
| Command | Purpose |
|---------|---------|
| `bun install` | Install all dependencies |
| `bun start` | Start Metro bundler |
| `bun run web` | Start web dev server |
| `bun run api` | Start API dev server |
| `bun run android` | Run app on device/emulator |

### Building
| Command | Purpose |
|---------|---------|
| `bun run build:web` | Build web app |
| `bun run build:android` | Build Android debug |
| `bun run release:android` | Build Android release |

### Quality
| Command | Purpose |
|---------|---------|
| `bun run typecheck` | Type check all packages |
| `bun run format` | Format code with Prettier |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Auto-fix linting issues |

### Deployment
| Command | Purpose |
|---------|---------|
| `bun run deploy:web` | Deploy to Cloudflare Pages |
| `bun run deploy:api` | Deploy to Cloudflare Workers |
| `bun run db:migrate` | Run database migrations |

---

## 🚀 Deployment Checklist

- [ ] All `bun run typecheck` pass
- [ ] Tested on Android emulator
- [ ] Tested on iOS (if applicable)
- [ ] Web dashboard loads correctly
- [ ] API endpoints respond properly
- [ ] Database migrations applied
- [ ] Environment secrets configured
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Git tag created (`v0.0.X`)

---

## 📚 Additional Resources

- **Official Docs**: [involvex.github.io/involvex-android-app](https://involvex.github.io/involvex-android-app/)
- **Changelog**: [/changelog](/changelog)
- **Build Fixes**: [BUILD_FIXES.md](./BUILD_FIXES.md)
- **Project Guide**: [CLAUDE.md](./CLAUDE.md)

---

## 🤝 Contributing

1. Create a new branch from `main`
2. Make changes and test locally
3. Run `bun run typecheck` to verify types
4. Create a pull request with detailed description
5. After merge, create a release tag to trigger CI/CD

---

## 📝 Notes

- The monorepo uses Bun workspaces with `workspace:*` protocol
- All packages share types from `packages/shared`
- Mobile app uses SQLite for offline-first caching
- Web dashboard uses Remix Server Components
- API uses Cloudflare Workers with D1 database
- HackerTheme colors: `#0a0e27` (dark), `#00ff41` (green), `#00d9ff` (cyan)
