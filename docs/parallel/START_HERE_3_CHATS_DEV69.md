# COACHLOL — COMECE AQUI (3 chats / dev69)

**Documento de retomada. Não dependa do contexto de um chat antigo.**
Atualização: 2026-10-28. Este documento e as instruções dos três chats são a fonte operacional de verdade no GitHub.

## Estado comprovado

- Repositório: `jpnoali8-commits/CoachLOL-Macro-Arena` (privado).
- Última versão canônica **do jogo**: `V4.5.3-dev68` (não chamar dev69 de concluída).
- ZIP mestre completo dev68 preservado no ChatGPT: `CoachLOL_MacroArena_V453_Dev68_Lux_Q_Projetil_2_Alvos_PvP_JogoCompleto.zip`. SHA-256: `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be`.
- GitHub contém 1.624 arquivos textuais reais da dev68, incluindo `engine.mjs`, `engine.browser.js`, `app.js`, testes e dados. 12 divergências da primeira importação foram restauradas pelos blobs originais. **As três branches apontavam à mesma base antes deste handoff.**
- O inventário de 925 entradas externas ao snapshot textual é: 78 assets de runtime, 240 evidências de QA, 566 arquivos internos .git, 41 previews/documentos/caches. ZIP separado dos 78 assets preservado na Biblioteca: `/CoachLOL/Dev69/AssetsEtapa2/CoachLOL_Dev68_Assets_Mapas_Mascaras_UI_Completo.zip`, SHA-256 `9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd`.
- Os 566 arquivos .git permanecem dentro do ZIP mestre original, **não foram importados como histórico remoto**.
- `main` no remoto é somente bootstrap. Não contém jogo completo; **não fazer merge nela nem publicar dev69** até fechar o bloqueador [Issue #1](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/issues/1) e verificar runtime/QA com assets.
- Status: **SOURCE_READY / RELEASE_BLOCKED**. Programação e testes de lógica nas branches isoladas estão permitidos; certificação visual / release completo não estão.
- Fonte detalhada: `docs/parallel/STATUS_DEV69.md`; contrato de merge: `docs/parallel/FLUXO_DE_PR_E_QA.md`.

## Arquitetura e restrições imutáveis

PvP 1 humano contra 1 humano (cada jogador controla os 5 campeões do seu time), turnos simultâneos, servidor autoritativo, fog por equipe, reações manuais; foco PvP, não IA avançada de bots. Economia/loja: Desfazer só enquanto mesma visita física à fonte; **sair da fonte invalida definitivamente todas as operações daquela visita**. Preservar farm e encerramento natural por destruição do Nexus. Não apagar arquivos, recriar jogo, copiar a engine antiga inteira, executar `git reset --hard`, ou declarar PASS sem logs. `engine.browser.js` somente sincronizado pelo integrador usando script oficial.

## Primeiro comando de trabalho — cada NOVO chat lê:

- [CHAT 1 — Skills](PROMPT_NOVO_CHAT_SKILLS.md): branch `dev69/skills`; Issue #2.
- [CHAT 2 — Itens](PROMPT_NOVO_CHAT_ITENS.md): branch `dev69/items`; Issue #3.
- [CHAT 3 — Integrador](PROMPT_NOVO_CHAT_INTEGRADOR.md): branch `dev69/integration`; Issues #1/#4/#5.

**Os três chats devem ser NOVOS** (inclusive o integrador), para evitar o limite da conversa atual. Cada um consulta este documento e seu prompt no GitHub, e atualiza a própria branch. O GitHub armazena código e decisões, não transfere automaticamente memória privada ou arquivos do contêiner entre chats.

## Protocolo seguro obrigatório

1. Confirmar `owner/repo`, branch, HEAD e `version.json` **antes de escrever**; se base estiver divergente ou não acessível, parar operações destrutivas.
2. Usar somente a branch designada. `main` e `import/dev68-staging` não são branches de desenvolvimento.
3. Modificar apenas área autorizada, em commits pequenos. Se um contrato compartilhado exigir alteração, abrir discussão/PR para o integrador antes de mudar.
4. Antes de atualizar arquivos via API GitHub, buscar SHA atual do arquivo e revalidar HEAD; nunca escrever com cópia antiga ou substituir diretórios inteiros.
5. Especialistas criam PR para `dev69/integration`, com evidências de testes e limitações. **Não fazer merge sem aprovação do integrador.**
6. Integrador faz revisão/diff, merge por partes, sincroniza motores e executa regressões. Só libera release após testar os assets necessários, o jogo completo e integridade.
7. Em novo chat, repetir somente: “Leia START_HERE_3_CHATS_DEV69.md no GitHub; siga seu prompt; continue sua issue.” Não é preciso colar o histórico antigo.

## Pendências classificadas

- **Para programar:** começar Skills (Nami R e Vex R) e Itens (lotes pequenos oficiais), e integrar via PR, respeitando SOURCE_READY.
- **Para publicar jogo completo:** transportar ou disponibilizar 78 assets com hash, classificar arquivos QA / auxiliares e tratar histórico Git real. Acesso à Biblioteca pode variar por chat; não presumir caminho sandbox entre chats.
- **QA:** as regressões focadas da importação textual foram executadas e registradas no STATUS; `npm test` integral e Chromium com a reconstrução completa **não foram certificados** nessa importação.

**Regra: segurança de continuidade acima de velocidade.**
