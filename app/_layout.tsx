import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '@/components/AuthProvider';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </PaperProvider>
  );
}
