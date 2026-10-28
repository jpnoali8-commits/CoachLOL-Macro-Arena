# Memória de continuidade completa — CoachLOL Macro Arena

Data: 26/10/2026. Versão **funcional**: `4.5.2d-dev2`. Este arquivo é uma memória portátil para ChatGPT, Codex ou Claude Opus: prevalece sobre lembranças resumidas quando há conflito e deve ser reconciliado com o código e o Git.

## Objetivo do produto

Simulador web/offline de treinamento de macro/micro de League of Legends em turnos simultâneos com escolhas de combate, habilidades, itens, wards e estratégias; futuro modo PvP autoritativo e enorme banco de ações. O usuário quer alta fidelidade mecânica e interface flat compacta preto/dourado. Produto diferente do BTA Motion. Lançamento público/uso de IP da Riot depende das permissões e termos aplicáveis; propósito educacional não substitui essa revisão.

## Linha de produção canônica

- V37: combate e turnos offline, tempo/visão/CC; V3.7 cinematics reintroduzido **apenas por integração seletiva** — nunca rebase.
- V38–V38.2: múltiplos campeões, Shift+clique/arrastar, combos por aliado, resposta de combate, chase, trinkets, gank oculto, alcance/cooldown, foundation cinematics.
- V3.9–V4.2: atributos avançados, velocidade 1×/2×, executor/journal/checkpoints, Effects/CC, primeiros kits de Nami, Lux, Vex e atributos de Nami/Lux/Vex/Jinx/Ahri.
- V4.3: loja, componentes, venda, recalcular Rabadon, runas protótipo, filtros de itens.
- V4.4–V4.5: jungle, Smite, Vastilarvas individuais, Olho do Arauto, cerco, fog, captura de objetivos.
- V4.5.1: 3 melee+3 caster; canhão programado, torres do Nexus independentes, superminions por inibidor, respawn, estratégias de wave, seleção corrigida, dano coordenado. Crédito de CS artificial eliminado.
- V4.5.2: Baron/Elder por campeão, passivas dragões, Ghost na seleção de campeão; summoner spell 2 NÃO trocável durante a partida; filtros loja.
- V4.5.2b: janela de reação permite focar **outro inimigo visível próximo**, preserva agressor que abriu o evento; composição de waves testada; documentação para Codex/Opus.
- V4.5.2b-H1: roadmap do Tactical Prompt Engine, sem modelo IA integrado.
- **V4.5.2c:** Codex corrigiu farm e freeze, commit base `9392c0f`; CS real TOP 43/47/44, MID 35/35/35, ADC 41/46/46 em três seeds/300s. Freeze 16/22/46, TOP 1 morte, sem AA não letal. Freeze ainda parcial.
- **V4.5.2d-dev1:** buffs do Barão específicos para melee/caster/siege/super sob aura de portador vivo e Elder queimadura verdadeira em 3 ticks; 7 testes novos passaram.
- **V4.5.2d-dev2 ATUAL:** seis Dragon Souls protótipo (Infernal AoE, Hextech cadeia+slow, Oceânica HoT/mana, Montanha escudo, Nuvens movimento/ultimate, Quimtec <50% HP), cooldowns por campeão, proteção contra proc recursivo, bloqueio de recompensa duplicada e Recall do Barão 4s. 10 contratos passaram. **Não 1:1 certificado.**

## QA comprovado vs não comprovado

- V4.5.2d-dev2 `node tests/v452d2_dragon_souls.test.mjs`: 10/10 PASS.
- V4.5.2d-dev1 `npm run test:v452d`: 7/7 PASS.
- V4.5.2c farm normal com 3 sementes: PASS_BOUNDED_LOCAL (35–47 CS/lane), sem farm fabricado; freeze parcial.
- Motor Node/browser sincronizado, **58 exports**.
- `npm test` integral nesta base: **não concluído** (timeout durante regressão V4.5.1); **NÃO** comunicar PASS.
- Chromium nesta base: **NOT_RUN**; não declarar validação visual.
- O código e as afirmações devem ser testados novamente no novo ambiente antes de release.

## Conteúdo ainda incompleto

