/**
 * Systemic board matrix: M9 authored damage shapes × Shaco decoy × two PvP seats.
 * This does not certify every champion kit; it validates the reusable entity
 * resolver rather than creating bespoke champion-specific fixes.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_KITS_V453_DEV69,checksumV40} from '../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../multiplayer/authoritative_actions_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const seats=[
 {seatId:'B',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
 {seatId:'R',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}
];
const slots=['Q','W','E','R'];
const matrix=[];
for(const [champ,kit] of Object.entries(BOARD_KITS_V453_DEV69))
 for(const slot of slots){
  const s=kit[slot];
  if(!['target_enemy','circle_enemy','cone_enemy','line_enemy'].includes(s.shape))continue;
  if(!s.damage?.some(x=>x>0)||s.boardTemporal)continue;
  matrix.push({champ,slot,shape:s.shape,originSelf:!!s.originSelf});
 }
assert.ok(matrix.length>=40,'The data-driven matrix must cover multiple families');
let count=0;
const reasons={};const failures=[];
function fixture(team,champ){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:69918,mode:'pvp',draft:{[team]:{MID:champ},[other]:{MID:'Shaco'}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID');
 const owner=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,x:.5,y:.5,level:16,hp:2000,maxHp:2000,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(owner,{champ:'Shaco',x:.522,y:.5,level:6,hp:2000,maxHp:2000,
  mana:1000,maxMana:1000,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 a.canSeePoint=()=>true;a.visible=()=>true;
 const summoned=a.queueKitSkillV42(other,owner.id,'R',{x:.54,y:.5});
 assert.equal(summoned.ok,true,summoned.reason);a.resolveBoardSkillsV453Dev69();
 a.gameTime=1.1;
 const clone=a.boardSummonsV453Dev69.find(v=>v.ownerId===owner.id&&v.kind==='shaco_clone');
 assert.ok(clone);assert.ok(a.perspective(team).units.find(v=>v.id===clone.publicId));
 return {a,u,owner,clone,seat:team==='blue'?'B':'R',team,other};
}
for(const team of ['blue','red'])for(const item of matrix){
 try{
  const {a,u,clone}=fixture(team,item.champ);
  const hp=clone.hp,mana=u.mana;
  const options=item.shape==='target_enemy'?{targetId:clone.id}:
   item.shape==='circle_enemy'&&!item.originSelf?{point:{x:clone.x+.0002,y:clone.y}}:
   item.shape==='line_enemy'||item.shape==='cone_enemy'?
    {point:{x:.56,y:.5}}:{};
  const q=a.queueBoardSkillV453Dev69(team,u.id,item.slot,options);
  assert.equal(q.ok,true,'queue: '+q.reason);
  assert.equal(u.mana,mana,'queue does not debit before resolution');
  a.resolveBoardSkillsV453Dev69();
  assert.ok(clone.hp<hp,'visible clone was ignored by '+item.champ+item.slot+' '+item.shape);
  assert.ok(u.mana<mana||(u.skillCds[item.slot]||0)>a.gameTime,'accepted skill did not commit cooldown or mana');
  const now=clone.hp; a.resolveBoardSkillsV453Dev69();
  assert.equal(clone.hp,now,'duplicate board resolution damaged clone again');
  const snapshot=a.snapshotV40();
  assert.equal(checksumV40(snapshot),checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  count++;
  reasons[item.shape]=(reasons[item.shape]||0)+1;
 }catch(e){
  failures.push({team,...item,error:String(e?.message||e)});
 }
}
const auth=[];
for(const team of ['blue','red']){
 const {a,u,clone,seat}=fixture(team,'Annie');
 const gate=new AuthoritativeActionsV453Dev47(a,seats);
 const payload={slot:'Q',targetId:clone.publicId};
 const request={sequence:1,kind:'skill.targeted',unitId:u.id,payload};
 const ok=gate.submit(seat,request);
 assert.equal(ok.ok,true,ok.reason);
 const repeat=gate.submit(seat,request);
 assert.deepEqual(repeat,ok,'idempotent same sequence and identical payload');
 const wrong=gate.submit(seat,{...request,payload:{...payload,slot:'W'}});
 assert.equal(wrong.ok,false);
 assert.equal(wrong.reason,'sequencia_reutilizada_com_dados_diferentes');
 const hp=clone.hp,mana=u.mana;
 a.resolveBoardSkillsV453Dev69();
 assert.ok(clone.hp<hp);
 assert.ok(u.mana<mana);
 const post=clone.hp;a.resolveBoardSkillsV453Dev69();
 assert.equal(clone.hp,post);
 const checkpoint=a.snapshotV40();
 assert.equal(checksumV40(checkpoint),checksumV40(Arena.fromSnapshotV40(map,mask,checkpoint).snapshotV40()));
 auth.push({team,ackId:ok.sequence,replayAck:repeat.sequence,damage:hp-clone.hp});
}
console.log('AUDIT_ENTITY_SHAPES '+JSON.stringify({count,total:matrix.length*2,perShape:reasons,failures:failures.length}));
console.log('AUDIT_ENTITY_RECEIPTS '+JSON.stringify(auth));
for(const f of failures.slice(0,40))console.error('AUDIT_ENTITY_FAILURE '+JSON.stringify(f));
assert.equal(failures.length,0,'Damage-capable authored spells must hit visible damageable clones');
