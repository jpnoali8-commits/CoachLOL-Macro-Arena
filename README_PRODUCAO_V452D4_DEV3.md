# CoachLOL Macro Arena — V4.5.2d-4-dev3

Esta é uma continuação **integral** do ZIP V4.5.2d-4-dev2, com todos os seus fontes, mapas, máscaras, testes, arte, `.git` e documentos; não é um patch isolado.

1. Para abrir offline em Windows, use `INICIAR_WINDOWS.bat` na raiz ou `index.html` em browser compatível.
2. Para testar, tenha Node.js e Python (somente scripts de importação) e rode `npm test` ou `npm run test:v452d4:dev3`.
3. Para reprocessar as fontes autorais: `python tools/import_user_rift_maps_v452d4.py` e **obrigatoriamente em seguida** `python tools/refine_faelights_v452d4_dev3.py`. O segundo passo marca a posição inferida e constrói regiões experimentais sem alterar os JPGs. Rode `python tools/sync_browser_v43.py` após modificar `engine.mjs`.
4. Não use este pacote como certificação das formas oficiais ou das regras completas do LoL PC 26.21. Consulte QA, changelog e roadmap.

O motor offline segue funcionando sem Blender, Rust ou backend.
