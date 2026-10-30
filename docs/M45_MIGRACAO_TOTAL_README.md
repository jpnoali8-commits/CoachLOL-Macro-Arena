# CoachLOL M45 — Migração total do gameplay para Rust e WASM público

**Diretriz mestre:** suspender expansão de novas skills/itens JavaScript até o sistema inteiro de regras e servidor PvP estar em Rust, o conteúdo existente ter sido migrado/auditado e o gate G8 MIGRATION_CERTIFIED passar.

**Ponto de entrada único:** [docs/m45_rust_wasm/START_HERE.md](m45_rust_wasm/START_HERE.md)

**Documentos:** plano mestre, arquitetura, inventário e matriz, fila B01–B33+, gates de QA, ledger de status, protocolo "próxima prioridade" e coordenação dos três chats.

**Arquitetura:** servidor Rust nativo e crates de gameplay (motor/skills/itens/mapa/comandos/partida/etc.). WASM somente funções puras que recebem dados públicos, web UI em TypeScript/HTML/CSS. Nenhuma regra autoritativa ficará em JS no runtime final.

**Estado:** M45 B01 inicial commitado no PR #19 Draft, G1 native/wasm não certificado. Próxima prioridade M45 B02. Não mesclar main nem abandonar PR #9/item branch.
