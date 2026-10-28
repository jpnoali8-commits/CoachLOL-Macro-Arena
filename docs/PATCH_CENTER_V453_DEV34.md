# Central de Patches — Dev34 / Procedimento para os futuros 26.22, 26.23, 26.24

## Qual é o patch atual?
Em 27/10/2026, o patch de produção **LoL PC 26.21** é a referência do jogo; Data Dragon **16.21.1**. O 26.22 está previsto para **04/11/2026**, seguido do 26.23 (**18/11/2026**) e 26.24 (**09/12/2026**). A Riot avisa que o calendário pode mudar: https://support-leagueoflegends.riotgames.com/hc/en-us/articles/360018987893-Patch-Schedule-League-of-Legends.

## Etapas obrigatórias de cada patch
1. **Prévia:** consultar o feed de versões e o calendário. Uma versão numericamente superior pode representar conteúdo de preparação/PBE. Salvar exclusivamente em `data/patch_center/previews/<version>/<locale>/` quando ainda não lançada; **nunca** alterar o motor.
2. **Confirmar lançamento:** conferir as **notas oficiais** publicadas e possíveis correções mid-patch/hotfix, data da release e modo Summoner's Rift. A confirmação é uma atestação humana, não inferência do `versions.json`.
3. **Importar todos os dados:** `item.json`, `champion.json` e os **arquivos individuais de cada campeão** (`champion/Ahri.json`, etc.) para habilidades Q/W/E/R, passiva e imagens. O Data Dragon é fonte de referência estática; efeitos, fórmulas e interações exigem revisão das notas da Riot.
4. **Integridade:** snapshot contém hashes SHA-256 dos arquivos brutos e cada arquivo individual de campeão; validar antes da revisão. Bloquear arquivos faltantes, modificados ou de versão divergente.
5. **Comparar:** `stage` da versão antiga e nova, `diff` produz fila de alterações em ouro, receitas, atributos, disponibilidade, nomes, descrições de passivas e Q/W/E/R. Snapshot incompleto, mudanças em modos alternativos e ingredientes ausentes/ciclos têm bloqueios.
6. **Revisar cada modificação:** decisões individuais, indicação de fonte e teste automatizado PASS. Conferir mudanças **que não aparecem no Data Dragon**, como dano/ratio, proc, efeitos únicos, buffs de monstros e mecânicas de mapa. Não presumir que descrições textuais viram código.
7. **QA e port manual:** exige `npm test`, Node/browser, compra direta na árvore de componentes, replay/snapshot, fog, objetivos e encerramento natural pelo Nexus. Resultado positivo significa **READY_FOR_MANUAL_IMPLEMENTATION_ONLY**. Ativação efetiva exige implementar/testar o código e pacote de release próprio.
8. **Rollback:** manter snapshot e binário da versão anterior para replays e eventuais reversões. Hotfixes do **mesmo patch** devem ter suas próprias revisões registradas.

## Como operar localmente
```bash
npm run patch:status
# Se online, apenas verificar; não agenda verificações em segundo plano:
npm run patch:check
# Para ver um arquivo de versões guardado localmente:
node tools/check_riot_patch_v453_dev33.mjs --versions-file /path/versions.json

# Após obter os JSON completos e respectivos hashes:
node tools/patch_center_v453_dev33.mjs stage --version 16.22.1 \
  --items /sources/item.json --champions /sources/champion.json \
  --details /sources/champion --out data/patch_center/snapshots/16.22.1.json
node tools/patch_center_v453_dev33.mjs diff \
  --from data/patch_center/snapshots/16.21.1.json \
  --to data/patch_center/snapshots/16.22.1.json \
  --out data/patch_center/reviews/26.21_to_26.22.json

# Pré-liberação, por padrão BLOQUEADA até todos os requisitos:
node tools/patch_release_v453_dev34.mjs preflight \
  --active data/patch_center/snapshots/16.21.1.json \
  --candidate data/patch_center/snapshots/16.22.1.json \
  --diff data/patch_center/reviews/26.21_to_26.22.json \
  --review /reviews/decisions.json --qa /reviews/qa.json \
  --items /sources/item.json --champions /sources/champion.json \
  --details /sources/champion --as-of 2026-11-04 \
  --release-verified yes --notes-url https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-22-notes/
```

**ATENÇÃO:** o URL da última linha é apenas um **exemplo do formato exigido**; não se afirma que essa página exista hoje. `--release-verified yes` é uma declaração do operador, e não prova automatizada de que a Riot lançou o patch.

## Bloqueios explícitos
- `FUTURE_OR_PBE_PREVIEW` enquanto a data prevista não chegar.
- `OFFICIAL_RELEASE_NOT_ATTESTED`/`OFFICIAL_PATCH_NOTES_REQUIRED` sem confirmação humana.
- `SOURCE_HASH_MISMATCH`/`DETAIL_SOURCE_HASH_MISMATCH` para bytes incompatíveis.
- `CHAMPION_DETAILS_INCOMPLETE_FOR_QWER_REVIEW` quando houver campeões sem detalhes.
- `BROKEN_RECIPE_GRAPH` em falta de componentes ou receitas cíclicas.
- `REVIEW_INCOMPLETE`, `DIFF_TAMPERED_OR_STALE`, `QA_NOT_CERTIFIED_*` nos gates de revisão.

## Limitações e decisões canônicas
- Item completo **não** é sinônimo de item funcional; status de efeito por item e testes exigem certificação separada.
- 67 itens locais na dev34, contra o alvo de catálogo SR integral atualizado por patch.
- Rotina de patch funciona sob demanda; não há monitoramento recorrente automático.
- Duração de aproximadamente 30 minutos é referência: **um pouco abaixo é aceitável**, sem ajuste artificial que alongue partidas.
- Mordekaiser R (V4.5.4) deverá isolar mecanicamente os dois campeões numa cópia espacial do mapa original com moitas, colisores e transformações elementais, com HUD quadrado no canto superior esquerdo, círculo interno com colisão real, fechamento automático e camada prioritária junto do Golpear.
