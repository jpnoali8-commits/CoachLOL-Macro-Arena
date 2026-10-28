# CoachLOL V4.5.3-dev61 — Changelog

## Loja e Desfazer
- Implementado **Desfazer compra/venda** separado de revenda depreciada. Compras devolvem o custo integral. Vendas desfeitas restauram exatamente o inventário, componentes e saldo anteriores.
- Histórico de operações reversíveis por campeão, limite de 16, LIFO, com snapshot canônico imutável (exceto histórico e marcador de visita).
- **Regra irrevogável da fonte:** ao sair fisicamente da área da fonte, o histórico de compras/vendas da visita é apagado. Voltar à fonte nunca restaura o direito das transações anteriores. Compras novas após retornar iniciam novo histórico.
- Verificação em movimento passo a passo, deslocamentos, Flash, teleportes e movimentações de mapa, além de verificação ao consultar o estado da loja.
- Mudança de estado, tempo simulado, fase de jogo, ordem ou efeitos impede Desfazer; um cliente não pode enviar o próprio valor de restituição.
- Reconnect e snapshots preservam invalidação. Servidor PvP valida equipe, autenticação, sequência e origem das transações.

## Itens
- Arco de Doran (Data Dragon id 1086): AD, AS e vampirismo universal ligados ao motor.
- Elmo de Doran (id 1120): HP, armadura e resistência mágica, além de +5 de dano contra tropas em previsão e resolução de ataques.
- Catálogo conservador Summoner’s Rift 26.21: **102/202 vinculados**, 100 somente referenciados. Nem todos os itens vinculados possuem todas as passivas ou ativáveis certificadas.

## Validação
- `node tests/v453_dev61_shop_undo_pvp.test.mjs`: **22/22 PASS**, com quatro testes de saída definitiva da fonte.
- `npm test`: **PASS** (regressão integral).
- Motor Node e browser sincronizados (`python tools/sync_browser_v43.py`, 73 exports).
- Pendente: teste manual/browser real, partidas humanas até Nexus, ícones Riot offline completos e implementação dos 100 itens ainda consultáveis.
