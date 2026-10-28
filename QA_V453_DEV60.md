# QA CoachLOL 4.5.3-dev60

## Matriz de validação
- **18/18** contratos novos em `tests/v453_dev60_pvp_shop_refunds.test.mjs`.
- **100/100** entradas gerais jogáveis reconciliadas com `gold.total`, `gold.sell` e `from` do Data Dragon 16.21.1, mapa 11, SR patch 26.21.
- **23/23** contratos históricos de rede (testes dev47) preservados na regressão integral.
- Compra/Venda: Doran 400→160, Botas 300→210, ward 75→30, poção 50→20, refill 150→60, Lacre 350→140. Receitas recursivas, slot 6, balanceamento ouro e telemetria, não revenda de pet/quest; compras programadas, cancelamentos e snapshots testados.
- PvP duas sessões: cada jogador controla 5 campeões apenas de seu time; compra, venda, visão privada, replay de sequência, reconexão por checkpoint; confirmado nenhum auto-level/resposta de bot do vermelho.
- Pendente certificar: navegador Chromium (headless não retornou screenshot, timeout/DBus), partida humana até Nexus, exatidão integral dos efeitos de 100 itens, 102 itens sem motor, Undo, ícones Riot offline.
- Não declarar paridade exata com LoL ou modo PvP concluído.

## Como testar
```bash
npm test
npm run test:v453:dev60
npm run pvp:serve
```
Acesse `http://127.0.0.1:8787/multiplayer.html` com dois perfis/navegadores separados. Um cria a sala; o outro entra pelo código. Cada perfil terá cinco campeões sob o mesmo jogador, com loja própria e fog restrito.

## Prova de integridade
Comparar ZIP dev59 e dev60, preservar 566 arquivos `.git`, executar `ZipFile.testzip()` e SHA256. Relatórios do empacotamento incluídos junto à entrega.
