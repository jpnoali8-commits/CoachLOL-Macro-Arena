# CoachLOL Macro Arena — Plano Mestre de Engenharia e Paridade Funcional

**Documento canônico de continuidade para Codex (2026-10-26)**  
**Versão do jogo de origem: V4.5.2**  
**Referência de regras: League of Legends PC, Summoner's Rift padrão, patch 26.21, com hotfixes datados**  
**Status: plano de execução, não declaração de implementação ou de licença de IP.**

> **REGRA DE CONTINUIDADE:** o único código-fonte autorizado para iniciar a próxima alteração é o ZIP `CoachLOL_MacroArena_v452_Buffs_Draft_Ghost_FarmAuditoria_Offline.zip`. Esta documentação não substitui o código. Não reconstruir o motor a partir da V3.7, V4.4, V4.5.0 ou projetos paralelos. Preservar commits, testes, snapshots e dados históricos.

## 1. Decisão executiva e definição de sucesso

Construir uma experiência tática web de **ordens simultâneas**, completa e auditável, com uma gramática de ações capaz de representar decisões complexas de macro, micro, combos, controle de wave, itens, objetivos, draft e interação entre campeões. O motor deve ser determinístico, a execução de combate decidida pelo servidor e a revelação de informações filtrada por visão/equipe. A fidelidade deve ser especificada em uma **matriz de mecânicas por patch**, não em uma afirmação genérica de "100%".

**Ordem recomendada:** (1) estabilizar e medir o legado; (2) formalizar contratos e dados por patch; (3) migrar o núcleo autoritativo progressivamente para Rust; (4) implementar conta, perfil, lobby e rede; (5) continuar certificação por lotes de campeões, itens e runas; (6) otimizar UI/VFX 2D; (7) renderização 3D/GLB autoral; (8) certificação de paridade, performance e segurança antes de publicação.

**Tecnologia-alvo:** backend Rust nativo + Tokio/Axum + PostgreSQL, WebSocket TLS para eventos; Rust/WASM no cliente **somente para algoritmos públicos e reuso de código não sigiloso**; interface web existente migrada incrementalmente (TypeScript como alvo possível), sem obrigatoriedade de Godot. Redis e barramento de eventos são opcionais quando as medições justificarem. Blender/Tripo são ferramentas de produção de assets, não dependências do motor.

**Risco jurídico bloqueante para o lançamento:** as políticas da Riot proíbem recriações ou jogos com sua propriedade intelectual e produtos excessivamente similares. Paridade mecânica usada em estudos/QA não concede licença para distribuir uma cópia 1:1 de campeões, arte, nomes ou gameplay. Antes de beta público, obter autorização aplicável **ou** transformar CoachLOL em IP original com mecânicas e identidade próprias; uma revisão jurídica é gate de publicação. Referências: https://developer.riotgames.com/docs/lol e https://support-developer.riotgames.com/hc/en-us/articles/22698591841939-General-Policies.

## 2. Inventário real da V4.5.2: não confundir cadastro com funcionalidade

