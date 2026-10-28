const $=id=>document.getElementById(id), canvas=$('map'),ctx=canvas.getContext('2d');
const map=new Image();map.src='/assets/mapa_atualizado.jpg';map.onload=()=>draw();
let state=null,stream=null,sequence=1,mode='move',lastRevision=-1,selectedUnitId=null,selectedUnitIds=[],resultDismissedFor=null;
let reactionStepsV453Dev64=[],reactionKeyV453Dev64=null;
let planningStepsV453Dev65=[];
let boardKitsV453={},boardSlotV453='Q';
let shopCatalog=[],shopReference=[],selectedShopItemId=null,shopUnitId=null,shopQuote=null,shopQuotePending='',networkLock=Promise.resolve();
const announce=t=>{$('feed').textContent=t;};
async function fetchBoardKitsV453(){try{
 const response=await fetch('/api/kits',{credentials:'same-origin'});if(!response.ok)return;
 const x=await response.json();boardKitsV453=x.kits||{};
 if(state)renderBoardSlotsV453(state);
}catch(e){announce('Habilidades: '+e.message);}}
async function api(path,payload){const res=await fetch('/api/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),credentials:'same-origin'});const data=await res.json();if(!res.ok)throw Error(data.reason||'Falha');return data;}
function setMode(m){mode=m;announce('Modo: '+({move:'Mover',ward:'Ward',q:'Q',skill:'Skill '+boardSlotV453}[mode]||m));}
$('create').onclick=async()=>{try{render(await api('create',{maxSeats:2}));await fetchShop();await fetchBoardKitsV453();connect();}catch(e){announce(e.message);}};
$('join').onclick=async()=>{try{render(await api('join',{roomId:$('code').value.trim().toLowerCase()}));await fetchShop();await fetchBoardKitsV453();connect();}catch(e){announce(e.message);}};
$('ready').onclick=async()=>{try{const r=await api('ready',{});announce('Turno confirmado. '+r.phase);}catch(e){announce(e.message);}};
$('move').onclick=()=>setMode('move');$('ward').onclick=()=>setMode('ward');$('q').onclick=()=>setMode('q');
$('retreat').onclick=()=>sendGroup('order.retreat',{});
$('mercury').onclick=()=>{const u=state?.projection?.units?.find(v=>v.id===(state?.pendingDecision?.unitId||selectedUnitId));const item=u?.items?.includes('mercurial_scimitar')?'mercurial_scimitar':'quicksilver_sash';return send('item.activate',{itemId:item},u?.id||selectedUnitId);};
// Dev66: independent self-cast in planning; does not require an enemy target.
$('cleansePvp').onclick=()=>send('summoner.queue',{type:'cleanse'},selectedUnitId);
$('unitselect').onchange=()=>{selectedUnitIds=[...$('unitselect').selectedOptions].map(o=>o.value);selectedUnitId=selectedUnitIds[0]||null;if(state){renderPlanningComboV453Dev65(state);renderBoardSlotsV453(state);}draw();};
function setShopOpen(open){$('shopOverlayPvp').classList.toggle('hidden',!open);$('shopTogglePvp').setAttribute('aria-expanded',String(open));if(open){renderShopUI();$('shopChampionPvp').focus();}}
$('shopTogglePvp').onclick=()=>setShopOpen($('shopOverlayPvp').classList.contains('hidden'));
$('shopClosePvp').onclick=()=>setShopOpen(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('shopOverlayPvp').classList.contains('hidden'))setShopOpen(false);});
$('shopChampionPvp').onchange=()=>{shopUnitId=$('shopChampionPvp').value;shopQuote=null;renderShopUI();};
$('shopScopePvp').onchange=()=>{selectedShopItemId=null;shopQuote=null;renderShopUI();};
function renderReactionV453Dev64(v){
 const d=v.pendingDecision,key=d?`${v.roomId}:${v.round}:${d.kind}:${d.unitId}:${d.enemyId}`:null;
 if(key!==reactionKeyV453Dev64){reactionStepsV453Dev64=[];reactionKeyV453Dev64=key;}
 if(!d)return;
 const isDuel=d.kind==='duel_request';$('reactionComposerV453Dev64').classList.toggle('hidden',isDuel);
 if(isDuel)return;
 const enemy=(v.projection?.units||[]).filter(u=>u.team!==v.team&&u.hp>0);
 const targets=new Map(enemy.map(u=>[u.id,u.champ+' · '+u.id]));
 // An aggressor may be briefly hidden in brush. The server gives only its ID
 // to the actual defender; do not reveal the aggressor's location or inventory.
 if(d.enemyId&&!targets.has(d.enemyId))targets.set(d.enemyId,'Agressor (posição oculta)');
 const select=$('reactionTargetPvp'),previous=select.value;
 select.replaceChildren(...[...targets].map(([id,label])=>{const option=document.createElement('option');option.value=id;option.textContent=label;return option;}));
 select.value=targets.has(previous)?previous:targets.has(d.enemyId)?d.enemyId:targets.keys().next().value||'';
 const champion=v.projection?.units?.find(u=>u.id===d.unitId);
 for(const button of $('reactionSlotsPvp').querySelectorAll('[data-reaction-slot]')){
  const slot=button.dataset.reactionSlot;
  button.disabled=(slot.length===1&&!(champion?.skillRanks?.[slot]>0))||(slot.length>1&&!(champion?.summonerSlots||[]).includes(slot.toLowerCase()))||reactionStepsV453Dev64.length>=12;
 }
 $('reactionStepsPvp').textContent=reactionStepsV453Dev64.length?reactionStepsV453Dev64.join(' → '):'Sem etapas (resposta básica)';
}
$('reactionSlotsPvp').onclick=e=>{const slot=e.target.closest('[data-reaction-slot]')?.dataset.reactionSlot;
 if(!slot||!state?.pendingDecision||reactionStepsV453Dev64.length>=12)return;
 reactionStepsV453Dev64.push(slot);renderReactionV453Dev64(state);
};
$('reactionClearPvp').onclick=()=>{reactionStepsV453Dev64=[];if(state)renderReactionV453Dev64(state);};
async function reaction(response){
 if(!state?.pendingDecision)return;const d=state.pendingDecision;
 if(d.kind==='duel_request')return send('decision.duel',{response},d.unitId);
 const targetId=$('reactionTargetPvp').value||d.enemyId;
 if(!targetId)return announce('Nenhum alvo de resposta disponível.');
 return send('decision.reaction',{targetId,response,steps:[...reactionStepsV453Dev64]},d.unitId);
}
$('defend').onclick=()=>reaction('defend');$('reactretreat').onclick=()=>reaction('retreat');$('reactfight').onclick=()=>reaction('fight');
// Dev65: regular planned attacks are composed BEFORE the two players ready.
// Visible enemies only; a hidden unit's coordinates/selection never appear.
function renderPlanningComboV453Dev65(v){
 const unit=v.projection?.units?.find(x=>x.id===selectedUnitId&&x.team===v.team);
 const cleanse=$('cleansePvp');cleanse.classList.toggle('hidden',!(unit?.summonerSlots||[]).includes('cleanse'));cleanse.disabled=!v.started||v.ended||v.paused||!['planning','preparation'].includes(v.phase)||v.ready?.includes(v.seatId)||!(unit?.summonerSlots||[]).includes('cleanse')||(unit?.cleanseCd||0)>(v.projection?.time||0);
 const canPlan=!!v.started&&!v.ended&&!v.paused&&['planning','preparation'].includes(v.phase)&&!v.ready?.includes(v.seatId);
 const enemies=(v.projection?.units||[]).filter(x=>x.team!==v.team&&x.hp>0&&Number.isFinite(x.x)&&Number.isFinite(x.y));
 const target=$('planningTargetPvp'),old=target.value;
 target.replaceChildren(...enemies.map(x=>{const option=document.createElement('option');option.value=x.id;option.textContent=x.champ+' · '+x.id;return option;}));
 target.value=enemies.some(x=>x.id===old)?old:(enemies[0]?.id||'');target.disabled=!canPlan||!enemies.length;
 for(const button of $('planningSlotsPvp').querySelectorAll('[data-plan-slot]')){
  const slot=button.dataset.planSlot;button.disabled=!canPlan||planningStepsV453Dev65.length>=12||(slot.length===1?!(unit?.skillRanks?.[slot]>0):!(unit?.summonerSlots||[]).includes(slot.toLowerCase()));
 }
 $('planningStepsPvp').textContent=planningStepsV453Dev65.length?planningStepsV453Dev65.join(' → '):'Selecione QWER e feitiços (até 12)';
 $('planningClearPvp').disabled=!canPlan||!planningStepsV453Dev65.length;
 $('planningSubmitPvp').disabled=!canPlan||!enemies.length||!planningStepsV453Dev65.length;
}
$('planningSlotsPvp').onclick=e=>{const slot=e.target.closest('[data-plan-slot]')?.dataset.planSlot;
 if(!slot||e.target.disabled||planningStepsV453Dev65.length>=12)return;planningStepsV453Dev65.push(slot);if(state)renderPlanningComboV453Dev65(state);
};
$('planningClearPvp').onclick=()=>{planningStepsV453Dev65=[];if(state)renderPlanningComboV453Dev65(state);};
$('planningSubmitPvp').onclick=()=>{const id=$('planningTargetPvp').value;
 if(!id||!planningStepsV453Dev65.length)return;return send('order.combo',{targetId:id,steps:[...planningStepsV453Dev65]},selectedUnitId);
};

