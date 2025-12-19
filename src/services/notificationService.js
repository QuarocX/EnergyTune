import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import StorageService from './storage';
import { getTodayString } from '../utils/helpers';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.initialized = false;
    
    // Notification categories (action groups)
    this.CATEGORIES = {
      ENERGY_CHECK: 'energy-check',
      STRESS_CHECK: 'stress-check',
    };
    
    // Representative values
    this.VALUES = {
      LOW: 3,
      MEDIUM: 6,
      HIGH: 8,
    };
    
    // Action identifiers
    this.ACTIONS = {
      LOW: 'action-low',
      MEDIUM: 'action-medium',
      HIGH: 'action-high',
    };
  }

  /**
   * Initialize the notification service
   */
  async init() {
    if (this.initialized) return;
    
    try {
      await this.registerCategories();
      this.initialized = true;
      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Error initializing NotificationService:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }
      
      // For Android, set up notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
          enableVibrate: true,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return 'undetermined';
    }
  }

  /**
   * Register notification categories with actions
   */
  async registerCategories() {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Register categories with actions
        await Notifications.setNotificationCategoryAsync(
          this.CATEGORIES.ENERGY_CHECK,
          [
            {
              identifier: this.ACTIONS.LOW,
              buttonTitle: 'Low (3)',
              options: {
                opensAppToForeground: false,
              },
            },
            {
              identifier: this.ACTIONS.MEDIUM,
              buttonTitle: 'Medium (6)',
              options: {
                opensAppToForeground: false,
              },
            },
            {
              identifier: this.ACTIONS.HIGH,
              buttonTitle: 'High (8)',
              options: {
                opensAppToForeground: false,
              },
            },
          ],
          {
            previewPlaceholder: 'Energy Check-in',
            intentIdentifiers: [],
            hiddenPreviewsBodyPlaceholder: 'Check in with EnergyTune',
          }
        );
      }
      // Android handles actions differently - they're added per notification
      console.log('Notification categories registered');
    } catch (error) {
      console.error('Error registering categories:', error);
    }
  }

  /**
   * Schedule all reminders based on settings
   */
  async scheduleAllReminders(settings) {
    try {
      // First, cancel all existing notifications
      await this.cancelAllNotifications();
      
      if (!settings || !settings.enabled) {
        console.log('Notifications disabled, not scheduling');
        return [];
      }
      
      const scheduledIds = [];
      const periods = ['morning', 'afternoon', 'evening'];
      
      for (const period of periods) {
        const periodSettings = settings.periods[period];
        
        if (periodSettings && periodSettings.enabled) {
          const notificationId = await this.scheduleReminder(period, periodSettings.time);
          if (notificationId) {
            scheduledIds.push(notificationId);
          }
        }
      }
      
      console.log(`Scheduled ${scheduledIds.length} notifications`);
      return scheduledIds;
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return [];
    }
  }

  /**
   * Schedule a single reminder for a period
   */
  async scheduleReminder(period, time) {
    try {
      const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      const content = this.getNotificationContent(period);
      
      const notificationConfig = {
        content: {
          title: content.title,
          body: content.body,
          data: {
            period,
            type: 'energy', // Start with energy check
          },
          sound: false, // false = no sound, or use a string for custom sound
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
        },
      };
      
      // Add iOS category for actions
      if (Platform.OS === 'ios') {
        notificationConfig.content.categoryIdentifier = this.CATEGORIES.ENERGY_CHECK;
      }
      
      // Add Android-specific channel and actions
      if (Platform.OS === 'android') {
        notificationConfig.trigger.channelId = 'default';
        notificationConfig.content.actions = [
          {
            identifier: this.ACTIONS.LOW,
            buttonTitle: 'Low (3)',
          },
          {
            identifier: this.ACTIONS.MEDIUM,
            buttonTitle: 'Medium (6)',
          },
          {
            identifier: this.ACTIONS.HIGH,
            buttonTitle: 'High (8)',
          },
        ];
      }
      
      console.log(`Attempting to schedule ${period} notification at ${hours}:${minutes}`);
      
      const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);
      console.log(`✓ Successfully scheduled ${period} notification with ID: ${notificationId}`);
      
      return notificationId;
    } catch (error) {
      console.error(`❌ Error scheduling ${period} reminder:`, error);
      console.error('Error message:', error.message);
      return null;
    }
  }

  /**
   * Get notification content based on period
   */
  getNotificationContent(period) {
    const content = {
      morning: {
        title: 'Morning Check-in',
        body: "Press and hold to quick fill. Tap to open app for stress level & details",
      },
      afternoon: {
        title: 'Afternoon Check-in',
        body: "Press and hold to quick fill. Tap to open app for stress level & details",
      },
      evening: {
        title: 'Evening Check-in',
        body: "Press and hold to quick fill. Tap to open app for stress level & details",
      },
    };
    
    return content[period] || content.morning;
  }

  /**
   * Handle notification response (when user taps action or notification)
   */
  async handleNotificationResponse(response) {
    try {
      const { actionIdentifier, notification } = response;
      const { period, type } = notification.request.content.data;
      
      // If no action (tapped notification body), return to let App.js handle navigation
      if (!actionIdentifier || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        return;
      }
      
      // Map action to value
      let value = null;
      if (actionIdentifier === this.ACTIONS.LOW) {
        value = this.VALUES.LOW;
      } else if (actionIdentifier === this.ACTIONS.MEDIUM) {
        value = this.VALUES.MEDIUM;
      } else if (actionIdentifier === this.ACTIONS.HIGH) {
        value = this.VALUES.HIGH;
      }
      
      if (value) {
        const today = getTodayString();
        const entryType = type || 'energy';
        
        // Save quick entry
        await StorageService.saveQuickEntry(today, period, entryType, value);
        
        // Show confirmation notification
        await this.showConfirmation(period, entryType, value);
        
        // Haptic feedback
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        console.log(`Quick entry saved: ${period} ${entryType} = ${value}`);
      }
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  }

  /**
   * Show confirmation notification after quick entry
   */
  async showConfirmation(period, type, value) {
    try {
      const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
      const typeLabel = type === 'energy' ? 'Energy' : 'Stress';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✓ Logged!',
          body: `${periodLabel} ${typeLabel}: ${value}`,
          sound: false,
          data: {
            type: 'confirmation',
          },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing confirmation:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Schedule a test notification in X seconds (for testing)
   */
  async scheduleTestNotification(seconds = 5) {
    try {
      const config = {
        content: {
          title: 'Test Morning Check-in',
          body: "Press and hold to quick fill. Tap to open app for stress level & details (TEST)",
          data: { period: 'morning', type: 'energy' },
          sound: false, // false = no sound
        },
        trigger: {
          seconds: seconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      };

      // Add iOS category for actions
      if (Platform.OS === 'ios') {
        config.content.categoryIdentifier = this.CATEGORIES.ENERGY_CHECK;
      }

      // Add Android-specific actions
      if (Platform.OS === 'android') {
        config.trigger.channelId = 'default';
        config.content.actions = [
          {
            identifier: this.ACTIONS.LOW,
            buttonTitle: 'Low (3)',
          },
          {
            identifier: this.ACTIONS.MEDIUM,
            buttonTitle: 'Medium (6)',
          },
          {
            identifier: this.ACTIONS.HIGH,
            buttonTitle: 'High (8)',
          },
        ];
      }

      const notificationId = await Notifications.scheduleNotificationAsync(config);
      console.log(`✓ Test notification scheduled for ${seconds} seconds with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling test notification:', error);
      console.error('Error message:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export default new NotificationService();

