# Auditoria V3.9 — limites de paridade e risco de regressão

## Entrega realmente instalada

A base é V38.2 (já integra V38.1 seleção + fog + cinematic foundation), com as seguintes alterações incrementais: `engine.mjs`/`engine.browser.js` mantidos sincronizados; `STAT_SCHEMA_V39` exposto para UI; `championStatsV39()` fornece projection read-only; `hasteCooldown()` e `abilityCooldown()` aplicam AH; `castGateV39()` + `commitCastV39()` exigem rank, vida, alcance opcional, vision hook, mana e cooldown e gastam exatamente uma vez; os caminhos de Nami W alvo e de combo QWER usam o gate/commit; `queueDirectionalSkill()` recebe **coordenada** para Lux/Nami/Vex R com linha em mundo e observação por time; `queueVexRecast()` usa marca e deslocamento navegável aproximado; XP/levels anteriores foram preservados; 1×/2× comprime o tempo de parede de planejamento/execução com mesmos ticks de simulação; tooltip lateral detalhado auto-fecha ao clicar fora.

## Dívida crítica não escondida

1. `resolveSpecialUltimates()` ainda tem cooldown e mana próprios e não migrou ao executor novo.
2. `resolveQueuedCombos()` possui feitiços/summoners com custos diretos, e modo normal de `resolveCombat()` contém abstrações de treino. Não há garantia de um único executor universal em todos os casts da V3.9.
3. `damage()` já faz true damage, penetration e sustain por damage dealt, mas não tem sistema completo de proc/on-hit/AoE healing reduction/stacking, shield type e mitigação diferencial contra estruturas/monstros por item.
4. Stats iniciais corretos por campeão existem apenas para Jinx, Nami e Ahri em `CHAMPION_STATS_V38`; maioria dos campeões ainda usa classes genéricas. Valores `0` no overlay indicam ausência de fonte de bônus, não habilidade necessariamente inexistente no kit final.
5. Alguns itens de catálogo antigo podem ter stats simplificados ou preço defasado. Os itens adicionados nesta etapa foram checados em fontes públicas; converter tudo exige catálogo Riot Data Dragon/CommunityDragon versionado e aprovações por patch.
6. Movimento de R2 Vex ainda não tem tempo de voo, exceções de terreno, estado de dash detalhado, imunidades e reset de ultimate por eliminação.
7. `gameSpeed` 2× é **local e não configura matchmaking**. Checagem de velocidade deve ser selecionada no lobby e validada por servidor após V4.6; bot não é adversário PVP seguro.
8. Seleção e HUD carregam imagens pela internet quando disponíveis, com fallback local; testes headless sem rede exibem placeholders em ícones e retratos.
9. Precisamos distinguir tempo de preparação em segundos de parede dos segundos de `roundSeconds` e de gameTime. V3.9 mantém o primeiro com speedFactor, sem tocar relógio de simulação.
10. Sobre direitos e atualização: itens, balanceamentos e especificações de terceiros são dinâmicos e podem mudar por patch. Esta entrega não garante fidelidade 1:1.

## Base para data-driven action bank

Ações canônicas são validadas e executadas pelo motor, não por regex textual. `intent:{actorIds,action,targets,area,stage,conditions,sequence,options}` -> validation -> planning -> server lock -> deterministic effect -> visibility-redacted event journal -> timeline presentation. Templates reutilizáveis por mecânica, manifestos por campeão, sem compartilhar números ou exceções incorretamente.

- `cast_line`: [Lux R laser, Nami R wave, Vex R projectile]. Diferenciam alcance por rank, largura, dano, colisões e recast, apesar de usar estrutura de trajectory comum.
- `recast`: Vex R2, outros staged ults — não duplicar cooldown/mana, verificar estado de marca, time-to-live e interrupção.
- `chain_targeted`: Nami W com bounce distinto.
- `directional_block`: Yasuo W, Braum E, Mel W requerem geometria/colisão específicas.
- `attack_combo`: membros selecionados com passos ordenados por campeão; não revela draft do oponente.

## Referências

- Riot Games — Patch 10.23: fórmula de Ability Haste e substituição do CDR antigo.
  https://www.leagueoflegends.com/en-us/news/game-updates/patch-10-23-notes/
- LoL Wiki / Haste: https://wiki.leagueoflegends.com/en-us/Haste
- Item data: https://wiki.leagueoflegends.com/en-us/Glowing_Mote ; https://wiki.leagueoflegends.com/en-us/Kindlegem ; https://wiki.leagueoflegends.com/en-us/Caulfield%27s_Warhammer ; https://wiki.leagueoflegends.com/en-us/Ionian_Boots_of_Lucidity ; https://wiki.leagueoflegends.com/en-us/Serrated_Dirk ; https://wiki.leagueoflegends.com/en-us/Vampiric_Scepter
- Vex Shadow Surge / recast: https://wiki.leagueoflegends.com/en-us/Vex
- Dados internos existentes: `docs/ROADMAP_CANONICO_V38_2.md`, `docs/BIBLIA_PRODUCAO_COACHLOL.md`, `docs/AUDITORIA_V38_2_ENGENHARIA.md`.
