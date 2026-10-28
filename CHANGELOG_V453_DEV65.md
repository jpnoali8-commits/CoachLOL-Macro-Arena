# Changelog V4.5.3-dev65

## Feito

- Ação de rede `order.combo` disponível na preparação PvP, com alvo visível e sequência de 1 a 12 steps QWER e feitiços.
- Gate autoritativo no ingresso: unidade pertence à sessão; inimigo vivo/visível; QWER aprendidas; feitiços equipados. Rejeições não consomem sequência.
- Uso do executor de combos existente (`resolveQueuedCombos`), com GHOST aceito nos combos normais; preservada semântica de mana, cooldown e ataques defensáveis.
- HUD compacto para preparar ataque do campeão ativo, sem comprometer seleção de grupo para movimentação e sem duplicar dano no navegador.
- Novos contratos de ponta a ponta com duas equipes, reconexão, Q+Ignite com DoT e cooldown; Chromium com dois contextos offline e snapshots do servidor.

## Não feito

- Paridade completa de kits/itens e transporte browser-native; sem alteração na mecânica de economia/Desfazer.
