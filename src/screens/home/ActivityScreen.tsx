import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Appbar,
  List,
  Button,
  TextInput,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { saveReportForDate } from '../../services/reportService';
import type { HomeStackParamList } from '../../navigation/AppNavigator';

type ActivityNavProp = NativeStackNavigationProp<HomeStackParamList, 'Activity'>;
type ActivityRouteProp = RouteProp<HomeStackParamList, 'Activity'>;

const ACTIVITIES = [
  'Dzień pracy',
  'Delegacja',
  'Home office na żądanie',
  'Home office z regulaminu',
  'Odbiór dnia wolnego',
  'Urlop bezpłatny',
  'Urlop płatny',
  'Zwolnienie chorobowe',
] as const;

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

export default function ActivityScreen() {
  const navigation = useNavigation<ActivityNavProp>();
  const route = useRoute<ActivityRouteProp>();
  const { year, month, day } = route.params;
  const { user } = useAuth();

  const [selectedActivity, setSelectedActivity] = useState<string>(ACTIVITIES[0]);
  const [activityMenuVisible, setActivityMenuVisible] = useState(false);

  const [startTime, setStartTime] = useState<string>(HOURS[8]);
  const [startMenuVisible, setStartMenuVisible] = useState(false);

  const [endTime, setEndTime] = useState<string>(HOURS[16]);
  const [endMenuVisible, setEndMenuVisible] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedActivity !== 'Dzień pracy') {
      setStartTime(HOURS[8]);
      setEndTime(HOURS[16]);
    }
  }, [selectedActivity]);

  const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(
    2,
    '0'
  )}`;

  const handleSave = async () => {
    setIsSaving(true);
    const needsTime = selectedActivity === 'Dzień pracy';
    await saveReportForDate(
      user!.uid,
      dateString,
      selectedActivity,
      needsTime ? startTime : undefined,
      needsTime ? endTime : undefined
    );
    setIsSaving(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />
        <Appbar.Content
          title={`Aktywność: ${day.padStart(2, '0')}.${month.padStart(
            2,
            '0'
          )}.${year}`}
        />
      </Appbar.Header>
      {isSaving ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <List.Section>
            <List.Subheader>Aktywność</List.Subheader>
            <TextInput
              label="Wybierz aktywność"
              value={selectedActivity}
              mode="outlined"
              onFocus={() => setActivityMenuVisible(true)}
              right={<TextInput.Icon icon="menu-down" />}
            />
            {activityMenuVisible && (
              <List.Section style={styles.menu}>
                {ACTIVITIES.map((act) => (
                  <List.Item
                    key={act}
                    title={act}
                    onPress={() => {
                      setSelectedActivity(act);
                      setActivityMenuVisible(false);
                    }}
                  />
                ))}
              </List.Section>
            )}
            {selectedActivity === 'Dzień pracy' && (
              <>
                <List.Subheader>Godzina rozpoczęcia</List.Subheader>
                <TextInput
                  label="Start"
                  value={startTime}
                  mode="outlined"
                  onFocus={() => setStartMenuVisible(true)}
                  right={<TextInput.Icon icon="menu-down" />}
                />
                {startMenuVisible && (
                  <List.Section style={styles.menu}>
                    {HOURS.map((h) => (
                      <List.Item
                        key={h}
                        title={h}
                        onPress={() => {
                          setStartTime(h);
                          setStartMenuVisible(false);
                        }}
                      />
                    ))}
                  </List.Section>
                )}
                <List.Subheader>Godzina zakończenia</List.Subheader>
                <TextInput
                  label="Koniec"
                  value={endTime}
                  mode="outlined"
                  onFocus={() => setEndMenuVisible(true)}
                  right={<TextInput.Icon icon="menu-down" />}
                />
                {endMenuVisible && (
                  <List.Section style={styles.menu}>
                    {HOURS.map((h) => (
                      <List.Item
                        key={h}
                        title={h}
                        onPress={() => {
                          setEndTime(h);
                          setEndMenuVisible(false);
                        }}
                      />
                    ))}
                  </List.Section>
                )}
              </>
            )}
          </List.Section>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            Zapisz
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Anuluj
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  menu: { backgroundColor: '#fff', marginBottom: 16 },
  saveButton: { marginTop: 24 },
  cancelButton: { marginTop: 8, alignSelf: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
