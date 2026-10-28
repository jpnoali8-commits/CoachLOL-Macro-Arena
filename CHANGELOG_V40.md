# V4.0.0 — Engenharia do executor e rastreabilidade

Data: 2026-10-26. Origem: **ZIP V3.9.0**, sem downgrade para V3.7.

## Código integrado

- `performActionV40` com pré-validação, commit único e locks por ação/segundo simulado.
- Migração de casts direcionais, Nami W com aproximação, ultimates especiais, QWER de combo/AA, summons planejados/combos, flash/escapes, stasis, smite, ataques de campeões e jungle.
- Automações que gastam mana passam por `tactical`; Vex R2 registrada sem reembolso nem reconsumo de cooldown.
- Journal privado para intenções, redigido para adversário por observação; não transmite coordenadas ou IDs ocultos.
- Snapshots do motor com RNG serializável, reidratação por `Arena.fromSnapshotV40`, checksum estável e testes Node/browser.
- Retenção das opções 1×/2× de tempo real, sem modificar segundos simulados.

## Não reivindicar como implementado

- Transação ACID de toda a aplicação de danos/efeitos (somente recursos, cargas e cooldowns estão centralizados).
- Replay completo desde comandos iniciais, assinaturas/anti-cheat, rollback de rede ou isolamento multiplayer real.
- Dados completos de campeões, kit 1:1, colisões, runas, centenas de itens e estado de CC universal.
- Eventos individuais de dano de minions/torres totalmente normalizados no mesmo journal.

## QA

`npm test`, `npm run test:v40`, teste visual Chromium. Consulte `docs/AUDITORIA_V40_ARQUITETURA.md`.