| Área | Estado auditado na base | Dívida crítica |
|---|---|---|
| Campeões | 14 nomes registrados; 5 manifestos individuais | 0 kits certificados completos; Nami, Lux e Vex parciais; Jinx e Ahri com dados, sem kits completos |
| Atributos de campeões | 5 conjuntos individuais com base e crescimento | Demais kits, fórmulas, recursos e progressões não auditados |
| Itens | 41 entradas; 9 com estatísticas básicas auditadas, 32 provisórias | 0 itens plenamente certificados com passivas, únicos, ativos, receitas e interações |
| Runas | 3 páginas experimentais | 0 runas certificadas; árvores, shards, sinergias, regras de combate pendentes |
| Feitiços | Flash, Curar, Incendiar, Barreira, Exaustão, Fantasma, Smite etc. parciais | Certificação individual de CD, alcance, duração, cancela/interrompe, modos e buffs |
| Loja | compra/venda, filtros por papel, slots, componentes e alguns efeitos | catálogo integral, pesquisa, builds salvas, únicos, ativos, on-hit, compatibilidades e UI de inventário |
| Jungle/objetivos | Vastilarvas individuais, Arauto e Olho, Dragões, Barão e Ancião com estados parciais | buffs por tipo de minion, soul, queimadura, Elder, montaria/colisões, recompensas e IA oficiais |
| Macro | Waves, inibidores, superminions, 2 torres Nexus e push | calibração last hit, aggro/objetivo, economia e tempo completo de partida |
| Farm (P0) | CS concedido somente por último golpe real; telemetria adicionada | FAIL histórico: TOP ~23 CS/5min em vez de 35–62 em lane livre; meta de projeto ~50 |
| Combate/efeitos | executor parcial, journals/snapshots, CC/escudos e geometrias comuns | todos os caminhos atômicos, projéteis em trânsito, colisões, passivas e replay causal integral |
| Seleção e UI | Shift+clique/arrasto, HUD, overlays, combos e direção de habilidades | QA de estado/UI em navegador real, acessibilidade, desempenho, indicadores e fog estrito |
| Multiplayer | não existe servidor PvP autoritativo | persistência por conta, matchmaking, WebSocket, sync e anti-cheat não implementados |
| Visuais | 2D/VFX parciais; arquitetura cinematográfica isolada | player GLB completo, câmera, animação e áudio sincronizados ainda não concluídos |

**Evidência local:** `docs/AUDITORIA_V452_ENGENHARIA.md`, `docs/QA_SUMMARY_V452.md`, `data/content_coverage_v451.json`, `data/v452_effect_manifest.json` e `package.json`, dentro do ZIP canônico. A V4.5.2 contém 447 entradas de arquivo. Não alterar indicadores de sucesso sem justificativa e medição.

## 3. Três eixos paralelos, com portas de integração

**Eixo A — Motor e conteúdo:** corrigir farme e bugs de combate, catálogo por patch, efeitos, itens, runas e kits por lotes.  
**Eixo B — Plataforma web:** Rust nativo, banco, autenticação, progressão, filas, partidas, estado por equipe e observabilidade.  
**Eixo C — Experiência e conteúdo visual:** UI/HUD, loja de itens e loja cosmética separadas, indicadores, replay, VFX, GLB. O eixo C **não pode** comandar dano, fog ou cooldown.

É permitido desenvolver os eixos em paralelo em branches com contratos imutáveis. **Não bloquear a migração do backend até que todos os kits estejam prontos, nem declarar paridade de um kit sem seus testes completos.**

## 4. Marcos canônicos e gates de aceite

| Marco | Entrega mínima verificável | Gate para avançar |
|---|---|---|
| **M0 — V4.5.2 freeze** | Hash da base, extração limpa, lockfile, inventário, CI de testes atuais e lista de falhas esperadas | snapshots reproduzíveis; V38 farm permanece FAIL registrado; no regressions ocultas |
| **M1 — V4.5.2b FARM P0** | Previsão de dano de minions, range, latência/cadência, pathfinding, last-hit e push de 4 modos | 35–62 CS em 5min livre em TOP/MID/ADC, seed fixo; zero CS sem golpe letal; perdas reais por rotação |
| **M2 — V4.5.2a objetivos** | Barão por portador com empowerment por tipo de minion, dragões e almas por elemento, Ancião, Arauto e Void | morte remove buff temporário; fog segura; efeitos testados por tipo; rollback/snapshot estável |
| **M3 — V4.5.3 Catálogo** | schema versionado para todos os itens/runas/feitiços por patch, duas lojas distintas, builds editáveis | nenhum item com stats duplicados; compra/venda/componente/regra única; catálogo com `maturity` e fontes |
| **M4 — V4.5.4+ Kits em lotes** | atributos base/crescimento e passiva/QWER/ranks/recasts/transformações por campeão; geometria/VFX descritores | só marcar `certified` com todos os contratos; testes de pares de campeões e itens |
| **M5 — V4.5.5 Núcleo Rust** | crate determinística, protocolo tipado, snapshots versionados e migração incremental JS→Rust | JS e Rust dão mesmo estado/checksum para fixtures congelados; browser/WASM sem fog adversária |
| **M6 — V4.5.6 Contas/Perfil** | cadastro/login, nível de conta ≠ nível do campeão, perfil, histórico, inventário cosmético, draft persistido | fluxo HTTP seguro, LGPD, rate limiting, sessão revogável, testes de autorização |
| **M7 — V4.6.0–4.6.3 Online PvP** | lobbies, filas, draft, match worker, WebSocket, reconexão, privacidade por equipe | ataque/CC/fog/combos resolvidos pelo servidor; tolerância a desconexão; integração e2e 5v5 |
| **M8 — V4.6.4–4.6.6 Escala** | benchmark 2k conexões simultâneas como meta de teste, múltiplas salas, deploy Ubuntu | medir p95, CPU, RAM, payload e backpressure; sem prometer capacidade sem teste |
| **M9 — V4.7 UI/VFX 2D** | mira, projéteis, áreas, dano/escudo, alertas, animação sincronizada | mídia só representa eventos autorizados; não vaza fog nem altera resultados |
| **M10 — V4.8 GLB/áudio** | assets originais low-poly, animação, texturas compactas, fallback 2D | primeiro frame/tempo de load sob orçamento estabelecido por testes de dispositivo |
| **M11 — V4.9 Ações/prompts** | gramática AST versionada, editor visual e comandos complexos validados | sem acesso a dados ocultos, sem execução de código arbitrário, limites e replay determinístico |
| **M12 — V5.x Certificação** | matriz completa por patch, campeões, itens, spells, runas, mapa e filas; beta com autorização/IP original | cobertura 100% das entradas *dentro do escopo licenciado*, zero falhas críticas, carga e segurança aprovadas |

