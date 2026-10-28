# Memória técnica — CoachLOL Dev61

- Base: dev60, 2 jogadores PvP (azul 5x vermelho 5x).
- Novidade principal: Undo transacional com snapshots canônicos e validação antifraude no servidor.
- Regra especial definida pelo usuário durante a implementação: sair da fonte invalida **para sempre** as transações anteriores, inclusive se o campeão voltar. `invalidateShopUndoOnDepartureV453Dev61` apaga pilha e define `shopUndoRevokedV453Dev61`; `recordShopUndoV453Dev61` inicia nova visita para novas operações.
- `shopUnitStateV453Dev61` exclui metadados da pilha e revogação da comparação canônica, permitindo ignorá-los em reversão segura; snapshot de partida persiste revogação.
- Instrumentação de deslocamentos físicos reais, `moveAlong` e outras relocations, bem como `canUndoShop` para posição fora da fonte. Retornar por recall não reabilita histórico antigo.
- Arco de Doran e Elmo de Doran integrados. Catálogo SR 26.21: 102/202 gerais jogáveis; 100 referência.
- Testes: 22/22 novos, npm test PASS, browser sync PASS, QA visual e humanos até Nexus PENDENTE.
