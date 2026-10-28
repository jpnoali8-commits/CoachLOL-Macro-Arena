# Continuidade após V4.5.2d-3A — 26/10/2026

**Atual implementado:** seis passivos elementais permanentes por stack, time, ledger deduplicado e stats efetivos; 10 novos contratos + regressões completas PASS. Código canônico `engine.mjs`; `engine.browser.js` sincronizado. Jogo completo offline, farm V4.5.2c preservado.

**Próxima tarefa executável (P0): V4.5.2d-3B — Barão individual.** Primeiro documentar e fixar por patch AD/AP e velocidade de movimento por campeão, escala de nível, receptores do buff no abate; depois implementar atributos derivados como foi feito com dragões, sem mutar AD/AP brutos. Adicionar contratos para buff só aos vivos na captura, morte/respawn, duração, distância de aura, quatro classes de minions, Recall, ataque a torres protegidas e snapshot. Verificar 5v5 em objetivo sem distribuição de reward em duplicidade. Preservar a aura já funcional dev1/dev2.

**Depois:** d3-C Elder e Smite simultâneos deterministicamente, ordenação de eventos com desempate, invulnerabilidade/estase, kill único e fog por equipe; d3-D perfil p50/p95, contratos de snapshot/replay e acesso por perspectiva. V4.5.2e timing de ataque/AS/windup/projétil e freeze TOP/MID. V4.5.3 itens/runas. V4.5.4 kits de campeões, por lotes. Rust/WebAssembly/backend serão migrados por golden fixtures; não substituir o motor JS offline.

**Pendências explícitas:** melhorar inspeção de stats-buff na UI; execução visual Chromium não certificada; 5v5 competitivo em rede não implementado; balanceamento LoL 1:1 não certificado. Revisar direitos de distribuição antes de beta público.
