# QA — V4.5.2d-dev2

## Resultado comprovado
- `node tests/v452d2_dragon_souls.test.mjs`: 10/10 contratos passaram.
- `npm run test:v452d`: 7/7 herdados passaram.
- `npm run test:v452c`: benchmark de farm e telemetria passaram; o resultado normal manteve a banda anterior de 35–47 CS por rota.
- `node --check engine.mjs` + `python tools/sync_browser_v43.py`: passaram; 58 exports.
- `npm test` completo: **TIMEOUT** do ambiente na sequência V4.5.1, após os testes históricos anteriores concluírem. Não afirmar suite completa aprovada.
- Chromium/Windows: **NOT_RUN**. Testes de desempenho multiplayer: **NOT_RUN**.

## Cenários cobrindo alma
Infernal AoE/ICD/recursão; Hextech cadeia com limite e slow; Ocean HoT/Mana temporal e escala em minions; Montanha escudo/recarga; Nuvens R/cooldown; Quimtec dano/mitigação condicional; persistência após morte/snapshot; Barão recall acelerado; kill credit único quando um proc é fatal; ausência de procs secundários.

## Pendências
- Economia de minions, velocidade/windup, freeze TOP/MID ainda parcial.
- Passivos elementais completos, Quimtec heal/shield power e tenacity, Hextech haste/AS, stats Barão + Empowered Recall refinado, reuso de efeitos por campeões.
- Falta VFX por projétil, replay causal/PvP autoritativo, sincronização visual WebGL/GLB.
- Valores de treinamento baseados na página wiki mas precisam de certificação por patch antes de 1:1.

## Referência utilizada
- https://wiki.leagueoflegends.com/en-us/Dragon_Soul (efeitos e durações indicativos)
- https://wiki.leagueoflegends.com/en-us/Hand_of_Baron (Recall e aura)
