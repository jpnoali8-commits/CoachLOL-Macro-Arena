/**
 * Independent audit: targetable clone entities under a two-seat, five-unit-per-seat PvP game.
 * This test does NOT certify champion kits or alter engine.mjs.
 *
 * --probe (default) reports confirmed failures without hiding them.
 * --strict fails the process if a visible enemy clone cannot receive a legal hit.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../multiplayer/authoritative_actions_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const strict=process.argv.includes('--strict');
const evidence=[];
function fixture(attackerTeam='blue',source='Shaco'){
 const ownerTeam=attackerTeam==='blue'?'red':'blue';
 const draft={blue:{MID:attackerTeam==='blue'?'Teemo':source},
  red:{MID:attackerTeam==='red'?'Teemo':source}};
 const a=new Arena(map,mask,{seed:693169,mode:'pvp',draft});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false,combatUntil:0,deadUntil:0});
 const attacker=a.units.find(v=>v.id===attackerTeam+'_MID');
 const owner=a.units.find(v=>v.id===ownerTeam+'_MID');
 Object.assign(attacker,{champ:'Teemo',x:.5,y:.5,level:6,
  hp:1200,maxHp:1200,mana:1000,maxMana:1000,attackAt:0,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(owner,{champ:source,x:.515,y:.5,level:6,
  hp:1500,maxHp:1500,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 a.canSeePoint=()=>true;
 a.visible=()=>true;
 let cast;
 if(source==='Shaco')cast=a.queueKitSkillV42(ownerTeam,owner.id,'R',{x:.53,y:.5});
 else if(source==='Neeko')cast=a.queueKitSkillV42(ownerTeam,owner.id,'W',{x:.53,y:.5});
 else if(source==='MonkeyKing')cast=a.queueKitSkillV42(ownerTeam,owner.id,'W',{x:.53,y:.5});
 else throw Error('unknown source: '+source);
 assert.equal(cast.ok,true,'clone spawn '+source+': '+cast.reason);
 a.resolveBoardSkillsV453Dev69();
 const clone=a.boardSummonsV453Dev69.find(v=>v.ownerId===owner.id&&v.kind.endsWith('_clone'));
 assert.ok(clone,'the skill must create a real server-owned decoy entity');
 assert.equal(a.units.length,10,'clones never become an eleventh champion');
 a.gameTime=1.1;
 const view=a.perspective(attackerTeam);
 assert.ok(view.units.some(v=>v.id===clone.publicId),'visible clone needs opaque client alias');
 assert.ok(!view.units.some(v=>v.id===clone.id),'internal clone ID must remain private');
 assert.ok(!view.boardSummons.some(v=>v.id===clone.id),'clone should not duplicate in secondary roster');
 const seats=[
  {seatId:'B',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
  {seatId:'R',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}
 ];
 const gate=new AuthoritativeActionsV453Dev47(a,seats);
 return {a,attacker,owner,clone,gate,attackerTeam,ownerTeam,seat:attackerTeam==='blue'?'B':'R',view};
}
function record(name,run,{expectedFailure=false}={}){
 try{
  const detail=run();
  evidence.push({name,status:'PASS',...(detail||{})});
  console.log('AUDIT_PASS '+name);
 }catch(error){
  const failure={name,status:expectedFailure?'P1_REPRODUCED':'UNEXPECTED_FAILURE',
   reason:String(error?.message||error)};
  evidence.push(failure);
  console.log('AUDIT_'+failure.status+' '+name+' '+failure.reason);
  if(!expectedFailure)process.exitCode=1;
  if(strict)process.exitCode=1;
 }
}
function cloneHitByTargetedSkill(t,champ='Teemo'){
 t.attacker.champ=champ;
 const rule=champ==='Teemo'?'Q':'Q';
 const hp=t.clone.hp,mana=t.attacker.mana;
 const result=t.gate.submit(t.seat,{sequence:1,unitId:t.attacker.id,
  kind:'skill.targeted',payload:{slot:rule,targetId:t.clone.publicId}});
 assert.equal(result.ok,true,'visible targetable '+t.clone.kind+' declined: '+JSON.stringify(result));
 t.a.resolveBoardSkillsV453Dev69();
 assert.ok(t.clone.hp<hp,'cast accepted but clone took no damage');
 assert.ok(t.attacker.mana<mana,'legal cast must pay once');
 return {cloneHpBefore:hp,cloneHpAfter:t.clone.hp};
}
for(const team of ['blue','red']){
 record(team+' REAL Shaco alias accepts Teemo Q with a single debit',()=>{
  const t=fixture(team);
  const realAlias=t.view.units.find(v=>v.champ==='Shaco'&&v.id!==t.clone.publicId)?.id;
  assert.ok(realAlias,'enemy Shaco must be publicly targetable without revealing stable ID');
  const hp=t.owner.hp,mp=t.attacker.mana;
  const result=t.gate.submit(t.seat,{sequence:1,unitId:t.attacker.id,
   kind:'skill.targeted',payload:{slot:'Q',targetId:realAlias}});
  assert.equal(result.ok,true,result.reason);
  t.a.resolveBoardSkillsV453Dev69();
  assert.ok(t.owner.hp<hp,'Q must damage the actual visible champion');
  assert.ok(t.attacker.mana<mp,'mana is charged in authoritative execution');
  return {spentMana:mp-t.attacker.mana};
 });
 record(team+' TEEMO Q targeting a public Shaco clone',()=>{
  return cloneHitByTargetedSkill(fixture(team));
 },{expectedFailure:true});
 record(team+' ANNIE Q targeting a public Shaco clone',()=>{
  return cloneHitByTargetedSkill(fixture(team),'Annie');
 },{expectedFailure:true});
 record(team+' TEEMO Q targeting a public Neeko W clone',()=>{
  return cloneHitByTargetedSkill(fixture(team,'Neeko'));
 },{expectedFailure:true});
 record(team+' TEEMO Q targeting a public Wukong W clone',()=>{
  return cloneHitByTargetedSkill(fixture(team,'MonkeyKing'));
 },{expectedFailure:true});
 record(team+' ANNIE W cone should damage the visible clone',()=>{
  const t=fixture(team);t.attacker.champ='Annie';
  const hp=t.clone.hp;
  const result=t.a.queueKitSkillV42(team,t.attacker.id,'W',{x:.52,y:.5});
  assert.equal(result.ok,true,result.reason);
  t.a.resolveBoardSkillsV453Dev69();
  assert.ok(t.clone.hp<hp,'the cone hit passes through the decoy without damaging it');
 },{expectedFailure:true});
 record(team+' BASIC attack accepts clone public alias and damages server entity',()=>{
  const t=fixture(team);
  const hp=t.clone.hp;
  t.attacker.autoAttack=true;
  const result=t.gate.submit(t.seat,{sequence:1,unitId:t.attacker.id,
   kind:'order.attack',payload:{targetId:t.clone.publicId}});
  assert.equal(result.ok,true,result.reason);
  t.a.resolveCombat();
  assert.ok(t.clone.hp<hp,'AA should damage targetable clone, regardless of false ID');
  return {cloneHpBefore:hp,cloneHpAfter:t.clone.hp};
 });
 record(team+' stable clone ID is forbidden for enemy action',()=>{
  const t=fixture(team);
  const result=t.gate.submit(t.seat,{sequence:1,unitId:t.attacker.id,
   kind:'order.attack',payload:{targetId:t.clone.id}});
  assert.equal(result.ok,false);
  assert.equal(result.reason,'alvo_identidade_oculta');
 });
 record(team+' clone public alias is forbidden after expiry',()=>{
  const t=fixture(team);t.a.gameTime=t.clone.until+.01;
  const result=t.gate.submit(t.seat,{sequence:1,unitId:t.attacker.id,
   kind:'order.attack',payload:{targetId:t.clone.publicId}});
  assert.equal(result.ok,false);
 });
 record(team+' clone public alias is forbidden when outside fog',()=>{
  const t=fixture(team);t.a.canSeePoint=()=>false;
  const result=t.gate.submit(t.seat,{sequence:1,unitId:t.attacker.id,
   kind:'order.attack',payload:{targetId:t.clone.publicId}});
  assert.equal(result.ok,false);
 });
 record(team+' cannot order enemy team unit',()=>{
  const t=fixture(team);
  const result=t.gate.submit(t.seat,{sequence:1,unitId:t.owner.id,
   kind:'order.attack',payload:{targetId:t.attacker.id}});
  assert.equal(result.ok,false);
  assert.equal(result.reason,'unidade_nao_autorizada');
 });
 record(team+' server snapshot reconstructs summon ID/alias without roster inflation',()=>{
  const t=fixture(team),original=t.a.snapshotV40();
  const copy=Arena.fromSnapshotV40(map,mask,original);
  assert.equal(checksumV40(copy.snapshotV40()),checksumV40(original));
  assert.equal(copy.units.length,10);
  assert.ok(copy.boardSummonsV453Dev69.some(s=>s.publicId===t.clone.publicId));
 });
}
const severe=evidence.filter(x=>x.status==='UNEXPECTED_FAILURE');
const p1=evidence.filter(x=>x.status==='P1_REPRODUCED');
const summary={sha:'b7676d57160ddbc2315e258d03f3c94dd5a81189',
 mode:strict?'strict':'probe',cases:evidence.length,confirmedCodePathFailures:p1.length,
 unexpectedFailures:severe.length,passed:evidence.length-p1.length-severe.length};
console.log('AUDIT_SUMMARY '+JSON.stringify(summary));
if(strict&&p1.length)process.exitCode=1;
if(severe.length)process.exitCode=1;
