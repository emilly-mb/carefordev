# CareForDev — execução local

Projeto com interface web responsiva (Início e Saúde) e app React Native.
Instalar python:
```powershell
-winget install Python.Python.3.12
```

Regenerar os dados dos gráficos:
```powershell
python dados\gerar_dados_saude.py
```

Abrir o site pelo servidor;
use esse código no terminal do projeto:
```powershell
python -m http.server 8000 --directory paginas
```

Baixar o node.js:
```powershell
winget install OpenJS.NodeJS.LTS
```

Atualizar path:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Instalar expo go no celular para versão mobile

- Ir até o path app_rn onde esta configurado para mobile e instalar npm install

Atualizar para expo sdk 54
```powershell
npx expo install expo@^54.0.0 --fix
```
Verificando se ocorreu a atualização certo: 

Atualizar expo:
```powershell
npx expo install expo-font
```
Reinstalar dependências caso de erro: 
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

Conferir se funcionou: 
```powershell
npx expo-doctor@latest
```
Instalar versão recente: 
```powershell
npm install -g expo-cli
```
Iniciar app:
```powershell
npx expo start --tunnel
```

## 1. Requisitos
- Python 3.10 ou superior (só para servir as páginas e gerar o JSON)
- Navegador atualizado

## 2. Abrir a versão web
Na pasta `carefordev`:

```powershell
python -m http.server 8000 --directory paginas
```
- Início: http://127.0.0.1:8000/
- Saúde: http://127.0.0.1:8000/saude.html


Para abrir em outro aparelho na mesma rede Wi-Fi, use `python -m http.server 8000 --bind 0.0.0.0 --directory paginas` e acesse `http://IP-DO-PC:8000` (veja o IP com `ipconfig`).

## 3. Onde ficam os dados do usuário
- Perfil (nome, idade, gênero, profissão, turno) e pontuação: `localStorage` do navegador, chave `carefordev:usuario`.
- São **por aparelho e por navegador**: outro celular ou outro navegador começa do zero, e limpar os dados do site apaga tudo.
- Para recomeçar, limpe os dados do site ou rode `localStorage.removeItem("carefordev:usuario")` no console.

## 4. Gráficos da aba Saúde (JSON estático)
Fluxo: `dados/gerar_dados_saude.py` → `dados_saude.json` → web (`saude.js` + Chart.js) e app (`SaudeScreen.js` + React Native).

```powershell
cd dados
python gerar_dados_saude.py          # DEMO: dados inventados (não precisa de pysus)
pip install -r requirements.txt
python gerar_dados_saude.py --real   # DATASUS/SINAN via pysus (CBO 2124-05, 2020–2026)
```
O script grava o mesmo arquivo em `paginas/data/dados_saude.json` e `app_rn/src/data/dados_saude.json`. O JSON segue o diagrama de classes: `doencasOcupacionais` (nome, sintomas, fatorRisco), `estatisticas` (titulo, valor, fonte, anoReferencia) e `graficos` (resultado de `gerarGrafico()`). Cada gráfico traz `tipo` (`bar`, `doughnut` ou `line`), `horizontal`, `labels` e `series`, que casam com `data.labels` e `data.datasets` do Chart.js. A web usa o tipo indicado; o app React Native desenha barras nativas (Chart.js exige `<canvas>`/DOM).

Os dados gerados são fictícios, estão descritos na página Saúde do projeto.

## Estrutura principal
- `paginas/index.html` + `index_script.js`: painel inicial, perfil e pontuação (localStorage).
- `paginas/saude.html` + `saude.js`: leitura do JSON estático e gráficos Chart.js.
- `paginas/data/dados_saude.json`: dados da aba Saúde (gerado pelo Python).
- `paginas/style.css`: estilos responsivos compartilhados.
- `dados/gerar_dados_saude.py`: gerador do JSON (demo ou real).
- `app_rn/`: versão mobile React Native/Expo.
