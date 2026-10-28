# Modelo obrigatório de entrega entre chats

**Equipe:** Skills | Itens | Integração  
**Branch:** dev69/...  
**Base SHA:**  
**Head SHA:**  
**PR URL:**  
**Status:** READY_FOR_REVIEW | BLOCKED | PARTIAL  
**Arquivos alterados:**

## Implementado

Descrever comportamento real e limitações, inclusive se efeito for autoral/aproximado.

## Fontes e patch

Patch de referência, IDs, valores auditados e quais dados são aproximações.

## Matriz de testes

| Teste | Comando | Resultado | Evidência |
| --- | --- | --- | --- |
| Dois clientes PvP | | PASS/FAIL/NOT_RUN | |
| Permissões/fog | | | |
| Cooldown/mana/compra | | | |
| Checkpoint/reconexão | | | |
| Regressões específicas | | | |

## Riscos e conflitos

Registrar mudanças em APIs globais, funções em `engine.mjs`, possíveis interferências com outros PRs e o procedimento de rollback.

## Critérios para integrar

- Nenhuma alteração direta em `main`.
- Sem sobrescrever `engine.browser.js` do integrador.
- Evidências de testes reais do motor e logs de saída.
- Funções novas isoladas sempre que viável.
- Mudanças em `version.json` apenas no marco integrado.
