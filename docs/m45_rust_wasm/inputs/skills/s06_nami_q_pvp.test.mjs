/** M45 B02 S06 — legacy Nami Q executable witness; no Rust parity claims.
 * Source pinned in golden_plan.json. This is a regression test, not new JS gameplay.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,kitSpellV42,checksumV40} from '../../../../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../../../../data/'+n,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const point={x:.54,y:.5};
let passes=0;
const check=(name,fn)=>{fn();passes++;console.log('S06 NAMI Q '+name+' PASS')};
function fixture(team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:450206,draft:{[team]:{MID:'Nami'}},roundSeconds:10});
 for(const x of a.units)Object.assign(x,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(x=>x.id===team+'_MID');
 const enemy=a.units.find(x=>x.id===foe+'_MID');
 const ally=a.units.find(x=>x.id===team+'_TOP');
 Object.assign(u,{champ:'Nami',x:.5,y:.5,mana:500,maxMana:500,ap:0,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:point.x,y:point.y,hp:2000,maxHp:2000,mr:0,armor:0});
 Object.assign(ally,{x:point.x,y:point.y,hp:2000,maxHp:2000});
 a.visible=()=>true;
 return {a,u,enemy,ally,foe};
}
check('descriptor is prototype ground-circle, not certified suspension',()=>{
 const q=kitSpellV42('Nami','Q');
 assert.equal(q.kind,'ground_circle');
 assert.equal(q.implemented,'prototype');
 assert.equal(q.cc,'suspension');
 assert.equal(q.range,850);
});
for(const team of ['blue','red']){
 const {a,u,enemy,ally,foe}=fixture(team);
 const denied=a.queueKitSkillV42(foe,u.id,'Q',point);
 check(team+' opposing seat denied before resource expenditure',()=>{
  assert.equal(denied.ok,false);assert.equal(u.mana,500);
 });
 const invalid=a.queueKitSkillV42(team,u.id,'Q',{x:NaN,y:point.y});
 check(team+' malformed point denied without expense',()=>{
  assert.equal(invalid.ok,false);assert.equal(u.mana,500);
 });
 const queued=a.queueKitSkillV42(team,u.id,'Q',point);
 check(team+' valid owner queues, no damage or mana cost yet',()=>{
  assert.equal(queued.ok,true);
  assert.equal(u.pendingKitCastV42?.slot,'Q');
  assert.equal(u.mana,500);assert.equal(enemy.hp,2000);
 });
 const repeated=a.queueKitSkillV42(team,u.id,'Q',point);
 check(team+' no second queued cast',()=>assert.equal(repeated.ok,false));
 a.resolveKitSkillsV42();
 check(team+' exactly one paid area hit and legacy stun (fidelity debt)',()=>{
  assert.equal(u.pendingKitCastV42,null);
  assert.equal(u.mana,440);
  assert.ok(u.skillCds.Q>a.gameTime);
  assert.ok(enemy.hp<2000);
  assert.equal(ally.hp,2000);
  assert.equal(a.effectResolverV41().has(enemy,'stun'),true);
 });
 const health=enemy.hp;
 a.resolveKitSkillsV42();
 check(team+' resolver replay cannot duplicate hit or mana',()=>{
  assert.equal(enemy.hp,health);assert.equal(u.mana,440);
 });
 const saved=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 check(team+' deterministic legacy snapshot after Q',()=>{
  assert.equal(checksumV40(saved.snapshotV40()),checksumV40(a.snapshotV40()));
 });
 const shield=fixture(team);
 shield.a.applyEffectV41(shield.enemy,'spell_shield',{source:shield.enemy,duration:5});
 assert.equal(shield.a.queueKitSkillV42(team,shield.u.id,'Q',point).ok,true);
 shield.a.resolveKitSkillsV42();
 check(team+' spell-shield denies hit and CC while consuming one Q cast',()=>{
  assert.equal(shield.enemy.hp,2000);
  assert.equal(shield.a.effectResolverV41().has(shield.enemy,'stun'),false);
  assert.equal(shield.u.mana,440);
 });
}
console.log('M45_S06_NAMI_Q',JSON.stringify({passed:passes,seats:2,certified:false,rustParity:false}));
