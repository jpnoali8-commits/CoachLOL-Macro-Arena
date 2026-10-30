#!/usr/bin/env node
/** M45 B02 Skills S16 — original legacy source oracle, NOT Rust/WASM.
 * Engine source f0b1147ac46e585a1d5374a178b1ea462f5dc278,
 * engine blob 41679f7328a42e379fdfb8de5b92006e1bfb529f.
 * Exposes one potential fidelity risk: visibility-dependent server physics for
 * authored missiles versus clones. The issue must be reviewed, NOT auto-fixed
 * until rules and actual server private visibility are established.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../../../multiplayer/authoritative_actions_v453_dev47.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const opposite=team=>team==='blue'?'red':'blue';
const seats=[
 {seatId:'B',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
 {seatId:'R',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']},
];
const inactive=u=>Object.assign(u,{x:.08,y:.08,autoAttack:false,
 autoFollow:false,autoFarm:false,autoJungle:false});
const stats=u=>Object.assign(u,{level:6,hp:1500,maxHp:1500,
 mana:1000,maxMana:1000,skillRanks:{Q:1,W:1,E:1,R:1},
 skillCds:{Q:0,W:0,E:0,R:0}});
function checkpoint(a){
 const snap=a.snapshotV40(),clone=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(clone.snapshotV40()));
 assert.equal(clone.units.length,10);
 return checksumV40(snap);
}
function multi(team){
 const other=opposite(team);
 const a=new Arena(map,mask,{seed:6916,mode:'pvp',
  draft:{[team]:{TOP:'Neeko',MID:'Shaco'},[other]:{MID:'Ahri'}}});
 for(const u of a.units)inactive(u);
 const neeko=a.units.find(v=>v.id===team+'_TOP'),
  shaco=a.units.find(v=>v.id===team+'_MID'),
  attacker=a.units.find(v=>v.id===other+'_MID');
 stats(neeko);stats(shaco);stats(attacker);
 Object.assign(neeko,{x:.51,y:.5});Object.assign(shaco,{x:.52,y:.5});
 Object.assign(attacker,{x:.45,y:.5});
 a.canSeePoint=()=>true;
 assert.equal(a.queueNeekoDisguiseV453M15(team,neeko.id,shaco.id).ok,true);
 assert.equal(a.queueKitSkillV42(team,shaco.id,'R',{x:.50,y:.5}).ok,true);
 a.resolveBoardSkillsV453Dev69();a.gameTime=1;
 const clone=a.boardSummonsV453Dev69.find(v=>v.kind==='shaco_clone');
 assert.ok(clone);assert.equal(a.units.length,10);
 const aliases=[
  neeko.neekoDisguiseV453M15.publicId,
  shaco.shacoPublicAliasV453M15,
  clone.publicId,
 ];
 assert.equal(new Set(aliases).size,3);
 const gateway=new AuthoritativeActionsV453Dev47(a,seats),
  seat=other==='blue'?'B':'R';
 const attack=(sequence,targetId)=>gateway.submit(seat,
  {sequence,kind:'order.attack',unitId:attacker.id,payload:{targetId}});
 const v=a.perspective(other);
 for(const alias of aliases)assert.ok(v.units.some(x=>x.id===alias&&x.champ==='Shaco'));
 for(const internal of [neeko.id,shaco.id,clone.id])
  assert.ok(!v.units.some(x=>x.id===internal));
 assert.ok(!v.boardSummons.some(x=>x.id===clone.id));
 for(let i=0;i<3;i++){
  assert.equal(attack(i+1,[neeko.id,shaco.id,clone.id][i]).ok,false);
  assert.equal(attack(i+1,aliases[i]).ok,true);
 }
 const revision=gateway.revision;
 assert.equal(attack(3,aliases[2]).ok,true,'idempotent packet replay');
 assert.equal(gateway.revision,revision,'replay does not increment revision');
 assert.equal(attack(3,aliases[0]).ok,false,'sequence payload conflict');
 checkpoint(a);
 a.canSeePoint=lookingTeam=>lookingTeam!==other;
 const noVision=a.perspective(other);
 for(const alias of aliases){
  assert.ok(!noVision.units.some(x=>x.id===alias));
  const reject=attack(4,alias);
  assert.equal(reject.ok,false);assert.equal(reject.reason,'alvo_indisponivel');
 }
 a.canSeePoint=()=>true;
 assert.equal(attack(4,aliases[1]).ok,true);
 checkpoint(a);
 a.gameTime=18.1;a.advanceBoardSummonsV453Dev69();
 assert.equal(attack(5,aliases[2]).ok,false,'expired clone alias');
 assert.equal(attack(5,aliases[1]).ok,false,'old real Shaco alias');
 assert.equal(attack(5,aliases[0]).ok,true,'Neeko still disguised');
 assert.equal(a.queueNeekoDisguiseV453M15(team,neeko.id,'self').ok,true);
 assert.equal(attack(6,aliases[0]).ok,false,'cleared disguise alias');
 checkpoint(a);
 return {team,aliases,completedRevisions:gateway.revision,roster:a.units.length};
}
function temporal(team,champ,cloneChamp,loseVision){
 const other=opposite(team);
 const a=new Arena(map,mask,{seed:6916,mode:'pvp',
  draft:{[team]:{MID:champ},[other]:{MID:cloneChamp}}});
 for(const u of a.units)inactive(u);
 const caster=a.units.find(u=>u.id===team+'_MID'),
  owner=a.units.find(u=>u.id===other+'_MID');
 stats(caster);stats(owner);
 Object.assign(caster,{x:.48,y:.5});
 Object.assign(owner,{x:.5,y:.5});
 a.canSeePoint=()=>true;
 const source=cloneChamp==='Shaco'?'R':'W';
 const castClone=a.queueKitSkillV42(other,owner.id,source,{
  x:cloneChamp==='Shaco'?.47:.53,y:.5});
 assert.equal(castClone.ok,true);
 a.resolveBoardSkillsV453Dev69();
 const clone=a.boardSummonsV453Dev69.find(z=>
  z.kind===cloneChamp.toLowerCase()+'_clone');
 assert.ok(clone);
 assert.equal(clone.hp,1500);
 owner.x=.58; // isolate swept collision; actual gameplay move not claimed
 const slot=champ==='Ahri'?'E':'R';
 assert.equal(a.queueBoardSkillV453Dev69(team,caster.id,slot,
  {point:{x:.9,y:.5}}).ok,true);
 a.resolveBoardSkillsV453Dev69();
 assert.equal(caster.mana,champ==='Ahri'?940:900);
 assert.equal(clone.hp,1500,'temporal projectile has no immediate hit');
 checkpoint(a);
 if(loseVision)
  a.canSeePoint=lookingTeam=>lookingTeam!==team;
 a.gameTime=1;a.advanceBoardTemporalV453Dev69();
 if(!loseVision){
  const expected=cloneChamp==='Shaco'?
   (champ==='Ahri'?1380:1200):(champ==='Ahri'?1420:1300);
  assert.equal(clone.hp,expected,'authored missile hits visible decoy');
  assert.equal(owner.hp,1500,'champion behind visible clone is protected');
 }else{
  assert.equal(clone.hp,1500,'legacy hides clone from projectile pool');
 }
 for(let t=2;t<=4;t++){a.gameTime=t;a.advanceBoardTemporalV453Dev69();}
 if(loseVision){
  assert.equal(clone.hp,1500,'unseen clone receives no hit in legacy');
  if(champ==='Ashe')assert.ok(owner.hp<1500,
   'global missile hits actual champion while bypassing invisible decoy');
  else assert.equal(owner.hp,1500,
   'Ahri E has insufficient range to hit the distant real champion');
 }else{
  assert.equal(owner.hp,1500,'single-hit missile must not pierce visible clone');
 }
 checkpoint(a);
 return {team,champ,cloneChamp,loseVision,
  cloneHp:clone.hp,ownerHp:owner.hp,
  status:loseVision?'FOG_DEPENDENT_LEGACY_COLLISION_RISK':'VISIBLE_CLONE_HIT'};
}
let cases=0;
const aliasCases=[],temporalCases=[];
for(const team of ['blue','red']){
 aliasCases.push(multi(team));cases++;
 for(const champ of ['Ahri','Ashe'])
  for(const cloneChamp of ['Neeko','Shaco'])
   for(const loseVision of [false,true]){
    temporalCases.push(temporal(team,champ,cloneChamp,loseVision));cases++;
   }
}
assert.equal(aliasCases.length,2);
assert.equal(temporalCases.length,16);
assert.equal(cases,18);
console.log('M45_S16_ALIAS_TEMPORAL '+JSON.stringify({cases,
 aliases:aliasCases,temporal:temporalCases,
 runtime:'LEGACY_SOURCE_V8_NOT_RUST_WASM_OR_REAL_FOG'}));
