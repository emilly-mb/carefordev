"""
Gera o JSON estático da aba Saúde (web em Chart.js e app React Native).

Modelo de classes (diagrama do projeto) refletido no JSON:
  DoencaOcupacional {nome, sintomas, fatorRisco}   -> "doencasOcupacionais"
  Estatistica {titulo, valor, fonte, anoReferencia} -> "estatisticas" (uma linha por doença/ano)
  Estatistica.gerarGrafico()                        -> "graficos" (montados aqui no Python)

Dois modos:
  python gerar_dados_saude.py           -> DEMO: dados inventados (não precisa de pysus)
  python gerar_dados_saude.py --real    -> REAL: DATASUS/SINAN via pysus 2.11.7
                                           (CBO 2124-05, 2020 a 2026)

O mesmo JSON é gravado nos dois destinos (lidos sem API nem banco):
  ../paginas/data/dados_saude.json      (saude.js + Chart.js)
  ../app_rn/src/data/dados_saude.json   (SaudeScreen.js + React Native)

Cada gráfico casa com data.labels / data.datasets do Chart.js:
  {"id", "nome", "titulo", "fonte", "anoReferencia", "grupo", "tipo": "bar|line|doughnut",
   "horizontal", "total", "labels": [...], "series": [{"nome", "valores"}], "detalhes": [...]}
"""
import argparse
import json
import logging
import random
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
log = logging.getLogger("saude")

AQUI = Path(__file__).parent
CACHE = AQUI / "cache"
SAIDAS = [
    AQUI.parent / "paginas" / "data" / "dados_saude.json",
    AQUI.parent / "app_rn" / "src" / "data" / "dados_saude.json",
]

ANOS = list(range(2020, 2027))
PERIODO = f"{ANOS[0]}–{ANOS[-1]}"
CBO = "212405"
OCUPACAO = "CBO 2124-05, Analista de desenvolvimento de sistemas"
TOP_N = 6
LER, MENTAL = "LER/DORT", "Saúde mental"

# --------------------------------------------------------------------------- #
# Classe DoencaOcupacional: nome, sintomas, fatorRisco (+ grupo para agrupar)
# --------------------------------------------------------------------------- #
CATALOGO = {
    "Lombalgia": {"grupo": LER, "sintomas": "Dor na região lombar e rigidez ao levantar",
                  "fatorRisco": "Postura inadequada"},
    "Tendinite": {"grupo": LER, "sintomas": "Dor e inchaço nos tendões de punhos e mãos",
                  "fatorRisco": "Movimento repetitivo"},
    "Síndrome do túnel do carpo": {"grupo": LER, "sintomas": "Formigamento e dormência nos dedos",
                                   "fatorRisco": "Movimento repetitivo"},
    "Cervicalgia": {"grupo": LER, "sintomas": "Dor e tensão no pescoço",
                    "fatorRisco": "Postura inadequada"},
    "Bursite de ombro": {"grupo": LER, "sintomas": "Dor ao elevar o braço",
                         "fatorRisco": "Ergonomia inadequada"},
    "Ansiedade": {"grupo": MENTAL, "sintomas": "Preocupação excessiva, inquietação e taquicardia",
                  "fatorRisco": "Sobrecarga e prazos"},
    "Depressão": {"grupo": MENTAL, "sintomas": "Tristeza persistente, perda de interesse e fadiga",
                  "fatorRisco": "Isolamento"},
    "Burnout": {"grupo": MENTAL, "sintomas": "Exaustão, cinismo e queda de desempenho",
                "fatorRisco": "Jornada prolongada"},
    "Insônia": {"grupo": MENTAL, "sintomas": "Dificuldade para dormir e sono não reparador",
                "fatorRisco": "Jornada prolongada"},
    "Transtorno de adaptação": {"grupo": MENTAL, "sintomas": "Irritabilidade e desânimo após mudanças",
                                "fatorRisco": "Sobrecarga e prazos"},
}
SEM_INFO = "Não informado"


def info(doenca: str) -> dict:
    return CATALOGO.get(doenca, {"grupo": "", "sintomas": "", "fatorRisco": SEM_INFO})


# --------------------------------------------------------------------------- #
# Montagem comum: linhas {doenca, grupo, ano, valor} -> JSON (gerarGrafico)
# --------------------------------------------------------------------------- #
def somar(linhas, chave):
    out: dict = {}
    for l in linhas:
        out[l[chave]] = out.get(l[chave], 0) + l["valor"]
    return out


