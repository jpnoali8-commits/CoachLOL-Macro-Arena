# Gate de QA — dev69 integrada

Branch de teste transitória, **não** é publicação de release. Branch base: `dev69/integration` após PR #6 e #7. O PR existe para executar os GitHub Actions contra a combinação real de Skills + Itens e coletar evidências sem alterar main.

Gates: compatibilidade Node/browser; novos contratos Skills e Itens; regressões dev61–68; `npm test` integral (bloqueio de assets na cópia remota deve ser relatado). A liberação oficial segue bloqueada por assets/binários, browser real e histórico Git.

## Nova rodada integrada

Validar novamente após commit `19ca48b1` de atualização dos contratos temporais v39 e após adoção do fast lane. Esta PR é apenas gatilho de QA, sem promoção para `main`; todas as integrações de código permanecem na branch base.
