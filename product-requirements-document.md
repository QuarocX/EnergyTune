# **EnergyTune - Product Requirements Document**

## **Short-Description**

EnergyTune helps busy professionals and occupied individuals optimize energy patterns across work and personal life. Unlike basic mood trackers, it correlates energy levels with productivity and life quality, identifying peak performance windows and stress triggers to prevent burnout cycles.

## **Two sentences description**

EnergyTune is the only tool that reveals long-term energy and stress patterns across both work and personal contexts, helping busy professionals and occupied individuals eliminate energy-draining lifestyle patterns before they become chronic burnout cycles. The app provides data-driven insights to optimize your peak productivity hours while maintaining quality personal time and relationships.

## **Vision & Problem**

**Problem**: Remote workers, hybrid professionals, and busy individuals struggle with **energy crashes during critical work hours and personal activities** and **stress accumulation from constant transitions** between work tasks, personal responsibilities, and life contexts. Existing wellness apps focus on general mood tracking but miss the specific **energy optimization that directly impacts both productivity and life satisfaction**.

**Unique Value**: Unlike generic mood trackers, this tool specifically correlates energy patterns with both **work performance windows and personal life quality**, helping users identify their **peak productivity hours, optimal personal activity timing**, and **stress triggers from work-life transitions** (home/office, meetings/family time, deep work/household tasks, social events/recovery periods).

**Solution**: Comprehensive energy optimization tool that helps professionals and individuals maximize their productive hours while maintaining personal well-being and preventing energy crashes that affect both career performance and personal relationships.

**Emotion**: Personal mastery - like having a performance coach who understands both your work rhythms and life patterns.

## **Target User**

**Primary**: Remote/hybrid knowledge workers and busy professionals (28-38) in tech, consulting, marketing who:

- Experience afternoon energy crashes affecting work quality and evening family time
- Struggle with stress from constant context switching (calls, emails, deep work, household management, social obligations)
- Have flexible schedules but don't optimize them based on energy patterns
- Earn 60k+ (can invest in productivity and wellness tools)
- Use productivity apps but lack energy-specific insights for both work and personal life
- Want to prevent energy crashes that affect relationships, parenting, and personal goals

**Secondary**: Freelancers, consultants, parents, and caregivers who need to maximize both productive hours and quality personal time

## **Value Proposition**

**For remote professionals and busy individuals who struggle with inconsistent energy and recurring stress patterns,** EnergyTune is **the only tool that reveals long-term life patterns across both work and personal contexts,** unlike productivity apps that focus on short-term optimization or wellness apps that ignore work-life interconnections. **We help you identify energy-draining patterns in your entire lifestyle and eliminate stress triggers before they become chronic,** so you can **build sustainable energy management habits and prevent burnout cycles that cost months of recovery time.**

**Key Benefits**:

- **Lifestyle ROI**: Eliminate 2-3 major energy drains that compound over months/years
- **Pattern Recognition**: Spot stress accumulation trends before they impact health/relationships
- **Holistic Optimization**: Understand how work stress affects personal life and vice versa
- **Burnout Prevention**: Data-driven early warning system worth thousands in avoided health costs
- **Personal Life Quality**: Identify energy crashes that affect parenting, relationships, hobbies, and self-care

## **Design System**

