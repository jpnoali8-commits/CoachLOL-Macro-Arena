# Roadmap do Rift Elemental, sem perder o roadmap do jogo

Data de referência: 26/10/2026 — LoL PC patch 26.21, Summoner's Rift padrão. A arquitetura principal do projeto continua V4.5.2d-3A + incremento V4.5.2d-4-dev1; V4.5.2d-3B de Barão não foi substituída nem declarada concluída.

| Marco | Responsabilidade e critério de aceite | Estado |
|---|---|---|
| **V4.5.2d-4-dev1** | Variant controller, transformação após 2 dragões, modo Swiftplay separado, mask deltas, A*/LOS/brush, snapshots, modo Cloud e protótipo de Hexgate | **Motor parcial e testes OK** |
| **V4.5.2d-4-dev2** | Importar as seis máscaras aprovadas sem diferenças de colliders, NAV e brushes; validar alinhamento em Blender; conectar visual 2D/GLB por evento | **Pendente: arte/máscaras** |
| **V4.5.2d-4-dev3** | Regras oficiais de cinders Infernal, efeitos Chemtech Plants, Hexgate canalizado, faelights/ward vision, scryer bloom, zonas Cloud | **Pendente** |
| **V4.5.2d-4-dev4** | Colisões avançadas de projéteis, detecção de fog, ward/plant interactions, replay causal, teste 5v5 após transformação e snapshots entre turnos | **Pendente** |
| **V4.5.2d-3B** | Atributos individuais e persistência do Barão; outros objetivos restantes | **Paralelo e pendente** |
| **V4.5.2e** | Windup/attack speed/aggro/projéteis/freeze | **Pendente** |
| **V4.5.3, V4.5.4+** | Catálogos e kits individuais auditados | **Pendente** |
| **V4.6+** | Rust autoritativo, contas, perfil, WebSockets, PvP; VFX/GLB e ação por prompt | **Pendente** |

## Regras e fontes

- Summoner's Rift clássico: após 2 dragões, o próximo elemento determina Rift; selecionar o elemento de forma estável e permitir que o mesmo elemento retorne.
- Swiftplay patch 26.1: transformação após 1, usando 2º elemento, com outros ritmos que exigem implementação específica.
- Infernal no 14.1 NÃO destrói paredes ou brushes; usa Infernal Cinders. Nunca recuperar o mapa Infernal antigo.
- Chemtech desde 12.22: sem a antiga névoa tóxica invisível; altera plantas.
- Faelights (patch 26.1): 8 pontos iniciais e 4 pós-transformação, com aumento de visão de wards; pontos novos de Scryer's Bloom aos 15 min ou com a transformação. Atribuir somente coordenadas certificadas.

Fontes oficiais:
- https://www.leagueoflegends.com/pt-br/news/game-updates/patch-26-1-notes/
- https://www.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-14-1/

## Arquitetura posterior Rust/WebSocket

O servidor em Rust assumirá as regras de transformação, máscaras e deltas, a validação de entrada e a visibilidade por equipe. Clientes JavaScript/WebAssembly receberão eventos versionados e apenas informações permitidas; **nenhum cliente decide a geometria jogável**. Evitar polling: `RiftChanged`, `TerrainDelta`, `BrushDelta`, `VisionDelta` e `ObjectiveTaken` serão eventos push com número de revisão, reenvio por reconexão, validação de checksum da máscara e snapshots. GLB e texturas KTX2 são apresentação, não colisões. O Rust deverá ser migrado por testes de equivalência com a engine existente.