**Ordem operacional imediata:** M0 → M1 como correção obrigatória; iniciar design de M5 durante M1/M2; executar M3/M4 como trilhos contínuos; priorizar M6/M7/M8 **antes do 3D**. M12 é um programa permanente de atualização por patch, não um único pacote.

## 5. Contratos mínimos do motor tático (normativos)

### 5.1 Tempo, rodadas e velocidade

Uma rodada representa uma janela fixa de segundos **simulados**. Ao usar 2×, reduzir apenas o tempo **real** de planejamento/reprodução e avançar o relógio simulado de acordo com o contrato temporal escolhido. Não dobrar dano, ouro nem progresso de cooldown por quadro. O servidor mantém `game_tick`, `simulation_time`, `phase`, `deadline_at`, `speed_factor` e `ruleset_version`, todos auditáveis. Estados de DoT/HoT/escudos, cast time, windup, timer de minions, torres, junglers, buffs e execução usam relógio simulado.

### 5.2 Ordem de resolução determinística

1. Receber ordens com `match_id`, `phase_id`, `client_seq`, `champion_id`, `ruleset_version` e assinatura de sessão.
2. Validar posse, turno, energia/mana, charges, cooldown, alcance-alvo preliminar, dados conhecidos pela equipe e ações permissíveis.
3. Selar ordens simultâneas no limite da fase; substituições anteriores à deadline seguem política explícita.
4. Construir intenções autoritativas sem revelar os comandos adversários; pathfinding só com conhecimento autorizado.
5. Resolver subpassos ordenados: movimento, cast/windup, projétil, colisões, defensivas, CC, dano, cura, morte, recompensas, estruturas e objetivos (a ordem exata será ADR testado, nunca implícito).
6. Emitir *eventos do motor* tipados, versões de esquema e checksum estável. Um efeito só paga mana e inicia recarga uma vez após commit válido.
7. Filtrar os eventos **antes da serialização para cada equipe**, considerando o que ela podia observar naquele instante. Cliente não recebe estado oculto, mesmo embaralhado.
8. Persistir checkpoints incrementais e journal de eventos/sources com retenção definida. Replays completos por comandos devem ser certificados, não presumidos porque existem snapshots.

Movimento para range: uma habilidade alvo precisa aproximar até alcance válido, aguardar line of sight/targeting, aplicar custo no cast, interromper se perder elegibilidade. Alvo na fog: movimentar para última posição conhecida/comando por coordenada, nunca rastrear posição real não vista. Agressão não requer consentimento e múltiplos atacantes acumulam dano. Feitiços e ativos participam do mesmo pipeline e os buffs/debuffs não são reinicializados por rodada.

### 5.3 Simultaneidade e prioridade

