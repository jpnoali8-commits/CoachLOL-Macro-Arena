# CoachLOL Macro Arena — base V4.5.3-dev29

**Primeiro lote funcional de itens** produzido sobre a dev28.

## Executar

1. Abrir `index.html` offline ou servir a pasta por servidor local.
2. `npm test` cobre histórico completo + dev29.
3. `python tests/browser_v453_dev29_item_shop.py` valida UI de Youmuu no Chromium.
4. `python tools/audit_pacing_v452d4_dev25.py --workers 2 --timeout 85 --seeds 26 42 --output docs/QA_EVIDENCE_V453_DEV29/pacing_audit_10.json` executa pacing (5 elencos × 2 seeds).

## Itens adicionados

Adaga, Brilho, Fago, Machado de Aquecimento, Rectrix, Trindade, Cutelo Negro e Youmuu. Receitas completas para este lote com descontos, venda e snapshots. Ativo Youmuu no painel de um campeão que o possui; passivas no motor.

## Qualidade

`npm test` PASS; 9/9 contratos novos; Chromium PASS e 15/15 SVG; 10/10 vitórias Nexus, média 27min22s; somente 4/10 hashes da dev28 idênticos, porque a economia do bot pode usar itens novos. Passivas não são paridade perfeita de LoL.

Consulte `docs/QA_V453_DEV29.md`, `docs/MEMORIA_V453_DEV29.md`, `docs/ROADMAP_V453_DEV29.md`. Preservar as versões históricas e `.git` herdado sem reset.
