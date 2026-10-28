# CoachLOL V4.5.3-dev34 — Jogo Completo e Central de Patches

Inicie conforme os fluxos de `README_CONTINUAR_CODEX.md` e `INICIAR_WINDOWS.bat`. A base traz o jogo offline, mapa autoral/máscaras, sistemas e assets, logs, `.git` histórico, e agora proteções para versões futuras.

## O que mudou
- Gate de pré-lançamento que distingue números futuros (PBE/previews) de patches oficialmente disponibilizados.
- Verificação de SHA-256 para metadados estáticos, QWER e passivas; comparação de receitas/custos/atributos com testes.
- Fila de revisão obrigatória; sem aplicação automática de regras não verificadas.

## Comandos
`npm test`, `npm run patch:status`, `npm run patch:check`, `node tests/v453_dev34_future_patch_gates.test.mjs`.
Leia `docs/PATCH_CENTER_V453_DEV34.md` para um exemplo do procedimento de patch futuro.

A loja contém 67 itens locais (parcial), mantém compra por componentes na receita. O combate não foi alterado na dev34. V4.5.4 reserva a ultimate R de Mordekaiser com mapa isolado clonado e HUD quadrado.