Definir prioridade determinística para Flash, estase, spellshield, projectile block (Yasuo/Braum/Mel), dash, shield, dano verdadeiro, DoT, morte, revive, última hit, Smite, objetivos contestados, recasts e respostas. Testar situações de 2–10 participantes, duas skills no mesmo tick, alvo morto antes do impacto, escudos múltiplos, alvo passando em brush/fog, cleanse com CC imune e recasts quando o alvo é invalidado.

### 5.4 Estatísticas, escala e itens

Uma única fórmula de atributos `base@patch + growth(level) + items + runes + buffs + temporary_effects`, com base *não linear* quando aplicável. Nomear modificadores por categoria: AD base/bonus, AP, HP, mana/energia, regen, armadura, MR, penetrações flat/percent, letalidade, AS, cap de AS, crítico, dano crítico, AH/CDR derivado, move speed softcaps, redução de CC, lifesteal, omnivamp, heal/shield power, true damage, on-hit/on-attack, dano a estruturas/monstros, percentuais de vida atual/máxima/faltante, recursos especiais e crescimento por rank. Tratar regras de stacking e prioridade para únicos/auras/ativos com identificadores estáveis. Não calcular propriedades permanentes como bônus irreversível no momento da compra.

## 6. Programa de paridade de campeões, itens, runas e feitiços

Cada registro possui `id`, `patch`, `mode`, `source`, `source_checked_at`, `license_status`, `maturity` (`missing`, `training`, `data_only`, `partial`, `behavior_tested`, `certified`), `owner`, testes, diff da última atualização e política de regressão.

### 6.1 Campeões — checklists obrigatórios individuais

- identidade técnica interna, papel, tipo de ataque e alcance; HP, recursos, MR/armadura, regen, AD, AS, movimento e crescimento nível 1–18, curvas, caps e exceções;
- passiva com gatilhos/cargas/duração/dano/curas/transformações e interações com objetos e aliados;
- Q/W/E/R por rank com alcance, targeting (self/ally/enemy/ground/direction/charge), AOE, travel time, bloqueio, collisions, dano, scaling, cura, shields, CC, cooldown, custo, recast e exceções;
- habilidades que alteram forma, kit, postura, temporização, múltiplos corpos, invocações, pet AI, clones e passivas que se atualizam com nível;
- cancela/interrompe, cast time, buffering, animação como saída, imunidades, ataques básicos e combos multi-aliados;
- VFX descritivos com privacidade, efeitos on-hit, procs de item/runa, assistências, ouro/XP, controle de wave e jungle;
- fixtures contra 1 campeão, múltiplos campeões e sentinelas, minions/monstros/torres. Casos Lux Q/E/R, Nami W/Q/R, Vex R→R2 são sementes iniciais, não kits certificados.

**Como reutilizar sem padronizar indevidamente:** componentes `Targeting`, `CastGate`, `Projectile`, `AoE`, `Bounce`, `Dash`, `Recast`, `Aura`, `Summon`, `CC`, `Damage`, `Heal`, `Shield`, `OnHit`, `Transform`, `Execution`; cada campeão instancia parâmetros, prioridades e state machine exclusivos. Não compartilhar estado privado de uma habilidade com outra por engano.

### 6.2 Loja em partida e builds

Categorias de tanque/lutador/mago/atirador/suporte/assassino/jungler; árvore de componentes com custo correto, estoque e limitações de compra por tempo/fonte, slots, consumíveis, wards/trinkets, trinket inicial, Oracle Lens, Farsight, compras sugeridas, busca, ordenação, favoritos, metas de build, builds personalizadas, venda/desfazer (se regra permitir), ativos utilizáveis no mapa/combo, passivas únicas, stacks, mythic/historic conforme *patch* e modalidade, modificações temporárias/transformações. Todos os ícones devem ter fallback local e atribuição de origem; não reutilizar indevidamente material protegido numa versão pública.

Separar rigidamente **loja tática de itens da partida** da **loja cosmética/conta**. Esta última não deve mudar atributos em partidas competitivas.

### 6.3 Runas, summoner spells e draft

