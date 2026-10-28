# CoachLOL — V4.5.2d-4-dev1 | Rift Elemental Dinâmico

**Base obrigatória:** V4.5.2d-3A, importada do pacote completo do usuário em 26/10/2026. O jogo em JavaScript existente foi preservado; não houve migração para Rust nem substituição do motor por versões anteriores.

## O que funciona neste incremento

- Summoner's Rift padrão: após a **segunda** eliminação elemental, o **terceiro** elemento é selecionado de forma determinística, diferente dos elementos das capturas anteriores quando houver candidatos. O Rift transforma uma única vez, e os próximos dragões elementais do encontro utilizam o elemento definido.
- Swiftplay: parâmetro de regras de transformação separado (`riftMode='swiftplay'`), após o primeiro dragão, segundo elemento definido; o restante das regras Swiftplay ainda não foi migrado.
- Estado versionado `riftV452d4`, eventos globais sem IDs secretos, snapshots, máscaras base imutáveis e bundles opcionais de terreno recebidos no mapa ou instalados antes da partida.
- Deltas de `wall`/`brush` por índices do atlas da mesma resolução. O `walkable()`, `lineOfSight()`, `brushRegionAt()`, `findPath()`, ataques e navegação que usam essas primitivas leem a geometria efetiva. A transformação descarta os caminhos antigos sem remover ordens dos jogadores.
- Cloud: zonas de velocidade com posições fornecidas por mapas certificados; Hextech: validação de pares de Hexgates e **prévia de canalização**, ainda sem execução do teleporte no servidor; suporte a metadados autorais das plantas, cinders, Faelights e Scryer's Bloom sem prometer seus efeitos completos.
- `tools/build_rift_bundle_v452d4.py`: converte máscaras PNG binárias de tamanho idêntico ao atlas em deltas JSON e gera um relatório de alterações. Nunca inventa paredes nem altera o mapa-base.

## O que NÃO foi implementado

- Ainda não foram anexadas máscaras definitivas das seis variantes. A interface/GLB permanece usando o visual anterior. Os testes geométricos usam posições sintéticas, não as regiões reais.
- Infernal Cinders coletáveis, queda na morte, ataque às plantas Chemtech, transporte canalizado Hextech, sítios Faelight e Scryer's Bloom, replay por comandos de terreno e demais habilidades com colisões especiais estão **pendentes**.
- O modo Swiftplay completo, o servidor Rust, o Multiplayer e o Blender MCP não foram iniciados neste incremento.

## Como continuar com Blender MCP

1. Carregar as máscaras oficiais da versão-base e referências do mapa em Blender. Confirmar pixel → mundo, espelhamento e orientação Y.
2. Fazer o **blockout** modular low-poly primeiro. Criar máscaras 128×128 por variante **em resolução idêntica** à máscara base.
3. Executar `python tools/build_rift_bundle_v452d4.py --base data/masks_128.json --element mountain --wall minha_mascara_mountain.png --output data/rift_bundles/mountain.json`.
4. Revisar o relatório `.validation.json`, comparar a sobreposição contra as máscaras originais e validar colisões, pathfinding, fog, wards e skillshots.
5. Registrar os bundles no campo `riftBundlesV452d4` de uma cópia do mapa antes de criar `new Arena(...)`; ou chamar `arena.installRiftBundleV452d4(...)` ainda na fase de preparação, com tempo 0.
6. Preparar GLB visuais por variante referenciando exatamente os mesmos IDs e polígonos certificados, sem colisões próprias inventadas pelo Tripo.
7. Reexecutar `npm test` e os casos de regressão de mapa das duas equipes.

**Nunca tratar JSON de features com posições de teste como posições geográficas reais de Summoner's Rift.**
