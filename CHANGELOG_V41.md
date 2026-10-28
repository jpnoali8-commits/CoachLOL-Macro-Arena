# CoachLOL Macro Arena V4.1.0 — Ledger universal de efeitos

Data: 26/10/2026. Base única: V4.0.0 (`CoachLOL_MacroArena_v40_Executor_Journal_Checkpoints_Offline.zip`). Nenhum código antigo V3.7 substituiu a base.

## Implementado

- `EffectResolverV41` e `EFFECT_TYPES_V41` no motor Node e browser: 24 primitivas reutilizáveis, incluindo root/stun/knockup/suppression, fear/charm/taunt/silence/disarm/blind, invulnerabilidade, estase, resistência a CC, escudos e DoT/HoT.
- Ledger de estados tipados por campeão com ID monotônico, origem, durações em segundos simulados, potência, prioridade estável por validade e ID, refresh da mesma fonte e cumulatividade por fontes diferentes.
- Gate de conjuração V4.0 consulta bloqueios V4.1 antes de consumir mana, cooldown ou cargas; movimentos automáticos e ataques básicos consultam CC.
- Tenacidade reduz CC elegíveis; airborne e suppression não são reduzidos. Slow afeta velocidade com resistência à lentidão.
- Dano existente passa por absorção tipada de escudos físicos/mágicos/universais e rejeita dano em estase/invulnerabilidade. Blind bloqueia dano de AA, spell shield absorve uma conjuração/CC modelada.
- Cura da Nami W, Soraka R simplificada, Curar, sustento e diversas curas de rotina usam função comum, com feridas dolorosas a 40% (protótipo).
- Incendiar antigo permanece na fila `ignite_dot` para não quebrar saves e contrato V3.5, agora possui `grievous_wounds` via ledger e ticks de dano verdadeiro.
- Registros de efeitos/curas/dano por equipe redigem o ID de fontes e alvos ocultos segundo visibilidade no instante da ocorrência (adaptação offline).
- Novo bloco de efeitos temporários com duração no HUD direito e no painel detalhado de atributos.
- Snapshots V4.0 continuam restaurando status, contadores e journal V4.1 sem nova versão incompatível de schema.

## Validação

- `npm test` — regressão histórica + 20 novos contratos da V4.1, todos aprovados.
- `node tests/v20_long_match.mjs 300 26` — terminou sem erros de invariantes.
- Chromium inline (recursos incorporados) — sem erros JS, painel de atributos e badge temporário `root 5s` verificados. Retratos/assets não são renderizados integralmente no ambiente inline.

## Limites não concluídos

- Motor de efeitos **parcialmente centralizado**. Dano de minion/tower/jungle e sistemas legados ainda têm mutações fora do EffectResolver; nenhum rollback atômico end-to-end entre gasto de mana e hit foi implementado.
- Fear/charm/taunt: bloq./permissões implementados, mas deslocamento forçado e ordem obrigatória de ataque ainda não são fiéis ao LoL. Shield of spell não representa colisões de múltiplos projéteis simultâneos.
- Curas de fonte/level-up e regeneração de recursos são regras de progressão, não spells, e ainda existem fora do ledger.
- Replay continua por snapshot e RNG retomáveis, não execução causal completa desde o início.
- Sigilo por equipe ainda é lógica de apresentação local; multiplayer seguro exige backend autoritativo V4.6.
- Kits não auditados individualmente, GLB/VFX/habilidades passivas não completos; não anunciar 1:1.