// Server owns ranges, fog, resource commits and the actual kit.
function selectedBoardRuleV453(slot=boardSlotV453){
 const u=state?.projection?.units?.find(x=>x.id===selectedUnitId&&x.team===state.team);
 return boardKitsV453[u?.champ]?.[slot]||null;
}
function renderBoardSlotsV453(v){
 const unit=v.projection?.units?.find(x=>x.id===selectedUnitId&&x.team===v.team);
 const can=!!v.started&&!v.ended&&!v.paused&&['planning','preparation'].includes(v.phase)&&!v.ready?.includes(v.seatId);
 const kit=boardKitsV453[unit?.champ]||null;
 for(const b of $('boardSkillToolbarV453').querySelectorAll('[data-board-slot]')){
  const slot=b.dataset.boardSlot,rule=kit?.[slot];
  b.disabled=!can||!rule||rule.passiveOnly||!(unit?.skillRanks?.[slot]>0);
  b.setAttribute('aria-pressed',String(boardSlotV453===slot));
  b.title=rule?.passiveOnly?'Passiva não conjurável':rule?.shape||'Kit em auditoria';
 }
 const select=$('boardTargetV453'),prior=select.value;
 const targets=(v.projection?.units||[]).filter(x=>x.hp>0&&
  (x.team===v.team||(Number.isFinite(x.x)&&Number.isFinite(x.y))));
 select.replaceChildren(...targets.map(x=>{const o=document.createElement('option');
  o.value=x.id;o.textContent=(x.team===v.team?'ALIADO · ':'INIMIGO · ')+x.champ;return o;}));
 select.value=targets.some(x=>x.id===prior)?prior:targets.find(x=>x.team!==v.team)?.id||'';
 const rule=selectedBoardRuleV453(),targeted=rule&&['target_enemy','target_ally'].includes(rule.shape);
 const recast=(v.projection?.boardRecastsV453Dev69?.[selectedUnitId]||[])
  .find(x=>x.slot===boardSlotV453&&x.expiresAt>(v.projection?.time||0));
 $('boardRecastV453').classList.toggle('hidden',!recast);
 $('boardRecastV453').disabled=!can||!recast;
 $('boardCastTargetV453').disabled=!can||!targeted||!select.value;
 $('boardTargetV453').disabled=!can||!targeted;
 $('boardSkillHintV453').textContent=!unit?'Selecione campeão':!kit?
  'Kit ainda em auditoria na interface · combos continuam disponíveis':rule?
  unit.champ+' '+boardSlotV453+' · '+rule.shape+' · protótipo tático':'Selecione Q/W/E/R';
}
function boardSelfV453(rule){
 return ['self','circle_ally','global_ally'].includes(rule.shape)||
  (rule.shape==='circle_enemy'&&rule.originSelf);
}
$('boardSkillToolbarV453').onclick=e=>{
 const b=e.target.closest('[data-board-slot]');if(!b||b.disabled)return;
 const slot=b.dataset.boardSlot;boardSlotV453=slot;const rule=selectedBoardRuleV453(slot);
 if(!rule)return;
 if(boardSelfV453(rule)){send('skill.self',{slot},selectedUnitId);setMode('move');}
 else setMode('skill');
 if(state)renderBoardSlotsV453(state);
};
$('boardRecastV453').onclick=()=>{
 const can=(state?.projection?.boardRecastsV453Dev69?.[selectedUnitId]||[])
  .some(x=>x.slot===boardSlotV453);
 if(!can)return;
 return send('skill.self',{slot:boardSlotV453},selectedUnitId);
};
$('boardCastTargetV453').onclick=()=>{
 const rule=selectedBoardRuleV453(),id=$('boardTargetV453').value;
 if(!rule||!['target_enemy','target_ally'].includes(rule.shape)||!id)return;
 const target=state?.projection?.units?.find(x=>x.id===id);
 if(!target||(rule.shape==='target_enemy')===(target.team===state.team)){
  announce('Alvo incompatível com a habilidade');return;
 }
 return send('skill.targeted',{slot:boardSlotV453,targetId:id},selectedUnitId);
};

