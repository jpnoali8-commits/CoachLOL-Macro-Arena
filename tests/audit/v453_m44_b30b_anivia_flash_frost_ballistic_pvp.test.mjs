/* M44 B30B: Anivia Q 950 u/s, passage and burst, mirrored PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side){
 const opp=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:30031,
  draft:{[side]:{MID:'Anivia'},[opp]:{MID:'Annie'}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===opp+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(options={point:{x:.6,y:.5}})=>{
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,'Q',options);
  assert.equal(q.ok,true,JSON.stringify(q));
  let receipt;const orig=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{
   const r=orig(actor,cmd);if(actor.id===u.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69();}finally{a.executeBoardSkillV453Dev69=orig;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));return receipt;
 };
 const tick=n=>{a.gameTime=n;a.advanceBoardTemporalV453Dev69();};
 const turn=n=>{a.gameTime=n;a.round++;a.actionLocksV40={};};
 const active=()=>a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b26_anivia_frost');
 return {a,u,v,cast,tick,turn,active,opp};
}
const test=(name,fn)=>cases.push({name,fn});
test('rank-five costs exactly 100 mana, missile 950 speed, 220 width and 1100 range',({a,u,cast,active})=>{
 const prior=u.mana,r=cast();const z=active();
 assert.equal(u.mana,prior-100);
 assert.equal(z.width,220);assert.equal(z.range,1100);
 assert.ok(Math.abs((r.impactAt-a.gameTime)-1100/950)<1e-9);
 assert.equal(z.m44B30Distance,0);
});
test('passage slows/chills but cannot stun or explode early',({a,u,v,cast,tick,active})=>{
 const hp=v.hp;cast();tick(.5);
 assert.ok(v.hp<hp);assert.ok(v.m44B26Chilled?.[u.id]>.5);
 assert.equal(a.effectResolverV41().has(v,'stun'),false);
 assert.equal(a.effectResolverV41().has(v,'slow'),true);
 assert.equal(active().m44B30PassHits[v.id],true);
});
test('same projectile can hit multiple distinct victims without replayed damage',({a,u,v,opp,cast,tick,active})=>{
 const w=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(w,{x:.545,y:.5});
 const hp1=v.hp,hp2=w.hp;cast();tick(.8);
 assert.ok(v.hp<hp1);assert.ok(w.hp<hp2);
 const a1=v.hp,a2=w.hp;tick(.85);
 assert.equal(v.hp,a1);assert.equal(w.hp,a2);
 assert.equal(Object.keys(active().m44B30PassHits).length,2);
});
test('automatic max-range shatter stuns targets at endpoint but not earlier',({a,u,v,cast,tick,active})=>{
 v.x=.5+1100/a.worldWidth;
 const hp=v.hp;cast();
 tick(.8);assert.equal(v.hp,hp);
 tick(1.2);assert.ok(v.hp<hp);
 assert.equal(a.effectResolverV41().has(v,'stun'),true);
 assert.equal(active(),undefined);
});
test('recast at .25 shatters at actual traveled distance and never spends twice',({a,u,v,cast,tick,turn,active})=>{
 v.x=.5+237.5/a.worldWidth;
 const first=cast(),before=u.mana,cd=u.skillCds.Q;
 turn(.25);const r=cast({});
 assert.equal(r.recast,true);assert.equal(r.spentMana,0);
 assert.equal(r.projectileId,first.projectileId);
 assert.ok(Math.abs(r.detonationPoint.x-(.5+237.5/a.worldWidth))<1e-8);
 assert.equal(u.mana,before);assert.equal(u.skillCds.Q,cd);
 tick(.25);assert.equal(active(),undefined);
 assert.equal(a.effectResolverV41().has(v,'stun'),true);
});
test('early recast before .25 is refused without cooldown/mana charge',({a,u,cast,turn})=>{
 cast();turn(.2);const before=u.mana,cd=u.skillCds.Q;
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'Q');
 assert.equal(q.ok,false);assert.equal(q.reason,'m44_b28_frost_windup');
 assert.equal(u.mana,before);assert.equal(u.skillCds.Q,cd);
});
test('one-time burst applies to multiple targets in 225 radius',({a,u,v,opp,cast,tick})=>{
 v.x=.5+1100/a.worldWidth;
 const w=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(w,{x:v.x,y:v.y+.012});
 const hp1=v.hp,hp2=w.hp;cast();tick(1.2);
 assert.ok(v.hp<hp1);assert.ok(w.hp<hp2);
 assert.equal(a.effectResolverV41().has(v,'stun'),true);
 assert.equal(a.effectResolverV41().has(w,'stun'),true);
});
test('spell shield blocks passage hit, not the later independent burst',({a,u,v,cast,tick})=>{
 a.applyEffectV41(v,'spell_shield',{source:v,duration:2,key:'b30b_shield'});
 v.x=.5+1100/a.worldWidth;
 const hp=v.hp;cast();tick(1.2);
 assert.ok(v.hp<hp); // shield consumed the first (passage) hit; burst is separate
 assert.equal(a.effectResolverV41().has(v,'stun'),true);
 assert.ok(v.m44B26Chilled?.[u.id]>1.2);
});
test('wall intersection terminates missile before enemies behind it',({a,u,v,cast,tick,active})=>{
 v.x=.56;
 const orig=a.obstacleLine.bind(a);
 a.obstacleLine=(from,to)=>orig(from,to)||(from.x<.535&&to.x>=.535);
 const hp=v.hp;cast();tick(.8);
 assert.equal(v.hp,hp);
 assert.equal(active(),undefined);
});
test('caster death does not retroactively cancel launched missile',({a,u,v,cast,tick})=>{
 v.x=.535;
 const hp=v.hp;cast();u.hp=0;tick(.8);
 assert.ok(v.hp<hp);
});
test('passage, movement and ledger survive a V40 checksum checkpoint',({a,u,v,cast,tick,active})=>{
 cast();tick(.5);const z=active();
 assert.equal(z.m44B30PassHits[v.id],true);
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 const copy=b.boardTemporalV453Dev69.find(x=>x.id===z.id);
 assert.equal(copy.m44B30Distance,z.m44B30Distance);
 assert.equal(copy.m44B30PassHits[v.id],true);
});
let passed=0,failures=[];
for(const side of ['blue','red'])for(const sc of cases){
 try{
  const x=fixture(side);sc.fn(x);
  const snap=x.a.snapshotV40(),back=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(back.snapshotV40()));passed++;
 }catch(error){failures.push({side,name:sc.name,error:String(error?.stack||error)});}
}
for(const f of failures)console.error('M44_B30B_FAIL',JSON.stringify(f));
console.log('M44_B30B',JSON.stringify({cases:cases.length,seats:2,passed,failed:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
