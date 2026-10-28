# Memória — CoachLOL dev36

- Base dev35 preservada integralmente (Git herdado e arquivos não relacionados sem resets/commits).
- ZIP real coletado pelo usuário em 27/10/2026 incorporado como dados estáticos de referência em `data/riot_reference/source_16_21_1`, 366 downloads verificados contra manifesto, sem vincular dados privados do diretório Windows original.
- Data Dragon 16.21.1 pt_BR/en_US: 863 itens, 315 Map11, 254 Map11/DD purchasable; 173 fichas individuais de campeão em cada idioma. `CommunityDragon/latest` coletado também, não é versão fixada garantida.
- `catalogo_riot_26_21.html`: visualizador consultivo, abre via link na loja; nenhum item de referência pode ser comprado sem motor testado.
- 67 itens locais ligados a IDs Data Dragon; 3 diferenças de custo (duas de missão), 5 receitas divergentes. `docs/QA_EVIDENCE_V453_DEV36/catalog_audit_26_21.json` é fonte para decisões.
- Usuário exige futuro catálogo completo jogável, receitas clicáveis e patch center organizado; itens internos minions/torres são stats de unidade, não compra.
- Mordekaiser R futura: viewport quadrada no topo esquerdo, círculo de limite real, clone de geometria/brush/collider/alterações elementais, 1v1 isolado motor+visual, overlay fecha com a ult; painel de Mordekaiser e Smite ficam sempre no topo do HUD.
- `npm test` integral PASS e 11/11 novos, Chromium do visualizador PASS. Engine.mjs, engine.browser.js, app.js e baseline de tropas/torres iguais dev35 por SHA256. Sem novas partidas longas dev36.
- Marco próximo dev37: corrigir receitas e custos oficialmente verificados + iniciar lote de efeitos completos, sem ativação automática de metadados.
