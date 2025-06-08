import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Menu,
  HelperText,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { saveUserProfile, UserProfile } from './services/userService';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const PROJECT_OPTIONS: UserProfile['project'][] = [
  'Retail',
  'E-commerce',
  'Customer support',
  'Ekspert',
];

export default function CompleteProfile() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [project, setProject] = useState<UserProfile['project'] | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showFirstNameError, setShowFirstNameError] = useState(false);
  const [showLastNameError, setShowLastNameError] = useState(false);
  const [showProjectError, setShowProjectError] = useState(false);

  const handleSave = async () => {
    setShowFirstNameError(!firstName.trim());
    setShowLastNameError(!lastName.trim());
    setShowProjectError(!project);

    if (!firstName.trim() || !lastName.trim() || !project || !user) return;

    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        project,
      });

      setUser({
        ...user,
        firstName,
        lastName,
        project,
      });

      const now = new Date();
      const year = now.getFullYear();
      const monthName = [
        'styczeń',
        'luty',
        'marzec',
        'kwiecień',
        'maj',
        'czerwiec',
        'lipiec',
        'sierpień',
        'wrzesień',
        'październik',
        'listopad',
        'grudzień',
      ][now.getMonth()];

      router.replace(`/${year}/${monthName}`);
    } catch (e) {
      console.error('Błąd podczas zapisu profilu:', e);
      Alert.alert('Błąd', 'Nie udało się zapisać danych.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <Title style={styles.title}>Uzupełnij dane konta</Title>

      <TextInput
        label="Imię"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
        mode="outlined"
      />
      <HelperText type="error" visible={showFirstNameError}>
        Imię jest wymagane
      </HelperText>

      <TextInput
        label="Nazwisko"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
        mode="outlined"
      />
      <HelperText type="error" visible={showLastNameError}>
        Nazwisko jest wymagane
      </HelperText>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableWithoutFeedback onPress={() => setMenuVisible(true)}>
            <View pointerEvents="none">
              <TextInput
                label="Projekt"
                value={project ?? ''}
                style={styles.input}
                mode="outlined"
                right={<TextInput.Icon icon="menu-down" />}
              />
            </View>
          </TouchableWithoutFeedback>
        }
      >
        {PROJECT_OPTIONS.map((option) => (
          <Menu.Item
            key={option}
            title={option}
            onPress={() => {
              setProject(option);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
      <HelperText type="error" visible={showProjectError}>
        Projekt jest wymagany
      </HelperText>

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={saving}
        loading={saving}
        style={styles.saveButton}
      >
        Zapisz dane konta
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 16,
  },
});
