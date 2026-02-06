import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  requestNotificationPermissions,
  scheduleDailyMotivationNotification,
  scheduleWeeklyRandomNotification,
  sendFavoriteSavedNotification,
  checkAndSendMilestoneNotification,
} from '../services/notificationService';

type Quote = {
  id: number;
  content: string;
  author: string;
  tags: string[];
};

const copyToClipboard = async (text: string) => {
  try {
    // For web, use the Clipboard API
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert('Quote copied to clipboard!');
    } else {
      // Fallback for native
      alert('Quote: ' + text);
    }
  } catch (err) {
    alert('Failed to copy');
  }
};

export default function QuotesScreen() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [likes, setLikes] = useState<number>(0);
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [isFaved, setIsFaved] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(true);

  const loadQuote = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Use DummyJSON quotes API - reliable and no CORS issues
      const randomId = Math.floor(Math.random() * 100) + 1;
      const res = await fetch(`https://dummyjson.com/quotes/${randomId}`);
      
      if (!res.ok) throw new Error('Failed to load quote');
      
      const json = await res.json();
      const newQuote = {
        id: json.id,
        content: json.quote,
        author: json.author,
        tags: [],
      };
      setQuote(newQuote);
      setLikes(0);
      setIsFaved(favorites.some(fav => fav.id === newQuote.id));
    } catch (err) {
      setError('Could not load quote. Try again.');
      console.error('Quote fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  const handleLike = () => {
    setLikes(likes + 1);
  };

  const handleFavorite = async () => {
    if (quote) {
      if (isFaved) {
        setFavorites(favorites.filter(fav => fav.id !== quote.id));
        setIsFaved(false);
      } else {
        const updatedFavorites = [...favorites, quote];
        setFavorites(updatedFavorites);
        setIsFaved(true);

        // Send notification when quote is saved
        sendFavoriteSavedNotification(quote.content, quote.author);

        // Check for milestone after adding favorite
        await checkAndSendMilestoneNotification(updatedFavorites.length);

        // Schedule weekly notification when favorites exist
        if (updatedFavorites.length === 1) {
          scheduleWeeklyRandomNotification(updatedFavorites);
        }
      }
    }
  };

  useEffect(() => {
    // Request notification permissions and setup notifications on app startup
    const initializeNotifications = async () => {
      const permitted = await requestNotificationPermissions();
      setNotificationPermission(permitted);
      if (permitted) {
        // Schedule daily motivation notification at 7 AM
        await scheduleDailyMotivationNotification();
        console.log('Notifications initialized');
      } else {
        console.log('Notification permissions denied');
      }
    };
    
    initializeNotifications();
    loadQuote();
  }, [loadQuote]);

  const handleEnableNotifications = async () => {
    const permitted = await requestNotificationPermissions();
    setNotificationPermission(permitted);
    if (permitted) {
      await scheduleDailyMotivationNotification();
      alert('✅ Notifications enabled! You will now receive daily quotes and milestone alerts.');
    } else {
      alert('❌ Notification permission denied. Please enable it in your browser settings.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💡 Quotes</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.favBtn} onPress={() => setShowFavorites(!showFavorites)}>
            <Text style={styles.favText}>⭐ ({favorites.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadQuote}>
            <Text style={styles.refreshText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!notificationPermission && (
        <TouchableOpacity style={styles.notificationBanner} onPress={handleEnableNotifications}>
          <Text style={styles.notificationBannerText}>
            🔔 Enable notifications to receive daily quotes & milestones! Tap here
          </Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4e8cff" />
          <Text style={styles.loadingText}>Loading quote...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : showFavorites ? (
        <View style={styles.content}>
          <Text style={styles.favTitle}>Saved Favorites ({favorites.length})</Text>
          {favorites.length > 0 ? (
            favorites.map((fav, idx) => (
              <View key={idx} style={styles.favoriteCard}>
                <Text style={styles.quoteText}>"{fav.content}"</Text>
                <Text style={styles.author}>— {fav.author.replace(', type.kindle', '')}</Text>
                <TouchableOpacity 
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(`"${fav.content}" — ${fav.author}`)}
                >
                  <Text style={styles.copyText}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noFavText}>No saved quotes yet. Start saving your favorites!</Text>
          )}
        </View>
      ) : quote ? (
        <View style={styles.content}>
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{quote.content}"</Text>
            <Text style={styles.author}>— {quote.author.replace(', type.kindle', '')}</Text>
          </View>

          <View style={styles.actionBox}>
            <TouchableOpacity 
              style={[styles.actionBtn, likes > 0 && styles.activeBtn]}
              onPress={handleLike}
            >
              <Text style={styles.actionText}>👍 {likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, isFaved && styles.favoriteActive]}
              onPress={handleFavorite}
            >
              <Text style={styles.actionText}>{isFaved ? '⭐' : '☆'} Save</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => copyToClipboard(`"${quote.content}" — ${quote.author}`)}
            >
              <Text style={styles.actionText}>📋 Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f7f9fc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 10,
  },
  backBtn: { fontSize: 16, color: '#4e8cff', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700' },
  refreshBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e8f0ff',
    borderRadius: 999,
  },
  refreshText: { color: '#4e8cff', fontWeight: '600' },
  headerBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  favBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 999,
  },
  favText: { color: '#f59e0b', fontWeight: '600', fontSize: 12 },
  centerContent: { justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  loadingText: { color: '#6b7280', marginTop: 12 },
  errorText: { color: '#ef4444', fontSize: 16 },
  content: { gap: 16 },
  quoteCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#1f2937',
    marginBottom: 16,
  },
  author: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  actionBox: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-around',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: '#dbeafe',
  },
  favoriteActive: {
    backgroundColor: '#fff3cd',
  },
  actionText: { fontWeight: '600', fontSize: 13, color: '#1f2937' },
  copyBtn: {
    marginTop: 12,
    backgroundColor: '#4e8cff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  favTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#1f2937' },
  favoriteCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  noFavText: { color: '#9ca3af', fontSize: 16, textAlign: 'center', marginTop: 40 },
  tagsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#e8f0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tagText: { color: '#4e8cff', fontSize: 12, fontWeight: '600' },
  noTagsText: { color: '#9ca3af', fontSize: 14 },
  notificationBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  notificationBannerText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
