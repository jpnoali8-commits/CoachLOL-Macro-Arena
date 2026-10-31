# M45 B02B-I07 — controle de casts em voo e gaps

Base: 056191eff45aa48167a79a36ffe3929b6e56eb48
Fonte skills: f0b1147ac46e585a1d5374a178b1ea462f5dc278
PR #19 Draft, sem merge. Implementacao Rust privada nao autoritativa.

Rust: pending de turno separado de in_flight por cast ID, retire protegido por seat/actor/slot, sem bloquear nova admissao na rodada seguinte. Cooldown/range/mana/efeito nao migrados. 9 testes unitarios definidos, Rust native/WASM/fmt/clippy NOT_RUN.

Matriz: 14 campeoes M44 fora da propriedade antiga kits (outros campos podem cobrir partes), 6 Ahri E gateway negadas, 2 Nami W targeted aceitas em V8 anterior; nao e uma correcao da interface.

Auditoria de invariantes JS estatica nesta etapa: PASS; suites Node originais 0/26, HTTP/SSE NOT_RUN. Nao ocorreu QA Rust real. G0/G1 PARTIAL; G3/G6/G8 NOT_RUN.

Nao chamar Actions antes do gate final. Rollback: revert desta revisao. Proxima prioridade: reconciliar registry tipado com UI/servidor Rust e executar oraculos locais quando viavel.