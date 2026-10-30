/* M44 B30A — Kennen R source-scoped storm marks, mirrored PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side){
 const foe=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:30030,
  draft:{[side]:{MID:'Kennen'},[foe]:{MID:'Annie'}}});
 for(const u of a.units)Object.assign(u,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const u of a.minions)Object.assign(u,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===foe+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'R',{});
 assert.equal(q.ok,true,JSON.stringify(q));
 let receipt;const orig=a.executeBoardSkillV453Dev69.bind(a);
 a.executeBoardSkillV453Dev69=(actor,cmd)=>{
  const r=orig(actor,cmd);if(actor.id===u.id)receipt=r;return r;};
 try{a.resolveBoardSkillsV453Dev69();}finally{a.executeBoardSkillV453Dev69=orig;}
 assert.equal(receipt?.ok,true,JSON.stringify(receipt));
 const storm=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b26_kennen_storm'&&z.ownerId===u.id);
 assert.ok(storm);
 const tick=t=>{a.gameTime=t;a.advanceBoardTemporalV453Dev69();};
 return {a,u,v,storm,tick};
}
const test=(name,fn)=>cases.push({name,fn});
test('six damaging ticks, only three marks from R',({a,u,v,storm,tick})=>{
 let previous=v.hp;
 for(let i=1;i<=6;i++){
  tick(i*.5);
  assert.ok(v.hp<previous,'damage on tick '+i);previous=v.hp;
  if(i<=5)assert.equal(storm.hitCounts[v.id],i);
  assert.equal(storm.markCounts[v.id],Math.min(3,i));
 }
 assert.equal(storm.hitCounts[v.id],6);
 assert.equal(a.boardTemporalV453Dev69.includes(storm),false);
});
test('subsequent hits refresh six-second mark immunity',({a,u,v,storm,tick})=>{
 for(let i=1;i<=3;i++)tick(i*.5);
 const initial=v.m44B30KennenStormImmunity[u.id];
 assert.equal(storm.markCounts[v.id],3);
 assert.equal(initial,7.5);
 tick(2);assert.equal(v.m44B30KennenStormImmunity[u.id],8);
 tick(2.5);assert.equal(v.m44B30KennenStormImmunity[u.id],8.5);
 assert.equal(storm.markCounts[v.id],3);
});
test('storm immunity is keyed to casting champion',({a,u,v,storm,tick})=>{
 for(let i=1;i<=3;i++)tick(i*.5);
 const immunity=v.m44B30KennenStormImmunity;
 assert.equal(Object.keys(immunity).length,1);
 assert.equal(immunity[u.id],7.5);
 assert.equal(immunity['other_kennen'],undefined);
});
test('out of range ticks do not count as marks or damage',({a,u,v,storm,tick})=>{
 v.x=.7;const before=v.hp;
 tick(.5);assert.equal(v.hp,before);
 assert.equal(storm.markCounts?.[v.id],undefined);
 v.x=.525;tick(1);assert.equal(storm.markCounts[v.id],1);
});
test('death ends storm with no orphaned marks',({a,u,v,storm,tick})=>{
 tick(.5);const hp=v.hp,marks=storm.markCounts[v.id];
 u.hp=0;tick(1);
 assert.equal(v.hp,hp);assert.equal(storm.markCounts[v.id],marks);
 assert.equal(a.boardTemporalV453Dev69.includes(storm),false);
});
test('mark ledger and immunity survive snapshot restore',({a,u,v,storm,tick})=>{
 for(let i=1;i<=4;i++)tick(i*.5);
 const snap=a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
 const target=restored.units.find(x=>x.id===v.id);
 assert.equal(target.m44B30KennenStormImmunity[u.id],8);
 const restoredStorm=restored.boardTemporalV453Dev69.find(x=>x.id===storm.id);
 assert.equal(restoredStorm.markCounts[v.id],3);
 assert.equal(restoredStorm.hitCounts[v.id],4);
});
let passed=0,failures=[];
for(const side of ['blue','red'])for(const scenario of cases){
 try{const ctx=fixture(side);scenario.fn(ctx);
  const snap=ctx.a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
  passed++;
 }catch(e){failures.push({side,name:scenario.name,error:String(e?.stack||e)});}
}
for(const e of failures)console.error('M44_B30A_FAIL',JSON.stringify(e));
console.log('M44_B30A',JSON.stringify({cases:cases.length,seats:2,passed,failed:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
