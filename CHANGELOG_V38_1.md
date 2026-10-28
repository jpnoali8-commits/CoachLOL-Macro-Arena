# CoachLOL Macro Arena — V38.1 (26/10/2026)

## Problema relatado

1. Shift+arrastar não mostrava seleção por área; Shift+clique precisava permitir múltiplos campeões.
2. Ao sofrer um ataque, a reação deveria abrir o **mesmo editor de combos** com habilidades Q/W/E/R e feitiços (incluindo Barreira, Incendiar, Flash, Curar ou Exaustão equipados).
3. Um inimigo não precisa aceitar lutar: ataque, perseguição, kiting e defesa são intenções independentes e podem ocorrer simultaneamente.

## Implementação

- Retângulo de seleção dourado, em coordenadas da câmera, Shift+arrastar; Shift+clique cumulativo com alternância de seleção e seletor contextual para aliados sobrepostos; destaque visual dos múltiplos campeões e comandos em grupo.
- Motor inicia agressão sob regras de **alcance, tempo e visão**, sem esperar autorização de duelo. Danos e bloqueios são resolvidos antes da escolha reativa.
- Janela **combate/reação** abre após o primeiro dano, com retratos, barras de HP, mana, habilidades, feitiços e sequências independentes.
- Ataque com perseguição, somente ataque, somente perseguição; aproximação sem vazamento de posição em névoa de guerra.
- `queueReactionCombo` programa contra-ataque/defesa/recuo temporário sem apagar a ordem macro anterior. Yasuo W, Braum E e Mel W são passos defensivos autocentrados, independentes de alcance/visão do agressor; bloqueio de projéteis ainda é aproximado.
- Segundo feitiço configurável na fonte (exceto Golpear fixo da selva). Barreira protege mesmo quando atacante deixa a visão; shield expira após três ticks. Dano de Incendiar é periódico.
- Compatibilidade de save da V38: restaura o segundo feitiço padrão quando o campo é ausente.

## Limitações conhecidas / transparência

- O motor offline é uma **abstração tática**, não um clone frame-a-frame de League of Legends. Barreira dura 3 ticks de 1 segundo (~2,5 s no LoL); cooldown de 180 s.
- O alerta para jogador Azul é após dano real, antes de próximos ticks (não pausa o golpe inicial). O oponente vermelho é controlado por IA.
- Os kits ainda exigem especificações individuais (W Yasuo, E Braum, W Mel etc. usam bloqueio aproximado, não colisões oficiais completas).
- Combo planejado fica privado na lógica de apresentação offline, mas sigilo real exige servidor autoritativo em PVP online.
- Smoke test em Chromium com recursos JavaScript/CSS embutidos validou Shift+clique, Shift+arrasto, câmera parada e modais. O acesso gráfico direto ao servidor local foi bloqueado no ambiente, portanto imagens offline completas precisam de verificação adicional em máquina com assets carregados.

## Execução

Abrir `index.html` em navegador moderno ou servir localmente com `python -m http.server 8080` e abrir `http://localhost:8080`.

```
npm test
npm run test:v38-1
```

Base: V38.0 completa; handoff V37 consultado como referência histórica, não usado para substituir código de jogo.

## Evidências realizadas nesta entrega

- `npm test`: suíte completa da V38 e nove novos cenários de regressão V38.1 aprovada.
- `python tests/smoke_v38_1_browser.py`: UI carregada em Chromium com JS/CSS inline, sem erros JavaScript; verificou Shift+clique acumulado, seletor de aliados sobrepostos, retângulo visível durante Shift+arrasto, câmera imóvel, editor de ataque e editor de contra-combo.
- O script é opcional e requer Playwright, mais Chromium instalado (ou `CHROMIUM_PATH`). Os assets de mapa/retratos externos não são carregados nesse smoke isolado; validar a aparência final executando o jogo no navegador do jogador.
