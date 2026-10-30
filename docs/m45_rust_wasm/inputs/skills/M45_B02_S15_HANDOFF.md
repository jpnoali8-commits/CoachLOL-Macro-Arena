# CoachLOL Macro Arena — M45 B02 Skills S15: clones, disfarces e identidade

**Data:** 2026-10-30. **Branch exclusiva:** `dev69/m45-audit-skills`. **Fonte imutável:** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278`; `engine.mjs` Git blob `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

## O que foi executado de verdade

Todas as execuções usaram **Arena original** e **gateway original dev44+dev47** obtidos por seus blobs no GitHub. Adaptamos no V8 apenas o carregamento ESM/FS, `assert`, `structuredClone` e, na auditoria strict, `process.argv`. O código das habilidades, do gateway e os corpos dos testes originais foram preservados.

| Suite | Evidência V8 | Interpretação |
|---|---|---|
| Original `tests/v453_dev69_clones_m15.test.mjs` | **20 checks passam; check nº 21 falha** | O teste do Sylas roubando Shaco R exige clone visual Sylas, mas o clone nasce como Shaco; execução original interrompida nesse ponto. Checks 22–24 e HTTP check 25 **NOT_RUN**. |
| Original `tests/audit/v453_clone_targetability_audit.test.mjs --strict` | **24/24 PASS, 0 falhas P1 ou inesperadas, exitCode=0** | Clones de Shaco/Neeko/Wukong atualmente aceitam alvos autorizados, ataques básicos, Q de Teemo/Annie e cone de Annie; aliases internos, fog mockado, expiração e owner incorreto rejeitados. Anotações históricas `expectedFailure` não representam falhas atuais. |
| Novo `s15_clone_identity_security.test.mjs` | **88/88 asserções, 8 cenários, PASS** | Caracteriza controle, Neeko, Shaco e erro específico de Sylas nos **dois lados**. PASS significa que o defeito foi reproduzido como esperado no legado, **não** que seja comportamento desejável. |
| `s15_validate_clone_receipt.mjs` | **53/53 verificações estáticas PASS** | Pinos fonte/testes, ledger S10, diferença entre falha M15, strict 24/24 e witness do bug e contrato Rust. |

### P1 confirmado — clone falso denuncia Sylas verdadeiro

1. Sylas mata a ambiguidade ao usar a **R originalmente roubada de Shaco**. Aquisição gasta **75 de mana**; execução da R gasta **0 mana adicional**; o ator continua sendo Sylas e a equipe/roster de 10 campeões não muda.
2. Ao despachar a R roubada, o executor legado coloca temporariamente `u.champ=stolen.sourceChamp` (=Shaco) em `executeBoardSkillV453Dev69`, linhas **4974–4984**; depois restaura Sylas.
3. `m15Summon` de Shaco R salva `appearance:{kind:'champion',champ:u.champ}` nas linhas **11313–11320**, durante essa janela temporária. O clone fica com **aparência Shaco** em vez da aparência do dono **Sylas**.
4. Na perspectiva adversária após desaparecer a invisibilidade inicial, **real = Sylas**, **clone = Shaco**. IDs persistentes continuam ocultos, mas o disfarce torna-se distinguível. **Reprodução azul e vermelho 2/2**.
5. Recast da R redireciona o clone de x=.525 para x=.545 sem spawn adicional nem cobrança, mas não corrige a aparência. Snapshots V40 persistem exatamente o estado defeituoso: `blue a38375d5`, `red e582a349`.

**Correção deliberada no Rust (não migrar o defeito):** separar `RealActorIdentity` (Sylas imutável e autenticado) de `ExecutorIdentity` (Shaco, temporário para lógica da R). O servidor deve criar um clone **com aparência do dono Sylas**, reutilizando a mecânica original Shaco R, caixas, dano, cooldown, follow/recast e aliases temporários; eventos públicos não podem revelar identidade estável. Registrar a alteração como `DELIBERATE_FIDELITY_FIX`, com teste adversarial em ambos seats.

### Contrato tipado para o coordenador

`s15_clone_disguise_rust_acceptance.rs`: trait `ActualRustCloneRunner`, **6 casos × 2 seats = 12 casos positivos futuros** (Neeko aliado, Sho'Ma minion, clone W, Shaco R, Sylas roubado Shaco R e atingibilidade de clone visível) e **8 negativos explícitos** (ID privado, alias expirado/em fog, unidade estrangeira, Sho'Ma falso, duplicidade de debito R, vazamento de evento). Três testes de integridade de dados Rust preparados, **0 executados**. Sem implementação fake da trait.

### Limitações/gates

A matriz original S10 permanece **22 V8_PASS, 2 V8_FAIL, 2 NOT_RUN**; o M15 listado nela permanece `NOT_RUN` pois S10 não executou imports de gateway/HTTP. S15 é recibo suplementar **separado**; não alterar retroativamente a matriz congelada. V8 usa visibilidade e posições controladas (não certifica geometria real do fog), nenhuma partida via HTTP, nem browser, Node ESM integral, Rust native ou WASM foram executados. Não marcar Neeko, Shaco, Sylas ou Wukong como kits completos.

Coordinator `dev69/rust-core-m45` em `4bf98495e32dffb67cde32542f76af11d85a66f8` ainda inclui apenas `core-state`, não `core-combat` e `core-champions`. **G8 NOT_CERTIFIED.** Nenhuma Action disparada, branch original não tocada, nenhum merge.

## S16 sugerido

Antes de ampliar lotes Rust, testar **múltiplos disfarces/aliases simultâneos, versões de visão real e colisões de clones em skills temporais** no source V8, mantendo casos de falha deliberada visíveis. Quando o coordenador abrir crates necessárias, portar a interface como **testes reais de integração no Rust**; não interpretar contratos tipados como código de gameplay migrado.
