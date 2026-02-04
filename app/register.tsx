import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

export default function RegisterScreen() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us in a few steps</Text>

        <AppInput placeholder="Name" />
        <AppInput placeholder="Email / Mobile" />
        <AppInput placeholder="Password" secureTextEntry />
        <AppInput placeholder="Confirm Password" secureTextEntry />

        <AppButton title="Register" onPress={() => alert('Registered')} />
          
        
        
      
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
});
