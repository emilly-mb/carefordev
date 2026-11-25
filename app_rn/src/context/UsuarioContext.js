import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mesmo papel do localStorage da versão web: guarda o perfil e a pontuação no aparelho.
const CHAVE = 'carefordev:usuario';
const VAZIO = { nome: '', idade: '', genero: '', profissao: '', turno_trabalho: '', pontuacao: 0 };

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(VAZIO);
  const [carregado, setCarregado] = useState(false); // true depois de ler o que estava salvo

  // 1) Ao abrir o app: lê o perfil salvo.
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const bruto = await AsyncStorage.getItem(CHAVE);
        if (bruto && ativo) setUsuario({ ...VAZIO, ...JSON.parse(bruto) });
      } catch (erro) {
        console.warn('Não foi possível ler os dados salvos:', erro);
      } finally {
        if (ativo) setCarregado(true);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  // 2) Sempre que o perfil muda (depois de carregado): grava no aparelho.
  useEffect(() => {
    if (!carregado) return;
    AsyncStorage.setItem(CHAVE, JSON.stringify(usuario)).catch((erro) =>
      console.warn('Não foi possível salvar os dados:', erro)
    );
  }, [usuario, carregado]);

  const salvarPerfil = useCallback((dados) => setUsuario((atual) => ({ ...atual, ...dados })), []);
  const adicionarPontos = useCallback(
    (pontos) =>
      setUsuario((atual) => ({ ...atual, pontuacao: (Number(atual.pontuacao) || 0) + pontos })),
    []
  );

  const valor = useMemo(
    () => ({ usuario, carregado, salvarPerfil, adicionarPontos }),
    [usuario, carregado, salvarPerfil, adicionarPontos]
  );

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error('useUsuario precisa estar dentro de <UsuarioProvider>.');
  return contexto;
}
