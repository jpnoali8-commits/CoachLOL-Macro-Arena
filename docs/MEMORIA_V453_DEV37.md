# Memória de continuidade — CoachLOL V4.5.3-dev37

**Versão final**: `4.5.3-dev37` (27/10/2026), base única dev36, game completo preservado.

**Trabalho integrado**: Loja passou de 67 a 70 itens; itens novos `scouts_slingshot`/3144, `blighting_jewel`/4630, `seekers_armguard`/2420. Cinco receitas agora correspondem ao material Data Dragon 16.21.1 recebido. Anel de Doran custa 400, possui 90 HP e 18 AP, não possui antigo +35 mana; regeneração e dano contra minions pendentes. Zhonya tem 105 AP e estase de 2,5 segundos. Armaguarda tem estase única de 2,5 segundos com consumo pós-gate, sem apagar equipamento, e esse estado persiste no snapshot. Joia da Ruína tem 13% penetração mágica usada no combate. Estilingue só +20% AS; Bullseye é pendência. Canhão energizado também permanece pendência declarada.

**QA**: npm test integral PASS, contratos dev37 10/10, Chromium PASS (zero erros), 3 partidas naturais por Nexus (seeds 26/36/42: 1471/1388/1392s; média 1417s). Nenhum teste de paridade 1:1 Riot ou nova campanha estatística extensa afirmado. Dois prints reais do Chromium em QA_EVIDENCE_V453_DEV37.

**Dados**: dev36 `catalog_26_21_dev36.*` foi mantido; dev37 `catalog_26_21_dev37.*` contém atualização para 70 IDs locais, mantendo registros referência read-only. 863 itens oficiais e 173 campeões continuam importados. Os 2 custos brutos das evoluções por missão divergem de propósito; 0 receitas divergentes depois da reconciliação. Dados 26.22 não ativados.

**Git**: o ZIP dev36 continha `.git` e muitas alterações locais herdadas (inclusive arquivos não rastreados); preservar tudo. Não executar reset/clean/rebase/commit sem autorização. O ZIP dev37 inclui a mesma estrutura e as alterações novas sem descartar os arquivos originais.

**Próximo chat**: extrair ZIP completo dev37, ler `CHANGELOG_V453_DEV37.md`, `docs/QA_V453_DEV37.md`, `docs/ROADMAP_V453_DEV37.md` e `docs/QA_EVIDENCE_V453_DEV37/official_reconciliation_dev37.json`. Executar `npm test`. Prioridade imediata na dev38: Bullseye, passivo energizado do Canhão e Doran Ring, depois lotes funcionais com cobertura por ID Riot. Preservar duração orgânica e projeto com todos os módulos anteriores.
