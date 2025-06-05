import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const { registerEmployee } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Uwaga', 'Podaj email i hasło');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return;
    }
    const success = await registerEmployee!(email.trim(), password);
    if (success) {
      Alert.alert('Sukces', 'Konto utworzone. Zaloguj się.');
      router.replace('/login');
    } else {
      Alert.alert('Błąd', 'Rejestracja nie powiodła się');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Title style={styles.title}>Rejestracja</Title>

        <TextInput
          label="Email"
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          label="Hasło"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TextInput
          label="Potwierdź hasło"
          mode="outlined"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
        />

        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          Załóż konto
        </Button>

        <Button
          mode="text"
          onPress={() => router.replace('/login')}
          style={styles.link}
        >
          Masz już konto? Zaloguj się
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  link: {
    marginTop: 16,
  },
});
