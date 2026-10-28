# Estado oficial — três chats Dev69

**Data:** 2026-10-28. **Status: BOOTSTRAP — BLOQUEADO PARA DESENVOLVIMENTO NO REPOSITÓRIO.**

- Repositório privado: `jpnoali8-commits/CoachLOL-Macro-Arena`.
- `main`, `dev69/skills`, `dev69/items`, `dev69/integration` foram criadas a partir do README inicial; **nenhuma contém ainda o jogo completo**.
- **Base de referência real:** CoachLOL V4.5.3-dev68, ZIP `CoachLOL_MacroArena_V453_Dev68_Lux_Q_Projetil_2_Alvos_PvP_JogoCompleto.zip`.
- SHA-256 do ZIP: `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be`.
- Inventário original: **2.549 entradas ZIP**, incluindo **566 arquivos internos .git**. Integridade CRC passou no relatório da dev68.
- O histórico Git embarcado deve ser preservado como backup; a árvore de trabalho da dev68 tem mudanças ainda não representadas pelo último commit antigo. Não assumir que o estado de `git log` antigo é a dev68.

## Critério para liberar dev69

1. Importar de forma verificável os arquivos reais de código, testes, dados e assets necessários à execução; não substituir por stubs.
2. Preservar cópia íntegra do ZIP e, preferivelmente, histórico Git herdado durante a migração.
3. Conferir `version.json` = `4.5.3-dev68`, `package.json`, `engine.mjs`, `engine.browser.js`, `multiplayer.html`, `app.js`, `AGENTS.md` e `tests/v453_dev68_lux_projectile_pvp.test.mjs`.
4. Validar que `npm run test:v453:dev68` e os testes de regressão selecionados podem executar a partir do clone da base publicada.
5. Só então promover `main` à **base dev68 real**, alinhar as três branches ao commit validado e mudar este status para `READY`.

**Até READY:** chats podem pesquisar, revisar documentação, preparar matrizes e especificações; não implementar como se o GitHub já tivesse a engine. Não certificar testes executados antes da importação.
