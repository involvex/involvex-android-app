# TrendingHub - React Native App Context

## Project Overview

TrendingHub is a React Native mobile app for discovering trending GitHub repositories and npm packages. Built with TypeScript, it features a hacker-inspired dark theme UI and offline-first architecture with SQLite caching.

## Tech Stack

- **React Native**: 0.83.1
- **TypeScript**: 5.8.3
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Zustand
- **Database**: react-native-sqlite-storage
- **UI Components**: Custom components with Hacker theme
- **HTTP**: axios with retry logic
- **Storage**: AsyncStorage for settings
- **Icons**: react-native-vector-icons (MaterialCommunityIcons)
- **Lists**: @shopify/flash-list for performance
- **OAuth**: react-native-app-auth for GitHub authentication

## App Architecture

### Screens

1. **HomeScreen** - Dual tabs for GitHub repos & npm packages with trending lists
2. **SearchScreen** - Search functionality (placeholder)
3. **SubscriptionsScreen** - User subscriptions management (placeholder)
4. **SettingsScreen** - App settings (placeholder)

### Navigation Structure

```
RootNavigator (Stack)
  └─ MainTabNavigator (Bottom Tabs)
      ├─ Home (Trending icon)
      ├─ Search (Magnify icon)
      ├─ Subscriptions (Bell icon)
      └─ Settings (Cog icon)
```

### Data Layer

- **Database Schema** (`src/database/schema.ts`):
  - `trending_cache` - Caches trending data with TTL
  - `subscriptions` - User repository/package subscriptions
  - `user_settings` - App preferences

- **Repositories**:
  - `subscriptionsRepository` - CRUD for subscriptions

- **API Services**:
  - **GitHub API** (`src/api/github/`):
    - `githubClient.ts` - HTTP client with auth
    - `githubService.ts` - Trending repos, search, repo details
  - **npm API** (`src/api/npm/`):
    - `npmClient.ts` - HTTP client
    - `npmService.ts` - Trending packages, search, package details

### State Management

- **authStore** (`src/store/authStore.ts`):
  - OAuth token management
  - Login/logout flows
  - Token persistence with AsyncStorage

- **settingsStore** (`src/store/settingsStore.ts`):
  - User preferences (theme, language, refresh intervals)
  - Settings persistence

### Theme

- **HackerTheme** (`src/theme/colors.ts`):
  - Dark background: #0a0e27
  - Primary green: #00ff41 (Matrix-style)
  - Accent cyan: #00d9ff
  - Custom typography with JetBrains Mono font

### Models

- `GitHubRepository` - GitHub repo data structure
- `NpmPackage` - npm package data structure
- `UserSettings` - User preferences schema

## Key Dependencies

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-navigation/bottom-tabs": "^7.9.0",
  "@react-navigation/native": "^7.1.26",
  "@react-navigation/stack": "^7.6.13",
  "@shopify/flash-list": "^2.2.0",
  "axios": "^1.13.2",
  "axios-retry": "^4.5.0",
  "date-fns": "^4.1.0",
  "immer": "^11.1.3",
  "react-native-app-auth": "^8.1.0",
  "react-native-gesture-handler": "^2.30.0",
  "react-native-keychain": "^10.0.0",
  "react-native-safe-area-context": "^5.6.2",
  "react-native-screens": "^4.19.0",
  "react-native-sqlite-storage": "^6.0.1",
  "react-native-vector-icons": "^10.3.0",
  "zustand": "^5.0.9"
}
```

## App Features

### Implemented

- ✅ App initialization with database setup
- ✅ Navigation structure (Stack + Bottom Tabs)
- ✅ SQLite database with caching
- ✅ Zustand state management
- ✅ GitHub API client with auth
- ✅ npm API client
- ✅ Hacker-themed dark UI
- ✅ HomeScreen structure with dual tabs

### Placeholder (To Be Implemented)

- 🚧 Search functionality
- 🚧 Subscriptions management
- 🚧 Settings UI
- 🚧 Pull-to-refresh
- 🚧 Error handling UI
- 🚧 Loading states

## File Structure

```
src/
├── api/
│   ├── github/
│   │   ├── githubClient.ts
│   │   └── githubService.ts
│   └── npm/
│       ├── npmClient.ts
│       └── npmService.ts
├── database/
│   ├── repositories/
│   │   └── subscriptionsRepository.ts
│   └── schema.ts
├── models/
│   ├── GitHubRepository.ts
│   ├── NpmPackage.ts
│   ├── UserSettings.ts
│   └── index.ts
├── navigation/
│   ├── MainTabNavigator.tsx
│   ├── RootNavigator.tsx
│   └── index.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── SubscriptionsScreen.tsx
│   └── index.ts
├── store/
│   ├── authStore.ts
│   └── settingsStore.ts
└── theme/
    ├── colors.ts
    └── typography.ts
