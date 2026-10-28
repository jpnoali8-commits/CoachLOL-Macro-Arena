# CoachLOL Macro Arena — Changelog V4.5.2d-4-dev3 (26/10/2026)

## Procedência

Base **exclusiva**: `CoachLOL_MacroArena_V452d4_Dev2_Rift_Maps_GameComplete.zip`, sem aplicar versões antigas de motores/fontes. Código JS autoritativo offline mantido. `.git` e alterações herdadas foram preservadas, sem `reset`, `clean` ou commit.

## Entregas funcionais

1. **Faelights 2026 (fase e categorias)**: oito locais ativos no início, quatro desbloqueados uma única vez após a transformação elemental. Categorias provisórias: quatro próximos de portões de base, dois arbustos ilhados, dois arbustos banana no meio e quatro próximos das rotas laterais pós-Rift. Os **11 marcadores anotados pelo usuário** permanecem intactos. O 12º (`faelight_12`, espelho de `faelight_06`) é **inferido e NÃO validado**, destacado em amarelo na interface. Não certificar posição 1:1.
2. **Regiões de visão Faelight específicas por local**: polígonos direcionais distintos, duração simulada de 45s; preserva +25% do raio da sentinela. Agora a região é testada como polígono e só funciona com sentinela aliada ativa, sem supressão e após desbloqueio. A região pode revelar dentro de moitas por contrato e respeita paredes na atual implementação. Contornos **provisórios**, não máscaras oficiais Riot.
3. **Interação visual**: contornos do campo extra renderizados apenas para blue/local no mapa, com marcadores posteriores ocultos até transformação. Nenhum evento privado de inimigos introduzido.
4. **Hexgates**: proibição de iniciar sob stun, root, grounded ou stasis; interrupção da canalização caso CC seja aplicado, movimento ou combate aconteça durante canalização. Após teleporte completo aplica bloqueio temporário de reutilização de **5 segundos simulados (protótipo configurável / NÃO certificado)**, com persistência por snapshot. Não altera dragões, dano, relógio 2× ou custo de ações.
5. **Firelight Bloom / Quimtec**: aliados alcançados pela área do pulso recebem +15% de velocidade por 3s simulados (protótipo; fórmula oficial/condicional direcional ainda pendente), sem alterar campos-base; não buffa oponentes. Mantém cone, visão e sentinelas reveladas a 1 HP.
6. **TOP**: diagnóstico que compara vértices de rotas com a nova máscara autoral (todos sobre tinta de rota) mas **sem aplicar recalibração**. Distância à tinta não comprova centro topológico nem farm; manter código/objetos anteriores por segurança.
7. Testes novos `tests/v452d4_dev3_faelight_hextech.test.mjs` (8 contratos), gerador reprodutível de faelights e auditoria não destrutiva da TOP. `engine.browser.js` regenerado da única autoridade `engine.mjs`.

## Reprodutibilidade e rollback

`python tools/import_user_rift_maps_v452d4.py` importa a fonte autoral original; executar **depois** `python tools/refine_faelights_v452d4_dev3.py` para acrescentar as categorias e polígonos desta versão; executar `python tools/sync_browser_v43.py` para regenerar o bundle do motor. Não editar manualmente `data/masks_128.json` ou os JPG originais. Para reverter exclusivamente dev3, partir do ZIP dev2 verificado e não reescrever commits ou alterações de outro checkout.

## Estado e limitações

- Implementado e testado: 8+4, regiões provisórias, snapshot, CC Hexgate, bloomy Quimtec, UI no mapa.
- Não certificado: localização do 12º Faelight, contornos oficiais das 12 regiões, cooldown/números Quimtec/Hextech, mudanças estruturais precisas de TOP, visão detalhada por tipo de ward, visual Chromium, Blender e replay 5v5.
- Montanha/Oceano e Infernal da dev2 preservados. O Infernal não destrói terreno.
- Farm e freeze V4.5.2c não regrediram nos testes registrados.

## Referências oficiais

- LoL 26.1 Faelights 8+4, +25% visão e região 45s: https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/
- Quimtec Firelight Bloom e Blast Cone 2× de 12.22: https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-22-notes/
- Patch-alvo 26.21: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
