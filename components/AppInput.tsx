import { TextInput, StyleSheet } from 'react-native';

export default function AppInput(props: any) {
  return <TextInput {...props} style={styles.input} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