def ordenar(d: dict) -> dict:
    return dict(sorted(d.items(), key=lambda kv: kv[1], reverse=True))


def detalhes(nomes):
    return [{"nome": n, "sintomas": info(n)["sintomas"], "fatorRisco": info(n)["fatorRisco"]} for n in nomes]


def montar_json(linhas: list[dict], fonte: str, exemplo: bool) -> dict:
    base = {"fonte": fonte, "anoReferencia": PERIODO}
    graficos = []

    for gid, grupo, tipo in (("ler", LER, "bar"), ("mental", MENTAL, "doughnut")):
        totais = ordenar(somar([l for l in linhas if l["grupo"] == grupo], "doenca"))
        if not totais:
            continue
        graficos.append({
            "id": gid, "nome": grupo, "grupo": grupo,
            "titulo": f"Notificações por doença: {grupo}", **base,
            "tipo": tipo, "horizontal": tipo == "bar", "total": sum(totais.values()),
            "labels": list(totais),
            "series": [{"nome": "Notificações", "valores": list(totais.values())}],
            "detalhes": detalhes(totais),
        })

    fatores = ordenar(somar([{**l, "fator": info(l["doenca"])["fatorRisco"]} for l in linhas], "fator"))
    if set(fatores) - {SEM_INFO}:
        graficos.append({
            "id": "fatores_risco", "nome": "Fatores de risco", "grupo": "DoencaOcupacional.fatorRisco",
            "titulo": "Notificações por fator de risco", **base,
            "tipo": "bar", "horizontal": True, "total": sum(fatores.values()),
            "labels": list(fatores),
            "series": [{"nome": "Notificações", "valores": list(fatores.values())}],
        })

    por_grupo = {g: somar([l for l in linhas if l["grupo"] == g], "ano") for g in (LER, MENTAL)}
    graficos.append({
        "id": "por_ano", "nome": "Notificações por ano", "grupo": f"{LER} e {MENTAL}",
        "titulo": "Notificações por ano de referência", **base,
        "tipo": "line", "horizontal": False, "total": sum(l["valor"] for l in linhas),
        "labels": [str(a) for a in ANOS],
        "series": [{"nome": g, "valores": [por_grupo[g].get(a, 0) for a in ANOS]} for g in (LER, MENTAL)],
    })

    nomes = list(dict.fromkeys(l["doenca"] for l in linhas))
    return {
        "exemplo": exemplo,
        "gerado_em": datetime.now().strftime("%Y-%m-%d"),
        "ocupacao": OCUPACAO,
        "periodo": PERIODO,
        "doencasOcupacionais": [{"nome": n, "sintomas": info(n)["sintomas"],
                                 "fatorRisco": info(n)["fatorRisco"]} for n in nomes],
        "estatisticas": [  # classe Estatistica: titulo, valor, fonte, anoReferencia
            {"titulo": f"Notificações de {l['doenca']}", "valor": l["valor"], "fonte": fonte,
             "anoReferencia": l["ano"], "doenca": l["doenca"]} for l in linhas
        ],
        "graficos": graficos,
    }


def salvar(dados: dict) -> None:
    for destino in SAIDAS:
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")
        log.info("JSON gerado em %s", destino)


# Modo dados inventados, utilizados no app

BASE_TOTAL = {  # total inventado 2020–2026 por doença
    "Lombalgia": 410, "Tendinite": 360, "Síndrome do túnel do carpo": 280,
    "Cervicalgia": 230, "Bursite de ombro": 140,
    "Ansiedade": 390, "Depressão": 300, "Burnout": 270,
    "Transtorno de adaptação": 190, "Insônia": 150,
}
# Peso de cada ano (2026 é parcial). Saúde mental cresce mais que LER/DORT.
PESO_ANO = {
    LER: [0.10, 0.12, 0.15, 0.17, 0.18, 0.19, 0.09],
    MENTAL: [0.06, 0.09, 0.13, 0.17, 0.21, 0.24, 0.10],
}


