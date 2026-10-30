/** M14 Sylas Hijack: shared board-ultimate theft; no fake fallback.
 * Verified behavior is a subset, NOT all 173 champion R abilities.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
const file=x=>JSON.parse(readFileSync(new URL('../data/'+x,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let count=0;function check(n,fn){fn();count++;console.log('✓ M14 SYLAS '+n)}
function fixture(team,sourceChamp='Soraka'){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6917,mode:'pvp',draft:{[team]:{MID:'Sylas'},[other]:{MID:sourceChamp}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ:'Sylas',x:.5,y:.5,hp:1400,maxHp:1400,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{champ:sourceChamp,x:.525,y:.5,hp:1500,maxHp:1500});
 Object.assign(ally,{x:.515,y:.5,hp:200,maxHp:1000});
 a.visible=()=>true;return {a,u,enemy,ally,team,other};
}
for(const team of ['blue','red']){
 const t=fixture(team);
 check(team+' Sylas steals Soraka R only after server resolution, spending 75 mana once',()=>{
  assert.equal(t.a.queueSylasHijackV453M14(team,t.u.id,t.enemy.id).ok,true);
  assert.equal(t.u.mana,1000);assert.equal(t.u.sylasStolenV453M14,undefined);
  t.a.resolveCombat();
  assert.equal(t.u.mana,925);
  assert.equal(t.u.sylasStolenV453M14.sourceChamp,'Soraka');
  assert.ok(t.u.skillCds.R>0);
  const snapshot=Arena.fromSnapshotV40(map,mask,t.a.snapshotV40());
  assert.equal(checksumV40(t.a.snapshotV40()),checksumV40(snapshot.snapshotV40()));
 });
 check(team+' stolen Soraka Wish heals owned team and does not spend second R',()=>{
  t.a.gameTime=1;const mana=t.u.mana,cd=t.u.skillCds.R;
  assert.equal(t.a.queueKitSkillV42(team,t.u.id,'R',null).ok,true);
  t.a.resolveBoardSkillsV453Dev69();
  assert.ok(t.ally.hp>200);
  assert.equal(t.u.mana,mana);assert.equal(t.u.skillCds.R,cd);
  assert.equal(t.u.sylasStolenV453M14,null);
 });
 check(team+' duplicate R cast is rejected, no duplicate team heal',()=>{
  const hp=t.ally.hp;
  assert.equal(t.a.queueKitSkillV42(team,t.u.id,'R',null).ok,false);
  t.a.resolveBoardSkillsV453Dev69();
  assert.equal(t.ally.hp,hp);
 });
 const g=fixture(team,'Garen');
 check(team+' Sylas steals Garen execute and uses same single-target board effect',()=>{
  assert.equal(g.a.queueSylasHijackV453M14(team,g.u.id,g.enemy.id).ok,true);
  g.a.resolveSylasHijacksV453M14();g.a.gameTime=1;
  const before=g.enemy.hp;
  assert.equal(g.a.queueTargetedSkill(team,g.u.id,'R',g.enemy.id).ok,true);
  g.a.resolveBoardSkillsV453Dev69();
  assert.ok(g.enemy.hp<before);
  assert.equal(g.u.sylasStolenV453M14,null);
 });
 const unsupported=fixture(team,'Jinx');
 check(team+' unsupported unique Jinx R refuses Hijack instead of inventing damage',()=>{
  const r=unsupported.a.queueSylasHijackV453M14(team,unsupported.u.id,unsupported.enemy.id);
  assert.equal(r.ok,false);assert.equal(r.reason,'ultimate_sem_adaptador_hijack');
  assert.equal(unsupported.u.mana,1000);
 });
 check(team+' stolen ultimate cannot be obtained from hidden target',()=>{
  const v=fixture(team,'Annie');
  v.a.visible=()=>false;
  assert.equal(v.a.queueSylasHijackV453M14(team,v.u.id,v.enemy.id).ok,false);
 });
 check(team+' opponent seat cannot issue Sylas theft for enemy unit',()=>{
  const v=fixture(team,'Soraka');
  const seats=[{seatId:'pBlue',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
   {seatId:'pRed',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}];
  const gateway=new AuthoritativeActionsV453Dev47(v.a,seats);
  const opp=team==='blue'?'pRed':'pBlue';
  const reject=gateway.submit(opp,{sequence:1,unitId:v.u.id,kind:'skill.hijack',payload:{targetId:v.enemy.id}});
  assert.equal(reject.ok,false);
  const own=gateway.submit(team==='blue'?'pBlue':'pRed',{
   sequence:1,unitId:v.u.id,kind:'skill.hijack',payload:{targetId:v.enemy.id}});
  assert.equal(own.ok,true,own.reason);
 });
 const expired=fixture(team,'Garen');
 check(team+' expired stolen contract permits a fresh steal (subject to cooldown)',()=>{
  expired.u.sylasStolenV453M14={sourceChamp:'Garen',expiresAt:0};
  assert.equal(expired.a.queueSylasHijackV453M14(team,expired.u.id,expired.enemy.id).ok,true);
 });
}
console.log('DEV69 SYLAS M14 '+count+'/'+count+' PASS');
