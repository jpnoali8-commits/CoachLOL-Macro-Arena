# CHANGELOG — CoachLOL V4.5.2d-4-dev26

## Correções funcionais

1. `engine.mjs`: novo predicado canônico `wardVisionSuppressedV452d4Dev26`.
2. Control wards (pinks) não desligam outras control wards inimigas.
3. Wards regulares e de suporte perdem visão sob pink inimiga **com linha de visão** e alcance válido; uma pink atrás de parede/moita não suprime além da linha visível.
4. `visionSources(team)` compartilha o mesmo estado de supressão para raio comum e bônus poligonal dos Lumes Feéricos — corrige o vazamento da superward suprimida.
5. Apenas o setor poligonal dura 45s; o bônus radial de +25% da superward continua até a sentinela acabar ou ficar suprimida, conforme patch 26.1.
6. `app.js`: não desenha região bônus de Lume suprimido, respeitando a mesma regra do motor.
7. `engine.browser.js` regenerado de `engine.mjs` com `tools/sync_browser_v43.py`; 68 exports.

## Não alterado
Dano, HP, farm, ouro, kits, objetivos, Lume 8+4 e máscaras autorais, Rift Elemental, CDR, slots D/F, renderização CC0, Arauto e encerramento natural por Nexus. Histórico Git herdado mantido.

## Testes
- 9 novos contratos, `npm test` integral PASS.
- Chromium fixture: supressão/restauração/visão bônus + canvas, 0 JS errors.
- 10 partidas (5 composições × seeds 26/42) 10/10 Nexus natural, média 27:29, hashes finais **iguais à dev25**.

## Limitações
- Não é certificação de 1:1 de LoL; efeitos de câmera/oponente ainda precisam de e2e de partida.
- Sem jogo inteiro em Chromium nesta etapa.
- Tempo de CPU medido em concorrência diferente não é benchmark comparável à dev25.
