import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';

type SettingsNavProp = BottomTabNavigationProp<TabParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavProp>();
  const { logout } = useAuth();

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ustawienia" />
      </Appbar.Header>
      <View style={styles.container}>
        <List.Section>
          <List.Item
            title="Wyloguj"
            left={props => <List.Icon {...props} icon="logout" />}
            onPress={logout}
          />
        </List.Section>
        <Button mode="text" onPress={logout} style={styles.button}>
          Wyloguj
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  button: { marginTop: 16 },
});
