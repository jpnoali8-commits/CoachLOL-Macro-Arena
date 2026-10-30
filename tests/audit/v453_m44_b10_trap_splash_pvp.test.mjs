/**
 * M44 B10 — regression for authored trap activation versus secondary AoE.
 * Uses real Arena engine, both PvP colors and V40 snapshot roundtrips.
 * Scoped fixtures only; no browser, full kit, or multiplayer certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const champions=[
 ['Teemo','teemo_mushroom',215,'dot'],
 ['Jhin','jhin_lotus',165,'slow'],
 ['Shaco','shaco_box',210,'fear'],
 ['Maokai','maokai_sapling',200,'hp']
];
let passed=0,snapshots=0;const failures=[];
function check(team,entry,scenario){
 const [champ,kind,distance,expected]=entry;
 const other=team==='blue'?'red':'blue';
 try{
  const a=new Arena(map,mask,{seed:441010,mode:'pvp',
   draft:{[team]:{MID:champ},[other]:{MID:'Annie',TOP:'Malphite'}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:7000,maxHp:7000,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const m of a.minions)Object.assign(m,{x:.08,y:.08});
  const caster=a.units.find(v=>v.id===team+'_MID'),
   trigger=a.units.find(v=>v.id===other+'_MID'),
   secondary=a.units.find(v=>v.id===other+'_TOP');
  assert.ok(caster&&trigger&&secondary);
  Object.assign(caster,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
   skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(trigger,{x:.52,y:.5,hp:12000,maxHp:12000,armor:0,mr:0});
  Object.assign(secondary,{x:.52+((scenario==='outside'?400:distance)/a.worldWidth),
   y:.5,hp:12000,maxHp:12000,armor:0,mr:0});
  a.visible=()=>true;a.walkable=()=>true;
  a.canSeePoint=()=>true;a.obstacleLine=()=>false;
  const trap=a.m16TrapCreate(caster,kind,{x:trigger.x,y:trigger.y});
  assert.ok(trap,'real authored trap creation');
  assert.ok(a.mapDistance(secondary,trap)>trap.triggerRadius,
   'secondary must NOT be a triggering victim');
  if(scenario==='other_realm'){
   const same=a.sameCombatRealmV453Dev69.bind(a);
   a.sameCombatRealmV453Dev69=(x,y)=>y.id===secondary.id?false:same(x,y);
  }
  const hp=secondary.hp;
  a.gameTime=3;a.round=3;a.advanceMechanicsV453M16();
  const applied=expected==='hp'?secondary.hp<hp:
   a.effectResolverV41().has(secondary,expected);
  assert.equal(!!applied,scenario==='splash',
   'real AoE independent from trigger radius; excludes outside/other realm');
  const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),
   checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  passed++;snapshots++;
 }catch(error){
  failures.push({team,champ,kind,scenario,error:String(error?.stack||error)});
 }
}
for(const team of ['blue','red'])
 for(const entry of champions)
  for(const scenario of ['splash','outside','other_realm'])
   check(team,entry,scenario);
for(const err of failures)console.error('M44_B10_FAIL',JSON.stringify(err));
console.log('M44_B10_TRAP_SPLASH '+JSON.stringify({
 champions:champions.map(x=>x[0]),bilateral:2,passed,snapshots,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
assert.equal(passed,24);
