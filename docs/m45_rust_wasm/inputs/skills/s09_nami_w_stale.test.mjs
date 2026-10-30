#!/usr/bin/env node
/** M45 B02 S09 — source-pinned legacy stale Nami W intent witness, NOT Rust parity.
 * Intentionally observes a suspected legacy bug; never legitimizes it in Rust.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Arena,checksumV40} from '../../../../engine.mjs';
const here=dirname(fileURLToPath(import.meta.url)), root=resolve(here,'../../../../');
const expected='41679f7328a42e379fdfb8de5b92006e1bfb529f';
const file=readFileSync(resolve(root,'engine.mjs'));
const hash=createHash('sha1').update('blob '+file.length+'\0').update(file).digest('hex');
assert.equal(hash,expected,'legacy engine changed');
const json=n=>JSON.parse(readFileSync(resolve(root,'data',n),'utf8'));
const map=json('coachlol_map_v6.json'),mask=json('masks_128.json');
const captured=[];
function fixture(team){
 const opponent=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:450209,mode:'pvp',roundSeconds:10,draft:{[team]:{MID:'Nami'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),ally=a.units.find(v=>v.id===team+'_TOP'),enemy=a.units.find(v=>v.id===opponent+'_MID');
 Object.assign(u,{champ:'Nami',x:.5,y:.5,mana:500,maxMana:500,ap:0,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(ally,{x:.53,y:.5,hp:400,maxHp:2000});
 Object.assign(enemy,{x:.54,y:.5,hp:2000,maxHp:2000,mr:0});
 a.visible=()=>true;a.duelPermission=()=>true;
 return {a,u,ally,enemy,team,opponent};
}
function capture(team,sequence){
 const f=fixture(team),{a,u,ally,opponent}=f;
 const original=checksumV40(a.snapshotV40());
 const intents=sequence.map(kind=>{
  const result=kind==='targeted'?a.queueTargetedSkill(team,u.id,'W',ally.id):
    a.queueBoardSkillV453Dev69(team,u.id,'W',{targetId:ally.id});
  assert.equal(result.ok,true,team+': '+kind+' queue rejected '+JSON.stringify(result));
  assert.equal(u.mana,500,'queue incorrectly debited');
  return {kind,result};
 });
 assert.equal(a.queueTargetedSkill(opponent,u.id,'W',ally.id).ok,false,'foreign seat accepted');
 assert.equal(a.queueBoardSkillV453Dev69(opponent,u.id,'W',{targetId:ally.id}).ok,false,'foreign board seat accepted');
 assert.equal(u.mana,500,'foreign seat charged mana');
 // Actual resolveCombat() cast ordering: board first, then targeted (legacy source 17875).
 a.resolveBoardSkillsV453Dev69();
 assert.equal(u.mana,430,'first authored W must debit once');
 assert.ok(u.skillCds.W>a.gameTime,'board W must enter cooldown');
 const cooldownEnd=u.skillCds.W;
 a.resolveTargetedCasts();
 const pendingAfterConflict=!!u.pendingTargetedCast;
 const manaAfterConflict=u.mana;
 assert.equal(manaAfterConflict,430,'same-tick W was double debited');
 // This is a legacy debt witness: don't call it an approved feature.
 assert.equal(pendingAfterConflict,true,'stale targeted W intent changed: revisit debt evidence');
 const stalled=checksumV40(a.snapshotV40());
 // Isolate a later simulated tick after cooldown; not a full turn scheduler.
 a.gameTime=cooldownEnd+.25;
 a.resolveTargetedCasts();
 const manaAfterExpiry=u.mana;
 const pendingAfterExpiry=!!u.pendingTargetedCast;
 assert.equal(manaAfterExpiry,360,'expected stale intent to consume another W at cooldown expiry');
 assert.equal(pendingAfterExpiry,false,'stale intent should have cleared after later W');
 const end=a.snapshotV40(),after=checksumV40(end);
 assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,end).snapshotV40()),after,'restore checksum changed');
 const result={seat:team,opponent,sequence,source_sha:hash,seed:450209,
  initial_checksum:original,stalled_checksum:stalled,final_checksum:after,
  intents,first_cast:{mana:manaAfterConflict,cooldownEnd,pendingAfterConflict},
  later_cast:{simTime:a.gameTime,mana:manaAfterExpiry,pendingAfterExpiry,allyHp:ally.hp},
  evidence_class:'LEGACY_BUG_REPRO_ONLY_NOT_DESIRED_RUST_BEHAVIOR'};
 captured.push(result);
}
for(const team of ['blue','red']){
 capture(team,['targeted','board']);
 capture(team,['board','targeted']);
}
assert.equal(captured.length,4);
const out={schema:'coachlol.m45.skills.s09.nami-w-stale-intent.v1',
 source_commit:'f0b1147ac46e585a1d5374a178b1ea462f5dc278',
 engine_git_blob_sha:expected,environment:{node:process.version,platform:process.platform},
 mock_visibility:true,mock_duel_permission:true,no_rust_or_wasm_parity:true,
 status:'LEGACY_NODE_EXECUTED_ONLY_IF_THIS_SCRIPT_FINISHES',cases:captured};
const path=resolve(here,'s09_nami_w_stale.local.json');
writeFileSync(path,JSON.stringify(out,null,2)+'\n');
console.log('M45_S09_NAMI_W_STALE',JSON.stringify({cases:captured.length,seats:2,
 expectedLegacyBugObserved:true,rustDesiredBehavior:'reject stale cast',output:path}));
