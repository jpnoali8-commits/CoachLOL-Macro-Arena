# Continuar CoachLOL a partir da Dev61

Base canônica: `V4.5.3-dev61` (não usar base anterior). Ler `AGENTS.md`, `MEMORIA_CONTINUIDADE_V453_DEV61.md`, `QA_V453_DEV61.md`, `ROADMAP_V453_DEV61.md` e `CHANGELOG_V453_DEV61.md`.

**PvP:** 1 humano controla os cinco campeões azuis; 1 humano controla os cinco vermelhos. Ambos confirmam turnos simultâneos; sem bots estratégicos adicionais.

**Regra da loja aprovada:** venda por `gold.sell` Riot; **Desfazer é devolução integral exclusivamente na mesma permanência na fonte**. Ao sair, o histórico fica inválido definitivamente mesmo voltando; compras novas depois de voltar podem ser desfeitas apenas enquanto permanecem na fonte. Não reverter ouro/efeitos de outros sistemas. Toda operação validada pelo servidor.

`npm test` e `npm run test:v453:dev61` aprovados. Os testes não certificam partidas humanas completas nem visuals em Chromium. Não misturar ARAM/TFT/itens antigos.
