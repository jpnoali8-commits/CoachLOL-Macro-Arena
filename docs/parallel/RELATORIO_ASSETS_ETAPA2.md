# CoachLOL — Etapa 2: inventário de assets da dev68

**Data:** 2026-10-28. **Base:** V4.5.3-dev68. **Status:** INVENTÁRIO CONCLUÍDO; IMPORTAÇÃO BINÁRIA REMOTA PENDENTE.

- ZIP mestre SHA-256: `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be`.
- ZIP mestre: **2549 arquivos**. Fonte textual importada: **1624 arquivos**, mais `SOURCE_ONLY_NOTICE.md` informativo no ZIP textual.
- Pendentes fora da fonte textual: **925 arquivos**.
- Divergências identificadas na primeira importação textual: **12** (4 por BOM/quebra de linha e 8 registros de sessão com IDs diferentes). **Os 12 blobs originais já foram restaurados byte a byte na branch de staging, commit `fbb88bab5c744ea191c2cbfa31605f4933873bd0`.** Blobs SHA Git conferidos, aguardando alinhamento das 3 branches.

## Distribuição dos pendentes

| Categoria | Arquivos | Tamanho descompactado |
|---|---:|---:|
| `historico_git_preservado_no_zip` | 566 | 30.88 MiB |
| `evidencias_qa` | 240 | 35.44 MiB |
| `assets_runtime_e_mascaras` | 78 | 71.26 MiB |
| `previews_historicas` | 30 | 18.53 MiB |
| `cache_local_ou_config_auxiliar` | 7 | 4.79 MiB |
| `referencia_documental_binaria` | 4 | 0.63 MiB |

## Pacote separado para assets necessários ao jogo

- Inclui os **78 arquivos** sob `assets/` e `data/` que não estavam no ZIP textual, preservando caminhos exatos.
- Mapas das variantes elementais, masks/brush/colisores, UI de estruturas e resultados, retratos e máscaras florividentes.
- O pacote contém `MANIFEST_SHA256.json` com hash individual por arquivo e passou no teste CRC do ZIP.
- Referência literal no código não prova uso efetivo em runtime; ausências de referência literal podem vir de caminhos montados dinamicamente. Não remover assets baseado somente neste inventário.
- O pacote separado fica na Biblioteca e **não equivale** a ter publicado esses binários no GitHub.
- SHA-256 pacote de assets: `9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd`.
- Total de referências literais detectadas: `{'referenced_by_source': 52, 'no_literal_reference_detected': 26}`; duplicatas exatas no conjunto de assets: **14 cópias** além do primeiro arquivo.

## Restrições de segurança / fidelidade

- Os 566 arquivos dentro de `.git/` continuam no ZIP mestre original e não devem virar arquivos versionados normais em novo repositório. Migração de histórico requer operação Git real.
- Evidências QA (`docs/QA_EVIDENCE_*`) e previews históricas devem ser preservados no ZIP mestre, mesmo que não sejam pré-requisitos de lógica.
- Cache `.serena/cache` e `.pyc` não deve ser importado como código/asset obrigatório para runtime; preservar apenas no arquivo histórico original.
- `main` ainda é bootstrap; as 3 branches possuem apenas a fonte textual. Não declarar release completo e não certificar renderização com esses assets até validação.

## Próxima etapa sugerida

**Etapa 3:** publicar os binários essenciais ou documentar referência de distribuição imutável e verificável; validar HTML/runtime com esses arquivos; definir tratamento do histórico Git. Depois abrir oficialmente 3 chats com comandos específicos e critérios do GitHub.

## Duplicatas exatas detectadas (principais)

| SHA-256 (prefixo) | Caminhos |
|---|---|
| `95732b7f9271` | `assets/mapa_atualizado.jpg`, `assets/masks/Mapa-Summoners-Rifts.jpg`, `assets/user_rift_masks_20261026/mapa_atualizado.jpg`, `assets/user_rift_masks_20261026/masks/Mapa-Summoners-Rifts.jpg` |
| `be120308cd63` | `assets/masks/Colisores-Mapa.jpg`, `assets/user_rift_masks_20261026/masks/Colisores-Mapa.jpg` |
| `8617c496833b` | `assets/masks/Inibidores-Mapa-Blue-Red.jpg`, `assets/user_rift_masks_20261026/masks/Inibidores-Mapa-Blue-Red.jpg` |
| `0d7c327ce974` | `assets/masks/Monstros-Jungle-completo-com-baron-e-drag.jpg`, `assets/user_rift_masks_20261026/masks/Monstros-Jungle-completo-com-baron-e-drag.jpg` |
| `4c79f0091547` | `assets/masks/Nexus-Mapa-BLue-Red.jpg`, `assets/user_rift_masks_20261026/masks/Nexus-Mapa-BLue-Red.jpg` |
| `c95324c5f5c9` | `assets/masks/Respawn-mapa-Blue-RED-Area-de-compra-itens.jpg`, `assets/user_rift_masks_20261026/masks/Respawn-mapa-Blue-RED-Area-de-compra-itens.jpg` |
| `5f7218cc2071` | `assets/masks/Rio-Mapa.jpg`, `assets/user_rift_masks_20261026/masks/Rio-Mapa.jpg` |
| `8a798ad6e02a` | `assets/masks/Torres-Mapa-Blue-RED.jpg`, `assets/user_rift_masks_20261026/masks/Torres-Mapa-Blue-RED.jpg` |
| `e2aee94560ca` | `assets/user_rift_masks_20261026/masks/4-PointsWards-Vision-late-gamemask.jpg`, `data/faelight_masks_v452d4_dev4/4-PointsWards-Vision-late-gamemask.jpg`, `data/faelight_masks_v452d4_dev5/4-PointsWards-Vision-late-gamemask.jpg` |
| `390f45e2b3d4` | `assets/user_rift_masks_20261026/masks/8-earlygame-PointsWards-Vision-mask.jpg`, `data/faelight_masks_v452d4_dev5/8-earlygame-PointsWards-Vision-mask.jpg` |
| `c238f9baf618` | `assets/user_rift_masks_20261026/masks/Florividentes.jpg`, `assets/user_rift_masks_20261026/masks/Vision-quimtech-drag.jpg` |