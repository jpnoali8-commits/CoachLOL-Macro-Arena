# CHANGELOG — CoachLOL V4.5.2d-4-dev16

## Ícones gráficos originais / CC0

Substituímos a representação com glifos de texto do mapa por 15 arquivos SVG originais, editáveis e sem dependência de fontes. A dedicação CC0 1.0 vale exclusivamente para esses SVGs novos, não para assets preexistentes. Veja `assets/ui/map_cc0_v452d4_dev16/LICENSE-CC0-1.0.txt` e `manifest.json`.

- **Ward amarela:** olho dourado desenhado em vetor.
- **Pink/control ward:** olho rosa e formato distinto.
- **Ward de suporte:** cristal verde-água próprio.
- **Hexgate:** hexágono de teletransporte ciano.
- **Florividente:** planta luminosa com pétalas e faíscas.
- **Planta de cura:** folhas verdes e fruto com sinal de cura desenhado em paths SVG.
- **Planta Explosiva:** núcleo central desenhado em vetor e projeção 2.5D do raio da mecânica `plant.radius`; o círculo não altera alcance nem colisão.
- **Minions:** 4 silhuetas separadas (guerreiro/melee, mago/caster, canhão/siege, super), cada uma em azul e vermelho; deixam de ser bolinhas uniformes.

## Barão: VFX, não texto

Minions sob a aura real da Mão do Barão recebem brilho radial roxo, círculo projetado sobre o chão e três partículas sutis. A apresentação atualiza visualmente durante os movimentos da partida; não existe letra “B”, nem “C/S” sobre minions. **Não há mudança em regras de combate**. Foram ampliados testes de cerco, morte/expiração do titular, restituição por snapshot e cálculo contra torres.

## Fontes e transparência

- `tools/generate_cc0_map_icons_v452d4_dev16.py` — gera todos os 15 SVGs editáveis.
- `assets/ui/map_cc0_v452d4_dev16/` — arquivos, licença CC0 limitada e manifesto.
- `tests/v452d4_dev16_cc0_icons.test.mjs` — 6 novos contratos.
- `tests/v452d4_dev16_baron_siege.test.mjs` — 3 novos contratos.
- `tests/browser_v452d4_dev16_cc0_icons.py` — Chromium controlado carregando os SVGs originais.

**Os visuais são inspirações funcionais de classes de MOBA; nenhum ícone foi extraído ou traçado de Riot/League of Legends.**
