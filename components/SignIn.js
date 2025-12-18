import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AuthInput from '../components/AuthInput';

export default function SignIn() {
  const router = useRouter();
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

  const handleSignIn = () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill all fields');
      return;
    }

    // Handle sign-in logic here
    showAlert('Success', 'Signed in!');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 400 }}>
        <Text variant="headlineLarge" style={{ marginBottom: 20, textAlign: 'center' }}>Sign In</Text>

        <AuthInput label="Email" value={email} onChangeText={setEmail} />
        <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <Button mode="contained" style={{ marginTop: 20 }} onPress={handleSignIn}>
          Sign In
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/signup')}
          style={{ marginTop: 10 }}
        >
          Don't have an account? Sign Up
        </Button>
      </View>
    </View>
  );
}
