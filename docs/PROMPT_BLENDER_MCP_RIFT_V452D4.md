# Prompt complementar para Blender MCP / Codex / Opus — Rift Elemental (usar com as imagens e masks enviadas)

Você é Technical Artist 3D / engenheiro de ferramentas do CoachLOL. Mantenha como BASE CANÔNICA a V4.5.2d-4-dev1 e o atlas original (`data/masks_128.json`). Use imagens fornecidas pelo usuário **apenas como referências visuais**; as máscaras de colisão oficiais/validadas prevalecem para gameplay.

1. Inspecione o Blender MCP e leia `README_RIFT_V452D4_DEV1.md` e `docs/ROADMAP_RIFT_ELEMENTAL_V452D4.md`. Não afirme acesso a uma ferramenta que não está conectada.
2. Alinhe as imagens aos eixos do cenário, documentando matriz de coordenadas e invertendo Y quando necessário. Gere registro de escala, rotação e origem.
3. Faça UMA cena base low-poly hand-painted com coleções por região. NÃO crie água nesta etapa.
4. Modele variantes como **coleções opcionais de deltas** `rift_mountain`, `rift_ocean`, `rift_infernal`, `rift_cloud`, `rift_hextech`, `rift_chemtech` para os mesmos IDs fixos de referência. Nenhuma variante move o chão base, as lanes, as torres, o rio ou colisões imutáveis.
5. Mountain: paredes/rochas APENAS nos pixels aprovados; Ocean: brushes adicionais APENAS onde a máscara de brush autoriza; Infernal desde 14.1 não remove paredes/brushes, criar cinders como props interativos quando houver máscaras/pontos oficiais; Cloud: zonas de vento; Hextech: portais com pares de IDs; Chemtech: variantes de plantas, sem a névoa de camuflagem antiga.
6. Identifique também os pontos Faelights e Scryer Bloom de 2026, mas não invente suas coordenadas. Se faltar máscara, registre como `TODO_NO_MASK`.
7. Exporte por variante a máscara binária exatamente 128x128 sem antialias; use `python tools/build_rift_bundle_v452d4.py` para produzir os deltas JSON. Gere imagens de sobreposição originais vs variantes e relatório de divergências.
8. Separe `collision`/`navigation`/`brush` do `visual`/GLB e valide pathfinding, fog, skillshots e distância por célula. Não deixe o Tripo alterar topologia nem colliders: somente texturas, 512/1024 px por padrão e 2K se justificar.
9. Salve `.blend` editável, GLB modular, scripts `bpy` reproduzíveis, relatório QA, IDs estáveis e atlas de texturas compactado. Priorize o bloco básico + variante de Montanha validada antes das demais.
10. Não alegue paridade 1:1 até as posições finais serem aprovadas, a UI exibir corretamente os seis casos e os testes passarem.

A lógica autoritativa de mudança do Rift é calculada na engine; o Blender produz somente os bundles certificados e a apresentação visual modular. Não duplicar a lógica de efeitos no GLB.
