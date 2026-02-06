import React from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';

export default function AppInput(props: any) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}

      // 🔥 Disable browser autofill (Web)
      autoComplete="off"
      importantForAutofill="no"

      // 🔥 Mobile behavior
      textContentType="none"
      autoCorrect={false}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
