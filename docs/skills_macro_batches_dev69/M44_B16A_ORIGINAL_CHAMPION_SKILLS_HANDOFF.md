# CoachLOL Macro Arena — M44 B16A | 14 habilidades autorais

Base: 4b04a46404a0ec999edbe990da9e53a41706155e (B15).
Branch exclusiva: dev69/skills-batch2. PR #9 segue Draft e sem merge.

## Novos slots
- AurelionSol.R: Falling Star, CC e impacto, onda expandida condicionada a stardust.
- Lissandra.W: Ring of Frost, enraizamento radial e dano.
- Taliyah.E: Unraveled Earth, região por tempo e punição a movimento dentro da área.
- Yorick.E: Mourning Mist, marca por proprietário e slow.
- Malzahar.E: Malefic Visions, DoT e propagação por morte.
- Fiddlesticks.Q: Terrify com condição de medo prévio.
- Nocturne.E: Unspeakable Horror, vínculo e medo após permanência no alcance.
- Skarner.W: Seismic Bastion, escudo e slow radial.
- Belveth.W: Above and Below, knockup e recarga da direção Q atingida.
- Rakan.E: Battle Dance, salto aliado e escudo.
- Pantheon.W: Shield Vault, aproximação e stun.
- Diana.W: Pale Cascade, três orbes táticas e segundo escudo condicional.
- Akshan.R: Comeuppance, tiros escalando vida faltante e interceptação.
- Leblanc.E: Ethereal Chains, primeiro contato com tether e root temporal.

Todos usam o registro original compartilhado por Sylas/Viego, com ownership do ator e estados checkpointáveis. Sem fallback genérico adicional. NÃO são kits P+QWER completos, nem paridade 1:1.

## QA
Verificação estrutural de fonte: 14 identificadores únicos, 14 handlers, âncoras únicas e precedência no registro. Teste dirigido adicionado: tests/audit/v453_m44_b16a_original_champions_pvp.test.mjs, 48 cenários previstos (azul/vermelho, snapshot, interações, Sylas, Viego). Runtime Node/V8 e regressões B16A: NOT RUN, não declarar PASS. Último baseline comprovado pela execução anterior: 1184/1184 B15. Novos kits certificados: zero.

Faltam executar node --check, suite B16A e as 30 suites B01–B15, além de validar todos os casos de borda, fontes oficiais, browser, fog, 2 clientes PvP e gates de integração. Não tocar main, integration, browser, versão, itens, Actions, Codespaces. Próxima etapa B16B e correções após QA.