Árvores completas por patch: keystones, runas menores, slots/shards, gatilhos, stacks, cap, cooldown, condições de ativação, interações com passivas e itens, páginas por campeão e perfil. Feitiços selecionados no Champ Select, bloqueados no início da partida (exceto exceções oficiais explicitamente auditadas), tipos Flash/Fantasma/Incendiar/Barreira/Curar/Exaustão/Golpear/Teleportar/Purificar etc.; cooldown em tempo simulado, alcance, duração, upgrade, alvo próprio/terceiro e mapa.

### 6.4 Mapa, macro e regras sociais

Fog/brush/wards/traps/Oracle/sweeper; lane control, freeze/slow/fast push, minion aggro, turret aggro/dive, bounties, resets, XP ao alcance, jungle route/leash/camps, dragões/Soul/Ancião, Baron, Void Grubs/Herald, invasão, objetivos simultâneos, dupla/tripla ação por campeão, group action, comeback, encerramento, rendição/remake, desconexão, AI para substituição e vitórias legais.

## 7. Web, contas, perfil e sistemas de partida

**Dois níveis independentes:** `account_level` e `account_xp` são persistidos no perfil; `champion_level` (1–18 ou regras do modo) e XP de combate pertencem ao estado **temporário de cada partida**. Nunca persistir nível de campeão no perfil como substituto de XP de conta.

Módulos web obrigatórios: tela inicial, registro e login, verificação/recuperação de conta, configuração de segurança e sessões, perfil (avatar, título, level, vitórias, histórico, estatísticas e conquistas), amigos/convites/bloqueios, salas customizadas, casual/ranked/treino, escolha de região, filtros 1×/2×, distribuição de times, fila e status, draft com bans/picks e seleção de feitiços, preparação de runas/build, tela de carregamento, reconexão, histórico/replay, pós-partida, denúncia/moderação e acessibilidade/responsividade. Social/chat são módulos separados e com controles de abuso.

**Persistência:** PostgreSQL mantém `users`, `auth_identities`, `sessions`, `profiles`, `account_xp_ledger`, `user_settings`, `rune_pages`, `saved_builds`, `inventory_cosmetics`, `queue_tickets`, `lobbies`, `matches`, `match_participants`, `match_results`, `match_events_metadata`, `reports`, `audit_log`. Estado vivo da partida fica na memória do match actor + checkpoint persistido e/ou log especializado; nunca uma consulta SQL por frame/tick.

**Segurança:** Argon2id/salt ou passkeys, MFA quando disponível, sessão em cookie HttpOnly+Secure+SameSite, CSRF e validação Origin no upgrade WS, rotação/revogação, rate limiting, proteção de criação de contas, consentimento e política de privacidade LGPD, retenção mínima, backup com restauração ensaiada, permissões de moderação, logs sem segredos, anti-bot e autenticação por servidor. Não guardar tokens no localStorage como substituto de segurança do backend.

## 8. Rust, WASM e migração sem reescrever tudo

### 8.1 Layout alvo de monorepo

```text
coachlol/
  AGENTS.md
  .agents/skills/coachlol-producao/SKILL.md
  crates/
    arena_core/          # regras puras sem rede, DOM ou I/O
    arena_protocol/      # tipos de comandos/eventos, versões e validação
    arena_data/          # manifestos por patch, schema e loaders
    match_server/        # atores de salas, timers, isolamento por partida
    web_api/             # login, perfil, matchmaking, loja cosmética
    wasm_public/         # preview local public-only, hitbox e UI helper
  web/                   # app, UI, mapa e futuro renderer opcional
  migrations/            # SQL PostgreSQL versionado
  data/patches/          # bundles imutáveis auditados
  tests/golden/          # fixtures e resultados JS congelados
  docs/                  # ADRs, arquitetura e cobertura
  deploy/                # Docker Compose, Caddy, healthchecks
```

### 8.2 Sequência técnica de migração

**Não começar com um rewrite.** Primeiro executar e congelar casos do engine `engine.mjs` no Node e navegador, documentando inclusive os bugs. Criar tipos/serde no Rust e testes golden JSON. Migrar em ordem pequena: relógio/PRNG/ids → stats/effects → alcance/target/path → commits → ataques/dano → waves/objetivos → combate simultâneo. Enquanto a migração durar, uma rota é autoritativa por vez; permitir modo dual-run somente para comparar, nunca resolver ações duas vezes. Virar feature flag por fase/módulo e medir divergências por checkpoint, com rollback por release. Rust compila nativo no Linux; WASM compila apenas artefatos públicos para o navegador, sem estados privados.

