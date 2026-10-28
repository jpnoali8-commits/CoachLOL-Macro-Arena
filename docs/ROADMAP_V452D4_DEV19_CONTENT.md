# Roadmap corrigido após auditoria V4.5.2d-4-dev19

| Marco | Entrega verificável | Gate |
|---|---|---|
| dev19 — FEITO (parcial e honesto) | Auditoria de 14 campeões, 41 itens; importador Data Dragon 16.21.1 de referência e testes de 18 níveis; simulações 20/40 min | Auditoria automática, 6 contratos, três seeds/tempos. **Não** habilitar ref no motor |
| dev20 — MAIS URGENTE | IA objetiva autônoma; capturar ao menos um dragão e concluir uma partida com Nexus em seed controlada sem manipular HP; replay/fog | 30–50min, bot x bot, 3 seeds, recursos/economia íntegros |
| V4.5.3a | Baixar e versionar TODOS os dados oficiais SR por patch; corrigir estatísticas de itens e receitas com grafo acíclico | Fórmulas e gold reconciliados; não inferir passivas de tooltips |
| V4.5.3b–f | Passivas/ativos de itens por família (on-hit, dano, armadura, sustain, mobilidade, suportes), runas/trees, filtros e CDs | Cada item testado com efeito real no motor, snapshot/fog |
| V4.5.4a | Atributos-base e crescimento de TODOS os campeões do SR nível 1–18 | Auditoria por patch, recursos especiais, range, AS e regressão, sem bulk-enable inadvertido |
| V4.5.4b | Kits pequenos em lotes de 3–5 campeões, passiva + QWER + AA + combos | Nenhum campeão certificado sem kit integral e testes de ranks |
| V4.5.4c | Máquina de estados de forma; Nidalee, Elise e Shyvana | Skills distintas por forma, recursos, swaps, pets, casts e replay |
| V4.5.4d | Instâncias dimensionais e Mordekaiser R 1v1 em pleno 5v5 | realmId no motor, target/fog/colisão/escudos/interação e snapshot |
| V4.5.5+ | Autoridade Rust/WS, combate PvP, persistência, ranking | Paridade JS/Rust, threat model; no browser adversarial fog leaks |

**Cuidado:** dados de referência não são autorização de redistribuir conteúdo da Riot. Assets externos sujeitos à própria política/licença, distinto dos 15 SVGs autorais CC0 do projeto.
