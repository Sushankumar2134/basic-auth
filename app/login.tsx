import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <AppInput
          placeholder="Email / Mobile"
          value={user}
          onChangeText={setUser}
        />

        <AppInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <AppButton title="Login" onPress={() => router.replace('/home')} />

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.link}>New user? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7f9fc' },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#6b7280', marginBottom: 24, marginTop: 6 },
  forgot: { textAlign: 'right', color: '#4e8cff', marginBottom: 20 },
  link: { textAlign: 'center', color: '#4e8cff', marginTop: 15 },
});
