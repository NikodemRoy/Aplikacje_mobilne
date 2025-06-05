import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar, Card, Button, Text } from 'react-native-paper';
import { useAuth } from '../../../../../hooks/useAuth';
import { getReportForDate, DailyReport  } from '../../../../services/reportService';

export default function DayReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ month: string; day: string }>();
  const { user } = useAuth();
  const month = params.month!;
  const day = params.day!;

  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<DailyReport | null>(null);

  useEffect(() => {
    if (!user) return;

    // Ustalenie roku i numeru miesiąca (1–12)
    const now = new Date();
    const year = now.getFullYear();
    const MONTH_NAMES = [
      'styczeń','luty','marzec','kwiecień','maj','czerwiec',
      'lipiec','sierpień','wrzesień','październik','listopad','grudzień'
    ];
    const monthIndex = MONTH_NAMES.indexOf(month.toLowerCase());
    const monthNumber = String(monthIndex + 1).padStart(2, '0');
    const dayNumber = day.padStart(2, '0');
    const dateString = `${year}-${monthNumber}-${dayNumber}`; // np. "2025-06-05"

    // Pobranie dokumentu z Firestore
    getReportForDate(user.uid, dateString)
      .then(doc => {
        setReportData(doc);       // albo `null`, jeżeli brak
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, month, day]);

  const handleAddActivity = () => {
    router.push(`/raport/${month}/${day}/aktywnosc`);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => router.replace(`/`)} />
        <Appbar.Content title={`Raport: ${month} ${day}`} />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.userText}>
            Zalogowany: {user?.email ?? '—'}
          </Text>

          {reportData ? (
            <>
              <Text style={styles.statusText}>
                Raport na ten dzień został już wypełniony.
              </Text>
              <Text style={styles.activityText}>
                Aktywność: {reportData.activity}
              </Text>
              <Text style={styles.dateText}>
                Data utworzenia: {reportData.createdAt.toDate().toLocaleString()}
              </Text>
              <Button
                mode="outlined"
                onPress={handleAddActivity}
                style={styles.addButton}
              >
                Edytuj aktywność
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.statusText}>
                Raport na ten dzień jeszcze nie został wypełniony.
              </Text>
              <Button
                mode="contained"
                onPress={handleAddActivity}
                style={styles.addButton}
              >
                Dodaj aktywność
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    margin: 16,
    borderRadius: 4,
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  userText: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  activityText: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
});
