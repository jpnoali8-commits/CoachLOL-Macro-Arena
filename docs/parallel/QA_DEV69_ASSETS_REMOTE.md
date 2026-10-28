# Dev69 — Assets binários originais no GitHub

**Estado em 2026-10-28: 78/78 arquivos com SHA-256 idêntico ao ZIP original.** A importação está na branch `dev69/assets-import`, **não** na `main`. O PR #14 aguarda o gate de regressão integrada e revisão.

## Fonte e hashes

- ZIP binário original: `CoachLOL_Dev68_Assets_Mapas_Mascaras_UI_Completo.zip`.
- Tamanho ZIP: 67.880.735 bytes, SHA-256 `9d93d4de1f847330bd92671e9798be243b692dc07996ecb736b8f9aef6a06abd`.
- Conteúdo: 78 arquivos reais + manifesto. Os bytes foram preservados; nenhuma imagem foi reexportada ou substituída.
- Matriz oficial de verificação: `docs/parallel/SHA256_ASSETS_DEV68.txt`.
- Gate reprodutível: `python tools/verify_binary_assets_dev69.py`.

## Restauração dos dois mapas restantes

- `assets/user_rift_masks_20261026/mapa_Ocean_atualizado.jpg`: 9.457.998 bytes, SHA-256 `eb4b6c76f0deaf5aafd76cbbb1ff80d1b4a5c77b8416c812262dc1d9b1d4df3e`.
- `assets/user_rift_masks_20261026/mapa_mountain_atualizado.jpg`: 9.520.888 bytes, SHA-256 `576a86cdf05a2162697f50a51ac3fe94adf22952fb4f43adf4585dd6d5efe5ec`.

Os dois arquivos foram transferidos em fragmentos com SHA Git verificado, reconstruídos no GitHub Actions em uma branch temporária separada e gravados **somente como JPEGs originais** em `dev69/assets-import`. Os fragmentos não constam da árvore nem dos commits ancestrais desta branch.

- Commit com os mapas restaurados: `65d2546293b8240bbe4bdfcb878ccb30e7fb50f5`.
- [GitHub Actions de restauração — PASS](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40780131522): `DEV69 ASSETS: 78/78 SHA256 PASS | 0 MISSING | 0 MISMATCH`.
- A árvore `dev69/assets-import` acrescenta 78 assets do ZIP mestre e os dois documentos/scripts de QA, sem sobrescrever a engine.

## Gates ainda necessários

**78/78 SHA-256 PASS** é apenas a integridade dos assets. Antes de declarar release ou promover `main`: rever PR #14 e integrá-lo exclusivamente em `dev69/integration`, executar `npm test` integral no clone do branch, validar engine.browser.js, HTTP/SSE PvP com dois humanos e fog separado, reconexão/Undo/Nexus natural e versionamento. O antigo `.git` e os artefatos de QA adicionais do ZIP mestre continuam arquivados separadamente. Não declarar jogo 100% certificado por um gate binário.
