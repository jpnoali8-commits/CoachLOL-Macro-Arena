# CoachLOL V4.5.3-dev60 — Loja SR e PvP 1v1

## Implementado
- Tabela de revenda derivada exclusivamente de `data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json` (Riot, campo `gold.sell`) para 100 entradas `engine_playable` do catálogo SR 26.21. Inclui exceções 40%, 0%, consumíveis e itens iniciais. `tools/generate_sell_values_dev60.mjs` regenera a tabela auditável.
- `Arena.canSellItemV453Dev60`: preflight verificável por servidor e UI, sem mutação; rejeita fase inválida, fora da fonte, itens de missão, pets, trinkets, índices inválidos e itens sem valor oficial. `sellItemV43` elimina o cálculo genérico de 70%. Vender elimina atributos, estados temporários e itens do inventário, registra saldo e telemetria.
- Loja principal apresenta *Vender +N ouro*, preço de compra e perda com valor oficial, desabilitando a ação inválida.
- Gateway autentica **1 humano azul controlando os cinco azuis** e **1 humano vermelho controlando os cinco vermelhos**. Operações PvP `item.buy`, `item.sell`, `item.cancelQueue` na whitelist apenas da camada pós-dev47, preservando contrato da dev44. Proteção contra replay e ordens de equipes cruzadas.
- Servidor `GET /api/shop` expõe apenas itens jogáveis (sem dados privados) e valor oficial de revenda. Projeção `shopInRangeV453Dev60` contém apenas unidades do próprio jogador. Cliente PvP oferece compra, venda, fila, receitas, procura e multiseleção com ordens em grupo.
- Em PvP, a equipe vermelha **não usa auto-level nem auto-response de bots**; ambas escolhem skills e defesa manualmente. Modos de bot preservados.

## Certificação/limites
- 18 novos testes: catálogo 100/100, receitas, economia, 1v1, visão, shop remoto, falsificação de preço, idempotência, checkpoint, 2 sessões, HQ.
- Testes históricos e `npm test` completo; logs externos da entrega.
- Limitações: **Undo (desfazer com 100%) não implementado**; vender é operação distinta, com depreciação. 102 itens SR continuam apenas consultáveis. Efeitos de certos itens jogáveis e kits não são totalmente certificados. Cliente PvP ainda é protótipo compacto, não HUD completo. Partida humana até Nexus e Chromium não certificados. Ícones Riot offline incompletos.
