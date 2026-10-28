# Memória técnica V4.5.3-dev66

- Base obrigatória para desenvolvimento: pacote `CoachLOL_MacroArena_V453_Dev66_Purificar_CC_Flash_Barreira_Exaustao_PvP_JogoCompleto.zip`, derivado exclusivamente de dev65. `version.json` marca `4.5.3-dev66`.
- Lógica nova em `engine.mjs`: `applyCleanseV453Dev66`, `cleanseCd`, `cleanseTenacityUntilV453Dev66`, `EffectResolverV41.apply` com tenacidade extra e `damage` com redução para habilidades de `exhaustUntil`. `performActionV40` distingue summoner não-móvel de flash.
- Gate de rede em `multiplayer/authoritative_actions_v453_dev44.mjs`; draft `draft.js`; HUD `multiplayer.html`, `multiplayer/pvp_client_v453_dev47.js`; assets `assets/ui/summoners/cleanse.svg`.
- Para testar: `npm run test:v453:dev66`, `python tools/chromium_pvp_dev66_cleanse.py`, `python tools/sync_browser_v43.py`, `npm test`. A UI Chromium usa snapshots de `docs/QA_EVIDENCE_V453_DEV66/*_cleanse_session.json` gerados pelo primeiro teste.
- Compromissos: não mudar o funcionamento do Desfazer ao sair da fonte, não perder arquivos anteriores/.git, não inventar passivas de itens, não misturar bot advanced com PvP, não afirmar 1:1 de kits/CC.
- Fonte de Cleanse 240s/75%/3s: https://wiki.leagueoflegends.com/en-us/Cleanse, mas parte de stacking da tenacidade é adaptador de treino.
