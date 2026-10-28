# Matriz de propriedade e prevenção de conflitos

| Área | Chat 1 — Skills | Chat 2 — Itens | Chat 3 — Integração |
|---|---|---|---|
| Kits QWER/passivas | **Dono** | Não tocar | Revisar contrato |
| Projéteis, recasts | **Dono** | Consumidor se necessário | Interface comum e sincronização |
| Itens, receitas, gold.sell | Não tocar | **Dono** | Validar segurança e loja |
| Efeitos universais, CC | Propor/adaptar | Propor/adaptar | **Dono da interface comum** |
| Servidor PvP/HTTP/SSE | Não tocar | Não tocar | **Dono** |
| UI/UX HUD, client | Não tocar | Não tocar | **Dono** |
| `engine.mjs` | Alterar trechos de kits somente | Alterar trechos de itens somente | Resolver conflitos/fonte canônica |
| `engine.browser.js` | Nunca editar diretamente | Nunca editar diretamente | **Sincronizar do Node** |
| `version.json`, release | Não tocar | Não tocar | **Dono** |
| Testes específicos | **Dono dos seus** | **Dono dos seus** | Regressão + integração |
| `main` | Nunca escrever | Nunca escrever | Promover somente após QA |

**Política:** mudanças de API compartilhada devem ser propostas como contrato no PR e aceitas pelo integrador antes da implementação, evitando que Chat 1 e 2 editem os mesmos hunks. PRs separados com commits pequenos. Cada chat informa arquivos tocados, não copia pastas inteiras sobre a versão de outro.

**Nunca** fazer `git reset --hard`, reescrita de histórico, push forçado, substituição de arquivos por versões antigas, nem afirmar certificado sem evidência.
