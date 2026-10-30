# M15 — Auditoria operacional de clones, disfarces e entidades

Branch: `dev69/skills-batch2`. PR: [#9](https://github.com/jpnoali8-commits/CoachLOL-Macro-Arena/pull/9), Draft, destino `dev69/integration`. **Não fazer merge**.

## Arquitetura reutilizada

- `boardSummonsV453Dev69` continua a armazenar Tibbers. M15 acrescenta `m15Summon`, `m15AdvanceEntity` e entidades identificadas no servidor. Nenhuma entidade é adicionada ao roster real de dez campeões.
- Os protótipos M15 vivem em `M15_ENTITY_KITS_V453`, separados dos 30 descritores completos de formato do M9, para que nenhum kit parcial seja marcado como integral.
- O gateway autentica o jogador, valida `unitId`, controla as ações `skill.neeko_disguise` / `skill.neeko_shoma` e resolve aliases temporários de alvos visíveis; não confia em identidades enviadas arbitrariamente pelo cliente.
- Perspectivas ocultam os IDs persistentes de Neeko transformada, Shaco com clone ativo e suas entidades; falsas unidades não criam objetos reais de visão ou tropa. Eventos associados às identidades mascaradas são redigidos.
- Snapshots V4 serializam os estados de clone, cooldown e disfarce; sem nova camada paralela de simulação.
- O cliente PvP inclui controles compactos de transformação, cancelamento, coleta de Sho'Ma, movimentação de clones e renderização coerente de minions/disfarces.

## Estado por campeão (não confundir com certificação)

| Campeão | Executável / auditado no núcleo M15 | Lacunas obrigatórias | Status |
| --- | --- | --- | --- |
| Neeko | Transformação em campeão aliado; coleta básica de Sho'Ma de minions, wards, pets e monstros comuns próximos; overlay visual com IDs opacos; W cria clone não ofensivo, redireciona, expira e inicia recarga após fim | Plantas e armadilhas elegíveis, regras exatas de coleta/revelação, coerência de todos os atributos visuais, falsa animação de Recall e skills, passiva de W, Q/E/R e testes visuais integrados | **PARTIAL** |
| Shaco | R cria clone persistente independente, movimentos/ataques dirigidos, recast, durações, multiplicadores de dano, explosão idempotente, três caixas e medo | Passiva Apunhalar, Q/W/E, regras completas de buffs/itens, colisões/targetability com todas as classes de habilidade, estruturas, interações completas com Realm/fog/reactions e validação visual | **PARTIAL** |
| Sylas | R roubada de Shaco compartilha a infraestrutura e cria cópia de Sylas, sem custo adicional na execução após Hijack; redirecionamento do clone | Cobertura integral das demais famílias de ultimates e interações específicas de cada alvo | **PARTIAL** |
| Mordekaiser, Nidalee, Elise, Shyvana, Kalista | Sistemas anteriores preservados; testes M14/M14b continuam na suíte | Seguir o inventário de lacunas individuais já existente, sem certificação antecipada | **PARTIAL** |

## Verificações automatizadas

- `tests/v453_dev69_clones_m15.test.mjs`: ambos os lados, invocação e redirecionamento de Neeko/Shaco, expiração, clone não combatente de Neeko, aparência Sho'Ma, aliases do adversário, bloqueio de ID real, logs de eventos, três caixas sem duplicação, snapshots, Sylas Hijack e manifesto HTTP/UI.
- `.github/workflows/dev69-skills-qa.yml`: sintaxe de engine/PvP/cliente; execução M9–M15 e regressões de habilidades antigas.
- Fluxos independentes de Logic QA e Integrated QA são mantidos. O Integrated QA deve continuar exigindo a regeneração de `engine.browser.js` pelo **integrador**, exclusivamente, antes de aprovar release.
- Todos os números de testes aprovados são registros de QA da branch, **não** equivalem a certificação do elenco.

## Pendências para o próximo macro-pacote

1. Terminar as passivas e Q/W/E/R individuais de Neeko/Shaco, com referência de patch e todos os tipos elegíveis de Sho'Ma.
2. Concluir colisão/visão/targetability de clones em projéteis, AoE, feitiços, itens ativos, estruturas, brushes e mudanças elementais, incluindo cancelamento e ataques direcionados.
3. Validar Sylas/Realm (Mordekaiser) e interações combinadas de múltiplos clones, invocações e pets.
4. Completar os kits parciais do M14 e ampliar os lotes de 25–40 campeões **quando a complexidade permitir**, sempre com certificação por campeão somente após P/QWER, PvP, snapshots, Undo, replay e browser QA.
5. Integrar os commits exclusivamente por revisão do integrador, após reconciliar com Items/Logic e sincronizar o bundle do navegador.

**Proibido marcar Neeko, Shaco, Sylas ou os demais campeões como CERTIFIED por apenas passar nos testes do núcleo M15.**