```

## Android Build Issues (Resolved in Fresh Init)

### Previous Issues

The original project had manual ReactAndroid/hermes-engine subproject includes that conflicted with React Native 0.83.1's build system. These issues are resolved by using the official React Native template structure.

### Build Configuration

- **Gradle**: 8.13
- **AGP**: 8.12.0
- **Java**: 17
- **compileSdk**: 36
- **minSdk**: 24
- **targetSdk**: 36
- **NDK**: 27.1.12297006
- **Hermes**: Enabled (recommended for performance)

### Required Patches

The project uses `patch-package` for:

- `react-native-push-notification@8.1.1`
- `react-native-sqlite-storage@6.0.1`
- `react-native-worklets@0.7.1`

Copy the `patches/` directory to the new project and run `npm install` to apply.

## OAuth Configuration

For GitHub authentication, configure in `android/app/build.gradle`:

```gradle
manifestPlaceholders = [appAuthRedirectScheme: 'com.trendinghub']
```

## Migration Steps

### 1. Copy Source Code

```bash
# Copy entire src/ directory
cp -r src/ ../TrendingHub-new/src/

# Copy App.tsx
cp App.tsx ../TrendingHub-new/App.tsx

# Copy theme files if in separate directory
cp -r src/theme/ ../TrendingHub-new/src/theme/
```

### 2. Copy Patches

```bash
cp -r patches/ ../TrendingHub-new/patches/
```

### 3. Install Dependencies

```bash
cd ../TrendingHub-new
npm install --save \
  @react-native-async-storage/async-storage \
  @react-navigation/bottom-tabs \
  @react-navigation/native \
  @react-navigation/stack \
  @shopify/flash-list \
  axios \
  axios-retry \
  date-fns \
  immer \
  react-native-app-auth \
  react-native-fs \
  react-native-gesture-handler \
  react-native-keychain \
  react-native-linear-gradient \
  react-native-safe-area-context \
  react-native-screens \
  react-native-share \
  react-native-sqlite-storage \
  react-native-vector-icons \
  react-native-worklets \
  zustand

npm install --save-dev patch-package postinstall-postinstall
```

### 4. Configure Native Dependencies

```bash
# Link vector icons
npx react-native-asset

# iOS pods (if needed)
cd ios && pod install && cd ..
```

### 5. Update package.json Scripts

Add to scripts section:

```json
{
  "postinstall": "patch-package"
}
```

### 6. Android Manifest

Update `android/app/src/main/AndroidManifest.xml`:

- Add internet permission
- Add OAuth redirect scheme
- Configure app name

### 7. Build and Run

```bash
# Clean and build
npm run android
```

## Environment Variables

Create `.env` file:

```bash
GITHUB_CLIENT_ID=your_github_oauth_app_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret
GITHUB_REDIRECT_URL=com.trendinghub://oauth
```

## Notes

- The app uses a hacker/Matrix-inspired dark theme throughout
- All API calls are cached in SQLite with TTL for offline-first experience
- Navigation uses a combination of Stack (root) and Bottom Tabs (main screens)
- Database initialization happens on app startup before rendering navigation
- Settings and auth state are persisted using AsyncStorage
- GitHub API requires OAuth for higher rate limits

## Next Steps After Fresh Init

1. Copy all source files and patches
2. Install all dependencies
3. Apply patches with `npm install`
4. Link native assets
5. Configure OAuth credentials
6. Test build and run
7. Implement remaining placeholder screens
8. Add error boundaries and loading states
9. Add pull-to-refresh functionality
10. Implement actual search and subscriptions features
