# Involvex App

> A React Native mobile application for discovering trending GitHub repositories and npm packages

[![React Native](https://img.shields.io/badge/React%20Native-0.83.1-blue.svg?style=flat-square)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg?style=flat-square)]()

## 📱 Overview

Involvex App is a mobile application designed for developers to discover and track trending repositories on GitHub and popular npm packages. The app features a sleek "hacker theme" with a Matrix-inspired dark green terminal aesthetic, making it perfect for developers who appreciate a tech-focused design.

## ✨ Key Features

### 🔥 Trending Discovery

- **GitHub Repositories**: Track trending repositories with customizable timeframes (daily, weekly, monthly)
- **npm Packages**: Discover popular npm packages based on quality, popularity, and maintenance scores
- **Real-time Updates**: Auto-refresh functionality with configurable intervals
- **Smart Filtering**: Filter by minimum stars, programming language, and other criteria

### 🎨 User Interface

- **Hacker Theme**: Matrix-inspired dark green terminal aesthetic with neon accents
- **Responsive Design**: Optimized for both Android and iOS devices
- **Compact Views**: Toggle between regular and compact card layouts
- **Language Support**: Visual language indicators with color-coded badges

### ⚙️ Comprehensive Settings

- **8 Settings Sections** with 51 configuration options:
  - Theme customization (Dark Mode, Hacker Theme)
  - Trending preferences and auto-refresh
  - Push notifications and digest settings
  - Display options and card layouts
  - Filter configurations
  - Privacy and analytics settings
  - Data storage and cache management
  - Advanced debugging and beta features

### 📊 Data Management

- **Offline Mode**: Browse cached content without internet connection
- **Smart Caching**: Configurable cache expiry and size limits
- **Data Export**: Export data in JSON, CSV, or TXT formats
- **Subscription Management**: Track and manage your favorite repositories and packages

### 🔔 Notifications

- **Push Notifications**: Get notified about trending content
- **Daily Digests**: Daily summary of trending repositories
- **Weekly Reports**: Weekly trending summaries
- **Release Alerts**: Notifications for new releases from followed repositories

## 🏗️ Architecture

The app follows a clean architecture pattern with clear separation of concerns:

```
src/
├── api/              # API service layers
│   ├── github/       # GitHub API integration
│   ├── npm/          # npm Registry API
│   └── discord/      # Discord integration
├── components/       # Reusable UI components
├── database/         # Local SQLite database
├── models/           # Data models and types
├── navigation/       # React Navigation setup
├── screens/          # Application screens
├── store/            # Zustand state management
├── theme/            # Design system (colors, typography, spacing)
└── utils/            # Utility functions
```

### 🛠️ Tech Stack

- **Framework**: React Native 0.83.1
- **Language**: TypeScript 5.8.3
- **State Management**: Zustand
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Database**: SQLite with react-native-sqlite-storage
- **HTTP Client**: Axios with retry functionality
- **UI Components**: Custom components with FlashList for performance
- **Authentication**: react-native-app-auth
- **Storage**: AsyncStorage and Keychain
- **Notifications**: react-native-push-notification
- **Date Handling**: date-fns
- **State Immutability**: Immer

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd TrendingHubNew
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only)

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Apply patches**
   ```bash
   npm run postinstall
   ```

### Running the App

#### Android

```bash
npm run android
# or
react-native run-android
```

#### iOS

```bash
npm run ios
# or
react-native run-ios
```

#### Start Metro Bundler

```bash
npm start
# or
react-native start
```

## 📱 Available Scripts

- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run start` - Start Metro bundler
- `npm run build:android` - Build Android APK
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - TypeScript type checking
- `npm run test` - Run Jest tests

## 🎨 Theme System

The app features a custom "Hacker Theme" inspired by terminal/Matrix aesthetics:

### Color Palette

- **Primary Green**: `#00FF41` - Classic terminal green
- **Secondary Green**: `#39FF14` - Bright accent green
- **Dark Background**: `#0A3D0A` - Dark card background
- **Darker Background**: `#051A05` - Main app background
- **Text Colors**: Various shades of grey for optimal contrast

### Programming Language Support

The app includes color-coded badges for popular programming languages:

- JavaScript, TypeScript, Python, Java, C++, C, C#
- PHP, Ruby, Go, Rust, Swift, Kotlin, Dart
- Shell, HTML, CSS, Vue, React, Angular
- Docker, YAML, JSON

## 🔧 Configuration

### API Integration

The app integrates with several APIs:

1. **GitHub API** - For repository data and trending information
2. **npm Registry API** - For package information and download statistics
3. **Discord API** - For community integration features

### Database Schema

The app uses SQLite for local data storage with tables for:

- User settings and preferences
- Cached repository and package data
- Subscription management
- Search history

### State Management

Using Zustand for efficient state management with stores for:

- Authentication state
- User settings
- Trending data
- Application UI state

## 📊 Features in Detail

### Trending Dashboard

- Dual-tab interface for GitHub and npm content
- Timeframe selector (daily, weekly, monthly)
- Real-time refresh with pull-to-refresh
- Infinite scrolling with optimized performance

### Search Functionality

- Advanced search with filters
- Language-specific filtering
- Minimum star requirements
- Sort by stars, forks, or date

### Settings Management

- Comprehensive settings with 8 collapsible sections
- Real-time preview of changes
- Settings validation and error handling
- Reset to defaults functionality

### Offline Support

- Smart caching with configurable expiry
- Offline mode toggle
- Cache size management
- Background data synchronization

## 🧪 Testing

The app includes a test suite using Jest:

```bash
npm test
```

Test files are located in the `__tests__/` directory and follow the naming convention `*.test.tsx`.

## 🔒 Security & Privacy

- Secure credential storage using react-native-keychain
- Privacy-focused settings with data sharing controls
- Optional analytics with user consent
- Secure API communication with proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- ESLint configuration for code quality
- Prettier for consistent formatting
- TypeScript for type safety
- Follow existing patterns and conventions

## 📄 License

This project is private and proprietary software owned by Involvex.

## 🐛 Known Issues

- Some npm packages may not have complete metadata
- GitHub API rate limits may affect data refresh frequency
- iOS builds require Xcode 14+ and iOS 11+ deployment target

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**Built with ❤️ by the Involvex Team**

_Empowering developers to stay ahead of the curve with trending technology insights._
