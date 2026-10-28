# Auditoria técnica e de cobertura — CoachLOL V4.5

## Métricas geradas do código

Em 26/10/2026, `node tools/audit_content_v45.mjs` extraiu do próprio motor:

- 14 nomes de campeões com ao menos cadastro parcial de ataque/base/kit no repositório, contra um elenco real muito maior.
- 5 manifestos individuais: Nami, Lux e Vex **partial**; Jinx e Ahri **data_only**; zero kits certificados.
- 5 campeões com base e crescimento auditados; estatísticas 1–18 não abrangem os demais.
- 41 itens locais: 9 com atributos básicos conferidos e 32 provisórios/não verificados; zero itens integralmente certificados com todas as passivas e ativos.
- Três páginas de runas experimentais + ausência de página; zero runas 1:1.
- Feitiços com caminhos parciais: Flash, Smite, Incendiar, Curar, Barreira, Exaustão e Teleporte; outros requerem modelagem.

`data/content_coverage_v45.json` é a matriz máquina-legível, não uma alegação de paridade completa.

## Novos sistemas V4.5

**Vastilarvas:** agora unidades lógicas independentes, embora compartilhem um marcador de mapa e deslocamento simplificado. Dano de área/colisões reais entre 3 inimigos, AI de alvos distintos, reset complexo, sistema de combate dos Voidmites e comportamento frame-perfect continuam aproximados. A cura transitória de Defensive Measures foi adaptada como cura e decaimento em 10s (não idêntica à implementação do cliente).

**Toque do Vazio/Hunger:** o dano periódico por pilha segue referência 26.11; simulação de 1s executa 2 ticks de 0.5s. O Voidmite aliado é proxy de cerco tático, sem malha própria/minion AI oficial. A posição e a equipe do agressor devem respeitar fog.

**Arauto:** Olho capturado, trinket temporário e mercenário funcional que identifica a próxima torre legal. Montaria, ataques da traseira/olho, proteção/CC/hitbox e carga por vida restante estão deliberadamente *incompletos*. A IA não garante caminho por navmesh para o mercenário; usa aproximação direta no tabuleiro.

**Motor/privacidade:** estado observável é filtrado com `perspective(team)`; o objeto `Arena` inteiro contém dados secretos e não é seguro enviá-lo a players multiplayer. O replay V4.0 é checkpoint, ainda não reprocessa todos os comandos causalmente. Fog, modificadores de itens e efeitos externos requerem testes cruzados em V4.6–V5.x.

## Critérios de aceitação de novo campeão ou item

1. Manifesto de patch com IDs e fonte rastreável. Dados Data Dragon **não** bastam para codificar passivas, colisões ou exceções; complementar com descrições e testes.
2. Calcular status por nível, efeitos de itens, haste/cooldown por segundo de jogo, resource pool e efeitos de status de forma centralizada.
3. Testes dos alvos legais/inválidos e do deslocamento até range; não consumir mana/CD antes do cast válido; testes com 1×/2×.
4. Validar passiva, QWER, casts direcionais, recast, shields, target visibility, interrupções, tenacidade e interações com champion/item/runa/Smite.
5. Confirmar efeitos visuais em overlay sem alterar estado de jogo; fog não pode exibir intenções fora da visão.
6. Certificar somente com cobertura individual explícita e sem regressões de suites anteriores.

## Fontes públicas e patch

- Riot — patch 26.21: https://www.leagueoflegends.com/en-ph/news/game-updates/league-of-legends-patch-26-21-notes/
- Riot — patch 25.09 / única aparição das Vastilarvas: https://www.leagueoflegends.com/en-au/news/game-updates/patch-25-09-notes/
- Riot — Data Dragon / manuais de versionamento: https://developer.riotgames.com/docs/lol
- Wiki da comunidade — Voidgrub camp: https://wiki.leagueoflegends.com/en-us/Voidgrub_camp
- Wiki da comunidade — Touch of the Void: https://wiki.leagueoflegends.com/en-us/Touch_of_the_Void
- Wiki da comunidade — Rift Herald: https://wiki.leagueoflegends.com/en-us/Rift_Herald

Não foram incorporados pacotes de dados/arte oficiais completos. As fontes acima são referências para implementação, sujeitas a alterações de patch.
