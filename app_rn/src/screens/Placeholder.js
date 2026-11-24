import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Placeholder({ titulo, texto }) {
  return (
    <SafeAreaView style={styles.tela}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#f3ede2', padding: 20 },
  titulo: { fontSize: 28, fontWeight: '700', color: '#1c2b27' },
  texto: { color: '#6b7a75', marginTop: 6, fontSize: 15 },
});
