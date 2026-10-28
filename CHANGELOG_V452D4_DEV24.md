# Changelog — V4.5.2d-4-dev24

**Escopo:** instrumentação multi-draft e robustez do pacing, sem alterar as regras de combate da dev23.

- Adicionado registro de cinco composições 5v5 em `data/pacing_drafts_v452d4_dev24.json`.
- Novo runner de partidas longas de motor real, seedada e determinística, com os comandos atuais para reações e Golpear.
- Orquestrador Python padrão biblioteca (subprocess/threadpool) para comparar drafts, vencedores, Nexus, tempos, vitórias e falhas.
- Guardião de orçamento de tempo real (wall-clock) **exclusivo da auditoria**; partidas interrompidas são censuradas, nunca confundidas com partidas concluídas.
- 10 cenários: 7 Nexus naturais, 3 interrompidos pelo orçamento; média **condicional** dos 7 é 23:12, sem certificação de média total.
- Novos testes 5/5, `npm test` completo PASS.
- Todos os arquivos herdados, `.git`, máscaras, UI, SVGs CC0 e mecânicas permanecem no pacote completo.

**Não implementado:** novas estatísticas dos campeões, otimização A* no motor, ajuste geral de pacing, paridade Riot, execução Chromium orgânica.
