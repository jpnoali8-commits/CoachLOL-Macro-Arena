# CoachLOL — Central de Patches (V4.5.3-dev33)

## Fonte e versão canônica
- 2026-10-27: **League of Legends PC 26.21** (lançado 2026-10-21), Data Dragon **16.21.1**. A Riot registra hotfixes datados de 2026-10-22 nas notas do mesmo patch.
- Patch **26.22 previsto para 2026-11-04**; a data pode mudar. Nunca adotar um novo patch só porque apareceu em um feed antecipado.
- Fontes: https://support.riotgames.com/en-us/league-of-legends/gameplay/patch-schedule-league-of-legends, https://developer.riotgames.com/docs/lol, https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/

## Arquitetura — três estágios segregados
1. **Referência estática, imutável e versionada** (`data/patch_center/incoming/<version>/<locale>/`): itens em `item.json`, `champion.json`, `champion/<name>.json`, fontes oficiais e checksums SHA-256. Não é motor de combate. Não classificar descrições como regras funcionais.
2. **Comparação e revisão de patches** (`tools/patch_center_v453_dev33.mjs`): snapshots versionados e relatório de adições, remoções, preço, receitas, atributos, descrições, passivas, Q/W/E/R (custo, cooldown, alcance e hash das descrições quando detalhe está disponível). Itens exclusivos e restrições de modo precisam de checagem manual. Diferenças textuais não implicam implementação.
3. **Motor autoritativo** (`engine.mjs`, navegador e snapshots): mudanças de balanceamento aplicadas em lote pequeno e revisado, com testes de compra, efeitos e combate, parity Node/browser, replay/snapshot, duração e QA. **O pipeline não aprova nem ativa mudanças automaticamente.**

## Operação
O fluxo é sob demanda, ou invocado por um agendador externo autorizado. A existência dos scripts não constitui monitoramento em segundo plano.

```bash
npm run patch:status
npm run patch:check
# Se o CDN estiver indisponível: passar uma versão conhecida e os arquivos oficiais recebidos manualmente.
node tools/patch_center_v453_dev33.mjs stage \
  --version 16.21.1 --items /path/item.json --champions /path/champion.json \
  --details /path/champion_details --out data/patch_center/snapshots/16.21.1.json
node tools/patch_center_v453_dev33.mjs diff \
  --from data/patch_center/snapshots/16.20.1.json \
  --to data/patch_center/snapshots/16.21.1.json \
  --out data/patch_center/reviews/16.20.1_to_16.21.1.json
# Opção: conferir nova versão e apenas baixar dados estáticos, sem tocar no motor:
node tools/check_riot_patch_v453_dev33.mjs --fetch
```

`stage` exige pelo menos 150 itens e 120 campeões quando não configurado como fixture de teste. O `--allow-sample` é **restrito ao ambiente de QA**, gera apenas referência e nunca modifica o motor. `stage` não sobrescreve snapshot por padrão. `diff` gera uma fila de revisão com decisões **pending** e gate bloqueado. Os scripts não implementam aplicação de efeitos, pois isso não pode ser garantido por metadados.

## Categorias de alteração
- **Loja:** disponíveis por modo, ID estável, preço, desconto, receitas (incluindo componentes aninhados), atributos, restrições de slots, classificação de passivas/ativos, ícones oficiais quando licenciados e acessíveis.
- **Campeões:** HP/AD/armadura/MR/mana, crescimento por nível, status de formas e passiva, custo e recarga das habilidades, dano/ratios, alcance, controle, escudos, curas, transformações e interações de colisão. Data Dragon frequentemente **não contém** as fórmulas completas de dano e escalamento; essas precisam das notas oficiais e auditoria manual.
- **Sistemas:** objetivos, wards, fog, runas, minions, torres, mapa elemental e outras regras que podem mudar em patch notes sem alteração de item.json.

## Checklist de liberação
- [ ] Arquivos oficiais completos da versão e idioma, sem divergência de build.
- [ ] Diff versionado revisado; notas do patch incluindo mid-patch/hotfixes verificadas.
- [ ] Receitas integras; compra direta pelos componentes e reembolso testados.
- [ ] Passivas/ativos e QWER alterados implementados e com contratos específicos; nenhum placeholder declarado certificado.
- [ ] Restrição de arena/modos e unicidade testada.
- [ ] Snapshot antigo mantém versão de regras ou possui migração documentada; replays reproduzíveis.
- [ ] Node/browser, `npm test`, testes de UI, partida completa e distribuição da duração média próxima a 30 min.
- [ ] Reversão e pacote completo verificável antes de marcar a versão ativa.

## Limitações explícitas da dev33
O download do `item.json`/`champion.json` oficial completo não estava acessível neste ambiente; **não houve carga integral nem ativação de patch novo**. Há 67 itens locais, com efeitos parcialmente auditados. Os manifestos QWER ainda são parciais. O patch 26.22 ainda não foi lançado na data desta entrega.
