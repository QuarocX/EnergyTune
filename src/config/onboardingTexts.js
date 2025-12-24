// Onboarding copy and text content
export const onboarding = {
  welcome: {
    title: 'EnergyTune',
    hook: 'Stop guessing. Start knowing.',
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
          {
            text: 'Quick energy and stress ratings',
            icon: 'speedometer',
          },
          {
            text: 'Fill in sources - this is where the insights come from',
            icon: 'document-text',
          },
        ],
      },
      {
        icon: '🔍',
        label: 'Discover',
        description: 'Note what affects you - this powers the insights',
        expanded: [
          {
            text: 'Privacy preserving pattern recognition from your sources',
            icon: 'shield-checkmark',
          },
          {
            text: 'See what consistently affects your energy levels',
            icon: 'pulse',
          },
        ],
      },
      {
        icon: '📈',
        label: 'Insights',
        description: 'Weekly summaries show what\'s working',
        expanded: [
          {
            text: 'Weekly trend analysis of your energy and stress',
            icon: 'stats-chart',
          },
          {
            text: 'Custom time selection for trends and source analysis',
            icon: 'calendar',
          },
        ],
      },
    ],
    sourcesMessage: '💡 Tip: Filling in energy and stress sources is essential - this is what powers the real pattern analysis and insights.',
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

