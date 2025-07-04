# EnergyTune

**Professional Energy & Stress Tracking App**

A React Native + Expo app for tracking energy and stress patterns with Apple-style design excellence. Built for zero learning curve, max 3 taps for daily entry, and sub-200ms response times.

![Platform Support](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2053-purple)

## ✨ Key Features

- **🚀 Zero Learning Curve**: Intuitive Apple-style interface
- **⚡ Sub-200ms Response**: Optimized performance with haptic feedback
- **📱 Cross-Platform**: iOS, Android, and Web support
- **🔄 Offline-First**: Local storage with cloud sync via Supabase
- **📊 Smart Analytics**: Pattern recognition and actionable insights
- **🎨 Apple Design**: Human Interface Guidelines compliance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (or use npx)

### Installation

```bash
# Clone and install
git clone https://github.com/your-username/energytune.git
cd energytune
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npx expo start
```

### Platform Options

- **Web**: Press `w` or visit http://localhost:8081
- **iOS**: Press `i` (requires Xcode)
- **Android**: Press `a` (requires Android Studio)
- **Device**: Scan QR code with Expo Go app

## ✅ Implementation Status

### Completed ✅

- [x] **Core Infrastructure**: Expo TypeScript setup with professional architecture
- [x] **Design System**: Apple-style colors, typography, spacing (8px grid)
- [x] **Data Models**: TypeScript interfaces for DailyEntry, analytics, insights
- [x] **Services**: Supabase integration with offline support & local storage
- [x] **Navigation**: Tab-based navigation (Dashboard/Entry/Trends)
- [x] **UI Components**: Button, Card, Input with haptic feedback
- [x] **Rating System**: Energy/Stress rating with button-based selection
- [x] **Charts**: Victory Native trend visualization
- [x] **Analytics**: Pattern recognition & insights generation
- [x] **Database Schema**: Complete PostgreSQL schema with RLS
- [x] **Web Platform**: React Native Web support

### Next Steps 🔄

- [ ] **Supabase Setup**: Environment configuration and table creation
- [ ] **Data Persistence**: Connect forms to database storage
- [ ] **Authentication**: User registration and login flows

## 🛠️ Tech Stack

| Category       | Technology          | Purpose                              |
| -------------- | ------------------- | ------------------------------------ |
| **Framework**  | React Native + Expo | Cross-platform development           |
| **Language**   | TypeScript          | Type safety and developer experience |
| **Backend**    | Supabase            | PostgreSQL database with auth        |
| **Charts**     | Victory Native      | Data visualization                   |
| **Navigation** | React Navigation    | Screen routing                       |
| **Storage**    | AsyncStorage        | Local data persistence               |
| **Styling**    | StyleSheet          | Apple-style design system            |

## 🔧 Development

### Available Scripts

```bash
# Development
npx expo start              # Start with platform choice
npx expo start --web        # Web-only development
npx expo start --clear      # Clear Metro cache
```

### Environment Variables

```bash
# Required for Supabase integration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

**Status**: MVP Core Completed ✅ | Next: Supabase Integration 🔄

Built with ❤️ for productivity and wellness tracking
