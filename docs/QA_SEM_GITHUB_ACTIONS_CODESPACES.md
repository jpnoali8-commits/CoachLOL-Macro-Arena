# CoachLOL Macro Arena — QA sem GitHub Actions (Codespaces / Node 22)

**Branch de infraestrutura:** `ops/offline-qa-dev69`, criada a partir de `dev69/integration`. A branch NÃO substitui `dev69/integration` e NÃO contém automaticamente os commits ainda isolados de Skills, Items ou Assets. Nenhum merge é executado.

## Configuração inicial (somente navegador)

1. Abra [Create Codespace](https://github.com/codespaces/new).
2. Repositório: `jpnoali8-commits/CoachLOL-Macro-Arena`.
3. **Branch: `ops/offline-qa-dev69`** (não `main`).
4. Tipo de máquina: **2-core**, se disponível; assim minimizamos consumo da cota pessoal.
5. Clique em **Create codespace**.
6. No terminal do VS Code web, execute a QA.

```bash
node tools/qa/offline_full_project.mjs --quick
```

Esse comando baixa **somente os refs necessários**, cria worktrees descartáveis e isola os testes de:
- `dev69/integration`: `npm run test:v453:dev69:integration`;
- `dev69/skills-batch2`: contrato Skills histórico mais o conjunto de testes autorais M42 e M43;
- `dev69/items-batch7`: suíte específica da etapa mais recente de Items.

Para executar a QA geral mais custosa:

```bash
node tools/qa/offline_full_project.mjs --full
```

Essa opção executa `npm test` da branch de integração (histórico e suites do jogo), a regressão Skills + todas as auditorias B01 M20–M43 rastreadas pelo padrão de arquivo, e todos os scripts de Items B01 até Batch7. **Não executa GitHub Actions e não cria commits**. Os testes usam Node.js e npm da máquina Codespaces.

Se quiser auditar também a candidata QA e o `main` (pode custar mais tempo de Codespaces):

```bash
node tools/qa/offline_full_project.mjs --full --with-candidate --with-main
```

### Como interpretar os resultados

O programa imprime `PASS` ou `FAIL` por branch e por teste; registra logs individuais em `qa-reports/` e um arquivo JSON `qa-reports/offline-{quick|full}-...json`.

**Um resultado PASS por branch não significa que o conjunto inteiro está integrado.** Skills e Items ainda podem estar pendentes de merge no integrador. A certificação de release exige validar a soma efetivamente integrada, regenerar oficialmente `engine.browser.js` **sob responsabilidade do integrador** e comprovar o PvP + assets completos. A atual pendência de Node→browser não pode ser mascarada pelo script.

Se qualquer script falhar, abra o log correspondente no Codespaces ou envie o JSON + logs para o ChatGPT. O agente poderá avaliar e corrigir código e testes, mas **esta sessão ChatGPT não controla a execução do terminal do Codespaces diretamente**.

### Econômico

- **GitHub Actions:** precisa ser desativado pelo usuário em **Repo → Settings → Actions → General → Actions permissions → Disable actions**. O conector atual não expõe controle administrativo para desativar workflows. Apenas criar um Codespace NÃO interrompe os workflows já associados aos pushes das branches existentes.
- **Codespaces:** é computação separada de Actions e tem cota própria de horas/núcleos e armazenamento; parar e excluir Codespaces antigos quando não utilizados. Não ativar faturamento automático.
- **GitHub:** continua como backup de código, branches, PRs, Git history e assets que estejam de fato versionados. `qa-reports` não deve ser commitado.

### Execução diretamente no ChatGPT

É possível executar testes Node.js no ambiente isolado do ChatGPT **se houver uma cópia íntegra de todos os arquivos e assets necessários disponível nele** (por exemplo, um ZIP completo enviado no chat). Apenas o conector GitHub não transfere automaticamente o repositório privado para esse ambiente. A execução em Codespaces é, portanto, o caminho sem PC com acesso direto ao Git privado.

### Notas de preservação

- Nunca criar uma união artificial dos branches para declarar a engine certificada.
- Não editar o motor do jogo ou os scripts internos de Skills, Items ou Logic a partir deste ramo de infraestrutura.
- Não forçar pushes, merges ou alterar refs de origem durante QA.
- Antes de liberar a versão, correr `npm test` e a regressão do browser *no mesmo HEAD integrado*; se falhar, registrar o bloqueio e não declarar aprovação.
