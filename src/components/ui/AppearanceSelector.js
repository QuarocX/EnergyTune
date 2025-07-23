import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../config/theme';
import { profile } from '../../config/texts';

export const AppearanceSelector = () => {
  const { themePreference, setTheme, isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  const options = [
    {
      key: 'system',
      title: profile.appearanceSection.automatic,
      description: profile.appearanceSection.automaticDescription,
      icon: 'phone-portrait-outline',
    },
    {
      key: 'light',
      title: profile.appearanceSection.light,
      description: profile.appearanceSection.lightDescription,
      icon: 'sunny-outline',
    },
    {
      key: 'dark',
      title: profile.appearanceSection.dark,
      description: profile.appearanceSection.darkDescription,
      icon: 'moon-outline',
    },
  ];

  const handleOptionPress = (option) => {
    setTheme(option.key);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.label }]}>
        {profile.appearanceSection.title}
      </Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.secondaryLabel }]}>
        {profile.appearanceSection.description}
      </Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              {
                backgroundColor: theme.colors.primaryBackground,
                borderBottomColor: theme.colors.separator,
              },
              index === 0 && styles.firstOption,
              index === options.length - 1 && styles.lastOption,
            ]}
            onPress={() => handleOptionPress(option)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Ionicons 
                name={option.icon} 
                size={24} 
                color={theme.colors.accent} 
                style={styles.optionIcon}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.colors.label }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.secondaryLabel }]}>
                  {option.description}
                </Text>
              </View>
              {themePreference === option.key && (
                <Ionicons 
                  name="checkmark" 
                  size={20} 
                  color={theme.colors.accent} 
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 16,
  },
  optionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  firstOption: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastOption: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  optionDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 2,
  },
});
