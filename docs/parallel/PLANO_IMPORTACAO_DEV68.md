# Importação da base dev68 — tarefa bloqueadora

## Pacote canônico identificado

`CoachLOL_MacroArena_V453_Dev68_Lux_Q_Projetil_2_Alvos_PvP_JogoCompleto.zip` (160.356.099 bytes). SHA-256: `019e09b6dc302c063d715be0b583897cbbc90791422a91ec2172682fa12d26be`. 2.549 entradas; 566 arquivos internos `.git`. Entrega original reportou CRC PASS.

## Regras importantes

- **O ZIP ainda não foi enviado ao repositório GitHub** e os três branches ainda não contêm o código dev68. Não criar uma engine de substituição.
- Não enviar ZIP mestre >100 MiB como arquivo normal em commit GitHub.
- Não adicionar a pasta `.git` como conteúdo versionado; ela é o repositório Git histórico. Conservar o original e, se viável, migrar os commits antigos corretamente para o novo remoto. Não descartar histórico sem decisão explícita do usuário.
- `git log` do pacote termina em `9392c0f` da v4.5.2c enquanto há mudanças de trabalho não commitadas até dev68. É preciso capturar snapshot canônico dev68 no Git ao migrar, nunca presumir que HEAD já representa dev68.
- Com a conexão GitHub disponível neste chat, é possível criar objetos/arquivos texto, mas a importação íntegra de 2.549 entradas e ~160 MB não deve ser alegada até ser materializada e validada no remoto.

## Gate de aceite remoto

- Arquivos centrais presentes e bytewise equivalentes: `AGENTS.md`, `.agents/skills/coachlol-producao/SKILL.md`, `engine.mjs`, `engine.browser.js`, `app.js`, `multiplayer.html`, `version.json`, `package.json`.
- Dados, skins/assets e testes necessários aos scripts npm presentes.
- `version.json.version` = `4.5.3-dev68` e `npm run test:v453:dev68` funciona após checkout.
- Regressões dev61–dev68 executadas (ou não certificadas se faltarem meios), e logs salvos.
- Cada uma das 3 branches avançada sem reescrever commits de terceiros para o mesmo **commit-base SHA da dev68**.
- Após todos esses itens, STATUS_DEV69.md passa a `READY`; antes disso, somente planejamento.
