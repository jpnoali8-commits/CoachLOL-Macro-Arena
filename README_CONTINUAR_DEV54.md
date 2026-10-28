# Continuar V4.5.3-dev54

1. Trabalhar sempre sobre este ZIP mestre, sem reset/rebase/commit que destrua modificações herdadas.
2. Rodar `npm test`. Antes de trocar algoritmo de minions, reproduzir seeds 26/42 e comparar CS, duração, vencedor, mortes e últimas hits.
3. `python tools/sync_browser_v43.py` após qualquer alteração de `engine.mjs`.
4. Para adicionar itens, usar Data Dragon 16.21.1 e `node tools/build_sr_shop_v453_dev49.mjs`; só liberar após testes reais e manter efeitos incompletos documentados.
5. Continuar PvP e kits próprios de campeões; não priorizar IA avançada dos bots.
