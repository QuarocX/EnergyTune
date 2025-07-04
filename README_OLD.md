# 🔋 EnergyTune

**The only tool that reveals long-term energy and stress patterns across both work and personal contexts**

EnergyTune helps busy professionals eliminate energy-draining lifestyle patterns before they become chronic burnout cycles. Unlike basic mood trackers, it correlates energy levels with productivity and life quality, identifying peak performance windows and stress triggers.

---

## ✨ Why EnergyTune?

**The Problem**: You're crushing it at work but crashing at home. Or vice versa. Remote workers and busy professionals struggle with energy crashes during critical hours and stress from constant context switching between work tasks, personal responsibilities, and life demands.

**The Solution**: EnergyTune is like having a performance coach who understands both your work rhythms and life patterns. Get data-driven insights to optimize your peak productivity hours while maintaining quality personal time and relationships.

## 🎯 Perfect For

- **Remote/hybrid professionals** experiencing afternoon energy crashes
- **Busy parents** juggling work and family responsibilities  
- **Freelancers & consultants** who need to maximize productive hours
- **Anyone** struggling with work-life energy balance

## 🚀 Key Features

### **MVP (Ready to Use)**
- 📊 **Contextual Energy & Stress Rating** - Quick 1-10 scales with smart descriptions
- 🔍 **Energy Sources Tracking** - Identify what actually energizes you
- ⚠️ **Stress Trigger Detection** - Spot patterns before they become problems
- 📈 **7-Day Trend Visualization** - See your patterns at a glance
- 💾 **Instant Data Sync** - Works offline, syncs when online

### **Coming Soon**
- 🧠 **AI-Powered Insights** - "Your energy peaks Tuesday mornings, crashes Thursday evenings"
- 📅 **Schedule Optimization** - Suggestions for both work and personal activities
- 🎯 **Productivity Correlation** - "High energy = 40% better work output"
- 📊 **Advanced Analytics** - Deep pattern recognition and prevention strategies

## 🛠️ Tech Stack

**Frontend**: React Native with Expo (web + mobile from same codebase)
**Database**: Supabase PostgreSQL with real-time sync
**Charts**: Victory Native for cross-platform visualization
**Auth**: Supabase Auth with Google OAuth
**Hosting**: Self-hosted on Uberspace + Expo Application Services

## 🏗️ Project Structure

```
energytune/
├── src/
│   ├── screens/          # Main app screens
│   ├── components/       # Reusable UI components
│   ├── services/         # Database & API operations
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Helper functions
├── assets/              # Images and icons
└── config/              # App configuration
```

## 🎨 Design Philosophy

**Apple-Style Excellence**:
- **Zero learning curve** - Understand immediately, no tutorials needed
- **Maximum 3 taps** to complete daily entry
- **One-handed mobile operation** - All primary functions thumb-accessible
- **Sub-200ms response times** for all interactions
- **Delightful micro-interactions** with smooth animations

## 📊 Data Structure

Energy and stress levels are tracked with rich context:

```json
{
  "energyLevels": {
    "morning": 7,
    "afternoon": 9, 
    "evening": 7
  },
  "stressLevels": {
    "morning": 3,
    "afternoon": 2,
    "evening": 3
  },
  "energySources": "Deep work session, good coffee, team collaboration",
  "stressSources": "Deadline pressure, context switching, household management"
}
```

## 🚀 Getting Started
**NOT CHECKED ON FUNCTIONAILITY!**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/energytune.git
   cd energytune
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

4. **Start development**
   ```bash
   npm start
   ```

## 📱 Usage

1. **Quick Daily Entry** - Rate your energy and stress levels (30 seconds)
2. **Identify Sources** - What energized you? What stressed you?
3. **View Trends** - See your patterns over time
4. **Get Insights** - Discover your peak performance windows
5. **Optimize Life** - Make data-driven lifestyle changes

## 🎯 Roadmap

- [x] **MVP**: Basic energy/stress tracking with trends
- [ ] **Phase 2**: Work/life context correlation
- [ ] **Phase 3**: AI-powered insights and optimization
- [ ] **Phase 4**: Schedule integration and recommendations

## 🤝 Contributing

Currently, you cannot contribute.

## 📄 License

This project is not licensed yet.

---

**Stop letting energy crashes control your life. Start optimizing with EnergyTune.**

[Get Started](#getting-started) -  [View Demo](#) -  [Join Community](#)