**Determinismo:** IDs ordenados, timestamps simulados inteiros, aritmética fixed-point onde necessária, PRNG seeded de versão fixa, serialização canônica e checksums robustos para diagnóstico; proibir dependência de relógio do sistema, ordem de HashMap não determinística, FPU dependente ou aleatoriedade implícita. `checksumV40` FNV atual é não criptográfico e não serve para provar integridade/autenticidade de pacote de rede.

### 8.3 Desempenho

Rust/WASM pode reduzir overhead de cálculos do núcleo, mas **não garante** que o browser ficará mais leve. WASM faz sentido para simulação local pública e cálculos pesados; DOM, layout, canvas, imagens, VFX e transferência JS↔WASM continuam custosos. Medir perfis antes de migrar, minimizar cópias de memória e manter renderização incremental. Godot é opcional no futuro; Godot Web usa WASM/WebGL2 e tem trade-offs de bundle/threads, portanto não é pré-requisito.

## 9. Arquitetura PvP para milhares de jogadores sem polling constante

**Modelo:** conexão WebSocket `wss://` persistente com eventos **push** e envio de ordens; HTTP apenas em auth, perfil, busca e recursos pontuais. Manter ping/pong ou heartbeat moderado para detecção de conexão (não é polling constante do estado). O servidor envia somente alterações observáveis e transições de fase; evita loops que consultam SQL/Redis a cada frame.

```text
Browser web ── HTTPS ──> Caddy/Nginx ──> Rust API ──> PostgreSQL
      │                         │
      └──── WSS/commands ───────┴────> Match Gateway ──> Arena Actor #matchId
                                             │                 │
                                             │             RNG + relógio
                                             │             ordens privadas
                                             │             substeps + efeitos
                                             │             fog por equipe
                                             │                 │
                                      eventos/deltas     checkpoints/event journal
                                             │                 │
                                    WS por jogador      armazenamento durável
```

Uma partida executa em uma tarefa/ator isolado com fila limitada e *single writer*. Dentro da partida, comandos recebidos são validados por posse/sequence/phase, nunca pelo estado alegado no cliente. Congelar a fase por deadline; processar eventos agendados sem busy-loop; usar backpressure, detecção de clientes lentos e envelopes binários compactos quando houver medição. Observadores/replays só recebem perspectiva permitida e atraso aplicado. WebSocket **não evita** por si só sobrecarga: autenticação, buffers, sincronização incremental e limite por IP/usuário são obrigatórios.

**Escalonamento:** cada partida tem `match_id`, versão de regras, seed, worker proprietário e lease. A primeira VPS Ubuntu pode rodar API, servidor de partidas e PostgreSQL isolados em contêineres ou serviços com backups. Quando a carga exigir, separar API de workers, usar Redis para presença/cache de fila e NATS/Redis Streams para coordenação entre nós (ambos opcionais inicialmente); sticky routing/registry por `match_id`, healthcheck, deploy rolling, reconexão e manutenção entre partidas. Redis Pub/Sub isolado não deve ser a única fonte confiável de resultados.

**Meta de capacidade, NÃO promessa:** ensaiar 2.000 conexões ativas (por exemplo 200 salas 5v5 se todos estiverem jogando), depois 5.000 e 10.000. Medir CPU/memória por sala, p50/p95/p99 de processar rodada, event-loop lag, tx/rx bytes por cliente, filas de comandos, snapshot e reconnect. Dimensionamento da VPS só após medir hardware/CPU/RAM/rede reais. Não chamar carga "suportada" sem teste sustentado por pelo menos 30 minutos com cenário adversarial de todos usando combos ao mesmo tempo.

**Critérios iniciais de SLO propostos (a validar):** disponibilidade 99,5% em alfa; p95 de aceite de comando <150 ms na região do servidor sob carga-alvo; 100% dos comandos autorizados recebem ack/erro idempotente; zero eventos inimigos ocultos em payloads inspecionados; snapshot/reconexão sem perda de ações confirmadas; observabilidade de erro, CPU, memória e por partida.

