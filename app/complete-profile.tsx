import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { saveUserProfile } from './services/userService';

export default function CompleteProfile() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [project, setProject] = useState('projekt1');

  const handleSave = async () => {
    if (!firstName || !lastName || !project || !user) return;

    await saveUserProfile(user.uid, {
      firstName,
      lastName,
      project: project as any,
    });

    setUser({
      ...user,
      firstName,
      lastName,
      project,
    });

    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Title>Uzupełnij dane konta</Title>

      <TextInput label="Imię" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput label="Nazwisko" value={lastName} onChangeText={setLastName} style={styles.input} />

      <RadioButton.Group onValueChange={setProject} value={project}>
        <RadioButton.Item label="projekt1" value="projekt1" />
        <RadioButton.Item label="projekt2" value="projekt2" />
        <RadioButton.Item label="projekt3" value="projekt3" />
      </RadioButton.Group>

      <Button mode="contained" onPress={handleSave}>Zapisz</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { marginBottom: 16 },
});
