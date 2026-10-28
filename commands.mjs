/** CoachLOL: offline, deterministic PT-BR tactical command compiler.
 * Not a generative AI; never invent an action or claim to understand unsupported intent.
 * Compiler is shared by manual/browser and tests. All gameplay changes go through Arena.
 */
export const COMMAND_EXAMPLES=[
 'MID farmar safe, sem trocar',
 'SUP dar peel no ADC, poke leve e economizar mana; ADC farmar e negar farm',
 'TOP freezar wave; JG red de baixo depois krugs de baixo',
 'JG gankar bot quando tiver visão',
 'ADC recall; MID comprar anel de doran',
 'Jinx kite com AA, farm seguro, negar CS e guardar mana',
 'ADC priorizar upar E Q W; JG upar Q; TOP freeze até nova ordem',
 'JG comprar pet verde; ADC comprar lamina de doran; SUP poke e completar missao do atlas',
 'JG red de baixo depois krugs de baixo, golpear red de baixo com 600 HP',
 'JG smite apenas no dragao com 1200 de vida',
 'JG guardar smite; ADC kite com AA',
 'BOT farm safe e ADC kite com AA; Nami ward blue inimigo',
 'JG invade red inimigo depois blue inimigo; Volibear freeze top',
 'SUP ward galinhas inimigas; MID roam top',
 'Jinx dar B e comprar espada GPC, espada longa na próxima base',
 'MID voltar base comprar Rabadon quando tiver ouro',
 'Warwick depois de finalizar acuâminas gankar mid e focar Vex',
 'K Sante focar alvo perto da parede; Zed emboscar ADC pelo flanco',
 'ADC SUP JG rotacionar MID 1-3-1, TOP segura e BOT segura',
 'Voli focar upar o Q depois W; Jinx focar Q depois E',
 'Vayne upar 3 pontos no Q depois focar W, com R no 6 11 16',
];
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
const roles={TOP:['top','topo','toplaner'],JG:['jg','jungle','jungler','selva','cacador'],MID:['mid','meio','midlane'],ADC:['adc','atirador','carry','botlaner'],SUP:['sup','suporte','support','sp']};
const roleWord=Object.values(roles).flat().join('|');
const CHAMP_ALIASES={KSante:['ksante','k sante','k-sante','kasante'],Volibear:['voli','voliba','volibear'],Khazix:['kha','khazix','kha zix','kha zixx'],LeeSin:['lee','lee sin','leesin'],Warwick:['ww','warwick','warvick','warwickk','wick','warick'],Jinx:['jinx'],Nami:['nami','nam'],Darius:['darius'],Ahri:['ahri'],Vex:['vex'],Caitlyn:['cait','caitlyn'],Leona:['leo','leona'],Mordekaiser:['morde','mordekaiser'],JarvanIV:['j4','jarvan','jarvan iv'],Kaisa:['kai sa','kaisa'],Chogath:['cho','cho gath','chogath'],Ezreal:['ez','ezreal'],Orianna:['ori','orianna'],Yasuo:['yas','yasuo'],Yone:['yone'],Jhin:['jhin'],Lux:['lux'],Riven:['riven'],Gwen:['gwen'],Zed:['zed'],Akali:['akali'],Vayne:['vayne'],Vi:['vi'],Ekko:['ekko'],Senna:['senna'],Thresh:['thresh'],Leona:['leona','leo'],Janna:['janna'],Sona:['sona'],Braum:['braum'],Ashe:['ashe'],Nasus:['nasus'],Graves:['graves']};
const escapeRe=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

