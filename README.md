# Aplikacja do Ewidencji Czasu Pracy

##  Opis Projektu
Aplikacja mobilna stworzona w React Native do ewidencjonowania czasu pracy pracowników.

##  Kluczowe Funkcje

###  Autentykacja
- System logowania/rejestracji z Firebase Authentication
- Weryfikacja danych wejściowych formularzy

###  Zarządzanie Czasem
- Interaktywny kalendarz z podsumowaniem miesięcznym
- Tworzenie i edycja dziennych raportów:
  - Automatyczne obliczanie przepracowanych godzin
  - Różne typy aktywności (dzień pracy, urlop, szkolenie)
  - Weryfikacja poprawności danych czasowych

###  Raporty
- Podgląd historii zgłoszeń
- Suma przepracowanych godzin w wybranym okresie
- Wizualizacja obecności (TAK/NIE) w widoku miesięcznym
- Edycja oraz usuwanie

###  Profil Użytkownika
- Edycja danych osobowych
- Przypisanie do projektu/zespołu


## Architektura Techniczna

### Frontend
- **Framework**: React Native (Expo)
- **UI Kit**: React Native Paper
- **Nawigacja**: React Navigation
- **Kalendarz**: react-native-calendars
- **Formularze**: react-hook-form

### Backend
- **Baza danych**: Cloud Firestore
- **Autentykacja**: Firebase Auth

## Instalacja

### Kroki instalacyjne

1. **Sklonuj repozytorium**:
```bash
git clone https://github.com/NikodemRoy/Aplikacje_mobilne.git
cd Aplikacje_mobilne
```

2. **Instalacja zależności**:
```bash
npm install
```

3. **Uruchomienie aplikacji**:
```bash
npx expo start -c
```