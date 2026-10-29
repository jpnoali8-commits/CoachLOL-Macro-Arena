/** M21 board target-any and ally support semantics, both PvP seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269323,mode:'pvp',draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,hp:2500,maxHp:2500,
  autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:2400,maxHp:2500,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.511,y:.5,hp:2400,maxHp:2500,armor:0,mr:0});
 Object.assign(ally,{x:.51,y:.5,hp:1200,maxHp:2500});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,targetId){
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,{targetId});
  assert.equal(q.ok,true,champ+slot+' queue '+q.reason);
  let execution;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,req)=>(execution=original(actor,req));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=original;
  assert.equal(execution?.ok,true,champ+slot+' execute '+JSON.stringify(execution));
 }
 return {a,u,e,ally,cast};
}
function snap(a){const s=a.snapshotV40();
 assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));}
let count=0;const results=[];
for(const team of ['blue','red']){
 {
  const {a,u,e,ally,cast}=fixture('Zilean',team);
  cast('E',ally.id);
  assert.ok(ally.boardSpeedV453Dev69?.until>a.gameTime,'Zilean ally E missing haste');
  a.gameTime=1;u.skillCds.E=0;
  cast('E',e.id);
  assert.ok(a.effectResolverV41().has(e,'slow'),'Zilean enemy E missing slow');
  snap(a);results.push(team+' Zilean E ally/enemy');count++;
 }
 {
  const {a,u,e,ally,cast}=fixture('Lulu',team);
  cast('W',ally.id);
  assert.ok(ally.boardSpeedV453Dev69?.until>a.gameTime,'Lulu W ally haste missing');
  a.gameTime=1;u.skillCds.W=0;
  cast('W',e.id);
  assert.ok(a.effectResolverV41().has(e,'polymorph'),'Lulu W enemy polymorph missing');
  snap(a);results.push(team+' Lulu W ally/enemy');count++;
 }
 {
  const {a,u,e,ally,cast}=fixture('Lulu',team);
  const hp=e.hp;cast('E',e.id);
  assert.ok(e.hp<hp,'Lulu enemy E needs damage');
  a.gameTime=1;u.skillCds.E=0;
  cast('E',ally.id);
  assert.ok(a.effectResolverV41().has(ally,'shield'),'Lulu ally E needs shield');
  snap(a);results.push(team+' Lulu E ally/enemy');count++;
 }
 {
  const {a,u,e,ally,cast}=fixture('Milio',team);
  assert.equal(a.applyEffectV41(ally,'root',{source:e,duration:4}).ok,true);
  assert.equal(a.applyEffectV41(ally,'suppression',{source:e,duration:4}).ok,true);
  assert.ok(a.effectResolverV41().has(ally,'root'));
  assert.ok(a.effectResolverV41().has(ally,'suppression'));
  cast('R');
  assert.equal(a.effectResolverV41().has(ally,'root'),false,'Milio failed to cleanse root');
  assert.equal(a.effectResolverV41().has(ally,'suppression'),true,'Milio wrongly cleansed suppression');
  snap(a);results.push(team+' Milio R cleansable CC only');count++;
 }
 {
  const {a,u,e,ally,cast}=fixture('Seraphine',team);
  const before=ally.hp;cast('W');
  assert.equal(ally.hp,before,'unshielded Seraphine W healed without condition');
  snap(a);results.push(team+' Seraphine W unshielded');count++;
 }
 {
  const {a,u,e,ally,cast}=fixture('Seraphine',team);
  const before=ally.hp;
  assert.equal(a.applyEffectV41(u,'shield',{source:u,power:150,duration:5}).ok,true);
  cast('W');
  assert.ok(ally.hp>before,'already-shielded Seraphine W did not heal');
  snap(a);results.push(team+' Seraphine W shield-heal');count++;
 }
 {
  const {a,u,e}=fixture('Lulu',team);
  a.visible=()=>false;
  const mana=u.mana;
  const hidden=a.queueBoardSkillV453Dev69(team,u.id,'W',{targetId:e.id});
  assert.equal(hidden.ok,false,'target_any bypassed enemy fog');
  assert.equal(u.mana,mana);
  snap(a);results.push(team+' target_any fog gate');count++;
 }
}
assert.equal(count,14);
console.log('M21_B01_DUAL_TARGET_QA '+JSON.stringify({seats:2,tests:count,
 families:['Lulu','Zilean','Milio','Seraphine'],results,certifiedChampions:0}));
