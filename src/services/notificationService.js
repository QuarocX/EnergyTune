import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import StorageService from './storage';
import { getTodayString } from '../utils/helpers';

/** Used in notification payload `data.scope` so we only cancel the right scheduled requests. */
export const NOTIFICATION_SCOPE = {
  DAILY_REMINDER: 'daily_reminder',
  WEEKLY_SUMMARY: 'weekly_summary',
  CONFIRMATION: 'confirmation',
  TEST_DAILY: 'test_daily',
  TEST_WEEKLY: 'test_weekly',
};

/** One-shot reminders kept ahead so a finished period can be skipped without a repeating trigger. */
const REMINDER_HORIZON_DAYS = 14;

/** A period is finished when both energy and stress are set. */
export function isPeriodFinished(entry, period) {
  const energy = entry?.energyLevels?.[period];
  const stress = entry?.stressLevels?.[period];
  return energy != null && stress != null;
}

// Configure notification behavior
// This handler processes notifications in all app states (foreground, background, killed)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Check if the period is already filled - if so, don't show the notification
    try {
      const data = notification?.request?.content?.data;
      if (data && data.period) {
        const today = getTodayString();
        const entry = await StorageService.getEntry(today);

        if (isPeriodFinished(entry, data.period)) {
          return {
            shouldShowBanner: false,
            shouldShowList: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }
      }
    } catch (error) {
      // If there's an error checking, show the notification to be safe
      console.error('Error checking if period is filled:', error);
    }
    
    // For notification actions, we need to allow the system to process them
    // The actual action handling happens in the response listener
    return {
      shouldShowBanner: true,
      shouldShowList: true,
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
      LOW: 7,
      MEDIUM: 8,
      HIGH: 9,
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
   * Energy check-in action buttons (titles derived from VALUES).
   * @param {boolean} withIosOptions - include iOS category action options
   */
  getEnergyActionButtons(withIosOptions = false) {
    const buttons = [
      {
        identifier: this.ACTIONS.LOW,
        buttonTitle: `Low (${this.VALUES.LOW})`,
      },
      {
        identifier: this.ACTIONS.MEDIUM,
        buttonTitle: `Medium (${this.VALUES.MEDIUM})`,
      },
      {
        identifier: this.ACTIONS.HIGH,
        buttonTitle: `High (${this.VALUES.HIGH})`,
      },
    ];

    if (!withIosOptions) {
      return buttons;
    }

    // Allow app to wake up briefly to process the action
    // This ensures actions work even when app is killed
    const iosOptions = {
      opensAppToForeground: false,
      isAuthenticationRequired: false,
      isDestructive: false,
    };

    return buttons.map((button) => ({
      ...button,
      options: iosOptions,
    }));
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
          this.getEnergyActionButtons(true),
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
   * Reconcile scheduled locals with AsyncStorage (launch / foreground).
   * Keeps daily and weekly independent: disabling one does not clear the other.
   */
  async syncScheduledNotificationsFromStorage() {
    try {
      const settings = await StorageService.getNotificationSettings();
      if (settings?.enabled) {
        await this.scheduleAllReminders(settings);
      } else {
        await this.cancelDailyReminders();
      }

      const weeklySettings = await StorageService.getWeeklySummarySettings();
      if (weeklySettings?.enabled) {
        await this.scheduleWeeklySummaryNotification(weeklySettings);
      } else {
        await this.cancelWeeklySummaryNotification();
      }
    } catch (error) {
      console.error('Error syncing notifications from storage:', error);
    }
  }

  /**
   * Schedule all reminders based on settings.
   * Queued so a later save cannot be overwritten by an earlier refresh still in flight.
   */
  scheduleAllReminders(settings) {
    const run = this._dailyScheduleChain || Promise.resolve();
    const next = run.catch(() => {}).then(() => this._scheduleAllReminders(settings));
    this._dailyScheduleChain = next;
    return next;
  }

  async _scheduleAllReminders(settings) {
    try {
      await this.cancelAllDailyReminderRequests();
      
      if (!settings || !settings.enabled) {
        return [];
      }
      
      const todayEntry = await StorageService.getEntry(getTodayString());
      const now = new Date();
      const scheduledIds = [];
      const periods = ['morning', 'afternoon', 'evening'];
      
      for (const period of periods) {
        const periodSettings = settings.periods[period];
        
        if (periodSettings && periodSettings.enabled) {
          const notificationIds = await this.scheduleReminder(
            period,
            periodSettings.time,
            { todayEntry, now }
          );
          scheduledIds.push(...notificationIds);
        }
      }
      
      return scheduledIds;
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return [];
    }
  }

  /**
   * Schedule upcoming one-shot reminders for a period.
   * Skips times that have passed, and skips today when that period is already finished.
   */
  async scheduleReminder(period, time, { todayEntry, now } = {}) {
    try {
      const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      const content = this.getNotificationContent(period);
      const start = now || new Date();
      const scheduledIds = [];

      for (let dayOffset = 0; dayOffset < REMINDER_HORIZON_DAYS; dayOffset++) {
        const fireAt = new Date(start);
        fireAt.setDate(fireAt.getDate() + dayOffset);
        fireAt.setHours(hours, minutes, 0, 0);

        if (fireAt <= start) continue;
        if (dayOffset === 0 && isPeriodFinished(todayEntry, period)) continue;

        const notificationConfig = {
          content: {
            title: content.title,
            body: content.body,
            data: {
              period,
              type: 'energy',
              scope: NOTIFICATION_SCOPE.DAILY_REMINDER,
            },
            sound: false,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fireAt,
          },
        };

        if (Platform.OS === 'ios') {
          notificationConfig.content.categoryIdentifier = this.CATEGORIES.ENERGY_CHECK;
        }

        if (Platform.OS === 'android') {
          notificationConfig.trigger.channelId = 'default';
          notificationConfig.content.actions = this.getEnergyActionButtons();
        }

        const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);
        if (notificationId) {
          scheduledIds.push(notificationId);
        }
      }

      return scheduledIds;
    } catch (error) {
      console.error(`❌ Error scheduling ${period} reminder:`, error);
      console.error('Error message:', error.message);
      return [];
    }
  }

  /**
   * Rebuild daily reminders from saved settings and today's entry.
   */
  async refreshDailyReminders() {
    try {
      const settings = await StorageService.getNotificationSettings();
      if (settings?.enabled) {
        await this.scheduleAllReminders(settings);
      } else {
        await this.cancelDailyReminders();
      }
    } catch (error) {
      console.error('Error refreshing daily reminders:', error);
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
      const today = getTodayString();
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '✓ Logged!',
          body: `${periodLabel} ${typeLabel}: ${value}`,
          sound: false,
          data: {
            type: 'confirmation',
            scope: NOTIFICATION_SCOPE.CONFIRMATION,
            period: period,
            date: today,
          },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing confirmation:', error);
    }
  }

  /**
   * Cancel scheduled notifications with a given `data.scope`.
   */
  async cancelScheduledNotificationsByScope(scope) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        const data = notification?.content?.data;
        if (data && data.scope === scope) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error cancelling notifications by scope:', error);
    }
  }

  isLegacyDailyReminderData(data) {
    if (!data || data.scope) return false;
    const periods = ['morning', 'afternoon', 'evening'];
    return periods.includes(data.period) && data.type === 'energy';
  }

  /**
   * Cancels daily period reminders: current `scope` payloads and pre-scope app versions.
   */
  async cancelAllDailyReminderRequests() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        const data = notification?.content?.data;
        if (
          data &&
          (data.scope === NOTIFICATION_SCOPE.DAILY_REMINDER ||
            this.isLegacyDailyReminderData(data))
        ) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error cancelling daily reminder notifications:', error);
    }
  }

  /** Cancels only repeating daily check-in reminders (main toggle off / reschedule). */
  async cancelDailyReminders() {
    await this.cancelAllDailyReminderRequests();
  }

  /**
   * Cancel all scheduled notifications (e.g. tests or full reset).
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
          data: { period: 'morning', type: 'energy', scope: NOTIFICATION_SCOPE.TEST_DAILY },
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
        config.content.actions = this.getEnergyActionButtons();
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
            scope: NOTIFICATION_SCOPE.WEEKLY_SUMMARY,
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
            scope: NOTIFICATION_SCOPE.WEEKLY_SUMMARY,
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
            scope: NOTIFICATION_SCOPE.TEST_WEEKLY,
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

