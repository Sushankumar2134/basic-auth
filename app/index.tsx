import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>BA</Text>
      </View>
      <Text style={styles.logo}>Basic Auth</Text>
      <Text style={styles.subTitle}>Getting things ready...</Text>
      <ActivityIndicator size="large" color="#4e8cff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f7f9fc',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#e8f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4e8cff',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subTitle: {
    color: '#6b7280',
    marginBottom: 16,
  },
});
