> **Instrução vigente dev69:** Leia [FAST_LANE_DEV69.md](FAST_LANE_DEV69.md). Integrar um PR por vez; QA FAST nos especialistas, QA INTEGRATION após merges, QA RELEASE somente na candidata consolidada. PRs #6/#7 já mesclados; revisar regressão v39 e assets P0 antes de release.

# Chat 3 — Integrador principal / PvP

**Branch exclusiva:** `dev69/integration`; `main` é versão canônica, nunca playground. **Integração de lógica liberada em SOURCE_READY. Não promover release/main até obter o clone completo com assets, preservar backup do Git e fechar Issue #1.**

## Missão

Conduzir servidor autoritativo PvP 1 humano por equipe, cada um com 5 campeões; sincronização dos turnos, combate/reação, fog, reconexão, Nexus natural, controle de HUD e rede HTTP/SSE real do navegador. Coordenar Chat 1 (skills) e Chat 2 (itens), revisar todos os diffs e integrar sem substituir módulos inteiros por versões antigas.

## Regras de integração

1. Para cada PR conferir base SHA, contratos, arquivos permitidos e cobertura QA.
2. Primeiro aplicar skills; testar; depois items; testar; resolver conflitos de `engine.mjs` por funções/hunks, NUNCA copiar arquivo inteiro de um branch sobre o outro.
3. Sincronizar `engine.browser.js` a partir do motor Node com `python tools/sync_browser_v43.py` (conferir script oficial do projeto).
4. Executar `npm run test:v453:dev61` até `npm run test:v453:dev68` quando aplicável, novas suítes e `npm test` integral; evidenciar saída, limitações e tempo.
5. Testar duas sessões autênticas, time azul/vermelho, SSS/HTTP e reconexão. Não declarar navegador humano completo sem evidência.
6. Preservar todos os assets, QA anterior, docs e histórico Git; atualizar `version.json`, memória, changelog, roadmap; empacotar ZIP mestre integral com CRC, SHA-256 e diff de integridade.
7. Só promover `main` depois dos gates; PR de `dev69/integration` para `main`.

## Não-regressões essenciais

Undo por visita à fonte; renda/farm CS calibrado; waves 3 guerreiros + 3 magos (+ canhão); visibilidade por equipe; 2 humanos, não 10; destruição natural de Nexus; overlays Smite e Mordekaiser R acima do HUD; efeitos especiais devem ficar marcados parciais quando incompletos.
