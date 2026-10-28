# CoachLOL Macro Arena — Adendo do Rift Elemental

**Referência:** Summoner's Rift de League of Legends PC, patch 26.21 (20/10/2026). **Auditoria:** 26/10/2026. **Status:** ESPECIFICAÇÃO; não implementada na engine nem no Blender por este documento.

## Objetivo
Adicionar variantes dinâmicas ao mapa do CoachLOL sem alterar as máscaras jogáveis originais, permitindo transformações de terreno, colisões, brushes, plantas, zonas de movimento, portais e visão. Separar regras do LoL PC normal, Swiftplay e eventos históricos. As referências 3D e de texturização são secundárias às máscaras e às regras de jogo.

## Regras de ativação
- **Summoner's Rift padrão:** após o abate do segundo dragão, quando o elemento do terceiro é definido, antes do seu surgimento. Primeiro e segundo dragões não são responsáveis por escolher o tipo de Rift. Quatro dragões de uma equipe concedem a Alma; isso não é o gatilho da transformação.
- **Swiftplay 2026:** após o abate do primeiro dragão, com elemento do segundo. Não herdar as demais regras do modo normal: Swiftplay tem alma com dois dragões, outros timers e exceções.
- A transformação é global e persistente, mas NÃO pode revelar localizações ocultas de campeões.

## Seis variantes atuais
| Variante | Delta de mapa/sistemas | Regras de engenharia |
|---|---|---|
| Mountain | Paredes/formações de pedra em pontos definidos, inclusive perto da cova do dragão | Ativar novos colliders e obstáculos de visão, invalidar/recalcular navmesh e trajetórias, testar skillshots |
| Ocean | Vegetação/brush ampliados, plantas e áreas visuais molhadas | Ativar polígonos de brush e seus efeitos em fog; preservar água como asset separado, não modelar água agora |
| Infernal | Brasas Infernais geradas/coletáveis; NÃO remover paredes nem bushes da versão de 2019 | Spawn determinístico, distribuição, duração, coleta, movimento, AH, perda na morte, visão por equipe |
| Cloud | Correntes de vento e zonas de bônus de velocidade | Volumes não-colisores com modificador de MS por tempo simulado |
| Hextech | Hexgates/portais em locais fixos | Entradas/saídas, canalização, interrupção, recarga e conexões especiais de rota |
| Chemtech | Honeyfruit→Stim Fruit, Blast Cones com impulso adicional, Scryer's Bloom→Firelight Bloom | Plantas mutáveis e respectivas ações/visão; NÃO usar a névoa de camuflagem antiga, removida na reformulação 12.22 |

## Alterações estruturais de 2026 independentes do elemento
- **Faelights:** pontos de posicionamento de ward especiais; quatro pontos adicionais próximos das rotas laterais aparecem após o Rift Elemental. Ward nesses pontos tem área de visão adicional e raio ampliado conforme regras do patch 26.1.
- **Scryer's Bloom:** pontos adicionais habilitados aos 15 minutos OU na transformação elemental, com realocação de plantas antigas muito próximas; modelar e simular como spawns condicionais.
- Não confundir o novo sistema de visão com efeitos antigos do Quimtec. Referência de mapa/visão é o patch 26.1, mais recente que o visual clássico de 2019.

## Arquitetura — regras imutáveis
1. Guardar `base_map` imutável (máscaras, IDs semânticos, escala e coordenadas), com `variants/<element>/delta` versionados e independentes.
2. Um `MapState` autoritativo no motor (futuramente Rust) decide variante, tempo, colliders, brushes, plantas, portais e zonas; Blender/GLB apenas apresentam o estado.
3. Os deltas devem mudar a MESMA fonte lógica usada por pathfinding, LOS/fog, projéteis, seletores de alvo, warding e prévias da UI.
4. Ao aplicar paredes, detectar entidades ocupando a futura colisão: usar regra determinística auditada de realocação para ponto navegável próximo; não prender campeões dentro do rochedo.
5. Transformação só no limite de tick/resolução simultânea; ordens já enfileiradas são revalidadas, caminhos recalculados e casts ilegais não consomem recursos.
6. `mapRevision` monotônico; replanejamento por mudança de topologia e snapshots/replay contendo `mode`, `patch`, `mapRevision`, `variantId` e estado procedural (brasas, plantas, portais, wards).
7. Não usar polling de mapa por cliente: enviar evento delta versionado por WebSocket e manter o estado secreto por equipe na filtragem da visão.
8. Velocidade 2× reduz o tempo real, nunca duplica ticks de burn/recarga ou muda duração simulada dos efeitos.
9. Arte low-poly: Blender produz objetos e visual das variantes separadamente; não reconstruir nem deformar colliders originais com Tripo. Empregar texturas 512/1024 por padrão; 2K somente quando medido e justificado.
10. Introduzir um manifesto de patch/mode para que as regras 9.23, 12.22, 14.1 e 26.1 não se misturem com as do modo padrão atual.

## Arquivos propostos para Codex/Opus e Blender MCP
- `data/maps/sr_2621/base_collision.json`
- `data/maps/sr_2621/base_brushes.json`
- `data/maps/sr_2621/variants/{mountain,ocean,infernal,cloud,hextech,chemtech}.json`
- `data/maps/sr_2621/dynamic_vision_2026.json`
- `source/blender/map_base.blend` e `source/blender/variants/*.blend`
- `tests/elemental_rift_terrain.test.mjs` e golden fixtures de pathfinding/fog
- `docs/QA_ELEMENTAL_RIFT_VARIANTS_2621.md`

## Critérios de aceite obrigatórios
- SR padrão: transformação ocorre após segundo abate e antes do terceiro dragão, usando o terceiro elemento. Swiftplay: regra de modo distinta.
- Montanha: caminho que cruza a parede passa a falhar/recalcular; projéteis bloqueados quando aplicável.
- Oceano: unidade dentro do novo brush fica oculta segundo regras de visão e só é revelada em condições legais.
- Infernal 2026: paredes não desaparecem; colecionáveis não surgem com dados diferentes entre snapshots/replay.
- Hextech: teleporte com canalização e falha segura sob CC, distância, objetivo/estado inválido.
- Quimtec: plantas mutadas sem campo antigo de camuflagem.
- Faelights e novas Scryer's Bloom nascem nos tempos corretos e filtram visão por time.
- Event log, snapshot e reload reproduzem a mesma variante, mesmo que a partida seja carregada após a transformação.
- Simulação 1×/2× produz checksum idêntico para as mesmas ordens e ticks de jogo.
- Dados de máscaras existentes não são modificados; revisões de versões são overlays e não destruição das fontes.

## Fontes oficiais da Riot
- Patch 9.23 (2019), mecanismo de transformação após 2º dragão: https://www.leagueoflegends.com/en-us/news/game-updates/patch-9-23-notes/
- Patch 12.22 (2022), Quimtec atual baseado em plantas: https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-22-notes/
- Patch 14.1 (2024), Infernal sem destruição de paredes: https://www.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-14-1/
- Patch 26.1 (2026), Faelights, plantas e Swiftplay: https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/
- Patch 26.21 (20/10/2026): https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/

**Nota:** este documento não valida todos os números ou posições de cada variante por patch. Para modelar posições/colisões exatas, exigir as máscaras e referências com legenda e coordenadas do mapa de jogo. A criação das máscaras adicionais precisa ser auditada visualmente e por geometria.
