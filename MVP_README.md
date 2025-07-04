# EnergyTune MVP

A simple, beautiful energy and stress tracking app built with React Native and Expo.

## Features

- **Daily Energy Tracking**: Rate your energy levels throughout the day (morning, afternoon, evening)
- **Stress Monitoring**: Track stress levels with intuitive 1-10 scales
- **Source Identification**: Log what gives you energy and what causes stress
- **Visual Trends**: See your patterns over the last 7 days with beautiful charts
- **Apple-Style Design**: Clean, intuitive interface following iOS design principles
- **Offline-First**: All data stored locally with AsyncStorage

## Tech Stack

- **React Native with Expo**: Cross-platform mobile development
- **AsyncStorage**: Local data persistence
- **React Navigation**: Tab-based navigation
- **React Native Chart Kit**: Beautiful data visualizations
- **Expo Haptics**: Tactile feedback for better UX

## Design Principles

- **One-handed operation**: All primary functions accessible with thumb
- **Instant persistence**: No save buttons, everything auto-saves
- **Sub-200ms interactions**: Immediate visual feedback
- **Apple-style animations**: 0.3s transitions with easing
- **8pt grid system**: Consistent spacing throughout
- **Progressive disclosure**: Essential inputs first, optional details expandable

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Open the app in:
   - iOS Simulator (press `i`)
   - Android Emulator (press `a`)
   - Expo Go app on your phone (scan QR code)

## Project Structure

```
src/
├── components/ui/        # Reusable UI components
│   ├── Button.js
│   ├── Input.js
│   └── RatingScale.js
├── screens/             # Main app screens
│   ├── DashboardScreen.js
│   └── EntryScreen.js
├── services/            # Data management
│   └── storage.js
├── config/              # App configuration
│   └── theme.js
└── utils/               # Helper functions
    ├── constants.js
    └── helpers.js
```

## Data Model

Each daily entry contains:

- Energy levels for morning/afternoon/evening (1-10 scale)
- Stress levels for morning/afternoon/evening (1-10 scale)
- Energy sources (text)
- Stress sources (text)
- Optional notes

All data is stored locally and persists between app sessions.

## Future Enhancements

- Supabase backend integration
- Weekly/monthly insights
- Export functionality
- Push notifications for check-ins
- AI-powered pattern recognition
