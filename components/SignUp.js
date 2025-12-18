import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AuthInput from '../components/AuthInput';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      import('react-native').then(({ Alert }) => {
        Alert.alert(title, message);
      });
    }
  };

  const handleRegister = () => {
    if (!name || !email || !password) {
      showAlert('Error', 'Please fill all fields');
      return;
    }

    // Handle registration logic here
    showAlert('Success', 'Account created!');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 400 }}>
        <Text variant="headlineLarge" style={{ marginBottom: 20, textAlign: 'center' }}>Sign Up</Text>

        <AuthInput label="Name" value={name} onChangeText={setName} />
        <AuthInput label="Email" value={email} onChangeText={setEmail} />
        <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <Button mode="contained" style={{ marginTop: 20 }} onPress={handleRegister}>
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={{ marginTop: 10 }}
        >
          Already have an account? Sign In
        </Button>
      </View>
    </View>
  );
}
