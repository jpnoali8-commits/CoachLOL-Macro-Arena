# Memória de continuidade — CoachLOL V4.5.3-dev33
Base: V4.5.3-dev32 → V4.5.3-dev33. Pacote completo com Git herdado e alterações acumuladas.

## Princípios imutáveis
1. Patch de referência é versionado e separado do motor autoritativo. Data Dragon ≠ passivas e habilidades completas. Patch novo só após auditoria de notas, implementação e QA. Não atualizar silenciosamente.
2. Loja completa com compra de qualquer componente na árvore de receitas é requisito fixo. 67 itens locais nesta versão; catálogo integral pendente.
3. Campeões: atributos por nível, passiva, QWER, formas Nidalee/Elise/Shyvana e ult Mordekaiser ficam no backlog V4.5.4. Painel de Mordekaiser quadrado no canto superior esquerdo, arena circular interna, clone dos colisores, moitas e variante elemental ativos, isolamento 1v1 real, retorno coerente às posições e fechamento automático. Mordekaiser e Golpear ficam acima dos demais overlays.
4. Meta de partida: média ~30 minutos por destruição natural do Nexus. Última média dev33 cinco seeds 25:17 (abaixo da meta, recalibrar após lotes novos).
5. Preservar farm, máscaras autorais, Atlas, ícones CC0, visão Oracle através de paredes e pink condicionada à linha de visão, Arauto, Barão, Ancião e replay determinístico.

## Dev33
- 5 itens novos com mecânicas reais no motor; 9/9 testes de itens.
- Central de Patches com `current.json`, `check_riot_patch_v453_dev33.mjs`, `patch_center_v453_dev33.mjs`, documentação, 7/7 testes.
- 26.21 lançado em 21/10/2026, hotfix em 22/10; próximo 26.22 previsto 04/11.
- Download da Riot inacessível nesta execução. NÃO dizer que o catálogo oficial está completo ou que atualização automática foi ativada.
- `npm test` integral PASS após a infraestrutura.

## Próximo marco
Dev34: buscar Data Dragon completo de forma autorizada, carregar fotos/ícones com origem legítima quando necessário, mapear IDs locais, corrigir restrições/receitas por patch, implementar efeitos em lotes e rodar testes longos antes de alterar versão ativa.