## 10. Experiência visual e 3D — apenas depois dos gates web

Manter primeiro mapa 2D/2.5D leve com ícones reais/fallback, HUD responsiva, seleção de múltiplos, caminhos/mira no mundo, previews de colisão, efeitos de status e texto legível. Depois adicionar uma camada de apresentação baseada em `WorldEvent`, com pipeline que sincroniza VFX, animação, câmera, som e legenda sem alterar dano, fog ou cooldown. Replays podem pular mídia e continuar determinísticos.

**Assets originais:** Blender para retopologia/rig/LOD/UV; Tripo como gerador/protótipo sujeito a licença e QA manual; exportação glTF/GLB compacta, instancing, texturas KTX2/BasisU, malhas meshopt/Draco conforme suporte do renderer. Para câmera isométrica/web: testar atlas/texturas 512×512 ou 1024×1024 como defaults, 256 em props/UI quando possível e **2048×2048 apenas em heróis/cenas de close-up demonstravelmente necessários**. A resolução de origem da textura não é sinônimo de qualidade final: avaliar área real na tela, mipmaps, compressão, GPU VRAM, draw calls, bandwidth, LOD e first meaningful paint. Não incluir assets 2K não otimizados em todos os personagens por padrão.

Godot deve ser escolhido apenas após um protótipo comparativo com a camada web atual (bundle, inicialização, FPS e compatibilidade móvel), não porque Rust+WASM obrigue seu uso.

## 11. Sistema de ações, múltiplas escolhas e prompts

O banco não é uma coleção de frases soltas. É um **AST tipado e versionado** gerado por UI ou por parser de linguagem natural: `Move`, `Attack`, `Chase`, `UseAbility`, `UseSummonerSpell`, `UseItem`, `Ward`, `Shop`, `Farm`, `Freeze`, `Push`, `ContestObjective`, `SyncGroup`, `WaitUntil`, `IfVisible`, `IfInRange`, `IfHPBelow`, `React`, `Recast`, `Retreat`. Composição suportada: `Sequence`, `Parallel`, `Conditional`, `Fallback`, `RepeatBounded`, `UntilTime`, `OnEvent`.

Cada nó contém time/champion, patch, custo previsto, range/path, targeting mode, falhas esperadas, prioridade, *deadline* e regras de privacidade. Um "prompt" é somente proposta de AST; antes de entrar na fila autoritativa passa por parser de gramática, schema, normalização, validação por fase e simulação de custo. Não executar JavaScript/Lua/Rust gerado pelo usuário no servidor. Não permitir laços sem limite, consulta direta ao banco privado nem decisões sobre inimigos ocultos.

Exemplo de comportamento: `Se inimigo visível estiver no raio de Lux Q, lançar Q; caso contrário avançar até bush seguro; após Q atingir, usar E, e detonar quando válido; se Nami W estiver disponível, aproximar até range e curar a Lux; Flash só se permissão do jogador`. A execução pode falhar/replanejar se houver CC, perda de visão, mana insuficiente ou alvo morto.

## 12. Segurança, testes e entregas continuadas

**QA de cada PR:** (a) não reduzir testes, (b) teste da falha reproduzida antes da correção, (c) golden-state JS→Rust, (d) determinismo Node/nativo/WASM, (e) simulação de 300s+ e partidas inteiras, (f) fog e informação por time, (g) renda/CS/dano somente eventos verdadeiros, (h) perda de conexão, replay e snapshot, (i) validação UI e acessibilidade, (j) licenças/fontes por patch.

**Testes de propriedades:** HP não negativo, ouro não duplica, recurso gasto uma vez, ordens fora de fase rejeitadas, CC interrompe casts elegíveis, spellshield absorve o pacote correto, buffs temporários expiram/morte, buffs permanentes persistem, campeões não se movem/atacam fora de alcance, minions não atravessam estruturas, derrota/vitória legais e loja sem inventário impossível.

