> **MARCO CANÔNICO — V4.5.3-dev66.** Base única: pacote mestre dev66. Ler `README_CONTINUAR_DEV66.md`, `QA_V453_DEV66.md`, `ROADMAP_V453_DEV66.md`, `MEMORIA_CONTINUIDADE_V453_DEV66.md`. Nunca retornar a versões antigas; preservar `.git`, PvP 1×1/5 campeões por pessoa e Desfazer da fonte.

> **Marco canônico atual: V4.5.3-dev65.** Ler `README_CONTINUAR_DEV65.md`, `QA_V453_DEV65.md`, `ROADMAP_V453_DEV65.md` e `MEMORIA_CONTINUIDADE_V453_DEV65.md`. Preservar `.git` e Desfazer; não retornar à dev64.

# BASE CANÔNICA — V4.5.3-dev64

Dev64 substitui dev63 como base. Leia `README_CONTINUAR_DEV64.md`, `MEMORIA_CONTINUIDADE_V453_DEV64.md`, `QA_V453_DEV64.md`, `ROADMAP_V453_DEV64.md` e `CHANGELOG_V453_DEV64.md`. Combate em PvP: ambos os lados respondem manualmente após o impacto; replay idempotente por recibo canônico; 1 humano por equipe controlando cinco campeões. Nunca alterar a invalidação de Desfazer na saída física da fonte. Preservar Git e assets.

---

# BASE CANÔNICA — V4.5.3-dev63

**Dev63 é a versão atual**. Inicie em `README_CONTINUAR_DEV63.md`, `MEMORIA_CONTINUIDADE_V453_DEV63.md`, `QA_V453_DEV63.md`, `ROADMAP_V453_DEV63.md`, `CHANGELOG_V453_DEV63.md`. Históricos abaixo são apenas históricos; não voltar à dev62. Preservar Git e catálogo, 1 jogador humano por lado controla 5 campeões; desfazer ao sair da fonte segue proibido.

---

> **ATUALIZAÇÃO V4.5.2d-dev2:** começar por `README_PRODUCAO_V452D2.md`, `docs/ROADMAP_V452D2_CONTINUIDADE.md` e `docs/QA_V452D2_SOULS.md`. A base inclui Almas, Recall Barão e farm do Codex; não voltar ao código da V4.5.2b.

# Comece aqui — CoachLOL Macro Arena V4.5.2c

**Jogo + documentação + testes no mesmo diretório**. Esta é a continuação local V4.5.2c do snapshot V4.5.2b-H1 verificado. Leia `AGENTS.md`, `docs/MEMORIA_CONTINUIDADE_V452B.md`, `docs/ROADMAP_MESTRE_V452B.md`, `docs/QA_SUMMARY_V452C.md` e `docs/ADR-001-rust-migration.md`. Os handoffs anteriores estão em `docs/CODEX_HANDOFF/`; não reconstrua o motor a partir de ZIP histórico.

```bash
node --check engine.mjs
npm run test:v38
npm run test:v38-1
npm run test:v451
npm run test:v452
npm run test:v452b
npm run test:v452c
npm test
```

Farm normal P0: `PASS_BOUNDED_LOCAL` nos cenários e limites registrados em `docs/QA_SUMMARY_V452C.md`. `freeze` continua farmando com last hits e wave local, porém sua eficiência é `partial` (16/22/46 CS no seed36). Isso não equivale à certificação 1:1. Nenhum kit/item/runa está totalmente certificado. Avaliação de IP continua gate antes de distribuição pública.

## NOTAS NOVAS — handoff H1 / IA em navegador

O H1 continua proposta de arquitetura, sem LLM ativo. Leia `docs/ROADMAP_CANONICO_V452B_H1_PROMPTS.md` e `docs/IA_PROMPTS_ARQUITETURA_V452B_H1.md`; não integrar modelo antes de AST/parser, ownership/fog, benchmark e fallback.


## Continuidade obrigatória — V4.5.3-dev34 (27/10/2026)
- Base de produção canônica **V4.5.3-dev34**, derivada da dev33, patch PC **26.21 ativo**; Data Dragon de referência 16.21.1.
- Próximos patches **26.22 / 26.23 / 26.24** previstos em **04/11, 18/11, 09/12** (alteráveis). **26.22 ainda não lançado no momento desta etapa**; feed/PBE NÃO autoriza mudança de jogo.
- Novo `tools/patch_release_v453_dev34.mjs`: auditoria de receitas, SHA item/champion/detalhes QWER, gates de revisão e QA; relatório de prontidão autoriza SOMENTE implementação humana, nunca muda engine automaticamente. `tools/check_riot_patch_v453_dev33.mjs` separa preview de referência após release.
- `npm test` PASS e **20/20 contratos dev34**; engine/browser/app byte-idênticos à dev33; seeds 26,36,42 terminaram pelo Nexus e mantiveram vencedores, duração e hashes.
- A meta de duração é ~30 minutos; usuário **aceita duração um pouco abaixo**, sem qualquer encerramento artificial.
- Loja com **67 itens locais**, catálogo completo e todos os ativos/passivos ainda NÃO certificados. Compra direta por componente na árvore de receita obrigatória.
- **Mordekaiser R V4.5.4**: HUD quadrado canto superior esquerdo; arena circular real interna com colisão e movimentação, mundo 1v1 de região clonada do tabuleiro ATUAL, mesmas moitas/colisores e modificações elementais, fecha sozinho no fim, retorna ao plano principal em posições coerentes. Overlay R de Mordekaiser e Golpear sempre acima de UI comum.
- Próximo Dev35: arquivos oficiais completos quando disponíveis, revisão por versão e implementação real em lotes; ver `docs/PATCH_CENTER_V453_DEV34.md`, `docs/QA_V453_DEV34.md`, `docs/ROADMAP_V453_DEV34.md`.


## Continuidade — dev47 (PvP primeiro)
- Base revisada: `V4.5.3-dev47`; leia `QA_V453_DEV47.md`, `CHANGELOG_V453_DEV47.md` e `tests/v453_dev47_champion_avatar_layers.test.mjs`.
- Os retratos dos mortos são renderizados sob os vivos no mapa, em cinza e com respawn real. Alteração VISUAL, não de combate.
- Transporte PvP por sala foi testado localmente com HTTP, SSE e checkpoint; não é certificação online de produção.
- `npm test` passou nesta iteração; Chromium foi bloqueado. Não inventar screenshot.
- Manter os bugs listados no QA como pendentes. Não priorizar melhoria estratégica da IA dos bots até o catálogo PvP funcional.
