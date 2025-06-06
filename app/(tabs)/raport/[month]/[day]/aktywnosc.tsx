import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Appbar, List, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../../../hooks/useAuth';
import { saveReportForDate } from '../../../../services/reportService';


const ACTIVITIES = [
  'Dzień pracy',
  'Delegacja',
  'Home office na żądanie',
  'Home office z regulaminu',
  'Odbiór dnia wolnego',
  'Urlop bezpłatny',
  'Urlop płatny',
  'Zwolnienie chorobowe',
];


const FORCED_EIGHT = new Set<string>([
  'Delegacja',
  'Zwolnienie chorobowe',
  'Odbiór dnia wolnego',
  'Urlop płatny',
]);


const NEED_TIME = new Set<string>([
  'Dzień pracy',
  'Home office na żądanie',
  'Home office z regulaminu',
]);


const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0') + ':00'
);

export default function ChooseActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ month: string; day: string }>();
  const { user } = useAuth();
  const month = params.month!;
  const day = params.day!;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const [startTime, setStartTime] = useState(HOURS[8]);
  const [endTime, setEndTime] = useState(HOURS[16]);


  const now = new Date();
  const year = now.getFullYear();
  const MONTH_NAMES = [
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
  const monthIndex = MONTH_NAMES.indexOf(month.toLowerCase());
  const monthNumber = String(monthIndex + 1).padStart(2, '0');
  const dayNumber = day.padStart(2, '0');
  const dateString = `${year}-${monthNumber}-${dayNumber}`;

  const handleAccordionPress = () => {
    setExpanded(!expanded);
  };

  const handleSelectActivity = (act: string) => {
    setSelectedActivity(act);
    setExpanded(false);
    if (!NEED_TIME.has(act)) {
      setStartTime(HOURS[8]);
      setEndTime(HOURS[16]);
    }
  };

  const handleSave = async () => {
    if (!user || !selectedActivity) return;


    if (NEED_TIME.has(selectedActivity)) {
      const [h1, m1] = startTime.split(':').map((s) => parseInt(s, 10));
      const [h2, m2] = endTime.split(':').map((s) => parseInt(s, 10));
      const minutesStart = h1 * 60 + m1;
      const minutesEnd = h2 * 60 + m2;
      if (minutesEnd <= minutesStart) {
        setError('Godzina zakończenia musi być późniejsza niż rozpoczęcia');
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      if (FORCED_EIGHT.has(selectedActivity)) {
        await saveReportForDate(user.uid, dateString, selectedActivity);
      }
      else if (NEED_TIME.has(selectedActivity)) {
        await saveReportForDate(
          user.uid,
          dateString,
          selectedActivity,
          startTime,
          endTime
        );
      }
      else {
        await saveReportForDate(user.uid, dateString, selectedActivity);
      }

      router.replace(`/raport/${month}/${day}`);
    } catch (e) {
      console.log('Błąd podczas zapisu:', e);
      setError('Nie udało się zapisać raportu. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => router.replace(`/raport/${month}/${day}`)}
        />
        <Appbar.Content title={`Wybierz aktywność (${day} ${month})`} />
      </Appbar.Header>

      {isSaving ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.savingText}>Zapisuję...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {error != null && <Text style={styles.errorText}>{error}</Text>}

          <List.Section>
            <List.Accordion
              title={
                selectedActivity
                  ? `Aktywność: ${selectedActivity}`
                  : 'Wybierz aktywność'
              }
              left={(props) => <List.Icon {...props} icon="chevron-down" />}
              expanded={expanded}
              onPress={handleAccordionPress}
              style={styles.accordion}
            >
              {ACTIVITIES.map((act) => (
                <List.Item
                  key={act}
                  title={act}
                  onPress={() => handleSelectActivity(act)}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="checkbox-blank-circle-outline"
                    />
                  )}
                />
              ))}
            </List.Accordion>
          </List.Section>

          {selectedActivity && NEED_TIME.has(selectedActivity) && (
            <View style={styles.timeContainer}>
              <Text style={styles.label}>Godzina rozpoczęcia:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={startTime}
                  onValueChange={(value) => setStartTime(value)}
                  mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
                >
                  {HOURS.map((h) => (
                    <Picker.Item key={h} label={h} value={h} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Godzina zakończenia:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={endTime}
                  onValueChange={(value) => setEndTime(value)}
                  mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
                >
                  {HOURS.map((h) => (
                    <Picker.Item key={h} label={h} value={h} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!selectedActivity}
            style={styles.saveButton}
          >
            Zapisz
          </Button>

          <Button
            mode="text"
            onPress={() => router.replace(`/raport/${month}/${day}`)}
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
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 8,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  accordion: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  timeContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    marginVertical: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  saveButton: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
