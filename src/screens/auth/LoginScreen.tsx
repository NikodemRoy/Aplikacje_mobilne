import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<LoginNavProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Uwaga', 'Podaj email i hasło');
        return;
      }
      console.log('[LoginScreen] Próbuję zalogować:', email);
      const success = await login(email, password);
      console.log('[LoginScreen] login zwrócił:', success);
      if (!success) {
        Alert.alert('Błąd', 'Nie udało się zalogować');
        return;
      }
      console.log('[LoginScreen] Nawiguję do CompleteProfile');
      navigation.replace('CompleteProfile');
    } catch (e) {
      console.error('[LoginScreen] błąd w handleLogin:', e);
      Alert.alert('Błąd', 'Wystąpił nieoczekiwany błąd podczas logowania');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Title style={styles.title}>Zaloguj się</Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label="Hasło"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Zaloguj
      </Button>
      <Button onPress={() => navigation.navigate('Register')} style={styles.link}>
        Nie masz konta? Zarejestruj się
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  link: { marginTop: 16 },
});
