# EnergyTune

**Professional Energy & Stress Tracking App**

A React Native + Expo app that helps you understand your energy patterns. Born from my own need to track stress and energy data during coaching, it's been validated through over a year of personal use. Designed for quick daily logging (3 taps) with complete local privacy.

> **Why EnergyTune?** Unlike basic mood trackers, EnergyTune reveals long-term energy patterns across work and personal life, helping busy professionals identify peak productivity windows and eliminate stress triggers before they become chronic burnout cycles.

![Platform Support](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2054-purple)
![License](https://img.shields.io/badge/license-Audit--Only-orange)
![Privacy](https://img.shields.io/badge/privacy-100%25%20Local-green)

## 📱 App Preview

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

- **🚀 Zero Learning Curve**: Intuitive native-style interface
- **⚡ Sub-200ms Response**: Optimized performance with haptic feedback
- **📱 Native Mobile**: Built for iOS and Android with React Native
- **🔄 Offline-First**: Local storage with AsyncStorage
- **📊 Smart Analytics**: Pattern recognition and actionable insights
- **🎨 Native Design**: Human Interface Guidelines compliance
- **🔒 Privacy-First**: 100% local AI - your data never leaves your device

## 🌱 Why I Built This

During a coaching session, I was asked about my stress factors - and realized I had no real data, just vague feelings. So I started tracking them. But focusing only on stress felt draining, so I added energy gains for balance. What started as a simple web app for my own use has been running for over a year now, and the patterns it revealed are super helpful to me.

EnergyTune helps when you notice patterns like crashing every Tuesday afternoon or feeling drained after certain types of meetings, but also when you want to understand what actually energizes you.

**Especially useful if you:**

- Track other health metrics but miss the energy/stress connection
- Want to understand your patterns without sending data to yet another company
- Need something that works offline (no internet dependency)
- Appreciate being able to verify privacy claims through open code
- Prefer tools that respect your time (3 taps, done)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn**
- **iOS Development**: macOS with Xcode installed
- **Android Development**: Android Studio with Android SDK

### Installation

```bash
# Clone the repository
git clone https://github.com/quarocx/energytune.git
cd energytune

# Install dependencies
npm install
```

### Running the App

EnergyTune uses native modules (notifications, file system, haptics) and requires a **development build** or **physical device build**. Expo Go is not sufficient.

#### Option 1: iOS Development Build (Recommended)

```bash
# Run on iOS simulator or connected device
npx expo run:ios
```

This will:
- Build the native iOS app with all dependencies
- Launch iOS Simulator or install on connected device
- Start Metro bundler automatically

#### Option 2: Android Development Build

```bash
# Run on Android emulator or connected device
npx expo run:android
```

This will:
- Build the native Android app with all dependencies  
- Launch Android Emulator or install on connected device
- Start Metro bundler automatically

#### Option 3: Development Server Only

```bash
# Start Metro bundler
npx expo start

# Then in another terminal, run platform-specific build:
npm run ios     # For iOS
npm run android # For Android
```

**Note:** The app cannot run in Expo Go due to native module dependencies. You must build the native app using the commands above.

### Additional Commands

```bash
# Clear Metro cache (helpful for troubleshooting)
npx expo start --clear

# Clean build (if you encounter issues)
npx expo prebuild --clean
```

## ✅ Implementation Status

### Completed ✅

- [x] **Core Infrastructure**: Expo JavaScript setup with clean architecture
- [x] **Design System**: Native-style colors, typography, spacing (8px grid)
- [x] **Data Models**: Well-structured data interfaces for DailyEntry, analytics, insights
- [x] **Navigation**: Tab-based navigation (Dashboard/Entry/Analytics)
- [x] **UI Components**: Button, Card, Input with haptic feedback
- [x] **Rating System**: Energy/Stress rating with button-based selection
- [x] **Charts**: React Native Chart Kit trend visualization
- [x] **Analytics**: Local AI pattern recognition & insights generation
- [x] **Local Storage**: AsyncStorage for offline-first data persistence
- [x] **Native Features**: Notifications, haptics, file system integration
- [x] **Smart Insights**: Local and lightweight AI pattern recognition
- [x] **iOS & Android**: Full native builds with Expo SDK 54

### Next Steps 🔄

- [ ] **Advanced AI pattern recognition**: Offline data-privacy friendly pattern analysis

## 🛠️ Tech Stack

| Category       | Technology             | Purpose                           |
| -------------- | ---------------------- | --------------------------------- |
| **Framework**  | React Native + Expo    | Cross-platform development        |
| **Language**   | JavaScript (ES6+)      | Modern JavaScript development     |
| **Charts**     | React Native Chart Kit | Data visualization                |
| **Navigation** | React Navigation       | Screen routing                    |
| **Storage**    | AsyncStorage           | Local data persistence            |
| **AI/ML**      | Custom lightweight AI  | Privacy-first pattern recognition |
| **Styling**    | StyleSheet             | Native-style design system        |

## 🏗️ Architecture

EnergyTune follows a clean, modular architecture with clear separation of concerns. Below are three complementary views of the system architecture, each highlighting different aspects:

### 1. Layered Architecture View

**What it shows:** Four-tier structure (Presentation → Application → Business Logic → Data) with vertical data flow and clear separation of concerns. Best for understanding code organization and onboarding new developers.

```mermaid
graph TB
    Title["EnergyTune - Traditional Layered Architecture<br/>Four-tier structure: UI → State → Services → Storage<br/>Shows vertical data flow and separation of concerns"]
    
    subgraph "Presentation Layer"
        A[App.js Entry Point]
        B[Navigation Container]
        C[Bottom Tab Navigator]
        D[Stack Navigator]
        
        subgraph "Screens"
            E[Dashboard Screen]
            F[Entry Screen]
            G[Analytics Screen]
            H[Profile Screen]
            I[Weekly Summary]
        end
        
        subgraph "Components"
            J[UI Components]
            K[Analytics Components]
            L[Entry Components]
            M[Trends Components]
        end
    end
    
    subgraph "Application Layer"
        N[Context Providers]
        O[Theme Context]
        P[Toast Context]
        
        subgraph "Custom Hooks"
            Q[useAnalytics]
            R[useEntryData]
            S[useTrendsData]
            T[usePatternProgress]
        end
    end
    
    subgraph "Business Logic Layer"
        subgraph "Services"
            U[Storage Service]
            V[Notification Service]
            W[Analytics Service]
            X[Pattern Service]
            Y[Weekly Summary Service]
        end
        
        Z[Utils & Helpers]
        AA[Validation Logic]
    end
    
    subgraph "Data Layer"
        AB[(AsyncStorage)]
        AC[Expo APIs]
        AD[Notifications API]
        AE[File System]
    end
    
    Title -.-> A
    
    A --> B
    B --> C
    B --> D
    C --> E
    C --> F
    C --> G
    D --> H
    D --> I
    
    E --> J
    F --> L
    G --> K
    
    E --> O
    E --> P
    F --> Q
    G --> R
    
    Q --> W
    R --> U
    S --> U
    T --> X
    
    U --> AB
    V --> AD
    W --> U
    X --> U
    Y --> U
    
    classDef presentation fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#fff
    classDef application fill:#7b1fa2,stroke:#4a148c,stroke-width:3px,color:#fff
    classDef business fill:#388e3c,stroke:#1b5e20,stroke-width:3px,color:#fff
    classDef data fill:#f57c00,stroke:#e65100,stroke-width:3px,color:#fff
    classDef title fill:#263238,stroke:#000,stroke-width:2px,color:#fff,font-size:16px
    
    class Title title
    class A,B,C,D,E,F,G,H,I,J,K,L,M presentation
    class N,O,P,Q,R,S,T application
    class U,V,W,X,Y,Z,AA business
    class AB,AC,AD,AE data
```

**Color Legend:** 🔵 Presentation Layer | 🟣 Application Layer | 🟢 Business Logic | 🟠 Data Layer

---

### 2. Component Interaction & Data Flow View

**What it shows:** Runtime interactions between UI components, state management, and services. Shows how data flows through the app and how features communicate. Perfect for debugging and understanding feature implementation.

```mermaid
graph LR
    Title["EnergyTune - Component Communication & Data Flow<br/>Shows runtime interactions between UI, state, and services<br/>Traces user actions from screens to storage"]
    
    subgraph "User Interface"
        A[Bottom Tabs Navigator]
        
        subgraph "Dashboard Tab"
            B[Dashboard Screen]
            B1[Today Card]
            B2[Trends Chart]
            B3[Weekly Insights]
        end
        
        subgraph "Entry Tab"
            C[Entry Screen]
            C1[Energy Sliders]
            C2[Stress Sliders]
            C3[Sources Input]
        end
        
        subgraph "Analytics Tab"
            D[Analytics Screen]
            D1[Pattern Analysis]
            D2[Correlations]
            D3[State Views]
        end
        
        E[Profile Modal]
        F[Weekly Summary Modal]
    end
    
    subgraph "State Management"
        G[Theme Context]
        H[Toast Context]
        I[Custom Hooks Layer]
    end
    
    subgraph "Services & Storage"
        J[Storage Service]
        K[Notification Service]
        L[Analytics Service]
        M[Pattern Service]
    end
    
    subgraph "External Systems"
        N[(AsyncStorage)]
        O[Expo Notifications]
        P[File System]
    end
    
    Title -.-> A
    
    A --> B
    A --> C
    A --> D
    
    B --> B1
    B --> B2
    B --> B3
    
    C --> C1
    C --> C2
    C --> C3
    
    D --> D1
    D --> D2
    D --> D3
    
    B -.reads.-> I
    C -.reads/writes.-> I
    D -.reads.-> I
    
    I -.calls.-> J
    I -.calls.-> L
    I -.calls.-> M
    
    C -.triggers.-> H
    
    B & C & D -.uses.-> G
    
    J -.persists.-> N
    K -.schedules.-> O
    J -.exports.-> P
    
    K -.quick fill.-> J
    O -.taps.-> C
    
    E -.configures.-> K
    E -.manages.-> J
    
    classDef ui fill:#0d47a1,stroke:#01579b,stroke-width:4px,color:#fff
    classDef state fill:#6a1b9a,stroke:#4a148c,stroke-width:4px,color:#fff
    classDef service fill:#2e7d32,stroke:#1b5e20,stroke-width:4px,color:#fff
    classDef external fill:#e65100,stroke:#bf360c,stroke-width:4px,color:#fff
    classDef title fill:#263238,stroke:#000,stroke-width:2px,color:#fff,font-size:16px
    
    class Title title
    class A,B,C,D,E,F,B1,B2,B3,C1,C2,C3,D1,D2,D3 ui
    class G,H,I state
    class J,K,L,M service
    class N,O,P external
```

**Connection Types:** Solid lines (→) = Navigation/containment | Dotted lines (-.->)= Data flow/calls

**Color Legend:** 🔵 User Interface | 🟣 State Management | 🟢 Services | 🟠 External Systems

---

### 3. Feature-Centric Module View

**What it shows:** The app organized by user-facing features and business capabilities. Shows feature dependencies and cross-cutting concerns. Ideal for product planning and stakeholder communication.

```mermaid
graph TB
    Title["EnergyTune - Feature Modules & Business Capabilities<br/>Organized by user-facing features and business value<br/>Shows feature dependencies and cross-cutting concerns"]
    
    subgraph "Core Application"
        A[App Entry Point<br/>Error Boundary<br/>Providers]
    end
    
    subgraph "Navigation Module"
        B[React Navigation<br/>Tab + Stack]
        B1[Bottom Tabs]
        B2[Modal Screens]
    end
    
    subgraph "Energy/Stress Tracking"
        C[Entry Module]
        C1[Multi-period Input]
        C2[Sources Tracking]
        C3[Validation]
        
        D[Quick Fill Feature]
        D1[Notification Actions]
        D2[Quick Entry Flags]
    end
    
    subgraph "Data Visualization"
        E[Dashboard Module]
        E1[Today Overview]
        E2[7-Day Trends]
        E3[Weekly Insights]
        
        F[Analytics Module]
        F1[Hierarchical Patterns]
        F2[Energy-Stress Correlation]
        F3[Multiple State Views]
    end
    
    subgraph "Insights & Intelligence"
        G[Pattern Recognition]
        G1[Time-based Patterns]
        G2[Hierarchical Analysis]
        
        H[Weekly Summary]
        H1[Scheduled Reports]
        H2[Trend Detection]
    end
    
    subgraph "Data Management"
        I[Storage Layer]
        I1[CRUD Operations]
        I2[Import/Export]
        I3[Sample Data Gen]
        
        J[Settings & Config]
        J1[Notification Settings]
        J2[Theme Management]
        J3[Data Privacy]
    end
    
    subgraph "Notification System"
        K[Notification Service]
        K1[3-Period Reminders]
        K2[Weekly Summary Push]
        K3[Quick Actions]
    end
    
    subgraph "Infrastructure"
        L[AsyncStorage]
        M[Expo Notifications]
        N[File System APIs]
        O[React Native Charts]
    end
    
    Title -.-> A
    
    A --> B
    B --> B1
    B --> B2
    
    B1 --> C
    B1 --> E
    B1 --> F
    B2 --> J
    B2 --> H
    
    C --> C1 & C2 & C3
    C <--> D
    D --> D1 & D2
    
    E --> E1 & E2 & E3
    F --> F1 & F2 & F3
    
    E & F --> G
    G --> G1 & G2
    
    H --> H1 & H2
    
    C & E & F & H --> I
    I --> I1 & I2 & I3
    
    K --> K1 & K2 & K3
    K --> D
    
    J --> K
    A --> J
    
    I --> L
    K --> M
    I --> N
    E & F --> O
    
    classDef core fill:#c62828,stroke:#b71c1c,stroke-width:4px,color:#fff
    classDef feature fill:#558b2f,stroke:#33691e,stroke-width:4px,color:#fff
    classDef data fill:#0277bd,stroke:#01579b,stroke-width:4px,color:#fff
    classDef infra fill:#f57f17,stroke:#f57f17,stroke-width:4px,color:#000
    classDef title fill:#263238,stroke:#000,stroke-width:2px,color:#fff,font-size:16px
    
    class Title title
    class A,B core
    class C,D,E,F,G,H feature
    class I,J,K data
    class L,M,N,O infra
```

**Color Legend:** 🔴 Core Application | 🟢 Feature Modules | 🔵 Data Management | 🟡 Infrastructure

---

### Architecture Highlights

- **🎯 Separation of Concerns**: Clear boundaries between UI, state, business logic, and data
- **🔄 Unidirectional Data Flow**: Data flows predictably from storage through services to UI
- **🧩 Modular Design**: Features are self-contained and loosely coupled
- **🎣 Custom Hooks**: Encapsulate complex state logic and side effects
- **🔌 Service Layer**: Centralized business logic and external API interactions
- **💾 Offline-First**: AsyncStorage ensures the app works without internet
- **🔔 Cross-Cutting Concerns**: Notifications integrate seamlessly across features

## 🔧 Development


### Development Workflow

1. **First Time Setup**: Run `npm install` and then `npm run ios` or `npm run android`
2. **Daily Development**: Just run `npm run ios` or `npm run android` - it handles everything
3. **If Issues Occur**: Try `npx expo start --clear` or rebuild with `npx expo prebuild --clean`

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
└── package.json         # Dependencies & scripts
```

## 🔒 Privacy & Transparency

**Why Open Source Code?** We believe privacy claims require proof, not just promises.

- **🔍 Audit the Code**: Every line is visible - verify our privacy claims yourself
- **🚫 No Hidden Data Collection**: No analytics, tracking, or telemetry
- **💾 100% Local Storage**: Your data never leaves your device
- **🛡️ No External APIs**: All AI processing happens locally
- **📱 Offline-First**: Works completely without internet connection

_"Trust, but verify" - Ronald Reagan_

## 📄 License

This project is licensed under the **Audit-Only License** - see the [LICENSE](LICENSE) file for details.

**The source code is available for:**

- ✅ Security and privacy auditing
- ✅ Educational purposes
- ✅ Transparency verification

**Not permitted:**

- ❌ Commercial use or redistribution
- ❌ Creating competing applications
- ❌ Compilation or deployment

---

<div align="center">
  <sub>Built with ❤️ in Europe</sub>
</div>
