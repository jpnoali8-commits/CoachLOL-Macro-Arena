# CoachLOL Macro Arena — M18 · Quatro famílias de clones, passivas e armadilhas

**Status:** M18 testado com sucesso em branch isolada; **não integrado e não certificado como kit completo**.

## Estado de trabalho
- Repositório: `jpnoali8-commits/CoachLOL-Macro-Arena`.
- Base funcional original da auditoria: `dev69/skills-batch2` no SHA `b7676d57160ddbc2315e258d03f3c94dd5a81189`.
- Branch de correções combinadas P1/M17/M18: `fix/skills-entity-targetability-p1-dev69`.
- Testes novos neste marco: `tests/audit/v453_m18_all_decoys_identity_target_matrix.test.mjs`.
- Workflow ampliado (Node 22): `.github/workflows/skills-entity-targetability-p1.yml`.
- Evidência executada: [GitHub Actions 40803433187](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/actions/runs/40803433187), **PASS**.
- **Não houve mudança no motor durante M18**: a bateria certifica apenas os contratos de interação cobertos pela implementação P1/M17 anterior, não a paridade do elenco.
- PR #9 segue Draft para `dev69/integration`; nenhum merge foi efetuado; não modificar `engine.browser.js` fora do integrador.

## Matriz real M18: 74/74 aprovações

| Grupo | Casos | Cenários |
| --- | ---: | --- |
| Alvos e colisão das quatro famílias | 40 | 4 tipos × 2 equipes × 5 cenários: alias público/ID privado, Annie Q, Lux Q, Jhin R e stealth/expiração |
| Passivas e ciclo de vida | 10 | 5 contratos × 2 equipes: Neeko clone fade, Neeko apparent-lethal, MonkeyKing decoy AA, LeBlanc passive cooldown e Shaco clone explosion |
| Armadilhas com casts autoritativos reais | 24 | 4 tipos × 2 equipes × 3 habilidades: Maokai E, Teemo R e Jhin E |
| **Total** | **74/74** | Todos em Node 22, com fixtures PvP de dez campeões |

### Detalhes por campeão
- **Neeko (W e disfarce):** aparência do clone espelha uma transformação em Jinx, mas os dois corpos possuem aliases distintos; inimigo não recebe `red_MID`/`blue_MID` enquanto disfarçada. Dano no clone provoca fade após .5s sem revelar a Neeko real; golpe apparent-lethal na campeã termina o disfarce, invalida o antigo alias e não mexe no roster. Clone não recebe CC de campeão, e não é atingido por explosão de Jhin E depois que expira.
- **MonkeyKing / Wukong (W):** disfarce de invisibilidade e clone autoritativo; Q de Annie, Q de Lux e R de Jhin atingem clone. Ataque do clone contra um campeão próximo ocorre uma vez no tick. IDs internos do clone e da verdadeira pessoa não são intercambiáveis. Expiração impede dano tardio.
- **Leblanc (Mirror Image P):** disparada por vida inferior a 40%, cria clone único e protege ID real; cooldown de 60s previne criação duplicada sob novo dano. As habilidades testadas atingem o clone sem atribuir CC champion-only.
- **Shaco (R):** clone sob alias público funciona como alvo dos ataques direcionados/projéteis. Ao morrer, explode uma única vez, cria exatamente três caixas e mantém snapshot consistente.
- **Maokai E:** explosão ao ativar dano em clone presente e visível; ambos times.
- **Teemo R:** aplica DoT a clone, consome uma carga de estoque em vez de mana artificial; efeito não continua sobre clone expirado.
- **Jhin E:** agendamento só detona após tempo programado; clone que expira antes não recebe dano retroativo; clone ativo no momento da explosão é atingido. O relógio de eventos coarse-tick já tinha sido corrigido no M17.

## Risco de falso positivo e regras específicas
- Os cinco cenários por clone usam lançamentos reais das habilidades de Annie/Lux/Jhin e gateway PvP para testes de alias, sem adicionar campeões extra à partida.
- Reposicionamentos de fixture evitam sobrepor exatamente clone e dono num mesmo ponto, pois `skillshotHitsV42` desempata distâncias físicas idênticas usando ID — isso não prova a prioridade em sobreposição exata. Se a semântica oficial exigir prioridade, precisa de contrato separado.
- A Jhin E contém condições `champ-only` para slow/True Sight, e não se deve aplicar marcas de campeão indevidamente a decoys.
- Teemo e Jhin usam estoque de cargas; seu débito deve ser auditado por `m16StockV453`, não por mana.
- As suítes anteriores permanecem verdes na execução final, inclusive M17 14/14 + 14/14, P1 strict 24/24, M9 140/140, M15 25/25, M16 73/73, forms M14 14/14, Sylas M14 16/16, Batch2 44/44, Lux/PvP Dev68 40/40.

## Limitações declaradas (não certificar global)
- A matriz M18 é de **interações de clones e passivas específicas**, não P+QWER completo dos quatro campeões.
- Não executou Chromium visual de duas sessões nem o `npm test` global na branch de integração; o browser permanece antigo até o integrador reconstruí-lo.
- Não cobriu completamente `neeko_shoma` em formas pet/monster/ward, miniboxes com ataques sobre clones, ou a reprodução visual da geometria em Realm do Mordekaiser.
- Os **509 slots QWER em fallback `training`** do elenco global permanecem como dívida de Skills, não foram reduzidos neste marco.

## Próximo marco recomendado
1. Auditoria e correção de **pools legados de habilidades em zonas e projéteis de retorno** (Ahri Q return, Lux W return e Lux E, Jinx E, Vex E, Ezreal W, Irelia/realm) com contratos separados de entidade-alvo, detecção e passivas.
2. Reconciliar o patch completo da branch `fix/skills-entity-targetability-p1-dev69` no **PR #9 existente**, após revisão pelo engenheiro de Skills, evitando PR concorrente de alteração na engine.
3. Iniciar macro-pacotes orientados a dados, aproximadamente 25–40 campeões completos por lote conforme complexidade, com QA automático P+QWER/visão/collision/reaction, sem substituir mecânicas únicas por training effects.
4. O integrador executa regeneração oficial de `engine.browser.js`, QA Node global e Chromium multiassentos antes de release.
