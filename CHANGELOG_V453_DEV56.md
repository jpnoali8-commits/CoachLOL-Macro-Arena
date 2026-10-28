# CHANGELOG V4.5.3-dev56

- Criado modelo autoritativo de `mana_flow` da Lágrima da Deusa, com recarga, stack cap, dano contra minions, compra, venda e snapshots.
- Adicionado Alternador Hextec com receita aninhada e proc parcial de dano mágico contra campeões, impedindo recursão e resets de recarga na venda.
- Ampliada busca lateral de posições físicas quando o solver de minions não consegue achar posição livre; adicionada auditoria explícita de sobreposições.
- Preservado motor econômico e farm anterior, atualizados catálogos SR e suíte de regressão `test:v453:dev56`.
- Atualizada uma expectativa histórica dev55 para a invariante `playable + referenceOnly = normalStore`, pois a contagem é evolutiva.
