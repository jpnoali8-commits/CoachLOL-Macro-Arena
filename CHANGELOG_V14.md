# v1.4 — HUD à direita, atalhos, recall/loja e perspectiva

Data: 25/10/2026.

## Interface
- Removido o painel flutuante inferior sobre o tabuleiro. O inspetor e as 12 ações ficam na coluna direita, com layout compacto, HP/mana, atributos, itens/wards, política e editor de rotas.
- Indicadores de atalhos visíveis nas ações. Após selecionar um aliado (pelo mapa ou roster): `B` recall, `4` ward, `M` mover, `R` criar rota, `F` flash, `S` parar, `A` atacar, `D` defender. `Esc` cancela a escolha de alvo. `P` alterna perspectiva.
- Comandos de ward e flash só são executados após clicar no destino. A indicação do mouse mostra a escolha de ward; `4` não consome ward sem destino.
- Indicador da ação/estado atual e cargas restantes de sentinela.
- Responsividade da HUD em telas menores e controles de câmera no topo.

## Regras
- Recall mantém a canalização de 8 s e desloca o campeão à fonte. Ao concluir, o motor emite `recall_complete` com `unitId`; a UI seleciona aquele campeão e abre a loja.
- Após recall, `awaitingShop=true` impede follow automático da lane e jungle. Fechar a loja deixa o campeão na fonte; apenas comando explícito ou botão **Seguir para a lane** libera o retorno.
- Para colocar ward: primeiro `4`/botão Wardar, depois clique na coordenada exata do mapa. O motor valida cargas/colisão, aproxima o campeão se o ponto estiver fora de alcance (~625 unidades de mundo) e coloca a sentinela **no ponto clicado**. A ordem atravessa janelas de simulação.
- O método `leaveShop` valida a saída explícita para o modo local.

## Perspectiva
- Tabuleiro com perspectiva trapezoidal 2.5D inicial de 32%, ajustável de 0 a 55% por slider.
- Botão **Perspectiva 2.5D** / tecla `P` alterna entre vista superior e inclinada; `Centralizar` restaura os valores padrão.
- Projeção e projeção inversa usam o mesmo modelo matemático, incluindo rotação; entidades/ward/fog/click permanecem nas coordenadas originais do atlas. **Nenhuma máscara ou geometria 4096 × 4096 é alterada.**
- Mapa e fog são compostos em um atlas único antes do desenho projetivo para evitar linhas nas juntas.

## Validação
- `npm test`: 30 testes de core, 8 live, 6 novos de HUD/regras = **44 testes**.
- Navegador Chromium: a rede local e `file://` foram bloqueados no ambiente de execução; testes de interface executados com versão temporária totalmente inline (`page.set_content`), sem alterações no pacote final. Verificados: inicialização sem JS errors, 12 ações, painel direito visível, B/4/P, ward clicada e abertura automática da loja após recall.
- Gate de navegação real HTTP offline em máquina do usuário segue recomendado antes de distribuição pública. Ainda não é multiplayer autoritativo, nem reprodução integral das regras Riot.
