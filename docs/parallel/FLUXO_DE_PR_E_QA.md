# Fluxo operacional de branches, PRs e QA

## Bootstrap (obrigatório)

Ver `STATUS_DEV69.md`: enquanto estiver `BOOTSTRAP`, as três branches têm apenas documentação. Não iniciar alterações reais de engine nesse repositório. O integrador importará a dev68 real, aferirá integridade, alinhará branches e mudará status para `READY`.

## Desenvolvimento após SOURCE_READY

1. Chat 1 lê `CHAT_1_SKILLS.md` e modifica somente `dev69/skills`; Chat 2 lê `CHAT_2_ITENS.md` e modifica somente `dev69/items`; Chat 3 trabalha em `dev69/integration`.
2. Especialistas escrevem teste que falha no comportamento antigo, implementam incremento mínimo e apresentam teste novo verde + regressões relevantes.
3. Cada especialista cria PR **para `dev69/integration`**, não para `main`. PR deve conter diff, riscos, rollback e QA (veja template).
4. Integrador revisa e incorpora um PR por vez. Em caso de conflito na engine, faz reconciliação por função e executa todas as regressões antes do segundo PR.
5. Rodar sync Node → browser **uma vez após integrar**: `python tools/sync_browser_v43.py` (confira a documentação original do projeto).
6. Executar `npm run test:v453:dev61`…`npm run test:v453:dev68` e `npm test`; distinguir PASS, FAIL, TIMEOUT e NOT_RUN com logs.
7. Comparar partidas/Farm CS e Nexus natural quando houver mudança de mecânica. Verificar seleção, fog, permissões 2 humanos/5 campeões, loja e Undo por visita à fonte.
8. QA concluído: integrador atualiza versão/roadmap/changelog/handoff, cria ZIP completo com assets + Git, verifica CRC/SHA-256 e prepara PR `dev69/integration` → `main`.
9. Não mesclar enquanto houver conflitos não resolvidos, testes falhando sem explicação ou comportamento apenas visual sendo declarado funcional.

## Status do item / habilidade

`reference-only` (consultável) → `partial` (efeitos incompletos) → `implemented` (código cobre contrato) → `certified` (testes e casos especiais registrados). Não alterar status sem evidência.

## Limites

Os conectores GitHub podem criar/editar arquivos de texto, branches, commits e PRs. Isso **não é sinônimo de executar automaticamente todo o código em três chats**, nem transfere por si só ZIP de 160 MB / histórico completo. O clone/extrator da base dev68 deve ficar disponível para cada executor de testes.