**Colors**: Blue (#007AFF) for energy, Orange (#FF9500) for stress, Gray (#F2F2F7) backgrounds
**Typography**: System fonts (SF Pro on Apple, Segoe UI on Windows) with clear hierarchy (28pt/17pt/13pt)
**Interactions**: 0.3s transitions, immediate feedback, mobile-optimized gestures
**Layout**: Progressive disclosure - essential inputs first, optional details expandable

## **Technical Stack**

- **Frontend**: **React Native with Expo** (web + mobile from same codebase)
- **Language**: **JavaScript (ES6+)** with clean modular architecture
- **Web Deployment**: **Expo Web** (React Native for web)
- **Mobile**: **Expo managed workflow** (easy native app deployment)
- **Charts**: **React Native Chart Kit** (cross-platform data visualization)
- **Storage**: **AsyncStorage** (local offline-first data persistence)
- **AI/ML**: **Custom lightweight AI** with local pattern recognition

## **Authentication Strategy**

**Current Implementation (Local-First)**:

- **AsyncStorage local persistence** (no authentication required)
- **Privacy-first approach** - all data stays on device
- **Offline-only operation** with full functionality

## **Improved Rating System**

**Energy Scale (1-10) with Context**:

- **1-2**: "Exhausted - Need rest, can't focus"
- **3-4**: "Low - Basic tasks only, avoid important decisions"
- **5-6**: "Moderate - Normal work pace, routine tasks"
- **7-8**: "Good - Productive, can handle meetings and planning"
- **9-10**: "Peak - Deep work, creative tasks, important decisions"

**Stress Scale (1-10) with Work Context**:

- **1-2**: "Calm - Relaxed, clear thinking"
- **3-4**: "Mild - Slightly tense but manageable"
- **5-6**: "Moderate - Noticeable stress, affects focus"
- **7-8**: "High - Anxious, difficult to concentrate"
- **9-10**: "Overwhelming - Can't work effectively"

**Quick Selection UI**: Visual scale with emoji + number + description tooltip

## **Data Structure**

```json
{
  "user_id": "uuid",
  "date": "YYYY-MM-DD",
  "entries": {
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
    "energySources": {
      "day": "Deep work session, good coffee, team collaboration, quality time with family"
    },
    "stressSources": {
      "day": "Deadline pressure, technical issues, context switching, household management, social obligations, financial concerns, relationship conflicts, health worries, childcare demands, elderly parent care"
    },
    "notes": "Productive morning, energy dip after lunch meeting, struggled with evening routine due to work stress"
  }
}
```

**Required Fields**: `energyLevels`, `stressLevels`, `energySources`, `stressSources`
**Optional Fields**: `notes`

## **Core Features**

**Achieved**:

- Entry with contextual rating system focusing on energy and stress levels
- Energy sources and stress sources identification as core inputs
- Basic trend visualization (7-day energy/stress curves)
- Local storage
- Previous day entry capability
- Weekly insights ("Your energy peaks Tuesday mornings, crashes Thursday evenings")
- Data export and basic pattern recognition
- Advanced analytics for users who provide optional context

**Next Phase**:

- ✅ **AI-powered insights based on energy sources and stress patterns** - IMPLEMENTED
- ✅ **AI insights with local LLM to keep privacy** - IMPLEMENTED
- Productivity and life quality correlation ("High energy = 40% better work output and family engagement")
- Schedule optimization suggestions for both work and personal activities
- Stress trigger identification and prevention for work-life balance

## **AI Analytics Implementation**

**Privacy-First Local AI**:

- **100% Local Processing**: Uses custom lightweight algorithms for pattern recognition
- **Zero Data Sharing**: All analysis happens on-device, no external API calls or internet required
- **Optional Feature**: Users explicitly opt-in and can disable anytime
- **Cross-Platform**: Works seamlessly on iOS, Android, and Web

**AI Capabilities**:

- **Pattern Recognition**: Automatically categorizes energy/stress sources using keyword matching
- **Smart Recommendations**: Personalized suggestions based on local pattern analysis
- **Sentiment Analysis**: Correlates text patterns with numeric energy/stress levels
- **Trend Analysis**: Local correlation analysis for stress and energy pattern detection
- **Confidence Scoring**: All insights include reliability indicators

**Technical Architecture**:

- **Lightweight Local AI**: Custom pattern recognition algorithms optimized for React Native
- **No External Dependencies**: All analysis happens locally without internet requirements
- **Instant Processing**: Real-time analysis without model download delays
- **Cross-Platform**: Works seamlessly on iOS, Android, and Web
- **Graceful Fallback**: App functions fully without AI features enabled

## **Project Structure**

```
energytune/
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.js
│   │   ├── EntryScreen.js       # Daily energy/stress entry form
│   │   ├── AnalyticsScreen.js   # AI insights and analytics
│   │   ├── TrendsDetailScreen.js
│   │   └── ProfileScreen.js
│   ├── components/
│   │   ├── ui/              # Basic UI components
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── DatePicker.js
│   │   │   ├── RatingScale.js
│   │   │   └── Toast.js
│   │   ├── analytics/       # AI insights components
│   │   │   ├── AIInsightsCard.js
│   │   │   ├── WeeklyInsightsCard.js
│   │   │   └── AnalyticsStates.js
│   │   ├── entry/           # Entry form components
│   │   │   ├── EntryHeader.js
│   │   │   ├── SourcesStep.js
│   │   │   ├── TimePeriodStep.js
│   │   │   └── NavigationFooter.js
│   │   ├── trends/          # Data visualization
│   │   │   ├── InteractiveChart.js
│   │   │   ├── DataSourceSelector.js
│   │   │   └── TrendInsights.js
│   ├── services/
│   │   ├── storage.js       # AsyncStorage operations
│   │   ├── analytics.js     # Data processing
│   │   ├── aiAnalytics.js   # Local AI pattern recognition
│   │   └── lightweightAI.js # Lightweight AI service
│   ├── hooks/
│   │   ├── useEntryData.js  # Entry management
│   │   ├── useAnalytics.js  # Data insights
│   │   ├── useTrendsData.js # Trend analysis
│   │   └── useStepNavigation.js
│   ├── contexts/
│   │   └── ToastContext.js  # Global notifications
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── entryValidation.js
│   └── config/
│       ├── theme.js             # Design system (colors, typography, spacing)
│       └── texts.js             # Centralized text strings for easy localization
├── assets/
│   ├── images/
│   └── icons/
└── config/
    └── theme.js

```

## **Key Requirements**

- **Exceptional User Experience (Apple-Style Design Philosophy)**:

  - **Intuitive First Use**: Zero learning curve - users should understand the interface immediately without tutorials or explanations
  - **Effortless Interaction**: Single-tap energy/stress rating with visual feedback, swipe gestures for navigation, haptic feedback on mobile
  - **Minimal Cognitive Load**: Maximum 3 taps to complete daily entry, smart defaults based on user patterns, progressive disclosure of advanced features
  - **Delightful Micro-Interactions**: Smooth animations, satisfying button presses, visual confirmation of saved data, gentle transitions between states
  - **Consistent Design Language**: Unified spacing (8px grid), consistent typography hierarchy, predictable interaction patterns across all screens
  - **Accessibility Excellence**: VoiceOver support, high contrast mode, large text compatibility, keyboard navigation, color-blind friendly palettes

- **Core Usability Principles**:

  - Progressive entry (energy/stress levels and sources first, context optional)
  - Immediate visual feedback on data entry with smooth animations
  - Anonymous usage with easy account creation (no barriers to entry)
  - Focus on energy sources and stress identification as primary value
  - **One-handed mobile operation** - all primary functions accessible with thumb
  - **Instant data persistence** - no "save" buttons, everything auto-saves
  - **Intelligent input suggestions** based on user history and common patterns

- **Technical Excellence**:

  - Mobile-first responsive design with native app feel
  - Offline capability with sync when online
  - **Sub-200ms response times** for all interactions
  - **Graceful loading states** with skeleton screens, never blank screens
  - **Error handling that guides users** rather than showing technical messages
  - GDPR-compliant data handling (EU users)

- **Documentation & Development**:
  - User-friendly interface with clear data analytics
  - Comprehensive documentation for development and usage
  - **Usability testing protocols** built into development process
  - **Performance monitoring** for user experience metrics

## **Data Analytics Features**

**Pattern Recognition**:

- Weekly energy trend analysis across work and personal life
- Stress trigger identification in both professional and personal contexts
- Energy source correlation and optimization recommendations
- Peak productivity and personal activity window detection

**Personalized Insights & Recommendations**:

- **Contextualized Actionable Advice**: AI-powered suggestions based on individual patterns, life context, and historical data
- **Smart Timing Recommendations**: Optimal scheduling for high-energy tasks (e.g., "Friday afternoons show 85% energy peaks - schedule important meetings then")
- **Energy Drain Prevention**: Proactive alerts when patterns indicate potential energy crashes or stress accumulation
- **Personal Energy Optimization**: Customized strategies based on individual energy sources and stress triggers

**Data Overload Management** *(Power User Features)*:

- **Progressive Data Disclosure**: Essential insights first, detailed analytics available on demand
- **Insight Prioritization**: AI ranks recommendations by potential impact and user preferences
- **Customizable Dashboard**: Users control which metrics and insights are prominently displayed
- **Smart Filtering**: Focus on specific time periods, contexts, or pattern types for targeted analysis

**Energy Forecasting** *(Future Enhancement)*:

- **Weekly Energy Weather Report**: Simple, weather-like forecast showing predicted energy levels for upcoming days
- **Activity Impact Prediction**: Estimate energy costs/benefits of planned activities based on historical patterns
- **Stress Event Preparation**: Early warnings for potentially challenging periods with coping strategies

**Personal Energy Map**:

- **Visual Activity Mapping**: Interactive visualization showing activities, locations, and people mapped by energy impact
- **Energy Source Heatmap**: Visual representation of what consistently boosts or drains energy
- **Context-Aware Insights**: Location-based, time-based, and social context energy patterns
- **Quick Reference Guide**: At-a-glance view of personal energy boosters and drains

**Optimal Timing Intelligence**:

- **Peak Performance Windows**: Identify and recommend optimal times for different activity types
- **Energy-Based Scheduling**: Suggest when to schedule meetings, deep work, personal activities, and rest
- **Weekly Pattern Recognition**: Day-of-week and time-of-day energy pattern analysis
- **Activity-Energy Matching**: Recommend best times for specific tasks based on historical energy levels

**Weekly Energy Debrief**:

- **Sunday Evening Summary**: Comprehensive weekly review with key insights and upcoming week recommendations
- **Pattern Reflection**: Highlight significant changes, improvements, or concerning trends
- **Goal Setting Support**: Suggest energy optimization goals for the upcoming week
- **Celebration & Learning**: Acknowledge wins and extract learnings from challenging periods

**Mobile-First Data Interaction**:

- **Swipe-Based Insight Navigation**: Quick gesture-based browsing of insights and recommendations
- **One-Thumb Analytics**: All key insights accessible with single-handed operation
- **Progressive Loading**: Essential insights load first, detailed data available on-demand
- **Voice-Activated Insights**: "Hey, show me my energy patterns for this week"
- **Quick Action Cards**: Immediate implementation of recommendations with single taps

**Reporting**:

**Key User Benefits**:
- **15-30 minutes saved daily** through optimal task timing
- **Reduced decision fatigue** with AI-powered scheduling recommendations  
- **Proactive stress management** preventing energy crashes that cost days of recovery
- **Mobile-first efficiency** - all insights accessible in under 3 taps, designed for one-handed use
- **Privacy-first intelligence** - sophisticated AI analysis without data sharing or cloud dependency