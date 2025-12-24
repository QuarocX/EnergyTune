// Onboarding copy and text content
export const onboarding = {
  welcome: {
    title: 'EnergyTune',
    subtitle: 'Know yourself better',
    story: 'I built this after realizing I was guessing at my stress triggers. One year later, I have real patterns instead of vague feelings.',
    continueButton: 'Continue',
  },
  features: {
    title: 'How It Works',
    items: [
      {
        icon: '📊',
        label: 'Track',
        description: 'Morning, afternoon, evening check-ins give you patterns',
        expanded: [
          'Quick energy and stress ratings (1-10 scale)',
          'Note what boosts your energy throughout the day',
          'Identify stress triggers as they happen',
          'Track patterns across work and personal life',
        ],
      },
      {
        icon: '🔍',
        label: 'Discover',
        description: 'Note what affects you - this powers the insights',
        expanded: [
          'AI-powered pattern recognition from your data',
          'Identify peak productivity windows',
          'Spot stress triggers before they become chronic',
          'Correlate energy sources with performance',
        ],
      },
      {
        icon: '📈',
        label: 'Insights',
        description: 'Weekly summaries show what\'s working',
        expanded: [
          'Weekly energy trend analysis',
          'Personalized recommendations based on your patterns',
          'Burnout prevention early warnings',
          'Optimal timing suggestions for important tasks',
        ],
      },
    ],
    continueButton: 'Continue',
  },
  setup: {
    title: 'Make It Yours',
    description: 'You can change these anytime.',
    dailyReminders: {
      title: 'Daily Reminders',
      description: 'Get notified to check in',
    },
    weeklySummary: {
      title: 'Weekly Summary',
      description: 'Get insights on your patterns',
    },
    getStartedButton: 'Get Started',
    skipLink: 'Skip for Now',
  },
};

