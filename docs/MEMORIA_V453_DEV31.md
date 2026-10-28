# MEMÓRIA DE CONTINUIDADE — V4.5.3-dev31

**BASE ATUAL: V4.5.3-dev31, não dev30.** Entregar sempre um ZIP completo da base atual, com alterações Git herdadas sem reset/commit e logs reais. Ler `docs/QA_V453_DEV31.md` e `docs/ROADMAP_V453_DEV31.md` antes de qualquer nova etapa.

- Loja: 56 entradas (49 dev30 + 7 dev31), receita clicável recursiva e compras individuais por componentes. Arquivo oficial completo `item.json` Data Dragon 16.21.1 NÃO baixado; `tools/import_full_shop_v453_dev30.mjs` faz preview e `--apply` apenas com fonte autêntica fornecida. Cuidado: importador não certifica passivas.
- Dev31: Armadura de Espinhos/Colete Espinhoso reagem a ataques básicos, Proteção de Armadura reduz básicos, Randuin tem ativo de lentidão 70%/2s/500u/90s; armadura bônus da reflexão é estimada via itens, não paridade 1:1.
- UI: Golpear sempre camada superior (z 2147483000); painel do Mordekaiser menor (z 2147482000). **Painel quadrado no canto superior esquerdo; círculo interno limita movimento, nunca círculo substituindo o painel.** Vista isolada deve CLONAR a área real do mapa, incluindo colisões, moitas e Rift Elemental ativo. Ao acabar a R, o painel fecha sozinho; retorno dos dois campeões deve conservar posições de mundo coerentes. Nada disso foi fingido como implementado nesta etapa.
- Última regressão: `npm test` PASS; 9/9 dev31; Chromium Randuin PASS; 4/4 Nexus natural e hash igual à dev30; média 30m27s nessas 4.
- Preservar Golpear competitivo, Arauto invocado com olho traseiro, Baron, Elder, SAM? não se aplica; Riot 26.21 como referência e simulação sem cronômetro de encerramento.
