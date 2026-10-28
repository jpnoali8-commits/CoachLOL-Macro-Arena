# ADR-001 — Migração incremental do core para Rust

**Status:** aceita como direção arquitetural; implementação `NOT_STARTED`

**Data:** 26/10/2026

**Versão de referência:** V4.5.2c

## Contexto

O jogo executa hoje a simulação offline em `engine.mjs`; `engine.browser.js` é sincronizado desse core. Já existem contratos Node/browser para dano, ações, efeitos, visão, ondas, objetivos, snapshot e economia. Uma reescrita integral agora perderia a trilha executável que sustenta os testes e criaria duas fontes de regra durante a transição. O ADR-009 descreve a arquitetura Rust/WASM desejada em nível de sistema; este ADR define como chegar lá sem substituir o motor atual.

## Decisão

1. **Manter `engine.mjs` como autoridade ativa** até um subsistema Rust completar os gates de equivalência. A V4.5.2c não adiciona crate Rust nem altera a autoridade do jogo.
2. Extrair contratos tipados e versionados antes de migrar regras: IDs, ações, eventos, estado serializado, patch e seed. O primeiro escopo Rust deve ser pequeno e escolhido após inventariar os contratos estáveis; não começar por uma cópia integral de `Arena`.
3. Para cada subsistema, congelar fixtures golden do JavaScript com snapshot inicial, seed/RNG, sequência de ações, ticks simulados, snapshot final, eventos causais e checksum. Comparar saídas Rust e JS em CI, incluindo snapshots antigos e migrações de schema.
4. Exigir igualdade exata quando a representação permitir; se fixed-point ou conversão numérica produzir diferenças, documentar tolerância por campo e provar que ela não altera decisões, mortes, CS, ouro, visão ou ordem de eventos.
5. Executar comparação dual sem efeitos colaterais enquanto a equivalência estiver em avaliação. Um match usa **uma única autoridade de escrita**; uma feature flag escolhe JS ou Rust por partida. Não dividir resolução de uma ação entre os dois motores.
6. Promover um subsistema somente após seus golden tests, testes de regressão, snapshot, ownership/fog e privacidade passarem. Divergência mantém a flag no JavaScript e preserva o recibo para diagnóstico.
7. O alvo de servidor é Rust nativo por ator de partida; WASM pode servir somente previsões e cálculos públicos. Estado adversário oculto e decisões autoritativas nunca são enviados ao cliente.

## Sequência proposta

- **Preparação:** inventariar contratos e dependências de `engine.mjs`; definir schema/IDs e representação numérica; gerar fixtures JS executáveis.
- **Primeiro corte Rust:** implementar apenas o menor contrato determinístico com entradas e saídas isoladas (estado/ações/eventos), sem navegação ampla ou kits incompletos. Aprovar a seleção exata no início da V4.5.5.
- **Expansão por contrato:** migrar clock e movimento, depois ondas/economia e demais subsistemas conforme dependências e cobertura golden. Combate, efeitos, jungle, visão e objetivos permanecem no JS até cada corte passar.
- **Autoridade de servidor:** integrar `arena_core` nativo e protocolo versionado em um ator de partida; usar JS em comparação controlada. Trocar autoridade somente em uma versão explicitamente aprovada e com rollback exercitado.
- **Cliente:** remover resolução autoritativa gradualmente; conservar renderização e apresentação de eventos. WASM não recebe estado privado do adversário.

## Alternativas consideradas

- **Reescrever tudo em Rust:** rejeitada; multiplica risco, dificulta localizar divergências e descarta o motor que atualmente passa os contratos.
- **Manter JS sem plano de migração:** rejeitada como alvo de longo prazo; não atende à autoridade nativa isolada necessária para PvP.
- **Migração incremental com fixtures e uma autoridade por partida:** escolhida; preserva execução atual e torna cada substituição reversível e verificável.

## Consequências e gates

- JS permanece duplicado durante a transição e exige paridade de fixtures até o último subsistema migrado.
- Toda alteração do core JS continua sincronizando `engine.browser.js` enquanto JS for a autoridade ativa.
- Nenhuma promoção Rust será chamada de equivalente com base em compilar ou passar testes isolados; é necessário recibo de comparação golden, snapshot, privacidade e regressões.
- Não estão implementados neste ADR: crate Rust, servidor, WASM, feature flag de partida, pipeline CI de dual-run ou protocolo de rede.

## Referências internas

- `docs/ADR_ARQUITETURA_RUST_WASM.md` (ADR-009: arquitetura alvo)
- `docs/ROADMAP_MESTRE_V452B.md` (V4.5.5 e gate de dual-run)
- `docs/CODEX_HANDOFF/PLANO_MESTRE_COACHLOL_V452.md`
- `AGENTS.md` (core determinístico, golden fixtures, autoridade e fog)
