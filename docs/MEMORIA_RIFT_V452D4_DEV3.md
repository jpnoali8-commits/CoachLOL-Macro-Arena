# Memória de continuidade V4.5.2d-4-dev3 — 26/10/2026

**Fonte única**: o jogo neste ZIP `CoachLOL_MacroArena_V452d4_Dev3_Rift_Vision_GameComplete.zip`. Não partir de dev1/dev2/d3A para programar etapas futuras; versões anteriores servem só para comparação. Git histórico e alterações locais preservados, sem commit.

## Implementado

- d3-A: seis passivos de dragão por stacks/equipe, ledger anti-duplo.
- d4-dev1: evento de transformação única, 3º dragão SR, 2º Swiftplay, variantes deltas determinísticos.
- d4-dev2: máscaras 4096 autorais, Montanha paredes, Oceano moitas, Nuvens movimento, plantas Quimtec/Explosive, Hexgates, wards Faelight, UI, snapshots.
- d4-dev3: oito Faelights antes e quatro depois da transformação. 11 pontos de fato vêm do usuário, `faelight_12` é inferido espelhando o #06. Cada ponto tem polígono temporário de visão próprio; visual só de blue; efeitos por equipe, expiração, supressão, snapshot. Hexgate com bloqueio CC + lock de 5s por ator após uso; Quimtec Bloom com buff curto de +15% velocidade 3s.

## Invariantes

Motor offline canônico `engine.mjs`; `engine.browser.js` por `tools/sync_browser_v43.py`, estático sem dependência externa. Nenhuma reconstrução de máscaras base. Uma única transformação por partida, sem Infernal destruindo terreno. Farm real V4.5.2c 35–47 CS/5min no baseline e freeze parcial; seleção múltipla, alvo alternativo, controle de fog, snapshots; UI 2× não altera ticks simulados. Inexistência de paridade 1:1 de kits, itens, 3D, IA ou multiplayer deve continuar declarada.

## Limitações

- Faelight `faelight_12` não está pintado; requer posição real e polígonos por marcação. A categorização de locais existentes é provisória.
- Scryer's Bloom adicional 15min/transformação, outros parâmetros Quimtec, 6 Hexgates, ocupação de paredes por minions e reação 5v5 ainda merecem calibração.
- Rota TOP imagem revisada está preservada mas não aplicada; ausência de prova de centerline.
- Browser Chromium timeout sem screenshot, Blender MCP não executado.

## Para a próxima execução

Ler `NOVO_CHAT_COMECE_AQUI.md`, `AGENTS.md`, skill local, `CHANGELOG_V452D4_DEV3.md`, QA atual e `docs/ROADMAP_RIFT_V452D4_DEV3.md`; conferir `git status`, `version.json`, `data/rift_user_manifest_v452d4.json`, todos os testes. Priorizar **d4-dev4** com 12º ponto por máscara, visão de wards/replay por equipe, Scryer's 15min e regressão top; depois d3-B Barão e d3-C Elder/Smite.
