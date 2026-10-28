# CHANGELOG — V4.5.3-dev35

**Base:** V4.5.3-dev34, patch LoL 26.21 e Data Dragon 16.21.1.

1. Novo `tools/catalog_unified_v453_dev35.mjs`: classificador de catálogo integral offline com categorias **loja SR, exclusivo de campeão, interno de minions/torres, outro modo e não-comprável**. Conserva todos os IDs de entrada. Compra restrita pelo campeão requer whitelist validada; itens internos nunca aparecem na loja convencional. Marca receitas inválidas e ciclos.
2. Novo snapshot `unit_balance_26_21_local_baseline_dev35.json`: parâmetros vigentes de minions melee/caster/siege/super, torres e Nexus, declarados **locais/não oficiais**. Diff de futuras alterações de HP/dano/armadura e crescimento sujeito a QA obrigatório.
3. Novo `tools/acquire_riot_catalog_v453_dev35.mjs`: quando houver rede, baixa `item.json` e `champion.json` versionados com checagem de integridade e contagem e os coloca somente na área de staging; não ativa alterações de combate.
4. Testes de segurança/compatibilidade `tests/v453_dev35_unified_catalog_units.test.mjs` (**16/16 PASS**) integrados a `npm test` (**PASS**).
5. Três partidas reais do motor reproduziram exatamente a dev34, **3/3 Nexus**, **3/3 hashes iguais**, média 24:41.

**Limites:** download oficial integral bloqueado nesta execução; **67 itens locais** preservados; classificações Wiki por ID pendentes; itens internos não modificaram balanceamento, apenas ficaram auditáveis; sem nova implementação de passivas/QWER/ultimate Mordekaiser; nenhuma alteração nos arquivos autoritativos de combate, UI ou browser.
