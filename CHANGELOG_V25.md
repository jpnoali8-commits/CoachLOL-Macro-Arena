# CoachLOL v2.5 — UIX Hextech compacta, Data Dragon e fila QWER

Data: 2026-10-25 — alfa experimental offline-first.

## Implementado

1. **Combate:** `resolveQueuedCombos` processa a sequência Q/W/E/R independentemente do tempo de ataque básico. Cada habilidade usa rank, mana, cooldown, alcance, visão e consentimento de duelo. Um cooldown ou mana insuficiente mantém a etapa em espera, sem pular nem reiniciar a sequência. AA continua normalmente quando habilitado.
2. **HUD:** quatro cards QWER com imagem oficial quando acessível, letra/rank/estado/cooldown como fallback, QWER desabilitado sem aprendizado, sequência de luta mostra progresso (`n/N`) e o próximo passo.
3. **Assets:** `riot-assets.js` usa versão Data Dragon **16.21.1**, localizada `pt_BR`, retratos de champion, ícones de feitiços e metadata de habilidades. A fonte de referência é a documentação oficial; os dados carregados são cosméticos, não alteram fórmulas do jogo.
4. **Modo offline:** se o CDN não estiver disponível, imagem do campeão cai para `assets/portraits/{nome}.webp` e `{nome}.svg`. As habilidades caem para letra/rank/cooldown legíveis. O ZIP **não** inclui download completo de ícones oficiais neste ambiente.
5. **Visual:** nova folha de estilos `styles-v25.css`, painéis preto/carvão com dourado como acento; azul/esmeralda e vermelho restritos a equipes; mana azul. Header/placar compacto, campo de ordens flutuante, grade de ações compacta, fonte e HUD menores.
6. **Docks:** arraste pelos títulos dos cards para alternar entre os menus laterais; mantém o ajuste de largura existente nas divisórias.
7. **Draft:** o Champion Select real (`draft.html`) usa `riot-assets.js` e preserva bans, picks, papéis e início de partida. Uma cópia do `champion_select.html` enviado consta em `champion_select_reference.html` como **referência visual somente**.

## Verificação

- `npm test` — contratos existentes e 5 novos cenários da fila de habilidades.
- Chromium: abertura da partida sem erros JavaScript, canvas com tamanho normal, evolução manual Q, seleções de campeões, loja e configurações.
- Chromium: Champion Select com grade de 45 campeões e sem erros JS no fluxo inicial.

## Limitações que não foram resolvidas

- **Kits QWER individuais** e passivas/danos oficiais: o motor continua usando uma fórmula abstrata. Data Dragon serve metadados estáticos e ícones; não executa a lógica de habilidades do cliente LoL.
- **Sem cache físico novo dos ícones oficiais neste ZIP** devido a indisponibilidade de acesso a arquivos do CDN durante a construção. A arte é carregada sob demanda quando houver internet. Para offline estrito, utilize o importador `tools/baixar_datadragon.mjs` em um computador com acesso à internet, verificando a licença antes de redistribuir.
- **Feitiços específicos ainda incompletos:** Heal, Ignite e TP aparecem como informação visual, mas estão desabilitados enquanto suas regras não forem implementadas. Flash, Smite e Exhaust mantêm os fluxos anteriores.
- O `champion_select_reference.html` usa Tailwind/Lucide hospedados em CDNs e é uma maquete visual, não o fluxo funcional offline; use `draft.html` para jogar.
- Sem autenticação/ranked/PDL, multiplayer autoritativo ou garantias de equilíbrio competitivo.

## Política de assets

Referência: https://developer.riotgames.com/docs/lol e https://ddragon.leagueoflegends.com/api/versions.json.
O CoachLOL não é produto oficial da Riot Games nem tem autorização implícita de usar personagens em lançamento público. Revise os direitos de uso e a política de produtos de terceiros antes de distribuir.

Para preparar cache opcional offline em ambiente com internet:

```bash
node tools/baixar_datadragon.mjs --abilities --roster=Ahri,Jinx,Nami,Volibear,Warwick,Vex,LeeSin
```

O jogo lê o arquivo individual de dados de habilidades local se já estiver no diretório `assets/riot/16.21.1/pt_BR/`.
