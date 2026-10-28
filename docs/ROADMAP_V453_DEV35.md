# Roadmap — CoachLOL após V4.5.3-dev35

## Dev36 — ingestão e classificação autêntica
- Obter `item.json` **completo e autêntico** 16.21.1 (`en_US` e opcionalmente `pt_BR`) em ambiente com rede; conferir SHAs e versão. Não duplicar ou inventar IDs; manter histórico de patch.
- Auditar todos os objetos do catálogo: SR/compráveis, exclusividades de campeões, itens internos de minions/torres, modo Arena/outros, removidos; preparar whitelist em `item_taxonomy_overrides_dev35.json` **com fonte individual verificável**. Categorias suspeitas = pendente e não comprável por engano.
- Corrigir todas as árvores aninhadas; compatibilidade inventário cheio, Rabadon, desconto, ícones; não marcar efeitos como implementados só porque têm descrição.

## Dev37+ — efetivação de mecânicas
- Portar ativos e passivos por lotes para o motor e UI. Atualizar dano, crítica, cura, penetração, armadura, CDR e compras.
- Minions e torres: transformar itens internos/patch notes em **perfil de unidade versionado**, teste de crescimento, prioridade de torre, wave, Barão, Arauto e Nexus; baseline local separado de números Riot.
- Patch 26.22: somente após lançamento oficial, source hash, diff, testes, replay e revisão; não ativar preview/PBE.

## V4.5.4 — campeões
- Atributos base e por nível, passiva QWER com forma (Nidalee, Elise, Shyvana); Mordekaiser R isolada em viewport quadrado com círculo interno, geometria/máscaras/brushes/rift clonado e movimento/colisão real, autoritativa e não apenas efeito visual.
- QA de equilíbrio com múltiplos drafts; duração levemente abaixo de 30 min aceitável sem fim artificial.
