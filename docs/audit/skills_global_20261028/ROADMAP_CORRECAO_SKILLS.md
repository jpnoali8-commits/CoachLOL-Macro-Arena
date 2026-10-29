# Roadmap de correcao por macro-pacotes — b7676d57160ddbc2315e258d03f3c94dd5a81189

**Nao mesclar PR #9**, nao atualizar browser na branch de Skills; integrador e o unico autorizado apos ordem do usuario. Todo lote so conta campeoes com P+QWER verificaveis, sem status parciais ou artefatos reference-only no numerador.

## Gate estrutural G0 — antes de expandir
1. Catalogar contrato de cast/targeting para todas as habilidades (unidade, direcao, ponto, self, shape, terreno, fog).
2. Remover `training` do PvP competitivo para qualquer slot sem jogabilidade real (ou marcar como nao disponivel), mantendo modos de desenvolvimento separadamente.
3. Centralizar ledgers de hit, cooldown/recast, stacks, armadilha, pet, clone, disfarce e fim de turno com owners, visao e serializacao unicos.
4. Criar executor de auditoria headless via Node a partir de `engine.mjs` + templates de cenarios que gerem CSV de assercoes reais, nao apenas catalogo.
5. Validar cobranca unica e idempotencia no gateway para azul/vermelho; revisar dois jogadores controlando cinco campeoes cada.

## M17 — Invisibilidade, identidade e armadilhas (ate 25–40 campeoes relacionados)
Unificar sete familias: stealth/camouflage, reveal/true sight, decoy/clone, entity/pet, placement+stock, trigger e persistence. Comecar pelos exemplos M15/M16: Twitch, Teemo, Shaco, Evelynn, Rengar, Khazix, Akshan, Pyke, Viego, Akali, Senna, Talon, Kaisa, Maokai, Zoe, MonkeyKing, Nidalee, Jhin, Caitlyn, Neeko, Leblanc. Adicionar excecoes após composições (nao simples dano generico). **Lote transversal de mecanicas, nao 21 kits certificados automaticamente**.

## M18 — Stacks, contadores, marcas, on-hit, resets (~25–40 campeoes)
Jhin, Caitlyn, Vayne, Twitch, Darius, Rengar, Kha'Zix, Kai'Sa, Kennen, Vel'Koz, Brand, Fiora, Ekko, Jinx, Kalista, Vex, Ezreal, Irelia, Ahri e demais campeoes por descoberta no catalogo real. Alvos sem stack nao herdam marca; cada origem e alvo com IDs corretos; expira em snapshots/replay.

## M19 — Projeteis, area, bloqueadores, CC e channels (~25–40 campeoes)
Generalizar trajeto temporal e bloqueio por minion/terreno/projectile wall, first-hit e multi-hit, reacao, canal, interrupcao, cast-gate, shield. Testar Nami/Lux/Vex/Ahri/Jinx, Yasuo/Samira/Morgana e familias M9. Modos global/local, limites do reino e fog.

## M20 — Transformacoes, pets e ultimates especiais (~25–40 campeoes)
Cobrir R roubada de Sylas (incluindo Shaco/Mord/Jhin e transformaveis), Neeko em alvo nao-campeao, Shyvana/Nidalee/Elise, Kalista R, Mordekaiser Realm, Tibbers e outros pets. Compositores de transformacao, identidade, efeitos persistentes, AI de pet tatico (nao bots inimigos).

## Gate de certificacao por campeao
1. Estats e progressao Lv1–18 + P e QWER/ranks/custos/cd; variantes/recasts.
2. Consequencias reais no tabuleiro, alvo/visao/range/terreno/CC, reacoes e onhit.
3. Caminho completo UI -> gateway -> executor -> estado e efeitos -> perspectiva privada.
4. Azul/vermelho, PvP 5x5 por 2 pessoas, reconexao/checkpoint/replay/receipts, morte e cancelamento.
5. Testes representativos por familia + excecoes individuais e negativos, CI/passos deterministas.
6. Browser QA so no integrador apos merge autorizado; `npm test` + visual duas sessoes + assets antes de `CERTIFIED`.

## Ordem eficiente
Aprovar primitivas compartilhadas antes da multiplicacao de kits; produzir lotes grandes de 25–40 **quando a complexidade permitir**, mas nunca chamar 'completo' o conjunto de campeoes cujo P/QWER ainda esta parcial. Fazer vários commits WIP no mesmo PR Draft; integrar somente quando usuario ordenar.