**Segurança/privacidade:** testes de payload adversário (fog, últimas posições, ordens/combos ocultos), impersonação de `player_id`, replay/duplicação de comandos, race de draft, sybil em filas, alterações de velocidade por cliente, autenticação WS e CSRF, inscrições em sala alheia, ausência de dados pessoais em telemetria. Testes de carga com ferramentas próprias, métricas e limites declarados.

**Fonte de dados:** notas oficiais por patch e Data Dragon são insumos de catálogo, não oráculos perfeitos para toda mecânica. Data Dragon pode ficar defasado e não descreve todos os scripts/comportamentos; confirmar cada habilidade com fontes adicionais e testes manuais. Fonte primária patch 26.21 publicada em 20/10/2026: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/ . DDragon: https://developer.riotgames.com/docs/lol . Fixar o patch em cada partida para prevenir mudança de regras no meio de uma sessão.

**Critério de publicação:** login e perfis seguros, matchmaking/reatribuição de salas, servidor autoritativo, replay, comportamento offline/lento, suporte a dezenas de partidas simultâneas medido, conteúdo publicável legalmente, testes de regressão e gestão de incidentes/backup. "100% funcional" = 100% das *features comprometidas e verificadas num release*, não equivalência assumida à totalidade de um jogo em evolução contínua.

## 13. Primeira sprint Codex — entrega curta, verificável

1. Criar branch `milestone/v452b-farm-foundation`, congelar hash e fazer relatório inicial de `npm test`, `npm run test:v452` e falha conhecida `npm run test:v38`.
2. Adicionar cenários com 3 seeds e telemetria por minion: horário/rota, atacantes, dano futuro, alcance, AA ready, caminho, causa da perda; salvar CSV/JSON sem dados pessoais.
3. Implementar apenas IA determinística de last-hit (predição curto horizonte, movimentação para range e timing), sem alterar dano/HP/XP artificialmente, mantendo freeze/slow/fast push.
4. Obter 35–62 CS/5min em 3 lanes nos seeds definidos e manter testes anti-CS inventado, perda por rotação, ausência de alvo, ataques a múltiplos e fog. Se meta não passar, relatório de causas com dados, **não afrouxar os contratos**.
5. Paralelamente criar `docs/ADR-001-rust-migration.md` e um crate `arena_protocol` *sem* substituir `engine.mjs`: comandos/ações/eventos/patch/schema para parity tests. Nenhum deploy público nesta sprint.
6. Entregar changelog, QA resumo, `content_coverage` atualizado, testes e novo ZIP derivado exclusivamente da V4.5.2.

## 14. Riscos e não-objetivos imediatos

**Não iniciar agora:** remodelar o mapa 3D inteiro, exportar 2K para todo mundo, implementar chatbot executando scripts, marketplace/pay-to-win, importação cega de todas as habilidades por scraping, escalar Kubernetes sem benchmark, reescrever cada arquivo JS para Rust de uma vez. **Riscos:** paridade não auditada, código duplicado, credenciais na VPS, fog no cliente, algoritmo de farm falho, regras de patch que mudam, recursos protegidos por IP, consumo de RAM na renderização, websocket com buffer ilimitado e replay não determinístico.

## 15. Fontes e revisão programada

- Documentos internos V4.5.2: `docs/ROADMAP_CANONICO_V452.md`, `docs/AUDITORIA_V452_ENGENHARIA.md`, `docs/QA_SUMMARY_V452.md` e `data/content_coverage_v451.json`.
- Patch 26.21: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/
- Developer Portal, Data Dragon e política: https://developer.riotgames.com/docs/lol ; https://support-developer.riotgames.com/hc/en-us/articles/22698591841939-General-Policies
- Rust→WASM: https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Rust_to_Wasm
- WebSocket Axum: https://docs.rs/axum/latest/axum/extract/ws/
- Sessões web seguras: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- Godot web: https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html
- glTF/KTX2: https://www.khronos.org/gltf/
- Skill/Codex AGENTS: https://developers.openai.com/blog/skills-agents-sdk

**Revisar este documento a cada release:** atualizar inventário, riscos, métricas, licenças, decisões e próximo milestone. Marcar sempre `implemented`, `tested`, `partial`, `blocked` ou `planned` com evidência; não inventar porcentagens de paridade.
