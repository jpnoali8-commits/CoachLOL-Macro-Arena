# QA — CoachLOL Macro Arena V4.5.3-dev65

## Escopo efetivamente implementado

- `order.combo` em planejamento via duas sessões HTTP e gateway autoritativo. O `targetId` deve ser de campeão adversário **visível**, vivo e válido; nenhum alvo de fog é promovido a visível pelo cliente.
- Um campeão ativo por combo (o seleção múltipla de movimento continua disponível). Validação de QWER aprendidas e feitiços equipados antes de registrar a ordem, máximo 12 etapas; nenhuma alteração de loadout após início.
- Execução na fila real do motor com mana, cooldown, impacto em HP, Ignite com DoT temporizado e reação manual do outro jogador. Simetria azul/vermelho.
- Persistência do comando durante checkpoint pré-turno e proteção de replay do recibo. Em caso de cooldown/range indisponível, a execução continua seguindo o motor herdado; não afirmamos paridade integral de 173 kits.
- UI 16:9/compacta preto-dourado: montador durante planejamento, opções desabilitadas quando não aprendidas/não equipadas e tela de reação dev64 mantida.

## Evidências executadas

| Gate | Resultado | Arquivo |
|---|---|---|
| Novo E2E dev65, 2 equipes × 14 contratos | **PASS 28/28** | `docs/QA_EVIDENCE_V453_DEV65/dev65.log` |
| Chromium real (offline HTML com projeções HTTP reais) | **PASS 13/13**, 0 erros JS | `chromium_planned_combos_report.json`, `dev65_{blue,red}_planned_combo.png` |
| `npm test` histórico completo incluindo dev65 | **PASS exit 0** | `npm_test_full.log`, `npm_test_exit_code.txt` |
| `npm run test:v453:dev61` | PASS | `dev61.log` |
| `npm run test:v453:dev62` | PASS | `dev62.log` |
| `npm run test:v453:dev63` | PASS | `dev63.log` |
| `npm run test:v453:dev64` | PASS | `dev64.log` |
| `python tools/sync_browser_v43.py` | PASS 73 exports | `sync_browser.log` |
| `node --check` motor Node, motor browser, gateway, client | PASS | `syntax.log` |

## Limites e não certificações

- O combo testado para as duas equipes foi **Q → Incendiar** com impacto real, gasto de mana, recarga, DoT e interposição de reação do defensor. Não foram executadas exaustivamente todas as combinações QWER/itens ou todos os 173 kits.
- Testes E2E são duas sessões HTTP programáticas reais, com cookies e servidor. Não são uma partida manual com dois humanos.
- Chromium montou ações com projeções HTTP obtidas do E2E e rodou scripts reais na página offline; transporte HTTP/SSE browser-native permanece **NOT_CERTIFIED**, devido ao bloqueio de localhost no ambiente.
- Nenhum dos 100 itens `reference_only` foi promovido e nenhum item recebeu certificação 100% nova. Base de patch continua LoL PC **26.21 / Data Dragon 16.21.1** do arquivo legado.
- Não foi alterada a fórmula de dano/farm/minions/estrutura. `npm test` executa os testes antigos; amostra estatística nova de 30+ seeds NÃO executada.
- Regras de Desfazer da fonte e visibilidade permanecem inalteradas.
