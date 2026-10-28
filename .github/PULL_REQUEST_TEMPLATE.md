## Objetivo

Descreva o comportamento real implementado; referência ao Issue e ao patch de LoL quando aplicável.

## Base e arquivos

- Base SHA dev68 validada:
- Branch / Head SHA:
- Arquivos alterados:
- Impacta engine.mjs compartilhada? [ ] sim [ ] não
- Modificou engine.browser.js diretamente? [ ] não (obrigatório)
- Alterou o estado canônico/version.json? [ ] não (especialistas)

## QA (sem inventar resultados)

| Comando / cenário | PASS / FAIL / NOT_RUN / TIMEOUT | Evidência |
|---|---|---|
| Testes novos | | |
| 2 sessões PvP (ambas equipes) | | |
| Permissões/fog | | |
| Cooldown, snapshots, reconexão | | |
| Regressões históricas relevantes | | |
| npm test integral (integrador) | | |

## Riscos, aproximações e rollback

Descrever diferenças de paridade, status parcial, conflitos previstos e rollback sem apagar Git.

## Checklist

- [ ] Comecei da base dev68 READY
- [ ] Alterei somente arquivos autorizados
- [ ] Não introduzi mecanismo de bots prematuro
- [ ] Preservei a regra de Desfazer por visita física à fonte
- [ ] Não promovi itens/habilidades incompletos a certificados
- [ ] Não alterei main diretamente
- [ ] O integrador revisou os contratos comuns
