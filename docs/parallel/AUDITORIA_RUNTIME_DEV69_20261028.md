# Dev69 — Auditoria real da importação e distribuição da base dev68

Data: 2026-10-28. Escopo: `dev69/integration` exclusivamente. **SOURCE_READY / RELEASE_BLOCKED.** Nenhuma alteração de engine, skills, items, main ou PR foi feita nesta auditoria.

## Base e branches

- Base canônica: `version.json = 4.5.3-dev68`.
- SHA comum verificado em `dev69/integration`, `dev69/skills` e `dev69/items`: `b6f9cea08273bef4968ad9503d62c1a5255de81f` (comparações de branches: identical).
- `main` tem histórico remoto separado; diferença `main...dev69/integration`: 34 commits à frente no instante da consulta, sem promover main.
- Nenhum PR encontrado no instante da consulta.

## Verificação REAL dos pacotes da Biblioteca

| Pacote | Bytes | Entradas ZIP | SHA-256 | CRC |
|---|---:|---:|---|---|
| Mestre original dev68 | 160356099 | 2549 | `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be` | PASS |
| Fonte textual dev68 | 5443580 | 1625 | `561563dbc3984b2188275a48da3ada1bfaa228556331e2b60e410ea705e4be8c` | PASS |
| Assets dev68 (78 + manifesto) | 67880735 | 79 | `9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd` | PASS |
| Runtime reconstruído (1702 + aviso) | 73343076 | 1703 | `fe555cd97732160029a5a4e3169b16c5e8e80154caa1f0f2ac70788b4ec384b4` | PASS |

O pacote runtime foi montado **a partir do mestre original**, não da versão textual com 12 divergências: contém 1624 fontes + 78 assets exatamente correspondentes aos bytes do mestre, caminhos relativos intactos, 12 divergências originais corrigidas. Compara 1702/1702 arquivos por bytes contra o mestre. Não contém `.git`, previews, caches e evidências históricas; esses permanecem preservados no mestre.

## Histórico Git herdado

O mestre descompactado contém `.git/` válido e worktree historicamente sujo: o commit legado apontado pelo HEAD é `9392c0f99a5ef7ac480a9dfe1d7e28aebcec239b`. Mudanças posteriores ao HEAD são parte da dev68 e não podem ser descartadas. Foi gerado um **Git bundle** exclusivamente de backup; `git bundle verify` retornou OK e quatro refs, sem importar/regravar o histórico remoto. SHA-256 do bundle: `222067117e2f692158778c13920630f703e24a109a73c0df401578c674d89ca1` (31719483 bytes).

## Testes executados NO ZIP MESTRE ORIGINAL

- `npm run test:v453:dev68` — **PASS 40/40**. Cobertura: Lux Q temporal, no máximo dois alvos, colisões, shields, CC, fog, snapshots, duplicação, duas sessões PvP.
- `npm run test:v453:dev63` — **PASS 25/25**. Duas sessões HTTP e SSE nativo, fog privado, undo/loja, duas confirmações por turno, reconexão e Nexus natural nos dois seeds (blue 26 = 1423s; red 42 = 1553s).
- `npm test` primeira execução — **TIMEOUT após 180s** durante a série dev63; não é PASS dessa tentativa.
- `npm test` segunda execução — **PASS (exit code 0)** em execução completa a partir do ZIP mestre dev68. Log com 1710 linhas, 1246 linhas de verificações `✓`, nenhum marcador de falha. DEV61 22/22, DEV62 18/18, DEV63 25/25, DEV67 48/48, DEV68 40/40; demais suítes executadas pela cadeia `npm test`. Esta certificação é LOCAL, não um QA do clone remoto binário nem da futura dev69 integrada.

## Distribuição provisória sem PC

Os ZIPs originais estão na **Biblioteca do ChatGPT**, caminhos `/CoachLOL_MacroArena_V453_Dev68_Lux_Q_Projetil_2_Alvos_PvP_JogoCompleto.zip`, `/CoachLOL/Dev69/CoachLOL_Dev68_Fonte_Textual_Para_3_Chats.zip` e `/CoachLOL/Dev69/AssetsEtapa2/CoachLOL_Dev68_Assets_Mapas_Mascaras_UI_Completo.zip`. Os três chats podem buscar/materializar os arquivos da própria Biblioteca e testar em workspace isolado, usando hashes acima. O runtime consolidado está disponível para download na conversa do integrador; uma tentativa de copiar o arquivo consolidado para a Biblioteca falhou com `container_session_unavailable` e NÃO deve ser tratada como upload bem-sucedido.

**O bundle Git não substitui o ZIP mestre para recuperar a worktree suja.** Não descompactar `.git` antigo sobre o clone remoto.

## Bloqueios de release ainda abertos

Os 78 assets binários ainda não foram publicados no GitHub; distribuição via Biblioteca **não** equivale a clone remoto completo. Restam QA/previews binários e política para preservar o histórico Git sem alterar a ancestralidade remota. Gate `main` fechado até avaliar importação binária, full clone e QA navegador/CI. **Não declarar dev69 entregue** ou `npm test` integral certificado prematuramente.

Quando chegarem PRs: integrar Skills antes de Itens, revisar todos os hunks e contratos, nunca trocar `engine.mjs` inteiro; executar sincronização Node/browser e regressões, com logs, antes de preparar release.
