# Dark Mode Implementation Guide

This guide shows how to quickly update other screens in the EnergyTune app to support dark mode.

## What's Already Done

✅ **ThemeContext** - Handles theme state management and system preference detection
✅ **Updated theme.js** - Now has `getTheme(isDarkMode)` function with light/dark colors
✅ **ProfileScreen** - Fully converted to use dynamic theming
✅ **Button component** - Updated to be theme-aware
✅ **AppearanceSelector** - New component for theme selection
✅ **App.js** - Wrapped with ThemeProvider and StatusBar theming

## How to Update Any Screen

### 1. Update Imports

```javascript
// Replace this:
import { theme } from "../config/theme";

// With this:
import { useTheme } from "../contexts/ThemeContext";
import { getTheme } from "../config/theme";
```

### 2. Use Theme Hook in Component

```javascript
export const YourScreen = () => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  // Rest of your component...
};
```

### 3. Apply Dynamic Colors to Styles

Replace static styles with theme-aware styles:

```javascript
// Instead of using styles directly:
<View style={styles.container}>

// Use dynamic theming:
<View style={[styles.container, { backgroundColor: theme.colors.primaryBackground }]}>
<Text style={[styles.title, { color: theme.colors.label }]}>
```

### 4. Update StyleSheet

Remove hardcoded colors from StyleSheet.create() and apply them inline:

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Remove: backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    // Remove: color: '#000000',
  },
});
```

## Theme Colors Reference

### Light Mode Colors

- `theme.colors.label` - '#000000' (primary text)
- `theme.colors.secondaryLabel` - '#3C3C43' (secondary text)
- `theme.colors.primaryBackground` - '#FFFFFF' (cards, modals)
- `theme.colors.secondaryBackground` - '#F2F2F7' (main background)

### Dark Mode Colors

- `theme.colors.label` - '#FFFFFF' (primary text)
- `theme.colors.secondaryLabel` - '#EBEBF5' (secondary text)
- `theme.colors.primaryBackground` - '#1C1C1E' (cards, modals)
- `theme.colors.secondaryBackground` - '#000000' (main background)

### System Colors (Auto-adjust for dark mode)

- `theme.colors.systemBlue` - Blue accent color
- `theme.colors.systemGreen` - Energy/success color
- `theme.colors.systemRed` - Stress/error color
- `theme.colors.separator` - Border/separator lines

## Example: Converting a Screen

```javascript
// Before
import { theme } from "../config/theme";

export const ExampleScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 17,
    color: "#000000",
  },
});

// After
import { useTheme } from "../contexts/ThemeContext";
import { getTheme } from "../config/theme";

export const ExampleScreen = () => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.primaryBackground },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.label }]}>
        Hello World
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 17,
  },
});
```

This approach ensures:

- **iOS-native look and feel** in both light and dark modes
- **Automatic system preference detection**
- **Manual override** available in Profile screen
- **Easy maintenance** - just update theme.js for app-wide changes
- **Backward compatibility** - existing screens work until updated
