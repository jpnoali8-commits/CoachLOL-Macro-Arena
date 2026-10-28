# CoachLOL Macro Arena — começar pela V4.5.3-dev64

**Base canônica:** este ZIP dev64 completo, derivado exclusivamente do ZIP dev63. Preserve `.git` e todas as fontes, assets, testes, máscaras e documentação. Não reconstruir nem voltar a uma versão anterior.

## Entregas dev64

1. **Reação manual das duas equipes no PvP:** `Arena.processAmbushResponses` agora oferece decisão ao azul e ao vermelho sempre que `mode=pvp`. Mantém o comportamento de bots fora do modo PvP.
2. **Montador de combos no cliente PvP:** Q/W/E/R e feitiços com validação no servidor, seleção do alvo visível ou agressor identificado (sem revelar posição oculta), até 12 etapas e resposta Defender/Recuar/Contra-atacar. A UI não converte passivas ausentes em habilidades genéricas.
3. **Recibos HTTP em retomadas:** respostas já confirmadas podem ser repetidas após sair da janela de reação ou após reiniciar; os mesmos bytes retornam exatamente o recibo antigo, sem repetir escudo, dano, consumo de item nem alterar estado. Payload reutilizando a mesma sequência com conteúdo diferente continua recusado.
4. **Checkpoint durante combate:** ambos os cookies e a decisão pendente sobrevivem a restart em cenário de testes com impacto real da função `attack`.

## Escopo de qualidade

`npm run test:v453:dev64`; `npm run test:v453:dev63`; `npm test`. Novo teste dev64 contém 26 contratos em 2 sessões HTTP independentes. O cenário coloca um atacante e defensor próximos como *fixture* e usa um golpe REAL do motor (não altera HP diretamente), seguido de `continueExecution` e respostas enviadas pelo HTTP autenticado. Isso **não representa** uma partida inteira jogada por humanos, nem certifica todos QWER, invocações ou itens. Itens gerais SR: 102/202 vinculados, 100 reference-only (nenhum novo promovido). Desfazer idêntico a dev61.

## Próximo alvo

Teste de ações QWER durante turnos longos e validação Chromium HTTP/SSE real fora do bloqueio de rede. Lote progressivo de itens com todos efeitos, sem inventar valores. Auditoria de farms e Nashor/Smite. Mordekaiser R real permanece pendente na V4.5.4.
