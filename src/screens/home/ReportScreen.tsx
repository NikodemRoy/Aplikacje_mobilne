import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text as RNText } from 'react-native';
import { Appbar, Card, Button, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { getReportForDate, DailyReport } from '../../services/reportService';
import type { HomeStackParamList } from '../../navigation/AppNavigator';

type ReportNavProp = NativeStackNavigationProp<HomeStackParamList, 'Report'>;
type ReportRouteProp = RouteProp<HomeStackParamList, 'Report'>;


type NestedActivity = {
  activity: string;
  startTime?: string;
  endTime?: string;
};

function isNested(obj: any): obj is NestedActivity {
  return obj && typeof obj === 'object' && typeof obj.activity === 'string';
}

export default function ReportScreen() {
  const navigation = useNavigation<ReportNavProp>();
  const route = useRoute<ReportRouteProp>();
  const { year, month, day } = route.params;
  const { user } = useAuth();


  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');
  const dateString = `${year}-${mm}-${dd}`;

  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!user) return;
    console.log(`[ReportScreen] fetchReport for ${dateString}`);
    setError(null);
    setIsLoading(true);
    try {
      const raw = await getReportForDate(user.uid, dateString);
      console.log(`[ReportScreen] data for ${dateString}:`, raw);
      if (raw && isNested(raw.activity)) {

        const nested = raw.activity;
        const normalized: DailyReport = {
          date: raw.date,
          createdAt: raw.createdAt,
          activity: nested.activity,
          ...(nested.startTime ? { startTime: nested.startTime } : {}),
          ...(nested.endTime ? { endTime: nested.endTime } : {}),
          ...(raw.totalHours != null ? { totalHours: raw.totalHours } : {}),
        };
        setReportData(normalized);
      } else {
        setReportData(raw);
      }
    } catch (e) {
      console.error('[ReportScreen] fetchReport error:', e);
      setError('Błąd pobierania raportu');
    } finally {
      setIsLoading(false);
    }
  }, [user, dateString]);

  useEffect(() => {
    fetchReport();
    const unsub = navigation.addListener('focus', fetchReport);
    return unsub;
  }, [navigation, fetchReport]);

  const handleAddActivity = () => {
    navigation.navigate('Activity', { year, month, day });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <RNText style={styles.errorText}>{error}</RNText>
        <Button mode="contained" onPress={fetchReport} style={styles.retryButton}>
          Spróbuj ponownie
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Raport: ${dd}.${mm}.${year}`} />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text>Zalogowany: {user?.email ?? '—'}</Text>

          {reportData ? (
            <>
              <Text style={styles.status}>Raport wypełniony</Text>
              <Text>Aktywność: {reportData.activity}</Text>
              {reportData.startTime && reportData.endTime && (
                <>
                  <Text>Rozpoczęcie: {reportData.startTime}</Text>
                  <Text>Zakończenie: {reportData.endTime}</Text>
                </>
              )}
              {typeof reportData.totalHours === 'number' && (
                <Text>
                  Przepracowano: {reportData.totalHours.toFixed(2)} godz.
                </Text>
              )}
              {reportData.createdAt && (
                <Text>
                  Utworzono: {reportData.createdAt.toDate().toLocaleString()}
                </Text>
              )}
              <Button
                mode="outlined"
                onPress={handleAddActivity}
                style={styles.button}
              >
                Edytuj
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.status}>Brak raportu</Text>
              <Button
                mode="contained"
                onPress={handleAddActivity}
                style={styles.button}
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
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16
  },
  container: { flex: 1 },
  card: { margin: 16 },
  cardContent: { alignItems: 'center' },
  status: { marginVertical: 8, fontWeight: 'bold' },
  button: { marginTop: 12 },
  errorText: { color: 'red', marginBottom: 12, textAlign: 'center' },
  retryButton: { marginTop: 8 },
});
