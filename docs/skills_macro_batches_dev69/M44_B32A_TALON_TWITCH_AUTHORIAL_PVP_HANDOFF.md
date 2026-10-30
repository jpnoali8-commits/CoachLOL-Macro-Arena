# CoachLOL Macro Arena — M44 B32A | Talon E e Twitch R (20/20 V8)

## Estado e escopo
- Base: `6c6bd24400a486578164f4b76621a5a900861ffa`, branch `dev69/skills-batch2`, PR #9 Draft, sem merge.
- 2 habilidades autorais em 2 campeões. Este é **sublote B32A**, não 25–40 campeões concluídos ou kit P+QWER certificado.
- Arquivos: `engine.mjs`, `tests/audit/v453_m44_b32a_talon_twitch_authorial_pvp.test.mjs`, este handoff.

## Implementação
- **Talon E — Assassin's Path:** 800u de travessia máxima, obstáculo único real entre duas posições legais, parede inicial a até 725u; movimento autoritativo por ponto, anti-dash compartilhado e cooldown global de 2s. Bloqueio por setor de parede de 300u, 160/135/110/85/60s por rank; revalidação no momento da execução antes de pagar o custo. A identificação topológica exata das paredes da referência ainda não está certificada.
- **Twitch R — Spray and Pray:** 100 mana, 90s CD, efeito de 6s com +30/45/60 AD e +300u alcance. AAs atingem inimigos alinhados em corredor de largura 120u e comprimento 1100u; queda de 20% por contato até mínimo 60%; dano nos secundários não recursivo.
- Registro original `m44B14DOriginalBoardRuleV453` foi estendido, preservando reutilização de código no Sylas/Viego sem allowlist adicional.
- Estado por dono salvo no snapshot V40. Sem fallback genérico.

## QA e limites
- Código candidato compilado via JS V8: **PASS**.
- **20/20 verificações focadas V8 PASS** (10 casos × azul/vermelho), com terreno e injeção controlada, alcance, linha de dano, expiração, veto em queue/commit e continuidade V40.
- **Não executado** nesta etapa: 52 suítes históricas e 1882 cenários anteriores, Node nativo, npm test, navegador, rede PvP ou auditoria 1:1 de LoL. Último gate de regressão total continua sendo o B31B no HEAD anterior.
- Pendências Twitch R: voo real a 5000u/s, esquiva/visibilidade durante deslocamento e pipelines on-hit de alvos secundários. Pendências Talon E: topologia por parede e efeitos de interrupção em trânsito.
- Fonte: https://wiki.leagueoflegends.com/en-us/Talon e https://wiki.leagueoflegends.com/en-us/Twitch.

## Próxima prioridade: B32B
- Testar regressão real contra os 52 suites históricos e refinar on-hit, projéteis e colisão.
- Retomar a ampliação em macrolotes de 25–40 campeões com identidade individual P+QWER e status honestamente parcial.
- Sem GitHub Actions, Codespaces, workers, merges, rebases ou force-push. `engine.browser.js`, itens, integração e main intocados.
