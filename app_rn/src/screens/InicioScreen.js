import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../context/UsuarioContext';

const VERDE_ESCURO = '#1c4233';
const VERDE = '#406a57';

// Mesmas pausas da versão web (index.html).
const PAUSAS = [
  { id: 'olhos', hora: '10:00', titulo: 'Descanso para os olhos', detalhe: 'Regra 20-20-20 • 2 min', icone: 'eye-outline', pontos: 10 },
  { id: 'ombros', hora: '11:00', titulo: 'Mobilidade de ombros', detalhe: 'Solte a tensão acumulada • 4 min', icone: 'body-outline', pontos: 15 },
  { id: 'almoco', hora: '13:30', titulo: 'Pausa para almoço', detalhe: 'Levante e mude de ambiente • 1h', icone: 'cafe-outline', pontos: 20 },
];

export default function InicioScreen({ navigation }) {
  const { usuario, carregado, adicionarPontos } = useUsuario();
  const [concluidas, setConcluidas] = useState([]); // ids das pausas feitas (zera ao reabrir, como na web)

  // Primeiro acesso (sem nome salvo): leva para o Perfil, como o modal da web.
  useEffect(() => {
    if (carregado && !usuario.nome) navigation.navigate('Perfil');
  }, [carregado, usuario.nome, navigation]);

  function concluir(pausa) {
    if (concluidas.includes(pausa.id)) return;
    setConcluidas([...concluidas, pausa.id]);
    adicionarPontos(pausa.pontos);
  }

  const total = PAUSAS.length;
  const feitas = concluidas.length;
  const pct = Math.round((feitas / total) * 100);

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>{usuario.nome ? `Bom dia, ${usuario.nome}.` : 'Bom dia.'}</Text>
            <Text style={styles.sub}>Vamos cuidar de você enquanto você cria?</Text>
          </View>
          <Pressable
            accessibilityLabel="Abrir perfil"
            onPress={() => navigation.navigate('Perfil')}
            style={({ pressed }) => [styles.botaoPerfil, pressed && styles.botaoPerfilAtivo]}
          >
            {({ pressed }) => (
              <Ionicons name="create-outline" size={20} color={pressed ? '#fff' : '#1a1a1a'} />
            )}
          </Pressable>
        </View>

        {/* Minha jornada */}
        <View style={styles.jornada}>
          <Text style={styles.tag}>MINHA JORNADA</Text>
          <Text style={styles.jornadaTitulo}>Um dia de trabalho mais leve.</Text>

          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={20} color="#fff" />
            <View>
              <Text style={styles.infoLabel}>Horário</Text>
              <Text style={styles.infoValor}>{usuario.turno_trabalho || '09:00 — 18:00'}</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="briefcase-outline" size={20} color="#fff" />
            <View>
              <Text style={styles.infoLabel}>Profissão</Text>
              <Text style={styles.infoValor}>{usuario.profissao || 'Desenvolvedor'}</Text>
            </View>
          </View>

          <View style={styles.trilho}>
            <View style={[styles.progresso, { width: `${pct}%` }]} />
          </View>
          <View style={styles.progressoTextos}>
            <Text style={styles.progressoTexto}>Pontuação: {usuario.pontuacao} pts</Text>
            <Text style={styles.progressoTexto}>{pct}% da jornada</Text>
          </View>
        </View>

        {/* Rotina */}
        <Text style={styles.secao}>SUA ROTINA DE HOJE</Text>
        <View style={styles.secaoLinha}>
          <Text style={styles.secaoTitulo}>Pausas recomendadas</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>
              {feitas}/{total} feitas
            </Text>
          </View>
        </View>

        {PAUSAS.map((pausa) => {
          const feita = concluidas.includes(pausa.id);
          return (
            <View key={pausa.id} style={styles.item}>
              <Text style={[styles.hora, feita && styles.horaFeita]}>{pausa.hora}</Text>
              <View style={[styles.ponto, feita && styles.pontoFeito]} />
              <View style={styles.cartao}>
                <View style={styles.icone}>
                  <Ionicons name={pausa.icone} size={20} color={VERDE_ESCURO} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pausaTitulo}>{pausa.titulo}</Text>
                  <Text style={styles.pausaDetalhe}>{pausa.detalhe}</Text>
                </View>
                <Pressable
                  accessibilityLabel={feita ? 'Atividade concluída' : `Concluir ${pausa.titulo}`}
                  disabled={feita}
                  onPress={() => concluir(pausa)}
                  style={({ pressed }) => [styles.botao, (pressed || feita) && styles.botaoVerde]}
                >
                  {({ pressed }) => (
                    <Ionicons
                      name={feita ? 'checkmark' : 'play'}
                      size={16}
                      color={pressed || feita ? '#fff' : VERDE_ESCURO}
                    />
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#f3ede2' },
  conteudo: { padding: 20, paddingBottom: 120 }, // espaço para a barra de abas flutuante
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titulo: { fontSize: 26, fontWeight: '700', color: '#1c2b27' },
  sub: { color: '#737871', marginTop: 4, fontSize: 14 },
  botaoPerfil: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  botaoPerfilAtivo: { backgroundColor: VERDE },

  jornada: { backgroundColor: VERDE_ESCURO, borderRadius: 24, padding: 20, marginTop: 20 },
  tag: { color: '#a9c7b8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  jornadaTitulo: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 6, marginBottom: 14 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, marginBottom: 10,
  },
  infoLabel: { color: '#a9c7b8', fontSize: 11 },
  infoValor: { color: '#fff', fontSize: 15, fontWeight: '700' },
  trilho: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 8, overflow: 'hidden' },
  progresso: { height: '100%', backgroundColor: '#7fb99d', borderRadius: 3 },
  progressoTextos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressoTexto: { color: '#d5e6dd', fontSize: 12 },

  secao: { color: '#737871', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 26 },
  secaoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 14 },
  secaoTitulo: { fontSize: 20, fontWeight: '700', color: '#1c2b27' },
  badge: { backgroundColor: '#e2ece7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTexto: { color: VERDE_ESCURO, fontSize: 12, fontWeight: '600' },

  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  hora: { width: 44, fontSize: 12, fontWeight: '600', color: '#737871' },
  horaFeita: { color: VERDE },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#c2c5bc', marginRight: 8 },
  pontoFeito: { backgroundColor: VERDE },
  cartao: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 18, padding: 12,
  },
  icone: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f3f4f0', alignItems: 'center', justifyContent: 'center' },
  pausaTitulo: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  pausaDetalhe: { fontSize: 11, color: '#737871', marginTop: 2 },
  botao: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#e0e0e0',
    alignItems: 'center', justifyContent: 'center',
  },
  botaoVerde: { backgroundColor: VERDE, borderColor: VERDE },
});
