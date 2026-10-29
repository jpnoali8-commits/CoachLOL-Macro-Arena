/**
 * Headless global coverage probe. Read-only toward gameplay code.
 * - 173 champion IDs x 4 slots x 2 player seats: actual abilityRule selection.
 * - All M9 QWER, M16 partial slots and M14 form variants x 2 seats:
 *   queue -> authoritative resolution -> state/resource mutation summary.
 * No queue result or generic effect certifies a champion's LoL skill parity.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,abilityRule,CHAMPION_BASE_ROSTER_V453_DEV69,
 BOARD_KITS_V453_DEV69,M16_MECHANIC_KITS,FORM_KITS_V453_M14,
 M15_ENTITY_KITS_V453} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const teams=['blue','red'];
const names=Object.keys(CHAMPION_BASE_ROSTER_V453_DEV69).sort();
assert.equal(names.length,173,'frozen baseline count');
const roles=['Q','W','E','R'];
function arenaFor(c,team){
 const a=new Arena(map,mask,{seed:693170,mode:'pvp',draft:{[team]:{MID:c}}});
 for(const x of a.units)Object.assign(x,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false,combatUntil:0,deadUntil:0});
 const u=a.units.find(x=>x.id===team+'_MID');
 const enemy=a.units.find(x=>x.id===(team==='blue'?'red':'blue')+'_MID');
 const ally=a.units.find(x=>x.id===team+'_TOP');
 assert.ok(u&&enemy&&ally);
 Object.assign(u,{champ:c,x:.5,y:.5,level:16,hp:2000,maxHp:2000,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0},boardFuryV453M14:100});
 Object.assign(enemy,{x:.505,y:.5,hp:2500,maxHp:2500,armor:0,mr:0});
 Object.assign(ally,{x:.503,y:.5,hp:1000,maxHp:2000});
 a.canSeePoint=()=>true;a.visible=()=>true;
 return {a,u,enemy,ally};
}
const reference=arenaFor('Annie','blue');
let lookupCount=0,training=0;const selection={};
for(const team of teams){
 const unit=reference.a.units.find(x=>x.id===team+'_MID');
 for(const champion of names){
  unit.champ=champion;unit.boardFormV453M14=null;
  for(const slot of roles){
   const rule=abilityRule(unit,slot);
   assert.ok(rule&&typeof rule.kind==='string',champion+' '+slot+' needs a valid rule object');
   selection[rule.kind]=(selection[rule.kind]||0)+1;
   lookupCount++;if(rule.kind==='training')training++;
  }
 }
}
assert.equal(lookupCount,173*4*2);
console.log('AUDIT_GLOBAL_RULES '+JSON.stringify({champions:names.length,
 slotsPerChampion:4,teamSeats:2,actualRuleLookups:lookupCount,
 trainingFallbacks:training,kindCounts:selection,
 caution:'Rule existence is not gameplay proof; PASS here means lookup did not crash'}));
const contract=[];
for(const [champ,kit] of Object.entries(BOARD_KITS_V453_DEV69))
 for(const slot of roles)contract.push({family:'M9_BOARD',champ,slot});
for(const [champ,kit] of Object.entries(M16_MECHANIC_KITS))
 for(const slot of roles)if(kit[slot])contract.push({family:'M16_MECHANIC',champ,slot});
for(const [champ,forms] of Object.entries(FORM_KITS_V453_M14))
 for(const [form,kit] of Object.entries(forms))
  for(const slot of roles)contract.push({family:'M14_FORM',champ,slot,form});
for(const [champ,kit] of Object.entries(M15_ENTITY_KITS_V453))
 for(const slot of roles)if(kit[slot])contract.push({family:'M15_ENTITY',champ,slot});
const expected=Object.keys(BOARD_KITS_V453_DEV69).length*4+
 Object.values(M16_MECHANIC_KITS).reduce((n,k)=>n+roles.filter(s=>k[s]).length,0)+
 Object.values(FORM_KITS_V453_M14).reduce((n,v)=>n+Object.keys(v).length*4,0)+
 Object.values(M15_ENTITY_KITS_V453).reduce((n,k)=>n+roles.filter(s=>k[s]).length,0);
assert.equal(contract.length,expected);
const records=[],errors=[];
for(const team of teams){
 for(const c of contract){
  try{
   const {a,u,enemy,ally}=arenaFor(c.champ,team);
   if(c.form)u.boardFormV453M14=c.form;
   if(c.champ==='Kaisa')u.m16KaisaEvolvedE=true;
   const rule=a.boardKitForV453Dev69(c.champ,c.slot,u);
   if(!rule)throw Error('authored contract not routed to board executor');
   const shape=rule.shape;
   const point=['circle_enemy','line_enemy','cone_enemy','vision_point','move_point'].includes(shape)
    ?{x:.509,y:.5}:null;
   const targetId=shape==='target_enemy'?enemy.id:shape==='target_ally'?ally.id:null;
   const manaBefore=u.mana,enemyHp=enemy.hp,allyHp=ally.hp;
   const result=a.queueBoardSkillV453Dev69(team,u.id,c.slot,{point,targetId});
   let charged=false,applied=false,scheduled=false,after=null;
   if(result.ok){
    a.resolveBoardSkillsV453Dev69();
    charged=u.mana<manaBefore || (u.skillCds[c.slot]||0)>0;
    scheduled=!!u.m16JhinChannel || (a.boardTemporalV453Dev69||[]).some(v=>v.ownerId===u.id);
    applied=enemy.hp!==enemyHp || ally.hp!==allyHp ||
      !!a.m16Traps?.some(v=>v.ownerId===u.id) ||
      !!a.boardSummonsV453Dev69?.some(v=>v.ownerId===u.id) ||
      !!u.m16StealthV453 || !!u.boardSpeedV453Dev69 || scheduled;
    after={mana:u.mana,skillCd:u.skillCds[c.slot]||0,enemyHp:enemy.hp};
   }
   records.push({team,...c,shape,queued:!!result.ok,reason:result.ok?null:result.reason,
    charged,applied,scheduled,passiveOnly:!!rule.passiveOnly,after});
  }catch(e){
   errors.push({team,...c,error:String(e?.message||e)});
  }
 }
}
const byFamily={};
for(const r of records){
 const a=byFamily[r.family]??={cases:0,queued:0,rejected:0,charged:0,applied:0,
   passiveOnly:0,reasons:{}};
 a.cases++;
 if(r.queued){a.queued++;if(r.charged)a.charged++;if(r.applied)a.applied++;}
 else {a.rejected++;a.reasons[r.reason]=(a.reasons[r.reason]||0)+1;}
 if(r.passiveOnly)a.passiveOnly++;
}
const issues=records.filter(x=>!x.queued&&!x.passiveOnly);
console.log('AUDIT_AUTHORED_SLOTS '+JSON.stringify({
 authoredContracts:contract.length,teamSeats:2,executedRequests:records.length,
 familyStats:byFamily,unexpectedExceptions:errors.length,
 caution:'Queue success, resource debit and generic state changes do NOT certify individual mechanics'}));
for(const i of issues.slice(0,40))console.log('AUDIT_REJECTED '+JSON.stringify({
 team:i.team,champ:i.champ,slot:i.slot,form:i.form||null,family:i.family,reason:i.reason}));
for(const e of errors.slice(0,20))console.log('AUDIT_EXCEPTION '+JSON.stringify(e));
if(errors.length)process.exitCode=1;
