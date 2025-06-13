// src/screens/home/ReportScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, Card, Button, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { getReportForDate, DailyReport } from '../../services/reportService';
import type { HomeStackParamList } from '../../navigation/AppNavigator';

type ReportNavProp = NativeStackNavigationProp<HomeStackParamList, 'Report'>;
type ReportRouteProp = RouteProp<HomeStackParamList, 'Report'>;

export default function ReportScreen() {
  const navigation = useNavigation<ReportNavProp>();
  const route = useRoute<ReportRouteProp>();
  const { year, month, day } = route.params;
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<DailyReport | null>(null);

  const fetchReport = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const mm = month.padStart(2, '0');
      const dd = day.padStart(2, '0');
      const dateString = `${year}-${mm}-${dd}`;
      console.log('[ReportScreen] fetching report for', dateString);
      const data = await getReportForDate(user.uid, dateString);
      console.log('[ReportScreen] got data:', data);
      setReportData(data);
    } catch (e) {
      console.error('[ReportScreen] fetchReport error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user, year, month, day]);

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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={`Raport: ${day.padStart(2, '0')}.${month.padStart(
            2,
            '0'
          )}.${year}`}
        />
      </Appbar.Header>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.userText}>Zalogowany: {user?.email ?? '—'}</Text>

          {reportData ? (
            <>
              <Text style={styles.statusText}>
                Raport na ten dzień został już wypełniony.
              </Text>
              <Text style={styles.activityText}>
                Aktywność: {reportData.activity}
              </Text>
              {reportData.startTime && reportData.endTime && (
                <>
                  <Text style={styles.timeText}>
                    Rozpoczęcie: {reportData.startTime}
                  </Text>
                  <Text style={styles.timeText}>
                    Zakończenie: {reportData.endTime}
                  </Text>
                </>
              )}
              {typeof reportData.totalHours === 'number' && (
                <Text style={styles.hoursText}>
                  Przepracowano: {reportData.totalHours.toFixed(0)}{' '}
                  {reportData.totalHours === 1 ? 'godzinę' : 'godzin'}
                </Text>
              )}
              {reportData.createdAt && (
                <Text style={styles.dateText}>
                  Data utworzenia:{' '}
                  {reportData.createdAt.toDate().toLocaleString()}
                </Text>
              )}
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
  outerContainer: { flex: 1 },
  card: { margin: 16 },
  cardContent: { alignItems: 'center' },
  userText: { marginBottom: 8 },
  statusText: { marginBottom: 8 },
  activityText: { fontSize: 16, marginBottom: 8 },
  timeText: { fontSize: 14, marginBottom: 4 },
  hoursText: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  dateText: { fontSize: 12, color: '#666', marginBottom: 16 },
  addButton: { marginTop: 8 },
});
