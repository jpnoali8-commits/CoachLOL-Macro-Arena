# CoachLOL Macro Arena — M45 B02 Skills S17: histórico de eventos, identidade e reconexão

**Data:** 2026-10-30 · **Branch de auditoria:** `dev69/m45-audit-skills` · **Fonte congelada:** `dev69/skills-batch2@f0b1147ac46e585a1d5374a178b1ea462f5dc278` · **Engine Git blob:** `41679f7328a42e379fdfb8de5b92006e1bfb529f`.

## QA realmente executado

- `s17_event_reprojection_and_reconnect_pvp.test.mjs`: corpo real salvo recuperado no GitHub, executado contra **Arena original**, `checksumV40` original, `AuthoritativeActionsV453Dev44/Dev47` original, mapa e máscaras originais, em V8 isolado com shims apenas de bootstrap/imports, `assert` e `structuredClone`. **149/149 assertivas PASS**, abrangendo ambos os times, **quatro exposições indevidas de eventos históricos (2×Neeko, 2×Shaco)** e **duas realocações retroativas do alias de Neeko**. PASS significa que a falha foi caracterizada no legado, **não aprovada para Rust**.
- A suíte tem **continuação real do estado após snapshot/restauração**, diferentemente das verificações de igualdade imediata de S16. Em cada time, após salvar `snapshotV40` e `gateway.exportSession()`, um novo `Arena.fromSnapshotV40` + gateway reconstruído executam **a mesma sequência futura de expiracão, cancelamento, novo disfarce, comandos negados/aceitos e eventos**. Resultado: mesmo `checksumV40`, mesma perspectiva adversária, mesmos ACKs e `gateway.exportSession`. Passaram **2/2 continuações**. As regras de visão foram artificialmente igualadas em ambos os ambientes (`canSeePoint`); não é servidor HTTP nem fog real.
- `s17_validate_event_history.mjs`: fonte efetivamente executada em V8 com **71/71 verificações estáticas PASS**, cruzando SHA de fonte, teste, recibo S17, contratos Rust, S15, S16 e golden plan S10. Ver `S17_STATIC_CONTRACT_RECEIPT.json`.

## P1 reproduzido — eventos antigos revelam dados privados

A fonte **reinterpreta eventos históricos a partir da aparência atual**. Linha original `engine.mjs:3261–3276`:

- O vetor `events` é filtrado por audiência observadora.
- Para cada evento, `actor` é localizado no estado **atual** e sua `neekoDisguiseV453M15` ou `shacoCloneIdV453M15` determina um alias.
- Se existir alias, reescreve `unitId` e `text` no momento da leitura; **sem alias atual, devolve o evento privado bruto** (`unitId` persistente e texto original).

### Reproduções nos dois times

1. Neeko TOP usa disfarce de Shaco aliado; Shaco MID invoca clone R. Geramos eventos legítimos com `observedBy` para os dois times, enquanto ambos tinham aliases opacos públicos.
2. Inicialmente o adversário recebe `appearance_1` para o evento Neeko e `appearance_3` para Shaco, ambos com texto redigido `Ação de uma unidade visível.`.
3. Ao avançar para `gameTime=18.1`, o clone de Shaco expira. **Mesmo após tornar `canSeePoint` falso**, o histórico anterior revela `blue_MID` ou `red_MID` e o texto original `S17_SHACO_PRIVATE_OLD` ao adversário.
4. Neeko cancela disfarce: seu evento anterior agora revela `blue_TOP` ou `red_TOP` com texto original `S17_NEEKO_PRIVATE_OLD`, também sem nova visibilidade.
5. Neeko inicia novo disfarce em `gameTime=19.1`: seu *mesmo evento antigo* passa do alias histórico `appearance_1` para **`appearance_7`**, embora o ID do evento e `event_tick` não tenham mudado.
6. O gateway **corretamente nega** aliases antigos para novos comandos e aceita o novo alias. Em ambos estados original/restaurado, a sequência de ACK/revisões, perspectiva e checksum permanece determinística. Não é um bug de sessão; é **vazamento por histórico retroativo**.

**Checksum após continuação idêntica nos dois ramos:** azul `8d47314d`, vermelho `b33b4dd2`. As sequências são válidas segundo a regra autoritativa: rejeições não incrementam `lastSequence`.

### Contrato de correção Rust — INTENTIONAL PRIVACY FIX

**Identificador:** `S17_RETROACTIVE_HISTORICAL_EVENT_ID_AND_TEXT_DISCLOSURE`. **Classificação:** P1 de privacidade/protocolo, fonte bilateral reproduzida, correção ainda **não implementada**.

O **servidor autoritativo** deve determinar público, categoria, alias e corpo público de cada evento **no momento da emissão**, preservando projeções por sessão/equipe ou metadados históricos suficientes para projeção posterior idêntica. A perspectiva futura não pode reutilizar a aparência atual para reatribuir um evento antigo; o evento público antigo não pode passar a revelar o ID interno ou texto secreto após cancelamento, morte, invisibilidade, expiração, reconexão ou reload. O servidor pode omitir eventos conforme política de audiência, mas nunca retrodivulgar informação privada. Isso **não** impede revelar informações de gameplay legitimamente públicas naquele momento.

O arquivo `s17_sealed_event_history_rust_acceptance.rs` contém um **modelo de referência isolado Rust** de histórico público selado por seat com BTreeMap determinístico, API de registro histórico e consulta imutável; `ActualRustMatchEventRunner` exige um lote com os **dois históricos separados de Neeko e Shaco** e continuação pós-snapshot real. **4 testes Rust de referência preparados, nenhum compilado/executado; não integra workspace de produção.**

## Limitações e status de integração

- A visão é sintética; não há duas sessões HTTP reais, browser, websocket/SSE, ward/brush nem Rust native/WASM testados. O full Node ESM original também **NOT_RUN**.
- `dev69/rust-core-m45` observado no HEAD `b7a44676dd64b6b2f89ba2e3fca680e531136d76` continua só com `core-state`, ainda sem `core-combat`/`core-champions`; localmente não há `rustc` ou `cargo`.
- Matrizes fixas anteriores intactas: S10 **22 V8_PASS / 2 V8_FAIL / 2 NOT_RUN**, Node full 0/26; S15 clone identity defeito ainda pendente; S16 risco de colisão sob fog ainda não decidido.
- **G8 NOT_CERTIFIED; nenhuma Actions, merge, rebase, edição na engine, branches originais ou PR antigo.**

## S18 proposta

**Priorizar proteção de histórico de eventos e replay/ACL** ao surgirem as crates de protocolo/servidor Rust: aplicar o modelo da correção em pipeline real de projeção, testes com dois tokens de sessão + reconexão, evento antes/depois de disfarce/morte/clone e potencialmente prova de hash de replay. Enquanto crates não existem, auditar outros vazamentos transversais de identidades públicas (objetivos/placar/logs de combate e perspectiva por seat), sem gerar uma nova engine JS.
