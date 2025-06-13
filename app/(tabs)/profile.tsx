import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  HelperText,
  Menu,
  TextInput,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, saveUserProfile, UserProfile } from '../../services/dataService';

const PROJECT_OPTIONS: UserProfile['project'][] = [
  'Retail',
  'E-commerce',
  'Customer support',
  'Ekspert',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [project, setProject] = useState<UserProfile['project'] | null>(null);

  const [checkingProfile, setCheckingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);


  const [showFirstNameError, setShowFirstNameError] = useState(false);
  const [showLastNameError, setShowLastNameError] = useState(false);
  const [showProjectError, setShowProjectError] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    getUserProfile(user.uid)
      .then((profile) => {
        if (profile) {
          const now = new Date();
          const year = now.getFullYear();
          const monthNames = [
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
          ];
          const month = monthNames[now.getMonth()];
          router.replace(`/${year}/${month}`);
        } else {
          setCheckingProfile(false);
        }
      })
      .catch((e) => {
        console.error('Błąd podczas sprawdzania profilu:', e);
        setCheckingProfile(false);
      });
  }, [user, router]);

  const onSave = async () => {
    setShowFirstNameError(false);
    setShowLastNameError(false);
    setShowProjectError(false);

    if (!firstName.trim()) {
      setShowFirstNameError(true);
    }
    if (!lastName.trim()) {
      setShowLastNameError(true);
    }
    if (!project) {
      setShowProjectError(true);
    }
    if (!firstName.trim() || !lastName.trim() || !project) {
      return;
    }

    if (!user) {
      Alert.alert('Błąd', 'Brak informacji o zalogowanym użytkowniku.');
      return;
    }

    setSaving(true);
    const profileData: UserProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      project,
    };

    try {
      await saveUserProfile(user.uid, profileData);
      const now = new Date();
      const year = now.getFullYear();
      const monthNames = [
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
      ];
      const month = monthNames[now.getMonth()];
      router.replace(`/${year}/${month}`);
    } catch (e) {
      console.error('Błąd podczas zapisu profilu:', e);
      Alert.alert('Błąd', 'Nie udało się zapisać profilu. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  };

  if (checkingProfile) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <Appbar.Header>
        <Appbar.Content title="Dane konta" />
      </Appbar.Header>

      <View style={styles.form}>
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
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.input}
            >
              {project ? project : 'Wybierz projekt'}
            </Button>
          }
        >
          {PROJECT_OPTIONS.map((p) => (
            <Menu.Item
              key={p}
              onPress={() => {
                setProject(p);
                setMenuVisible(false);
              }}
              title={p}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={showProjectError}>
          Projekt jest wymagany
        </HelperText>

        <Divider style={{ marginVertical: 16 }} />

        <Button
          mode="contained"
          onPress={onSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Zapisz dane konta
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
  },
});
