# Gate de QA — dev69 integrada

Branch de teste transitória, **não** é publicação de release. Branch base: `dev69/integration` após PR #6 e #7. O PR existe para executar os GitHub Actions contra a combinação real de Skills + Itens e coletar evidências sem alterar main.

Gates: compatibilidade Node/browser; novos contratos Skills e Itens; regressões dev61–68; `npm test` integral (bloqueio de assets na cópia remota deve ser relatado). A liberação oficial segue bloqueada por assets/binários, browser real e histórico Git.
