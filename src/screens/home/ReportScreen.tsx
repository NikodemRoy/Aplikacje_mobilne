import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text as RNText } from 'react-native';
import { Appbar, Card, Button, Text, Dialog, Portal } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { getReportForDate, DailyReport, deleteReportForDate } from '../../services/reportService';
import type { HomeStackParamList } from '../../navigation/AppNavigator';

type ReportNavProp = NativeStackNavigationProp<HomeStackParamList, 'Report'>;
type ReportRouteProp = RouteProp<HomeStackParamList, 'Report'>;

type NestedActivity = {
  activity: string;
  startTime?: string;
  endTime?: string;
};

function isNested(obj: unknown): obj is NestedActivity {
  return !!obj && typeof obj === 'object' && 'activity' in obj && typeof obj.activity === 'string';
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
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!user) return;
    setError(null);
    setIsLoading(true);
    try {
      const raw = await getReportForDate(user.uid, dateString);
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
    } catch (err) {
      console.error('[ReportScreen] fetchReport error:', err);
      setError('Błąd pobierania raportu');
    } finally {
      setIsLoading(false);
    }
  }, [user, dateString]);

  useEffect(() => {
    fetchReport();
    const unsub = navigation.addListener('focus', fetchReport);
    return unsub;
  }, [fetchReport, navigation]);

  const handleAddActivity = useCallback(() => {
    navigation.navigate('Activity', { year, month, day });
  }, [navigation, year, month, day]);

  const handleDeleteReport = useCallback(async () => {
    setIsDeleteDialogVisible(false);
    if (!user || !reportData) return;
    
    try {
      setIsLoading(true);
      await deleteReportForDate(user.uid, dateString);
      navigation.navigate('Calendar', { refresh: true });
    } catch (err) {
      console.error('[ReportScreen] deleteReport error:', err);
      setError('Błąd podczas usuwania raportu');
    } finally {
      setIsLoading(false);
    }
  }, [user, reportData, dateString, navigation]);

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
              <View style={styles.buttonsContainer}>
                <Button
                  mode="outlined"
                  onPress={handleAddActivity}
                  style={styles.button}
                >
                  Edytuj
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setIsDeleteDialogVisible(true)}
                  style={[styles.button, styles.deleteButton]}
                  labelStyle={styles.deleteButtonLabel}
                >
                  Usuń
                </Button>
              </View>
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

      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={() => setIsDeleteDialogVisible(false)}>
          <Dialog.Title>Potwierdzenie usunięcia</Dialog.Title>
          <Dialog.Content>
            <Text>Czy na pewno chcesz usunąć raport z dnia {dd}.{mm}.{year}?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDeleteDialogVisible(false)}>Anuluj</Button>
            <Button onPress={handleDeleteReport}>Usuń</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: { 
    flex: 1 
  },
  card: { 
    margin: 16 
  },
  cardContent: { 
    alignItems: 'center' 
  },
  status: { 
    marginVertical: 8, 
    fontWeight: 'bold' 
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 16,
    gap: 16,
  },
  button: {
    minWidth: 120,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  deleteButtonLabel: {
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
});