# QA — V4.5.2d-4-dev1

- Base extraída de `CoachLOL_MacroArena_V452d3A_JogoCompleto_Handoff.zip` na biblioteca, não de V4.5.2d-dev2.
- `npm run test:v452d4`: 9 contratos de transformação, geometrias sintéticas, snapshots, modos e imutabilidade — PASS.
- `npm test`: PASS (exit 0) na primeira execução de 8 contratos. Após adicionar o 9º contrato e o importador de bundles pelo mapa, a execução integral foi iniciada novamente, mas excedeu o limite durante a suíte lenta de farm V4.5.2c. Portanto, a regressão integral pós-última alteração fica INCONCLUSIVA. Grupos V4.5.2d, dev2, 3A e dev4 passaram separadamente (7+10+10+9 contratos).
- `python tools/sync_browser_v43.py`: Node/browser em 62 exports, sem divergências de exportação.
- `node --check engine.mjs`: PASS.
- Browser Chromium interativo: **não executado ainda**.
- Máscaras reais e Blender: **não incluídos**, nenhuma paridade de layout pode ser certificada.
- A certificação de inputs adicionais exige validação da máscara e revisão visual antes do merge.

## Testes adicionais necessários antes de release

- Teste e2e visual dos seis estados e VFX em PC Windows; reproduzir shift selection e targeting após alterações de colisão.
- Provar que nenhum campeão fica preso numa parede que aparece sob ele no tick de transformação; resolver relocação legal por política do jogo quando houver coordenadas finais.
- Fuzz de bundles malformados, geometria que corta lanes e invalida passagens, simulações de duas equipes com ações simultâneas durante transformação.
- Verificar unidades invisíveis, plantas e sentinelas nos novos brushes e linhas de visão.
- Garantir que scripts futuros de Blender não alterem silenciosamente o atlas original.

- `tools/build_rift_bundle_v452d4.py`: teste de máscara PNG 128×128 com um pixel alterado → PASS, gerou exatamente um índice de delta.
