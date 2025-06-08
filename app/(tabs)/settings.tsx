import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Title>Dane konta</Title>
      <Text>Imię: {user.firstName}</Text>
      <Text>Nazwisko: {user.lastName}</Text>
      <Text>Projekt: {user.project}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
