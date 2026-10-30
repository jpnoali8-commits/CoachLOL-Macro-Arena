/**
 * M34 PvP: five *different authored* charge identities use server-owned
 * start/release timestamps (not a client-supplied duration). Both human seats,
 * interrupted start, forged release and checksum-stable snapshots.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const families=[
 ['Xerath','Q',{x:.59,y:.5},.565,'projectile_long_range'],
 ['Varus','Q',{x:.59,y:.5},.565,'charged_piercing_arrow'],
 ['Vi','Q',{x:.541,y:.5},.541,'charged_vault_breaker'],
 ['Zac','E',{x:.55,y:.5},.55,'elastic_slingshot'],
 ['Galio','W',null,.523,'durand_shield_taunt']
];
let starts=0,releases=0,snapshots=0,negative=0;const failures=[];
function fixture(champ,team,enemyX){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:343434,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:4000,maxHp:4000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===foe+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:enemyX,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const replay=()=>{
  const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),
   checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  snapshots++;
 };
 return {a,u,e,foe,replay};
}
function attempt(label,fn){
 try{fn()}catch(err){failures.push({label,error:String(err.stack||err)})}
}
for(const team of ['blue','red']){
 for(const [champ,slot,point,enemyX,identity] of families){
  attempt(team+' '+champ+' '+identity,()=>{
   const {a,u,e,foe,replay}=fixture(champ,team,enemyX);
   assert.equal(a.queueBoardChargeReleaseV453Dev69(team,u.id,slot,{point}).ok,false,
    'Cannot release a charge the human player never started');
   assert.equal(a.queueBoardChargeStartV453Dev69(foe,u.id,slot).ok,false,
    'Enemy owner cannot start this champion charge');negative+=2;
   const mana=u.mana;
   assert.equal(a.queueBoardChargeStartV453Dev69(team,u.id,slot).ok,true);
   assert.equal(a.queueBoardChargeStartV453Dev69(team,u.id,slot).ok,false,
    'No two different abilities in same planning slot');
   a.resolveBoardSkillsV453Dev69();
   assert.equal(u.m34ChargeStateV453?.slot,slot);
   assert.equal(u.mana,mana,'Start does not double-pay future release');
   assert.equal(u.skillCds[slot],0,'Start does not begin final hit cooldown');
   starts++;replay();
   a.gameTime+=2;a.round++;a.actionLocksV40={};
   assert.equal(a.queueBoardChargeStartV453Dev69(team,u.id,slot).ok,false,
    'No duplicate start while real charge active');
   const q=a.queueBoardChargeReleaseV453Dev69(team,u.id,slot,{point});
   assert.equal(q.ok,true,champ+' queue '+JSON.stringify(q));
   assert.equal(q.trustedChargeSeconds,2);
   a.resolveBoardSkillsV453Dev69();
   assert.equal(u.m34ChargeStateV453,null,'One charged shot consumes only its own charge');
   assert.ok(u.skillCds[slot]>a.gameTime,'Native champion spell committed');
   if(champ==='Zac')assert.equal(u.mana,mana,'Zac Slingshot uses health, not mana');
   else assert.ok(u.mana<mana,'Native mana champion skill pays at release');
   if(champ==='Galio')assert.equal(a.effectResolverV41().has(e,'taunt'),true);
   else if(champ==='Zac'||champ==='Vi'){
    assert.ok(u.x>.52,identity+' displaces its champion');
    assert.ok(e.hp<7000,identity+' hits target at skill-specific range');
   }else assert.ok(e.hp<7000,identity+' deals authored projectile damage');
   releases++;replay();
  });
 }
 // A forged pending duration is denied by authoritative commit even when
 // the release was legitimately staged by this player.
 attempt(team+' Vi duration forgery',()=>{
  const {a,u,replay}=fixture('Vi',team,.53);
  assert.equal(a.queueBoardChargeStartV453Dev69(team,u.id,'Q').ok,true);
  a.resolveBoardSkillsV453Dev69();a.gameTime+=1;a.round++;a.actionLocksV40={};
  assert.equal(a.queueBoardChargeReleaseV453Dev69(team,u.id,'Q',
   {point:{x:.525,y:.5}}).ok,true);
  u.pendingBoardV453Dev69.m28ChargeSeconds=2;
  const mana=u.mana;
  let receipt;const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(v,q)=>(receipt=original(v,q));
  a.resolveBoardSkillsV453Dev69();
  a.executeBoardSkillV453Dev69=original;
  assert.equal(receipt?.reason,'m34_charge_duration_mismatch');
  assert.equal(u.mana,mana);
  assert.equal(u.skillCds.Q,0);
  assert.equal(u.m34ChargeStateV453?.slot,'Q');
  negative++;replay();
 });
 attempt(team+' Varus stunned before start commit',()=>{
  const {a,u,e,replay}=fixture('Varus',team,.52);
  assert.equal(a.queueBoardChargeStartV453Dev69(team,u.id,'Q').ok,true);
  a.applyEffectV41(u,'stun',{source:e,duration:3,key:'m34_interrupt'});
  const mana=u.mana;a.resolveBoardSkillsV453Dev69();
  assert.equal(u.m34ChargeStateV453??null,null);
  assert.equal(u.mana,mana);
  negative++;replay();
 });
}
for(const failure of failures)console.error('M34_CHARGE_FAIL',JSON.stringify(failure));
console.log('M34_CHARGE_QA '+JSON.stringify({identities:families.length,seats:2,
 starts,releases,snapshots,negative,failed:failures.length,certifiedFullKits:0}));
assert.equal(failures.length,0);
assert.equal(starts,10);
assert.equal(releases,10);
assert.equal(negative,24);
