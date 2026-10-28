# Memória de continuidade — Rift Elemental V4.5.2d-4-dev2

**BASE VÁLIDA PARA PRÓXIMO DESENVOLVIMENTO:** este ZIP `CoachLOL_MacroArena_V452d4_Dev2_Rift_Maps_GameComplete.zip` (não voltar ao d3A). Origem: arquivo dev1 no Library + arquivo `masks-and-maps(1).zip` anexado pelo usuário. Git sujo herdado; inspecionar `git status` antes de alteração e nunca descartar trabalho local automaticamente.

## Estado e invariantes

- `engine.mjs` é fonte autoritativa em JS para offline; `engine.browser.js` gerado, **62 exports**. Migração Rust/WebAssembly/servidor futura exclusivamente por contratos.
- `riftV452d4.phase` e `.revision` garantem uma transformação por partida e são restaurados. Para modo padrão o gatilho é 2 dragões capturados, antes de surgir o terceiro; Swiftplay é 1 captura.
- `riftBundlesV452d4` contém deltas montanha/oceano sem mutar `data/masks_128.json`; snapshots restauram canais Hextech, timers de plantas, pulsos de visão, posições de wards e Rift ativo. Não duplicar efeitos econômicos.
- `data/rift_user_manifest_v452d4.json` descreve 4 cones de explosão, 11 faelights, 10 frutas de cura Quimtec, 15 flores de visão, 6 conexões Hextech e 4 zonas de vento. Valores de raio/duração/dano são **aproximações** até auditoria.
- Mapas 4096×4096 recebidos ficam em `assets/user_rift_masks_20261026/`. A máscara de TOP do usuário é fonte para etapa de benchmark: não aplicá-la diretamente sem garantir farm V4.5.2c (TOP 43/47/44, MID 35/35/35, ADC 41/46/46 nas 3 seeds).
- A máscara de Oceano ajusta regiões de brush visíveis/ocultas. A de Montanha ajusta navegação, linha de visão e colisão. Infernal não destrói terreno (mudança 14.1), cor vermelha discreta.
- Manter seleção múltipla, alvo alternativo no contra-combo, last hit real, freeze parcial, buffs d2/d3A, fog e modo offline. Velocidade UI 2× não afeta cooldown em tempo simulado.

## Passo inicial de próximo chat

Ler `AGENTS.md`, `.agents/skills/coachlol-producao/SKILL.md`, `README_PRODUCAO_V452D4_DEV2.md`, `docs/QA_RIFT_ELEMENTAL_V452D4_DEV2.md`, `docs/ROADMAP_RIFT_V452D4_DEV2.md`, e fonte da versão. Conferir hashes/manifests/Git. Rodar `npm run test:v452d4:masks`, `npm run test:v452c`, `npm test`; nunca declarar visual certificado sem evidência real.

## Próximo incremento pequeno recomendado (d4-dev3)

1. **Faelights**: anotar o 12º ponto ou justificar lacuna; separar ativos desde início vs surgidos após transformação e modelar formas de visão por máscaras reais, não círculos genéricos; testar ward/fog com paredes/brush.
2. **Quimtec e Hexgate**: definir valores exatos e regras de cancelamento/visibilidade por patch e comparar travessia real com skillshots e CC; melhorar diretividade e cooldown de Bloom, raio explosão Quimtec.
3. **TOP mask**: teste de regressão calibrado para rota alterada e freeze/last hit, somente promover se passar.
4. **QA visual Chromium** com screenshots rastreáveis em mapas pré/pós transformação; checar ícones, click pick no mapa 2.5D, fog e overlay discreto.
5. **d3-B ainda não entregue:** bônus individual Barão e aura de cada minion; d3-C Elder/Smite 5v5 determinístico.

## Status

Automação e contratos JS PASS; paridade 1:1 Riot, Blender runtime, forma Faelight, arte 3D, verificação visual Chromium e multiplayer NOT_CERTIFIED/NOT_RUN. Não mover a tag para release estável.