const roleOf=word=>Object.entries(roles).find(([,words])=>words.includes(word))?.[0]||null;
const cmdStart=new RegExp(`(?:^|[;\\n.!?]+|\\benquanto\\s+|\\b(?:e\\s+)?(?:o|a|nosso|nossa)\\s+)(?:(?:o|a|nosso|nossa)\\s+)?(${roleWord})\\b`,'gi');
const campAliases=[['krugs',/\b(?:krug(?:s|ue|ues)?|golem(?:s)?|pedrinhas)\b/g],['red',/\b(?:red|vermelho|brasa)\b/g],['blue',/\b(?:blue|azul|sentinela azul)\b/g],['gromp',/\b(?:gromp|sapo)\b/g],['wolves',/\b(?:wolves|lobos?)\b/g],['raptors',/\b(?:raptors|acuaminas?|acuaminas|acuamina|acuarminas?|acua?minas?|galinhas?|passaros?|acuires)\b/g],['scuttle',/\b(?:scuttle|aronguejo|caranguejo)\b/g]];
const laneForRole={TOP:'top',JG:'mid',MID:'mid',ADC:'bot',SUP:'bot'};
const itemAliases={dorans_blade:/\b(?:lamina de doran|espada de doran|dorans? blade)\b/,dorans_ring:/\b(?:anel de doran|dorans? ring)\b/,dorans_shield:/\b(?:escudo de doran|dorans? shield)\b/,support_atlas:/\b(?:atlas|item de suporte|atlas mundial|world atlas)\b/,jungle_gustwalker:/\b(?:gustwalker|pet azul|jungle azul|item de jungle azul|companheiro azul)\b/,jungle_mosstomper:/\b(?:mosstomper|pet verde|jungle verde|item de jungle verde|companheiro verde)\b/,jungle_scorchclaw:/\b(?:scorchclaw|pet vermelho|jungle vermelho|item de jungle vermelho|companheiro vermelho)\b/,boots:/\b(?:botas?|boots)\b/,bf_sword:/\b(?:espada g\.?p\.?c\.?|espada gpc|espada grande|espadao|b\.?f\.? sword)\b/,rabadon:/\b(?:rabadon|capuz da morte|deathcap)\b/,infinity_edge:/\b(?:gume do infinito|infinity edge|infinity|ie\b)\b/,long_sword:/\b(?:espada longa|long sword)\b/,amp_tome:/\b(?:tomo amplificador|amp tome)\b/,ward:/\b(?:sentinela de controle|control ward)\b/};
function splitSegments(src,selectedId,arena,team){
 const raw=fold(src).replace(/[.!?]+/g,';').replace(/\s*(?:\n|;)+\s*/g,';');
 const myUnits=(arena?.units||[]).filter(u=>u.team===team);
 const actors=[];for(const [role,words] of Object.entries(roles))for(const word of words)actors.push({word,roles:[role]});
 for(const word of ['bot','botlane','bot lane','dupla bot','bot duo','duo bot'])actors.push({word,roles:['ADC','SUP']});
 for(const u of myUnits){const norm=fold(u.champ).replace(/[^a-z0-9 ]/g,' ');for(const word of new Set([norm,norm.replace(/\s+/g,''),...(CHAMP_ALIASES[u.champ]||[])]))actors.push({word:fold(word),roles:[u.role]});}
 // Detect a known alias that belongs to an unpicked champion; never attach it to the preceding unit.
 for(const [champ,aliases] of Object.entries(CHAMP_ALIASES))if(!myUnits.some(u=>u.champ===champ))for(const word of aliases)if(!actors.some(a=>a.word===fold(word)))actors.push({word:fold(word),roles:[null]});
 actors.sort((a,b)=>b.word.length-a.word.length);
 const pattern=actors.map(x=>escapeRe(x.word).replace(/\s+/g,'\\s*')).join('|');
 const re=new RegExp('\\b('+pattern+')\\b','g');
 const starts=[];let m;
 while((m=re.exec(raw))){
  const actor=actors.find(a=>fold(a.word)===fold(m[1])||a.word.replace(/\s+/g,'')===m[1].replace(/\s+/g,''));if(!actor)continue;
  const before=raw.slice(0,m.index),after=raw.slice(re.lastIndex).trimStart();
  const previous=before.slice(-27);
  const begins=!before.trim()||/[;,]\s*(?:(?:o|a|nosso|nossa)\s+)?$/.test(before)||/\b(?:enquanto|e|mas|tambem)\s+(?:(?:o|a|nosso|nossa)\s+)?$/.test(before);
  if(!begins||/\b(?:no|na|pro|para|do|da|contra|ao|ate|pelo|com|seu)\s+$/.test(previous))continue;
  // Require an actual order after the subject; name mention by itself is not a command.
  if(!after||!/\b(?:farm|gank|poke|peel|defend|cura|escud|recall|base|loja|compr|smite|golpear|guardar|reservar|dar b|da b|de b|red|blue|krug|golem|rota|path|ward|freeze|freez|luta|fight|segui|mover|push|pression|rotacion|roam|draga|barao|torre|safe|segur|negar|control|economiz|ajuda|vai|ir\b|1v1|tentar|aa\b|kite|kiting|on.?hit|combar|habilidade|upar|upgrade|combo|prioriz|atacar|limpar|focar|invad|invade|tribush|tri brush|ficar|recu|esperar|visao|vision|prote|acompanha|ir\b)/.test(after.slice(0,120)))continue;
  starts.push({index:m.index,end:re.lastIndex,roles:actor.roles,subject:m[1]});
 }
 if(!starts.length)return [{roles:[selectedId?.split('_')[1]||null],body:raw.trim(),source:raw.trim()}];
 const segments=[];for(let i=0;i<starts.length;i++){
  const current=starts[i],end=starts[i+1]?.index??raw.length;
  let body=raw.slice(current.end,end).replace(/^[\s,;\/]+/,'').replace(/[\s,;]+$/,'');
  // Accept "Nami/SUP ward..." as a champion synonym, not an extra command.
  body=body.replace(/^(?:sup|suporte|adc|top|jg|mid)\b\s*,?\s*/,'');
  if(body)for(const role of current.roles)segments.push({role,body,source:current.subject+' '+body});
 }
 if(starts[0].index>0&&raw.slice(0,starts[0].index).replace(/[;,\s]+/g,''))segments.unshift({role:null,body:raw.slice(0,starts[0].index),source:raw.slice(0,starts[0].index)});
 return segments;
}
function campsIn(s,arena,team){
 const mentions=[];
 for(const [kind,re] of campAliases){re.lastIndex=0;let m;while((m=re.exec(s)))mentions.push({kind,index:m.index,text:m[0]});}
 mentions.sort((a,b)=>a.index-b.index);if(!mentions.length)return [];
 // 'golem/krugue' means ONE camp, not two separate orders.
 const compact=mentions.filter((v,i,arr)=>!(i&&v.kind===arr[i-1].kind&&v.index-(arr[i-1].index+arr[i-1].text.length)<=3));mentions.length=0;mentions.push(...compact);
 const base=arena.map.objects.find(o=>o.id===team+'_spawn_shop'),enemyBase=arena.map.objects.find(o=>o.id===(team==='blue'?'red':'blue')+'_spawn_shop');
 return mentions.map((hit,i)=>{
  const following=s.slice(hit.index+hit.text.length,mentions[i+1]?.index??s.length);
  let suffix=s.slice(Math.max(0,hit.index-8),hit.index)+following.slice(0,24);
  const lower=/\b(?:de baixo|baixo|inferior|bot)\b/.test(suffix),upper=/\b(?:de cima|cima|superior|top)\b/.test(suffix);
  const enemy=/\b(?:inimig[oa]s?|adversari[oa]s?|enemy|invad\w*|invade)\b/.test(s.slice(Math.max(0,hit.index-32),hit.index)+following.slice(0,48));
  const camps=arena.camps.filter(c=>c.timerKey===hit.kind&&Number.isFinite(c.x)&&Number.isFinite(c.y));
  if(!camps.length)return {error:'Acampamento não encontrado: '+hit.text};
  const sorted=[...camps].sort((a,b)=>lower?b.y-a.y:upper?a.y-b.y:arena.mapDistance(a,enemy?enemyBase:base)-arena.mapDistance(b,enemy?enemyBase:base));
  const c=sorted[0];return {action:'jungle',point:{x:c.x,y:c.y},targetId:c.id,label:hit.kind+(lower?' de baixo':upper?' de cima':enemy?' inimigo':' aliado')};
 });
}
// Strict Smite grammar: never assume an unspecified target or HP; make behavior explicit.
const SMITE_NAME='(?:red|vermelho|blue|azul|krugs?|krugue|golem|gromp|sapo|wolves|lobos?|raptors|galinhas?|scuttle|aronguejo|caranguejo|dragao|drake|dragon|barao|baron|herald|arauto)';
function parseSmite(s,arena,team){
 const modeAuto=/\b(?:golpear|smite)\s+(?:automatico|auto)\b/.test(s);
 const modeHold=/\b(?:(?:guardar|reservar|segurar|poupar)\s+(?:(?:o|as cargas do)\s+)?(?:smite|golpear)|sem\s+(?:smite|golpear)|nao\s+(?:usar\s+)?(?:smite|golpear))\b/.test(s);
 const re=new RegExp('\\b(?:golpear|smitar|smite|smita)\\s+(?:(?:apenas|somente|so|no|na|o|a|nos|nas)\\s+)*(?<name>'+SMITE_NAME+')(?:\\s+(?:de\\s+)?(?<side>baixo|cima))?(?:\\s+(?:(?:com|aos?|quando\\s+(?:estiver\\s+)?com|quando\\s+(?:tiver\\s+)?)\\s+)?(?<hp>\\d{1,5})\\s*(?:de\\s+)?(?:hp|vida))?','g');
 // JS RegExp construction uses escaped backslashes (see unit tests).
 const matches=[...s.matchAll(re)];
 if(!matches.length&&!modeAuto&&!modeHold){
  if(/\b(?:smite|smitar|smita|golpear)\b/.test(s))return {detected:true,errors:['Golpear: especifique o monstro (red, blue, krugs, dragão...) ou use automático/guardar.']};
  return {detected:false};
 }
 if((modeHold||modeAuto)&&matches.length)return {detected:true,errors:['Escolha entre guardar/automático ou um alvo específico.']};
 if(modeAuto&&modeHold)return {detected:true,errors:['Não misture Smite automático e guardar.']};
 if(modeAuto||modeHold)return {detected:true,policy:{mode:modeAuto?'auto':'hold',rules:[]},stripped:s.replace(/\b(?:golpear|smite)\s+(?:automatico|auto)\b/g,'').replace(/\b(?:(?:guardar|reservar|segurar|poupar)\s+(?:(?:o|as cargas do)\s+)?(?:smite|golpear)|sem\s+(?:smite|golpear)|nao\s+(?:usar\s+)?(?:smite|golpear))\b/g,'')};
 const rules=[],errors=[];const targetCamps=[];let stripped=s;
 for(const m of matches){
  const token=m.groups.name,kind=/^(?:red|vermelho)$/.test(token)?'red':/^(?:blue|azul)$/.test(token)?'blue':/^(?:krug|golem)/.test(token)?'krugs':/^(?:sapo|gromp)/.test(token)?'gromp':/^(?:lobo|wolv)/.test(token)?'wolves':/^(?:raptor|galinha)/.test(token)?'raptors':/^(?:scuttle|aronguejo|caranguejo)/.test(token)?'scuttle':/^(?:dragao|drake|dragon)/.test(token)?'dragon':/^(?:baron|barao)/.test(token)?'baron':'herald';
  const possibilities=arena.camps.filter(c=>c.timerKey===kind),side=m.groups.side;
  const base=arena.map.objects.find(o=>o.id===team+'_spawn_shop');
  const pool=possibilities.sort((a,b)=>side==='baixo'?b.y-a.y:side==='cima'?a.y-b.y:arena.mapDistance(a,base)-arena.mapDistance(b,base));
  if(!pool.length){errors.push('Monstro inexistente: '+token);continue;}
  const target=pool[0],hp=m.groups.hp?Number(m.groups.hp):null;
  if(hp!==null&&(!Number.isInteger(hp)||hp<1||hp>10000)){errors.push('HP fora do intervalo 1–10.000 para '+kind);continue;}
  if(rules.some(r=>r.targetId===target.id)){errors.push('Golpear duplicado para '+kind);continue;}
  rules.push({targetId:target.id,hpThreshold:hp});targetCamps.push(target);
  stripped=stripped.replace(m[0],' ');
 }
 return {detected:true,errors,policy:{mode:'targets',rules},targetCamps,stripped};
}
function lanePoint(arena,role,team,laneName,progress){const line=arena.lanes[laneName]||arena.lanes[laneForRole[role]];if(!line)return null;const position=team==='blue'?progress:1-progress;const xs=line.path.map(p=>p.x),ys=line.path.map(p=>p.y);if(!xs.length)return null;
 // Use actual sampled spline positions; choose a near-lane navigable point via Arena pathing.
 let rem=position*line.total;for(let i=1;i<line.path.length;i++){let segment=line.lens[i]-line.lens[i-1];if(rem<=segment){let t=segment?rem/segment:0;return {x:line.path[i-1].x+(line.path[i].x-line.path[i-1].x)*t,y:line.path[i-1].y+(line.path[i].y-line.path[i-1].y)*t};}rem-=segment;}return line.path.at(-1);
}
function tacticalDestination(s,arena,team,role){
 const lower=fold(s),enemy=/\b(?:inimig[oa]s?|adversari[oa]s?|enemy)\b/.test(lower);
 const lane=/\b(?:top|topo)\b/.test(lower)?'top':/\b(?:bot|bottom|inferior)\b/.test(lower)?'bot':/\b(?:mid|meio)\b/.test(lower)?'mid':null;
 const targetKind=campAliases.find(([kind,re])=>{re.lastIndex=0;return re.test(lower);})?.[0];
 if(targetKind){const possible=arena.camps.filter(c=>c.timerKey===targetKind);
  const ref=arena.map.objects.find(o=>o.id===(enemy?(team==='blue'?'red':'blue'):team)+'_spawn_shop');
  const field=[...possible].sort((a,b)=>arena.mapDistance(a,ref)-arena.mapDistance(b,ref))[0];
  if(field)return {point:{x:field.x,y:field.y},label:targetKind+(enemy?' inimigo':' aliado'),targetId:field.id,kind:targetKind};
 }
 if(/\b(?:tri\s*brush|tri\s*bush|tribush|tribrush|tribrush)\b/.test(lower)){
  // Strategic POI candidate near a lane entrance. Choose an actual walkable
  // brush cell, never assume the artwork alone is a navigable coordinate.
  const anchor=lanePoint(arena,role,team,lane||'bot',enemy?.67:.27);
  let best=null,score=Infinity,N=arena.mask.size;
  for(let iy=2;iy<N-2;iy+=2)for(let ix=2;ix<N-2;ix+=2){
   const p={x:(ix+.5)/N,y:(iy+.5)/N};
   if(!arena.maskAt('brush',p.x,p.y)||!arena.walkable(p.x,p.y))continue;
   const d=arena.mapDistance(p,anchor);if(d<score){score=d;best=p;}
  }
  if(best&&score<3500)return {point:best,label:'arbusto '+(lane||'bot')+' (aproximado)',kind:'brush'};
 }
 if(lane)return {point:lanePoint(arena,role,team,lane,.43),label:'lane '+lane,kind:'lane'};
 return null;
}
function compileSegment(seg,arena,team){const s=seg.body,role=seg.role;const actions=[],warnings=[];
 if(!role)return {role:null,source:seg.source,actions:[],warnings:['Campeão não pertence à sua equipe ou função não identificada: '+seg.source.split(' ')[0]+'. Selecione um integrante do time.'],valid:false};
 const unit=arena.units.find(u=>u.team===team&&u.role===role);if(!unit)return {role,source:seg.source,actions:[],warnings:['Campeão não encontrado.'],valid:false};
 const add=(type,payload,label)=>actions.push({type,payload,label});
 let recognized=false;
 const smite=parseSmite(s,arena,unit.team);
 if(smite.detected){recognized=true;if(role!=='JG')warnings.push('Golpear só está disponível para JG.');warnings.push(...(smite.errors||[]));if(smite.policy){const label=smite.policy.mode==='targets'?'Golpear '+smite.policy.rules.map(r=>{const c=arena.camps.find(c=>c.id===r.targetId);return (c?.timerKey||'campo')+' HP ≤ '+(r.hpThreshold??arena.smitePower(unit))}).join(', '):smite.policy.mode==='hold'?'Guardar cargas de Smite':'Smite automático';add('smitePolicy',smite.policy,label);}}
 const sWithoutSmite=smite.detected?(smite.stripped||''):s;
 if(/\b(?:safe|segur[oa]|cautel|conservador|sem trocar|evitar (?:troca|luta|trade)|nao trocar)\b/.test(s)){
  add('policy','safe','Jogar seguro / evitar trocas');recognized=true;
  add('tactics',{trade:'avoid'},'Sem iniciar trocas');
 }
 if(/\b(?:agressiv|agressar|pressa|pression|pocke|poke|pokear)\w*/.test(s)){
  const light=/\b(?:leve|pouco|safe|mana|economiz|control|cd|cdr)\b/.test(s);
  add('tactics',{poke:light?'light':'normal'},light?'Poke leve e espaçado':'Poke controlado');recognized=true;
  if(!light&&/\b(?:agressivo|agressiva|full)\b/.test(s))add('policy','aggressive','Postura agressiva');
 }
 if(/(?:mana|cd\b|cdr\b|cooldown|recurso)/.test(s)&&/(?:control|economiz|poup|guard|respeit|segur|conserv)/.test(s)){
  add('tactics',{conserveMana:true},'Conservar mana e recargas');recognized=true;
 }
 if(/\b(?:freez\w*|congel\w*|segurar wave|segurar a wave)\b/.test(s)){
  add('tactics',{wave:'freeze'},'Congelar wave (last hits)');add('automation',{autoFarm:true,autoFollow:true},'Farm automático');recognized=true;
 }
 if(/\b(?:nega(?:r)?\s+(?:o\s+)?farm|deny|zonear|zonar)\b/.test(s)){
  add('tactics',{wave:'deny'},'Negar farm por pressão de zona');recognized=true;
 }
 if(/\b(?:push|puxar wave|empurrar wave|shovar|shove|hardpush|fastpush)\b/.test(s)){
  add('tactics',{wave:'push'},'Empurrar wave');add('order',{kind:'push'},'Pressionar a lane');recognized=true;
 }
 if(/\b(?:farm\w*|cs\b|last.?hit)\b/.test(s)&&!(role==='JG'&&/\b(?:auto jungle|limpar selva automaticamente|farmar jungle)\b/.test(s))){
  add('automation',{autoFarm:true,...(unit.explicitOrder&&unit.plan&&!unit.plan.completed?{}:{autoFollow:true})},'Farmar automaticamente');recognized=true;
  if(!/\b(?:push|puxar wave|empurrar wave|hardpush|fastpush)\b/.test(s)&&!unit.plan&&!/\b(?:invad|invade|ward|gank|roam|red|blue|krug|golem|caminh|ir\b|vai\b)\w*/.test(s))add('order',{kind:'farm'},'Farm seguro / last hit');
 }
 if(/\b(?:peel|protege(?:r)?\s+(?:o\s+)?adc|proteger?\s+(?:o\s+)?carry)\b/.test(s)){
  add('reaction',/carry/.test(s)?'guard_carry':'peel_adc','Priorizar peel / proteção');recognized=true;
 }
 if(/\b(?:cura(?:r)?|heal\b|healar)\b/.test(s)&&!/(?:curar a wave)/.test(s)){
  add('reaction','heal','Priorizar cura (kit abstrato)');recognized=true;
 }
 if(/\b(?:escud\w*|shield)\b/.test(s)){
  add('reaction','shield','Priorizar escudo (kit abstrato)');recognized=true;
 }
 if(/\b(?:1v1|2v1|3v1|duel|luta|lutar|trocar|trade)\b/.test(s)&&!/(?:sem trocar|evitar (?:troca|luta)|nao trocar|sem lutar)/.test(s)){
  const conditional=/\b(?:quando|se tiver|caso tenha|com visao|visivel)\b/.test(s);
  add('tactics',{trade:conditional?'vision_only':'opportunistic'},conditional?'Aceitar 1v1 apenas com alvo visível':'Aceitar trocas com resposta adversária');recognized=true;
 }
 if(/\b(?:recuar|recuo|disengage|fugir)\b/.test(s)){add('reaction','retreat','Recuar em risco');recognized=true;}
 // ADC and attack-oriented fighters are allowed to attack normally without a
 // mandatory QWER combo; kiting trades distance for sustained auto-attacks.
 if(/\b(?:kite|kiting|caitar|kitar|hit and run|orbwalk)\b/.test(s)){add('combatStyle','kite','Kite + ataques básicos');add('automation',{autoAttack:true},'AA ativo');recognized=true;}
 else if(/\b(?:on.?hit|dps on.?hit|efeitos de contato)\b/.test(s)){add('combatStyle','on_hit','Ataques básicos + efeitos on-hit');recognized=true;}
 else if(/\b(?:skill\s*\+\s*aa|habilidade\s*\+\s*aa|skills? e aa|habilidade e ataque basico)\b/.test(s)){add('combatStyle','skill_aa','Habilidades + AA');add('order',{kind:'attack',spell:'Q',combatStyle:'skill_aa'},'Ataque + Q aprendido');recognized=true;}
 else if(/\b(?:ataqu(?:e|es) basico|autoataqu(?:e|es)|auto attack|\baa\b)\b/.test(s)){add('combatStyle','aa','Somente ataques básicos (AA)');recognized=true;}

 // Persistent per-champion skill plans; avoid confusing "focus Q" with a
 // single instant skill point. All aliases use this one deterministic plan.
 const skillIntent=/\b(?:focar|foco|prioriz\w*|ordem de up|ordem de skill|ordem de habilidade|maximizar|maxar|auto\s*upar|upar automatico|auto level|\d+\s*(?:pontos?|ranks?)\s*(?:no|na|em)?\s*[qwer])\b/.test(s)&&/(?:\b(?:upar|skill|habilidade|rank|ponto|up|q|w|e|r)\b.*\b[qwer]\b|\bfocar\s+(?:o\s+|a\s+)?[qwer]\b|\b[qwer]\s+(?:depois|antes))/i.test(s);
 const rankLimit=s.match(/\b(?:upar|focar|deixar|colocar|pegar)?\s*(\d+)\s*(?:pontos?|ranks?|niveis?)\s*(?:no|na|em|de|do)?\s*([qwer])\b/)||s.match(/\b([qwer])\s*(?:ate|com)\s*(\d+)\s*(?:pontos?|ranks?|niveis?)\b/);
 const partial=rankLimit?(Number.isNaN(+rankLimit[1])?{slot:rankLimit[1].toUpperCase(),target:Number(rankLimit[2])}:{slot:rankLimit[2].toUpperCase(),target:Number(rankLimit[1])}):null;
 if(skillIntent){
  // Limit extraction to the skill intent, not an unrelated combo QWER later in
  // the same utterance. Names have already been resolved before this stage.
  const section=s.split(/\b(?:combo|combar|farmar|gank|wardar|comprar|recall|dar b|dar base)\b/)[0];
  let list=[...section.matchAll(/\b[qwer]\b/g)].map(m=>m[0].toUpperCase());
  if(partial)list=[partial.slot,...list.filter(v=>v!==partial.slot)];
  // For Udyr, R is an ordinary stance, not a gated ultimate.
  list=[...new Set(list.filter(k=>k!=='R'||unit.champ==='Udyr'))];
  if(list.length){
   const basics=unit.champ==='Udyr'?['Q','W','E','R']:['Q','W','E'];
   const priority=[...list,...basics.filter(k=>!list.includes(k))];
   const phases=partial&&partial.target>=1&&partial.target<=(unit.champ==='Udyr'?6:5)?
    [{slot:partial.slot,target:partial.target},{slot:priority.find(k=>k!==partial.slot)||'W',target:5},{slot:partial.slot,target:5},...priority.filter(k=>k!==partial.slot&&k!==priority.find(t=>t!==partial.slot)).map(k=>({slot:k,target:5}))]:
    priority.map(slot=>({slot,target:unit.champ==='Udyr'?6:5}));
   add('skillPlan',{priority,opening:priority,phases,auto:true,autoR:true},'Auto-up: abertura '+priority.join('→')+' · '+phases.map(p=>p.slot+' '+p.target+'/5').join(' → ')+(unit.champ==='Udyr'?' · R é postura':' · R 6/11/16'));
   recognized=true;
  }
 }else{
  const up=s.match(/\b(?:upar|up|evoluir|subir|melhorar|upgrade)\s+(?:a\s+|o\s+|skill\s+|habilidade\s+)?([qwer])\b/);
  if(up){add('upgradeSkill',up[1].toUpperCase(),'Upar '+up[1].toUpperCase());recognized=true;}
 }
 const comboMatch=s.match(/\b(?:combo|combar|sequencia de skills)\s*(?:de|com|:|=)?\s*([qwer](?:\s*(?:\+|>|,|\s)\s*[qwer]){0,7})/);
 if(comboMatch){const combo=[...comboMatch[1].toUpperCase().matchAll(/[QWER]/g)].map(m=>m[0]).slice(0,8);if(combo.length){add('order',{kind:'attack',combatStyle:'combo',combo},'Combate '+combo.join('→')+' (somente skills aprendidas)');recognized=true;}}
 if(/\b(?:atacar|agredir|matar|eliminar|abater|focar|foco|burst|bater no inimigo|trocar dano|focar inimigo|2v1|3v1)\b/.test(s)&&!comboMatch&&!skillIntent){
  // A known enemy can be requested by name even before it enters vision.
  // The movement/focus goal persists, but actual attacks require live vision.
  const enemy=arena.units.find(v=>v.team!==team&&[fold(v.champ),...(CHAMP_ALIASES[v.champ]||[]).map(fold)].some(k=>new RegExp('\\b'+escapeRe(k)+'\\b').test(s)));
  add('order',{kind:'attack',spell:'none',...(enemy&&arena.visible(team,enemy)?{targetId:enemy.id}:{})},enemy?'Focar '+enemy.champ+' quando visível':'Atacar inimigo visível');recognized=true;
 }
 if(role==='JG'&&/\b(?:auto jungle|limpar selva automaticamente|farmar jungle)\b/.test(s)){add('automation',{autoJungle:true},'Retomar jungle automática');add('order',{kind:'auto'},'Cancelar rota explícita');recognized=true;}
 if(/\b(?:recall|base\b|voltar?\s+(?:a\s+|para\s+|pra\s+)?base|dar\s+(?:o\s+)?b\b|da\s+b\b|de\s+b\b|apertar\s+b\b|dar\s+recall|recallar)\b/.test(s)&&!/(?:base inimiga)/.test(s)){
  add('order',{kind:'recall'},'Recall → loja na fonte');recognized=true;
 }
 if(/\b(?:sair da loja|seguir lane|voltar pra lane|retornar pra lane|sair da base)\b/.test(s)){
  add('leaveShop',true,'Sair da loja e seguir lane');recognized=true;
 }
 const buy=/\b(?:compr\w*|build(?:ar)?|fecha(?:r)?\s+item)\b/.test(s);
 if(buy){const hits=[];
  for(const [id,re] of Object.entries(itemAliases)){let m;const all=new RegExp(re.source,'g');while((m=all.exec(s)))hits.push({id,index:m.index});}
  hits.sort((a,b)=>a.index-b.index);
  if(!hits.length){warnings.push('Compra sem item reconhecido. Cite o nome do item do catálogo.');}
  else for(const {id} of hits)add('buy',id,'Comprar ou programar '+id.replaceAll('_',' '));recognized=true;
 }
 const buyingPet=buy&&/(?:gustwalker|mosstomper|scorchclaw|pet (?:azul|verde|vermelho)|jungle (?:azul|verde|vermelho)|companheiro (?:azul|verde|vermelho))/.test(s);
 const wardIntent=/\b(?:ward\w*|sentinel\w*|vision|visao|pink)\b/.test(s)&&!buy;
 const sequence=buyingPet||wardIntent?[]:/\b(?:red|blue|krug|golem|lobo|wolves|galinha|acuaminas?|raptor|gromp|sapo|limpar|invad|invade|jungle|selva|camps?)\b/.test(sWithoutSmite)?campsIn(sWithoutSmite,arena,team):[];
 if(sequence.length){
  recognized=true;
  if(role!=='JG')warnings.push('Limpeza de acampamentos atribuída a '+role+'; normalmente é função do JG.');
  const bad=sequence.find(v=>v.error);if(bad)warnings.push(bad.error);
  else add('plan',sequence.map(v=>({point:v.point,action:'jungle',duration:110,targetId:v.targetId})),sequence.map(v=>v.label).join(' → '));
 }
 if(smite.policy?.mode==='targets'&&!sequence.length&&smite.targetCamps?.length){const targets=smite.targetCamps;add('plan',targets.map(c=>({point:{x:c.x,y:c.y},action:['dragon','baron','herald'].includes(c.timerKey)?'objective':'jungle',duration:110,targetId:c.id})),targets.map(c=>c.timerKey).join(' → '));}
 const gank=/\b(?:gank\w*|gankar|gankar?|roam\w*|rotacion\w*)\b/.test(s);
 if(gank){recognized=true;const lane=/\b(?:top|topo)\b/.test(s)?'top':/\b(?:bot|bottom|inferior)\b/.test(s)?'bot':/\b(?:mid|meio)\b/.test(s)?'mid':null;
  if(!lane)warnings.push('Defina a lane do gank/roam: top, mid ou bot.');
  else{const point=lanePoint(arena,role,team,lane,.44);if(point){
   const prior=actions.find(a=>a.type==='plan');
   if(prior){prior.payload.push({point,action:'gank',duration:12});prior.label+=' → Gank '+lane.toUpperCase();}
   else add('plan',[{point,action:'gank',duration:12}],'Gank '+lane.toUpperCase());
  }else warnings.push('Rota inválida.');}
 }
 if(/\b(?:dragao|drake|dragon|barao|baron|herald|arauto)\b/.test(sWithoutSmite)&&!sequence.length){recognized=true;const key=/barao|baron/.test(s)?'baron':/herald|arauto/.test(s)?'herald':'dragon';const c=arena.camps.find(v=>v.timerKey===key);if(c)add('plan',[{point:{x:c.x,y:c.y},action:'objective',targetId:c.id,duration:30}],'Objetivo '+key);else warnings.push('Objetivo indisponível neste mapa.');}
 const ward=/\b(?:ward\w*|wardar|sentinel\w*|visao no mapa|pink)\b/.test(s)&&!buy;
 if(ward){recognized=true;const found=tacticalDestination(s,arena,team,role);
  if(found?.point)add('order',{kind:'ward',wardType:/\b(?:pink|control ward|sentinela de controle)\b/.test(s)?'control':'stealth',destination:found.point},'Wardar '+found.label);else warnings.push('Local de visão não identificado: cite red/blue/galinhas/tribush/top/mid/bot.');}
 const invade=/\b(?:invad\w*|invade)\b/.test(s);
 if(invade&&!sequence.length&&!ward){const found=tacticalDestination(s,arena,team,role);if(found){recognized=true;add('plan',[{point:found.point,action:'gank',duration:0}],'Invadir '+found.label+' (fog não revela inimigos)');}}
 const move=/\b(?:mover|movimentar|andar|caminhar|ir\s+(?:pra|para|pro|ao|na)|vai\s+(?:pra|para|pro|no|na))\b/.test(s)&&!sequence.length&&!gank&&!ward&&!invade;
 if(move&&!/\b(?:recall|base|loja)\b/.test(s)){
  recognized=true;
  const lane=/\b(?:top|topo)\b/.test(s)?'top':/\b(?:bot|bottom)\b/.test(s)?'bot':/\b(?:mid|meio)\b/.test(s)?'mid':null;
  if(lane){const p=lanePoint(arena,role,team,lane,.30);add('order',{kind:'move',destination:p},'Mover para '+lane.toUpperCase());}
  else {const found=tacticalDestination(s,arena,team,role);if(found)add('order',{kind:'move',destination:found.point},'Mover '+found.label);else warnings.push('Destino não identificado. Digite uma lane ou um local conhecido.');}
 }
 if(/\b(?:parar|stop|hold)\b/.test(s)){add('order',{kind:'stop'},'Parar');recognized=true;}
 if(!recognized)warnings.push('Não reconheci uma ação executável. Reformule com farmar, wardar, gankar, red, krugs, recall, comprar, etc.');
 return {role,source:seg.source,actions,warnings,valid:actions.length>0&&warnings.length===0};
}
export function interpretCommands(text,arena,{team='blue',selectedId=null}={}){
 if(typeof text!=='string'||!text.trim())return {ok:false,commands:[],errors:['Digite uma ordem.']};
 if(text.length>1800)return {ok:false,commands:[],errors:['Máximo de 1.800 caracteres por planejamento.']};
 const norm=fold(text);
 const formation=/\b1\s*[-:,]\s*3\s*[-:,]\s*1\b/.test(norm)||/\b1\s+3\s+1\b/.test(norm);
 const explicitMidTriad=formation&&/\b(?:adc|jinx)\b/.test(norm)&&/\b(?:sup|nami|suporte)\b/.test(norm)&&/\b(?:jg|warwick|warvick|jungle)\b/.test(norm);
 const parts=explicitMidTriad?['ADC','SUP','JG'].map(role=>compileSegment({role,body:'gankar mid',source:'1-3-1 '+role+' → MID'},arena,team)):
 splitSegments(text,selectedId,arena,team).map(s=>compileSegment(s,arena,team));
 const errors=parts.flatMap((p,i)=>p.warnings.map(w=>`${p.role||'Trecho '+(i+1)}: ${w}`));
 if(parts.some(p=>p.actions.some(a=>a.type==='order'&&a.payload.kind==='recall')&&p.actions.some(a=>a.type==='order'&&a.payload.kind==='move')))errors.push('Recall e movimento na mesma ordem: use rodadas separadas.');
 for(const cmd of parts){const u=arena.units.find(v=>v.team===team&&v.role===cmd.role);if(!u)continue;
  if(u.hp<=0)errors.push(`${cmd.role}: campeão eliminado; aguarde o respawn.`);
  if(cmd.actions.filter(a=>a.type==='plan').length>1)errors.push(`${cmd.role}: há duas rotas diferentes. Separe por rodada.`);
  for(const a of cmd.actions){if(a.type==='buy'){const item=arena.queuePurchase?true:false;if(!item)errors.push(`${cmd.role}: compras programadas indisponíveis.`);}
   if(a.type==='plan'){let anchor={x:u.x,y:u.y};for(const step of a.payload){if(!arena.walkable(step.point.x,step.point.y)||!arena.findPath(anchor,step.point)){errors.push(`${cmd.role}: rota sem passagem até ${a.label}.`);break;}anchor=step.point;}}
   if(a.type==='order'&&a.payload.destination&&(!arena.walkable(a.payload.destination.x,a.payload.destination.y)||!arena.findPath(u,a.payload.destination)))errors.push(`${cmd.role}: destino fora da malha.`);
  }
 }
 return {ok:errors.length===0&&parts.length>0,commands:parts,errors};
}
export function applyCommands(preview,arena,{team='blue'}={}){
 if(!preview?.ok)return {ok:false,errors:preview?.errors||['Plano inválido.']};
 if(arena.teams[team].ready||arena.pendingDecision)return {ok:false,errors:['Não é possível editar ordens durante execução ou confronto.']};
 // Snapshot only player-controlled mutable state. Rollback on any failure.
 const before=arena.units.filter(u=>u.team===team).map(u=>[u.id,JSON.parse(JSON.stringify(u))]);
 const errors=[];
 for(const cmd of preview.commands){const u=arena.units.find(v=>v.team===team&&v.role===cmd.role);if(!u){errors.push('Campeão não encontrado.');break;}
  for(const a of cmd.actions){let ok=true;
   if(a.type==='policy')ok=arena.setPolicy(team,u.id,a.payload);
   else if(a.type==='tactics'){u.tactics={...(u.tactics||{}),...a.payload};}
   else if(a.type==='combatStyle'){u.combatStyle=a.payload;}
   else if(a.type==='automation')ok=arena.setAutomation(team,u.id,a.payload);
   else if(a.type==='reaction')ok=arena.setReaction(team,u.id,a.payload);
   else if(a.type==='order')ok=arena.setOrder(team,u.id,a.payload).ok;
   else if(a.type==='plan')ok=arena.setPlan(team,u.id,a.payload).ok;
   else if(a.type==='upgradeSkill')ok=arena.upgradeSkill(team,u.id,a.payload).ok;
   else if(a.type==='skillPlan')ok=arena.setSkillPlan(team,u.id,a.payload);
   else if(a.type==='smitePolicy')ok=arena.setSmitePolicy(team,u.id,a.payload).ok;
   else if(a.type==='buy')ok=arena.purchaseOrPlan(team,u.id,a.payload).ok;
   else if(a.type==='leaveShop')ok=arena.leaveShop(team,u.id);
   if(!ok){errors.push(`${cmd.role}: não foi possível ${a.label.toLowerCase()}.`);break;}
  }
  if(errors.length)break;
 }
 if(errors.length){for(const [id,old] of before){const unit=arena.units.find(u=>u.id===id);Object.keys(unit).forEach(k=>delete unit[k]);Object.assign(unit,old);}return {ok:false,errors};}
 arena.event(`Plano de texto confirmado (${preview.commands.length} bloco(s), ${preview.commands.reduce((n,c)=>n+c.actions.length,0)} ação(ões)).`,team,'text_plan');
 return {ok:true,applied:preview.commands};
}
