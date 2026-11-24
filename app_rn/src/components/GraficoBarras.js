import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Mesma paleta da versão web (saude.js).
const PALETA = ['#3f7d68', '#d98b5f', '#69a48f', '#c9a24a', '#7b9bb0', '#b07aa1'];

// Lê o formato do JSON: labels + series [{ nome, valores }].
// Uma série = uma barra por rótulo; várias séries = barras agrupadas com legenda.
// (O Chart.js precisa de <canvas>/DOM e não roda em React Native, então aqui as barras são nativas.)
export default function GraficoBarras({ labels = [], series = [], altura = 230, horizontal = false }) {
  if (!labels.length || !series.length) {
    return <Text style={styles.vazio}>Sem dados para esta categoria.</Text>;
  }
  const maximo = Math.max(1, ...series.flatMap((s) => s.valores));

  // Barras horizontais (uma série): rótulo em cima, trilho com a barra e o valor ao lado.
  if (horizontal && series.length === 1) {
    return (
      <View style={styles.listaH}>
        {labels.map((rotulo, i) => {
          const valor = series[0].valores[i] ?? 0;
          return (
            <View key={rotulo} style={styles.itemH}>
              <Text style={styles.rotuloH}>{rotulo}</Text>
              <View style={styles.linhaH}>
                <View style={styles.trilhoH}>
                  <View
                    style={[styles.barraH, { width: `${Math.max((valor / maximo) * 100, 3)}%`, backgroundColor: PALETA[0] }]}
                  />
                </View>
                <Text style={styles.valorH}>{valor}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View>
      {series.length > 1 && (
        <View style={styles.legenda}>
          {series.map((s, j) => (
            <View key={s.nome} style={styles.legendaItem}>
              <View style={[styles.ponto, { backgroundColor: PALETA[j % PALETA.length] }]} />
              <Text style={styles.legendaTexto}>{s.nome}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.linha, { height: altura }]}>
        {labels.map((rotulo, i) => (
          <View key={rotulo} style={styles.coluna}>
            <View style={styles.grupo}>
              {series.map((s, j) => {
                const valor = s.valores[i] ?? 0;
                return (
                  <View key={s.nome} style={styles.barraBox}>
                    <Text style={styles.valor}>{valor}</Text>
                    <View style={styles.trilho}>
                      <View
                        style={[
                          styles.barra,
                          {
                            height: `${Math.max((valor / maximo) * 100, 3)}%`,
                            backgroundColor: PALETA[j % PALETA.length],
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <Text style={styles.rotulo} numberOfLines={2}>
              {rotulo}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 6, marginTop: 16 },
  coluna: { flex: 1, alignItems: 'center' },
  grupo: { flex: 1, width: '100%', flexDirection: 'row', gap: 3 },
  barraBox: { flex: 1, alignItems: 'center' },
  valor: { fontSize: 10, fontWeight: '600', color: '#1c2b27', marginBottom: 4 },
  trilho: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eef0ec',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barra: { width: '100%', borderRadius: 6 },
  rotulo: { fontSize: 10, color: '#1c2b27', marginTop: 8, textAlign: 'center' },
  legenda: { flexDirection: 'row', gap: 14, marginTop: 16 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ponto: { width: 8, height: 8, borderRadius: 4 },
  legendaTexto: { fontSize: 11, color: '#4d5f59' },
  vazio: { color: '#6b7a75', marginTop: 24 },
  listaH: { marginTop: 16, gap: 12 },
  itemH: { gap: 4 },
  rotuloH: { fontSize: 12, color: '#1c2b27' },
  linhaH: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trilhoH: { flex: 1, height: 16, backgroundColor: '#eef0ec', borderRadius: 8, overflow: 'hidden' },
  barraH: { height: '100%', borderRadius: 8 },
  valorH: { width: 36, fontSize: 11, fontWeight: '600', color: '#1c2b27', textAlign: 'right' },
});
