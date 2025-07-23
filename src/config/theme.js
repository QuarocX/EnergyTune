// Apple-inspired design system with dark mode support
const lightColors = {
  // Primary brand colors - intuitive color coding
  energy: '#34C759', // Green for energy (positive, natural)
  stress: '#FF3B30', // Red for stress (warning, alert)
  accent: '#007AFF', // Blue for UI elements (buttons, checkmarks, selections)
  background: '#F2F2F7',
  
  // iOS system colors
  systemBlue: '#007AFF',
  systemOrange: '#FF9500',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemGray: '#8E8E93',
  systemPurple: '#AF52DE',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
  
  // Semantic colors
  label: '#000000',
  labelRGB: '0, 0, 0',
  secondaryLabel: '#3C3C43',
  secondaryLabelRGB: '60, 60, 67',
  tertiaryLabel: '#3C3C43',
  quaternaryLabel: '#3C3C43',
  
  // Background colors
  primaryBackground: '#FFFFFF',
  secondaryBackground: '#F2F2F7',
  tertiaryBackground: '#FFFFFF',
  secondaryGroupedBackground: '#FFFFFF',
  
  // Fill colors
  primaryFill: '#78788033',
  secondaryFill: '#78788028',
  tertiaryFill: '#7676801F',
  quaternaryFill: '#74748018',
  
  // Separator
  separator: '#3C3C4336',
  opaqueSeparator: '#C6C6C8',
};

const darkColors = {
  // Primary brand colors - slightly adjusted for dark mode
  energy: '#30D158', // Slightly brighter green for better contrast
  stress: '#FF453A', // Slightly brighter red for better contrast
  accent: '#0A84FF', // iOS dark mode blue
  background: '#000000',
  
  // iOS system colors - dark mode variants
  systemBlue: '#0A84FF',
  systemOrange: '#FF9F0A',
  systemGreen: '#30D158',
  systemRed: '#FF453A',
  systemGray: '#8E8E93',
  systemPurple: '#BF5AF2',
  systemGray2: '#636366',
  systemGray3: '#48484A',
  systemGray4: '#3A3A3C',
  systemGray5: '#2C2C2E',
  systemGray6: '#1C1C1E',
  
  // Semantic colors - dark mode
  label: '#FFFFFF',
  labelRGB: '255, 255, 255',
  secondaryLabel: '#EBEBF5',
  secondaryLabelRGB: '235, 235, 245',
  tertiaryLabel: '#EBEBF5',
  quaternaryLabel: '#EBEBF5',
  
  // Background colors - dark mode
  primaryBackground: '#1C1C1E',
  secondaryBackground: '#000000',
  tertiaryBackground: '#2C2C2E',
  secondaryGroupedBackground: '#1C1C1E',
  
  // Fill colors - dark mode
  primaryFill: '#78788066',
  secondaryFill: '#78788052',
  tertiaryFill: '#7676803D',
  quaternaryFill: '#74748029',
  
  // Separator - dark mode
  separator: '#EBEBF554',
  opaqueSeparator: '#38383A',
};

export const getTheme = (isDarkMode = false) => ({
  colors: isDarkMode ? darkColors : lightColors,
  
  typography: {
    // iOS typography scale
    largeTitle: {
      fontSize: 34,
      fontWeight: '700',
      lineHeight: 41,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
    },
    title2: {
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 28,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 25,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 22,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 21,
    },
    subhead: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
    subheadline: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    caption2: {
      fontSize: 11,
      fontWeight: '400',
      lineHeight: 13,
    },
    // Add alias for compatibility
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
  
  spacing: {
    // 8pt grid system
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  
  animation: {
    duration: 300,
    easing: 'ease-out',
  },
});

// Legacy export for backward compatibility
export const theme = getTheme(false);