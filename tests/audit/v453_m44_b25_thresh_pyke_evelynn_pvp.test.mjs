/* M44 B25 — authored Thresh R, Pyke R, Evelynn Q, both PvP seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs='Annie'){
 const opp=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:25025,draft:{[side]:{MID:mine},[opp]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,armor:0,mr:0,
   autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===opp+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.511,y:.511});
 const cast=(slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  let receipt;const fn=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{
   const result=fn(actor,cmd);if(actor.id===u.id)receipt=result;return result;};
  try{a.resolveBoardSkillsV453Dev69();}finally{a.executeBoardSkillV453Dev69=fn;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));return receipt;
 };
 return {a,u,v,opp,cast};
}
const test=(name,mine,fn,theirs='Annie')=>cases.push({name,mine,fn,theirs});
const point=v=>({x:v.x,y:v.y});
function wall(a,u,i){
 const xy=k=>({x:u.x+Math.cos(-Math.PI/2+k*Math.PI*2/5)*345/a.worldWidth,
                y:u.y+Math.sin(-Math.PI/2+k*Math.PI*2/5)*345/a.worldHeight});
 const p=xy(i),q=xy((i+1)%5);
 return {x:(p.x+q.x)/2,y:(p.y+q.y)/2};
}
test('registry has only authored B25 source slots','Thresh',()=>{
 for(const [name,slot] of [['Thresh','R'],['Pyke','R'],['Evelynn','Q']])
  assert.equal(m44B14DOriginalBoardRuleV453(name,slot)?.m44B25Id,name+'.'+slot);
 assert.equal(m44B14DOriginalBoardRuleV453('Aatrox','Q'),null);
});
test('Thresh R creates exactly five timed walls and pays once','Thresh',({a,u,cast})=>{
 const mana=u.mana,r=cast('R');
 assert.equal(r.theBox,true);assert.equal(mana-u.mana,100);
 const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b25_thresh_box');
 assert.deepEqual(z.walls,[true,true,true,true,true]);
 assert.equal(z.until,5);
});
test('Thresh first wall damages and applies slow, no repeat hit','Thresh',({a,u,v,cast})=>{
 Object.assign(v,wall(a,u,0));cast('R');
 const hp=v.hp;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<hp);assert.ok(a.effectResolverV41().has(v,'slow'));
 const once=v.hp;a.advanceBoardTemporalV453Dev69();assert.equal(v.hp,once);
});
test('Thresh second broken wall only slows and does not damage','Thresh',({a,u,v,cast})=>{
 Object.assign(v,wall(a,u,0));cast('R');a.advanceBoardTemporalV453Dev69();
 const hp=v.hp;Object.assign(v,wall(a,u,1));
 a.gameTime=1.1;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
 const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b25_thresh_box');
 assert.deepEqual(z.walls.slice(0,2),[false,false]);
});
test('Thresh Box has no friendly damage or terrain colliders','Thresh',({a,u,v,cast})=>{
 const ally=a.units.find(z=>z.team===u.team&&z.id!==u.id);
 Object.assign(ally,wall(a,u,2));Object.assign(v,{x:.07,y:.07});const hp=ally.hp;
 const r=cast('R');a.advanceBoardTemporalV453Dev69();
 assert.equal(ally.hp,hp);assert.equal(r.walls,5);
 assert.equal(a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b25_thresh_box').walls[2],true);
});
test('Thresh Box does not migrate to a changed realm','Thresh',({a,u,v,cast})=>{
 Object.assign(v,wall(a,u,0));cast('R');
 assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 a.advanceBoardTemporalV453Dev69();
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b25_thresh_box'));
});
test('Pyke R is a deferred X and executes champion below threshold','Pyke',({a,u,v,cast})=>{
 v.hp=120;const mana=u.mana,r=cast('R',{point:point(v)});
 assert.equal(r.deathFromBelow,true);assert.equal(v.hp,120);
 assert.equal(mana-u.mana,100);
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,0);assert.ok(u.m44B25PykeRecast?.until>20);
});
test('Pyke R hits but does not execute high health champions','Pyke',({a,u,v,cast})=>{
 const hp=v.hp;cast('R',{point:point(v)});a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<hp);assert.ok(v.hp>0);assert.equal(u.m44B25PykeRecast,undefined);
});
test('Pyke X ignores champions outside both diagonal rays','Pyke',({a,u,v,cast})=>{
 const initial={x:.511,y:.511};Object.assign(v,{x:.544,y:.511});
 const hp=v.hp;cast('R',{point:initial});a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
});
test('Pyke spell shield prevents low-HP true execution','Pyke',({a,u,v,cast})=>{
 v.hp=120;a.applyEffectV41(v,'spell_shield',{source:v,duration:3,key:'b25_pyke_shield'});
 cast('R',{point:point(v)});a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,120);assert.equal(u.m44B25PykeRecast,undefined);
});
test('Pyke R successful execution unlocks no-cost recast','Pyke',({a,u,v,opp,cast})=>{
 v.hp=120;cast('R',{point:point(v)});a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 const next=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(next,{x:u.x+.009,y:u.y+.009,hp:130,maxHp:20000});
 const mana=u.mana,cd=u.skillCds.R,r=cast('R',{point:point(next)});
 assert.equal(r.recast,true);assert.equal(r.spentMana,0);
 assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
 a.gameTime=1;a.advanceBoardTemporalV453Dev69();
 assert.equal(next.hp,0);
});
test('Pyke R cannot recast after deadline','Pyke',({a,u,v,cast})=>{
 v.hp=120;cast('R',{point:point(v)});a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 a.gameTime=21;const mana=u.mana;
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'R',{point:point(v)});
 assert.equal(q.ok,false);assert.equal(u.mana,mana);
});
test('Pyke R refuses invalid target point without debit','Pyke',({a,u,v})=>{
 const mana=u.mana,cd=u.skillCds.R;
 const r=a.executeBoardSkillV453Dev69(u,{slot:'R',point:{x:1,y:1}});
 assert.equal(r.ok,false);assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
});
test('Evelynn Q first dart locks only first enemy and gives mark','Evelynn',({a,u,v,opp,cast})=>{
 const next=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(next,{x:v.x+.012,y:v.y+.012,hp:20000});
 const hp=next.hp,mana=u.mana,r=cast('Q',{point:point(next)});
 assert.equal(r.hateSpike,true);assert.equal(r.firstHitId,v.id);
 assert.equal(u.mana,mana-60);assert.equal(next.hp,hp);
 assert.equal(v.m44B25EveMarks[u.id].charges,3);
});
test('Evelynn Q has three no-cost spikes consuming mark on real hits','Evelynn',({a,u,v,cast})=>{
 const hp=v.hp,mana=u.mana;cast('Q',{point:point(v)});
 for(let n=0;n<3;n++){
  a.gameTime=.5*(n+1);const r=cast('Q');
  assert.equal(r.recast,true);assert.equal(r.spentMana,0);
  assert.equal(v.m44B25EveMarks[u.id].charges,2-n);
 }
 assert.equal(u.mana,mana-60);
 assert.equal(u.m44B25HateSpike,null);assert.ok(v.hp<hp);
});
test('Evelynn Q cannot recast before 0.5 seconds','Evelynn',({a,u,v,cast})=>{
 cast('Q',{point:point(v)});
 const mana=u.mana,q=a.queueBoardSkillV453Dev69(u.team,u.id,'Q');
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b25_eve_recast_wait');
 assert.equal(u.mana,mana);
});
test('Evelynn Q recast requires an actually visible enemy','Evelynn',({a,u,v,cast})=>{
 cast('Q',{point:point(v)});a.gameTime=.5;
 a.visible=()=>false;a.canSeePoint=()=>false;
 const mana=u.mana,q=a.queueBoardSkillV453Dev69(u.team,u.id,'Q');
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b25_eve_no_visible_target');
 assert.equal(u.mana,mana);
});
test('Evelynn initial Q spell shield prevents mark','Evelynn',({a,u,v,cast})=>{
 a.applyEffectV41(v,'spell_shield',{source:v,duration:3,key:'b25_eve_shield'});
 const hp=v.hp;cast('Q',{point:point(v)});
 assert.equal(v.hp,hp);assert.equal(v.m44B25EveMarks?.[u.id],undefined);
});
test('Evelynn invalid zero-length dart is rejected before mana','Evelynn',({a,u,v})=>{
 const mana=u.mana,cd=u.skillCds.Q;
 const r=a.executeBoardSkillV453Dev69(u,{slot:'Q',point:{x:u.x,y:u.y}});
 assert.equal(r.ok,false);assert.equal(r.reason,'m44_b25_eve_direction_required');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.Q,cd);
});
test('Evelynn Q recast cannot hit a third opponent outside the realm','Evelynn',({a,u,v,cast})=>{
 cast('Q',{point:point(v)});
 const outside=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(outside,{x:u.x+.019,y:u.y+.019});
 const hp=outside.hp;
 assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 a.gameTime=.5;
 const r=cast('Q');
 assert.equal(r.recast,true);assert.equal(outside.hp,hp);
});
test('Sylas steals Pyke R source executor and retains a legal recast','Sylas',({a,u,v,cast})=>{
 assert.equal(a.queueSylasHijackV453M14(u.team,u.id,v.id).ok,true);
 a.resolveSylasHijacksV453M14();
 v.hp=120;const r=cast('R',{point:point(v)});
 assert.ok(r.hijacked&&r.deathFromBelow);
 a.gameTime=.5;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,0);assert.ok(u.m44B25PykeRecast?.until>20);
 const next=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(next,{x:u.x+.008,y:u.y+.008,hp:100});
 const r2=cast('R',{point:point(next)});assert.equal(r2.spentMana,0);
 a.gameTime=1;a.advanceBoardTemporalV453Dev69();assert.equal(next.hp,0);
},'Pyke');
function possess(a,u,donor){
 donor.hp=100;a.damage(donor,500,u,'true','spell');
 const soul=u.m44B14CSouls?.[0];assert.ok(soul);
 assert.equal(a.queueViegoPossessV453M44B14C(u.team,u.id,soul.id).ok,true);
 a.resolveBoardSkillsV453Dev69();assert.equal(u.champ,donor.champ);
}
test('Viego copies Evelynn Q and original free reactivations','Viego',({a,u,v,cast})=>{
 possess(a,u,v);
 const target=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(target,{x:u.x+.012,y:u.y+.012});
 const r=cast('Q',{point:point(target)});
 assert.equal(r.hateSpike,true);
 a.gameTime=.5;
 const r2=cast('Q');assert.equal(r2.spentMana,0);
},'Evelynn');
let passed=0;const failures=[];
for(const side of ['blue','red'])for(const c of cases){
 try{
  const f=fixture(side,c.mine,c.theirs);c.fn(f);
  const snap=f.a.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(copy.snapshotV40()));
  passed++;
 }catch(e){failures.push({side,name:c.name,error:String(e?.stack||e)});}
}
for(const f of failures)console.error('M44_B25_FAIL',JSON.stringify(f));
console.log('M44_B25',JSON.stringify({cases:cases.length,seats:2,passed,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
