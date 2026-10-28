# CoachLOL Macro Arena — Roadmap canônico V4.2 (26/10/2026)

**Base exclusiva:** V4.1.0 → **V4.2.0**. Cinematics da V3.7 foram incorporados seletivamente em V38.2; não sobrescrever core com builds históricas.

## Gates antes de declarar 1:1

1. Toda habilidade possui manifesto por patch, classe de alvo, regras de bloqueio, custo, cooldown, intervalo de recast, alcance, raio/largura, escala por rank e coeficientes de atributos.
2. Cada nova regra tem teste de sucesso, falha, CC, fog, colisão, cooldown, múltiplas equipes, snapshot/replay e 1x/2x.
3. Habilidades especiais (pets, transforms, formas, clones, stacks, on-hit, passivas e ultimates em estágios) necessitam state machines próprias. Compartilhar componentes de engine **não** significa copiar os efeitos.
4. Modelo de status: `training` → `planned` → `legacy_adapter`/`prototype` → `certified`; *certified* somente após kit inteiro ser verificado contra patch e múltiplas interações.
5. Fonte de dados e auditoria de licenças para recursos artísticos/áudio antes de qualquer distribuição.

## Marcos (sem saltos)

| Marco | Conteúdo | Critério de fechamento |
|---|---|---|
| **V4.2 — Atual** | Registro de kits patch 26.21, geometrias reutilizáveis, Nami Q e Lux Q/E em execução, Vex R2, UI/VFX de protótipo, curva de growth auditada e dataset de atributos nível 1–18 (cinco campeões) | Testes por habilidade + regressão + manifesto com lacunas explícitas |
| **V4.3** | Catálogo versionado de itens/runas, passivas de compra/venda, AH, conversões, on-hit, efeitos ativos, economia de ouro/XP, múltiplas fontes de dano/cura | Economia determinística e casos de stacking/dependências de receita |
| **V4.4** | Jungle, Smite, objetivos disputados, aggro/leash, visão, teamfight, multialvo e canalizações | Simulação sincronizada e não duplicação de recompensa |
| **V4.5** | Macro 5v5, waves, torres, inibidores, Nexus, condições legais de fim, balanceamento 50 CS aos 5 min livres | Regressões de partidas inteiras com relatórios por seed |
| **V4.6** | Lobby, fila/filtro 1x/2x, partidas privadas, bot e PvP em servidor autoritativo, fog sem vazamento | Teste de adversários desconectados/cheat/latência e reprodução completa |
| **V4.7** | Cinematic event stream, VFX finais de projéteis, mapas de hits, HUD e overlays | Visual replica eventos sem afetar resultado |
| **V4.8** | Animação GLB/3D, vídeo, áudio, câmera e fallback offline | Assets opcionais, timeline sincronizada e privacidade certificada |
| **V4.9** | Banco de ações AST com escolhas múltiplas por prompt e planejamento conjunto | Validadores por campeão; rejeitar ações inexistentes/invisíveis |
| **V5.0** | Auditoria de paridade e certificação incremental 1:1 por patch, campeão e item | Matriz rastreável e nenhuma lacuna classificada como certificada |

**Débitos transversais:** executor de efeitos ainda parcialmente legado; rollback e replay causal de partida completa, animações com tempos de voo reais, colisão com paredes/projéteis, on-hit/stacking passivo, client PvP seguro. Não declarar concluídos.