def gerar_demo() -> dict:
    rng = random.Random(2124)  # semente fixa = mesmo JSON sempre
    linhas = []
    for doenca, base in BASE_TOTAL.items():
        grupo = info(doenca)["grupo"]
        total = round(base * rng.uniform(0.92, 1.08))
        brutos = [p * rng.uniform(0.95, 1.05) for p in PESO_ANO[grupo]]
        valores = [round(total * b / sum(brutos)) for b in brutos]
        valores[-2] += total - sum(valores)  # a soma bate com o total
        linhas += [{"doenca": doenca, "grupo": grupo, "ano": a, "valor": v}
                   for a, v in zip(ANOS, valores)]
    return montar_json(linhas, "Dados fictícios para demonstração", exemplo=True)


# Modo REAL: DATASUS/SINAN via pysus (versão não utilizada no ap)

COL_CBO = ["ID_OCUPA_N"]


AGRAVOS = {
    "LERD": (LER, ["LOC_ANAT", "REGIAO_ANA", "PARTE_CORP"]),
    "MENT": (MENTAL, ["CID_10", "DIAG_CID", "AGRAVO_CID"]),
}
ROTULOS_CORPO: dict[str, str] = {}  # código da parte do corpo -> nome (dicionário SINAN)
ROTULOS_CID = {
    "F32": "Depressão", "F33": "Depressão recorrente", "F41": "Ansiedade",
    "F43": "Transtorno de adaptação", "F51": "Insônia", "F10": "Álcool", "Z73": "Burnout",
}


def achar(df, candidatas):
    return next((c for c in candidatas if c in df.columns), None)


def baixar_ano(sinan, agravo: str, ano: int):
    import pandas as pd
    CACHE.mkdir(exist_ok=True)
    cache = CACHE / f"{agravo}_{ano}.parquet"
    if cache.exists():
        return pd.read_parquet(cache)
    try:
        arquivos = sinan.get_files(dis_code=agravo, year=ano)
        if not arquivos:
            log.warning("%s %s: sem arquivo publicado", agravo, ano)
            return None
        df = sinan.download(arquivos).to_dataframe()
        df.to_parquet(cache)
        return df
    except Exception as e:  # noqa: BLE001
        log.warning("%s %s: falhou (%s)", agravo, ano, e)
        return None


def coletar(sinan, agravo: str) -> list[dict]:
    """Linhas {doenca, grupo, ano, valor} do CBO 212405 para um agravo."""
    import pandas as pd
    grupo, colunas = AGRAVOS[agravo]
    partes = []
    for ano in ANOS:
        df = baixar_ano(sinan, agravo, ano)
        if df is None or df.empty:
            continue
        c_cbo = achar(df, COL_CBO)
        if not c_cbo:
            log.error("%s %s: coluna de CBO não encontrada. Colunas: %s", agravo, ano, list(df.columns))
            continue
        c_val = achar(df, colunas)
        if not c_val:
            log.error("%s %s: coluna do valor não encontrada. Colunas: %s", agravo, ano, list(df.columns))
            continue
        cbo_limpo = df[c_cbo].astype(str).str.replace(r"\D", "", regex=True)
        ti = df[cbo_limpo == CBO]
        log.info("%s %s: %d notificações do CBO %s", agravo, ano, len(ti), CBO)
        v = ti[c_val].astype(str).str.strip()
        v = v.str.upper().str[:3].map(lambda x: ROTULOS_CID.get(x, x)) if agravo == "MENT" \
            else v.map(lambda x: ROTULOS_CORPO.get(x, x))
        partes.append(pd.DataFrame({"ano": ano, "doenca": v}))
    if not partes:
        return []
    tudo = pd.concat(partes, ignore_index=True)
    tudo = tudo[~tudo["doenca"].isin(["", "nan", "None"])]
    top = tudo["doenca"].value_counts().head(TOP_N).index
    cont = tudo[tudo["doenca"].isin(top)].groupby(["doenca", "ano"]).size()
    return [{"doenca": d, "grupo": grupo, "ano": int(a), "valor": int(n)} for (d, a), n in cont.items()]


def gerar_real() -> dict:
    from pysus import SINAN
    sinan = SINAN().load()
    linhas = coletar(sinan, "LERD") + coletar(sinan, "MENT")
    return montar_json(linhas, "DATASUS/SINAN", exemplo=False)


def main():
    parser = argparse.ArgumentParser(description="Gera o JSON da aba Saúde.")
    parser.add_argument("--real", action="store_true",
                        help="usa DATASUS/SINAN via pysus (padrão: dados inventados)")
    args = parser.parse_args()
    salvar(gerar_real() if args.real else gerar_demo())


if __name__ == "__main__":
    main()
