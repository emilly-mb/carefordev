import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import InicioScreen from '../screens/InicioScreen';
import ExerciciosScreen from '../screens/ExerciciosScreen';
import SaudeScreen from '../screens/SaudeScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

// name = rota; icone = Ionicons (outline quando inativo)
const ABAS = [
  { name: 'Início', component: InicioScreen, icone: 'home' },
  { name: 'Exercícios', component: ExerciciosScreen, icone: 'barbell' },
  { name: 'Saúde', component: SaudeScreen, icone: 'stats-chart' },
  { name: 'Perfil', component: PerfilScreen, icone: 'person' },
];

export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Início"
      screenOptions={({ route }) => {
        const aba = ABAS.find((a) => a.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: false, // rótulo desenhado no próprio ícone
          tabBarStyle: styles.barra,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.item, focused && styles.itemAtivo]}>
              <Ionicons
                name={focused ? aba.icone : `${aba.icone}-outline`}
                size={20}
                color={focused ? '#1c4233' : '#8a9791'}
              />
              <Text style={[styles.rotulo, focused && styles.rotuloAtivo]}>{route.name}</Text>
            </View>
          ),
        };
      }}
    >
      {ABAS.map((a) => (
        <Tab.Screen key={a.name} name={a.name} component={a.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barra: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#fffdf8',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    width: 70,
    height: 52,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  itemAtivo: { borderColor: '#1c4233', backgroundColor: '#f3ede2' },
  rotulo: { fontSize: 10, color: '#8a9791', marginTop: 2 },
  rotuloAtivo: { color: '#1c4233', fontWeight: '700' },
});
