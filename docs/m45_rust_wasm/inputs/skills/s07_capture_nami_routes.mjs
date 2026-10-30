#!/usr/bin/env node
/** M45 S07 — execute legacy source to produce real (NOT fabricated) Nami Q/W/R trace receipts.
 * This test does not change any gameplay code and certifies neither Rust nor full LoL parity.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {Arena,checksumV40,abilityRule,kitSpellV42} from '../../../../engine.mjs';

const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../');
const load=p=>JSON.parse(readFileSync(resolve(root,'data',p),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const expected='41679f7328a42e379fdfb8de5b92006e1bfb529f';
const bytes=readFileSync(resolve(root,'engine.mjs'));
const gitHash=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
assert.equal(gitHash,expected,'Pin the legacy skills engine exactly');
const traces=[];
const norm=v=>JSON.parse(JSON.stringify(v));
function fixture(team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:450207,mode:'pvp',roundSeconds:10,draft:{[team]:{MID:'Nami'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===foe+'_MID'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ:'Nami',x:.5,y:.5,mana:500,maxMana:500,ap:0,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.52,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 Object.assign(ally,{x:.53,y:.5,hp:400,maxHp:2000});
 a.visible=()=>true;a.duelPermission=()=>true;
 return {a,u,enemy,ally,team,foe};
}
function capture(f,route,action){
 const {a,u,enemy,ally,team,foe}=f;
 const before=a.snapshotV40(),viewBlue=norm(a.perspective('blue')),viewRed=norm(a.perspective('red'));
 const eventsBefore=a.events.map(e=>e.id);
 const result=action(f);
 const after=a.snapshotV40();
 const emitted=a.events.filter(e=>!eventsBefore.includes(e.id)).reverse();
 const b=checksumV40(before),c=checksumV40(after);
 assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,after).snapshotV40()),c,'checkpoint mismatch in '+route);
 traces.push({route,team,foe,seed:450207,actor:u.id,target:enemy.id,ally:ally.id,
   before,action_result:norm(result),after,events:norm(emitted),
   views_before:{blue:viewBlue,red:viewRed},views_after:{blue:norm(a.perspective('blue')),red:norm(a.perspective('red'))},
   checksum_before:b,checksum_after:c,sim_time:a.gameTime});
}
assert.equal(kitSpellV42('Nami','Q').cc,'suspension');
assert.equal(abilityRule({champ:'Nami',skillRanks:{W:1},range:.03},'W').m44B13Id,'Nami.W');
for(const team of ['blue','red']){
 capture(fixture(team),'Nami.Q.V42',f=>{
  const q=f.a.queueKitSkillV42(team,f.u.id,'Q',{x:.52,y:.5});
  assert.ok(q.ok,'Q rejected: '+JSON.stringify(q));
  f.a.resolveKitSkillsV42();
  assert.ok(f.enemy.hp<2000);
  assert.equal(f.u.mana,440);
  return q;
 });
 capture(fixture(team),'Nami.W.targeted_V42',f=>{
  const q=f.a.queueTargetedSkill(team,f.u.id,'W',f.ally.id);
  assert.ok(q.ok,'W targeted rejected: '+JSON.stringify(q));
  f.a.resolveTargetedCasts();
  assert.equal(f.u.pendingTargetedCast,null);
  return q;
 });
 capture(fixture(team),'Nami.W.board_M44B13',f=>{
  const q=f.a.queueBoardSkillV453Dev69(team,f.u.id,'W',{targetId:f.ally.id});
  assert.ok(q.ok,'W board rejected: '+JSON.stringify(q));
  f.a.resolveBoardSkillsV453Dev69();
  assert.equal(f.u.pendingBoardV453Dev69,null);
  return q;
 });
 capture(fixture(team),'Nami.R.temporal_wave',f=>{
  const q=f.a.queueDirectionalSkill(team,f.u.id,'R',{x:.9,y:.5});
  assert.ok(q.ok,'R rejected: '+JSON.stringify(q));
  f.a.resolveDirectionalSkills();
  assert.equal(f.a.championProjectilesV453Dev42.some(p=>p.kind==='nami_r'),true);
  f.a.gameTime=.5;f.a.advanceChampionProjectilesV453Dev42();
  return q;
 });
}
assert.equal(traces.length,8);
const payload={schema:'coachlol.m45.skills.s07.nami-routes-capture.v1',source_branch:'dev69/skills-batch2',
 engine_blob:expected,run_environment:{node:process.version,platform:process.platform},
 certifies_rust:false,certifies_gameplay:false,trust:'LEGACY_NODE_EXECUTED',traces};
const output=resolve(here,'s07_nami_routes.local.json');
writeFileSync(output,JSON.stringify(payload,null,2)+'\n');
console.log('M45_S07_NAMI_ROUTES',JSON.stringify({traces:traces.length,seats:2,checkpointMatches:traces.length,output}));
