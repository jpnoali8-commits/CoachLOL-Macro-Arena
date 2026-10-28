# Roadmap de continuidade — após V4.5.3-dev37

## Dev38 — efeito ativo/energizado e expansão progressiva do catálogo

Continuar obrigatoriamente o ZIP completo dev37. Primeira prioridade: implementar o Bullseye do Estilingue e a energização/alcance temporário do Canhão Fumegante, pesquisando números e condições do patch real, com proc correto, prevenção de recursão, cooldown, snapshots, UI e validação no Chromium. Não inventar números oficiais ausentes do extrato Data Dragon. Implementar também regeneração e dano extra contra minions do Anel de Doran.

Depois ampliar o catálogo com pequenos lotes funcionais — componentes, tanques, magos, suportes, botas, anti-cura, penetração, efeitos on-hit e ativáveis — validando preços, receitas, requisitos, inventário, venda, bot e combate. Cada item tem estado de maturidade independente: somente atributo, efeito parcial, completo auditado ou apenas referência. Nunca tornar compráveis os demais registros importados indiscriminadamente.

## Central de Patches

Permanecer no patch 26.21 até o recebimento e aprovação de dados de uma nova versão. Gerar diff e testes de itens/campeões/minions/torres; manter arquivos de patch anteriores para replay. Não marcar 26.22 como publicado nem migrar automaticamente.

## Campanha de QA

Repetir `npm test` integral, Chromium e partidas em perfis variados após os próximos lotes. Média desejada ~25–30min com término orgânico no Nexus, sem alongamento artificial. Dev37 teve amostra pequena de 23min37s; investigar ritmo sem forçar HP/objetivos. Testar novos itens tanto em partida bot quanto na UI real.

## V4.5.4 — kits de campeões

Usar as 173 fichas oficiais apenas como entrada de referência para lotes por campeão. Nidalee/Elise com formas distintas, Shyvana dragão, e Mordekaiser R com instância espacial isolada, viewport **quadrada no canto superior esquerdo**, arena circular de colisão, geometria/moitas/colisores/Rift elemental clonados da região original, sem interferência externa; overlay deve persistir acima de modais comuns, assim como o Golpear. Nenhuma dessas features é declarada completa pela dev37.