canvas.onclick=async e=>{const r=canvas.getBoundingClientRect();const point={x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};
 if(mode==='move')await sendGroup('order.move',{point});
 else if(mode==='ward')await sendGroup('order.ward',{point,wardType:'stealth'});
 else if(mode==='skill'){
  const rule=selectedBoardRuleV453();
  if(!rule){announce('Habilidade indisponível no catálogo tático');return;}
  const kind=boardSlotV453==='R'?'skill.ultimate':
   ['line_enemy','cone_enemy'].includes(rule.shape)?'skill.directional':'skill.ground';
  await send(kind,kind==='skill.ultimate'?{point}:{slot:boardSlotV453,point},selectedUnitId);
 }else await sendGroup('skill.directional',{point,slot:'Q'});
};
async function send(kind,payload,unitId=selectedUnitId){
 // Serializes orders from multi-selection: one monotonic sequence per human session.
 const operation=networkLock.then(async()=>{
  if(!state?.started){announce('Aguardando adversário.');return {ok:false};}
  try{const r=await api('action',{sequence,kind,payload,...(unitId?{unitId}:{})});sequence++;announce('Ação aceita: '+r.kind+' • '+r.unitId);return r;}
  catch(e){announce('Ação rejeitada: '+e.message);return {ok:false,reason:e.message};}
 });networkLock=operation.then(()=>{},()=>{});return operation;
}
async function sendGroup(kind,payload){const ids=[...new Set(selectedUnitIds.length?selectedUnitIds:[selectedUnitId])].filter(Boolean);
 for(const id of ids)await send(kind,payload,id);
}
async function fetchShop(){try{const response=await fetch('/api/shop',{credentials:'same-origin'});if(!response.ok)return;const data=await response.json();shopCatalog=data.items||[];shopReference=data.referenceItems||[];renderShopUI();}catch(e){announce('Catálogo indisponível: '+e.message);}}
function shopUnit(){return state?.projection?.units?.find(u=>u.id===shopUnitId&&u.team===state.team);}
function quoteKey(u,id){return [u?.id,id,u?.gold,(u?.items||[]).join(','),state?.phase,state?.ready?.includes(state?.seatId),state?.paused,state?.ended].join('|');}
async function fetchQuote(u,item){if(!u||!item||item.playable===false)return;const key=quoteKey(u,item.id);if(shopQuote?.key===key||shopQuotePending===key)return;shopQuotePending=key;try{const res=await fetch('/api/shop/quote?unitId='+encodeURIComponent(u.id)+'&itemId='+encodeURIComponent(item.id),{credentials:'same-origin'});const q=await res.json();if(res.ok&&q.ok)shopQuote={key,...q};}catch{}finally{if(shopQuotePending===key)shopQuotePending='';if(shopUnit()?.id===u.id&&selectedShopItemId===item.id)renderShopUI();}}
function estimateCost(item,u){if(!item||!u)return 0;const inventory=[...(u.items||[])],byId=new Map(shopCatalog.map(x=>[x.id,x]));let credit=0;
 const visit=(id,path=[])=>{if(path.includes(id)||path.length>12)return;const pos=inventory.indexOf(id);
  if(pos>=0){inventory.splice(pos,1);credit+=byId.get(id)?.cost||0;return;}
  for(const child of byId.get(id)?.recipe||[])visit(child,[...path,id]);};
 for(const id of item.recipe||[])visit(id,[item.id]);return Math.max(0,item.cost-credit);
}
function renderShopUI(){
 const units=(state?.projection?.controlledUnitIds||[]).map(id=>state.projection.units.find(u=>u.id===id&&u.team===state.team)).filter(Boolean);
 if(!units.some(u=>u.id===shopUnitId))shopUnitId=units[0]?.id||null;
 const champion=$('shopChampionPvp');if(champion.options.length!==units.length||units.some((u,i)=>champion.options[i]?.value!==u.id)){
  champion.replaceChildren(...units.map(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=u.role+' · '+u.champ;return o;}));
 }champion.value=shopUnitId||'';
 const u=shopUnit(),referenceMode=$('shopScopePvp').value==='reference',source=referenceMode?shopReference:shopCatalog;
 const sel=$('shopListPvp'),query=$('shopSearchPvp').value.trim().toLocaleLowerCase('pt-BR');
 const list=source.filter(i=>(referenceMode||!i.roleLock||i.roleLock===u?.role)&&(!query||i.name.toLocaleLowerCase('pt-BR').includes(query))).slice(0,100);
 if(!selectedShopItemId||!list.some(x=>x.id===selectedShopItemId)){selectedShopItemId=list[0]?.id||null;shopQuote=null;}
 sel.replaceChildren(...list.map(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=i.name+' · '+i.cost+'g'+(referenceMode?' · referência':'');return o;}));sel.value=selectedShopItemId||'';
 const item=source.find(x=>x.id===selectedShopItemId),canPlan=!!u&&!!state?.started&&['preparation','planning'].includes(state.phase)&&!state.ready?.includes(state.seatId)&&!state.paused&&!state.ended;
 const canShop=canPlan&&!!state?.projection?.shopInRangeV453Dev60?.[u.id];
 const key=quoteKey(u,item?.id),quote=shopQuote?.key===key?shopQuote:null;
 const rest=quote?quote.remaining:estimateCost(item,u);
 $('shopGoldPvp').textContent=u?Math.floor(u.gold)+'g':'—';
 $('shopStatus').textContent=u?u.champ+' · ouro '+Math.floor(u.gold)+'g · '+(u.items?.length||0)+'/6 espaços · '+(canShop?'FONTE · compras liberadas':'FORA DA FONTE · apenas programar'):'Selecione um dos seus cinco campeões';
 $('shopRecipePvp').textContent=item?referenceMode?'Item de referência Riot · ainda não vinculado ao motor':'Preço '+item.cost+'g · desconto '+(item.cost-rest)+'g · a pagar '+rest+'g'+(quote?' (servidor)':' (prévia)'):'Nenhum item disponível';
 const tree=$('shopRecipeTreePvp');tree.replaceChildren();for(const id of item?.recipe||[]){
  const part=shopCatalog.find(i=>i.id===id),r=shopReference.find(i=>i.id===id),ref=part||r;
  const b=document.createElement('button');b.type='button';b.textContent=(ref?.name||id)+(part?' · '+part.cost+'g':'');b.disabled=referenceMode||!part;b.title='Selecionar componente';b.onclick=()=>{$('shopScopePvp').value='playable';selectedShopItemId=id;renderShopUI();};tree.append(b);
 }
 const labels={hp:'Vida',mana:'Mana',ad:'Dano de ataque',ap:'Poder de habilidade',armor:'Armadura',mr:'Resistência mágica',attackSpeedPct:'Velocidade de ataque %',moveSpeed:'Movimento',critChance:'Crítico',abilityHaste:'Aceleração de habilidade',lifeSteal:'Roubo de vida',omnivamp:'Vampirismo universal'};
 $('shopStatsPvp').textContent=referenceMode?'Sem efeitos de combate certificados':Object.entries(item?.stats||{}).map(([k,v])=>(labels[k]||k)+': '+v).join(' · ')||'Atributos não informados';
 $('shopBuyPvp').disabled=!canShop||!item||referenceMode||rest>u.gold||(quote&&!quote.canBuy);
 $('shopQueuePvp').disabled=!canPlan||!item||referenceMode;
 const undo=state?.projection?.shopUndoStateV453Dev62?.[u?.id];
 $('shopUndoPvp').disabled=!canShop||!undo?.ok;
 $('shopUndoPvp').title=undo?.ok?'Desfazer '+(undo.kind==='purchase'?'compra':'venda')+' sem depreciação':undo?.reason||'Indisponível';
 $('shopUndoStatusPvp').textContent=undo?.ok?'Desfazer disponível: '+(undo.kind==='purchase'?'compra':'venda')+' de '+(shopCatalog.find(i=>i.id===undo.itemId)?.name||undo.itemId)+' · reverter '+undo.amount+'g':('Desfazer bloqueado · '+(undo?.reason||'nenhuma operação elegível'));
 const inv=$('shopInventoryPvp');inv.replaceChildren();for(const [index,id] of (u?.items||[]).entries()){
  const row=shopCatalog.find(x=>x.id===id),b=document.createElement('button');b.type='button';b.disabled=!canShop||row?.refund==null||!!row?.roleLock||!!row?.tags?.includes('quest')||!!row?.tags?.includes('trinket');
  b.title=row?.refund==null?'Revenda não autorizada':('Comprado por '+row.cost+'g · revenda '+row.refund+'g');
  const label=document.createElement('span');label.textContent=row?.name||id;const price=document.createElement('b');price.textContent=row?.refund==null?'Indisponível':'Vender +'+row.refund+'g';b.append(label,price);
  b.onclick=()=>send('item.sell',{index},u.id);inv.append(b);
 }if(!(u?.items||[]).length)inv.textContent='Inventário vazio';
 const queues=$('shopQueuesPvp');queues.replaceChildren();if(u?.purchaseQueue?.length){for(const [index,id] of u.purchaseQueue.entries()){
  const b=document.createElement('button');b.type='button';b.textContent=(shopCatalog.find(i=>i.id===id)?.name||id)+' ×';b.disabled=!canPlan;b.onclick=()=>send('item.cancelQueue',{index},u.id);queues.append(b);
 }}else queues.textContent='Nenhuma compra programada';
 if(u&&item&&!referenceMode&&!quote)void fetchQuote(u,item);
}
$('shopListPvp').onchange=()=>{selectedShopItemId=$('shopListPvp').value;shopQuote=null;renderShopUI();};
$('shopSearchPvp').oninput=()=>renderShopUI();
$('shopBuyPvp').onclick=()=>{if(selectedShopItemId)send('item.buy',{itemId:selectedShopItemId},shopUnitId);};
$('shopQueuePvp').onclick=()=>{if(selectedShopItemId)send('item.queue',{itemId:selectedShopItemId},shopUnitId);};
$('shopUndoPvp').onclick=()=>send('item.undo',{},shopUnitId);
function render(v){state=v;sequence=Math.max(sequence,v.nextSequence||1);
 const ids=v.projection?.controlledUnitIds||[v.unitId];
 selectedUnitIds=selectedUnitIds.filter(id=>ids.includes(id));if(!selectedUnitIds.length)selectedUnitIds=[ids[0]||v.unitId];
 selectedUnitId=selectedUnitIds[0];
 const select=$('unitselect'),old=select.value;
 if(select.options.length!==ids.length||ids.some((id,i)=>select.options[i]?.value!==id)){
  select.replaceChildren(...ids.map(id=>{const o=document.createElement('option');o.value=id;o.textContent=id.split('_').slice(1).join(' ');return o;}));
 }
 for(const option of select.options)option.selected=selectedUnitIds.includes(option.value);$('lobby').classList.add('hidden');$('match').classList.remove('hidden');$('title').textContent='Sala '+v.roomId;$('codeview').textContent='Código: '+v.roomId;$('seat').textContent=v.team.toUpperCase()+' • 5 CAMPEÕES';$('phase').textContent=v.phase;$('time').textContent='T '+(v.projection?.time??0)+'s / Rodada '+(v.round??1);$('status').textContent='Conectado • '+v.connected+'/'+v.maxSeats;
 $('decision').classList.toggle('hidden',!v.pendingDecision);if(v.pendingDecision)$('decisioninfo').textContent='Defensor: '+v.pendingDecision.unitId+' • '+v.pendingDecision.kind;renderReactionV453Dev64(v);
 $('mercury').disabled=!v.started||!v.projection?.units?.find(u=>u.id===(v.pendingDecision?.unitId||selectedUnitId))?.items?.some(id=>['mercurial_scimitar','quicksilver_sash'].includes(id));
 $('ready').disabled=!v.started||v.ready?.includes(v.seatId)||v.phase==='executing'||v.paused||v.ended;
 // V4.5.3-dev63: the winner is a server-authoritative public result only
 // after the Nexus is actually destroyed; no speculative client victory.
 const finalResult=!!v.ended&&['blue','red'].includes(v.winner);
 const result=$('pvpResultOverlay');result.classList.toggle('hidden',!finalResult||resultDismissedFor===v.roomId);
 if(finalResult){const won=v.winner===v.team;
  $('pvpResultTitle').textContent=won?'VITÓRIA':'DERROTA';
  $('pvpResultTitle').classList.toggle('loss',!won);
  $('pvpResultDetails').textContent='Nexus '+(v.winner==='blue'?'vermelho':'azul')+' destruído • '+Math.floor((v.projection?.time||0)/60)+':'+String((v.projection?.time||0)%60).padStart(2,'0')+' de partida';
  if(!$('shopOverlayPvp').classList.contains('hidden'))setShopOpen(false);
 }
 $('shopTogglePvp').disabled=!!v.ended;
 $('info').textContent=`Equipe: ${v.team} • Controlando: ${selectedUnitId} (${ids.length} unidades) • ${v.connected}/${v.maxSeats} conectados • ${v.paused?'Decisão pendente no motor':v.ended?'Partida terminada':v.phase}`;
 if(!v.started)announce('Compartilhe o código '+v.roomId+' com o segundo jogador.');
 renderShopUI();renderPlanningComboV453Dev65(v);renderBoardSlotsV453(v);draw();}
