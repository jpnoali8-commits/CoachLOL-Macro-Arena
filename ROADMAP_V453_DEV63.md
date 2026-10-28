# Roadmap após V4.5.3-dev63

## Dev64 — prioridade principal

1. **E2E humano competitivo no Chromium:** desbloquear transporte browser localhost em ambiente apropriado; jogar por duas sessões persistentes da seleção de campeões ao Nexus, com fog real, ordens QWER, contra-respostas, itens ativáveis, Smite, telemetria e tela de resultado. Não confundir testes de scripts com humanos reais. Aperfeiçoar UI de seleção e reação conforme os cenários auditados.
2. **Reações em combate e deadlocks:** ampliar baterias que efetivamente disparem `pendingDecision` e resolvam pelo jogador correto; testar recuo, perseguição e combinações QWER/feitiços, morte, recall, shop/undo e restauração de checkpoint **no meio** do combate. Não automatizar defesas humanas em produção.
3. **Itens SR auditados:** selecionar lote pequeno dentre 100 itens reference_only do Data Dragon 16.21.1, implementar atributos/receitas/passivas/ativáveis/resoluções de danos/cura/escudo, testes por efeito e snapshots antes de marcar como playable. Ícones somente de assets oficiais quando rede disponível.
4. **Kits individuais:** priorizar Neeko, Sylas, Viego, Mordekaiser R. Ultimate de Mordekaiser: viewport quadrado no canto superior esquerdo, arena mecânica circular clonando colisores/moitas/alterações elementais; Smite e Mordekaiser em camada superior.
5. **Farm e estruturas:** novo sweep em 30 seeds e drafts incluindo ambos jogadores ativos, detectar Nexus prematuro, last hits e estabilidade após qualquer mudança física; meta orgânica de aproximadamente 30min sem encerramento por tempo. Preservar Undo da fonte e PvP 1v1 × cinco campeões.

## Gates antes de entregar dev64

- Regredir dev61, dev62, dev63 e `npm test` integral. Sincronizar Node/browser.
- Testar ação privada, segurança e persistência; nunca expor snapshots ou RNG aos clientes.
- Declarar com precisão o que é simulado/scriptado, o que ocorreu no browser, o que não foi observado; preservar ZIP mestre e `.git`.
