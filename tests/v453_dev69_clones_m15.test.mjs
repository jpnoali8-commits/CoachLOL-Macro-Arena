/** M15 contracts: clones, disguises, authority and snapshot. NOT champion certification. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
let count=0;const check=(name,fn)=>{fn();count++;console.log('✓ M15 '+name)};
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6915,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:6,hp:1200,maxHp:1200,
  mana:800,maxMana:800,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.518,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 a.canSeePoint=()=>true;a.visible=(seat,v)=>v.team===seat||true;
 return {a,u,enemy,team,other};
}
for(const team of ['blue','red']){
 const n=fixture('Neeko',team);
 check(team+' Neeko W creates a non-damaging clone without adding a champion',()=>{
  const result=n.a.queueKitSkillV42(team,n.u.id,'W',{x:.515,y:.5});
  assert.equal(result.ok,true,result.reason);
  n.a.resolveBoardSkillsV453Dev69();
  assert.equal(n.a.units.length,10);
  assert.equal(n.a.boardSummonsV453Dev69.length,1);
  const clone=n.a.boardSummonsV453Dev69[0];
  assert.equal(clone.kind,'neeko_clone');
  assert.equal(clone.nonCombat,true);
  assert.equal(clone.until,3);
  assert.equal(n.u.skillCds.W,19);
  assert.equal(n.u.mana,800);
 });
 check(team+' Neeko W recast redirects without another cost or clone',()=>{
  const clone=n.a.boardSummonsV453Dev69[0];
  const q=n.a.queueKitSkillV42(team,n.u.id,'W',{x:.525,y:.5});
  assert.equal(q.ok,true,q.reason);assert.equal(q.recast,true);
  n.a.resolveBoardSkillsV453Dev69();
  assert.equal(n.a.boardSummonsV453Dev69.length,1);
  assert.equal(clone.commandPoint.x,.525);
  assert.equal(n.u.skillCds.W,19);assert.equal(n.u.mana,800);
  n.a.gameTime=1;n.a.advanceBoardSummonsV453Dev69();
  assert.ok(clone.x>.5);
 });
 check(team+' Neeko clone expiration and snapshot remain deterministic',()=>{
  const before=Arena.fromSnapshotV40(map,mask,n.a.snapshotV40());
  assert.equal(checksumV40(before.snapshotV40()),checksumV40(n.a.snapshotV40()));
  n.a.gameTime=3;n.a.advanceBoardSummonsV453Dev69();
  assert.equal(n.a.boardSummonsV453Dev69.length,0);
  assert.equal(n.u.skillCds.W,19);
 });
 const d=fixture('Neeko',team);
 check(team+' Neeko selects ally appearance without mutating gold/XP/roster',()=>{
  const ally=d.a.units.find(v=>v.id===team+'_TOP');
  const old={gold:d.u.gold,xp:d.u.xp,x:d.u.x,y:d.u.y};
  assert.equal(d.a.queueNeekoDisguiseV453M15(team,d.u.id,ally.id).ok,true);
  assert.equal(d.u.champ,'Neeko');assert.equal(d.a.units.length,10);
  for(const [key,value] of Object.entries(old))assert.equal(d.u[key],value);
  const enemyView=d.a.perspective(d.other);
  assert.ok(enemyView.units.some(v=>v.id===d.u.neekoDisguiseV453M15.publicId&&v.champ===ally.champ));
  assert.ok(!enemyView.units.some(v=>v.id===d.u.id));
 });
 check(team+' Neeko false real ID fails before enemy team action',()=>{
  const seats=[
   {seatId:'seatB',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
   {seatId:'seatR',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}];
  const gateway=new AuthoritativeActionsV453Dev47(d.a,seats);
  const enemySeat=d.other==='blue'?'seatB':'seatR';
  const denied=gateway.submit(enemySeat,{sequence:1,kind:'order.attack',unitId:d.enemy.id,payload:{targetId:d.u.id}});
  assert.equal(denied.ok,false);assert.equal(denied.reason,'alvo_identidade_oculta');
  const alias=d.u.neekoDisguiseV453M15.publicId;
  const allowed=gateway.submit(enemySeat,{sequence:1,kind:'order.attack',unitId:d.enemy.id,payload:{targetId:alias}});
  assert.equal(allowed.ok,true,allowed.reason);
 });
 const sh=fixture('Neeko',team);
 check(team+' Neeko gathers one minion ShoMa over 2 seconds then mimics minion',()=>{
  const source={id:'m15_minion_'+team,kind:'melee',team:sh.other,x:.503,y:.5,hp:250,maxHp:250,spawnAt:0};
  sh.a.minions.push(source);
  const started=sh.a.queueNeekoShomaV453M15(team,sh.u.id,source.id);
  assert.equal(started.ok,true,started.reason);
  sh.a.gameTime=1;sh.a.advanceBoardPassivesV453Dev69();
  assert.equal(sh.u.neekoShomaV453M15,undefined);
  sh.a.gameTime=2;sh.a.advanceBoardPassivesV453Dev69();
  assert.equal(sh.u.neekoShomaV453M15.kind,'minion');
  assert.equal(sh.a.queueNeekoDisguiseV453M15(team,sh.u.id,'shoma').ok,true);
  const view=sh.a.perspective(sh.other);
  assert.ok(view.minions.some(v=>v.id===sh.u.neekoDisguiseV453M15.publicId));
  assert.ok(!view.units.some(v=>v.id===sh.u.id));
  assert.equal(sh.a.units.length,10);
 });
 const s=fixture('Shaco',team);
 check(team+' Shaco R creates independent clone with proper 18-second lifetime',()=>{
  const r=s.a.queueKitSkillV42(team,s.u.id,'R',{x:.525,y:.5});
  assert.equal(r.ok,true,r.reason);
  s.a.resolveBoardSkillsV453Dev69();
  const clone=s.a.boardSummonsV453Dev69[0];
  assert.equal(clone.kind,'shaco_clone');assert.equal(clone.until,18);
  assert.equal(s.a.units.length,10);
  assert.equal(s.u.mana,700);
  assert.equal(s.u.skillCds.R,100);
 });
 check(team+' Shaco real and clone appear under separate public aliases',()=>{
  s.a.gameTime=1;
  const view=s.a.perspective(s.other);
  const real=view.units.find(v=>v.id===s.u.shacoPublicAliasV453M15);
  const clone=view.units.find(v=>v.id===s.a.boardSummonsV453Dev69[0].publicId);
  assert.ok(real&&clone);
  assert.equal(real.champ,'Shaco');assert.equal(clone.champ,'Shaco');
  assert.ok(!view.units.some(v=>v.id===s.u.id));
  assert.ok(!view.boardSummons.some(v=>v.kind==='shaco_clone'));
 });
 check(team+' Shaco clone explosion is idempotent and creates 3 active boxes',()=>{
  const clone=s.a.boardSummonsV453Dev69.find(e=>e.kind==='shaco_clone');
  const received=s.a.damage(clone,10000,s.enemy,'physical','basic');
  assert.ok(received>0);
  const boxes=s.a.boardSummonsV453Dev69.filter(e=>e.kind==='shaco_minibox');
  assert.equal(boxes.length,3);
  assert.equal(clone.explodedV453M15,true);
  s.a.advanceBoardSummonsV453Dev69();
  assert.equal(s.a.boardSummonsV453Dev69.filter(e=>e.kind==='shaco_minibox').length,3);
  const checkpoint=Arena.fromSnapshotV40(map,mask,s.a.snapshotV40());
  assert.equal(checksumV40(checkpoint.snapshotV40()),checksumV40(s.a.snapshotV40()));
 });
}
console.log('DEV69 M15 CLONES '+count+'/'+count+' PASS');