- Auditoria histórica: 14 nomes de campeões registrados, cinco manifestos individuais e **zero kits totalmente certificados** 1:1; 41 itens, nove com estatísticas básicas conferidas, três runas experimentais. Confirmar contagem com auditoria atual antes de usar como KPI.
- Passivas e habilidades por campeão (base/growth/passiva/QWER/recasts/skillshots/VFX/colisões) não estão completas.
- Itens com ativos e passivas, runas, feitiços, receitas, builds, componentes, status e limites precisam de certificação por patch.
- Dragões, objetivos, Smite e teamfights têm integrações parciais, não finalização de efeitos 1:1.
- Farm com attack speed, windup, tempo de projétil e aggro reais falta; freeze TOP/MID parcial.
- Multiplayer, contas, login, perfis, nível da conta, amigos, lobby/fila, servidor autoritativo, WebSocket, Rust e engine WASM NÃO implementados.
- Qwen no navegador, reconhecimento de prompt e AST operacional NÃO implementados. Documentados apenas.
- GLB/Blender/Tripo/3D e VFX completos são prioridades posteriores ao motor, web e backend.

## Regras funcionais a preservar

1. Turnos simultâneos, ordens privadas, combate não requer aceitação do alvo; resposta pode selecionar alvo alternativo observável.
2. Shift+clique agrega/remove; Shift+arrastar seleciona por retângulo; clique normal limpa seleção antiga. Grupo pode concentrar dano no mesmo alvo.
3. Toda skill com alcance precisa aproximar até o range ou negar cast; mana/cooldown consumidos só na execução válida; recasts sem cobrança dupla.
4. CC, shields, buffs/debuffs e imunidades no ledger em segundos simulados; efeitos secundários não criam loops, double-kills ou ouro duplicado.
5. Três melee + três caster no early game; canhão conforme agenda; push/freeze/slow-push/last-hit geram CS apenas se campeão der o último golpe.
6. Inibidores e Nexus turrets são estruturas independentes com timers; supers só nas rotas abertas.
7. Baron buff pertence a campeões vivos, perde com morte ou expira; minions recebem aura apenas perto de portadores válidos. Elder temporário + execução com verificações de imunidade; dragões elementais permanentes e Souls como progresso de equipe.
8. Draft fixa os dois feitiços; não permitir alterar na fonte após início.
9. Visão e fog são autoridade do futuro servidor, nunca só uma máscara da UI.
10. Speed 2× comprime tempo real de planejamento/visualização, não o tempo simulado de cooldown ou dano.

## Decisões de arquitetura duradouras

- Engine Rust nativa **no servidor**, com simulação determinística, snapshots e log causal; migrar JS por equivalência de testes golden, feature flags e sem reescrever tudo cegamente.
- WebAssembly cliente opcional **apenas para código e informações públicas**; nunca colocar segredo de fog/inimigos no WASM público.
- Backend Ubuntu VPS com match actors, transporte WebSocket orientado a eventos e atualizações em lote/delta; PostgreSQL para contas/histórico e configurações; sem polling SQL ou HTTP constante por tick.
- Conta e progressão da conta são separadas de nível 1–18 do campeão em cada partida. Lobby, draft, fila, 1×/2×, ranked/casual/private, amigos/perfil/loja de perfil planejados.
- Tactical Prompt Engine: parser determinístico PT-BR primeiro, AST `PlanV1`/schema, editor preview/confirm, Qwen3-0.6B local quantizado WebGPU sob demanda em Web Worker, fallback sem IA, o servidor valida todas as ações. Nada disso deve executar código gerado pelo modelo.
- Performance: perfis reais (CPU/memória/latência/payload), evitar processamento por frame sem necessidade, interesses por time, cache de assets. Nunca presumir que uma VPS suporta milhares de matches sem testes de carga e orçamento.

## Repositório e execução

Raiz no ZIP: `CoachLOL_MacroArena/`. Documentação raiz `AGENTS.md`, `README_PRODUCAO_V452D2.md`, skill `.agents/skills/coachlol-producao/SKILL.md`. Fontes `engine.mjs` e `engine.browser.js` sincronizados por `python tools/sync_browser_v43.py`; testes `tests/`. `npm run test:v452d2`, `npm run test:v452d`, `npm run test:v452c`, `npm test`. Há `.git` original e possível trabalho não commitado; inspecionar `git status` antes de alterar.

## Próxima ação

Implementar **V4.5.2d-3** em incrementos pequenos: passivos individuais dos seis tipos de dragão, atributos/barão/valor por tipo de minion, auditoria de Elder e Smite simultâneo, com tests, snapshot, fog, mortes e perfil de performance. Ver `PLANO_V452D3.md` e `GATES_DE_QA.md`.
