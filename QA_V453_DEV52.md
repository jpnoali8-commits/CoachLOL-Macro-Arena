# QA — V4.5.3-dev52

| Verificação | Resultado |
|---|---|
| `node tests/v453_dev52_minions_items.test.mjs` | 15/15 PASS |
| `npm test` (regressão histórica + dev52) | PASS (saída 0) |
| Sincronização Node/browser | PASS, 71 exports |
| Seed 26, Nexus destruído | PASS, 1284 s, vencedor Vermelho |
| Seed 42, Nexus destruído | PASS, 1400 s, vencedor Azul |
| Invariantes das duas partidas | nenhuma violação |
| Chromium visual | NÃO CERTIFICADO; sem novas capturas |
| Ícones oficiais offline Riot 16.21.1 | PENDENTE |
| Full LoL parity de farm/collision/item effects | NÃO CERTIFICADO |

## Fatos auditados

- O resolvedor físico usado sem restrição reduziu o CS TOP de referência para 29 em cinco minutos; a regressão foi corrigida preservando o comportamento inicial e liberando o novo seletor após a abertura. Não se alteraram limiares de testes para mascarar o problema.
- A única expectativa de teste histórico atualizada foi a exigência `referenceOnly >=120` da dev49, substituída pelo invariante de contagem `playable + referenceOnly == normalStore` para suportar expansão real.
- As fontes de preços e receitas são arquivos da Riot Data Dragon 16.21.1 integrados no ZIP; nenhuma Wiki como fallback.
- Cinzas do Destino ainda não aplica bônus a monstros; Semblante só amplifica efeitos por V41; os minions ainda usam progressão longitudinal anterior para farm.
- Checkpoint de estados (foco, itens, DOT), compra e venda, temporização do DOT, bloqueios e seleção de alvos verificados.

## Evidências

Em `docs/QA_EVIDENCE_V453_DEV52/`: `npm_test_full.log`, `long_match_seed_26.json`, `long_match_seed_42.json`, `test_dev52.log`.
