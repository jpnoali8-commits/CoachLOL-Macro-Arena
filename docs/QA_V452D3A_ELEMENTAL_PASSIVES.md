# QA V4.5.2d-3A — passivos por stack, 26/10/2026

## Escopo testado — `implemented/tested_partial`

| Comando ou condição | Resultado nesta execução | Evidência |
|---|---|---|
| `node --check engine.mjs` | **PASS** | Exit 0 |
| `node --check engine.browser.js` | **PASS** | Exit 0 |
| `npm run test:v452c` | **PASS** | 3 seeds normais e 3 estratégias de wave, mais roaming |
| `npm run test:v452d` | **PASS** | 7/7 |
| `npm run test:v452d2` | **PASS** | 10/10 |
| `npm run test:v452d3` | **PASS** | 10/10, 0–3 stacks nos 6 tipos, snapshot, kill/respawn, tempo simulado, CC, dano, cura, AH/AS, ledger |
| `python tools/sync_browser_v43.py` | **PASS** | 60 exports; gerado de fonte canônica |
| `npm test` **COMPLETO** | **PASS** | Exit 0; 8,57 s; inclui todos os legados até d3-A |
| Chromium headless screenshot 1600×900 | **TIMEOUT/NOT_CERTIFIED** | Disponível Chromium 144; execução limitada a 28s expirou (exit 124), sem captura de tela. NÃO declarar smoke visual aprovado |
| PvP/WebSocket, 5v5 10 Smite, milhares de atores | **NOT_RUN** | Fora do escopo d3-A e sem infraestrutura online |

### Regressão de farm V4.5.2c — mesmas seeds

| Seed | TOP | MID | ADC | Invariantes |
|---|---:|---:|---:|---:|
| 36 | 43 | 35 | 41 | 0 |
| 451 | 47 | 35 | 46 | 0 |
| 452 | 44 | 35 | 46 | 0 |

Roaming ADC: 0 CS. Freeze na seed 36: TOP 16 CS / 1 morte, MID 22, ADC 46; **freeze ainda `partial`**. Slow push 43/35/41; fast push 16/10/27. Nenhum CS concedido sem last hit nos cenários normais.

### Novos contratos

1. Tabela de seis elementos, 0/1/2/3 stacks: coeficientes e não mutação de base.
2. Registro com origem `camp id + spawnCycle`, quantidade e deduplicação, red/blue isolados; Soul separada.
3. Infernal AD/AP derivado e poder do ataque básico sem multiplicação dupla.
4. Montanha armor/MR e mitigação real do campeão, sem dar stats aos minions.
5. Hextech AH/CD determinístico e proxy de AS com uma única cobrança de mana/cooldown.
6. Quimtec CC tenacity elegível, knockup não elegível, um multiplicador de cura/escudo.
7. Nuvens OOC vs em combate e slow resist.
8. Oceânico cura fracionária a cada 5s simTime.
9. Snapshot/respawn e mudança simulada de stats sem reaplicações cumulativas.
10. Zero stacks conserva baseline de AA/cooldown.

### Fontes e reservas

- Riot patch 26.21, 20/10/2026: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
- Wiki comunitária Dragon Slayer, lida 26/10/2026: https://wiki.leagueoflegends.com/en-us/Hextech_Dragon_Soul
- Mesmo com todos os testes PASS, **0 kits/itens/sistemas têm certificado 1:1 global**. AS é aproximação derivada de intervalo e efeitos antigos de Baron/Elder continuam experimentais. Full test agora PASS mas Chromium inconclusivo.

### Segredo/fog

A ledger de captura é parte de `snapshotV40` do servidor/local completo, **não** um payload de PvP. Só as equipes com permissão devem receber journals filtrados. Auditoria de eventos ocultos de d3-B/C/D está pendente. Não publicar snapshot bruto em cliente adversário.
