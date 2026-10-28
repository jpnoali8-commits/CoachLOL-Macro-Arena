# QA — CoachLOL V4.5.3-dev68

## Escopo testado

- Lux Q projétil autoritativo, até duas colisões, roots por impacto, terreno/barreiras/escudos, CC impedindo cast mas não apagando projétil.
- Fluxo de combo PvP autenticado em duas sessões HTTP; controle azul/vermelho, replay idempotente, checkpoint e restauração de projétil.
- Custos/cooldowns só ao lançar, não ao enfileirar; progressão reprodutível por snapshot.
- Teste V4.2 Lux Q refeito para impacto após tempo de voo, preservando todas as expectativas de colisão/escudo.

## Gates

| Gate | Resultado | Evidência |
|---|---|---|
| Novos contratos dev68 | **PASS 40/40** | `docs/QA_EVIDENCE_V453_DEV68/dev68_contract.log` |
| V4.2 + dev42/43/65/66/67 | **PASS** | `docs/QA_EVIDENCE_V453_DEV68/regression_selected.log` |
| `npm test` integral | **PASS — exit 0** (segunda execução; primeira interrompida por limite) | `docs/QA_EVIDENCE_V453_DEV68/npm_test_full_retry.log` |
| Engine Node/browser | **PASS 73 exports**, sintaxe validada | `docs/QA_EVIDENCE_V453_DEV68/sync.log` |
| CRC e preservação ZIP | **PASS** (CRC, SHA-256, 566 Git idênticos) | arquivo de integridade independente |

## Limitações

- Testes PvP possuem duas sessões autenticadas, porém são automatizados. Partida manual completa de dois humanos **NOT_RUN**.
- Chromium HTTP/SSE nativo em duas abas **NOT_RUN**; visualização de trajetória de Lux Q no cliente **NOT_CERTIFIED**.
- Lux Q é contrato parcial. Velocidade 1200 u/s é modelagem autoral, não estatística oficial; outros QWER e especiais não são declarados completos.
- Não foram adicionados itens ao catálogo jogável nem revalidados preços/certificação dos 100 referenciais.

A primeira execução foi interrompida quando alcançava dev63; a segunda completou com código 0, preservando os dois logs para auditoria.
