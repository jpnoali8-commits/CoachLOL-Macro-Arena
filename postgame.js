/* CoachLOL V4.5.2d-4-dev7 — pós-jogo: histórico do motor e telemetria
   somente de eventos realmente resolvidos; sem geração de dados artificiais.
   Compatível com snapshots antigos sem telemetria via estados não disponíveis. */
(function(root){
 'use strict';
 const TEAM=['blue','red'], ROLES=['TOP','JG','MID','ADC','SUP'];
 const fmtTime=s=>String(Math.floor(Math.max(0,s||0)/60)).padStart(2,'0')+':'+String(Math.floor(Math.max(0,s||0)%60)).padStart(2,'0');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=(v)=>Number.isFinite(+v)?Math.max(0,Number(v)):0;
 const sum=(units,key)=>units.reduce((total,u)=>total+n(u[key]),0);
 const LABELS={kills:'Abates',deaths:'Mortes',assists:'Assistências',cs:'CS',gold:'Ouro disponível',level:'Nível',wardsActive:'Sentinelas ativas',kda:'Participação em abates (%)',
  goldEarned:'Ouro ganho (exclui saldo inicial)',goldSpent:'Ouro gasto',goldRefunded:'Ouro reembolsado',
  damageDealt:'Dano à vida de campeões',damageTaken:'Dano sofrido de campeões',
  damagePhysical:'Dano físico a campeões',damageMagic:'Dano mágico a campeões',damageTrue:'Dano verdadeiro a campeões',
  wardsPlaced:'Sentinelas colocadas',wardsDestroyed:'Sentinelas destruídas'};
 const METRICS=['kills','assists','deaths','cs','gold','level','wardsActive','kda',
  'goldEarned','goldSpent','goldRefunded','damageDealt','damageTaken','damagePhysical','damageMagic','damageTrue','wardsPlaced','wardsDestroyed'];
 const ADVANCED=['goldEarned','goldSpent','goldRefunded','damageDealt','damageTaken','damagePhysical','damageMagic','damageTrue','wardsPlaced','wardsDestroyed'];
 const CATEGORIES={combat:['kills','deaths','assists','kda','damageDealt','damageTaken','damagePhysical','damageMagic','damageTrue'],
  economy:['cs','gold','level','goldEarned','goldSpent','goldRefunded'],vision:['wardsActive','wardsPlaced','wardsDestroyed']};
 const teamLabel=t=>t==='blue'?'AZUL':'VERMELHO';
 function unitRow(match,u){
  const t=u.postgameV452d4Dev7,complete=!!t?.complete;
  const dealt=t?.damageDealtChampions||{},taken=t?.damageTakenChampions||{};
  return {id:u.id,team:u.team,champ:u.champ,role:u.role,level:n(u.level),kills:n(u.kills),deaths:n(u.deaths),assists:n(u.assists),cs:n(u.cs),gold:n(u.gold),
   items:Array.isArray(u.items)?u.items.slice(0,6):[],rune:u.runePageV43||'none',telemetryComplete:complete,
   goldEarned:complete?n(t.goldEarned):null,goldSpent:complete?n(t.goldSpent):null,goldRefunded:complete?n(t.goldRefunded):null,
   damageDealt:complete?n(dealt.physical)+n(dealt.magic)+n(dealt.true):null,
   damageTaken:complete?n(taken.physical)+n(taken.magic)+n(taken.true):null,
   damagePhysical:complete?n(dealt.physical):null,damageMagic:complete?n(dealt.magic):null,damageTrue:complete?n(dealt.true):null,
   wardsPlaced:complete?n(t.wardsPlaced):null,wardsDestroyed:complete?n(t.wardsDestroyed):null,
   wardsActive:(match.wards||[]).filter(w=>w.owner===u.id&&w.hp>0&&(w.until==null||w.until>match.gameTime)).length};
 }
 function model(match){
  const players=(match.units||[]).map(u=>unitRow(match,u)).sort((a,b)=>TEAM.indexOf(a.team)-TEAM.indexOf(b.team)||ROLES.indexOf(a.role)-ROLES.indexOf(b.role));
  const telemetryAvailable=players.every(p=>p.telemetryComplete);
  const rawSamples=match.postgameTimelineV452d4Dev7?.samples||[];
  const samples=telemetryAvailable?rawSamples.filter(s=>Number.isFinite(s.time)&&s.players&&players.every(p=>s.players[p.id])).map(s=>({
   time:s.time,players:s.players,
   teams:Object.fromEntries(TEAM.map(t=>[t,{goldEarned:players.filter(p=>p.team===t).reduce((v,p)=>v+n(s.players[p.id].goldEarned),0),
    goldOnHand:players.filter(p=>p.team===t).reduce((v,p)=>v+n(s.players[p.id].goldOnHand),0),
    cs:players.filter(p=>p.team===t).reduce((v,p)=>v+n(s.players[p.id].cs),0)}]))
  })):[];
  const teams=TEAM.map(team=>{
   const u=players.filter(p=>p.team===team);
   const original=match.teams?.[team]||{};
   const kills=n(original.kills ?? sum(u,'kills'));
   const ownStructures=(match.structures||[]).filter(s=>s.team===team);
   return {team,kills,deaths:sum(u,'deaths'),assists:sum(u,'assists'),cs:sum(u,'cs'),gold:sum(u,'gold'),
    wardsActive:sum(u,'wardsActive'),towersDestroyed:(match.structures||[]).filter(s=>s.team!==team&&s.type==='tower'&&!s.alive).length,
    ownTowersAlive:ownStructures.filter(s=>s.type==='tower'&&s.alive).length,
    objectives:(match.objectiveLedgerV44||[]).filter(o=>o.owner===team&&['dragon','baron','herald','voidgrubs','voidgrub_individual'].includes(o.objective)).length,
    players:u};
  });
  const killsByTeam=Object.fromEntries(teams.map(t=>[t.team,t.kills]));
  for(const p of players)p.kda=(p.kills+p.assists)/(Math.max(1,killsByTeam[p.team]))*100;
  const objectiveEvents=(match.objectiveLedgerV44||[]).filter(o=>o&&o.time>=0&&o.owner&&o.objective).map(o=>({time:o.time,team:o.owner,
   type:o.objective,description:({dragon:'Dragão',baron:'Barão',herald:'Arauto',voidgrubs:'Vastilarvas',voidgrub_individual:'Vastilarva'})[o.objective]||o.objective,
   finisher:o.finisherId||null,smiteSecured:!!o.smiteSecured}));
  const recentKills=(match.events||[]).filter(e=>e.kind==='death').map(e=>({time:e.time,team:null,type:'death',description:e.text,unitId:e.unitId}));
  const timeline=[...objectiveEvents,...recentKills].sort((a,b)=>a.time-b.time||String(a.description).localeCompare(String(b.description),'pt'));
  return {players,teams,timeline,samples,telemetryAvailable,
   winner:match.winner,gameTime:n(match.gameTime),eventHistoryLimited:(match.events||[]).length>=110,
   objectiveHistoryLimited:(match.objectiveLedgerV44||[]).length>=100};
 }
 function filteredPlayers(data,filters){
  const {team='all',role='all',metric='kills',sort='desc'}=filters||{};
  const rows=data.players.filter(p=>(team==='all'||p.team===team)&&(role==='all'||p.role===role));
  return rows.sort((a,b)=>sort==='asc'?n(a[metric])-n(b[metric])||a.id.localeCompare(b.id):sort==='role'?ROLES.indexOf(a.role)-ROLES.indexOf(b.role)||TEAM.indexOf(a.team)-TEAM.indexOf(b.team):n(b[metric])-n(a[metric])||a.id.localeCompare(b.id));
 }
 function statVal(v,metric){return metric==='kda'?`${n(v).toFixed(1)}%`:Math.round(n(v)).toLocaleString('pt-BR');}
 function tag(t){return `<span class="pgPill ${t}">${teamLabel(t)}</span>`;}
 function statChip(name,value){return `<div class="pgChip"><small>${esc(name)}</small><strong>${esc(value)}</strong></div>`;}
 function cards(data){return `<div class="pgOverviewTop">${data.teams.map(t=>`<article class="pgTeamCard ${t.team}"><header>${tag(t.team)} <strong>${t.kills} <small>abates</small></strong></header><div class="pgTeamNumbers">${statChip('Assistências',t.assists)}${statChip('CS',t.cs)}${statChip('Ouro em mãos',t.gold)}${statChip('Torres destruídas',t.towersDestroyed)}</div></article>`).join('')}</div>`;}
 function scoreboard(data){
  return `<section class="pgScoreboard">${data.teams.map(t=>`<div class="pgTeamBoard"><div class="pgTeamBoardHeader">${tag(t.team)}<span>${t.kills} / ${t.deaths} / ${t.assists}</span><small>${t.cs} CS · ${t.gold} ouro em mãos</small></div><div class="pgTableScroll"><table class="pgTable"><thead><tr><th>Campeão</th><th>LVL</th><th>K / D / A</th><th>CS</th><th>Ouro</th><th>Sentinelas</th><th>Build</th></tr></thead><tbody>${t.players.map(p=>`<tr><td><div class="pgIdentity"><span class="pgAvatar">${esc((p.champ||'?').slice(0,1))}<img src="assets/portraits/${encodeURIComponent(p.champ)}.webp" alt="" onerror="this.onerror=function(){this.hidden=true};this.src='assets/portraits/${encodeURIComponent(p.champ)}.svg'"/></span><span><b>${esc(p.champ)}</b><small>${esc(p.role)}</small></span></div></td><td>${p.level}</td><td class="pgKda">${p.kills} / <span>${p.deaths}</span> / ${p.assists}</td><td>${p.cs}</td><td>${p.gold.toLocaleString('pt-BR')}</td><td>${p.wardsActive}</td><td class="pgBuild">${p.items.length?p.items.map(id=>`<span class="pgItemIcon" title="${esc(id)}"><img src="assets/ui/items/${encodeURIComponent(id)}.svg" alt="" onerror="this.hidden=true"/>${esc(String(id).slice(0,3).toUpperCase())}</span>`).join(''):'—'}</td></tr>`).join('')}</tbody></table></div></div>`).join('')}</section><p class="pgDataNote">Ouro = saldo atual, não ouro total acumulado. Sentinelas = ativas no encerramento, não pontuação de visão. Builds refletem itens finais equipados.</p>`;
 }
 function overview(data){
  const rows=data.timeline.slice(-48).reverse();
  return cards(data)+`<div class="pgSectionTitle"><h3>Objetivos e eventos</h3><p>Sequência dos acontecimentos registrados no motor</p></div><div class="pgSummaryGrid">${data.teams.map(t=>`<div class="pgMiniSummary">${tag(t.team)} <b>${t.objectives}</b><small>objetivos registrados</small></div>`).join('')}</div><div class="pgTimeline">${rows.length?rows.map(e=>`<div class="pgEvent"><time>${fmtTime(e.time)}</time>${e.team?tag(e.team):'<span>EVENTO</span>'}<span>${esc(e.description)}</span></div>`).join(''):'<div class="pgEmpty">Nenhum objetivo ou abate registrado neste período.</div>'}</div><p class="pgDataNote">${data.eventHistoryLimited?'O motor mantém apenas os 110 eventos mais recentes; os abates antigos podem não aparecer na linha do tempo. ':''}${data.objectiveHistoryLimited?'O ledger de objetivos também possui limite histórico. ':''}Não exibimos gráfico de ouro por minuto sem telemetria histórica validada.</p>`;
 }
 function graph(data,state){
  const f=state.filters,metric=METRICS.includes(f.metric)&&(data.telemetryAvailable||!ADVANCED.includes(f.metric))?f.metric:'kills';
  const options=METRICS.filter(k=>data.telemetryAvailable||!ADVANCED.includes(k)).map(key=>`<option value="${key}" ${key===metric?'selected':''}>${esc(LABELS[key])}</option>`).join('');
  const roleOptions=['all',...ROLES].map(k=>`<option value="${k}" ${f.role===k?'selected':''}>${k==='all'?'Todas as funções':k}</option>`).join('');
  const playerRows=filteredPlayers(data,f);const max=Math.max(1,...playerRows.map(p=>n(p[metric])));
  const value=p=>statVal(p[metric],metric);
  if(state.chartMode==='timeline')return timelineGraph(data,state);
  return `<div class="pgFilters"><label>Métrica<select data-pg-filter="metric" aria-label="Selecionar métrica">${options}</select></label><label>Equipe<select data-pg-filter="team"><option value="all" ${f.team==='all'?'selected':''}>Ambas</option><option value="blue" ${f.team==='blue'?'selected':''}>Azul</option><option value="red" ${f.team==='red'?'selected':''}>Vermelho</option></select></label><label>Função<select data-pg-filter="role">${roleOptions}</select></label><label>Ordenação<select data-pg-filter="sort"><option value="desc" ${f.sort==='desc'?'selected':''}>Maior primeiro</option><option value="asc" ${f.sort==='asc'?'selected':''}>Menor primeiro</option><option value="role" ${f.sort==='role'?'selected':''}>Por função</option></select></label></div>
  <div class="pgChartMode"><button data-pg-chart="players" class="active">Por campeão</button><button data-pg-chart="timeline" ${data.samples.length<2?'disabled title="Aguardando amostras do motor"':''}>Evolução temporal</button></div>
  <div class="pgSectionTitle"><h3>${esc(LABELS[metric])} por campeão</h3><p>Comparação dos dez participantes a partir dos valores finais</p></div>
  <div class="pgGraphBody">${playerRows.map(p=>`<div class="pgGraphRow" title="${esc(p.champ)}: ${value(p)}"><span class="pgGraphIdentity">${tag(p.team)}<b>${esc(p.champ)}</b><small>${esc(p.role)}</small></span><div class="pgGraphTrack"><i class="${p.team}" style="width:${Math.max(0,p[metric]?Math.round(p[metric]/max*100):0)}%"></i></div><strong>${value(p)}</strong></div>`).join('')||'<p class="pgEmpty">Sem participantes para este filtro.</p>'}</div><p class="pgDataNote">${metric==='gold'?'Ouro disponível no fim da partida; não equivale ao ouro recebido durante o jogo.':metric==='wardsActive'?'Somente sentinelas ainda ativas no encerramento.':metric==='kda'?'Participação em abates = (abates + assistências) ÷ abates totais da equipe.':'Métricas lidas dos eventos resolvidos no motor, sem valores estimados.'}</p>`;
 }
 function timelineGraph(data,state){
  const metric=['goldEarned','goldOnHand','cs'].includes(state.timeMetric)?state.timeMetric:'goldEarned';
  const names={goldEarned:'Ouro ganho acumulado',goldOnHand:'Ouro em mãos',cs:'CS acumulado'};
  const pts=data.samples;
  if(!data.telemetryAvailable||pts.length<2)return `<div class="pgChartMode"><button data-pg-chart="players">Por campeão</button><button class="active" data-pg-chart="timeline">Evolução temporal</button></div><div class="pgEmpty">Série ainda indisponível. As amostras aparecem após o primeiro minuto simulado.</div>`;
  const max=Math.max(1,...pts.flatMap(p=>TEAM.map(team=>n(p.teams[team][metric])))),minT=pts[0].time,maxT=pts.at(-1).time;
  const width=920,height=284,left=48,right=20,top=22,bottom=42;
  const x=t=>left+(t-minT)/Math.max(1,maxT-minT)*(width-left-right);
  const y=v=>top+(1-v/max)*(height-top-bottom);
  const colors={blue:'#40baf0',red:'#f16c78'};
  const lines=TEAM.map(team=>{
   if(state.filters.team!=='all'&&state.filters.team!==team)return '';
   const coords=pts.map(p=>`${x(p.time).toFixed(2)},${y(p.teams[team][metric]).toFixed(2)}`).join(' ');
   return `<polyline fill="none" stroke="${colors[team]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${coords}"/>`;
  }).join('');
  const guides=[0,.25,.5,.75,1].map(frac=>`<line x1="${left}" y1="${y(max*frac)}" x2="${width-right}" y2="${y(max*frac)}" stroke="#304151" stroke-width="1"/><text x="${left-8}" y="${y(max*frac)+4}" text-anchor="end" fill="#9eb0bd" font-size="11">${Math.round(max*frac)}</text>`).join('');
  const xLabels=pts.filter((_,i)=>i===0||i===pts.length-1||i%Math.max(1,Math.ceil(pts.length/8))===0).map(p=>`<text x="${x(p.time)}" y="${height-15}" text-anchor="middle" fill="#9eb0bd" font-size="11">${fmtTime(p.time)}</text>`).join('');
  const totals=TEAM.map(t=>({team:t,value:pts.at(-1).teams[t][metric]}));
  return `<div class="pgChartMode"><button data-pg-chart="players">Por campeão</button><button class="active" data-pg-chart="timeline">Evolução temporal</button></div><div class="pgFilters"><label>Histórico<select data-pg-filter="timeMetric">${Object.entries(names).map(([key,label])=>`<option value="${key}" ${metric===key?'selected':''}>${label}</option>`).join('')}</select></label><label>Equipe<select data-pg-filter="team"><option value="all" ${state.filters.team==='all'?'selected':''}>Ambas</option><option value="blue" ${state.filters.team==='blue'?'selected':''}>Azul</option><option value="red" ${state.filters.team==='red'?'selected':''}>Vermelho</option></select></label></div>
   <div class="pgSectionTitle"><h3>${esc(names[metric])} por tempo simulado</h3><p>${pts.length} registros efetivos · ${fmtTime(minT)}–${fmtTime(maxT)}</p></div><div class="pgTimeGraph"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução temporal por equipe: ${esc(names[metric])}">${guides}${xLabels}${lines}</svg><div class="pgTimeLegend">${totals.filter(t=>state.filters.team==='all'||t.team===state.filters.team).map(t=>`<span class="${t.team}">● ${teamLabel(t.team)} <b>${Math.round(t.value).toLocaleString('pt-BR')}</b></span>`).join('')}</div></div><p class="pgDataNote">Amostras registradas pelo motor por minuto simulado; não são interpoladas nem estimadas. ${metric==='goldEarned'?'O saldo inicial e os reembolsos não contam como ouro ganho.':''}</p>`;
 }
 function stats(data,state){
  const key=CATEGORIES[state.category]?state.category:'combat';
  const metrics=CATEGORIES[key].filter(m=>data.telemetryAvailable||!ADVANCED.includes(m));
  const rows=filteredPlayers(data,{team:state.filters.team,role:state.filters.role,metric:'kills',sort:'role'});
  const filterTeam=`<div class="pgTeamFilter">${['all','blue','red'].map(t=>`<button type="button" data-pg-team="${t}" class="${state.filters.team===t?'active':''}">${t==='all'?'Todos':teamLabel(t)}</button>`).join('')}</div>`;
  return `<div class="pgCategoryTabs" role="group" aria-label="Categoria estatística">${Object.entries({combat:'Combate',economy:'Economia',vision:'Visão'}).map(([k,label])=>`<button type="button" data-pg-category="${k}" class="${key===k?'active':''}">${label}</button>`).join('')}</div>${filterTeam}
   <div class="pgTableScroll"><table class="pgTable pgStatTable"><thead><tr><th>Campeão</th>${metrics.map(m=>`<th>${esc(LABELS[m])}</th>`).join('')}</tr></thead><tbody>${rows.map(p=>`<tr><td>${tag(p.team)} ${esc(p.champ)} <small>· ${esc(p.role)}</small></td>${metrics.map(m=>`<td>${statVal(p[m],m)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="pgDataNote">${!data.telemetryAvailable?'Esta partida não possui histórico completo; exibindo apenas métricas clássicas.':key==='vision'?'Contadores reais de sentinelas; pontuação de visão e revelaçōes fora dos wards ainda não instrumentadas.':key==='economy'?'Ouro ganho não inclui saldo inicial, e reembolsos são separados; saldo atual preservado.':'Dano causado e recebido se refere apenas à vida de campeões (não inclui dano absorvido por escudos, minions ou estruturas).'}</p>`;
 }
 function runes(data){
  const captions={none:'Não personalizada',precision:'Precisão · protótipo',sorcery:'Feitiçaria · protótipo',resolve:'Determinação · protótipo'};
  return `<div class="pgSectionTitle"><h3>Runas configuradas</h3><p>Seleções registradas no draft; sem métricas artificiais de ativação</p></div><div class="pgRuneGrid">${data.players.map(p=>`<article class="pgRuneCard">${tag(p.team)}<div><strong>${esc(p.champ)}</strong><small>${esc(p.role)}</small></div><span>${esc(captions[p.rune]||p.rune)}</span></article>`).join('')}</div><p class="pgDataNote">Os efeitos de runas ainda são protótipos. Não há contadores de dano/cura das runas para exibir no pós-jogo.</p>`;
 }
 function render(data,state){
  const tab=['scoreboard','overview','stats','graphs','runes'].includes(state.tab)?state.tab:'scoreboard';
  const labels={scoreboard:'PLACAR',overview:'VISÃO GERAL',stats:'ESTATÍSTICAS',graphs:'GRÁFICOS',runes:'RUNAS'};
  return `<div class="pgRoot"><nav class="pgTabs" role="tablist" aria-label="Abas pós-jogo">${Object.entries(labels).map(([k,v])=>`<button type="button" role="tab" data-pg-tab="${k}" aria-selected="${k===tab}" class="${k===tab?'active':''}">${v}</button>`).join('')}</nav><div class="pgPanel" role="tabpanel">${tab==='scoreboard'?scoreboard(data):tab==='overview'?overview(data):tab==='stats'?stats(data,state):tab==='graphs'?graph(data,state):runes(data)}</div></div>`;
 }
 function newState(){return {tab:'scoreboard',chartMode:'players',timeMetric:'goldEarned',category:'combat',filters:{team:'all',role:'all',metric:'kills',sort:'desc'}};}
 // Browser integration: one delegated listener, no game-state writes.
 function mount(match,host,state=newState()){
  const data=model(match);let current=state;
  const draw=()=>{host.innerHTML=render(data,current);};
  const click=e=>{
   const tab=e.target.closest('[data-pg-tab]');if(tab){current.tab=tab.dataset.pgTab;draw();return;}
   const cat=e.target.closest('[data-pg-category]');if(cat){current.category=cat.dataset.pgCategory;draw();return;}
   const team=e.target.closest('[data-pg-team]');if(team){current.filters.team=team.dataset.pgTeam;draw();return;}
   const graph=e.target.closest('[data-pg-chart]');if(graph){current.chartMode=graph.dataset.pgChart;draw();return;}
  };
  const change=e=>{const key=e.target.dataset.pgFilter;if(key){
   if(key==='timeMetric')current.timeMetric=e.target.value;
   else current.filters[key]=e.target.value;
   draw();}};
  host.addEventListener('click',click);host.addEventListener('change',change);draw();
  return {data,state:current,destroy(){host.removeEventListener('click',click);host.removeEventListener('change',change);host.innerHTML='';}};
 }
 const API={model,render,newState,filteredPlayers,fmtTime,metricLabels:LABELS,mount,timelineGraph};
 if(typeof module!=='undefined'&&module.exports)module.exports=API;
 root.CoachPostgame=API;
})(typeof window!=='undefined'?window:globalThis);
