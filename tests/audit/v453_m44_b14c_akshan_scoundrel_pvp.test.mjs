/** M44 B14C — Akshan owner-authored Scoundrel kill+assist revives, blue/red. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function fixture(team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:144477,mode:'pvp',draft:{
  [team]:{MID:'Akshan',TOP:'Annie',ADC:'Ashe',SUP:'Braum'},
  [other]:{MID:'Darius',TOP:'Malphite',ADC:'Caitlyn'}}});
 for(const v of a.units)Object.assign(v,{x:.5,y:.5,hp:1000,maxHp:1000,
  armor:0,mr:0,autoFollow:false,autoFarm:false,
  autoAttack:false,autoJungle:false});
 a.gameTime=15;
 const unit=(t,role)=>a.units.find(v=>v.id===t+'_'+role);
 const ak=unit(team,'MID'),fallen=unit(team,'TOP'),otherAlly=unit(team,'ADC'),
  fighter=unit(team,'SUP'),villain=unit(other,'MID'),otherVillain=unit(other,'TOP');
 const kill=(victim,killer)=>a.damage(victim,2000,killer,'true','spell');
 const snapshot=()=>{const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  snapshots++;
 };
 return {a,team,other,ak,fallen,otherAlly,fighter,villain,otherVillain,kill,snapshot};
}
function run(team,label,check){
 try{const f=fixture(team);check(f);f.snapshot();passed++}
 catch(e){failures.push({team,label,error:String(e?.stack||e)})}
}
for(const team of ['blue','red']){
 run(team,'Scoundrel gives earned ally return',({a,ak,fallen,villain,kill})=>{
  kill(fallen,villain);
  assert.ok(villain.m44B14CScoundrels[team].victimIds.includes(fallen.id));
  assert.ok(fallen.deadUntil>a.gameTime);
  kill(villain,ak);
  assert.equal(fallen.deadUntil,a.gameTime);
  assert.equal(ak.m44B14CAvenged.length,1);
  assert.equal(ak.m44B14CAvenged[0].revived[0],fallen.id);
 });
 run(team,'no Akshan participant no resurrection',({a,fallen,otherAlly,villain,kill})=>{
  kill(fallen,villain);const deadline=fallen.deadUntil;
  kill(villain,otherAlly);
  assert.equal(fallen.deadUntil,deadline);
 });
 run(team,'Akshan credited assist revives',({a,ak,fallen,fighter,villain,kill})=>{
  kill(fallen,villain);
  a.damage(villain,20,ak,'physical','spell');
  kill(villain,fighter);
  assert.equal(fallen.deadUntil,a.gameTime);
 });
 run(team,'multiple victims same killer',({a,ak,fallen,otherAlly,villain,kill})=>{
  kill(fallen,villain);kill(otherAlly,villain);
  assert.deepEqual(villain.m44B14CScoundrels[team].victimIds,
   [fallen.id,otherAlly.id].sort());
  kill(villain,ak);
  assert.equal(fallen.deadUntil,a.gameTime);
  assert.equal(otherAlly.deadUntil,a.gameTime);
  assert.equal(ak.m44B14CAvenged.length,1);
  assert.equal(ak.m44B14CAvenged[0].revived.length,2);
 });
 run(team,'different villain does not inherit mark',({a,ak,fallen,villain,otherVillain,kill})=>{
  kill(fallen,villain);const deadline=fallen.deadUntil;
  kill(otherVillain,ak);
  assert.equal(fallen.deadUntil,deadline);
  kill(villain,ak);
  assert.equal(fallen.deadUntil,a.gameTime);
 });
 run(team,'duplicate lethal does not revive twice',({a,ak,fallen,villain,kill})=>{
  kill(fallen,villain);kill(villain,ak);
  const count=ak.m44B14CAvenged.length;
  assert.equal(a.damage(villain,1200,ak,'true','spell'),0);
  assert.equal(ak.m44B14CAvenged.length,count);
 });
 run(team,'unmarked ally remains on original death timer',({a,ak,fallen,otherAlly,villain,otherVillain,kill})=>{
  kill(fallen,villain);kill(otherAlly,otherVillain);
  const deadline=otherAlly.deadUntil;
  kill(villain,ak);
  assert.equal(fallen.deadUntil,a.gameTime);
  assert.equal(otherAlly.deadUntil,deadline);
 });
}
for(const failure of failures)console.error('M44_B14C_AKSHAN_FAIL',JSON.stringify(failure));
console.log('M44_B14C_AKSHAN '+JSON.stringify({scenarios:passed,
 snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,14);
