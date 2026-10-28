# Auditoria de engenharia CoachLOL V4.1 — revisão honesta

## Comparação com a V4.0

V4.0 permitia aplicar root/stun/slow com campos isolados e reduzia HP/escudos diretamente. A V4.1 acrescenta `EffectResolverV41` como serviço de regras tipadas, mantém camadas legadas para não quebrar o motor e expõe API auditável. Não reescreve render nem o mapa.

| Módulo | V4.1 | Evidência | Risco residual |
|---|---|---|---|
| `EFFECT_TYPES_V41` e ledger | Implementado | test v41: catálogo, refresh, cleanse, durations | diferenças de stack por kit |
| CC cast/movement/AA | Implementado para primitives | tests: stun, root, silence, suppression, blind | fear/charm/taunt sem forced motion |
| Penetração/dano | Dano legado com absorb pelo ledger | tests tipo true/magic/physical | hits ainda não atômicos com commit |
| Escudos | Tipos physical, magic, all, spell | testes de ordem/expiração/consumo | alguns antigos em `u.shield` |
| Tenacidade, slow | Simulados em tempo e movimento | tests tenacity / slow resist | exceções e diminishing detalhado pendentes |
| Anti-heal e vampirismo | `heal()` unificado para principais skills | tests de 40% e lifesteal | kits/passivas ainda não auditados |
| Ignite | DoT true + antiheal com legado de ticks | teste V3.5 e V4.1 | janela de 5s e dano escalado aproximados |
| Fog | `effectJournalForV41(team)` redige IDs ocultos | test com ambas equipes | redaction seguro apenas com servidor |
| Snapshot | V4.0 preservado | teste retomada de três ticks | não é replay causal integral |
| Browser HUD | Badges e detalhe | Chromium inline sem console errors | não testa carregamento de imagens online |
| Long-run 300s | Aprovado | v20_long_match.mjs 300 26 | 300s não provam cobertura completa |

## Falhas explicitamente NÃO resolvidas

- Diversos handlers modificam `u.shield`, `hp` por sistema de progressão ou `slowPercent` fora do registro de efeitos.
- Falta transação com rollback de **efeito + consumo** e validação servidor de entrada independente do cliente.
- Taunt/charm/fear não movem alvo compulsoriamente; silêncio, knockups, knockback e imunidades têm exceções por kit.
- Incendiar mantém fila antiga de ticks por compatibilidade. Efeitos genéricos DoT/HoT usam timer novo, sem duplicar o Incendiar.
- Há efeitos de escudo universal que coexistem com `barrierAmount`/escudo legado; decidir migração por subsistema após testes.
- Replay V4.0 usa snapshot e hash FNV não criptográfico; sem log de ordens original não é reprodução fim a fim.

## Fontes comparativas (consultadas em 26/10/2026)

- https://wiki.leagueoflegends.com/en-us/Types_of_Crowd_Control — diferenciações de CC, tenacidade, estase e supressão.
- https://wiki.leagueoflegends.com/en-us/Grievous_Wounds — redução de cura 40% no efeito padrão.

As fontes são referências de mecânica, **não certificação de paridade**. É necessário pinning do patch e conferência com Riot para cada kit.
