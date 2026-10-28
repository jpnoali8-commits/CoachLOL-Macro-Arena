# Importação da base CoachLOL dev68 — estado por etapas

**Estado atual: SOURCE_READY / RELEASE_BLOCKED — 2026-10-28.**

## Etapa 1 — fonte textual: concluída

- Foram importados **1.624 arquivos textuais reais** da V4.5.3-dev68 para `import/dev68-staging` (JS, MJS, JSON, HTML, CSS, MD, PY, SVG, testes).
- As branches `dev69/skills`, `dev69/items` e `dev69/integration` foram alinhadas à mesma base.
- Foram comparados os conteúdos de `engine.mjs`, `engine.browser.js`, `app.js`, `version.json`, `package.json` e do teste dev68 com as fontes originais.
- A reconstrução textual passou nas regressões específicas registradas em [STATUS_DEV69.md](STATUS_DEV69.md) e nos documentos de QA; **não foi executado `npm test` integral nessa reconstrução**.
- **Permitido agora:** auditoria e alterações de código das três equipes, cada uma na própria branch, com testes focados e PRs para `dev69/integration`.

## Etapa 2 — base integral: pendente

O ZIP mestre original é `CoachLOL_MacroArena_V453_Dev68_Lux_Q_Projetil_2_Alvos_PvP_JogoCompleto.zip`, de **160.356.099 bytes**, SHA-256 `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be`, com **2.549 entradas**, sendo **566 arquivos internos .git**.

- **925 entradas do ZIP não foram importadas na etapa textual** (incluem assets binários, metadados Git e outros arquivos). Isso não equivale a 925 assets necessários: inventariar e classificar antes de importar.
- O histórico Git antigo ainda está conservado no ZIP original, **mas não foi migrado** para o repositório remoto, que possui uma história nova de bootstrap/importação.
- Não enviar o ZIP mestre acima de 100 MiB como blob Git normal. Decidir armazenamento dos assets e possível preservação do histórico via migração legítima, sem adicionar `.git` como diretório comum.
- Não alegar que há clone completo, renderização/Chromium certificada ou testes integrais do jogo baseados no remoto apenas textual.

## Gate para promover a base a `main` e lançar dev69

1. Inventário de todos os arquivos pendentes, incluindo os binários necessários para executar o jogo.
2. Arquivos essenciais e respectivos hashes presentes no repositório ou em distribuição vinculada confiável.
3. Decisão explícita sobre como conservar/migrar o histórico Git herdado; nunca usar force push/reset destrutivo.
4. Testes de execução com os assets e a configuração completos; `npm test` integral com resultado registrado.
5. Revisão de segurança, de economia/Desfazer, de PvP 1 humano por equipe, de Nexus e de fog.
6. Somente depois: PR integrado e promoção de `main`, release completo e alteração do status para `RELEASE_READY`.

Referências: [STATUS_DEV69.md](STATUS_DEV69.md), [FLUXO_DE_PR_E_QA.md](FLUXO_DE_PR_E_QA.md), [Issue #1](../../issues/1).

**Observação:** trabalho de código da dev69 está liberado nas branches isoladas, mas o pacote mestre publicável continua bloqueado.