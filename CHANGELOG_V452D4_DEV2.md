# CHANGELOG — CoachLOL Macro Arena V4.5.2d-4-dev2

**26/10/2026 · Base de origem:** `CoachLOL_MacroArena_V452d4_Dev1_Rift_Elemental_Blender_Handoff.zip` (não d3A). **Máscaras de origem:** `masks-and-maps(1).zip` do usuário. Motor JavaScript offline é autoridade.

## Implementações executáveis

1. Importador determinístico `tools/import_user_rift_maps_v452d4.py`, manifesto com hashes, coordenadas normalizadas e bundles separados (128×128); inclui e preserva os 21 arquivos de imagem extraídos do ZIP do usuário (22 entradas, incluindo pasta) em `assets/user_rift_masks_20261026/`, sem alterar `data/masks_128.json`.
2. **Montanha**: deltas sobre colisores fornecidos: 33 células novas bloqueadas, 123 desbloqueadas. Recalcula colisão, rotas e linha de visão quando o mapa se transforma; as entidades atingidas são deslocadas de forma determinística para ponto navegável.
3. **Oceano**: deltas de vegetação conforme máscara entregue: 104 células adicionadas e 18 removidas. Fog e ocultação por brush usam máscara dinâmica; colisores base preservados.
4. **Nuvens**: quatro zonas anotadas com aumento de velocidade de deslocamento em zona (magnitude/contorno ainda aproximados).
5. **Hextech**: seis conexões recíprocas, doze extremidades, canalização simulada de dois segundos, interrupção por deslocamento/CC/combate, pouso seguro e checkpoints.
6. **Quimtec**: dez pontos de fruta de estímulo com efeito protótipo de cura/escudo e quinze pontos de fruta de visão em cone direcionável, revelação temporária de sentinelas e redução delas para um HP.
7. **Frutas explosivas**: quatro pontos base; jogador escolhe uma das oito direções do seu salto e todos os campeões próximos são lançados radialmente à fruta, incluindo inimigos, com destino validado contra parede; recarga e snapshot.
8. **Lumes Feéricos / Faelights**: onze pontos anotados no pacote do usuário, sentinelas com +25% de alcance e região de visão bônus por 45 segundos, um ward por equipe/ponto, persistência em snapshot; cobertura exata da área ainda aproximada.
9. **Infernal**: geometria idêntica à base, SEM destruição de paredes/moitas. Apenas overlay vermelho de baixa intensidade no cliente; cinders não integrados.
10. **UX**: texturas de mapa base/Montanha/Oceano trocadas segundo o Rift ativo, ícones de fruta/vento/visão/portais, seleção direcional ao clicar fruta explosiva. Bundles estáticos embutidos para abrir offline.
11. **Rift apenas uma vez por partida**: em Summoner's Rift padrão transforma no gatilho de dois dragões capturados (para surgimento do terceiro); Swiftplay gatilho de uma captura. Gatilho e revisão snapshotados.

## Preservação e limites

- Regressões do motor, contratos de almas/passivos, seleção múltipla, golpes finais reais, freeze parcial, snapshots, fog e relógio simulado não foram removidos. Sem introdução de ouro/kill/custo extra.
- Máscara TOP atualizada e mapa de referência foram preservados **como arquivos de entrada**, mas a nova rota TOP **não foi ativada na navegação** sem um benchmark específico para impedir regressão de farm.
- Não houve implementação de GLB/Blender runtime ou transferência por MCP remoto. O pacote mantém documentação Blender MCP e uma ponte de dados (`rift_bundles`) para importar ativos posteriormente.
- A compatibilidade com o patch é **parcial/prototipada**. Posições autorais vêm dos masks; formatos precisos de regiões e temporizações de efeitos não foram certificados como Riot 1:1; conferir `docs/QA_RIFT_ELEMENTAL_V452D4_DEV2.md`.
- Nenhum commit efetuado em árvore Git originalmente com mudanças locais.
