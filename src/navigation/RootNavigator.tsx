import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user && user.firstName && user.lastName && user.project ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
