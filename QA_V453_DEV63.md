# QA — CoachLOL Macro Arena V4.5.3-dev63

## Resultado executado

| Etapa | Resultado | Evidência |
|---|---|---|
| `npm run test:v453:dev61` | PASS 22/22 | `docs/QA_EVIDENCE_V453_DEV63/dev61_regression.log` |
| `npm run test:v453:dev62` | PASS 18/18 | `docs/QA_EVIDENCE_V453_DEV63/dev62_regression.log` |
| `npm run test:v453:dev63` | PASS 25/25 | `docs/QA_EVIDENCE_V453_DEV63/dev63_pvp_nexus_e2e.log` |
| `npm test` integral | PASS saída 0 | `docs/QA_EVIDENCE_V453_DEV63/npm_test_full.log` e `npm_test_exit_code.txt` |
| Node/browser sync | PASS 73 exports + `node --check` | `tools/sync_browser_v43.py` |
| Chromium resultado de partida | PASS 13/13 em dois contextos isolados, sem JS exceptions | `docs/QA_EVIDENCE_V453_DEV63/chromium_result_report.json` + PNGs |

## Escopo dos testes de ponta a ponta

Ambas partidas foram resolvidas pelo **motor PvP autoritativo original**, através de duas sessões HTTP distintas e identificadas por cookies, sem botPlan, sem alterar HP das torres nem inventar condições de vitória. O harness escolhe uma semente conhecida e ordena `order.stop` aos cinco campeões de uma equipe, enquanto a outra equipe prossegue com comportamento padrão de combate/farm e minions do motor. Em todas as rodadas, ambos confirmam via HTTP; a execução de segundos ocorre no **servidor**. A primeira confirmação sozinha não move o relógio. Compra e Desfazer da mesma visita restauram ouro. O teste lê SSE nativo em Node e bloqueia controle de unidades inimigas. Após terminar, o servidor recusa novas ações e confirmações. A retomada após reiniciar o servidor recupera as duas sessões, o resultado e o hash da arena.

- **Seed 26:** 1.423 segundos de jogo; 48 rodadas; vitória azul por destruição do Nexus vermelho; 51 waves.
- **Seed 42:** 1.553 segundos de jogo; 52 rodadas; vitória vermelha por destruição do Nexus azul; 56 waves.
- **Correção central:** em ambos `ended=true`, `phase=finished`, `executionRemaining=0` e ambos veem exatamente o mesmo `winner`. Nenhuma execução artificial de tempo nem mutação de estruturas fora do motor.

### Não certificados (não declarar PASS)

1. **Dupla humana real** operando por navegador durante uma partida completa até o Nexus: NOT_RUN; são clientes **automatizados** de teste.
2. **Chromium HTTP/SSE nativo com mapa e assets reais:** NOT_CERTIFIED. O sandbox bloqueia localhost no Chromium; os 13/13 checks visuais são executados com snapshots finais reais injetados em páginas offline, não com transporte do browser.
3. Q/W/E/R de todos os campeões, combos, feitiços, disputas de Smite, reações durante a partida inteira: NOT_CERTIFIED. As duas partidas de script não dispararam decisões de reação.
4. Ícones oficiais Data Dragon disponíveis offline: NOT_IMPLEMENTED. 100/202 itens referenciais continuam sem compra; 102 vinculados ao motor **não equivalem a 102 kits de efeitos plenamente certificados**.
5. Calibração global de duração em 30min e farm entre vários drafts: NOT_CERTIFIED pela amostra de apenas duas partidas roteirizadas. O código de farm e equilíbrio não foi alterado; regressões históricas foram executadas pelo `npm test`.

## Comandos

```bash
npm run test:v453:dev61
npm run test:v453:dev62
npm run test:v453:dev63
npm test
python tools/chromium_pvp_dev63_result.py
python tools/sync_browser_v43.py
```
