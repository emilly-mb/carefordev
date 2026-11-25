import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Tabs from './src/navigation/Tabs';
import { UsuarioProvider } from './src/context/UsuarioContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UsuarioProvider>
        <NavigationContainer>
          <Tabs />
        </NavigationContainer>
      </UsuarioProvider>
    </SafeAreaProvider>
  );
}
