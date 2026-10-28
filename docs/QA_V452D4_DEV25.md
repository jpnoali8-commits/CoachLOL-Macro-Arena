# CoachLOL — QA V4.5.2d-4-dev25

## Resultado principal

| Gate | Resultado |
|---|---|
| Novos contratos de equivalência | **PASS 5/5** |
| `npm test` integral | **PASS — exit 0** |
| Motor Node/browser | **PASS — 68 exports sincronizados** |
| Chromium: cerco de 8 ticks, atlas + SVGs | **PASS — 15/15 sprites, 0 erros JS** |
| Auditoria multidraft | **30/30 vitórias naturais Nexus** |
| Interrupções por orçamento real do teste | **0/30** |
| Erros de invariantes | **0** |
| Média em 30 partidas | **26.28 min (26:17)** |
| Mediana | **25:28** |
| P10 / P90 | **21:27 / 33:18** |
| Min / Max | **21:10 / 36:03** |
| Balanceamento 30min em campeões completos | **NÃO CERTIFICADO** |
| Partida orgânica completa no Chromium | **NOT_RUN** |

## Perfis e duração média

| Draft de teste | Conclusões | Média observada |
|---|---:|---:|
| baseline | 6/6 | 27.95 min |
| poke | 6/6 | 29.59 min |
| engage | 6/6 | 23.36 min |
| scaling | 6/6 | 24.24 min |
| assassins | 6/6 | 26.24 min |

## Benchmarks de desempenho
- Mesmo script e seed 26/baseline sob orçamento de 35s: **dev24 8429ms**, **dev25 5806ms**.
- Estado final/hash idênticos `18a59984e4085d03a312ff20`; mesma duração 1998s, mesmo vencedor, estruturas e ausência de issues.
- Ganho localizado: 31.12% menos tempo registrado, máquina e carga do processo podem influenciar.
- Referência em `docs/QA_EVIDENCE_V452D4_DEV25/performance_comparison_seed26.json`.

## Como reproduzir
```sh
npm test
python tools/sync_browser_v43.py
node tests/v452d4_dev25_spatial_performance.test.mjs
MAX_PROBE_MS=40000 python tools/audit_pacing_v452d4_dev25.py --workers 2 --timeout 75 --seeds 26 36 42 55 77 101 --max-seconds 2700
python tests/browser_v452d4_dev25_siege_smoke.py
```

## Transparência técnica
- O orçamento de **40s por processo é exclusivo do harness**; não finaliza partida no motor.
- Média foi calculada com 30/30 partidas concluídas, sem excluir casos por censura.
- São cinco drafts sintéticos e seis seeds, e vários campeões usam atributos/kits simplificados. Não certificamos equilíbrio do roster completo nem paridade 1:1 com LoL.
- Otimizações não alteram visibilidade do inimigo, dados fornecidos ao cliente ou isolamento futuro de PvP.
- As capturas Chromium são da fixture de cerco controlada, não de uma partida completa de 30min no browser.
