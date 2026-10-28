# QA V4.5.2d-dev1 — objetivos

## Evidência confirmada
- `node tests/v452d_objective_effects.test.mjs`: **7/7 PASS** — buffs por tipo, range, ataque e defesa, desativação ao morrer/sair de range, burn verdadeira discreta, snapshots/estase e não-recursão.
- `node tests/v44_jungle_objectives_teamfights.test.mjs`: **PASS**, 11 contratos.
- `node tests/v45_void_herald_parity.test.mjs`: **PASS**, 11 contratos.
- `node tests/v451_waves_selection_focus.test.mjs`: **PASS**, 11 contratos.
- `node tests/v452_farm_buffs_draft_shop.test.mjs`: **PASS**, 10 contratos.
- `node tests/v452b_target_wave.test.mjs`: **PASS**, 7 contratos.
- `node tests/v452c_farm_ai.test.mjs`: **PASS**, benchmark 3 seeds, roaming e estratégias. TOP/MID/ADC 43/35/41; 47/35/46; 44/35/46. Tempo de uma execução medida: ~16,5s, pico ~116MB.
- Node `--check` em ambas implementações: **PASS**; script de sincronização imprimiu **57 exports**.
- `npm test` agregado foi iniciado e seu log avançou até a matriz V4.5.2c, porém o encerramento/exit code não foi confirmado antes do limite do ambiente. **Não marcar como PASS integral**.
- Chromium e testes de desempenho sob carga: **NOT_RUN**.

## Riscos e limitações
- A redução de dano contra minions do Barão é parametrizada como aproximação, não matriz de dano oficial por patch.
- Ancião burn ocorre em 3 ticks de 1s devido ao timestep; política de interrupção de dano e efeitos por champions precisa de certificação.
- O ZIP de entrada já tinha mudanças Git não commitadas em scripts/planilhas e engine (CRLF). Foram preservadas, sem sobrescritas voluntárias.
- A arquitetura JS continua offline; fog em cliente NÃO representa segurança multiplayer.

## Referências de regras / verificação posterior
- https://wiki.leagueoflegends.com/en-us/Hand_of_Baron
- https://wiki.leagueoflegends.com/en-us/Aspect_of_the_Dragon
- https://wiki.leagueoflegends.com/en-us/Dragon_Soul
- https://www.leagueoflegends.com/en-us/news/game-updates/patch-9-23-notes/
Verificar a vigência exata no patch oficial vigente antes de declarar certificação.
