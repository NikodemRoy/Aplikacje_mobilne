import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Appbar,
  Card,
  DataTable,
  Button,
  Text,
} from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';

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

  const handleSelect = (activityName: string) => {
    // Zapisz wybraną aktywność dla raportu (np. do bazy lub AsyncStorage)
    // ...
    // Po wyborze wracamy do widoku raportu
    router.replace(`/raport/${month}/${day}`);
  };

  return (
    <ScrollView style={styles.outerContainer}>
      <Appbar.Header>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => router.replace(`/raport/${month}/${day}`)}
        />
        <Appbar.Content title="Wybierz aktywność" />
      </Appbar.Header>

      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data aktywności:</Text>
            <Text>{`${day}.${month}`}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Osoba:</Text>
            <Text>{user?.email ?? '—'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.tableCard}>
        <Card.Content>
          <Text style={styles.tableTitle}>
            Dostępne aktywności ({ACTIVITIES.length})
          </Text>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Aktywność</DataTable.Title>
              <DataTable.Title>Wybierz</DataTable.Title>
            </DataTable.Header>

            {ACTIVITIES.map((name) => (
              <DataTable.Row key={name}>
                <DataTable.Cell>{name}</DataTable.Cell>
                <DataTable.Cell>
                  <Button
                    mode="contained"
                    compact
                    onPress={() => handleSelect(name)}
                  >
                    Wybierz
                  </Button>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    margin: 16,
    borderRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoRow: {
    flex: 1,
    marginHorizontal: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tableCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 4,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
