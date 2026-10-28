# Roadmap canônico CoachLOL Macro Arena — V4.5.2

Não substituir esta base pelo ZIP histórico V3.7, V4.4 ou V4.5.0. Todos os marcos são incrementais.

| Etapa | Objetivo | Porta de saída |
|---|---|---|
| **V4.5.1a — ABERTA** | Last hit automático real, previsão de dano, caminho econômico até o alvo, calibração 5 min e rotação | farm livre >=35 CS e <=62 CS nas lanes com seed fixo, CS=último golpe real, sem regressões de wave |
| **V4.5.2 — Incremento atual** | Duração individual Barão/Ancião, aura por proximidade, soul persistente, Fantasma na seleção, filtros de loja e telemetria | testes de contrato V4.5.2 verdes; visual Windows pendente |
| **V4.5.2a** | Baron empowered melee/caster/cannon/super individual; buff AD/AP/recall, Elder queimadura, variações de Dragon Soul, Dragon passives e timer | simulação de 2 equipes, portadores morrendo, fog e checkpoint determinístico |
| **V4.5.3** | Catálogo de itens por patch com componentes, 6 slots, receitas, categorias, busca, buffs, auras, únicos, ativos e trinkets; páginas oficiais de runas, feitiços do draft | item/runas 1:1 certificadas individualmente, sem duplicar stats/procs/venda |
| **V4.5.4+ (lotes contínuos)** | Kits individuais por campeão: HP/AD/AS/MS/range/mana/armor/MR base e crescimento; passivas, QWER, variantes, recasts, escalamentos, interações, skillshots, skins/VFX descritores | cada campeão só deixa estado `partial` após 100% dos testes de kit/combate/passivas/interações |
| **V4.6** | Lobby, filtros 1×/2×, matchmaking, servidor PvP autoritativo e anti-cheat | clientes nunca acessam fog, ordens nem combos secretos adversários |
| **V4.7** | Mísseis/colisões/skillshots completos e VFX world-space | resultado decidido no motor, replay determinístico |
| **V4.8** | GLB autoral, vídeo, áudio e câmera/timeline | fallback offline, sem alterar resultado de combate |
| **V4.9** | Gramática de ações, condicionais e banco grande de decisões por prompt | versão do patch + validação legal/determinística e permissão de cada ação |
| **V5.x** | Auditoria de paridade de todos os campeões, itens, runas, objetivo e feitiços | certificação baseada em evidências por item e por versão de patch |

## Arquitetura alvo
`ChampionStats@patch` + `ChampionKit@patch` + `ItemCatalog@patch` + `RuneCatalog@patch` + `SummonerSpells@patch` → `Action AST` → `Target/Range/Path/Gate` → `EffectResolver` → `Event Journal` → `Fog filter` → `Timeline UI/VFX`.

Os resolvedores geométricos e de efeitos devem ser reutilizados, mas cada identidade/kit mantém manifestos próprios, contratos de alcance/rank/passiva/recarga/efeitos/condições de cast. O banco de prompts deve somente compor ações validadas; não gera acesso a informações escondidas.
