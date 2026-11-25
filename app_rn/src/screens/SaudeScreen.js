import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GraficoBarras from '../components/GraficoBarras';
import dados from '../data/dados_saude.json'; // estático, gerado por dados/gerar_dados_saude.py

export default function SaudeScreen() {
  const [indice, setIndice] = useState(0);
  const [aberto, setAberto] = useState(false);
  const categoria = dados.graficos[indice];

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Saúde em dados.</Text>
        <Text style={styles.sub}>Informação também é uma forma de prevenção.</Text>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PANORAMA OCUPACIONAL</Text>
          <Text style={styles.heroTitulo}>Como o trabalho afeta quem desenvolve?</Text>
          <Text style={styles.heroTexto}>
            Explore dados sobre as condições mais frequentes na área de tecnologia.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>INCIDÊNCIA REPORTADA</Text>
          <Text style={styles.cardTitulo}>{categoria.titulo}</Text>

          {/* seletor (dropdown) */}
          <Pressable style={styles.select} onPress={() => setAberto(!aberto)}>
            <Text style={styles.selectTexto}>{categoria.nome}</Text>
            <Text style={styles.selectSeta}>{aberto ? '▴' : '▾'}</Text>
          </Pressable>
          {aberto &&
            dados.graficos.map((c, i) => (
              <Pressable
                key={c.id}
                style={styles.opcao}
                onPress={() => {
                  setIndice(i);
                  setAberto(false);
                }}
              >
                <Text style={[styles.opcaoTexto, i === indice && styles.opcaoAtiva]}>
                  {c.nome}
                </Text>
              </Pressable>
            ))}

          <GraficoBarras
            labels={categoria.labels}
            series={categoria.series}
            horizontal={categoria.horizontal}
          />

          {/* DoencaOcupacional: nome, sintomas e fator de risco */}
          {(categoria.detalhes || []).map((d) => (
            <View key={d.nome} style={styles.doenca}>
              <Text style={styles.doencaNome}>{d.nome}</Text>
              <Text style={styles.doencaTexto}>
                Sintomas: {d.sintomas}. Fator de risco: {d.fatorRisco}.
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#f3ede2' },
  conteudo: { padding: 20, paddingBottom: 120 }, // espaço para a barra de abas flutuante
  titulo: { fontSize: 28, fontWeight: '700', color: '#1c2b27' },
  sub: { color: '#6b7a75', marginTop: 4, marginBottom: 18, fontSize: 15 },
  hero: { backgroundColor: '#c9dce8', borderRadius: 18, padding: 18, marginBottom: 16 },
  eyebrow: { fontSize: 11, letterSpacing: 1.4, color: '#6b7a75' },
  heroTitulo: { fontSize: 22, fontWeight: '600', color: '#1c2b27', marginVertical: 8 },
  heroTexto: { color: '#4d5f59', fontSize: 14 },
  card: { backgroundColor: '#fffdf8', borderRadius: 18, padding: 18 },
  cardTitulo: { fontSize: 20, fontWeight: '600', color: '#1c2b27', marginVertical: 8 },
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d6d0c4',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectTexto: { fontSize: 14, color: '#1c2b27' },
  selectSeta: { color: '#6b7a75' },
  opcao: { paddingVertical: 10, paddingHorizontal: 12 },
  opcaoTexto: { fontSize: 14, color: '#4d5f59' },
  opcaoAtiva: { color: '#2f6f5e', fontWeight: '700' },
  doenca: { backgroundColor: '#f8f9f6', borderRadius: 12, padding: 10, marginTop: 8 },
  doencaNome: { fontSize: 13, fontWeight: '700', color: '#1c2b27' },
  doencaTexto: { fontSize: 11, color: '#6b7a75', marginTop: 2, lineHeight: 16 },
  fonte: { fontSize: 10, color: '#6b7a75', marginTop: 16 },
  aviso: { fontSize: 11, color: '#b3541e', marginTop: 6, fontWeight: '600' },
});
