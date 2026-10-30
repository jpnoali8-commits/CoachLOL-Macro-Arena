# CoachLOL Macro Arena — M44 B16B | 12 novos slots autorais

Base B16A commit f79c7d8c9900350b53a282f7380228ff8ef7ba54.
Branch dev69/skills-batch2; PR #9 segue Draft, sem merge.

## Implementações novas
Azir R: avanço da falange e empurrão dos inimigos (parede visual ainda sem colisor completo).
Zed R: marca de morte, acúmulo de dano próprio e explosão temporal.
Ekko E: avanço para ponto com empoderamento do ataque básico seguinte.
Rumble R: Equalizer em cinco centros sucessivos, dano e lentidão periódicos.
Sylas E: deslocamento e impacto da corrente no alvo próximo.
Briar E: Chilling Scream na direção persistente, empurrão e stun ao bloqueio.
Fiddlesticks E: Reap em cone, silêncio no setor externo.
Skarner E: Ixtal's Impact, caminho interrompido por campeão e stun.
Nocturne W: proteção de escudo de feitiço autoritativo temporário.
Pantheon R: Grand Starfall com aterrissagem e dano após tempo de servidor.
Diana E: Lunar Rush e reinício condicionado à marca Moonlight da Q.
Bard E: Magical Journey atravessa parede; valida bloqueio antes do gasto e no commit.

## M44 B16 (A+B) total
26 slots originais em 26 campeões distintos? NÃO: os sublotes compartilham parte do elenco. São 26 slots, sem qualquer alegação de 26 kits completos. Sem fallback genérico. As ults originais do novo catálogo ficam disponíveis a Sylas, e as Q/W/E a Viego via registro B14D, sem duplicação. 14 slots B16A e 12 B16B.

## QA e release
Teste proposto B16B: tests/audit/v453_m44_b16b_original_champions_pvp.test.mjs com 38 cenários individuais em duas equipes, sprites autoritativos, relógio, snapshot, roubo/possessão. A verificação executada nesta sessão é estrutural (12 identidades únicas, 12 executores, guardas pré-debito e verificação de alteração somente dos arquivos esperados). Node/V8 B16B: NOT RUN. Testes B16A (48) também NOT RUN. Baseline histórico B15: 1184/1184, não somar 48+38 à contagem aprovada.

Aprovação final pendente: node --check em engine e duas suites; executar 30 suites anteriores + 2 novas, paridade de conteúdo, visão/fog, replay, multiplos clientes PvP, full browser e QA visual. Não alterar engine.browser.js, main, dev69/integration, itens, version.json ou workflows. Não utilizar Actions, Codespaces, worker. Novos kits completos certificados: zero.

Proxima prioridade M44 B17: ajustar efeitos autorais e lacunas de habilidades/passivas em lotes, após executar os testes e corrigir eventuais falhas.
