# Manual de Catálogo Integral e Atributos Internos — Dev35

## Fontes
1. **Riot Data Dragon 16.21.1** (dados oficiais estáticos): `https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/item.json`. Inclui IDs, nome, `gold`, `from`, `into`, `maps`, `stats`, `image`; não certifica scripts, passivas/ativáveis ou efeitos internos.
2. **League of Legends Wiki**: `https://wiki.leagueoflegends.com/en-us/Item_(League_of_Legends)` — taxonomia adicional *Champion exclusive items* e *Minion and Turret items*. A classificação por ID precisa de revisão humana e de URL de evidência específica.
3. **CommunityDragon**: `https://www.communitydragon.org/docs/assets` — dados exportados de arquivos de cliente, consultar quando a Riot omitir propriedades. Dados interpretados como complementares até validação.
4. Notas oficiais: `https://www.leagueoflegends.com/en-us/news/game-updates/`; mudanças entre patches exigem implementação manual, QA e snapshots.

## Fluxo automatizado quando houver rede
```bash
node tools/acquire_riot_catalog_v453_dev35.mjs --version 16.21.1 --locale en_US
node tools/catalog_unified_v453_dev35.mjs stage --items assets/riot/16.21.1/en_US/data/item.json --taxonomy data/patch_center/item_taxonomy_overrides_dev35.json --output data/riot_reference/items_26_21_unified_reference.json
```

Opcionalmente, baixe o JSON oficial no navegador e forneça o caminho local ao comando `stage --items`. O processamento rejeita payloads curtos; `--sample` só para testes e **não deve ser publicado como catálogo real**. As saídas são referências isoladas, **não entram automaticamente no motor**. Classificações de IDs específicos são conservadoras porque a Wiki separa categorias, mas não foi possível baixar o HTML/JSON completo para reconciliar os IDs com segurança neste ambiente.

## Regras de categoria
- `shop`: SR e comprável conforme o Data Dragon; entra no conjunto de candidatos para loja após aprovação de stats e efeitos.
- `champion_exclusive`: exige `eligibleChampions`, fonte e flags de disponibilidade; a compra por campeão correto pode ser habilitada após revisão, nunca liberada globalmente.
- `minion_turret_internal`: associado a unidades/torres identificadas; **nunca item de loja**; modificar perfis internos somente após QA.
- `non_summoners_rift` / `non_purchasable_other`: preservados no arquivo de referência, sem inserção na loja normal.

## Minions e torres
`data/patch_center/unit_balance_26_21_local_baseline_dev35.json` registra as cifras existentes do CoachLOL, não oficiais. `diff-units` compara dois snapshots completos e produz mudanças **NOT_APPLIED**, com contratos obrigatórios: farm nos 5 minutos iniciais, waves até 35m, torre/aggro, minions do Barão, cabeçada do Arauto, estruturas/Nexus, duração e replay. Não inferir valores ausentes dos itens internos da Wiki.

```bash
node tools/catalog_unified_v453_dev35.mjs diff-units --before data/patch_center/unit_balance_26_21_local_baseline_dev35.json --after CAMINHO_VERIFICADO_26_22.json --output docs/unit_balance_diff_26_21_to_26_22.json
```

**Importante:** o patch 26.22 ainda é futuro em 27/10/2026; não existe snapshot oficial 26.22 certificado para ativar neste projeto. Alterações e receitas de loja precisam passar pelos gates existentes de `tools/patch_release_v453_dev34.mjs`.
