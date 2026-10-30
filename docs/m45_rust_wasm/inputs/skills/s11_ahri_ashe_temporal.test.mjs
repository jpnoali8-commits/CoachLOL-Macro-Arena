#!/usr/bin/env node
/** M45 Skills S11: supplemental *legacy characterization* of Ahri E and Ashe R.
 * Source PIN: skills-batch2 f0b1147ac46e585a1d5374a178b1ea462f5dc278
 * Engine PIN: Git blob 41679f7328a42e379fdfb8de5b92006e1bfb529f.
 * Assertions for Ahri's failing adapter describe a known BUG, not desired Rust behavior.
 * Uses synthetic vision; NOT a two-seat HTTP/fog authority or Rust/WASM certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,abilityRule} from '../../../../engine.mjs';
const load=name=>JSON.parse(readFileSync(new URL('../../../../data/'+name,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function fixture(champ,team,x=.523){
 const rival=team==='blue'?'red':'blue';
 const arena=new Arena(map,mask,{seed:6918,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of arena.units)
  Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const owner=arena.units.find(v=>v.id===team+'_MID');
 const enemy=arena.units.find(v=>v.id===rival+'_MID');
 Object.assign(owner,{champ,x:.5,y:.5,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x,y:.5,hp:1500,maxHp:1500,mr:0,armor:0});
 arena.visible=()=>true;
 return {arena,owner,enemy,team};
}
function restoredEqual(arena){
 const snap=arena.snapshotV40();
 return checksumV40(snap)===checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40());
}
let cases=0,impacts=0;
for(const team of ['blue','red']){
 const a=fixture('Ahri',team);
 assert.equal(abilityRule(a.owner,'E')?.kind,'board_effect');
 assert.deepEqual(a.arena.queueKitSkillV42(team,a.owner.id,'E',{x:.8,y:.5}),
  {ok:false,reason:'Ação direcional indisponível.'});
 assert.deepEqual(a.arena.queueDirectionalSkill(team,a.owner.id,'E',{x:.8,y:.5}),
  {ok:false,reason:'Ação direcional indisponível.'});
 assert.equal(a.owner.mana,1000,'rejection must not debit');
 assert.equal(a.arena.queueBoardSkillV453Dev69(team,a.owner.id,'E',
  {point:{x:.8,y:.5}}).ok,true);
 a.arena.resolveBoardSkillsV453Dev69();
 assert.equal(a.owner.mana,940);
 assert.equal(a.arena.boardTemporalV453Dev69.filter(p=>
  p.kind==='m44_authored_projectile'&&p.champ==='Ahri'&&p.slot==='E').length,1);
 assert.ok(restoredEqual(a.arena));
 cases++;
 const reports=[];
 for(const [x,impactAt] of [[.523,1],[.58,3]]){
  const s=fixture('Ashe',team,x);
  assert.equal(s.arena.obstacleLine(s.owner,s.enemy),false);
  assert.equal(s.arena.queueDirectionalSkill(team,s.owner.id,'R',{x:.9,y:.5}).ok,true);
  s.arena.resolveBoardSkillsV453Dev69();
  assert.equal(s.owner.mana,900);
  assert.equal(s.enemy.hp,1500,'no instantaneous damage');
  assert.equal(s.arena.effectResolverV41().list(s.enemy).some(e=>e.type==='stun'),false,
   'no instantaneous stun');
  assert.equal(s.arena.boardTemporalV453Dev69.filter(p=>
   p.kind==='m44_authored_projectile'&&p.champ==='Ashe'&&p.slot==='R').length,1);
  assert.ok(restoredEqual(s.arena),'snapshot while projectile in flight');
  let hit=null;
  for(let tick=1;tick<=4;tick++){
   s.arena.gameTime=tick;
   s.arena.advanceBoardTemporalV453Dev69();
   const stun=s.arena.effectResolverV41().list(s.enemy).find(e=>e.type==='stun');
   if(!hit&&stun)hit={tick,duration:stun.until-tick,damage:1500-s.enemy.hp};
  }
  assert.ok(hit,'projectile must impact in clear corridor');
  assert.equal(hit.tick,impactAt);
  assert.equal(hit.damage,200);
  assert.ok(restoredEqual(s.arena),'snapshot after impact');
  reports.push(hit);impacts++;cases++;
 }
 assert.ok(reports[1].duration>reports[0].duration,'farther flight increases stun duration');
 const blocked=fixture('Ashe',team,.65);
 assert.equal(blocked.arena.obstacleLine(blocked.owner,blocked.enemy),true,
  'obsolete M14 far-target fixture crosses obstacle; do not disable terrain in production');
 console.log('S11 '+team+' Ahri E rejected legacy adapter, board E succeeds; Ashe R impact 1/3 ticks, wall classified');
}
assert.equal(cases,6);assert.equal(impacts,4);
console.log('M45_S11_AHRI_ASHE seats=2 cases=6 impacts=4 PASS (legacy source only)');
