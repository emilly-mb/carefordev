// Aba Saúde: lê o JSON estático gerado por dados/gerar_dados_saude.py e desenha com Chart.js.
// Os textos seguem o diagrama de classes: Estatistica (titulo, valor, fonte, anoReferencia)
// e DoencaOcupacional (nome, sintomas, fatorRisco). Sem API nem banco: só um servidor de arquivos
// estáticos (fetch não funciona em file://).
const DADOS_URL = 'data/dados_saude.json';

const PALETA = ['#3f7965', '#d98b5f', '#69a48f', '#c9a24a', '#7b9bb0', '#b07aa1'];
const COR_FUNDO_CARD = '#ffffff';

let dadosSaude = null;

document.addEventListener('DOMContentLoaded', iniciar);

async function iniciar() {
  const select = document.getElementById('health-category');
  const status = document.getElementById('health-status');
  try {
    const resposta = await fetch(DADOS_URL, { cache: 'no-cache' });
    if (!resposta.ok) throw new Error(`Falha ao carregar ${DADOS_URL} (${resposta.status})`);
    dadosSaude = await resposta.json();
    if (!Array.isArray(dadosSaude.graficos) || !dadosSaude.graficos.length) {
      throw new Error('Nenhum gráfico encontrado no JSON.');
    }

    // Padrões globais do Chart.js (docs: Chart.defaults)
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.font.size = window.matchMedia('(min-width: 1100px)').matches ? 14 : 12;
    Chart.defaults.color = '#59665f';

    select.innerHTML = '';
    dadosSaude.graficos.forEach((g) => select.add(new Option(g.nome, g.id)));
    select.addEventListener('change', () => mostrarGrafico(select.value));
    mostrarGrafico(select.value);

    status.textContent = dadosSaude.exemplo
      ? 'Os valores são apenas para demonstração'
      : '';
  } catch (erro) {
    console.error(erro);
    select.innerHTML = '<option value="">Dados indisponíveis</option>';
    status.textContent =
      'Não foi possível carregar os dados. Abra a página por um servidor (ex.: python -m http.server), não por file://.';
    document.getElementById('health-source').textContent = erro.message;
  }
}

function mostrarGrafico(id) {
  const grafico = dadosSaude.graficos.find((g) => g.id === id);
  if (!grafico) return;

  document.getElementById('chart-title').textContent = grafico.titulo;
  document.getElementById('chart-description').textContent =
    `${grafico.grupo} • valor total: ${grafico.total.toLocaleString('pt-BR')} notificações`;
  document.getElementById('health-source').textContent =
    `Fonte: ${grafico.fonte} • ${dadosSaude.ocupacao} • Ano de referência: ${grafico.anoReferencia}`;
  mostrarDetalhes(grafico);

  const canvas = document.getElementById('health-chart');
  canvas.setAttribute('aria-label', descreverParaLeitorDeTela(grafico));

  const config = montarConfig(grafico);
  const existente = Chart.getChart(canvas);
  if (existente && existente.config.type === config.type
      && existente.options.indexAxis === config.options.indexAxis) {
    // Mesmo tipo e orientação: atualiza e chama update() (docs: "Updating Charts").
    existente.data = config.data;
    existente.options = config.options;
    existente.update();
  } else {
    if (existente) existente.destroy(); // tipo diferente: recriar
    new Chart(canvas, config);
  }
}

// Lista as DoencaOcupacional do gráfico: nome, sintomas e fator de risco.
function mostrarDetalhes(grafico) {
  const lista = document.getElementById('health-details');
  lista.innerHTML = '';
  (grafico.detalhes || []).forEach((d) => {
    const li = document.createElement('li');
    const nome = document.createElement('strong');
    nome.textContent = d.nome;
    const texto = document.createElement('span');
    texto.textContent = `Sintomas: ${d.sintomas}. Fator de risco: ${d.fatorRisco}.`;
    li.append(nome, texto);
    lista.appendChild(li);
  });
  lista.hidden = lista.children.length === 0;
}

// ---- Configuração Chart.js: { type, data: { labels, datasets }, options } ----
function montarConfig(grafico) {
  const tipo = grafico.tipo || 'bar';
  const varias = grafico.series.length > 1;
  const horizontal = tipo === 'bar' && grafico.horizontal;
  const detalhes = Object.fromEntries((grafico.detalhes || []).map((d) => [d.nome, d]));

  const datasets = grafico.series.map((serie, i) => ({
    label: serie.nome,
    data: serie.valores,
    ...estiloDataset(tipo, i, grafico.labels.length),
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false, // altura vem do .chart-wrapper (position: relative)
    plugins: {
      legend: {
        display: varias || tipo === 'doughnut',
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8, padding: 14 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => textoTooltip(ctx, tipo, horizontal),
          afterLabel: (ctx) => {
            const d = detalhes[ctx.label];
            return d ? [`Sintomas: ${d.sintomas}`, `Fator de risco: ${d.fatorRisco}`] : [];
          },
        },
      },
    },
  };

  if (tipo !== 'doughnut') {
    options.indexAxis = horizontal ? 'y' : 'x';
    const eixoValor = {
      beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#edf0ec' }, border: { display: false },
    };
    const eixoRotulo = { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0 } };
    options.scales = horizontal ? { x: eixoValor, y: eixoRotulo } : { y: eixoValor, x: eixoRotulo };
    if (!horizontal) options.interaction = { mode: 'index', intersect: false };
  } else {
    options.cutout = '58%';
  }

  return { type: tipo, data: { labels: grafico.labels, datasets }, options };
}

function estiloDataset(tipo, i, quantidade) {
  const cor = PALETA[i % PALETA.length];
  if (tipo === 'line') {
    return { borderColor: cor, backgroundColor: cor, borderWidth: 2.5, tension: 0.3,
             pointRadius: 4, pointHoverRadius: 6, fill: false };
  }
  if (tipo === 'doughnut') {
    return {
      backgroundColor: Array.from({ length: quantidade }, (_, k) => PALETA[k % PALETA.length]),
      borderColor: COR_FUNDO_CARD, borderWidth: 3, hoverOffset: 6,
    };
  }
  return { backgroundColor: cor, borderRadius: 7, maxBarThickness: 44 };
}

function textoTooltip(ctx, tipo, horizontal) {
  const valor = tipo === 'doughnut' ? ctx.parsed : (horizontal ? ctx.parsed.x : ctx.parsed.y);
  if (tipo === 'doughnut') {
    const soma = ctx.dataset.data.reduce((a, b) => a + b, 0);
    return `${ctx.label}: ${valor} (${Math.round((100 * valor) / soma)}%)`;
  }
  return `${ctx.dataset.label}: ${valor}`;
}

// <canvas> não é lido por leitores de tela: resumimos os dados no aria-label.
function descreverParaLeitorDeTela(grafico) {
  const partes = grafico.labels.map((rotulo, i) =>
    `${rotulo}: ${grafico.series.map((s) =>
      grafico.series.length > 1 ? `${s.nome} ${s.valores[i]}` : s.valores[i]).join(', ')}`);
  return `${grafico.titulo}. ${partes.join('; ')}.`;
}
