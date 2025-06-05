import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar, Card, Button, Text } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';

export default function DayReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ month: string; day: string }>();
  const { user } = useAuth();
  const month = params.month!;
  const day = params.day!;

  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    const num = Number(day);
    setIsFilled(num % 3 === 0);
  }, [day]);

  const handleAddActivity = () => {
    router.push(`/raport/${month}/${day}/aktywnosc`);
  };

  return (
    <View style={styles.outerContainer}>
      <Appbar.Header>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => router.replace(`/`)}
        />
        <Appbar.Content title={`Raport: ${month} ${day}`} />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.userText}>
            Zalogowany: {user?.email ?? '—'}
          </Text>
          <Text style={styles.statusText}>
            {isFilled
              ? 'Raport na ten dzień został już wypełniony.'
              : 'Raport na ten dzień jeszcze nie został wypełniony.'}
          </Text>
          <Button
            mode="contained"
            onPress={handleAddActivity}
            style={styles.addButton}
          >
            Dodaj aktywność
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
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
  addButton: {
    marginTop: 8,
  },
});
