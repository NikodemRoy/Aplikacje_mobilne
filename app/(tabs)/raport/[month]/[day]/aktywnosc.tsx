import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { Appbar, List, Button, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../../../hooks/useAuth';
import { saveReportForDate } from '../../../../services/reportService';

const ACTIVITIES = [
  'Delegacja',
  'Home office na żądanie',
  'Home office z regulaminu',
  'Odbiór dnia wolnego',
  'Urlop bezpłatny',
  'Urlop na żądanie',
  'Urlop ojcowski',
  'Urlop okolicznościowy',
  'Urlop opiekuńczy (bezpłatny)',
  'Urlop rodzicielski',
  'Urlop w związku z siłą wyższą (płatny 50%)',
  'Urlop wychowawczy',
  'Urlop wypoczynkowy',
  'Zwolnienie chorobowe',
];

export default function ChooseActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ month: string; day: string }>();
  const { user } = useAuth();
  const month = params.month!;
  const day = params.day!;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const now = new Date();
  const year = now.getFullYear();
  const MONTH_NAMES = [
    'styczeń','luty','marzec','kwiecień','maj','czerwiec',
    'lipiec','sierpień','wrzesień','październik','listopad','grudzień'
  ];
  const monthIndex = MONTH_NAMES.indexOf(month.toLowerCase());
  const monthNumber = String(monthIndex + 1).padStart(2, '0');
  const dayNumber = day.padStart(2, '0');
  const dateString = `${year}-${monthNumber}-${dayNumber}`;

  const handleSelect = async (activity: string) => {
    if (!user) return;
    setIsSaving(true);
    setError(null);

    try {
      await saveReportForDate(user.uid, dateString, activity);
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
        <>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <FlatList
            data={ACTIVITIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <List.Item
                title={item}
                onPress={() => handleSelect(item)}
                left={(props) => <List.Icon {...props} icon="check" />}
              />
            )}
          />

          <Button
            mode="text"
            onPress={() => router.replace(`/raport/${month}/${day}`)}
            style={styles.cancelButton}
          >
            Anuluj
          </Button>
        </>
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
  cancelButton: {
    margin: 16,
  },
});
