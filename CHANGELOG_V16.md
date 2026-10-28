# CoachLOL Macro Arena v1.6 — correção de fluxo, regras e input

## Alterações centrais

1. **Motor de turnos simultâneos:** 60 segundos reais de preparação inicial com o mundo parado, planejamento congelado, confirmação das duas equipes (bot vermelho local) e 10 segundos de execução observável. O relógio de jogo não avança durante a fase de decisão; confrontos suspendem a simulação global até uma resposta.
2. **Estruturas:** adicionada checagem de vulnerabilidade por linha (torre externa → interna → torre do inibidor → inibidor) e proteção do Nexus por seus guardas. Inibidores ressurgem; tropas super entram após queda de inibidor. Modelagem simplificada, não equivalência matemática ao jogo oficial.
3. **Ondas e torres:** minions encontram obstáculos vivos da própria lane, param/atacam torres e torres priorizam ondas em alcance; previne passar por torre ignorando combate.
4. **Jungle:** rota persistente para camps do próprio lado, limpeza automática, CS, XP, level e ouro por eliminação de acampamento; plano textual admite 'red de baixo → krugs de baixo'.
5. **Movimentação:** ordem manual não congela permanentemente automação de lane/farm; após alcançar destino, comportamento automático retoma conforme intenção tática. Ordem de rota mantém passos.
6. **Combate:** AA, kite, on-hit, skill+AA e combo QWER são opções; recuar não concede invulnerabilidade e o ataque depende de alcance real. Solicitação de duelo normal aguarda oportunidade de reação; pausas globais em decisões do humano.
7. **HUD de texto:** área fixa na parte inferior central com parser PT-BR local, preview por campeão, aplicação manual e tratamento de múltiplos comandos. Controle por mouse e atalhos mantido.
8. **Placar:** preserva Tab/KDA/build e mascara campos de economia/wards do oponente na projeção atual; não equivale a segurança de servidor.

## Evidências desta entrega

- `npm test`: 10 contratos v1.6 e 5 do placar aprovados.
- Chromium autocontido: inicialização com fase 'PREPARAÇÃO' 00:00; teste de prévia/aplicação de ordens; confirmação da rodada com relógio avançando após começar; sem erros JS detectados nesses caminhos.
- Simulação de ~9 minutos in-game: junglers com CS e nível crescentes, Nexus ainda protegido (essa amostra **não** é prova de balanceamento em partidas completas).

## Limitações e riscos P0

O modo atual é offline com IA baseada em regras, não há entrada de outro jogador humano remoto. O sistema de decisões ainda precisa de negociação verdadeiramente simultânea e privada por servidor para competição. Ganks/roamings excepcionados de consentimento devem usar regras de fog/detecção verificáveis, e não strings de ordem. Regras exatas de kits, atributos, armor/MR, dano crítico, projéteis, CC, itens, objetivos e rank/PDL estão no backlog da auditoria. Recursos antigos de 'mundo vivo' ainda existem no motor para compatibilidade com testes antigos, mas não são invocados pelo app atual. A Bíblia antiga não deve ser confundida com a especificação v1.6 em vigor.
