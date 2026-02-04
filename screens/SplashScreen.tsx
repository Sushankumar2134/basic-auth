import { View, Text } from 'react-native';
import { useEffect } from 'react';

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold' }}>My App</Text>
      <Text>Loading...</Text>
    </View>
  );
}

