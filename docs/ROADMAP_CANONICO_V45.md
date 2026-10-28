# CoachLOL Macro Arena — Roadmap canônico V4.5.0

**Base de produção:** V37 → V38 → V38.1 → V38.2 → V3.9 → V4.0 → V4.1 → V4.2 → V4.3 → V4.4 → **V4.5.0**. A branch V3.7 de cinematics é apenas fonte já integrada de forma seletiva. **Nunca regressar o motor.**

**Referência de conteúdo:** LoL PC, Summoner's Rift padrão, patch 26.21 (26 de outubro de 2026). Definir sempre patch, fonte, maturidade e prova de testes. Conteúdo presente em JSON NÃO implica skill, item ou campeão jogável 1:1.

## Entrega V4.5.0 — objetivos e inventário de dívida

- Três Vastilarvas INDIVIDUAIS: vida e abate próprios, times diferentes podem capturar 1/2, Smite aplica a uma só, sem dano excedente transferido. Registros privados separados por equipe; anúncio de encerramento público.
- Voidmites da cova: aparições periódicas em grupos de quatro por Vastilarva viva, ataques simples, vencimento após seis segundos e zero farm de abate (modelo tático aproximado).
- Toque do Vazio: pilhas por abate, DoT verdadeiro em torres por quatro segundos, alcance e nível do buff visíveis na HUD apenas ao time legítimo. Terceira pilha habilita um Voidmite de cerco com recarga, ataque simplificado.
- Arauto: Olho da equipe vencedora, prazo de coleta de 20 segundos, troca temporária de trinket, duração de 240 segundos, botão de invocação, retorno do trinket e mercenário com trajetória/impactos simplificados contra torres vulneráveis.
- Salvamento: snapshot v4 incluindo estados da cova, Olho, DoT e mercenário, além de compatibilidade de save antigo na UI.
- `data/content_coverage_v45.json`: inventário auditável de conteúdo COM lacunas explícitas, gerado pelo motor e pelos catálogos do projeto.

**Não concluído:** elementos de arte/partículas oficiais, todos os ataques especiais do Arauto, montaria/direção, colisão contínua, interação de cada item/runa/passiva, buffs completos dos dragões, Baron empowered minions, replay causal e PVP seguro.

## Próximas versões sem pular dívida

| Marco | Entrega obrigatória | Gate verificável |
|---|---|---|
| **V4.5.1** | Wave macro: CS real, last hit, ouro/XP, bloqueio de lane, dano de minion/tower, inibidores, superminions, Nexus, pós-jogo | Simulações 5/10/20 min livre/contestado com perdas por rotação; torres respeitam cadeia legal; Nexus encerra partida |
| **V4.5.2** | Buffs Dragon/Soul/Elder/Baron, recompensa e cerco de objetivo por equipe, Arauto + Voidmites avançados | Regras 26.21 auditadas, buffs e durações em segundos simulados, disputas 5v5 e fog |
| **V4.6** | Lobby, filtros de velocidade 1×/2×, matchmaking/bot, servidor autoritativo, reconexão e anti-cheat | Nenhuma intenção secreta disponível ao cliente adversário; replay e snapshots de sessão |
| **V4.7** | Skillshots viajando no mundo, hitboxes, colisão com parede/minion/unidade, recast, cast-range UI e VFX por habilidade | Geometria/cooldown/recast auditados por campeão e testes de colisão/interrupção |
| **V4.8** | Renderizador GLB opcional, vídeo/áudio/câmera, timeline cinematográfica e fallback offline | Eventos de apresentação não alteram dano/visão/duração |
| **V4.9** | Banco de ações reutilizáveis, AST seguro de comandos de texto, multi-champion steps/condicionais | Validação do executor, testes de ações ilegais, determinismo e fog |
| **V5.x — certificação contínua** | Packs versionados de campeões, itens, runas, feitiços e mecânicas únicas, por patch | 1:1 somente com fonte, manifesto individual, casos-limite e regressão; nenhuma certificação em lote por suposição |

## Lotes de conteúdo V5.x (em paralelo à engenharia, sem promessas de um patch único)

1. **Fundamentos:** stat base + crescimento por nível 1–18, AA range/timer, tipos de dano, penetração, tenacidade, mana/energia/sem recurso, passivas.
2. **Feitiços:** kit passiva + Q/W/E/R, stacks, direcional, alvo, solo, formas, transformações, recasts, resets, invocações, pets, dano de área, projéteis/colisões, escalonamento por rank e nível.
3. **Itens/builds:** receitas, unicidade, venda, transformações, passivas nomeadas, procs, cooldown de ativos, efeitos on-hit, escudos, penetração, anti-cura, gold income, multiplicadores, exceções por classe/range.
4. **Runas/feitiços de invocador:** árvores completas, shards, páginas de lobby, sinergias, buff/debuff, limpeza, exaustão, ignite, smite, flash, teleporte; cooldowns e fontes independentes.
5. **Interação e paridade:** execução por um único executor/EffectResolver, testes cruzados de feitiço × item × runa × campeão × objetivo × fog × replay.

**Método de produção:** implementação compartilhada por mecânica (por exemplo `line_skillshot`, `projectile_interceptor`, `recast_mark`, `shield_physical`, `heal_bounce`), mas parâmetros/handlers por campeão sem perder exceções. Todo registro exige `patch`, `source`, `maturity`, `effectRules`, `targeting`, `range`, `cost`, `cooldown`, `vfxDescriptor`, `testCases`, `remainingIssues`.
