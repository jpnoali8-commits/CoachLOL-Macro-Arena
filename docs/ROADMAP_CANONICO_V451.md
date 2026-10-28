# Roadmap canônico — CoachLOL V4.5.1 (26/10/2026)

**Regra de engenharia:** V4.5.1 deriva da V4.5.0, preserva V4.0 executor, V4.1 ledger de efeitos, V4.2 manifestos, V4.3 economia, V4.4 objetivos e V4.5 Arauto/Vastilarvas. Nunca reiniciar a base em versões inferiores.

| Marco | Objetivo obrigatório | Critério de fechamento |
|---|---|---|
| V4.5.1 | Waves, estruturas, superminions, seleção e push | Last hit real; duas torres Nexus; estados de inibidor; contratos de seleção e grupo; auditoria do farm pendente se fora de meta |
| V4.5.1a (calibração) | Farm 5m e auto last-hit | 35–62 CS por lane livre com dano real, >0 perdas por rotação e nenhuma atribuição de ouro sem último golpe |
| V4.5.2 | Buffs e disputas completos de Dragão/Alma/Ancião, Barão, Arauto e Vastilarvas | Ciclos e effects por objetivo, cova, pets, multiplicações, durações, auditado por patch |
| V4.5.3 | Fechar sistemas gerais | Loja completa, receitas, passivas/ativas, botas/trinkets, spellbook, runas, shards, XP, atributos, fontes/stacking e efeitos universais |
| V4.5.4+ | Expansão individual por lotes de campeões | HP/AD/AS/MS/armor/MR/ranges/crescimento, passiva, QWER, recasts, transformações, projectiles, pets, on-hit, resets, todas variações testadas por patch |
| V4.6 | Multiplayer autoritativo, lobby/fila e 1x/2x | Sem revelações de fog; inputs validados no servidor; replay, checksum e testes em dois clientes |
| V4.7 | Colisões, ataques e VFX | Hitboxes, skillshots em trânsito, bloqueios Yasuo/Braum/Mel, telegraphs map-wide, cancelamentos, ordem dos eventos |
| V4.8 | GLB, vídeo, áudio, câmera | Motor independente de mídia, timeline determinística, fallback, render real e segurança de visão |
| V4.9 | Banco de ações por prompt | AST tipada de ações individuais/grupo, precondições, estados ocultos, compilação validada, planos e rollback |
| V5.x | Certificação contínua 1:1 | Matriz completa de TODOS os campeões, itens, runas e feitiços presentes no patch alvo + regressão de interações cruzadas |

### Maturity gates

`absent → registered → data_audited → behavior_partial → behavior_certified → patch_certified`.

**Nenhuma habilidade será classificada como certificada somente por possuir ícone, cooldown ou efeito genérico.** Cada passiva/QWER inclui alvo e geometria, limites de alcance, custo/recarga e escalamento por rank, CC, passivas e resets, sistema de movimento, visão, reacast, on-hit, interação com 5v5 e efeitos visuais. Cada item exige receita, ouro, atributos e efeitos; cada build exige slots, restrições, reversão de stats e regras de venda. Fontes públicas e patch devem ser documentados em manifesto versionado. Os kits semelhantes reutilizam operadores, mas não seus parâmetros únicos.

### Pendências transversais

- Last-hit automático inteligente e calibração de XP/gold 5m/15m/30m.
- Combate, CC e projectiles: efeito atomizado, impacto/colisão temporal e antiprova de fog.
- Paridade de champions ainda é extremamente incompleta (no snapshot V4.5 apenas cinco manifestos individuais, nenhum kit 1:1).
- Regras profissionais de mapas/turrets, proteções de nexus, objetivos, monstros e canais.
