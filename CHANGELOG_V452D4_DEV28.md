# CoachLOL V4.5.2d-4-dev28 — Changelog

- FIX CRÍTICO: removida checagem `lineOfSight` da **detecção radial Oracle**, deixando controle/pink com checagem de terreno.
- FIX: `wardKnownTo` permite varredura através da parede mesmo sem visão da região; a visibilidade geral do mapa NÃO aumenta.
- FIX: Oracle desativa visão de wards comuns e suporte, incluindo Lumes Feéricos, com cauda de dois segundos após saída do alcance.
- FIX: o ataque contra wards ainda respeita parede, além de alcance e visibilidade.
- TESTE: expectativa de Oracle no antigo teste dev27 corrigida **explicitamente** e registrada, mantendo as outras oito verificações.
- TESTE: dez novos contratos, Chromium com Oracle/pink e assets locais; fluxo de partida bot 5v5 até destruição real do Nexus, seguido pelo pós-jogo completo.
- REGRESSÃO: todas as suítes passam; dez partidas multi-draft, dez hashes e durações iguais à dev27 (média 27:29).
- ESCOPO: sem novas habilidades de campeões, itens/receitas ou mudanças no balanceamento nesta etapa.
