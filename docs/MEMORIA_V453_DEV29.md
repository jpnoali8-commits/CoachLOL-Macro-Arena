# Memória de continuidade — CoachLOL V4.5.3-dev29

**CANÔNICA:** Não usar dev28 para continuar; usar a pasta completa da dev29. Não rebasear, resetar ou limpar arquivos sujos herdados no Git.

**Objetivo do usuário:** partida offline tática 5v5 com fim natural por Nexus, média desejada aproximadamente **30min**, sem finalizar por cronômetro, manter máscaras de colisão e visão do autor, Oracle detecta através de paredes mas pink não.

## Estado implementado

`engine.mjs`, `engine.browser.js`, `app.js`: 8 novas entradas de catálogo e receitas: dagger, sheen, phage, hearthbound_axe, rectrix, trinity_force, black_cleaver, youmuus_ghostblade. Interface real inclui botão de Youmuu no inspector.

Passivos: Spellblade do Brilho/Trindade, Quicken da Trindade/Fago, redução Carve de 5 stacks do Cutelo, bônus fora de combate e sprint ativo da Youmuu. Ainda não certificado LoL 1:1; sem ghosting, AD-base aproximado.

Provas: npm test PASS 9/9 novos + antigos; fixture Chromium PASS com atlas e 15 SVGs; 10/10 partidas completas, média 27min22s; apenas 4/10 hashes dev28 mantidos devido a compras reais de componentes novos, vencedores 10/10 iguais.

## Próximo lote recomendado

V4.5.3-dev30: auditoria automática de itens oficial Data Dragon 16.21.1 quando disponível; expandir consumíveis, passivas de crítico/on-hit, botas e ativáveis específicos, regras de exclusividade e ícones/descrições sem glyphs improvisados; testes de interface e economia (receita, compra na fonte, slots, revenda). Não expandir todos de uma vez sem testes. Depois V4.5.4 atributos e kits de campeões em lotes (Nidalee/Elise/Shyvana, Mordekaiser 1v1).

## Comandos

`npm test`, `npm run test:v453:dev29`, `python tests/browser_v453_dev29_item_shop.py`, `python tools/audit_pacing_v452d4_dev25.py --workers 2 --timeout 85 --seeds 26 42 --output docs/QA_EVIDENCE_V453_DEV29/pacing_audit_10.json`.

**Não alegar**: paridade integral com LoL, todos itens, jogo completo manual online, nem hashes iguais à dev28.
