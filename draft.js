/* CoachLOL Draft Flow 0.4 — offline-first, 20 seconds per selection.
   Game roles are private until match start. Public information: locked champion names.
   Alternating 5-ban flow is a trainer approximation; ranked LoL uses blind simultaneous bans.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);const ROLES=['TOP','JG','MID','ADC','SUP'];
const local=['Kennen','Khazix','Ekko','Vayne','Nami','Volibear','Darius','Akali','Yuumi','Talon','Zed','Viktor','Pantheon','Chogath','Qiyana','Veigar','Morgana'];
const data=[
 ['Kennen',['TOP']],['Khazix',['JG']],['Ekko',['MID','JG']],['Vayne',['ADC','TOP']],['Nami',['SUP']],['Volibear',['TOP','JG']],['Darius',['TOP']],['Akali',['MID','TOP']],['Yuumi',['SUP']],
 ['Jinx',['ADC']],['Caitlyn',['ADC']],['Lux',['MID','SUP']],['Ahri',['MID']],['Warwick',['JG']],['Mordekaiser',['TOP']],['Vex',['MID']],['Lucian',['ADC']],['Senna',['SUP','ADC']],['Thresh',['SUP']],['Leona',['SUP']],['Yasuo',['MID','TOP']],['Yone',['MID','TOP']],['Vi',['JG']],['LeeSin',['JG']],['JarvanIV',['JG']],['Riven',['TOP']],['Gwen',['TOP']],['Orianna',['MID']],['Zed',['MID']],['Talon',['MID']],['Janna',['SUP']],['Braum',['SUP']],['Sona',['SUP']],['Jhin',['ADC']],['Kaisa',['ADC']],['Ezreal',['ADC']],['Ashe',['ADC']],['Pantheon',['TOP','SUP']],['Graves',['JG']],['Zyra',['SUP']],['Qiyana',['MID']],['Veigar',['MID']],['Olaf',['JG']],['Irelia',['TOP','MID']],['Nasus',['TOP']]
].map(([id,roles])=>({id,roles}));
const names={'Khazix':"Kha'Zix",'Kaisa':"Kai'Sa",'JarvanIV':'Jarvan IV','LeeSin':'Lee Sin'};
const dname=id=>names[id]||id;
const CDN='https://ddragon.leagueoflegends.com/cdn/16.21.1';
function placeholder(id){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 300"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#172d40"/><stop offset=".65" stop-color="#12131c"/><stop offset="1" stop-color="#493621"/></linearGradient></defs><rect width="250" height="300" fill="url(#g)"/><circle cx="124" cy="122" r="70" fill="none" stroke="#bc9a56" stroke-width="3" opacity=".38"/><text x="125" y="145" text-anchor="middle" font-size="94" fill="#e9d6a1" font-weight="800" font-family="Arial">${id[0]}</text><path d="M0 260L250 190M0 287L250 217" stroke="#ccad62" stroke-opacity=".15" stroke-width="25"/></svg>`;return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}
function avatar(id){return window.CoachDragon?.championPortrait(id)||`assets/portraits/${id}.webp`}
function splash(id){return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`}
function img(id,cls=''){return `<img class="${cls}" src="${avatar(id)}" alt="${dname(id)}" loading="lazy" onerror="this.onerror=null;this.src='assets/portraits/${id}.webp';this.onerror=()=>{this.onerror=null;this.src='${placeholder(id)}'}">`}
window.ChampionArt={portrait:avatar,splash};
const BAN_ORDER=['blue','red','blue','red','blue','red','blue','red','blue','red'];
const PICK_ORDER=['blue','red','red','blue','blue','red','red','blue','blue','red'];
let state,ticker,autoTimeout,prevSide='blue';
const available=(side=null)=>data.filter(c=>!state.bans.blue.includes(c.id)&&!state.bans.red.includes(c.id)&&!state.picks.blue.some(p=>p.id===c.id)&&!state.picks.red.some(p=>p.id===c.id));
const activeSide=()=>state.stage==='ready'?state.viewer:(state.stage==='ban'?BAN_ORDER[state.step]:PICK_ORDER[state.step]);
const ownDraft=()=>state.viewer;
const occupied=(side,role)=>state.picks[side].find(p=>p.role===role);
function sideChange(next){if(state.mode==='bot')return;const changing=prevSide!==next;prevSide=next;state.viewer=next;if(changing){$('draftPassOverlay').hidden=false;$('passTitle').textContent=next==='blue'?'Sua vez, equipe Azul':'Sua vez, equipe Vermelha';}render();}
function reset(){clearInterval(ticker);clearTimeout(autoTimeout);state={stage:'ban',step:0,bans:{blue:[],red:[]},picks:{blue:[],red:[]},spells:{blue:{},red:{}},summonerSlots:{blue:{},red:{}},smiteKeys:{blue:'f',red:'f'},runePages:{blue:{},red:{}},selection:null,role:'TOP',viewer:'blue',mode:$('mode').value,search:'',roleFilter:'ALL',deadline:performance.now()+20000,locked:false};prevSide='blue';$('draftPassOverlay').hidden=true;$('draftModal').hidden=false;$('champSearch').value='';document.querySelectorAll('#champRoleFilters button').forEach(b=>b.classList.toggle('active',b.dataset.role==='ALL'));
  ticker=setInterval(()=>{if($('draftModal').hidden||$('draftPassOverlay').hidden===false||state.stage==='ready')return;const left=Math.ceil((state.deadline-performance.now())/1000);$('draftClock').textContent=String(Math.max(0,left)).padStart(2,'0');if(left<=0){autoselect();}},130);
  render();nextAuto();}
function nextAuto(){clearTimeout(autoTimeout);if(state.stage==='ready')return;const side=activeSide();if(state.mode==='bot'&&side==='red'){
 autoTimeout=setTimeout(()=>{if(state.stage==='ready'||activeSide()!=='red')return;const opts=available();let best;if(state.stage==='pick'){
   let unfilled=ROLES.filter(r=>!occupied('red',r));let r=unfilled[0];best=opts.find(c=>c.roles.includes(r))||opts[0];state.role=r;
 } else best=opts.find(c=>!c.roles.includes('SUP'))||opts[0];state.selection=best?.id||null;commit(true);
 },650);}}
function beginStep(){state.selection=null;state.deadline=performance.now()+20000;state.locked=false;state.role=ROLES.find(r=>!occupied(activeSide(),r))||'TOP';const side=activeSide();if(state.mode==='hotseat'&&side!==state.viewer){sideChange(side);}render();nextAuto();}
function commit(auto=false){if(state.stage==='ready')return;const side=activeSide();if(side!==state.viewer&&state.mode==='hotseat'&&!auto)return;let id=state.selection;
 if(!id||!available().some(c=>c.id===id)){const opts=available();const r=state.stage==='pick'?state.role:null;id=(opts.find(c=>r&&c.roles.includes(r))||opts[0])?.id;}
 if(!id)return;
 if(state.stage==='ban') state.bans[side].push(id);
 else {const role=state.role;const old=occupied(side,role);if(old){state.role=ROLES.find(r=>!occupied(side,r))||role;}state.picks[side].push({id,role:state.role});}
 const previous=state.stage;state.step++;if(previous==='ban'&&state.step>=10){state.stage='pick';state.step=0;}
 else if(previous==='pick'&&state.step>=10){state.stage='ready';state.step=0;}
 if(state.stage!=='ready')beginStep();else{state.selection=null;render();}
}
function autoselect(){if(state.stage==='ready')return;const side=activeSide();if(side!==state.viewer&&state.mode==='hotseat'&&$('draftPassOverlay').hidden)return;commit(true);}
function assign(side,role){if(state.stage==='ready')return;if(side!==activeSide()||side!==state.viewer)return;state.role=role;render();}
function swapRole(side,id,newRole){if(state.stage!=='ready'||side!==state.viewer)return;const own=state.picks[side].find(p=>p.id===id);if(!own||!ROLES.includes(newRole))return;const occupiedP=occupied(side,newRole);if(occupiedP)occupiedP.role=own.role;own.role=newRole;render();}
function renderRoster(side){let canSeeRoles=side===state.viewer;
 const list=$(side==='blue'?'draftBlueRoster':'draftRedRoster');list.innerHTML='';
 for(let i=0;i<5;i++){const role=ROLES[i],p=canSeeRoles?occupied(side,role):state.picks[side][i];const active=side===activeSide()&&side===state.viewer&&state.role===role&&state.stage==='pick';let row=document.createElement('button');row.className='draftRosterSlot '+(p?'filled ':'')+(active?'current ':'')+(side==='blue'?'blue':'red');row.dataset.role=role;
 const label=canSeeRoles?role:'PICK '+(i+1);row.innerHTML=`<span class="slotPortrait">${p?img(p.id):'<span class="emptyRole">✦</span>'}</span><span class="slotText"><small>${label}</small><strong>${p?dname(p.id):'Aguardando escolha'}</strong></span><span class="slotStatus">${active?'◆':p?'✓':'◇'}</span>`;
 row.onclick=()=>assign(side,role);list.append(row);
 if(p&&state.stage==='ready'&&canSeeRoles){const sel=document.createElement('select');sel.className='roleReassign';for(let r of ROLES){let opt=document.createElement('option');opt.value=r;opt.textContent=r;if(r===role)opt.selected=true;sel.append(opt)}sel.onchange=e=>swapRole(side,p.id,e.target.value);row.append(sel);
  // Two independent draft slots, no Flash assumption. Jungle must keep Smite.
  const defaultOther={TOP:'tp',JG:'flash',MID:'ignite',ADC:'heal',SUP:'exhaust'}[p.role]||'flash';
  const defaultPair=p.role==='JG'?(state.smiteKeys[side]==='d'?['smite','flash']:['flash','smite']):['flash',defaultOther];
  const raw=state.summonerSlots[side][p.id];
  const valid=x=>['flash','smite','ignite','heal','exhaust','barrier','tp','ghost','cleanse'].includes(x);
  const normalized=Array.isArray(raw)&&raw.length===2&&raw.every(valid)&&raw[0]!==raw[1]&&(p.role==='JG'?raw.includes('smite'):!raw.includes('smite'))?raw:defaultPair;
  state.summonerSlots[side][p.id]=normalized;
  const editor=document.createElement('div');editor.className='draftSpellSlotsV452d4Dev11';editor.setAttribute('aria-label','Feitiços de '+dname(p.id));
  const choices=[['flash','Flash'],['ignite','Incendiar'],['heal','Curar'],['exhaust','Exaustão'],['barrier','Barreira'],['tp','Teleporte'],['ghost','Fantasma'],['cleanse','Purificar'],...(p.role==='JG'?[['smite','Golpear']]:[])];
  for(let i=0;i<2;i++){
   const wrapper=document.createElement('label');wrapper.textContent=i===0?'D':'F';wrapper.className='draftSpellSlotV452d4Dev11';
   const selector=document.createElement('select');selector.className='summonerDraftV452 draftSpellSelectV452d4Dev11';selector.dataset.slot=i===0?'d':'f';
   for(const [key,label] of choices){const option=document.createElement('option');option.value=key;option.textContent=label;selector.append(option);}
   selector.value=normalized[i];selector.onclick=ev=>ev.stopPropagation();
   selector.onchange=ev=>{
    const previous=[...state.summonerSlots[side][p.id]],other=1-i,chosen=ev.target.value;
    if(chosen===previous[other])previous[other]=previous[i];
    previous[i]=chosen;
    if(p.role==='JG'&&!previous.includes('smite'))previous[other]='smite';
    if(previous[0]===previous[1])previous[other]=previous[other]==='flash'?'ignite':'flash';
    state.summonerSlots[side][p.id]=previous;
    if(p.role==='JG')state.smiteKeys[side]=previous[0]==='smite'?'d':'f';
    render();
   };
   wrapper.append(selector);editor.append(wrapper);
  }
  row.append(editor);
  const rune=document.createElement('label');rune.className='draftRuneV453Dev45';rune.textContent='Runas';
  const runeSelect=document.createElement('select');runeSelect.setAttribute('aria-label','Runas de '+dname(p.id));
  for(const [id,label] of [['none','Padrão'],['precision','Precisão'],['sorcery','Feitiçaria'],['resolve','Determinação']]){
   const option=document.createElement('option');option.value=id;option.textContent=label;runeSelect.append(option);
  }
  runeSelect.value=state.runePages[side][p.id]||'none';
  runeSelect.onclick=ev=>ev.stopPropagation();runeSelect.onchange=ev=>{state.runePages[side][p.id]=ev.target.value;ev.stopPropagation();};
  rune.append(runeSelect);row.append(rune);


 }
 }
}
function renderBans(side){let container=$(side==='blue'?'blueBans':'redBans');container.innerHTML='';let reveal=state.stage!=='ban';let bs=state.bans[side];for(let i=0;i<5;i++){const id=bs[i];const shouldShow=reveal||side===state.viewer;container.innerHTML+=`<span class="banIcon ${id?'taken':''}" title="${id&&shouldShow?dname(id):'Ban'}">${id&&shouldShow?img(id):'<span>×</span>'}</span>`;}}
function renderPool(){let opts=data.filter(c=>(state.roleFilter==='ALL'||c.roles.includes(state.roleFilter))&&dname(c.id).toLowerCase().includes(state.search));$('poolCount').textContent=`${opts.length} CAMPEÕES`;$('champPool').innerHTML='';const banned=new Set([...state.bans.blue,...state.bans.red]);for(let c of opts){const picked=[...state.picks.blue,...state.picks.red].some(p=>p.id===c.id),disabled=banned.has(c.id)||picked;let b=document.createElement('button');b.className='champTile '+(state.selection===c.id?'selected ':'')+(disabled?'disabled':'');b.disabled=disabled||state.stage==='ready'||(state.mode==='hotseat'&&activeSide()!==state.viewer);b.innerHTML=img(c.id)+`<span>${dname(c.id)}</span>${disabled?'<i>×</i>':''}`;b.onclick=()=>{state.selection=c.id;renderPreview();renderPool();renderAction()};$('champPool').append(b)}}
function renderPreview(){let id=state.selection||state.picks[state.viewer].at(-1)?.id||'Akali';$('champHeroTitle').textContent=id?dname(id):'Sua próxima decisão.';$('champHeroDesc').textContent=state.stage==='ban'?'Banir remove este campeão do draft.':state.stage==='pick'?'Confirme sua escolha. Você ainda poderá trocar de rota antes do início.':'Composições definidas. Ajuste suas rotas e inicie a partida.';
 const holder=$('champHeroArt');const url=id==='Akali'?(window.assetUrl?.('assets/akali_hero.webp')||'assets/akali_hero.webp'):avatar(id);holder.style.backgroundImage=`linear-gradient(90deg,#030a10 6%,transparent 63%,rgba(2,9,15,.58)),url("${url}")`;
 // Always-visible local hero art if offline. Do not rely on remote splash load.
 holder.style.backgroundColor='#111b2b';const localid=local.includes(id)?id:null;
 holder.style.setProperty('--hero-fallback',localid?`url('${avatar(id)}')`:'none');
}
function renderAction(){let st=state.stage,side=activeSide(),action=$('draftConfirm');$('draftPhase').textContent=st==='ban'?'FASE DE BANIMENTOS':st==='pick'?'ESCOLHA DE CAMPEÕES':'AJUSTE FINAL DE ROTAS';$('draftOrder').textContent=st==='ready'?'Composições completas':`${side==='blue'?'AZUL':'VERMELHO'} • ${st==='ban'?'BAN':'PICK'} ${state.step+1} / 10`;
 $('draftClock').textContent=st==='ready'?'✓':String(Math.max(0,Math.ceil((state.deadline-performance.now())/1000))).padStart(2,'0');
 $('draftActionLabel').textContent=st==='ban'?'BANIR CAMPEÃO':st==='pick'?'ESCOLHER CAMPEÃO':'PREPARAR PARTIDA';$('draftSelectedName').textContent=state.selection?dname(state.selection):st==='ready'?'Rotas podem ser trocadas':`Selecionar para ${side==='blue'?'Azul':'Vermelho'}`;
 $('draftActionHint').textContent=st==='ban'?'Bans não podem ser escolhidos na partida':st==='pick'?`Slot: ${state.role} • posição privada`:'As rotas ficam ocultas ao time adversário';
 $('draftProgressText').textContent=st==='ready'?'FINALIZAÇÃO':`${st.toUpperCase()} ${state.step+1}/10 • ${side==='blue'?'AZUL':'VERMELHO'}`;
 $('draftPrivacy').textContent='◈ Campeões confirmados são públicos • rotas e planos são privados';
 action.disabled=st!=='ready'&&!state.selection;action.textContent=st==='ban'?'CONFIRMAR BAN ×':st==='pick'?'TRAVAR CAMPEÃO ✓':'INICIAR PARTIDA ➜';
 const canOperate=state.mode==='bot'||side===state.viewer;action.disabled=action.disabled||!canOperate;
 $('blueDraftSub').textContent='FIRST PICK';$('redDraftSub').textContent='LAST PICK';
 $('draftConfirm').classList.toggle('ready',st==='ready');
}
function render(){if(!state)return;const keySelector=$('draftSmiteKey');if(keySelector)keySelector.value=state.smiteKeys[state.viewer]||'f';renderRoster('blue');renderRoster('red');renderBans('blue');renderBans('red');renderAction();renderPreview();renderPool();$('draftViewerSwitch').hidden=state.mode!=='hotseat'||state.stage!=='ready';}
function finish(){if(state.stage!=='ready')return;const blue=Object.fromEntries(state.picks.blue.map(p=>[p.role,p.id]));const red=Object.fromEntries(state.picks.red.map(p=>[p.role,p.id]));if(ROLES.some(r=>!blue[r]||!red[r]))return;clearInterval(ticker);clearTimeout(autoTimeout);const spells=Object.fromEntries(['blue','red'].map(team=>[team,Object.fromEntries(state.picks[team].map(p=>[p.role,p.role==='JG'?'smite':state.spells[team][p.id]||'ignite']))]));
 const summonerSlots=Object.fromEntries(['blue','red'].map(team=>[team,Object.fromEntries(state.picks[team].map(p=>{
 const defaultOther={TOP:'tp',JG:'flash',MID:'ignite',ADC:'heal',SUP:'exhaust'}[p.role]||'flash';
 const defaultPair=p.role==='JG'?(state.smiteKeys[team]==='d'?['smite','flash']:['flash','smite']):['flash',defaultOther];
 return [p.role,[...(state.summonerSlots[team][p.id]||defaultPair)]];
 }))]));
 const runePages=Object.fromEntries(['blue','red'].map(team=>[team,Object.fromEntries(state.picks[team].map(p=>[p.role,state.runePages[team][p.id]||'none']))]));
 window.dispatchEvent(new CustomEvent('draft:complete',{detail:{blue,red,spells,summonerSlots,smiteKeys:{...state.smiteKeys},bans:state.bans,runePages}}));}
$('draftConfirm').addEventListener('click',()=>{if(state.stage==='ready')finish();else commit()});
$('passButton').onclick=()=>{$('draftPassOverlay').hidden=true;state.deadline=performance.now()+20000;render();nextAuto()};
$('champSearch').addEventListener('input',e=>{state.search=e.target.value.toLowerCase();renderPool()});
$('champRoleFilters').addEventListener('click',e=>{const b=e.target.closest('button[data-role]');if(!b)return;state.roleFilter=b.dataset.role;document.querySelectorAll('#champRoleFilters button').forEach(n=>n.classList.toggle('active',n===b));renderPool()});
$('mode').addEventListener('change',()=>{state.mode=$('mode').value;$('difficulty').disabled=state.mode==='hotseat';reset()});
const sw=document.createElement('button');sw.id='draftViewerSwitch';sw.className='draftSwitch';sw.textContent='Trocar visão do time';sw.hidden=true;$('draftConfigCompact')?.append(sw);if(!sw.parentElement)$('draftModal').querySelector('.draftConfigCompact').append(sw);sw.onclick=()=>{state.viewer=state.viewer==='blue'?'red':'blue';render()};

// Dedicated accessible config; nested <select> inside roster <button> would
// overflow at 16:9 and produce invalid interactive nesting.
const smiteKeyLabel=document.createElement('label');smiteKeyLabel.className='smiteDraftKeySettingV452d4Dev10';
smiteKeyLabel.textContent='JG GOLPEAR';const smiteKeySelector=document.createElement('select');smiteKeySelector.id='draftSmiteKey';
smiteKeySelector.className='smiteDraftKeyV452d4Dev10';
smiteKeySelector.title='Escolha Golpear D ou F no Champ Select. Flash ocupa a tecla oposta.';
for(const key of ['f','d']){const option=document.createElement('option');option.value=key;option.textContent='Golpear '+key.toUpperCase();smiteKeySelector.append(option);}
smiteKeySelector.onchange=()=>{state.smiteKeys[state.viewer]=smiteKeySelector.value;const jg=state.picks[state.viewer].find(p=>p.role==='JG');if(jg){const current=state.summonerSlots[state.viewer][jg.id]||['flash','smite'];const other=current.find(x=>x!=='smite')||'flash';state.summonerSlots[state.viewer][jg.id]=smiteKeySelector.value==='d'?['smite',other]:[other,'smite'];}render();};
smiteKeyLabel.append(smiteKeySelector);smiteKeyLabel.hidden=true;smiteKeyLabel.style.setProperty('display','none','important');document.querySelector('.draftConfigCompact').append(smiteKeyLabel);
window.DraftFlow={reset,getState:()=>state,advance:()=>{autoselect()},forceReady:()=>{while(state.stage!=='ready'){if(state.mode==='hotseat'){state.viewer=activeSide();$('draftPassOverlay').hidden=true}autoselect()}render()},commit,select:id=>{state.selection=id;render()},finish};reset();
})();
