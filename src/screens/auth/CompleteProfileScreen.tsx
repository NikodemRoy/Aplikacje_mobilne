import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import { TextInput, Button, Title, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { saveUserProfile, UserProfile } from '../../services/userService';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type CompleteProfileNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  'CompleteProfile'
>;

type Project = UserProfile['project'];
const PROJECT_OPTIONS: Project[] = [
  'Retail',
  'E-commerce',
  'Customer support',
  'Ekspert',
];

export default function CompleteProfileScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<CompleteProfileNavProp>();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [project, setProject] = useState<Project>(
    (user?.project as Project) ?? PROJECT_OPTIONS[0]
  );
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (user?.firstName && user.lastName && user.project) {
      navigation.replace('Login'); 
    }
  }, [user, navigation]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !project) {
      Alert.alert('Uwaga', 'Wypełnij wszystkie pola');
      return;
    }
    try {
      await saveUserProfile(user!.uid, { firstName, lastName, project });
      setUser({ ...user!, firstName, lastName, project });
      navigation.replace('Login'); 
    } catch (e) {
      console.error('CompleteProfile error:', e);
      Alert.alert('Błąd', 'Nie udało się zapisać danych');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Title style={styles.title}>Uzupełnij profil</Title>

      <TextInput
        label="Imię"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        label="Nazwisko"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />

      <View style={styles.menuWrapper}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.input}
            >
              {project}
            </Button>
          }
        >
          {PROJECT_OPTIONS.map((p) => (
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
      </View>

      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Zapisz
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  menuWrapper: { marginBottom: 16 },
  button: { marginTop: 8 },
});
