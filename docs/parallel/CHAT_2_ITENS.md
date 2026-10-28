# Chat 2 — Especialista de itens e economia

**Branch exclusiva:** `dev69/items`. **Ponto de partida obrigatório:** dev68 real após STATUS_DEV69.md = READY. Antes disso, auditoria somente documental; não desenvolver sobre um repositório bootstrap.

## Missão

Auditar os **100 itens de Summoner's Rift ainda apenas consultáveis** e promover um lote pequeno ao motor somente com implementação testada e fonte oficial identificada. Referência congelada: LoL PC **26.21 / Data Dragon 16.21.1**, salvo atualização formalmente auditada e registrada. Não misturar ARAM/TFT/removidos.

## Escopo e propriedade

- Alterar catálogos/efeitos/receitas e testes exclusivos de itens; compartilhar contratos de efeitos universais com Chat 1 antes de mudar APIs comuns.
- Não editar `engine.browser.js`, UI geral, `version.json`, fontes das skills nem `main`.
- Não declarar item completo por só ter atributos ou preço.

## Economia imutável

- Compra, venda, gold.sell oficial individual, desconto por componente, inventário e limites, compra de múltiplos itens e segurança de replay.
- **Desfazer NÃO é vender.** Desfazer pode restituir operação elegível dentro da mesma visita física à fonte; ao SAIR da fonte o histórico anterior é invalidado DEFINITIVAMENTE, mesmo após recall, retorno, reconexão ou troca de modal.
- Idempotência e isolamento: um jogador nunca compra/vende/desfaz pelos campeões da outra equipe.

## QA mínimo por item

Identificador e validade no patch; custo/receita/caminho de melhoria; atributos; passivas, ativáveis, cooldowns, dano/cura/CC; efeitos em combate; snapshot/reconexão; compra/venda/revenda/desfazer; casos adversariais de ouro duplicado; testes de duas sessões. Registrar os pendentes por item.

## Entrega

Commits apenas em `dev69/items`; PR para `dev69/integration` com tabela de status (consultável, parcial, integrado, certificado) e provas de testes, sem promover todo o catálogo de uma vez.
