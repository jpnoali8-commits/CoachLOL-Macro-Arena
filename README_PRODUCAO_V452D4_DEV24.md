# CoachLOL — V4.5.2d-4-dev24

Esta entrega é uma **auditoria de duration/pacing e desempenho**, não um rebalanceamento de campeões.

## Comandos

- `npm test`: regressão completa do jogo; inclui os cinco novos contratos dev24.
- `node tests/v452d4_dev24_pacing_compositions.test.mjs`: contratos rápidos.
- `MAX_PROBE_MS=6000 python tools/audit_pacing_v452d4_dev24.py --workers 2 --timeout 20 --seeds 26 36 --max-seconds 2700`: lote reproduzido.
- `node tools/pacing_match_v452d4_dev24.mjs 26 baseline 2700`: seed + composição individuais.

**MAX_PROBE_MS é um limite de tempo real do harness (wall clock)**, não afeta o relógio nem o resultado do jogo. Se encerrado pelo limite, contabilizar como censurado. Para obter partidas sem censura, aumentar o tempo do harness e o timeout e reduzir paralelismo. `docs/QA_EVIDENCE_V452D4_DEV24/pacing_audit.json` contém os resultados reais.

No lote de 10 cenários, 7 Nexus foram destruídos, 3 cenários interrompidos por limite de teste. A média de 23:12 vale **apenas** para os sete concluídos e NÃO representa o balanceamento geral. A média de 28:07 da dev23 veio de cinco seeds de UM draft padrão.

Não substituir regras de LoL por timers que concedem vitória. Pendências: profiler A*, calibração com kits auditados, mais partidas, visual Chromium do fluxo completo.
