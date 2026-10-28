# V4.5.3-dev31 — Segundo lote de itens e prioridade dos overlays

## Código implementado
- Base: **V4.5.3-dev30**, arquivos e alterações Git herdadas preservados. Versão: **4.5.3-dev31**.
- **7 novos itens** com preços, atributos e receitas: Cota de Malha, Capa Negatron, Colete Espinhoso, Armadura de Espinhos, Proteção de Armadura, Presságio de Randuin e Grevas do Berserker. Total registrado: **56**, ainda NÃO o catálogo completo do LoL.
- Armadura de Espinhos e Colete Espinhoso: reação ao ataque básico inimigo, feridas dolorosas por 3s e dano mágico reativo (não recursivo). O efeito principal da Armadura de Espinhos utiliza base 20 e 10% da armadura bônus estimada dos itens. Adaptação limitada ao motor, não auditoria 1:1.
- Proteção de Armadura: redução de até 15 do dano básico pós-mitigação, limitada a 20% por hit.
- Randuin: ativo por botão no HUD; lentidão 70% por 2s em campeões inimigos a até 500 unidades; recarga 90s; snapshots.
- Compra separada de componentes em receitas aninhadas continua funcional (dev30), agora testada com Randuin. Botas de Berserker usam **30% de velocidade de ataque** conforme patch 26.16/26.21.
- Golpear competitivo: camada visual prioritária acima das demais interfaces quando visível. Painel futuro do Mordekaiser: **viewport quadrada** com **círculo interno**; permanece oculto porque a ultimate ainda não está no motor. Reservada prioridade abaixo do Golpear.

## Limites explícitos
- **Não há catálogo oficial completo**: Data Dragon 16.21.1 item.json autêntico não pôde ser materializado; importador verificado continua pronto em `tools/import_full_shop_v453_dev30.mjs`.
- Passiva de redução de dano crítico do Randuin, outros efeitos especiais e paridade de todos os itens continuam pendentes. Nem todo item da loja tem efeitos completos.
- **Mordekaiser R NÃO implementado**. O DOM/CSS de alta prioridade é infraestrutura da futura viewport, sem batalha simulada, clone geométrico ou tela falsa.
