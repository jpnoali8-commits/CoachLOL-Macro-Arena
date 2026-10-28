# PIPELINE DE DADOS E ASSETS RIOT — PATCH LOCK

**Fonte principal:** https://developer.riotgames.com/docs/lol

## Objetivo

Eliminar ícones genéricos/hardcoded, preservar sprites em `assets/` para edição, manter patch consistente e distinguir dados estáticos das regras realmente executáveis.

## O que Data Dragon fornece

- `champion.json`: lista, IDs, estatísticas básicas, ícones de champion.
- `champion/{id}.json`: dados descritivos de spells, efeitos e skins, não execução dos scripts internos do cliente.
- `item.json`: itens com IDs, sprites, preços, ingredientes, atributos e descrição; diferentes modos podem possuir itens não válidos no SR padrão.
- `runesReforged.json`: árvores/ícones e runas.
- `summoner.json`: spells e ícones.
- Imagens `champion/splash`, `champion/loading`, `img/champion`, `img/item`, `img/spell`, `img/perk-images`.

## Script incluído

`tools/baixar_datadragon.mjs` usa Node 20+ sem dependências externas nem API key. Executar **com internet no dispositivo**, pois o pacote offline distribuído não inclui todos os recursos de terceiros.

```bash
node tools/baixar_datadragon.mjs --version=16.21.1 --locale=pt_BR
node tools/baixar_datadragon.mjs --version=16.21.1 --locale=pt_BR --icons
node tools/baixar_datadragon.mjs --version=16.21.1 --locale=pt_BR --icons --splash --loading
```

`--icons` baixa todas as miniaturas de campeões, itens, summoner spells e runas fornecidos pelo JSON. `--splash` e `--loading` podem gerar um download grande; execute conscientemente. O script escreve `assets/riot/{version}/{locale}/manifest.json` com tamanho e SHA256. A versão local deve ser verificada com o endpoint de versões antes de produção. Se um link falhar, o erro fica no manifesto; não será apresentado como concluído.

## Normalização de dados

`ChampionData:{id,key,name,stats,movespeed,attackrange,spells,passive,tags,skins,assetPaths}`

`ItemData:{id,name,price,sell,from,into,stats,mapAllowlist,modes,purchasable,activeScriptId,passiveScriptIds,iconPath}`

`RuneData:{id,tree,slot,iconPath,modifiers,triggerRules}`

`MapProfile:{patchId,mode,mapDimensions,worldBounds,structures,masks,spawnPath,terrainNavmesh}`

IDs de items e campeões não podem mudar por capricho da UX; salvar em game state IDs patch-specific. Conteúdo não presente em DDragon (fórmulas de habilidade, tick rules e scripts de passivas) precisa de módulo próprio e golden tests. **Presets recomendados** serão dados adicionais por patch, role, matchup e amostra estatística, não interpretados como fato a partir do item.json.

## Uso de imagem de alta qualidade

- Champ Select: splash de alta resolução no painel principal, retratos pequenos só para slot de equipe.
- Loading: imagens de loading individuais, moldura e spells/runes.
- Ingame: retratos para token no começo; 3D low poly depois, com LOD e rig autorizados.
- Loja: sprite individual por item, condição de compra, tooltip e disponibilidade.
- Jungle: ícones de camps no editor, entidades de unidades secundárias geradas em runtime.

## Segurança e direitos

- Dados oficiais versionados por Data Dragon são disponibilizados aos desenvolvedores sob termos; **API key não é licença para reproduzir o jogo ou revender os assets**.
- Não embutir key no HTML/JS do browser. API endpoints personalizados sempre via backend se exigirem segredo.
- Model viewer e repositórios de terceiros: verificar licença de cada malha, animação e textura antes de importar ou comprimir GLB.
