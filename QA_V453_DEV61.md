# QA — CoachLOL V4.5.3-dev61

## Evidências aprovadas
- **22/22 testes específicos PASS** (`tests/v453_dev61_shop_undo_pvp.test.mjs`).
- **`npm test` integral PASS**, log em `docs/QA_EVIDENCE_V453_DEV61/npm_test_full.log`.
- Compra → Desfazer: restituição integral, componentes e atributos restaurados, sem lucro ou duplicação.
- Venda → Desfazer: desfaz a revenda depreciada e restaura o estado anterior.
- LIFO de múltiplas operações, snapshots, checkpoints e reconexão servidor PvP.
- Gateway autoritativo: sequência/replay, antifraude de valores de ouro, bloqueio de equipe adversária.
- **Regra adicional solicitada:** `comprar → sair da fonte → voltar → desfazer` é negado permanentemente, inclusive no mesmo segundo simulado. Novo negócio na fonte após voltar gera novo histórico, sem recuperar histórico antigo.
- A auditoria cobre movimentos reais via `moveAlong`, saída de fonte, persistência em snapshot e comando `item.undo` do servidor para uma equipe no modelo PvP 1v1.
- 102/202 itens gerais vinculados ao motor, 100 somente referência; dois Doran novos com atributos e efeitos testados.

## Escopo e limitações
- O **Desfazer é permitido apenas enquanto o campeão continua na fonte**, antes de mudanças de estado, avanço simulado ou fase de combate. Sair da fonte invalida as operações anteriores irrevogavelmente. Não depende de fechar/reabrir o modal visual.
- Campeões mortos podem acessar a loja durante a tela de respawn herdada do motor; desfazer continua subordinado à ausência de alterações ou avanço do tempo.
- Cobertura visual real Chromium, partidas completas de dois humanos até Nexus, paridade exata de todos os itens e ícones oficiais offline permanecem **NÃO CERTIFICADOS**.
- Testes não equivalem a certificação de 100% de paridade com LoL.

## Comandos
```bash
npm run test:v453:dev61
npm test
npm run pvp:serve
```
