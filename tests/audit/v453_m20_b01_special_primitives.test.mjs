/**
 * M20 B01 behavioral gates for real, reusable primitives.
 * Explicitly NOT a full P+QWER kit certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
function setup(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20269221,mode:'pvp',draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:2000,maxHp:2000,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:1800,maxHp:2000,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.508,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 Object.assign(ally,{x:.51,y:.50,hp:1250,maxHp:2000});
 a.canSeePoint=()=>true;a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,opts={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+slot+' queue: '+queued.reason);
  a.resolveBoardSkillsV453Dev69();
 };
 return {a,u,e,ally,team,other,cast};
}
let passed=0;
for(const team of ['blue','red']){
 // Karthus R has a 3-second, interruptible server clock. No premature damage.
 {
  const {a,u,e,cast}=setup('Karthus',team);
  const hp=e.hp;cast('R');
  assert.equal(e.hp,hp,'Requiem must not resolve at cast');
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m20_requiem_channel'));
  const before=a.snapshotV40();
  assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,before).snapshotV40()),checksumV40(before));
  a.gameTime=2.5;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,hp,'Requiem hit before channel finished');
  a.gameTime=3.01;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.hp<hp,'Requiem channel did not damage visible enemy');
  assert.equal(a.boardTemporalV453Dev69.filter(z=>z.kind==='m20_requiem_channel').length,0);
  const after=e.hp;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,after,'Requiem duplicated damage');
  passed++;
 }
 {
  const {a,u,e,cast}=setup('Karthus',team);
  const hp=e.hp;cast('R');
  a.gameTime=1;
  assert.equal(a.applyEffectV41(u,'stun',{source:e,duration:5}).ok,true);
  a.advanceBoardTemporalV453Dev69();
  a.gameTime=3.1;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,hp,'interrupted Requiem still dealt damage');
  assert.equal(a.boardTemporalV453Dev69.filter(z=>z.kind==='m20_requiem_channel').length,0);
  passed++;
 }
 // Heimer turrets must stay put, attack enemies and be bounded, not spawn champions.
 {
  const {a,u,e,cast}=setup('Heimerdinger',team);
  const pos={x:.51,y:.5},hp=e.hp;cast('Q',{point:pos});
  let turrets=a.boardSummonsV453Dev69.filter(x=>x.kind==='heimer_turret'&&x.hp>0);
  assert.equal(turrets.length,1);assert.equal(a.units.length,10);
  assert.equal(u.x,.5,'deploy moved Heimer himself');
  a.gameTime=1.1;a.advanceBoardSummonsV453Dev69();
  assert.ok(e.hp<hp,'turret did not attack enemy');
  assert.equal(turrets[0].x,pos.x,'turret wandered');
  const snap=a.snapshotV40();
  assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()),checksumV40(snap));
  for(let n=0;n<3;n++){
   a.gameTime+=1.2;u.skillCds.Q=0;cast('Q',{point:{x:.51+n*.001,y:.5}});
  }
  turrets=a.boardSummonsV453Dev69.filter(x=>x.kind==='heimer_turret'&&x.hp>0);
  assert.ok(turrets.length<=3,'turret cap broken');
  passed++;
 }
 // A global mark-gated R cannot reveal or hit hidden/unmarked champions.
 {
  const {a,u,e,cast}=setup('Mel',team);
  const mana=u.mana;
  const denied=a.queueBoardSkillV453Dev69(team,u.id,'R');
  assert.equal(denied.ok,false,'unmarked Mel R was allowed');
  assert.equal(u.mana,mana,'denied R spent mana');
  cast('E',{point:{x:.51,y:.5}});
  assert.ok((e.m20MarksV453||{})['overwhelm_'+u.id]>a.gameTime,'Mel E did not apply mark');
  const hp=e.hp;cast('R');
  assert.ok(e.hp<hp,'Mel R did not detonate existing mark');
  passed++;
 }
 // Zilean W rewinds Q/E once, not its own W or R, no double-commit.
 {
  const {a,u,cast}=setup('Zilean',team);
  u.skillCds.Q=35;u.skillCds.E=28;
  cast('W');
  assert.equal(u.skillCds.Q,25);
  assert.equal(u.skillCds.E,18);
  assert.ok(u.skillCds.W>a.gameTime,'rewind did not consume W cooldown');
  const cd=u.skillCds.Q;a.resolveBoardSkillsV453Dev69();
  assert.equal(u.skillCds.Q,cd,'replayed rewind');
  passed++;
 }
 // Ally-linked travel is authoritative, not a client-side teleport.
 {
  const {a,u,ally,cast}=setup('Shen',team);
  const old={x:u.x,y:u.y};
  cast('R',{targetId:ally.id});
  assert.notDeepEqual({x:u.x,y:u.y},old);
  assert.deepEqual({x:u.x,y:u.y},{x:ally.x,y:ally.y});
  const snap=a.snapshotV40();
  assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()),checksumV40(snap));
  passed++;
 }
 // Snapshot-safe Syndra spheres are owned by the champion, not ephemeral UI.
 {
  const {a,u,cast}=setup('Syndra',team);
  cast('Q',{point:{x:.51,y:.5}});
  assert.equal(u.m20SyndraOrbsV453?.length,1);
  const snap=a.snapshotV40();
  assert.equal(checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()),checksumV40(snap));
  cast('R',{targetId:a.units.find(v=>v.team!==team&&v.id.endsWith('_MID')).id});
  assert.equal(u.m20SyndraOrbsV453?.length,0);
  passed++;
 }
 // Fog for a targeted skill cannot be bypassed by a new M20 descriptor.
 {
  const {a,u,e}=setup('Lulu',team);a.visible=()=>false;
  const before=u.mana;
  const q=a.queueBoardSkillV453Dev69(team,u.id,'W',{targetId:e.id});
  assert.equal(q.ok,false,'fog bypass by enemy polymorph');
  assert.equal(u.mana,before);
  passed++;
 }
}
console.log('M20_B01_SPECIAL_QA '+JSON.stringify({seats:2,cases:passed,certifiedChampions:0,
 note:'Checks time, interruption, deterministic turret, mark, rewind, teleport, orb, fog'}));
assert.equal(passed,16);
