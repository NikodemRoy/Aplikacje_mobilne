import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Appbar,
  Button,
  Dialog,
  List,
  Portal,
  Card,
  Text,
} from 'react-native-paper';
import { useAuth } from '../../../hooks/useAuth';
import { getReportsForMonth, DailyReport } from '../../services/reportService';

LocaleConfig.locales['pl'] = {
  monthNames: [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ],
  monthNamesShort: [
    'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
    'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru',
  ],
  dayNames: [
    'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa',
    'Czwartek', 'Piątek', 'Sobota',
  ],
  dayNamesShort: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'],
  today: 'Dziś',
};
LocaleConfig.defaultLocale = 'pl';

const MONTH_NAMES = [
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
];

export default function MonthCalendarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ year: string; month: string }>();
  const { user, logout } = useAuth(); // dodano logout
  const year = Number(params.year);
  const monthNameParam = (params.month || '').toLowerCase();
  const monthIndex = MONTH_NAMES.indexOf(monthNameParam);

  const { width, height } = useWindowDimensions();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportsMap, setReportsMap] = useState<Record<string, DailyReport>>({});
  const [totalHoursSum, setTotalHoursSum] = useState(0);

  useEffect(() => {
    if (
      isNaN(year) || year < 1900 || year > 3000 ||
      monthIndex < 0 || monthIndex > 11
    ) {
      const now = new Date();
      const y = now.getFullYear();
      const mName = MONTH_NAMES[now.getMonth()];
      router.replace(`/${y}/${mName}`);
      return;
    }

    if (!user) return;
    setIsLoading(true);

    getReportsForMonth(user.uid, year, monthIndex)
      .then((map) => {
        setReportsMap(map);

        let sum = 0;
        Object.values(map).forEach((rep) => {
          if (typeof rep.totalHours === 'number') {
            sum += rep.totalHours;
          }
        });
        setTotalHoursSum(sum);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, year, monthIndex, router]);

  const navigateToMonth = (y: number, mIdx: number) => {
    router.replace(`/${y}/${MONTH_NAMES[mIdx]}`);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(year, monthIndex + offset, 1);
    navigateToMonth(newDate.getFullYear(), newDate.getMonth());
  };

  const onDayPress = (date: DateData) => {
    const monthName = MONTH_NAMES[monthIndex];
    router.push(`/raport/${monthName}/${date.day}`);
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
        <Appbar.Action icon="cog" onPress={() => router.push('/settings')} />
        <Appbar.Action icon="menu-down" onPress={() => setPickerVisible(true)} />
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
              calendarBackground: '#ffffff',
              dayTextColor: '#000000',
              textDayFontSize: 14,
              textDayHeaderFontSize: 14,
              todayTextColor: '#6200ee',
              selectedDayBackgroundColor: '#6200ee',
              monthTextColor: '#000000',
              arrowColor: '#000000',
              textDisabledColor: '#cccccc',
            }}
            style={styles.calendar}
            dayComponent={({ date, state }) => {
              if (!date) return null;
              const dateStr = `${year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
              const hasReport = !!reportsMap[dateStr];
              const weekday = new Date(date.year, date.month - 1, date.day).getDay();
              const isSunday = weekday === 0;
              const textColor = isSunday
                ? '#d9534f'
                : state === 'disabled'
                ? '#ccc'
                : '#000';

              return (
                <TouchableOpacity
                  onPress={() => state !== 'disabled' && onDayPress(date)}
                  disabled={state === 'disabled'}
                  style={styles.dayWrapper}
                >
                  <View style={styles.cellBorder}>
                    <Text style={[styles.dayText, { color: textColor }]}>
                      {date.day}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        { color: hasReport ? 'green' : 'red' },
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
        <Dialog visible={pickerVisible} onDismiss={() => setPickerVisible(false)}>
          <Dialog.Title>Wybierz miesiąc</Dialog.Title>
          <Dialog.Content style={{ maxHeight: height * 0.5 }}>
            {MONTH_NAMES.map((m, idx) => (
              <List.Item
                key={m}
                title={m.charAt(0).toUpperCase() + m.slice(1)}
                onPress={() => {
                  navigateToMonth(year, idx);
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
        <Button mode="outlined" onPress={() => {
          logout();
          router.replace('/login');
        }}>
          Wyloguj
        </Button>
      </View>
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
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.select({ ios: 50, android: 20 }) || 20,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 8,
  },
  cardContainer: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  cardContent: {
    padding: 0,
  },
  calendar: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
  },
  dayWrapper: {
    width: 32,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellBorder: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 10,
  },
  listButton: {
    marginVertical: 8,
    width: '90%',
    alignSelf: 'center',
  },
  logoutWrapper: {
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
});
