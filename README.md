# EnergyTune

**Professional Energy & Stress Tracking App**

A React Native + Expo app that helps you understand your energy patterns. Born from my own need to track stress and energy data during coaching, it's been validated through over a year of personal use. Designed for quick daily logging (3 taps) with complete local privacy.

> **Why EnergyTune?** Unlike basic mood trackers, EnergyTune reveals long-term energy patterns across work and personal life, helping busy professionals identify peak productivity windows and eliminate stress triggers before they become chronic burnout cycles.

![Platform Support](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2054-purple)
![License](https://img.shields.io/badge/license-Audit--Only-orange)
![Privacy](https://img.shields.io/badge/privacy-100%25%20Local-green)

## App Preview

<div align="center">
  
### Energy Dashboard
<img src="assets/screenshots/dashboard-showcase.jpeg" width="300" alt="EnergyTune Dashboard - Your daily energy patterns at a glance">

<sub><em>Track your energy patterns with minimalist-style elegance</em></sub>

---

### Complete Experience

<table align="center">
  <tr>
    <td align="center" width="200">
      <img src="assets/screenshots/weekly-trends-showcase.png" width="160" alt="Weekly Overview">
      <br><sub><b>Weekly Trends</b><br>7-day energy patterns</sub>
    </td>
    <td align="center" width="200">
      <img src="assets/screenshots/entry-showcase.png" width="160" alt="Quick Check-in">
      <br><sub><b>3-Tap Entry</b><br>Log in seconds, seamless flow</sub>
    </td>
    <td align="center" width="200">
      <img src="assets/screenshots/trends-showcase.png" width="160" alt="AI Analytics">
      <br><sub><b>Trends</b><br>Your data, explained</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/screenshots/settings1.PNG" width="160" alt="Settings">
      <br><sub><b>Profile</b><br>Import & export, it's your data</sub>
    </td>
    <td align="center">
      <img src="assets/screenshots/smart-insights-showcase.png" width="160" alt="Profile">
      <br><sub><b>Smart Insights</b><br>Correlation analysis between energy and stress</sub>
    </td>
    <td align="center">
      <img src="assets/screenshots/weekly-insights-showcase.png" width="160" alt="Trends">
      <br><sub><b>Weekly Insights</b><br>Comprehensive weekly energy & stress analysis</sub>
    </td>
  </tr>
</table>

</div>

<div align="center">
  <sub><em>Clean, intuitive design that feels native on every platform</em></sub>
</div>

## Key Features

- **Zero Learning Curve**: Intuitive native-style interface
- **Sub-200ms Response**: Optimized performance with haptic feedback
- **Native Mobile**: Built for iOS and Android with React Native
- **Offline-First**: Local storage with AsyncStorage
- **Smart Analytics**: Pattern recognition and actionable insights
- **Native Design**: Human Interface Guidelines compliance
- **Privacy-First**: 100% local AI - your data never leaves your device

## Why I Built This

During a coaching session, I was asked about my stress factors - and realized I had no real data, just vague feelings. So I started tracking them. But focusing only on stress felt draining, so I added energy gains for balance. What started as a simple web app for my own use has been running for over a year now, and the patterns it revealed are super helpful to me.

EnergyTune helps when you notice patterns like crashing every Tuesday afternoon or feeling drained after certain types of meetings, but also when you want to understand what actually energizes you.

**Especially useful if you:**

- Track other health metrics but miss the energy/stress connection
- Want to understand your patterns without sending data to yet another company
- Need something that works offline (no internet dependency)
- Appreciate being able to verify privacy claims through open code
- Prefer tools that respect your time (3 taps, done)

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- iOS Development: macOS with Xcode 14+ installed
- Android Development: Android Studio with Android SDK

### Installation

```bash
# Clone the repository
git clone https://github.com/quarocx/energytune.git
cd energytune

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npx expo start --clear --reset-cache




```

### Production Builds

**iOS IPA:**

```bash
./build-ipa.sh
```

**Android APK:**

```bash
cd android && ./gradlew assembleRelease
```

## Implementation Status

### Completed

- [x] Core Infrastructure: Expo JavaScript setup with clean architecture
- [x] Design System: Native-style colors, typography, spacing (8px grid)
- [x] Data Models: Well-structured data interfaces for DailyEntry, analytics, insights
- [x] Navigation: Tab-based navigation (Dashboard/Entry/Analytics)
- [x] UI Components: Button, Card, Input with haptic feedback
- [x] Rating System: Energy/Stress rating with button-based selection
- [x] Charts: React Native Chart Kit trend visualization
- [x] Analytics: Local AI pattern recognition & insights generation
- [x] Local Storage: AsyncStorage for offline-first data persistence
- [x] Native Features: Notifications, haptics, file system integration
- [x] Smart Insights: Local and lightweight AI pattern recognition
- [x] iOS & Android: Full native builds with Expo SDK 54

### Next Steps

- [ ] Peak Productivity Windows: Identify optimal timing suggestions for important tasks based on historical energy patterns
- [ ] Temporal Pattern Analysis: Analyze how stress and energy sources evolve over time or appear in particular time periods (longitudinal pattern analysis)

## Tech Stack

| Category       | Technology             | Purpose                           |
| -------------- | ---------------------- | --------------------------------- |
| Framework      | React Native + Expo    | Cross-platform development        |
| Language       | JavaScript (ES6+)      | Modern JavaScript development     |
| Charts         | React Native Chart Kit | Data visualization                |
| Navigation     | React Navigation       | Screen routing                    |
| Storage        | AsyncStorage           | Local data persistence            |
| AI/ML          | Custom lightweight AI | Privacy-first pattern recognition |
| Styling        | StyleSheet             | Native-style design system        |

## Architecture

EnergyTune follows a clean, modular architecture with clear separation of concerns.

### System Overview

```mermaid
graph TB
    subgraph UI["UI Layer"]
        Screens[Dashboard<br/>Entry<br/>Analytics<br/>Profile]
        Components[UI Components<br/>Charts<br/>Forms]
    end
    
    subgraph State["State Management"]
        Contexts[Theme Context<br/>Toast Context]
        Hooks[Custom Hooks<br/>useAnalytics<br/>useEntryData]
    end
    
    subgraph Services["Business Logic"]
        Storage[Storage Service]
        Analytics[Analytics Service]
        Patterns[Pattern Service]
        Notifications[Notification Service]
    end
    
    subgraph Data["Data Layer"]
        Local[(AsyncStorage)]
        APIs[Expo APIs<br/>File System<br/>Notifications]
    end
    
    Screens --> Components
    Screens --> Contexts
    Screens --> Hooks
    Hooks --> Storage
    Hooks --> Analytics
    Hooks --> Patterns
    Storage --> Local
    Notifications --> APIs
    Analytics --> Storage
    Patterns --> Storage
```

### Data Flow

```mermaid
graph LR
    User[User Action] --> Screen[Screen]
    Screen --> Hook[Custom Hook]
    Hook --> Service[Service Layer]
    Service --> Storage[(Local Storage)]
    Storage -.-> Service
    Service -.-> Hook
    Hook -.-> Screen
    Screen -.-> User
```

### Feature Modules

```mermaid
graph TB
    App[App Entry] --> Nav[Navigation]
    Nav --> Entry[Entry Module]
    Nav --> Dashboard[Dashboard Module]
    Nav --> Analytics[Analytics Module]
    
    Entry --> Storage[Storage Service]
    Dashboard --> Storage
    Analytics --> Storage
    
    Analytics --> Patterns[Pattern Recognition]
    Dashboard --> Patterns
    
    Storage --> Local[(AsyncStorage)]
    Notifications[Notifications] --> Storage
```

### Architecture Principles

- **Separation of Concerns**: Clear boundaries between UI, state, business logic, and data
- **Unidirectional Data Flow**: Data flows predictably from storage through services to UI
- **Modular Design**: Features are self-contained and loosely coupled
- **Custom Hooks**: Encapsulate complex state logic and side effects
- **Service Layer**: Centralized business logic and external API interactions
- **Offline-First**: AsyncStorage ensures the app works without internet

## Development

### Project Structure

```
EnergyTune/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Main app screens
│   ├── services/        # Business logic & storage
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React context providers
│   ├── config/          # Theme & text configuration
│   └── utils/           # Helper functions
├── assets/              # Images & static resources
├── App.js               # Application entry point
├── build-ipa.sh         # iOS build script
└── package.json         # Dependencies & scripts
```

## Privacy & Transparency

**Why Open Source Code?** We believe privacy claims require proof, not just promises.

- **Audit the Code**: Every line is visible - verify our privacy claims yourself
- **No Hidden Data Collection**: No analytics, tracking, or telemetry
- **100% Local Storage**: Your data never leaves your device
- **No External APIs**: All AI processing happens locally
- **Offline-First**: Works completely without internet connection

_"Trust, but verify" - Ronald Reagan_

## License

This project is licensed under the **Audit-Only License** - see the [LICENSE](LICENSE) file for details.

**The source code is available for:**

- Security and privacy auditing
- Educational purposes
- Transparency verification

**Not permitted:**

- Commercial use or redistribution
- Creating competing applications
- Compilation or deployment

---

<div align="center">
  <sub>Built with ❤️ in Europe</sub>
</div>
