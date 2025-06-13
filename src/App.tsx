import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './components/AuthProvider';
import RootNavigator from './navigation/RootNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200EE',     
    background: '#FFFFFF',
    text: '#333333',         
    placeholder: '#777777',  
    surface: '#F6F6F6',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
