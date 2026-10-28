# Auditoria de continuidade e backlog após v1.9

**Objetivo da arquitetura:** um tabuleiro 5v5 compreensível para quem conhece macro do LoL, com duas equipes que planejam ao mesmo tempo; não um RTS de cliques frenéticos. Todas as ordens e informações relevantes precisam passar pelo mesmo motor determinístico.

| Prioridade | Sistema | Estado v1.9 | Gate necessário |
|---|---|---|---|
| P0 | Planejamento simultâneo, pausa de decisões | Fluxo funcional parcial | Testar partidas completas, salvamentos durante decisões, repetibilidade por seed e bot sem informação privilegiada |
| P0 | Jungle, Golpear, monstros/objetivos | Golpear por alvo/HP e AA ativos; disputas do mesmo tick agora sem prioridade do ID | Monster leash/reset, kits com bônus contra monstros, HP por nível, spawn/respawn por patch, disputa com impacto por linha do tempo e ações de 5 campeões |
| P0 | Ondas, torres, inibidor, Nexus | Bloqueio estrutural e dano básico testados | Agressividade por alvo e prioridade por estruturas/creeps/torres, dependência exata de atiradores, wave state, superminions e vitória em partidas longas |
| P0 | Visão / fog / rota | Fog parcial e navegação em máscara | Não revelar HP/intenção/cooldown ocultos; correção de pathing/colisões, vision spots, wards, torres e plantas |
| P0 | Combate justo | Janela de resposta por turno e gank/roam; dano abstrato | Consentimento de confronto não gera invulnerabilidade, AA/kite/QWER no tempo certo, simultaneidade, CC, resistências, cooldowns e testes de partidas espelhadas |
| P1 | Campeões e habilidades | Níveis/ranks e QWER genéricos | Cadastro individual de passivas, Q/W/E/R, mana/energia, dano, alcance, efeitos e exceções R por campeão |
| P1 | Loja, build, Smite e sup | Pets e Atlas funcionais, catálogo parcial | Itens com ingredientes, venda/refund, efeitos ativos/passivos, unique, on-hit, crit, tenacidade, recomendação por matchup |
| P1 | Texto / linguagem tática | Compilador local de termos PT-BR e LoL; prévia + aplicação | Condições compostas `se/até/quando`, ambiguidade, correção sem inventar ação, cobertura por campeão, memória da ordem, interpretação testável |
| P1 | UX / tutorial / acessibilidade | HUD e scoreboard funcionais | Mostrar plano ativo por campeão, range/HP/cooldown de monstros visíveis, pistas de causa/efeito, tutorial 5 minutos, estados de erro compactos |
| P2 | Multiplayer competitivo | Não implementado | Backend autoritativo, turn lock/reveal, proteção contra espelhamento/cheat, reconexão, replay, observabilidade, anti-abuso |
| P2 | Ranked, MMR, PDL, temporadas | Não implementado | Fila, classificação inicial, MMR oculto, PDL auditável, temporadas, reset, integridade de partidas e penalidades |
| P2 | IP e distribuição | Assets ligados ao universo LoL no protótipo | Avaliar autorização/licenças; substituir conteúdos protegidos por propriedade original se publicar sem licença |

## Decisões a preservar

1. **Texto e mouse são dois controles do mesmo `Arena`**, sem lógica de combate paralela na UI.
2. **Ordens explícitas persistem** entre rodadas e não são apagadas pela wave, por auto-farm ou por compra de itens.
3. **No planejamento e em pop-ups de decisão, o tabuleiro está congelado.** O mundo avança apenas na resolução da rodada.
4. **Golpear não é magia de execução:** aplica dano real do tier com trava de HP/alcance/cargas/CD e não troca o alvo sozinho.
5. **Não declarar sistema pronto apenas porque há botão.** Um recurso só progride de experimental para certificado com testes determinísticos, cenários extremos e validação de partida inteira.

## Próxima execução sugerida (v2.0)

**Gate A:** simulações de 20–40 minutos com logs e invariantes verificadas: nunca tirar HP do Nexus bloqueado; manter ordens; fog não revelar alvos; contagem de wards, ouro e CS sem duplicação; nenhum campeão parado indefinidamente por erro de rota.

**Gate B:** schema `ChampionKit` por patch com 5 campeões originais de teste e efeitos Q/W/E/R precisos; dano AA/on-hit/esquiva e combinações por condição; testes de *mirror-match*.

**Gate C:** editor de comandos condicionais e visão: `se inimigo não visível não iniciar gank`, `guardar Golpear para dragão`, `fazer red → krugs → gank bot se top sem prioridade`, com AST mostrado na prévia.

**Gate D (mais tarde):** rede autoritativa e matchmaking/ranked, depois de pelo menos um ciclo de partidas completas e métricas de equilíbrio.
