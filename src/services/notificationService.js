import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import StorageService from './storage';
import { getTodayString } from '../utils/helpers';

// Configure notification behavior
// This handler processes notifications in all app states (foreground, background, killed)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // For notification actions, we need to allow the system to process them
    // The actual action handling happens in the response listener
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

class NotificationService {
  constructor() {
    this.initialized = false;
    
    // Notification categories (action groups)
    this.CATEGORIES = {
      ENERGY_CHECK: 'energy-check',
      STRESS_CHECK: 'stress-check',
      WEEKLY_SUMMARY: 'weekly-summary',
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
                // Allow app to wake up briefly to process the action
                // This ensures actions work even when app is killed
                opensAppToForeground: false,
                isAuthenticationRequired: false,
                isDestructive: false,
              },
            },
            {
              identifier: this.ACTIONS.MEDIUM,
              buttonTitle: 'Medium (6)',
              options: {
                opensAppToForeground: false,
                isAuthenticationRequired: false,
                isDestructive: false,
              },
            },
            {
              identifier: this.ACTIONS.HIGH,
              buttonTitle: 'High (8)',
              options: {
                opensAppToForeground: false,
                isAuthenticationRequired: false,
                isDestructive: false,
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
      
      const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);
      
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
        title: 'Morning Energy Check-in',
        body: "Press and hold to quick fill. Tap to open app for stress level & details",
      },
      afternoon: {
        title: 'Afternoon EnergyCheck-in',
        body: "Press and hold to quick fill. Tap to open app for stress level & details",
      },
      evening: {
        title: 'Evening Energy Check-in',
        body: "Press and hold to quick fill. Tap to open app for stress level & details",
      },
    };
    
    return content[period] || content.morning;
  }

  /**
   * Handle notification response (when user taps action or notification)
   */
  async handleNotificationResponse(response) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:267',message:'handleNotificationResponse called',data:{hasResponse:!!response,actionIdentifier:response?.actionIdentifier,defaultActionId:Notifications.DEFAULT_ACTION_IDENTIFIER,hasNotification:!!response?.notification},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      if (!response || !response.notification) {
        console.warn('Invalid notification response:', response);
        return;
      }
      
      const { actionIdentifier, notification } = response;
      
      // Validate notification data exists
      if (!notification.request || !notification.request.content || !notification.request.content.data) {
        console.warn('Notification missing required data:', notification);
        return;
      }
      
      const { period, type } = notification.request.content.data;
      
      // Validate period exists
      if (!period) {
        console.warn('Notification missing period:', notification.request.content.data);
        return;
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:270',message:'Parsed notification data',data:{actionIdentifier,period,type,expectedActions:{low:this.ACTIONS.LOW,medium:this.ACTIONS.MEDIUM,high:this.ACTIONS.HIGH}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // If no action (tapped notification body), return to let App.js handle navigation
      if (!actionIdentifier || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:273',message:'No action identifier, returning early',data:{actionIdentifier,isDefault:actionIdentifier===Notifications.DEFAULT_ACTION_IDENTIFIER},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
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
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:285',message:'Action mapped to value',data:{actionIdentifier,value,hasValue:!!value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (value) {
        const today = getTodayString();
        const entryType = type || 'energy';
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:291',message:'Before saveQuickEntry',data:{today,period,entryType,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // Save quick entry
        await StorageService.saveQuickEntry(today, period, entryType, value);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:292',message:'After saveQuickEntry - success',data:{today,period,entryType,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:294',message:'Before showConfirmation',data:{period,entryType,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        // Show confirmation notification
        await this.showConfirmation(period, entryType, value);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:295',message:'After showConfirmation - success',data:{period,entryType,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        // Haptic feedback
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:303',message:'Error in handleNotificationResponse',data:{error:error?.message,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Error handling notification response:', error);
    }
  }

  /**
   * Show confirmation notification after quick entry
   */
  async showConfirmation(period, type, value) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:310',message:'showConfirmation called',data:{period,type,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    try {
      const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
      const typeLabel = type === 'energy' ? 'Energy' : 'Stress';
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:315',message:'Before scheduling confirmation notification',data:{period,type,value,title:'✓ Logged!',body:`${periodLabel} ${typeLabel}: ${value}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      const notificationId = await Notifications.scheduleNotificationAsync({
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
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:327',message:'Confirmation notification scheduled',data:{notificationId,period,type,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/34bce0cd-1fa0-4eba-8440-215ef41c9c01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationService.js:328',message:'Error showing confirmation',data:{error:error?.message,stack:error?.stack,period,type,value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.error('Error showing confirmation:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
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
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling test notification:', error);
      console.error('Error message:', error.message);
      return null;
    }
  }

  /**
   * Generate weekly summary notification body with data preview
   * Note: This generates a generic preview since notifications are scheduled in advance.
   * For dynamic data at send time, would need background tasks (future enhancement).
   */
  async generateWeeklySummaryBody() {
    try {
      // Import here to avoid circular dependencies
      const WeeklySummaryService = require('./weeklySummaryService').default;
      const lastWeek = WeeklySummaryService.getLastCompleteWeek();
      const summary = await WeeklySummaryService.generateWeeklySummary(lastWeek.start, lastWeek.end);
      
      // Format preview with arrows
      let preview = '';
      if (summary.energy.average !== null) {
        preview += `↑ Energy ${summary.energy.average}/10`;
      }
      if (summary.stress.average !== null) {
        if (preview) preview += ' • ';
        preview += `↓ Stress ${summary.stress.average}/10`;
      }
      
      if (preview) {
        return preview;
      } else {
        return 'Tap to see how your week unfolded';
      }
    } catch (error) {
      console.error('Error generating summary preview:', error);
      return 'Tap to see how your week unfolded';
    }
  }

  /**
   * Schedule weekly summary notification
   * @param {Object} settings - { enabled: true, day: 1, time: '09:00' }
   *   day: 0 = Sunday, 1 = Monday, ... 6 = Saturday
   */
  async scheduleWeeklySummaryNotification(settings) {
    try {
      // Cancel existing weekly notification first
      await this.cancelWeeklySummaryNotification();
      
      if (!settings || !settings.enabled) {
        return null;
      }
      
      const [hours, minutes] = settings.time.split(':').map(num => parseInt(num, 10));
      const weekday = settings.day; // 0 = Sunday, 1 = Monday, etc.
      
      // Note: The body text is static when scheduled. For dynamic data (showing actual averages),
      // we would need to implement background tasks (expo-task-manager) that run at the scheduled time,
      // compute the summary, and send the notification. This is a future enhancement.
      
      const notificationConfig = {
        content: {
          title: 'Your Weekly Report is Ready',
          body: 'See your energy and stress patterns from this week',
          data: {
            type: 'weekly_summary',
          },
          sound: false,
        },
        trigger: {
          weekday: weekday + 1, // expo-notifications uses 1-7 (1=Sunday, 2=Monday, etc.)
          hour: hours,
          minute: minutes,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        },
      };
      
      // Add iOS category
      if (Platform.OS === 'ios') {
        notificationConfig.content.categoryIdentifier = this.CATEGORIES.WEEKLY_SUMMARY;
      }
      
      // Add Android channel
      if (Platform.OS === 'android') {
        notificationConfig.trigger.channelId = 'default';
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);
      
      // Store the notification ID for later cancellation
      this.weeklySummaryNotificationId = notificationId;
      
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling weekly summary notification:', error);
      console.error('Error message:', error.message);
      return null;
    }
  }

  /**
   * Send immediate weekly summary notification with current data
   * This is used for testing and could be triggered by background tasks
   */
  async sendWeeklySummaryNotificationNow() {
    try {
      const preview = await this.generateWeeklySummaryBody();
      
      const config = {
        content: {
          title: 'Your Weekly Report is Ready',
          body: preview,
          data: {
            type: 'weekly_summary',
          },
          sound: false,
        },
        trigger: null, // Send immediately
      };
      
      if (Platform.OS === 'ios') {
        config.content.categoryIdentifier = this.CATEGORIES.WEEKLY_SUMMARY;
      }
      
      if (Platform.OS === 'android') {
        config.content.channelId = 'default';
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync(config);
      return notificationId;
    } catch (error) {
      console.error('❌ Error sending weekly summary notification:', error);
      return null;
    }
  }

  /**
   * Cancel weekly summary notification
   */
  async cancelWeeklySummaryNotification() {
    try {
      // Get all scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Find and cancel weekly summary notifications
      for (const notification of scheduledNotifications) {
        const data = notification?.content?.data;
        if (data && data.type === 'weekly_summary') {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error cancelling weekly summary notification:', error);
    }
  }

  /**
   * Schedule test weekly summary notification (for testing)
   */
  async scheduleTestWeeklySummary(seconds = 5) {
    try {
      // Generate preview with current data
      const preview = await this.generateWeeklySummaryBody();
      
      const config = {
        content: {
          title: 'Your Weekly Report is Ready',
          body: preview,
          data: {
            type: 'weekly_summary',
          },
          sound: false,
        },
        trigger: {
          seconds: seconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      };
      
      if (Platform.OS === 'ios') {
        config.content.categoryIdentifier = this.CATEGORIES.WEEKLY_SUMMARY;
      }
      
      if (Platform.OS === 'android') {
        config.trigger.channelId = 'default';
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync(config);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling test weekly summary notification:', error);
      console.error('Error message:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export default new NotificationService();