$('pvpResultContinue').onclick=()=>{resultDismissedFor=state?.roomId;$('pvpResultOverlay').classList.add('hidden');};
function connect(){if(stream)stream.close();stream=new EventSource('/api/stream');stream.addEventListener('state',e=>{try{const v=JSON.parse(e.data);if(v.revision>=lastRevision){lastRevision=v.revision;render(v);}}catch{}});stream.onerror=()=>{$('status').textContent='Reconectando…';};}
function draw(){ctx.fillStyle='#13211c';ctx.fillRect(0,0,800,800);if(map.complete&&map.naturalWidth)ctx.drawImage(map,0,0,800,800);
 if(!state?.projection)return;const p=state.projection;
 for(const v of p.wards||[]){ctx.fillStyle=v.team==='blue'?'#5eceff':'#ef756c';ctx.fillRect(v.x*800-4,v.y*800-4,8,8);}
 for(const v of p.units||[]){ctx.beginPath();ctx.arc(v.x*800,v.y*800,v.id===selectedUnitId?12:7,0,Math.PI*2);ctx.fillStyle=v.team==='blue'?'#49b9ff':'#e46863';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=v.id===selectedUnitId?'#f7d485':'#131b1e';ctx.stroke();if(v.id===selectedUnitId){ctx.fillStyle='#fff2c4';ctx.font='16px system-ui';ctx.fillText(v.champ,v.x*800+13,v.y*800-8);}}
}
try{const res=await fetch('/api/session',{credentials:'same-origin'});if(res.ok){render(await res.json());await fetchShop();await fetchBoardKitsV453();connect();}}catch{}
