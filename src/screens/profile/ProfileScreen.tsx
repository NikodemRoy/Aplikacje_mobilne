// src/screens/home/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  View,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  HelperText,
  Menu,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';
import {
  getUserProfile,
  saveUserProfile,
  UserProfile,
} from '../../services/userService';

type ProfileNavProp = BottomTabNavigationProp<TabParamList, 'Profile'>;
type Project = UserProfile['project'];

const PROJECT_OPTIONS: Project[] = [
  'Retail',
  'E-commerce',
  'Customer support',
  'Ekspert',
];

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavProp>();
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFirstError, setShowFirstError] = useState(false);
  const [showLastError, setShowLastError] = useState(false);
  const [showProjectError, setShowProjectError] = useState(false);

  useEffect(() => {
    getUserProfile(user!.uid)
      .then(profile => {
        if (profile) {
          setFirstName(profile.firstName);
          setLastName(profile.lastName);
          setProject(profile.project);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setCheckingProfile(false));
  }, [user]);

  const onSave = async () => {
    setShowFirstError(false);
    setShowLastError(false);
    setShowProjectError(false);
    if (!firstName.trim()) setShowFirstError(true);
    if (!lastName.trim()) setShowLastError(true);
    if (!project) setShowProjectError(true);
    if (!firstName.trim() || !lastName.trim() || !project) return;
    setSaving(true);
    const profileData: UserProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      project,
    };
    try {
      await saveUserProfile(user!.uid, profileData);
      setUser({ ...user!, ...profileData });
      Alert.alert('Sukces', 'Dane zapisane');
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać danych');
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Profil" />
      </Appbar.Header>
      <View style={styles.form}>
        <TextInput
          label="Imię"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
          mode="outlined"
        />
        <HelperText type="error" visible={showFirstError}>
          Imię jest wymagane
        </HelperText>
        <TextInput
          label="Nazwisko"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          mode="outlined"
        />
        <HelperText type="error" visible={showLastError}>
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
              {project ?? 'Wybierz projekt'}
            </Button>
          }
        >
          {PROJECT_OPTIONS.map(p => (
            <Menu.Item
              key={p}
              title={p}
              onPress={() => {
                setProject(p);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={showProjectError}>
          Wybierz projekt
        </HelperText>
        <Divider style={styles.divider} />
        <Button
          mode="contained"
          onPress={onSave}
          loading={saving}
          style={styles.saveButton}
        >
          Zapisz
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16 },
  input: { marginBottom: 8 },
  divider: { marginVertical: 16 },
  saveButton: { marginTop: 8 },
});
