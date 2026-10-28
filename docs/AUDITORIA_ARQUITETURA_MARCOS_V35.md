# Auditoria de engenharia — CoachLOL v3.5

> **Estado:** alfa offline de treino. Isto não é e não deve ser anunciado como reprodução 1:1 dos cálculos/recursos do League of Legends. As regras variam por patch; jogos próprios derivados com ativos Riot precisam de autorização e revisão jurídica.

## Contrato de turnos para a versão estratégica
- **Fase A: planejamento simultâneo.** Cada equipe escolhe ordens, alvos, rotas e compras sem ver ordens secretas inimigas.
- **Fase B: execução de micro-ticks.** Regras determinísticas verificam visão, detecção, alcance e colisão a cada tick; o planejamento não vira aprovação de dano.
- **Fase C: janela de reação.** Interrompe temporariamente a execução apenas quando há decisão legal; pode permitir Flash, blink, salto, cura, escudo, estase, CC e peel. Ações resolvidas anteriormente não são desfeitas.
- **Fase D: efeitos pendentes.** Conjuração, viagem de projétil, marcas e dano por tempo são eventos independentes com `dueRound`, `dueAt`, `owner`, `targets`, `team` e `visibility`; quando chega a hora, escudo, estase, invulnerabilidade, defesa e alcance têm precedência explícita.
- **Fase E: eventos e retransmissão.** Kill/assist/objetivo, combate e buffs emitidos uma única vez. Animação/render não altera HP nem RNG do motor.

## Matriz de estado por subsistema
| Sistema | v3.5 | Lacunas e gate de aceite |
|---|---|---|
| Visão/brush/pickoff | Base funcional | Testar interações avançadas, flash em fog e mudanças de visão no micro-tick |
| Escape instantâneo | Flash/Ezreal E/Tristana W: base funcional | Stun, supressão, arremesso, terreno, E adicional de Ezreal, slow e reset Tristana |
| Combos/CC | Fila QWER e consentimento de duelo: base | Engine data-driven por campeão; skillshots, zonas, stun, root, silêncio, tenacidade |
| Marca e telegráficos | Zed/Karthus provisórios, persistem turnos | Armazenar dano real para Zed, escalas oficiais; Karthus: canalização e interrupção, passiva |
| Global projectile | Colisão inicial por corredor | Velocidade, colisores hitbox, splash, morte durante viagem, visão independente e animação |
| Cura global | Soraka R provisória | Feridas dolorosas, modificadores/escudos, interações de invulnerabilidade |
| DOT | Incendiar provisório | Atualizar fórmulas, resistência, dano verdadeiro, créditos de morte, dispels, outros DOTs |
| Itens ativos | Ampulheta básica e loja de receitas parcial | Receitas por patch, venda/desfazer, únicas, efeitos oficiais, outros ativos |
| Objetivos épicos | HP, combate, Golpear tático, timers parciais | Drag/Baron com luta multi-turno, aggro por equipe, buffs, mensagens globais, contest simétrico |
| Waves/estruturas | Testes básicos de ordem e vulnerabilidade | Full partidas 20-40m com vitória legal e regras completas, blockers, path e buffs |
| Alvos sobrepostos | Seleção pelo cursor básica | Overlay de múltiplos campeões dentro de um hitbox, priorização e teclado |
| HUD de morto | Timer nos dados | Avatar cinza em todos os widgets, relógio visível na foto, retorno à fonte |
| Multiplayer/ranked | NÃO implementado | Servidor autoritativo, duas confirmações, reconexão, anti-cheat, matchmaking, MMR, PDL |
| Cinemáticas GLB/vídeo | NÃO implementadas | Visor WebGL/WebGPU, câmera e assets licenciados, sincronização não autoritativa |

## Marcos planejados e ordem recomendada
**M35: Reações e efeitos pendentes — implementação inicial neste pacote.** Gate: testes de alcance, mana/recarga, sem aprovação retroativa, dano diferido e recuperação do jogo.

