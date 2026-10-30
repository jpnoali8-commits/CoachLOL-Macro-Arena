/** M16 cross-champion stealth/traps/four-shot QA. All kits remain partial. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M16_MECHANIC_KITS,BOARD_KITS_V453_DEV69} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let count=0;function ok(name,fn){fn();count++;console.log('✓ M16 '+name);}
function fixture(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6916,mode:'pvp',draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false,combatUntil:0,deadUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID'),foe=a.units.find(v=>v.id===other+'_MID');
 Object.assign(u,{champ,level:6,x:.5,y:.5,hp:1400,maxHp:1400,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(foe,{x:.517,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 a.canSeePoint=()=>true;
 return {a,u,foe,team,other};
}
ok('19 active ability families plus LeBlanc passive; legacy remains 30',()=>{
 assert.equal(Object.keys(M16_MECHANIC_KITS).length,19);
 assert.equal(Object.keys(BOARD_KITS_V453_DEV69).length,30);
 const slots=Object.values(M16_MECHANIC_KITS).reduce((n,x)=>n+Object.keys(x).length,0);
 assert.equal(slots,22,'22 authored M16 slots across 19 active families');
 for(const kits of Object.values(M16_MECHANIC_KITS))for(const s of Object.values(kits))
  assert.equal(s.kind,'board_effect');
});
for(const team of ['blue','red']){
 for(const [champ,slot,type] of [
  ['Twitch','Q','camouflage'],['Rengar','R','camouflage'],
  ['Akshan','W','camouflage'],['Pyke','W','camouflage'],['Viego','E','camouflage'],
  ['Shaco','Q','invisibility'],['Khazix','R','invisibility'],
  ['Akali','W','invisibility'],['Senna','E','camouflage'],
  ['Talon','R','invisibility'],['MonkeyKing','W','invisibility']]){
  const t=fixture(champ,team);
  ok(team+' '+champ+' '+slot+' '+type+' obeys authoritative casting and private snapshot',()=>{
   const rule=M16_MECHANIC_KITS[champ][slot];
   const point=rule.shape==='move_point'?{x:.52,y:.5}:null;
   const q=t.a.queueKitSkillV42(team,t.u.id,slot,point);
   assert.equal(q.ok,true,q.reason);assert.equal(t.u.mana,1000);
   t.a.resolveBoardSkillsV453Dev69();
   assert.ok(t.u.mana<1000||rule.mana[0]===0);
   assert.equal(t.u.m16StealthV453.type,type);
   const at=t.u.m16StealthV453.startsAt+.1;
   t.a.gameTime=at;
   t.foe.x=.7;
   assert.equal(t.a.visible(t.other,t.u),false,
    'enemy outside detection radius cannot see stealthed hero');
   const cp=Arena.fromSnapshotV40(map,mask,t.a.snapshotV40());
   assert.equal(checksumV40(cp.snapshotV40()),checksumV40(t.a.snapshotV40()));
   assert.ok(!t.a.perspective(t.other).units.some(v=>v.id===t.u.id));
  });
  if(type==='camouflage'){
   ok(team+' '+champ+' detection radius only affects camouflage',()=>{
    const r=M16_MECHANIC_KITS[champ][slot];
    t.a.gameTime=t.u.m16StealthV453.startsAt+.2;
    t.foe.x=t.u.x+.5*(r.m16Radius||450)/15000;
    assert.equal(t.a.visible(t.other,t.u),true);
   });
  }
 }
 const eve=fixture('Evelynn',team);
 ok(team+' Evelynn has no level-5 camouflage but enters Demon Shade at level 6',()=>{
  eve.u.level=5;eve.a.gameTime=10;eve.a.advanceMechanicsV453M16();
  assert.equal(eve.u.m16StealthV453,undefined);
  eve.u.level=6;eve.a.gameTime=11;eve.a.advanceMechanicsV453M16();
  assert.equal(eve.u.m16StealthV453.type,'camouflage');
  assert.equal(eve.u.m16StealthV453.radius,700);
 });
 const teemo=fixture('Teemo',team);
 ok(team+' Teemo passive stealth after idle and does not require casting Q',()=>{
  teemo.a.gameTime=0;teemo.a.advanceMechanicsV453M16();
  teemo.a.gameTime=2;teemo.a.advanceMechanicsV453M16();
  assert.equal(teemo.u.m16StealthV453.type,'invisibility');
  teemo.foe.x=.504;assert.equal(teemo.a.visible(teemo.other,teemo.u),false);
  teemo.a.m16BreakStealth(teemo.u,'basic');
  assert.ok(!teemo.u.m16StealthV453);
  teemo.a.gameTime=2.1;teemo.a.advanceMechanicsV453M16();
  assert.equal(teemo.u.m16StealthV453,null);
 });
 const kha=fixture('Khazix',team);
 ok(team+' Khazix R recasts without mana or R cooldown twice only if evolved',()=>{
  assert.equal(kha.a.queueKitSkillV42(team,kha.u.id,'R',null).ok,true);
  kha.a.resolveBoardSkillsV453Dev69();
  const mana=kha.u.mana,cd=kha.u.skillCds.R;
  kha.a.gameTime=2;
  assert.equal(kha.a.queueKitSkillV42(team,kha.u.id,'R',null).ok,true);
  kha.a.resolveBoardSkillsV453Dev69();
  assert.equal(kha.u.mana,mana);assert.equal(kha.u.skillCds.R,cd);
  assert.equal(kha.u.m16KhazixR.remaining,0);
  kha.a.gameTime=3;assert.equal(kha.a.queueKitSkillV42(team,kha.u.id,'R',null).ok,false);
 });
 const j=fixture('Jhin',team);
 ok(team+' Jhin fourth basic attack applies special damage then reloads',()=>{
  const raw=j.a.basicAttackPowerV452c(j.u,j.foe,'auto',{commit:false});
  for(let i=0;i<3;i++){j.a.gameTime=i;j.a.basicAttackPowerV452c(j.u,j.foe,'auto',{commit:true});}
  assert.equal(j.u.m16JhinAmmo,1);
  j.a.gameTime=3;
  const fourth=j.a.basicAttackPowerV452c(j.u,j.foe,'auto',{commit:true});
  assert.ok(fourth>raw*1.4);
  assert.equal(j.u.m16JhinAmmo,0);
  assert.ok(j.u.m16JhinReloadUntil>j.a.gameTime);
  j.a.gameTime=6;j.a.advanceMechanicsV453M16();
  assert.equal(j.u.m16JhinAmmo,4);
 });
 ok(team+' Jhin R fires precisely 4 charged shots without spending mana again',()=>{
  assert.equal(j.a.queueKitSkillV42(team,j.u.id,'R',null).ok,true);
  j.a.resolveBoardSkillsV453Dev69();
  const mana=j.u.mana,cd=j.u.skillCds.R;
  for(let n=1;n<=4;n++){
   j.a.gameTime=6+n;
   const shot=j.a.queueKitSkillV42(team,j.u.id,'R',{x:.53,y:.5});
   assert.equal(shot.ok,true,shot.reason);
   j.a.resolveBoardSkillsV453Dev69();
   assert.equal(j.u.mana,mana);assert.equal(j.u.skillCds.R,cd);
   assert.equal(j.u.m16JhinChannel?.remaining??0,4-n);
  }
  assert.equal(j.a.queueKitSkillV42(team,j.u.id,'R',{x:.53,y:.5}).ok,false);
 });
 const c=fixture('Caitlyn',team);
 ok(team+' Caitlyn sixth basic attack activates Headshot',()=>{
  const first=c.a.basicAttackPowerV452c(c.u,c.foe,'auto',{commit:false});
  for(let i=0;i<5;i++)c.a.basicAttackPowerV452c(c.u,c.foe,'auto',{commit:true});
  assert.equal(c.u.m16CaitHeadshotCount,5);
  assert.ok(c.a.basicAttackPowerV452c(c.u,c.foe,'auto',{commit:true})>first);
  assert.equal(c.u.m16CaitHeadshotCount,0);
 });
 for(const [champ,slot,kind] of [
  ['Caitlyn','W','caitlyn_snap'],['Nidalee','W','nidalee_bushwhack'],
  ['Teemo','R','teemo_mushroom'],['Shaco','W','shaco_box'],
  ['Jhin','E','jhin_lotus'],['Maokai','E','maokai_sapling'],
  ['Zoe','E','zoe_bubble']]){
  const t=fixture(champ,team);
  ok(team+' '+champ+' '+slot+' arms typed '+kind+' without free fog vision',()=>{
   const point={x:t.foe.x,y:t.foe.y};
   const q=t.a.queueKitSkillV42(team,t.u.id,slot,point);
   assert.equal(q.ok,true,q.reason);
   const before=t.u.mana;t.a.resolveBoardSkillsV453Dev69();
   assert.ok(t.u.mana<before||M16_MECHANIC_KITS[champ][slot].mana[0]===0);
   const trap=t.a.m16Traps.find(x=>x.kind===kind);
   assert.ok(trap);assert.equal(trap.ownerId,t.u.id);
   assert.equal(t.a.units.length,10);
   const cp=Arena.fromSnapshotV40(map,mask,t.a.snapshotV40());
   assert.equal(checksumV40(cp.snapshotV40()),checksumV40(t.a.snapshotV40()));
   t.a.gameTime=1;t.a.advanceMechanicsV453M16();
   if(kind==='caitlyn_snap'){
    assert.ok(t.a.effectResolverV41().has(t.foe,'root'));
    assert.ok(t.foe.m16CaitHeadshot);
   }else if(kind==='nidalee_bushwhack'){
    assert.ok(t.foe.m16HuntedUntil>1);
   }else if(kind==='teemo_mushroom'){
    assert.ok(t.a.effectResolverV41().has(t.foe,'slow'));
   }else if(kind==='shaco_box'){
    assert.equal(t.a.boardSummonsV453Dev69.filter(x=>x.kind==='shaco_minibox').length,0);
    t.a.gameTime=2;t.a.advanceMechanicsV453M16();
    assert.ok(t.a.effectResolverV41().has(t.foe,'fear'));
   }else if(kind==='jhin_lotus'){
    assert.ok(t.a.m16Traps.some(x=>x.kind==='jhin_lotus'&&x.explodeAt>1));
   }else if(kind==='zoe_bubble'){
    assert.ok(t.a.effectResolverV41().has(t.foe,'sleep'));
   }else if(kind==='maokai_sapling'){
    assert.ok(t.a.effectResolverV41().has(t.foe,'slow'));
   }
  });
 }
 const t=fixture('Twitch',team);
 ok(team+' Twitch camo does not reveal under ordinary wards and breaks on real basic',()=>{
  t.foe.x=.7;
  assert.equal(t.a.queueKitSkillV42(team,t.u.id,'Q',null).ok,true);
  t.a.resolveBoardSkillsV453Dev69();t.a.gameTime=2;
  assert.equal(t.a.visible(t.other,t.u),false);
  const b=t.a.performActionV40({actorId:t.u.id,kind:'basic_attack',
   source:'m16_test',checkRange:false,cooldownOverride:1});
  assert.equal(b.ok,true,b.reason);assert.equal(t.u.m16StealthV453,null);
 });
 const own=fixture('Caitlyn',team);
 ok(team+' trap owner identity and enemy alias cannot bypass PvP team seat',()=>{
  const seats=[
   {seatId:'SB',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
   {seatId:'SR',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}];
  const gate=new AuthoritativeActionsV453Dev47(own.a,seats);
  const otherSeat=own.other==='blue'?'SB':'SR';
  const result=gate.submit(otherSeat,{sequence:1,kind:'skill.ground',unitId:own.u.id,
   payload:{slot:'W',point:{x:.52,y:.5}}});
  assert.equal(result.ok,false);
 });
}
for(const team of ['blue','red']){
 const kai=fixture('Kaisa',team);
 ok(team+' Kaisa E grants speed but no invis without evolution',()=>{
  const q=kai.a.queueKitSkillV42(team,kai.u.id,'E',null);
  assert.equal(q.ok,true,q.reason);kai.a.resolveBoardSkillsV453Dev69();
  assert.equal(kai.u.m16StealthV453,undefined);
  assert.ok(kai.u.boardSpeedV453Dev69.until>0);
 });
 const evo=fixture('Kaisa',team);evo.u.m16KaisaEvolvedE=true;
 ok(team+' Kaisa evolved E grants 0.5s invisibility and deterministic snapshot',()=>{
  assert.equal(evo.a.queueKitSkillV42(team,evo.u.id,'E',null).ok,true);
  evo.a.resolveBoardSkillsV453Dev69();
  assert.equal(evo.u.m16StealthV453.type,'invisibility');
  assert.equal(evo.u.m16StealthV453.until,.5);
  const cp=Arena.fromSnapshotV40(map,mask,evo.a.snapshotV40());
  assert.equal(checksumV40(cp.snapshotV40()),checksumV40(evo.a.snapshotV40()));
 });
 const le=fixture('Leblanc',team);le.u.hp=800;le.u.maxHp=1500;
 ok(team+' Leblanc Mirror Image creates harmless clone at 40% HP only once',()=>{
  le.a.damage(le.u,250,le.foe,'true','basic');
  const clone=le.a.boardSummonsV453Dev69.find(x=>x.kind==='leblanc_clone');
  assert.ok(clone);
  assert.equal(clone.until,8);assert.equal(clone.nonCombat,true);
  assert.equal(le.a.units.length,10);assert.equal(le.u.m16StealthV453.type,'invisibility');
  const hp=le.u.hp;
  le.a.damage(le.u,100,le.foe,'true','basic');
  assert.equal(le.a.boardSummonsV453Dev69.filter(x=>x.kind==='leblanc_clone').length,1);
  assert.ok(le.u.hp<hp);
 });
 const senna=fixture('Senna',team);
 ok(team+' Senna mist grants camo only to friendly units in range',()=>{
  const ally=senna.a.units.find(x=>x.team===team&&x.id!==senna.u.id);
  Object.assign(ally,{x:.51,y:.5});
  assert.equal(senna.a.queueKitSkillV42(team,senna.u.id,'E',null).ok,true);
  senna.a.resolveBoardSkillsV453Dev69();
  assert.equal(ally.m16StealthV453?.type,'camouflage');
  const distant=senna.a.units.find(x=>x.team===team&&x.id!==ally.id&&x.id!==senna.u.id);
  assert.equal(distant.m16StealthV453,undefined);
 });
}
console.log('DEV69 M16 '+count+'/'+count+' PASS');
