# CoachLOL V4.5.3-dev29 — Relatório QA

## Gates executados

| Gate | Resultado | Evidência |
|---|---|---|
| 9 contratos novos: receitas, Brilho, Trindade, Cutelo, Youmuu, snapshot | **PASS 9/9** | `docs/QA_EVIDENCE_V453_DEV29/npm_test_full.log` |
| `npm test` integral, inclusive regressões dev1–dev28 | **PASS exit 0** | mesmo log |
| Motor Node/browser | **PASS (68 exports)** | `engine.browser.js` gerado por `tools/sync_browser_v43.py` |
| Chromium, compra da Youmuu e clique no ativo | **PASS** | `chromium_items_report.json`, `youmuu_shop_active_chromium.png` |
| 15 SVG CC0 + atlas no Chromium | **PASS (15/15)** | mesmo JSON |
| Erros JavaScript no Chromium | **0** | mesmo JSON |
| Pacing cinco composições × duas seeds | **10/10 Nexus natural**, sem censura de CPU | `pacing_audit_10.json` |
| Comparação com dev28 — vencedores | **10/10 iguais** | `pacing_comparison_dev28_dev29.json` |
| Comparação com dev28 — hashes finais | **4/10 idênticos, 6 diferentes** | idem; mudanças do catálogo |
| Partida manual completa com itens e PvP online | **NÃO CERTIFICADA** | pendente |

## Números observados

- Média atual: **1641.6 s (27min22s)**; antes 27min29s (1649s). Diferença amostral de apenas ~7 segundos, sem calibragem específica para este lote.
- 10/10 partidas concluídas; vencedor natural de Nexus, nenhum limite artificial; perfis baseline, poke, engage, scaling, assassins e seeds 26/42.
- Mesmos vencedores: True; tempo idêntico 7/10; hash final idêntico 4/10. **Não alegar determinismo cruzado à dev28**: existe conteúdo novo e o bot pode comprar Adaga, portanto o percurso muda. Dentro da dev29, o mesmo seed/draft continua reproduzível e o snapshot de passivos é testado.
- Chromium: ativação da Youmuu elevou velocidade de **363.2 para 426.36** unidades de HUD, até t=6s e CD até t=45s. Cenário controlado sem gameplay completo.

## Lacunas

- Verificação completa de atributos, consumíveis, equipamentos avançados e famílias mutuamente exclusivas; alterações de patch; passivas com múltiplos eventos por frame, windups/ataques fracionários; IA que saiba escolher o melhor build; HUD de cooldown e tooltip específicos por item; balanceamento com campeões 1:1; 30 minutos como distribuição mais ampla (hoje amostra pequena).
- LoL Data Dragon não é fonte suficiente para reproduzir mecânicas. Esta entrega não incorpora dados oficiais completos nem os declara certificados.
- Verificar permissões e direitos de uso das marcas, personagens e assets oficiais antes de distribuir comercialmente; política de desenvolvedor em https://developer.riotgames.com/docs/lol.
