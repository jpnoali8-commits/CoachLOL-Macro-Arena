/** M44 B14D shared original code: Sylas R, Viego P/QWE+visual, native R. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453,m44B14CSylasUltimateRuleV453} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
let passed=0,snapshots=0;const failures=[];
const champions=['Bard','Malzahar','Volibear','Nocturne','Diana','Lissandra',
 'Ryze','Skarner','Ekko','Yorick','Viego','Anivia','Talon','Rengar','Kalista'];
const sources=['Hwei','Azir','Bard','Twitch','Teemo','Ekko','Zed',
 'Skarner','Yorick','Annie','Caitlyn','Nidalee'];
const sideOpp=team=>team==='blue'?'red':'blue';
function make(team,ours,theirs,oursTop='Annie',theirsTop='Garen'){
 const other=sideOpp(team);
 const a=new Arena(map,mask,{seed:144914,mode:'pvp',draft:{
  [team]:{MID:ours,TOP:oursTop},[other]:{MID:theirs,TOP:theirsTop}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,hp:10000,maxHp:10000,
  armor:0,mr:0,autoFollow:false,autoFarm:false,
  autoAttack:false,autoJungle:false});
 for(const x of a.minions)Object.assign(x,{x:.08,y:.08});
 const u=a.units.find(x=>x.id===team+'_MID'),
  enemy=a.units.find(x=>x.id===other+'_MID'),
  ally=a.units.find(x=>x.id===team+'_TOP'),
  enemyTop=a.units.find(x=>x.id===other+'_TOP');
 Object.assign(u,{x:.5,y:.5,mana:10000,maxMana:10000,level:16,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.528,y:.5,hp:10000});
 Object.assign(ally,{x:.51,y:.5});
 Object.assign(enemyTop,{x:.54,y:.5});
 a.gameTime=10;a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const snap=()=>{const st=a.snapshotV40();
  assert.equal(checksumV40(st),checksumV40(Arena.fromSnapshotV40(map,mask,st).snapshotV40()));
  snapshots++};
 const cast=(actor,team,slot,args)=>{
  const request=a.queueBoardSkillV453Dev69(team,actor.id,slot,args);
  assert.equal(request.ok,true,'queue '+JSON.stringify(request));
  let receipt;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(x,q)=>(receipt=old(x,q));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=old;}
  assert.equal(receipt?.ok,true,'cast '+JSON.stringify(receipt));
  return receipt;
 };
 return {a,team,other,u,enemy,ally,enemyTop,snap,cast};
}
function claim(f){
 const {a,u,enemy,team}=f;enemy.hp=100;enemy.maxHp=10000;
 a.damage(enemy,500,u,'true','spell');
 const soul=u.m44B14CSouls?.[0];assert.ok(soul,'earned from death');
 assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,true);
 a.resolveBoardSkillsV453Dev69();
 assert.equal(u.m44B14CPossession?.originalChamp,'Viego');
 assert.equal(u.champ,enemy.champ);
 assert.equal(u.m44B14DAppearanceV453?.effect,'viego_possession');
 return soul;
}
function scenario(team,name,label,fn){
 try{const f=fn();f.snap();passed++}
 catch(error){failures.push({team,name,label,error:String(error?.stack||error)})}
}
for(const team of ['blue','red']){
 for(const name of champions)scenario(team,name,'Sylas native R',()=>{
  const f=make(team,'Sylas',name),{a,u,enemy,cast}=f;
  const rule=m44B14CSylasUltimateRuleV453(name);
  assert.equal(rule,m44B14DOriginalBoardRuleV453(name,'R'));
  assert.equal(a.queueSylasHijackV453M14(team,u.id,enemy.id).ok,true);
  a.resolveSylasHijacksV453M14();
  assert.equal(u.sylasStolenV453M14?.sourceChamp,name);
  const args=['target_enemy','target_any'].includes(rule.shape)?
   {targetId:enemy.id}:rule.shape==='target_ally'?
   {targetId:u.id}:
   ['circle_enemy','line_enemy','cone_enemy','move_point'].includes(rule.shape)?
   {point:{x:enemy.x,y:enemy.y}}:{};
  const got=cast(u,team,'R',args);
  assert.equal(got.hijacked,true,'native executor reused same transaction');
  assert.equal(got.spentMana,0,'no second debit');
  assert.equal(u.champ,'Sylas','source identity restored');
  assert.equal(u.sylasStolenV453M14,null,'single use');
  assert.ok(a.units.some(x=>x.id===u.id&&x.team===team),'same PvP actor');
  return f;
 });
 for(const name of sources)scenario(team,name,'Viego real appearance, P+QWE registry and R',()=>{
  const f=make(team,'Viego',name),{a,u,enemy,enemyTop,cast,other}=f;
  const actorId=u.id,originalRank={...u.skillRanks};
  claim(f);assert.equal(u.champ,name);
  assert.equal(u.id,actorId);
  const enemyView=a.perspective(other).units.find(x=>x.id===actorId);
  assert.equal(enemyView?.champ,name,'adversary sees copied champion');
  assert.equal(enemyView?.visualEffect,'viego_possession');
  for(const slot of ['Q','W','E'])
   assert.equal(a.boardKitForV453Dev69(name,slot,u),
    m44B14DOriginalBoardRuleV453(name,slot,u));
  assert.equal(a.boardKitForV453Dev69(name,'R',u),
   m44B14DOriginalBoardRuleV453('Viego','R'),'R always Viego');
  if(name==='Twitch'||name==='Teemo'){
   a.damage(enemyTop,45,u,'physical','basic');
   if(name==='Twitch')assert.ok(enemyTop.m16TwitchPoison?.[u.id],
    'Twitch passive poison is original hit behavior');
   else assert.ok(enemyTop.statusEffectsV41?.some(e=>e.key==='teemo_e_'+u.id),
    'Teemo E passive original hit behavior');
  }
  const r=cast(u,team,'R',{point:{x:.55,y:.5}});
  assert.equal(r.heartbreaker,true);
  assert.equal(u.champ,'Viego','R removes possession');
  assert.equal(u.m44B14CPossession,null);
  assert.equal(u.skillRanks.Q,originalRank.Q);
  return f;
 });
 for(const name of ['Hwei','Azir','Bard'])scenario(team,name,'native borrowed Q/W cast',()=>{
  const f=make(team,'Viego',name),{a,u,ally,cast}=f;claim(f);
  let r;
  if(name==='Hwei'){
   r=cast(u,team,'Q',{point:{x:.55,y:.5},m44B14Variant:'QQ'});
   assert.equal(r.devastatingFireball,true);
  }else if(name==='Azir'){
   r=cast(u,team,'W',{point:{x:.55,y:.5}});
   assert.equal(r.arise,true);
   assert.ok(a.boardSummonsV453Dev69.some(v=>
    v.kind==='azir_soldier'&&v.ownerId===u.id));
  }else{
   r=cast(u,team,'W',{targetId:ally.id});
   assert.equal(r.caretakersShrine,true);
  }
  assert.equal(u.champ,name);
  assert.equal(u.m44B14CPossession?.originalChamp,'Viego');
  return f;
 });
 for(const type of ['expired','forged','fog','double','death','unimplemented','cooldown'])scenario(team,'Hwei',type,()=>{
  const f=make(team,'Viego','Hwei'),{a,u,enemy,enemyTop}=f;
  enemy.hp=100;a.damage(enemy,500,u,'true','spell');
  const soul=u.m44B14CSouls?.[0];assert.ok(soul);
  if(type==='expired'){
   a.gameTime=soul.until+1;
   assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,false);
  }else if(type==='forged'){
   assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,'forged').ok,false);
  }else if(type==='fog'){
   assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,true);
   a.canSeePoint=()=>false;a.resolveBoardSkillsV453Dev69();
   assert.equal(u.m44B14CPossession,undefined);
  }else{
   assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,true);
   a.resolveBoardSkillsV453Dev69();
   if(type==='double')assert.equal(
    a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,false);
   if(type==='death'){
    a.damage(u,20000,enemyTop,'true','spell');
    assert.equal(u.champ,'Viego');
    assert.equal(u.m44B14CPossession,null);
   }
   if(type==='unimplemented'){
    const mana=u.mana;
    assert.equal(a.queueBoardSkillV453Dev69(team,u.id,'E',{}).ok,false);
    assert.equal(u.mana,mana);
   }
   if(type==='cooldown'){
    a.gameTime+=9;a.advanceBoardPassivesV453Dev69();
    assert.equal(u.champ,'Viego');
   }
  }
  return f;
 });
 scenario(team,'Viego','Sylas steals real Viego R, not borrowed form',()=>{
  const f=make(team,'Sylas','Viego','Hwei'),{a,u,enemy,ally}=f;
  ally.hp=100;a.damage(ally,500,enemy,'true','spell');
  const soul=enemy.m44B14CSouls?.[0];assert.ok(soul);
  assert.equal(a.queueViegoPossessV453M44B14C(f.other,enemy.id,soul.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(enemy.champ,'Hwei');
  const hijack=a.queueSylasHijackV453M14(team,u.id,enemy.id);
  assert.equal(hijack.sourceChamp,'Viego');
  a.resolveSylasHijacksV453M14();
  assert.equal(u.sylasStolenV453M14?.sourceChamp,'Viego');
  return f;
 });
}
for(const team of ['blue','red'])scenario(team,'Viego',
 'Sylas original Viego R never grants donor Viego passive',()=>{
  const f=make(team,'Sylas','Viego'),{a,u,enemy,enemyTop,cast}=f;
  enemyTop.x=.53;enemyTop.hp=100;enemyTop.maxHp=10000;
  assert.equal(a.queueSylasHijackV453M14(team,u.id,enemy.id).ok,true);
  a.resolveSylasHijacksV453M14();
  assert.equal(u.sylasStolenV453M14?.sourceChamp,'Viego');
  const r=cast(u,team,'R',{point:{x:enemyTop.x,y:enemyTop.y}});
  assert.equal(r.heartbreaker,true);
  assert.equal(enemyTop.hp,0,'R kills under Sylas actor credit');
  assert.equal(u.champ,'Sylas');
  assert.equal(u.m44B14DBorrowedBaseChamp,undefined);
  assert.equal((u.m44B14CSouls||[]).length,0,
   'Viego P souls do not leak to the Sylas who stole only R');
  assert.ok(u.kills>=1,'kills attributed to real Sylas owner');
  return f;
 });
for(const failure of failures)console.error('M44_B14D_COPY_FAIL',JSON.stringify(failure));
console.log('M44_B14D_COPY '+JSON.stringify({passed,snapshots,
 failures:failures.length,sylasOriginalUltimates:champions.length,
 viegoSourceChampions:sources.length,
 completePqwerKitsCertified:0}));
assert.equal(failures.length,0);assert.equal(passed,78);
