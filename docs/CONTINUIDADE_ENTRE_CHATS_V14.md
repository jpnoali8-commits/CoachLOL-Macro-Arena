# Handoff CoachLOL — v1.4 HUD tática e perspectiva

A base é v1.3 Mundo Vivo, preservando o mapa e máscaras da v6, biblioteca de campeões e Champ Select. O ponto inicial do próximo chat é a versão v1.4 neste ZIP, **não** a v1.2/v1.3 original.

## Implementado

- HUD do campeão e 12 comandos inteiramente na coluna direita, sem dock inferior. Eventos permanecem em cartão inferior da mesma coluna.
- Controles de teclado após selecionar campeão aliado: B recall, 4 ward, M mover, R rota, F flash, S parar, A ataque, D defesa; Esc cancelar, P perspectiva. Inputs e modal loja não sofrem interferência.
- Ward com seleção no mapa, aproximação se distante, consumo só após colocação, ordem persistente.
- Recall finaliza na fonte, abre a loja do campeão correto, bloqueia retorno automático; decisão manual de voltar à lane.
- Câmera de mapa com taper visual, slider 0-55%, toggle top-down e inversão rigorosa dos cliques.

## Próximas ações

1. Executar smoke E2E em um navegador local sem restrição de `localhost` e testar múltiplos tamanhos de viewport.
2. Refinar renderização e iluminação do mapa, ícones, fog e classes de unidades, preservando a geometria da máscara.
3. Reavaliar L06: barreira de reação simultânea em interceptações e timeout local por unidade (server-authoritative ainda não existe).
4. L07 seleção múltipla RTS e ações em grupo; L08 testes browser end-to-end.
5. Antes de publicar, cumprir gate de autorização de IP/distribuição (ver Bíblia Master Web 2026).

### Arquivos essenciais

`index.html`, `styles.css`, `app.js`, `engine.mjs`, `engine.browser.js`, `data/`, `assets/`, `tests/core.test.mjs`, `tests/live.test.mjs`, `tests/hud_v14.test.mjs`.

### Invariantes

- Os dois motores (`engine.mjs` e browser) precisam espelhar as mesmas regras.
- Não usar transformações CSS para a geometria interativa do tabuleiro; a projeção do desenho e sua inversa devem permanecer sincronizadas.
- Não forçar follow de lane enquanto `awaitingShop` for verdadeiro.
- Não transformar ward em colocação instantânea aos pés do campeão.
- Não colocar comandos grandes sobre a região inferior do canvas.
