import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Appbar, List, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { saveReportForDate } from '../../services/reportService';
import type { HomeStackParamList } from '../../navigation/AppNavigator';

type ActivityNavProp =
  NativeStackNavigationProp<HomeStackParamList, 'Activity'>;
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

const NEED_TIME = new Set<string>([
  'Dzień pracy',
  'Home office na żądanie',
  'Home office z regulaminu',
]);

const FORCED_EIGHT = new Set<string>([
  'Delegacja',
  'Zwolnienie chorobowe',
  'Odbiór dnia wolnego',
]);

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

export default function ActivityScreen() {
  const navigation = useNavigation<ActivityNavProp>();
  const route = useRoute<ActivityRouteProp>();
  const { year, month, day } = route.params;
  const { user } = useAuth();

  const [selectedActivity, setSelectedActivity] = useState<string>(
    ACTIVITIES[0]
  );
  const [startTime, setStartTime] = useState<string>(HOURS[8]);
  const [endTime, setEndTime] = useState<string>(HOURS[16]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (FORCED_EIGHT.has(selectedActivity)) {
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
    const needsTime = NEED_TIME.has(selectedActivity);
    await saveReportForDate(
      user!.uid,
      dateString,
      selectedActivity,
      needsTime ? startTime : undefined,
      needsTime ? endTime : undefined
    );
    setIsSaving(false);
    // zamiast replace, wracamy goBack() — wtedy ReportScreen otrzyma focus i odświeży dane
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()} />
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
            <List.Subheader>Wybierz aktywność</List.Subheader>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedActivity}
                onValueChange={setSelectedActivity}
                mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
              >
                {ACTIVITIES.map((act) => (
                  <Picker.Item key={act} label={act} value={act} />
                ))}
              </Picker>
            </View>

            {NEED_TIME.has(selectedActivity) && (
              <>
                <List.Subheader>Godzina rozpoczęcia</List.Subheader>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={startTime}
                    onValueChange={setStartTime}
                    enabled={!FORCED_EIGHT.has(selectedActivity)}
                  >
                    {HOURS.map((h) => (
                      <Picker.Item key={h} label={h} value={h} />
                    ))}
                  </Picker>
                </View>

                <List.Subheader>Godzina zakończenia</List.Subheader>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={endTime}
                    onValueChange={setEndTime}
                    enabled={!FORCED_EIGHT.has(selectedActivity)}
                  >
                    {HOURS.map((h) => (
                      <Picker.Item key={h} label={h} value={h} />
                    ))}
                  </Picker>
                </View>
              </>
            )}
          </List.Section>

          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  saveButton: { marginTop: 24 },
  cancelButton: { marginTop: 8, alignSelf: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
