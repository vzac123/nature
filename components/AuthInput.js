import React from 'react';
import { TextInput } from 'react-native-paper';

export default function AuthInput({ label, secureTextEntry = false, value, onChangeText }) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      style={{ marginBottom: 10 }}
      mode="outlined"
    />
  );
}
