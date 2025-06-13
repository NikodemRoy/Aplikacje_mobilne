import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<RegisterNavProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Uwaga', 'Podaj email i hasło');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Uwaga', 'Hasła muszą być takie same');
      return;
    }
    const success = await register(email, password);
    if (success) {
      navigation.replace('CompleteProfile');
    } else {
      Alert.alert('Błąd', 'Rejestracja nie powiodła się');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Title style={styles.title}>Zarejestruj się</Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label="Hasło"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        label="Potwierdź hasło"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Zarejestruj
      </Button>
      <Button onPress={() => navigation.navigate('Login')} style={styles.link}>
        Masz już konto? Zaloguj się
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
