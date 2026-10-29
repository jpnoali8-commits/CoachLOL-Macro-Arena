/**
 * CoachLOL V4.5.3-dev44 — transport-agnostic, server-owned PvP input boundary.
 * This is NOT a public network server, matchmaking service, authentication or
 * a claim that all champion kits are implemented. A trusted server maps its
 * authenticated connection to a seatId; never accept player/team from packets.
 */
import {canonicalStateV40} from '../engine.mjs';

const VALID_KINDS=Object.freeze([
 'order.move','order.attack','order.stop','order.recall','order.ward',
 'skill.directional','skill.ground','skill.targeted','skill.self','skill.onhit_target','skill.ultimate',
 'skill.recast_vex','skill.upgrade','skill.hijack','skill.neeko_disguise','skill.neeko_shoma','skill.kalista_launch','summon.order','summoner.queue','item.queue','item.activate'
]);
export const PLAYER_ACTION_KINDS_V453_DEV44=VALID_KINDS;
const allowed=new Set(VALID_KINDS);
const extraV47=new Set(['order.retreat','order.plant','order.combo','decision.reaction','decision.duel','item.buy','item.sell','item.cancelQueue','item.undo']);
const validV47=(kind,p)=>kind==='order.combo'?shape(p,['targetId','steps'])&&validId(p.targetId)&&Array.isArray(p.steps)&&p.steps.length>=1&&p.steps.length<=12&&p.steps.every(x=>['Q','W','E','R','FLASH','IGNITE','EXHAUST','HEAL','BARRIER','GHOST','CLEANSE'].includes(x)):kind==='item.buy'?shape(p,['itemId'])&&validId(p.itemId):['item.sell','item.cancelQueue'].includes(kind)?shape(p,['index'])&&Number.isInteger(p.index)&&p.index>=0&&p.index<=11:kind==='item.undo'?shape(p,[]):kind==='order.retreat'?shape(p,[]):kind==='order.plant'?shape(p,['plantId','angle'])&&validId(p.plantId)&&Number.isFinite(p.angle)&&p.angle>=-Math.PI*2&&p.angle<=Math.PI*2:kind==='decision.duel'?shape(p,['response'])&&['defend','heal','peel','fight','retreat'].includes(p.response):kind==='decision.reaction'?shape(p,['targetId','response','steps'],['chase'])&&validId(p.targetId)&&['fight','defend','retreat','peel'].includes(p.response)&&Array.isArray(p.steps)&&p.steps.length<=12&&p.steps.every(x=>['Q','W','E','R','FLASH','IGNITE','EXHAUST','HEAL','BARRIER','GHOST','CLEANSE'].includes(x))&&(!own(p,'chase')||typeof p.chase==='boolean'):false;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const validId=v=>typeof v==='string'&&v.length>0&&v.length<=96&&/^[A-Za-z0-9_-]+$/.test(v);
const point=v=>plain(v)&&Object.keys(v).sort().join(',')==='x,y'&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.x<=1&&v.y>=0&&v.y<=1;
const slot=v=>['Q','W','E','R'].includes(v);
const stringId=v=>validId(v);
const fail=reason=>({ok:false,reason});
const shape=(payload,required,optional=[])=>plain(payload)&&required.every(k=>own(payload,k))&&Object.keys(payload).every(k=>required.includes(k)||optional.includes(k));
function validated(kind,p){
 switch(kind){
  case 'order.move':return shape(p,['point'])&&point(p.point);
  case 'order.ward':return shape(p,['point'],['wardType'])&&point(p.point)&&(!own(p,'wardType')||['stealth','control','farsight'].includes(p.wardType));
  case 'order.attack':return shape(p,['targetId'])&&stringId(p.targetId);
  case 'order.stop':case 'order.recall':return shape(p,[]);
  case 'skill.directional':case 'skill.ground':return shape(p,['slot','point'])&&slot(p.slot)&&point(p.point);
  case 'skill.targeted':return shape(p,['slot','targetId'])&&slot(p.slot)&&stringId(p.targetId);
  case 'skill.self':return shape(p,['slot'])&&slot(p.slot);
  case 'skill.kalista_launch':return shape(p,['point'])&&point(p.point);
  case 'skill.hijack':return shape(p,['targetId'])&&validId(p.targetId);
  case 'skill.neeko_disguise':return shape(p,['appearanceId'])&&validId(p.appearanceId);
  case 'skill.neeko_shoma':return shape(p,['sourceId'])&&validId(p.sourceId);
  case 'skill.onhit_target':return shape(p,['slot','targetId'])&&slot(p.slot)&&stringId(p.targetId);
  case 'skill.ultimate':return shape(p,[],['point','targetId'])&&(!own(p,'point')||point(p.point))&&(!own(p,'targetId')||stringId(p.targetId));
  case 'skill.recast_vex':return shape(p,[]);
  case 'skill.upgrade':return shape(p,['slot'])&&slot(p.slot);
  case 'summon.order':return shape(p,['summonId'],['point','targetId'])&&
   validId(p.summonId)&&(own(p,'point')!==own(p,'targetId'))&&
   (!own(p,'point')||point(p.point))&&(!own(p,'targetId')||validId(p.targetId));
  case 'summoner.queue':return shape(p,['type'],['targetId'])&&['heal','ignite','exhaust','tp','barrier','ghost','cleanse'].includes(p.type)&&(!own(p,'targetId')||stringId(p.targetId));
  case 'item.queue':case 'item.buy':case 'item.activate':return shape(p,['itemId'])&&stringId(p.itemId);
  case 'item.undo':return shape(p,[]);
  case 'item.sell':case 'item.cancelQueue':return shape(p,['index'])&&Number.isInteger(p.index)&&p.index>=0&&p.index<=11;
  default:return false;
 }
}
function dispatch(arena,unit,kind,p){
 const team=unit.team,id=unit.id;
 switch(kind){
  case 'decision.duel':return arena.respondToDuel(team,id,p.response)?{ok:true}:fail('duelo_indisponivel');
  case 'decision.reaction':{const r=arena.queueReactionCombo(team,id,p.targetId,p.steps,{response:p.response,chase:p.chase||false});if(r.ok&&p.response==='retreat')arena.requestRetreatV453Dev45(team,id);return r;}
  case 'order.retreat':return arena.requestRetreatV453Dev45(team,id);
  case 'order.plant':return arena.requestRiftPlantV453Dev45(team,id,p.plantId,p.angle);
  case 'order.combo':{
   // Dev65: planned attacks use the SAME authoritative queue as reactions,
   // but cannot bypass learned skills, immutable loadout or fog.
   const target=arena.units.find(x=>x.id===p.targetId&&x.team!==team&&x.hp>0);
   if(!target||!arena.visible(team,target))return fail('alvo_invisivel_ou_invalido');
   for(const step of p.steps){
    if(step.length===1&&!(unit.skillRanks?.[step]>0))return fail(step+'_nao_aprendida');
    if(step.length>1&&!arena.hasSummonerV452d4Dev11(unit,step.toLowerCase()))return fail(step+'_nao_equipado');
   }
   return arena.setOrder(team,id,{kind:'attack',targetId:target.id,combo:[...p.steps]});
  }
  case 'order.move':return arena.setOrder(team,id,{kind:'move',destination:p.point});
  case 'order.attack':return arena.setOrder(team,id,{kind:'attack',targetId:p.targetId});
  case 'order.stop':return arena.setOrder(team,id,{kind:'stop'});
  case 'order.recall':return arena.setOrder(team,id,{kind:'recall'});
  case 'order.ward':return arena.setOrder(team,id,{kind:'ward',destination:p.point,wardType:p.wardType||'stealth'});
  case 'skill.directional':return arena.queueDirectionalSkill(team,id,p.slot,p.point);
  case 'skill.ground':return arena.queueKitSkillV42(team,id,p.slot,p.point);
  case 'skill.targeted':return arena.queueTargetedSkill(team,id,p.slot,p.targetId);
  case 'skill.self':return arena.queueKitSkillV42(team,id,p.slot,null);
  case 'skill.kalista_launch':return arena.queueKalistaLaunchV453M14(team,id,p.point);
  case 'skill.hijack':return arena.queueSylasHijackV453M14(team,id,p.targetId);
  case 'skill.neeko_disguise':return arena.queueNeekoDisguiseV453M15(team,id,p.appearanceId);
  case 'skill.neeko_shoma':return arena.queueNeekoShomaV453M15(team,id,p.sourceId);
  case 'skill.onhit_target': {
   // Only audited Q variants. Never auto-convert all skills to a generic on-hit.
   if(p.slot!=='Q'||!['Ezreal','Irelia'].includes(unit.champ)||!(unit.skillRanks?.Q>0))return fail('habilidade_individual_nao_certificada');
   const target=arena.units.find(v=>v.id===p.targetId&&v.hp>0&&v.team!==team);
   if(!target)return fail('alvo_invalido');
   return arena.setOrder(team,id,{kind:'attack',targetId:target.id,combo:['Q']});
  }
  case 'skill.ultimate':return arena.boardKitForV453Dev69?.(unit.champ,'R',unit)?
   arena.queueBoardSkillV453Dev69(team,id,'R',{point:p.point??null,targetId:p.targetId??null}):
   arena.queueSpecialUltimate(team,id,p.targetId??null,p.point??null);
  case 'skill.recast_vex':return arena.queueVexRecast(team,id);
  case 'summon.order':return arena.queueBoardSummonOrderV453Dev69(team,id,p.summonId,
   {point:p.point??null,targetId:p.targetId??null});
  case 'skill.upgrade':return arena.upgradeSkill(team,id,p.slot);
  case 'summoner.queue':return arena.queueSummoner(team,id,p.type,p.targetId??null);
  case 'item.queue':return arena.queuePurchase(team,id,p.itemId);
  case 'item.buy':return arena.buy(team,id,p.itemId)?{ok:true}:arena.canBuy(team,id,p.itemId);
  case 'item.sell':return arena.sellItemV43(team,id,p.index);
  case 'item.undo':return arena.undoShopV453Dev61(team,id);
  case 'item.cancelQueue':return arena.cancelQueuedPurchase(team,id,p.index)?{ok:true}:fail('cancelamento_indisponivel');
  case 'item.activate':return arena.activateItemV453Dev59(team,id,p.itemId);
  default:return fail('acao_nao_certificada');
 }
}
export class AuthoritativeActionsV453Dev44 {
 constructor(arena,seats,{restoredState=null}={}){
  if(!arena?.units||typeof arena.perspective!=='function')throw Error('arena_autoritativa_obrigatoria');
  this.arena=arena;this.seats=new Map();this.revision=0;this.receipts=new Map();
  if(!Array.isArray(seats)||!seats.length)throw Error('seats_obrigatorios');
  const claimed=new Set();
  for(const seat of seats){
   if(!plain(seat)||!validId(seat.seatId)||!validId(seat.unitId)||this.seats.has(seat.seatId))throw Error('seat_invalido_ou_duplicado');
   const unitIds=seat.unitIds??[seat.unitId];
   if(!Array.isArray(unitIds)||unitIds.length<1||unitIds.length>5||!unitIds.includes(seat.unitId)||new Set(unitIds).size!==unitIds.length)throw Error('selecao_de_unidades_invalida');
   const u=arena.units.find(u=>u.id===seat.unitId);
   if(!u||!['blue','red'].includes(u.team))throw Error('unidade_nao_existe');
   for(const id of unitIds){
    if(!validId(id)||claimed.has(id)||!arena.units.some(v=>v.id===id&&v.team===u.team))throw Error('unidade_nao_autorizada_ou_duplicada');
    claimed.add(id);
   }
   // The server decides every unit allowed under this seat; a packet cannot claim the other team.
   this.seats.set(seat.seatId,{unitId:u.id,unitIds:[...unitIds],team:u.team,lastSequence:0});
   this.receipts.set(seat.seatId,new Map());
  }
  if(restoredState)this.restore(restoredState);
 }
 /** Trusted transport passes a seatId derived from server-side authentication. */
 submit(seatId,message){
  const seat=this.seats.get(seatId);if(!seat)return fail('seat_desconhecido');
  if(!plain(message)||Object.keys(message).some(k=>!['sequence','kind','payload','unitId'].includes(k))||
   !Number.isSafeInteger(message.sequence)||message.sequence<1||!(allowed.has(message.kind)||(this.dev47Enabled&&extraV47.has(message.kind)))||!(this.dev47Enabled&&extraV47.has(message.kind)?validV47(message.kind,message.payload):validated(message.kind,message.payload)))return fail('comando_invalido');
  const selectedUnitId=message.unitId??seat.unitId;
  if(!validId(selectedUnitId)||!seat.unitIds.includes(selectedUnitId))return fail('unidade_nao_autorizada');
  // Old MID-only packets retain the exact dev47 receipt canonical. Multi-unit
  // packets include their chosen unit in the idempotency key.
  const canonical=canonicalStateV40({kind:message.kind,payload:message.payload,...(message.unitId?{unitId:selectedUnitId}:{})});
  const receipts=this.receipts.get(seatId),old=receipts.get(message.sequence);
  if(old)return old.canonical===canonical?structuredClone(old.result):fail('sequencia_reutilizada_com_dados_diferentes');
  if(message.sequence!==seat.lastSequence+1)return fail('sequencia_fora_de_ordem');
  const unit=this.arena.units.find(u=>u.id===selectedUnitId&&u.team===seat.team);
  if(!unit)return fail('unidade_invalida');
  // Reaction windows are exceptions: ONLY the actual defender may answer.
  const reacting=this.dev47Enabled&&(['decision.reaction','decision.duel'].includes(message.kind)||(message.kind==='item.activate'&&this.arena.phase==='decision'));
  if(this.arena.ended||(!reacting&&(this.arena.teams[seat.team]?.ready||!['planning','preparation'].includes(this.arena.phase))))return fail('fase_bloqueada');
  if(reacting&&(this.arena.phase!=='decision'||this.arena.pendingDecision?.unitId!==unit.id||!(message.kind==='item.activate'||(message.kind==='decision.duel'?this.arena.pendingDecision?.kind==='duel_request':['combat_reaction','pickoff_reaction'].includes(this.arena.pendingDecision?.kind)))))return fail('decisao_nao_autorizada');
  const payload=structuredClone(message.payload);
  const targetId=payload.targetId;
  if(targetId){
   const alias=this.arena.m15ResolvePublicId?.(seat.team,targetId);
   const resolved=alias||targetId;
   const target=this.arena.units.find(u=>u.id===resolved&&u.hp>0)||
    this.arena.boardSummonsV453Dev69?.find(u=>u.id===resolved&&u.hp>0&&u.until>this.arena.gameTime);
   if(!target)return fail('alvo_indisponivel');
   if(target.team!==seat.team){
    // Never accept the real stable ID behind a currently masked champion.
    const concealed=target.champ==='Neeko'&&target.neekoDisguiseV453M15||
     target.champ==='Shaco'&&this.arena.boardSummonsV453Dev69.some(e=>
      e.id===target.shacoCloneIdV453M15&&e.hp>0&&e.until>this.arena.gameTime)||
     target.m16DecoyPublicAlias&&this.arena.boardSummonsV453Dev69.some(e=>
      e.id===(target.m16WukongCloneId||target.m16LeblancCloneId)&&
      e.hp>0&&e.until>this.arena.gameTime);
    if((concealed||['neeko_clone','shaco_clone'].includes(target.kind))&&!alias)
     return fail('alvo_identidade_oculta');
    const seen=target.kind&&!target.champ?
     this.arena.canSeePoint(seat.team,target)&&target.stealthUntil<=this.arena.gameTime:
     this.arena.visible(seat.team,target);
    if(!seen&&!(reacting&&this.arena.pendingDecision?.enemyId===resolved))
     return fail('alvo_indisponivel');
   }
   payload.targetId=resolved;
  }
  const result=dispatch(this.arena,unit,message.kind,payload);
  if(!result?.ok)return fail(typeof result?.reason==='string'?result.reason:'acao_rejeitada_pelo_motor');
  this.revision++;seat.lastSequence=message.sequence;
  // No full-world snapshots, server secrets, enemy positions or RNG in replies.
  const ack={ok:true,sequence:message.sequence,revision:this.revision,unitId:unit.id,kind:message.kind};
  receipts.set(message.sequence,{canonical,result:ack});
  return structuredClone(ack);
 }
 view(seatId){
  const seat=this.seats.get(seatId);if(!seat)return null;
  // Existing fog-filtered projection — DO NOT expose snapshotV40() to clients.
  const data=structuredClone(this.arena.perspective(seat.team));
  return {revision:this.revision,team:seat.team,controlledUnitId:seat.unitId,controlledUnitIds:[...seat.unitIds],...data};
 }
 exportSession(){
  return {schema:'coachlol.pvp-input.v1',revision:this.revision,
   seats:[...this.seats].map(([seatId,s])=>({seatId,unitId:s.unitId,unitIds:[...s.unitIds],lastSequence:s.lastSequence,receipts:[...this.receipts.get(seatId)].map(([sequence,r])=>({sequence,...r}))}))};
 }
 restore(state){
  if(state?.schema!=='coachlol.pvp-input.v1'||!Number.isSafeInteger(state.revision)||state.revision<0||
     !Array.isArray(state.seats)||state.seats.length!==this.seats.size)throw Error('gateway_checkpoint_invalido');
  for(const record of state.seats){
   const seat=this.seats.get(record.seatId);
   if(!seat||seat.unitId!==record.unitId||(record.unitIds&&JSON.stringify(seat.unitIds)!==JSON.stringify(record.unitIds))||!Number.isSafeInteger(record.lastSequence)||record.lastSequence<0||
      !Array.isArray(record.receipts)||record.receipts.some(r=>!Number.isSafeInteger(r.sequence)||r.sequence<1||r.sequence>record.lastSequence||typeof r.canonical!=='string'||r.result?.ok!==true))throw Error('gateway_checkpoint_invalido');
  }
  this.revision=state.revision;
  for(const record of state.seats){
   this.seats.get(record.seatId).lastSequence=record.lastSequence;
   this.receipts.set(record.seatId,new Map(record.receipts.map(r=>[r.sequence,{canonical:r.canonical,result:structuredClone(r.result)}])));
  }
 }
}
