# Trending Hub - Flutter Android App

A comprehensive Flutter Android application with Appwrite backend integration featuring a distinctive Dark Green "Hacker" themed Material Design UI for tracking trending GitHub repositories and npm packages.

## 🎨 Features

### Core Functionality
- **Trending Display**: Daily, weekly, and monthly trending repositories and packages
- **Dual Platform Support**: Toggle between GitHub and npmjs package views
- **Comprehensive Information**: Stars, forks, description, author, language, license, last updated
- **Subscription Management**: Star repositories and follow packages for updates
- **Advanced Search**: Search with filters for language, stars, and sorting options

### User Experience
- **Dark Hacker Theme**: Signature terminal green color scheme (#00FF41)
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Smooth Navigation**: Bottom navigation with intuitive state management
- **Loading States**: Comprehensive error handling and loading indicators
- **Real-time Updates**: Refresh capabilities and auto-refresh options

### Settings & Customization
- **Discord OAuth2 Integration**: Connect Discord for enhanced synchronization
- **Notification Preferences**: Push notifications, daily digests, weekly summaries
- **Theme Customization**: Dark mode, hacker theme, color schemes
- **Data Management**: Offline mode, cache configuration, data export
- **Advanced Options**: Debug mode, beta features, analytics

## 🏗️ Architecture

### Data Models
- `GitHubRepository`: Complete repository information with trending score calculation
- `NpmPackage`: Package metadata with download stats and dependency info
- `UserSettings`: Comprehensive settings model for all app configurations

### State Management
- Custom `ChangeNotifier`-based state management system
- Provider pattern for dependency injection
- Centralized app state with `AppStateManager`

### UI Components
- **Material Design 3**: Modern Material Design implementation
- **Custom Theme**: Hacker-themed color palette and typography
- **Responsive Cards**: Repository and package display cards
- **Advanced Filters**: Multi-criteria filtering and sorting

## 📁 Project Structure

```
lib/
├── data/models/
│   ├── github_repository.dart    # GitHub repository model
│   ├── npm_package.dart          # NPM package model
│   └── user_settings.dart        # User settings model
├── providers/
│   └── app_providers.dart        # State management
├── theme/
│   └── hacker_theme.dart         # Dark green hacker theme
├── ui/pages/
│   ├── home_page.dart            # Trending repositories/packages
│   ├── subscriptions_page.dart   # Subscribed items
│   ├── search_page.dart          # Advanced search
│   └── settings_page.dart        # Comprehensive settings
└── app.dart                      # Main application
```

## 🎯 Key Components

### Home Page
- Tabbed interface (GitHub vs npmjs)
- Trending timeframe selection
- Repository/package cards with comprehensive info
- Refresh capabilities and auto-refresh

### Subscriptions Page
- Manage starred repositories and packages
- New release notifications
- Add/remove subscriptions
- Export functionality

### Search Page
- Advanced search with filters
- Language and star count filters
- Sort by multiple criteria
- Quick filter chips

### Settings Page
- Discord OAuth2 integration
- Notification preferences
- Theme customization
- Data management options
- Advanced settings

## 🔧 Technical Implementation

### Build Configuration
- **Flutter 3.5.4**: Latest stable Flutter version
- **Android SDK**: Target API 34, minimum API 21
- **Gradle 8.7**: Latest Gradle version for compatibility
- **Kotlin 2.1.0**: Modern Kotlin version
- **NDK 28.2.13676358**: Latest Android NDK

### Dependencies
- `dio`: HTTP client with logging
- `shared_preferences`: Local storage
- `flutter_staggered_animations`: UI animations
- `cached_network_image`: Image caching
- `pull_to_refresh`: Refresh indicators

### Build Fixes Applied
- Updated Gradle wrapper to version 8.7
- Updated Android Gradle Plugin to 8.6.0
- Updated Kotlin version to 2.1.0
- Added core library desugaring for Java 8 compatibility
- Updated NDK version to 28.2.13676358
- Removed problematic notification dependencies

## 🚀 Getting Started

### Prerequisites
- Flutter SDK 3.5.4 or later
- Android Studio / VS Code with Flutter extensions
- Android SDK with API 21+ support

### Installation
1. Clone the repository
2. Run `flutter pub get` to install dependencies
3. Connect an Android device or start an emulator
4. Run `flutter run` to start the app

### Build Commands
```bash
# Development build
flutter run

# Release build
flutter build apk --release

# Clean build
flutter clean && flutter pub get
```

## 🎨 Design System

### Color Palette
- **Primary Green**: #00FF41 (Classic terminal green)
- **Secondary Green**: #39FF14 (Bright accent)
- **Dark Green**: #0A3D0A (Background)
- **Darker Green**: #051A05 (Primary background)
- **Accent Green**: #1AFF66 (Highlights)

### Typography
- **Primary Font**: JetBrains Mono (Monospace)
- **Fallback**: System monospace fonts
- **Styles**: Terminal-style text with appropriate spacing

### UI Elements
- **Cards**: Rounded corners with subtle borders
- **Buttons**: Material Design with green accents
- **Navigation**: Bottom navigation with green highlights
- **Icons**: Material Icons with green coloring

## 📱 Platform Support

- **Android**: Primary target (API 21+)
- **iOS**: Framework prepared (requires additional setup)
- **Web**: Compatible (responsive design)

## 🔮 Future Enhancements

### Real API Integration
- GitHub REST API for repository data
- npm Registry API for package information
- Real-time trending algorithms

### Backend Integration
- Appwrite configuration for user data
- Discord OAuth2 implementation
- Push notification services

### Advanced Features
- Machine learning trending predictions
- Social features and sharing
- Advanced analytics and insights

## 📄 License

This project is developed for demonstration purposes showcasing advanced Flutter development with distinctive UI design and comprehensive feature set.

## 👨‍💻 Development

Built with attention to:
- **Clean Architecture**: Separation of concerns and maintainable code
- **Performance**: Efficient state management and UI rendering
- **Accessibility**: Proper semantic markup and contrast ratios
- **Security**: Secure API key storage and user data protection
- **User Experience**: Intuitive navigation and responsive design

---

*Trending Hub - Where developers discover the next big thing in tech*