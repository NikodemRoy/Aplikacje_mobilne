import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Menu,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { saveUserProfile } from '../services/userService';

type ProjectName = 'Retail' | 'E-commerce' | 'Customer support' | 'Ekspert';

export default function SettingsScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [project, setProject] = useState<ProjectName>(
    (user?.project as ProjectName) || 'Retail'
  );
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    await saveUserProfile(user.uid, {
      firstName,
      lastName,
      project,
    });

    setUser({
      ...user,
      firstName,
      lastName,
      project,
    });

    router.back();
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Ustawienia" />
      </Appbar.Header>

      <View style={styles.container}>
        <TextInput
          label="Imię"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
          theme={{ colors: { text: 'black' } }}
        />
        <TextInput
          label="Nazwisko"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          theme={{ colors: { text: 'black' } }}
        />

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <TextInput
                label="Projekt"
                value={project}
                style={styles.input}
                editable={false}
                right={<TextInput.Icon icon="menu-down" />}
                theme={{ colors: { text: 'black' } }}
                pointerEvents="none"
              />
            </TouchableOpacity>
          }
        >
          {(['Retail', 'E-commerce', 'Customer support', 'Ekspert'] as ProjectName[]).map((option) => (
            <Menu.Item
              key={option}
              onPress={() => {
                setProject(option);
                setMenuVisible(false);
              }}
              title={option}
            />
          ))}
        </Menu>

        <Button mode="contained" onPress={handleSave}>
          Zapisz zmiany
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
});
