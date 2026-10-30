#!/usr/bin/env node
/** M45 B02 S08: real legacy Node oracle for conflicting Nami W cast paths.
 * Does not certify gameplay parity, fog, network, Rust or WASM.
 * Run only with original source branch engine.mjs pinned to Git blob.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Arena, abilityRule, kitSpellV42, checksumV40} from '../../../../engine.mjs';
const here=dirname(fileURLToPath(import.meta.url)), root=resolve(here,'../../../../');
const expected='41679f7328a42e379fdfb8de5b92006e1bfb529f';
const engineBytes=readFileSync(resolve(root,'engine.mjs'));
const actual=createHash('sha1').update('blob '+engineBytes.length+'\0').update(engineBytes).digest('hex');
assert.equal(actual,expected,'engine source blob changed: cannot use this oracle');
const load=n=>JSON.parse(readFileSync(resolve(root,'data',n),'utf8'));
const map=load('coachlol_map_v6.json'), mask=load('masks_128.json');
const observed=[];
const clone=x=>JSON.parse(JSON.stringify(x));
function setup(team){
 const foe=team==='blue'?'red':'blue';
 const arena=new Arena(map,mask,{mode:'pvp',seed:450208,roundSeconds:10,draft:{[team]:{MID:'Nami'}}});
 for(const x of arena.units)Object.assign(x,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=arena.units.find(x=>x.id===team+'_MID');
 const ally=arena.units.find(x=>x.id===team+'_TOP');
 const enemy=arena.units.find(x=>x.id===foe+'_MID');
 const enemy2=arena.units.find(x=>x.id===foe+'_TOP');
 Object.assign(u,{champ:'Nami',x:.5,y:.5,mana:500,maxMana:500,ap:0,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.53,y:.5,hp:300,maxHp:2000});
 Object.assign(enemy,{x:.55,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 Object.assign(enemy2,{x:.56,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 // This isolates dispatch behavior. Do not interpret it as real fog or duel-permission QA.
 arena.visible=()=>true;arena.duelPermission=()=>true;
 return {arena,u,ally,enemy,enemy2,team,foe};
}
const authored=abilityRule({champ:'Nami',skillRanks:{W:1},range:.03},'W');
const v42=kitSpellV42('Nami','W');
assert.equal(authored.m44B13Id,'Nami.W');
assert.equal(authored.bounceRange,undefined);
assert.equal(v42.bounceRange,800);
function trace(route, team, act){
 const f=setup(team),{arena:a,u,ally,enemy,enemy2,foe}=f;
 const before=a.snapshotV40(), eventsBefore=new Set(a.events.map(e=>e.id));
 const initial={mana:u.mana,allyHp:ally.hp,enemyHp:enemy.hp,enemy2Hp:enemy2.hp};
 const results=act(f);
 const after=a.snapshotV40();
 const delta={mana:initial.mana-u.mana,allyHeal:ally.hp-initial.allyHp,
  enemyDamage:initial.enemyHp-enemy.hp,enemy2Damage:initial.enemy2Hp-enemy2.hp};
 const sameSnapshot=checksumV40(after)===checksumV40(Arena.fromSnapshotV40(map,mask,after).snapshotV40());
 assert.equal(sameSnapshot,true,'checkpoint mismatch '+route+' '+team);
 assert.ok(delta.mana>=0&&delta.mana<=70,'unexpected double debit '+route+' '+team+': '+delta.mana);
 const events=a.events.filter(e=>!eventsBefore.has(e.id)).reverse();
 observed.push({route,team,foe,seed:450208,checksums:{before:checksumV40(before),after:checksumV40(after)},
  results:clone(results),effects:delta,remaining:{board:!!u.pendingBoardV453Dev69,targeted:!!u.pendingTargetedCast},
  eventKinds:events.map(x=>({kind:x.kind,text:x.text,actor:x.unitId,observedBy:x.observedBy})),
  perspectives:{blueUnitCount:a.perspective('blue').units.length,redUnitCount:a.perspective('red').units.length},
  verdict:'LEGACY_OBSERVATION_ONLY_NOT_RUST_PARITY'});
}
for(const team of ['blue','red']){
 trace('nami_w_targeted_v42',team,f=>{
  const r=f.arena.queueTargetedSkill(team,f.u.id,'W',f.ally.id);
  assert.equal(r.ok,true,'targeted W queue');
  f.arena.resolveTargetedCasts();
  return {queue:r};
 });
 trace('nami_w_authored_board',team,f=>{
  const r=f.arena.queueBoardSkillV453Dev69(team,f.u.id,'W',{targetId:f.ally.id});
  assert.equal(r.ok,true,'board W queue');
  f.arena.resolveBoardSkillsV453Dev69();
  return {queue:r};
 });
 trace('nami_w_competing_queues',team,f=>{
  const targeted=f.arena.queueTargetedSkill(team,f.u.id,'W',f.ally.id);
  const board=f.arena.queueBoardSkillV453Dev69(team,f.u.id,'W',{targetId:f.ally.id});
  assert.equal(targeted.ok,true,'targeted W queue while board unqueued');
  assert.equal(board.ok,true,'board W queue while targeted pending');
  // Main combat ordering is board then targeted. Record whether stale pending survives.
  f.arena.resolveBoardSkillsV453Dev69();
  f.arena.resolveTargetedCasts();
  return {targeted,board};
 });
 const f=setup(team);
 assert.equal(f.arena.queueTargetedSkill(f.foe,f.u.id,'W',f.ally.id).ok,false);
 assert.equal(f.arena.queueBoardSkillV453Dev69(f.foe,f.u.id,'W',{targetId:f.ally.id}).ok,false);
}
assert.equal(observed.length,6);
const output={schema:'coachlol.m45.skills.s08.w-dual-route-node.v1',
 legacy_source_commit:'f0b1147ac46e585a1d5374a178b1ea462f5dc278',
 legacy_engine_git_blob_sha:expected,source_verified:true,run_mode:'NODE_LEGACY_ORACLE',
 runtime:{node:process.version,platform:process.platform},
 limitations:['No real fog due to visible() mock','No network/2 browser sessions','Not a Rust/WASM comparison','Observed old bugs are not approved Rust behavior'],
 rule:{boardMarker:authored.m44B13Id,boardBounceRange:authored.bounceRange??null,v42BounceRange:v42.bounceRange},observed};
const outputPath=resolve(here,'s08_nami_w_routes.local.json');
writeFileSync(outputPath,JSON.stringify(output,null,2)+'\n');
console.log('M45_S08_NAMI_W',JSON.stringify({cases:observed.length,seats:2,sourcePinned:true,output:outputPath,parityCertified:false}));
