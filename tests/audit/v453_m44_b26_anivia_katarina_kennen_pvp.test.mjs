/* M44 B26: nine authored board skills, blue/red PvP, no generic fallback. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs='Annie'){
 const opp=side==='blue'?'red':'blue',a=new Arena(map,mask,{
  mode:'pvp',seed:26026,draft:{[side]:{MID:mine},[opp]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===opp+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{
   const r=original(actor,cmd);if(actor.id===u.id)receipt=r;return r};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));
  return receipt;
 };
 const turn=(n=.5)=>{a.gameTime+=n;a.round++;a.actionLocksV40={};};
 return {a,u,v,opp,cast,turn};
}
const test=(name,mine,fn,theirs='Annie')=>cases.push({name,mine,fn,theirs});
const pt=v=>({x:v.x,y:v.y});
test('nine previously missing source slots have exact identities','Anivia',()=>{
 for(const [champ,slots] of [['Anivia','QWE'],['Katarina','QWR'],['Kennen','WER']])
  for(const slot of slots)
   assert.equal(m44B14DOriginalBoardRuleV453(champ,slot)?.m44B26Id,
    champ+'.'+slot);
 assert.equal(m44B14DOriginalBoardRuleV453('Aatrox','Q'),null);
});
test('Anivia Q passage hits and chills without a premature detonation','Anivia',({a,u,v,cast})=>{
 const hp=v.hp,mana=u.mana,r=cast('Q',{point:pt(v)});
 assert.equal(r.flashFrost,true);assert.equal(v.hp,hp);
 assert.equal(u.mana,mana-100);
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<hp);assert.ok(v.m44B26Chilled?.[u.id]>.5);
 assert.equal(a.effectResolverV41().has(v,'stun'),false);
 const afterPass=v.hp;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,afterPass); // no double-debit from a repeated scheduler call

});
test('Anivia Q blocked by shield does not apply chill','Anivia',({a,u,v,cast})=>{
 a.applyEffectV41(v,'spell_shield',{source:v,duration:2,key:'b26_anivia_shield'});
 cast('Q',{point:pt(v)});const hp=v.hp;
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);assert.equal(v.m44B26Chilled?.[u.id],undefined);
});
test('Anivia W creates pathfinding wall with five-second lifetime','Anivia',({a,u,cast})=>{
 const r=cast('W',{point:{x:.55,y:.5}});assert.equal(r.crystallize,true);
 assert.equal(r.endpoints.length,2);
 assert.ok(a.m44B18SkillWallLineV453({x:.535,y:.5},{x:.565,y:.5}));
 assert.equal(a.m44B18SkillWallsV453().length>0,true);
 a.gameTime=5.1;assert.equal(a.m44B18SkillWallsV453().length,0);
});
test('Anivia W wall is visible to enemy and friendly movement colliders','Anivia',({a,u,v,cast})=>{
 cast('W',{point:{x:.55,y:.5}});
 const wall=a.m44B18SkillWallsV453()[0];
 assert.equal(wall.movement,'all');
 assert.ok(a.m44B18SkillWallLineV453({x:.53,y:.5},{x:.57,y:.5},[wall],u));
 assert.ok(a.m44B18SkillWallLineV453({x:.53,y:.5},{x:.57,y:.5},[wall],v));
});
test('Anivia W rejects invalid destination without mana debit','Anivia',({a,u})=>{
 const mana=u.mana,cd=u.skillCds.W;
 const r=a.executeBoardSkillV453Dev69(u,{slot:'W',point:{x:1,y:1}});
 assert.equal(r.ok,false);assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
});
test('Anivia E deals double damage on source-authored chill','Anivia',({a,u,v,cast,turn})=>{
 const hp=v.hp;cast('E',{targetId:v.id});const first=hp-v.hp;
 turn();u.skillCds.E=0;v.m44B26Chilled={[u.id]:a.gameTime+4};
 const secondHp=v.hp,r=cast('E',{targetId:v.id});
 assert.equal(r.doubleDamage,true);assert.ok(secondHp-v.hp>=first*1.9);
});
test('Anivia R existing storm primes the new source-owned chill','Anivia',({a,u,v,cast})=>{
 v.x=.525;const r=cast('R',{point:pt(v)});assert.ok(r.glacialStorm);
 a.gameTime=1;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.m44B26Chilled?.[u.id]>1);
});
test('Katarina Q hits up to three distinct victims and schedules a dagger','Katarina',({a,u,v,opp,cast})=>{
 const others=a.units.filter(z=>z.team===opp&&z.id!==v.id).slice(0,2);
 for(let i=0;i<others.length;i++)Object.assign(others[i],{x:v.x+(i+1)*.01,y:v.y});
 const r=cast('Q',{targetId:v.id});
 assert.equal(r.hitIds.length,3);assert.equal(new Set(r.hitIds).size,3);
 a.gameTime=1.03;a.advanceBoardTemporalV453Dev69();
 assert.ok(u.m44B26Daggers?.length>0);
});
test('Katarina W grants movement buff and delayed dagger at old location','Katarina',({a,u,cast})=>{
 const old={x:u.x,y:u.y},mana=u.mana,r=cast('W');
 assert.equal(r.preparation,true);assert.ok(u.boardSpeedV453Dev69.until>0);
 assert.equal(u.mana,mana);
 u.x+=.035;a.gameTime=1.25;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.m44B26Daggers.length,1);
 assert.deepEqual({x:u.m44B26Daggers[0].x,y:u.m44B26Daggers[0].y},old);
});
test('Katarina passive dagger pickup applies nearby damage and refunds E CD','Katarina',({a,u,v,cast})=>{
 v.x=.5;v.y=.5;cast('W');
 u.x=.54;a.gameTime=1.25;a.advanceBoardTemporalV453Dev69();
 assert.ok(u.m44B26Daggers?.length);
 const hp=v.hp;u.skillCds.E=0;a.actionLocksV40={};a.round++;
 const r=cast('E',{targetId:v.id});
 assert.ok(r.shunpo);assert.ok(r.daggersCollected>=1);
 assert.ok(v.hp<hp);
 assert.equal(u.m44B26Daggers.length,0);
});
test('Katarina R channels several ticks, maximum three enemy champions','Katarina',({a,u,v,cast})=>{
 v.x=.515;const hp=v.hp,r=cast('R');
 assert.equal(r.deathLotus,true);assert.equal(v.hp,hp);
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();assert.ok(v.hp<hp);
 const h=v.hp;a.gameTime=1;a.advanceBoardTemporalV453Dev69();assert.ok(v.hp<h);
});
test('Katarina R stun cancels future ticks via shared channel policy','Katarina',({a,u,v,cast})=>{
 v.x=.515;cast('R');const hp=v.hp;
 a.applyEffectV41(u,'stun',{source:v,duration:3,key:'b26_ult_cc'});
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
 assert.ok(a.m44B22ChannelInterruptHistory?.some(z=>
  z.kind==='m44_b26_katarina_lotus'&&z.reason==='cc'));
});
test('Katarina R movement interrupts unreleased blades','Katarina',({a,u,v,cast})=>{
 v.x=.515;cast('R');u.x+=.02;
 const hp=v.hp;a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
 assert.ok(a.m44B22ChannelInterruptHistory?.some(z=>
  z.kind==='m44_b26_katarina_lotus'&&z.reason==='movement'));
});
test('Kennen W rejects unmarked targets at queue, no debit','Kennen',({a,u})=>{
 const mana=u.mana,cd=u.skillCds.W;
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'W');
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b26_kennen_no_marked_target');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
});
test('Kennen W hits only marked opponents and stuns at third stack','Kennen',({a,u,v,cast,opp})=>{
 v.m44KennenStorm={[u.id]:{stacks:2,until:6}};
 const other=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(other,{x:v.x+.015,y:v.y});const hp=other.hp,vhp=v.hp;
 const r=cast('W');assert.equal(r.electricalSurge,true);
 assert.ok(v.hp<vhp);assert.equal(other.hp,hp);
 assert.ok(a.effectResolverV41().has(v,'stun'));
});
test('Kennen Q legacy projectile and new mark processor agree','Kennen',({a,u,v,cast})=>{
 const r=cast('Q',{point:pt(v)});assert.ok(r);
 a.gameTime=1;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.m44KennenStorm?.[u.id]?.stacks,1);
});
test('Kennen E dashes with contact damage and one electric mark','Kennen',({a,u,v,cast})=>{
 const hp=v.hp,from=u.x,mana=u.mana;
 const r=cast('E',{point:{x:.536,y:.5}});
 assert.equal(r.lightningRush,true);assert.ok(r.hits>=1);
 assert.ok(u.x>from);assert.ok(v.hp<hp);
 assert.equal(v.m44KennenStorm?.[u.id]?.stacks,1);
 assert.equal(u.mana,mana-40);
});
test('Kennen E cannot dash through obstacle and spend resources','Kennen',({a,u,v})=>{
 const mana=u.mana,cd=u.skillCds.E;
 const old=a.obstacleLine.bind(a);a.obstacleLine=(x,y)=>true;
 const r=a.executeBoardSkillV453Dev69(u,{slot:'E',point:{x:.536,y:.5}});
 a.obstacleLine=old;
 assert.equal(r.ok,false);assert.equal(u.mana,mana);assert.equal(u.skillCds.E,cd);
});
test('Kennen R six progressive lightning ticks and electric stun','Kennen',({a,u,v,cast})=>{
 v.x=.515;const hp=v.hp,r=cast('R');assert.equal(r.slicingMaelstrom,true);
 for(let i=1;i<=3;i++){a.gameTime=.5*i;a.advanceBoardTemporalV453Dev69();}
 assert.ok(v.hp<hp);assert.ok(a.effectResolverV41().has(v,'stun'));
});
test('Kennen R follows living owner without persistent stationary blast','Kennen',({a,u,v,cast})=>{
 v.x=.52;cast('R');const hp=v.hp;
 u.x=.7;a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
});
test('Sylas steals Katarina R source channel and it can be cancelled','Sylas',({a,u,v,cast})=>{
 assert.equal(a.queueSylasHijackV453M14(u.team,u.id,v.id).ok,true);
 a.resolveSylasHijacksV453M14();
 v.x=.515;const r=cast('R');
 assert.ok(r.deathLotus&&r.hijacked);
 const hp=v.hp;
 a.applyEffectV41(u,'stun',{source:v,duration:3,key:'b26_sylas_cc'});
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();assert.equal(v.hp,hp);
},'Katarina');
function possess(a,u,donor){
 donor.hp=100;a.damage(donor,500,u,'true','spell');
 // Anivia Rebirth: Viego needs a genuine kill, not merely an egg trigger.
 if(donor.m44B27Egg?.active)a.damage(donor,donor.hp+100,u,'true','spell');
 const soul=u.m44B14CSouls?.[0];assert.ok(soul);
 assert.equal(a.queueViegoPossessV453M44B14C(u.team,u.id,soul.id).ok,true);
 a.resolveBoardSkillsV453Dev69();assert.equal(u.champ,donor.champ);
}
test('Viego possesses Anivia and executes original Q, W, E source','Viego',({a,u,v,cast})=>{
 possess(a,u,v);const enemy=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(enemy,{x:u.x+.025,y:u.y});
 const q=cast('Q',{point:pt(enemy)});assert.equal(q.flashFrost,true);
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.ok(enemy.m44B26Chilled?.[u.id]>.5);
 a.round++;a.actionLocksV40={};
 const e=cast('E',{targetId:enemy.id});
 assert.equal(e.doubleDamage,true);
},'Anivia');
let passed=0,failures=[];
for(const side of ['blue','red'])for(const c of cases){
 try{
  const z=fixture(side,c.mine,c.theirs);c.fn(z);
  const snap=z.a.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(copy.snapshotV40()));
  passed++;
 }catch(e){failures.push({side,name:c.name,error:String(e?.stack||e)});}
}
for(const f of failures)console.error('M44_B26_FAIL',JSON.stringify(f));
console.log('M44_B26',JSON.stringify({cases:cases.length,seats:2,passed,failed:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
