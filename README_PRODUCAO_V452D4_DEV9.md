# CoachLOL — produção V4.5.2d-4-dev9

Base única: jogo completo V4.5.2d-4-dev8, evoluído de forma não destrutiva para dev9.

## Executar
1. Extraia o ZIP sem substituir arquivos por ZIP histórico.
2. Execute `npm run test:v452d4:dev9` e `npm test`.
3. `python tools/sync_browser_v43.py`, `node --check engine.mjs`, `node --check engine.browser.js`, `node --check app.js`.
4. Abra o jogo offline pelo lançador existente; na disputa do último tick configure F ou D no overlay e escolha Golpear ou reservar.

## Quando a disputa acontece
- Ambos os junglers precisam ter Smite pronto (carga, cooldown, pet e alcance).
- O monstro deve estar no último turno de execução pelo Smite, não a dois ou mais turnos.
- Sem Smite nos dois lados: não abrir diálogo D/F; usar sorteio por proporção de campeões presentes **após dano letal real**.
- Cada Vastilarva mantém crédito individual; não distribuir automaticamente o pacote de três.

## QA/pendências
Ver `docs/QA_V452D4_DEV9.md` e `docs/MEMORIA_V452D4_DEV9.md`. O sistema offline é adaptação tática, **não** LoL PC 1:1 nem multiplayer.