**M36: Engine de efeitos status + CC.** Modelo único para `stun`, `root`, `silence`, `grounded`, `airborne`, `slow`, `shield`, `stasis`, `invulnerable`, `DoT`, `HoT`, debuff; aplicação e expiração por tick; replay determinístico; prioridade de defesa.

**M37: Sistema de habilidades por campeão.** Manifestos QWER por patch (alvo, shape, tempo, alcance, CC, dano, velocidade, colisão, cadeia, condição de nível); completar 10 campeões do elenco com diferenças, inclusive Jinx/Ashe/Ezreal, Ezreal E, Nami W; separar ataque básico de habilidades.

**M38: Motor dos objetivos e disputa justa de Smite.** Dragon/Baron de vários turnos, duas equipes com DPS/HP real; Golpear causa dano num instante, nunca por aproximação ao valor correto. Exemplos: 1.000 HP e 900 dano deixa 100; 860 HP e 900 dano elimina; disputa simultânea usa ticks e regras determinísticas de resolução — não inventar vencedor pela prioridade do time azul. Variações: smite + habilidade, morte do jungler, CC, contest e roubos.

**M39: Macro 5v5 e terminação.** Waves completas, lanes 1-3-1 e 1-4, objetivos, inibidores, superminions, conquista do Nexus com estrutura legal, partida de 20–40m que termina.

**M40: HUD/overlays, rosters e multiplayer.** Seletores de alvos sobrepostos, debuffs sob avatar, anúncios drag/baron/kills com time e retratos, mortes e respawn, replay, state sync autoritativo, reconexão e só então MMR/PDL.

**M41: Apresentação 3D GLB e vídeos opcionais.** Asset registry com campos `event`, `character`, `mediaType`, `uri`, `duration`, `priority`, `fogPolicy`, `interruptPolicy`, `fallback`; WebGL GLB e vídeo/WebM suportados por plugin visual independente. Evitar render pesado que congele turnos. Os VFX observam eventos, nunca geram efeitos no gameplay. Licenciar/autorizar arquivos antes de distribui-los.

## Gates de teste obrigatórios
1. Todas habilidades precisam ter CD, recursos, prioridade CC, tipo de alvo, alcance, forma e evento de impacto.
2. Simulações repetidas com mesma semente = replay byte a byte do estado essencial; nenhum HP negativo ou ordem circular.
3. Ocultação de fog validada dos dois lados; apenas efeitos globais com telegraph legítimo atravessam.
4. Navegador 1280 e 1680px sem painel que bloqueie terreno/reação; controles por mouse, teclado e voz local.
5. Um executor autoritativo manda a mesma resolução de dano para ambos; o clique na HUD não serve como arbitro de vencedor.
6. Auditoria de direitos sobre modelos, artes, nomes e animações de terceiros para publicação.

## Diferenciação League of Legends × CoachLOL
- Zed marca em aproximadamente 3s no LoL; aqui resolve na próxima rodada para dar oportunidade tática antes da detonação.
- Karthus canaliza ~3s no LoL; aqui o anúncio persiste até próximo turno (abstração intencional).
- Ashe e Jinx param no primeiro campeão; Ezreal atravessa. As três não devem dividir uma única implementação de colisão.
- No LoL, Golpear reduz HP de forma numérica real, não ganha por quão próximo chegou do dano exato; atribuição do objetivo ocorre no impacto letal.
- A plataforma ainda não contém rede PvP: todas as sincronizações são simuladas offline.

## Atenção jurídica
A política oficial da Riot para desenvolvedores e o documento 'Lenga-lenga jurídico' proíbem jogos não autorizados usando sua PI, incluindo modelos, personagens, mapas, ícones e habilidades. Data Dragon destina-se a usos permitidos de dados estáticos e não autoriza, sozinho, reproduzir/publicar um jogo 1:1. Para publicação, é necessário revisar permissões/licenciamento ou substituir conteúdo protegido por IP original.

Fontes públicas verificadas em outubro/2026: leagueoflegends.com patch 26.1; wiki.leagueoflegends.com páginas Flash, Ezreal, Tristana, Zed, Karthus, Soraka, Ashe, Jinx; riotgames.com/pt-br/juridico; developer.riotgames.com/policies/general.
