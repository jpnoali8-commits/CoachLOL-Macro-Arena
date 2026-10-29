# CoachLOL — QA orquestrada sem GitHub Actions

Infraestrutura isolada: `ops/qa-orchestrator-dev69` (sem alterações em Skills, Items, Assets, Integration ou main).

## Como funciona
O `tools/qa/offline_full_project.mjs` já existia; este ramo o evolui, com seleção de suítes pelo manifesto `tools/qa/qa_manifest_dev69.json`. Cada lane realiza um fetch de seu próprio HEAD e roda testes em *detached worktree* descartável. Não faz merge, rebase, reset, force-push ou checkout das branches em desenvolvimento.

- `--quick`: Integration (regressão + paridade Node/browser); Skills (regressão e os três marcos autorais mais recentes, inclusive M44); Items (Batch7).
- `--full`: `npm test` histórico completo na Integration; auditoria de **todos** os arquivos `tests/audit/v453_*.test.mjs` (mínimo atual 49, nunca apenas M20–44); Items base, **items-bulk** e Batch2–Batch7; mais seis testes condicionais da branch separada `dev69/items-full-audit` (somente full).
- `--browser`: paridade Node/browser e scripts Chromium na Integration. Bloqueado se não houver mapa original, Chromium, Playwright ou Pillow.
- `--release`: somente no SHA exato da Integration; exige que os HEADs de Skills, Items, auditoria integral de Items e Assets estejam em sua ancestralidade, além do `npm test`, paridade, 78 assets, browser e ledger autoral de 35 campeões B01 sem dívida genérica pendente. Mesmo após esse gate, a certificação de identidade de todo o elenco requer evidência própria; não chamar os 173 baselines de kits completos. Sem união artificial de código, sem merge. Por segurança, um cherry-pick sem ancestralidade comprovada fica BLOCKED até revisão explícita.

```bash
node tools/qa/offline_full_project.mjs --quick
node tools/qa/offline_full_project.mjs --full
node tools/qa/offline_full_project.mjs --browser
node tools/qa/offline_full_project.mjs --release
```

O runner precisa ser executado a partir de **um checkout da branch de infraestrutura** (não diretamente da branch de Skills). `--full` não implica browser e não confere release. `PASS_LANES` significa apenas branches separadas. O relatório JSON guarda SHA real de cada worktree, lista exata dos testes, status PASS/FAIL/TIMEOUT/NOT_RUN/BLOCKED, duração e logs. `PASS_RELEASE` requer todos os gates integrados e executados.

## Codespaces: sem comandos repetidos por marco
O `.devcontainer/devcontainer.json` nesta branch contém `postStartCommand` apontando para `tools/qa/codespaces_on_start.sh`.

Ao **iniciar** Codespaces criado/reconstruído com essa configuração, o script:
1. Pega um lock de processo; confirma Node 22 e remote correto.
2. Calcula fingerprint dos HEADs remotos Integration, Skills, Items e Infra.
3. Se o fingerprint ainda não teve PASS local, abre worktree descartável no HEAD de infraestrutura remoto e roda `--quick` uma vez.
4. Copia relatórios para `~/coachlol-qa-reports` (fora do repositório).
5. Tenta enviar relatório JSON e excertos de logs sanitizados para a branch privada `ops/qa-evidence-dev69` (push normal, sem force). O ChatGPT então pode ler os resultados no GitHub.
6. Fecha worktree e processo; **nenhum polling**, nenhuma máquina mantida ligada automaticamente.

**Limite real:** um Codespace desligado não executa novos commits por conta própria; um Codespace já ligado não executa `postStartCommand` a cada commit. A configuração nova não aparece automaticamente no Codespace antigo, que ainda aponta para `ops/offline-qa-dev69`: é preciso criar um Codespace a partir desta branch ou reconstruir o existente com o devcontainer atualizado uma única vez. Após isso, o teste roda nas próximas inicializações, sem comandos por marco.

A publicação só atua na branch de evidências e exige `COACHLOL_QA_AUTO_PUBLISH=1` (definido no devcontainer, mas pode ser sobrescrito). O Git push pode falhar por falta de credenciais; nesse caso o relatório local continua existindo e o ChatGPT não deve inventar seu resultado.

## Critérios estritos de QA
- Nunca afirmar PASS em testes indisponíveis, não executados, ou de commits antigos.
- Branch Skills ou Items verde **não certifica** versão combinada.
- Sem introduzir fallback genérico para esconder mecânicas de campeões.
- Um kit só é certificado pelo seu próprio ledger completo P+QWER e todas as dimensões requeridas.
- Node/browser deve ser regenerado e comparado somente no worktree descartável; o integrador é quem atualiza o motor browser final.
- Sem release sem verificação original de assets e PvP humano de duas sessões, snapshots e Nexus.
- QA histórico anterior ao M44 não certifica o M44.

## Onde ver resultados
- No Codespaces: `~/coachlol-qa-reports/latest.json` e logs.
- No GitHub, se o push de evidências funcionar: `ops/qa-evidence-dev69` → `qa-evidence/LATEST.json` → relatório por commit.
- Não commitar logs de QA nas branches de produto.

## Situação no registro inicial
Implementação de infraestrutura não equivale a testes executados: o novo runner, o postStart e o publisher precisam ser validados em Codespaces real. GitHub Actions informado como desativado pelo usuário; este conjunto não os utiliza nem os reativa.
