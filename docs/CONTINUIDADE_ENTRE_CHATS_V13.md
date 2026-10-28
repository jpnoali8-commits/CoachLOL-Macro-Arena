# Handoff CoachLOL v1.3 — Mundo Vivo

Esta versão sucede a v1.2 (farm/XP e HUD). Nunca recomeçar a partir do HTML antigo da v0.5.

## Fontes do projeto
- `index.html`, `styles.css`, `app.js`: gameplay top-down e HUD.
- `engine.mjs`: motor Node testável.
- `engine.browser.js`: espelho da engine para browser (deve permanecer sincronizado).
- `draft.html`: Champ Select aprovada; preservar.
- `data/`: JSON 4096 + máscara amostrada.
- `assets/`: mapa, ícones de jungle, campeões etc.
- `tests/core.test.mjs`: 30 testes existentes.
- `tests/live.test.mjs`: 8 testes de mundo vivo.
- `docs/AUDITORIA_MUNDO_VIVO_GATES.md`: estado e critérios de aceite.

## Decisões de UX já aprovadas
- mapa do usuário é fonte de verdade, sem inventar geometrias;
- Champ Select vertical (azul esquerda, pool centro, vermelho direita);
- HUD do campeão flutuante sobre o tabuleiro, não mural no menu lateral;
- clicar no aliado e no mapa define destino persistente;
- farm, autoataque, seguir lane e postura são independentes da rota;
- planejar cinco campeões por vez, com bot offline e fog justa;
- mundo continua movimentando-se enquanto se planeja;
- em encontros inesperados, ambos devem poder escolher reações, sem vantagem de tempo;
- a barreira de reação bilateral ainda está pendente, especialmente para PvP.

## Ponto exato para próximo chat

Implementar **gate L06**: reação simultânea em interceptações, com pausa local das unidades afetadas e mundo continuando fora do encontro. Construir testes de visão, escolha e timeout. Depois implementar L07 (multi-select RTS) e L08 (E2E visual no ambiente com browser disponível).

## Cuidados
- Não misturar contagem regressiva de decisão com velocidade do jogo sem contrato de tempo.
- Não usar imagem antiga nem voltar à perspectiva isométrica arbitrária.
- Não afirmar suporte multiplayer completo enquanto servidor autoritativo não existir.
- Preservar máscaras, ids das 22 torres e coordenadas manuais.
- Não anunciar “LoL 1:1” enquanto faltarem habilidades, itens, runas e matchups oficiais.
