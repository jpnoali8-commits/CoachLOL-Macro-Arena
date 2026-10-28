# Memória técnica — V4.5.3-dev67

- Base: ZIP completo dev66 de 2.517 arquivos, preservado na dev67 com histórico Git byte a byte. Marcação `4.5.3-dev67` em package/version.
- `engine.mjs`: `applySummonerHealV453Dev67(u,target)` escolhe exclusivamente outro aliado vivo no raio de 900, com preferência ao alvo informado, ou aplica só a parcela primária no caster. Caminhos planejado (`resolveSummonerCasts`) e combo (`advance...`) compartilham método.
- Target lock: `queueSummoner` rejeita id inexistente/inimigo para Heal; cast explícito de Ignite/Exhaust não troca de vítima com `candidates`, segura intenção sem gastar CD até alvo voltar a estar válido. Ao morrer, a fila é descartada na execução seguinte. Sem `targetId` mantém o seletor automático legado.
- Testes: `tests/v453_dev67_targeted_heal_pvp.test.mjs`, duas sessões com cookies independentes de ambas as equipes. Inclui `ghost`, `barrier`, CC, absorção de dano, persistência de alvo/CD e ownership.
- Após alterar engine: `python tools/sync_browser_v43.py`, `npm run test:v453:dev67`, `npm run test:v453:dev66`, `npm test`.
- Limites: nenhum item promovido; nenhuma certificação geral de kits; nenhuma validação humana 2 browsers HTTP/SSE nativa; sem mudanças de farm, tempo ou torres.
