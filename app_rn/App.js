import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Tabs from './src/navigation/Tabs';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
