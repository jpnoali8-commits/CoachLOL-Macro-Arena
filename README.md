# CoachLOL Macro Arena

> **Estado: configuração inicial do repositório.** O código da base canônica **V4.5.3-dev68 AINDA NÃO FOI IMPORTADO** para o GitHub. **Não iniciar desenvolvimento nas branches** até o integrador publicar e conferir a base.

Projeto: jogo web de estratégia PvP, 1 jogador humano controlando 5 campeões azuis contra 1 jogador humano controlando 5 campeões vermelhos. Turnos simultâneos, servidor autoritativo, fog of war por equipe, combate e reações manuais.

## Estrutura de colaboração

| Branch | Responsabilidade |
| --- | --- |
| `main` | Versão canônica, promovida após QA |
| `dev69/skills` | Habilidades QWER, passivas, projéteis, recasts e testes |
| `dev69/items` | Itens, efeitos, economia, receitas e testes |
| `dev69/integration` | Motor PvP, revisão, integração, testes e pacote mestre |

**Todos os especialistas partem da mesma base dev68 importada e verificada.** Não mexer na `main` diretamente durante o trabalho paralelo; enviar Pull Requests ou commits isolados ao integrador.

## Regras inegociáveis

- Não apagar arquivos legados nem reconstruir o jogo do zero.
- Não usar `git reset --hard` ou force push.
- Preservar o histórico Git antigo no processo de importação, se tecnicamente possível.
- Preservar a regra de Desfazer: sair fisicamente da fonte invalida definitivamente o histórico daquela visita.
- Não alterar a definição do PvP: exatamente 2 humanos, cada um gerenciando 5 campeões.
- Não declarar habilidades, itens, partidas ou testes certificados sem evidências.
- Sincronizar motores Node/navegador e executar regressões antes de promover a versão.
- ZIPs mestres completos e assets volumosos devem ser distribuídos separadamente até uma política de LFS/release ser definida; não fazer commit de um ZIP >100 MiB.

## Próximo bloqueio

**Importar o conteúdo exato da V4.5.3-dev68 para uma branch base (com verificação de integridade), antes de liberar as branches dev69.** Este README é apenas a inicialização do repositório e **não contém o código jogável**.

## Painel de coordenação dev69

**Status atual: BOOTSTRAP / BLOQUEADO — a dev68 ainda não foi importada para o GitHub.**

### Documentação para cada chat

- [Status e gate da base dev68](docs/parallel/STATUS_DEV69.md)
- [Chat 1 — Skills](docs/parallel/CHAT_1_SKILLS.md)
- [Chat 2 — Itens](docs/parallel/CHAT_2_ITENS.md)
- [Chat 3 — Integração](docs/parallel/CHAT_3_INTEGRACAO.md)
- [Matriz de propriedade dos arquivos](docs/parallel/ESCOPO_E_CONFLITOS.md)
- [Fluxo de PR, testes e release](docs/parallel/FLUXO_DE_PR_E_QA.md)
- [Modelo de handoff entre equipes](docs/parallel/MODELO_HANDOFF.md)
- [Plano de importação da dev68](docs/parallel/PLANO_IMPORTACAO_DEV68.md)

### Tarefas de trabalho

1. [#1 — Bloqueador: importar dev68 canônica](../../issues/1)
2. [#2 — Skills: Nami R e Vex R](../../issues/2)
3. [#3 — Itens: primeiro lote certificado](../../issues/3)
4. [#4 — Integração: HTTP/SSE PvP navegador real](../../issues/4)
5. [#5 — Infra: QA e assets grandes](../../issues/5)

**Importante:** criar branches/docs e issues não equivale a transferir o código. Até completar #1, as branches são para planejamento e auditoria de fontes; não é permitido declarar testes do jogo executados a partir do repositório.
