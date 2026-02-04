import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.appName}>Basic Auth</Text>
        <Text style={styles.header}>Hi, John 👋</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/profile')}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardSub}>View your details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Settings')}>
          <Text style={styles.cardTitle}>Settings</Text>
          <Text style={styles.cardSub}>App preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('About')}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardSub}>Learn more</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.replace('/login')}>
          <Text style={styles.cardTitle}>Logout</Text>
          <Text style={styles.cardSub}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f9fc' },
  headerWrap: { marginTop: 10, marginBottom: 24 },
  appName: { fontSize: 16, color: '#6b7280' },
  header: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  grid: { gap: 14 },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSub: { color: '#6b7280', marginTop: 4 },
});
