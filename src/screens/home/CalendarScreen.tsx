import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import {
  Appbar,
  Button,
  Card,
  Dialog,
  List,
  Portal,
  Text,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import type { HomeStackParamList } from '../../navigation/AppNavigator';
import {
  DailyReport,
  getReportsForMonth,
} from '../../services/reportService';


const MONTH_NAMES_FULL = [
  'Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
  'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'
];
const MONTH_NAMES_SHORT = [
  'Sty','Lut','Mar','Kwi','Maj','Cze',
  'Lip','Sie','Wrz','Paź','Lis','Gru'
];
LocaleConfig.locales['pl'] = {
  monthNames: MONTH_NAMES_FULL,
  monthNamesShort: MONTH_NAMES_SHORT,
  dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
  dayNamesShort: ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'],
  today: 'Dziś'
};
LocaleConfig.defaultLocale = 'pl';


const MONTH_NAMES = MONTH_NAMES_FULL.map(m => m.toLowerCase());

type CalendarNavProp =
  NativeStackNavigationProp<HomeStackParamList, 'Calendar'>;

export default function CalendarScreen() {
  const navigation = useNavigation<CalendarNavProp>();
  const { user, logout } = useAuth();
  const { width, height } = useWindowDimensions();

  const [year, setYear] = useState(new Date().getFullYear());
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportsMap, setReportsMap] = useState<Record<string, DailyReport>>({});
  const [totalHoursSum, setTotalHoursSum] = useState(0);

  // obliczamy string dla dzisiejszej daty w formacie YYYY-MM-DD
  const todayDateStr = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const map = await getReportsForMonth(user.uid, year, monthIndex);
      setReportsMap(map);
      const sum = Object.values(map).reduce(
        (acc, r) => acc + (r.totalHours ?? 0),
        0
      );
      setTotalHoursSum(sum);
    } catch (e) {
      console.error('CalendarScreen fetchData error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user, year, monthIndex]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const changeMonth = (offset: number) => {
    const newDate = new Date(year, monthIndex + offset, 1);
    setYear(newDate.getFullYear());
    setMonthIndex(newDate.getMonth());
  };

  const onDayPress = (date: DateData) => {
    navigation.navigate('Report', {
      year: date.year.toString(),
      month: date.month.toString(),
      day: date.day.toString(),
    });
  };

  const formattedCurrent = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;

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
        <Appbar.Action icon="chevron-left" onPress={() => changeMonth(-1)} />
        <Appbar.Content title={`${MONTH_NAMES[monthIndex]} ${year}`} />
        <Appbar.Action
          icon="cog"
          onPress={() => navigation.getParent()?.navigate('Profile')}
        />
        <Appbar.Action
          icon="menu-down"
          onPress={() => setPickerVisible(true)}
        />
        <Appbar.Action icon="chevron-right" onPress={() => changeMonth(1)} />
      </Appbar.Header>

      <Text style={styles.summaryText}>
        Łącznie przepracowano: {totalHoursSum} godz.
      </Text>

      <Card style={[styles.cardContainer, { width: width - 32 }]}>
        <Card.Content style={styles.cardContent}>
          <Calendar
            key={formattedCurrent}
            current={formattedCurrent}
            firstDay={1}
            hideArrows
            hideExtraDays={false}
            onDayPress={onDayPress}
            renderHeader={() => null}
            theme={{
              calendarBackground: '#fff',
              dayTextColor: '#000',
              todayTextColor: '#fff',
              selectedDayBackgroundColor: '#6200ee',
              monthTextColor: '#000',
              arrowColor: '#000',
              textDisabledColor: '#ccc',
            }}
            style={styles.calendar}
            dayComponent={({ date, state }) => {
              if (!date) return null;
              const dateStr = `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`;
              const hasReport = !!reportsMap[dateStr];
              const weekday = new Date(date.year, date.month - 1, date.day).getDay();
              const isSunday = weekday === 0;
              const defaultColor = isSunday
                ? '#d9534f'
                : state === 'disabled'
                ? '#ccc'
                : '#000';
              const isToday = dateStr === todayDateStr;

              return (
                <TouchableOpacity
                  onPress={() => state !== 'disabled' && onDayPress(date)}
                  disabled={state === 'disabled'}
                  style={styles.dayWrapper}
                >
                  <View style={[styles.cellBorder, isToday && styles.todayCell]}>
                    <Text
                      style={[
                        styles.dayText,
                        { color: isToday ? '#fff' : defaultColor },
                      ]}
                    >
                      {date.day}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        { color: isToday ? '#fff' : hasReport ? 'green' : 'red' },
                      ]}
                    >
                      {hasReport ? 'TAK' : 'NIE'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={pickerVisible}
          onDismiss={() => setPickerVisible(false)}
        >
          <Dialog.Title>Wybierz miesiąc</Dialog.Title>
          <Dialog.Content style={{ maxHeight: height * 0.5 }}>
            {MONTH_NAMES.map((m, idx) => (
              <List.Item
                key={m}
                title={m}
                onPress={() => {
                  setYear(year);
                  setMonthIndex(idx);
                  setPickerVisible(false);
                }}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPickerVisible(false)}>Anuluj</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.logoutWrapper}>
        <Button mode="outlined" onPress={logout}>
          Wyloguj
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  outerContainer: { flex: 1 },
  summaryText: { textAlign: 'center', marginVertical: 8 },
  cardContainer: { margin: 16 },
  cardContent: { alignItems: 'center' },
  calendar: { borderRadius: 8 },
  dayWrapper: { width: 32, height: 48, alignItems: 'center', justifyContent: 'center' },
  cellBorder: { borderWidth: 1, borderColor: '#ccc', width: '100%', height: '100%' },
  todayCell: { backgroundColor: '#6200ee' },
  dayText: { textAlign: 'center' },
  statusText: { fontSize: 10, textAlign: 'center' },
  logoutWrapper: { padding: 16 },
});
