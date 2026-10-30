/**
 * M35 B01: full 35 champion macro PvP ingress regression. These are
 * ownership/facing/charging/evolution contracts, NOT 35 certified kits.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,BOARD_M20_B01_V453} from '../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../multiplayer/authoritative_actions_v453_dev47.mjs';
import {M35_AUTHORED_CHARGES_PVP} from '../../multiplayer/authoritative_actions_v453_dev44.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const CHAMPS=Object.keys(BOARD_M20_B01_V453).sort();
assert.equal(CHAMPS.length,35);
const CHARGE=Object.entries(M35_AUTHORED_CHARGES_PVP);
assert.equal(CHARGE.length,5);
let facing=0,unauthorized=0,deniedNonCharge=0,chargeStart=0,chargeRelease=0,
 legacyDenied=0,replay=0,research=0;
const failures=[];
function setup(champ,team){
 const foe=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:353535,mode:'pvp',
  draft:{[team]:{MID:champ},[foe]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:4000,maxHp:4000,
  autoFollow:false,autoAttack:false,autoJungle:false,autoFarm:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===foe+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.512,y:.5,hp:7000,maxHp:7000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const owner=team==='blue'?'p1':'p2',intruder=team==='blue'?'p2':'p1';
 const gw=new AuthoritativeActionsV453Dev47(a,[
  {seatId:'p1',unitId:'blue_MID'},
  {seatId:'p2',unitId:'red_MID'}]);
 const invoke=(kind,payload={},seq=gw.seats.get(owner).lastSequence+1)=>gw.submit(owner,{
  sequence:seq,kind,payload,unitId:u.id});
 const snap=()=>{const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));replay++};
 return {a,u,e,gw,owner,intruder,invoke,snap};
}
function run(champ,team,label,fn){
 try{fn(setup(champ,team))}catch(err){failures.push({champ,team,label,error:String(err?.stack||err)})}
}
for(const team of ['blue','red'])for(const champ of CHAMPS){
 run(champ,team,'owner-only face and macro ingress',({a,u,gw,owner,intruder,invoke,snap})=>{
  const pretender=gw.submit(intruder,{sequence:1,kind:'skill.face',
   unitId:u.id,payload:{point:{x:.53,y:.5}}});
  assert.equal(pretender.ok,false,'other human cannot send own champion orders');
  assert.equal(u.m28FacingV453??null,null,'spoof did not orient champion');
  unauthorized++;
  assert.equal(invoke('skill.face',{point:{x:.53,y:.5}}).ok,true);
  assert.ok(Math.abs(u.m28FacingV453.x-1)<1e-9,'face must use actual board direction');
  assert.ok(Math.abs(u.m28FacingV453.y)<1e-9);
  const first=checksumV40(a.snapshotV40());
  assert.equal(invoke('skill.face',{point:{x:.53,y:.5}},1).ok,true,
   'retransmit returns existing exact receipt');
  assert.equal(checksumV40(a.snapshotV40()),first,'ack cannot apply facing twice');
  const invalid=inokeFail();
  function inokeFail(){return invoke('skill.face',{point:{x:3,y:.5}},2)}
  assert.equal(invalid.ok,false,'out-of-map direction rejected');
  assert.equal(checksumV40(a.snapshotV40()),first);
  const enemyView=gw.view(intruder),foreign=enemyView?.units?.find(v=>v.id===u.id);
  assert.ok(!foreign||!Object.hasOwn(foreign,'m28FacingV453'),
   'enemy must not receive the private complete champion record');
  const start=invoke('skill.charge.start',{slot:'Q'});
  if(M35_AUTHORED_CHARGES_PVP[champ]==='Q')assert.equal(start.ok,true);
  else{
   assert.equal(start.ok,false,'non-authoritative charge mechanic not permitted');
   deniedNonCharge++;
  }
  facing++;snap();
 });
}
for(const team of ['blue','red'])for(const [champ,slot] of CHARGE){
 run(champ,team,'mandatory secure charge, no public bypass',({a,u,e,invoke,snap})=>{
  // New fixture: no preceding pending facing/charge orders.
  const options=(champ==='Galio'?{}:{point:
   {x:champ==='Zac'?.55:champ==='Vi'?.54:.57,y:.5}});
  e.x=champ==='Galio'?.523:champ==='Vi'?.54:champ==='Zac'?.55:.565;
  assert.equal(invoke('skill.directional',{slot,point:{x:.55,y:.5}}).reason,
   'm35_charge_requires_staging');
  assert.equal(invoke('skill.ground',{slot,point:{x:.55,y:.5}}).reason,
   'm35_charge_requires_staging');
  assert.equal(invoke('skill.self',{slot}).reason,'m35_charge_requires_staging');
  assert.equal(invoke('skill.targeted',{slot,targetId:e.id}).reason,
   'm35_charge_requires_staging');
  assert.equal(invoke('order.combo',{targetId:e.id,steps:[slot]}).reason,
   'm35_charge_requires_staging');
  legacyDenied+=5;
  const submitted=invoke('skill.charge.release',{slot,...options});
  assert.equal(submitted.ok,false,'no arbitrary charge release before start');
  assert.equal(invoke('skill.charge.start',{slot,chargeSeconds:2}).ok,false,
   'never trust client chargeSeconds');
  assert.equal(invoke('skill.charge.release',{slot,...options,chargeSeconds:2}).ok,false);
  const started=invoke('skill.charge.start',{slot});
  assert.equal(started.ok,true,champ+' start '+JSON.stringify(started));chargeStart++;
  const seq=started.sequence;
  assert.equal(invoke('skill.charge.start',{slot},seq).ok,true,
   'retransmitting authenticated start returns receipt');
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.m34ChargeStateV453?.slot,slot);
  assert.equal(u.skillCds[slot],0);
  assert.equal(invoke('skill.charge.start',{slot}).ok,false,'no concurrent charge');
  a.gameTime+=2;a.round++;a.actionLocksV40={};
  const released=invoke('skill.charge.release',{slot,...options});
  assert.equal(released.ok,true,champ+' release '+JSON.stringify(released));chargeRelease++;
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.m34ChargeStateV453,null);
  assert.ok(u.skillCds[slot]>a.gameTime);
  const after=checksumV40(a.snapshotV40());
  assert.equal(invoke('skill.charge.release',{slot,...options},released.sequence).ok,true,
   'same release receipt is idempotent');
  assert.equal(checksumV40(a.snapshotV40()),after,'one release, one commitment');
  snap();
 });
}
for(const team of ['blue','red']){
 run('Viktor',team,'Viktor only earned fragments and LIFO rollback',({a,u,invoke,snap})=>{
  assert.equal(invoke('skill.viktor.evolve',{slot:'R'}).ok,false);
  assert.equal(invoke('skill.viktor.evolve',{slot:'Q'}).ok,false,
   'research cannot invent earned fragments');
  u.m30ViktorFragments=100;
  assert.equal(invoke('skill.viktor.evolve',{slot:'Q'}).ok,true);
  assert.equal(u.m30ViktorAugments?.Q,true);
  assert.equal(u.m30ViktorFragments,0);
  assert.equal(invoke('skill.viktor.undo',{}).ok,true);
  assert.equal(u.m30ViktorFragments,100);
  assert.equal(u.m30ViktorAugments?.Q,undefined);
  research++;snap();
 });
}
for(const fail of failures)console.error('M35_INGRESS_FAIL',JSON.stringify(fail));
console.log('M35_B01_PVP_INGRESS_QA '+JSON.stringify({
 champions:CHAMPS.length,seats:2,facing,unauthorized,deniedNonCharge,
 chargeFamilies:CHARGE.length,chargeStart,chargeRelease,legacyDenied,research,
 snapshots:replay,failures:failures.length,certifiedKits:0
}));
assert.equal(failures.length,0);
assert.equal(facing,70);
assert.equal(unauthorized,70);
assert.equal(deniedNonCharge,64);
assert.equal(chargeStart,10);
assert.equal(chargeRelease,10);
assert.equal(legacyDenied,50);
assert.equal(research,2);
assert.equal(replay,82);
