# DEV69 — Auditoria de assets remotos (28/10/2026)

**Status: 71/78 paths do ZIP original no GitHub; P0 incompleto; RELEASE_BLOCKED.**
Branch exclusiva: `dev69/assets-import` → futura revisão por `dev69/integration`. `main` não foi alterada.

## Fonte preservada
- ZIP da Biblioteca: `/CoachLOL/Dev69/AssetsEtapa2/CoachLOL_Dev68_Assets_Mapas_Mascaras_UI_Completo.zip`.
- ZIP original: 67.880.735 bytes; SHA-256 `9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd`; 79 entradas (78 binários + manifesto).
- Matriz canônica: `docs/parallel/SHA256_ASSETS_DEV68.txt`, 78 caminhos com SHA-256 originais.
- O ZIP foi materializado do acervo, aberto sem erros e os sete bytes ausentes tiveram seu SHA-256 comparado à matriz. Todos correspondem. **O acervo de origem não precisa ser recriado.**

## Auditoria da árvore remota
No commit `cf9f79f12f37343e909bd00e47e3f198b8f2ea2e`, leitura de árvore Git recursiva (não truncada) e interseção exata de caminhos com a matriz:
- **71/78 presentes**, 53.420.603 bytes descompactados.
- **7/78 ausentes**, 21.299.904 bytes no ZIP original, na lista abaixo.
- A árvore diverge de `dev69/integration` em **71 arquivos binários** e cinco commits daquele momento, sem conflitos históricos nem mudança em `main`.
- Os arquivos remotos foram adicionados por blobs Git; o gate SHA-256 para o clone foi acrescentado agora, mas **NÃO afirmar QA remoto PASS sem executá-lo**.

| Caminho ausente | Bytes do ZIP | SHA-256 original |
|---|---:|---|
| `assets/mask_layers/brush_binary.png` | 35143 | `cbdcec8af30732edfc9cdb568573d090d7b278d8e0d5abf9d2c4a88c815706f8` |
| `assets/mask_layers/river_binary.png` | 27606 | `20be8f633f14a93f718da95492c2b5b497721d2e011b88a52d557d5b5c3038a8` |
| `assets/masks/Brushs-Moitas-Mapa.jpg` | 362773 | `2590e19ac4cc80aa0bd820fda7f9c25bc73069a08f19808861602eee1ad4b693` |
| `assets/ui/endgame/defeat_overlay.png` | 1429881 | `269a2f52d5461523322f9d16f27f048ecbf603d1774bbab88ac4becac413c8` |
| `assets/ui/structures_dev48/red_tower_barricade.png` | 465615 | `e992d143575b1fd5d0095c72a8671910417b7dd9c154b8037d833b1f248a9204` |
| `assets/user_rift_masks_20261026/mapa_Ocean_atualizado.jpg` | 9457998 | `eb4b6c76f0deaf5aafd76cbbb1ff80d1b4a5c77b8416c812262dc1d9b1d4df3e` |
| `assets/user_rift_masks_20261026/mapa_mountain_atualizado.jpg` | 9520888 | `576a86cdf05a2162697f50a51ac3fe94ad70fa23952fb4f43adf4585dd6d5efe5ec` |

## Gate de integridade e continuação
```bash
python tools/verify_binary_assets_dev69.py
```
- Check obrigatório: 78 arquivos reais presentes e SHA-256 idêntico ao ZIP mestre; **exit 1** em missing/mismatch, **exit 2** em manifesto inválido.
- Não criar placeholder, redimensionar imagens, substituir assets, commitar `.git` legado nem declarar release.
- Próxima etapa: transferir sete blobs originais, revisar SHA-256 no checkout remoto, integrar **somente depois** do gate 78/78; executar CI `npm test` completo, Chromium 2 sessões, fog/Undo/Nexus. Histórico Git legado continua preservado separadamente, sem migração ao novo remoto.
- PRs de kits/itens ainda não certificados não são parte desta importação.

> Relatório substitui apenas o status da **distribuição binária parcial**; não atualiza retrospectivamente relatórios que documentam o estado anterior.
