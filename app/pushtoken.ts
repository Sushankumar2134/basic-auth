import AsyncStorage from '@react-native-async-storage/async-storage';

export async function savePushToken(token: string) {
  await AsyncStorage.setItem('expoPushToken', token);
}

export async function getPushToken() {
  return AsyncStorage.getItem('expoPushToken');
}