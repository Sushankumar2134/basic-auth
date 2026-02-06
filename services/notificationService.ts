import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// List of motivational quotes for daily notifications
const motivationalQuotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
  { text: 'Success is not final, failure is not fatal.', author: 'Winston Churchill' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Your limitation—it\'s only your imagination.', author: 'Unknown' },
];

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Send immediate local notification (favorite saved, milestone)
export const sendImmediateNotification = async (
  title: string,
  body: string,
  data: any = {}
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        badge: 1,
      },
      trigger: null, // Null means immediate
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
};

// Schedule daily 7 AM motivation quote
export const scheduleDailyMotivationNotification = async () => {
  try {
    // Cancel any existing daily notifications
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const dailyNotif = allNotifications.find(n => n.content.data?.type === 'daily_motivation');
    if (dailyNotif) {
      await Notifications.cancelScheduledNotificationAsync(dailyNotif.identifier);
    }

    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    // Schedule for 7 AM daily
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(7, 0, 0, 0);

    // If it's already past 7 AM today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 Good Morning! Daily Motivation',
        body: `"${quote.text}"\n— ${quote.author}`,
        data: {
          type: 'daily_motivation',
          quote: quote.text,
          author: quote.author,
        },
        sound: true,
        badge: 1,
      },
      trigger:
        Platform.OS === 'android'
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 24 * 60 * 60,
              repeats: true,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              hour: 7,
              minute: 0,
              repeats: true,
            },
    });

    console.log('Daily motivation notification scheduled for 7 AM');
  } catch (error) {
    console.error('Error scheduling daily notification:', error);
  }
};

// Schedule weekly random notification from favorites
export const scheduleWeeklyRandomNotification = async (favorites: any[]) => {
  try {
    // Cancel any existing weekly notifications
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const weeklyNotif = allNotifications.find(n => n.content.data?.type === 'weekly_random');
    if (weeklyNotif) {
      await Notifications.cancelScheduledNotificationAsync(weeklyNotif.identifier);
    }

    if (favorites.length === 0) {
      console.log('No favorites to schedule weekly notification');
      return;
    }

    // Pick random favorite
    const randomQuote = favorites[Math.floor(Math.random() * favorites.length)];

    // Schedule for Monday at 9 AM
    const now = new Date();
    const scheduledTime = new Date();
    const daysUntilMonday = (1 - scheduledTime.getDay() + 7) % 7 || 7;
    scheduledTime.setDate(scheduledTime.getDate() + daysUntilMonday);
    scheduledTime.setHours(9, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Weekly Quote Reminder',
        body: `"${randomQuote.content}"\n— ${randomQuote.author.replace(', type.kindle', '')}`,
        data: {
          type: 'weekly_random',
          quote: randomQuote.content,
          author: randomQuote.author,
        },
        sound: true,
        badge: 1,
      },
      trigger:
        Platform.OS === 'android'
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 7 * 24 * 60 * 60,
              repeats: true,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              weekday: 2, // Monday (1 = Sunday, 2 = Monday)
              hour: 9,
              minute: 0,
              repeats: true,
            },
    });

    console.log('Weekly random notification scheduled for Monday 9 AM');
  } catch (error) {
    console.error('Error scheduling weekly notification:', error);
  }
};

// Check for milestone and send notification
export const checkAndSendMilestoneNotification = async (favoritesCount: number) => {
  const milestones = [5, 10, 15, 20, 25, 30, 50, 100];

  if (milestones.includes(favoritesCount)) {
    const messages: { [key: number]: string } = {
      5: '🏆 Milestone! You\'ve reached 5 saved quotes! Amazing start!',
      10: '🎉 Milestone! 10 quotes saved! Your collection is growing!',
      15: '⭐ Milestone! 15 quotes saved! You\'re a wisdom seeker!',
      20: '👑 Milestone! 20 quotes saved! Keep inspiring yourself!',
      25: '💎 Milestone! 25 quotes saved! You\'re unstoppable!',
      30: '🔥 Milestone! 30 quotes saved! Incredible dedication!',
      50: '🌟 Milestone! 50 quotes saved! You\'re a quote master!',
      100: '👏 LEGENDARY! 100 quotes saved! You\'re absolutely amazing!',
    };

    await sendImmediateNotification(
      '🎊 Milestone Achieved!',
      messages[favoritesCount],
      { type: 'milestone', count: favoritesCount }
    );
  }
};

// Send favorite saved notification
export const sendFavoriteSavedNotification = (quoteText: string, author: string) => {
  sendImmediateNotification(
    '❤️ Saved to Favorites!',
    `"${quoteText}"\n— ${author}`,
    { type: 'favorite_saved', quote: quoteText, author }
  );
};
