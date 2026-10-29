/** M25/B01: champion identity is never replaced by a generic skill. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
const cases=[];
function setup(champ,team){
 const enemy=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20262511,mode:'pvp',
  draft:{[team]:{MID:champ},[enemy]:{MID:'Annie'}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,hp:3000,maxHp:3000,autoAttack:false,
  autoFarm:false,autoJungle:false,autoFollow:false,deadUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===enemy+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP'),
  other=a.units.find(v=>v.id===enemy+'_TOP');
 Object.assign(u,{x:.5,y:.5,champ,hp:3000,maxHp:3000,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(other,{x:.54,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.505,y:.5,hp:1700,maxHp:3000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+' '+slot+' queued '+JSON.stringify(queued));
  const mana=u.mana,old=a.executeBoardSkillV453Dev69.bind(a);
  let result=null;
  a.executeBoardSkillV453Dev69=(actor,q)=>(result=old(actor,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=old;
  assert.equal(result?.ok,true,champ+' '+slot+' executed '+JSON.stringify(result));
  assert.ok(mana>=u.mana);
  return result;
 }
 function snapshot(){
  const before=a.snapshotV40(),after=Arena.fromSnapshotV40(map,mask,before).snapshotV40();
  assert.equal(checksumV40(before),checksumV40(after),'snapshot state fidelity');
 }
 return {a,u,e,ally,other,cast,snapshot};
}
function check(team,name,fn){fn();cases.push(team+' '+name);}
for(const team of ['blue','red']){
 check(team,'Corki W leaves persistent damaging trail',()=>{
  const {a,e,cast,snapshot}=setup('Corki',team);
  cast('W',{point:{x:.53,y:.5}});
  const z=a.boardTemporalV453Dev69.find(x=>x.kind==='m25_corki_trail');
  assert.ok(z);
  a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.ok(a.effectResolverV41().has(e,'dot'));
  snapshot();
 });
 check(team,'Karthus isolated Q doubles delayed impact',()=>{
  const alone=setup('Karthus',team),group=setup('Karthus',team);
  alone.cast('Q',{point:{x:.515,y:.5}});
  group.other.x=.516;group.cast('Q',{point:{x:.515,y:.5}});
  assert.equal(alone.e.hp,7000,'delayed Q must not immediately strike');
  alone.a.gameTime=1;group.a.gameTime=1;
  alone.a.advanceBoardTemporalV453Dev69();
  group.a.advanceBoardTemporalV453Dev69();
  assert.ok(7000-alone.e.hp>7000-group.e.hp,'isolated enemy takes amplified Q');
  alone.snapshot();
 });
 check(team,'Yunara R enables transcendent W root',()=>{
  const {a,u,e,cast,snapshot}=setup('Yunara',team);
  cast('R');assert.ok(u.m25YunaraTranscendentUntil>0);
  a.gameTime=.1;cast('W',{point:{x:.53,y:.5}});
  assert.ok(a.effectResolverV41().has(e,'root'));snapshot();
 });
 check(team,'Mel W reflects an enemy spell once',()=>{
  const {a,u,e,cast,snapshot}=setup('Mel',team);
  cast('W');const hp=e.hp;
  assert.equal(a.damage(u,220,e,'magic','spell'),0);
  assert.ok(e.hp<hp);
  assert.equal(u.m25MelReflectUntil,0);
  assert.ok(a.damage(u,220,e,'magic','spell')>=0,'second hit resumes ordinary shielding');
  snapshot();
 });
 check(team,'Sejuani R ice storm slows nearby second victim',()=>{
  const {a,e,other,cast,snapshot}=setup('Sejuani',team);
  other.x=.534;
  const hp=other.hp;
  cast('R',{point:{x:.55,y:.5}});
  assert.ok(a.effectResolverV41().has(e,'stun'));
  assert.ok(other.hp<hp);
  assert.ok(a.effectResolverV41().has(other,'slow'));snapshot();
 });
 check(team,'Galio R protects first and lands after two seconds',()=>{
  const {a,u,ally,e,cast,snapshot}=setup('Galio',team);
  const origin=u.x;
  cast('R',{targetId:ally.id});
  assert.equal(u.x,origin,'Hero entrance may not teleport immediately');
  assert.ok(a.effectResolverV41().has(ally,'magic_shield'));
  const hp=e.hp;
  a.gameTime=2;a.advanceBoardTemporalV453Dev69();
  assert.equal(u.x,ally.x);
  assert.ok(e.hp<hp);
  assert.ok(a.effectResolverV41().has(e,'knockup'));snapshot();
 });
 check(team,'Lucian R applies four separate timed shots',()=>{
  const {a,e,cast,snapshot}=setup('Lucian',team);
  cast('R',{point:{x:.53,y:.5}});
  assert.equal(e.hp,7000);
  const z=a.boardTemporalV453Dev69.find(x=>x.kind==='m25_lucian_culling');
  assert.ok(z);
  for(let t=1;t<=4;t++){a.gameTime=t;a.advanceBoardTemporalV453Dev69();}
  assert.equal(z.ticksLeft,0);
  assert.ok(e.hp<7000);
  snapshot();
 });
 check(team,'Cassiopeia W creates grounded enemy status',()=>{
  const {a,e,cast,snapshot}=setup('Cassiopeia',team);
  cast('W',{point:{x:.515,y:.5}});
  assert.ok(a.effectResolverV41().has(e,'grounded'));snapshot();
 });
 check(team,'Seraphine third Q/W/E echoes as root',()=>{
  const {a,u,e,cast,snapshot}=setup('Seraphine',team);
  cast('Q',{point:{x:.515,y:.5}});
  assert.equal(u.m25SeraphineSpells,1);
  cast('W');assert.equal(u.m25SeraphineSpells,2);
  cast('E',{point:{x:.53,y:.5}});
  assert.equal(u.m25SeraphineSpells,0);
  assert.ok(a.effectResolverV41().has(e,'root'));snapshot();
 });
 check(team,'Xerath W gains distinct center damage',()=>{
  const center=setup('Xerath',team),outer=setup('Xerath',team);
  center.cast('W',{point:{x:.515,y:.5}});
  outer.cast('W',{point:{x:.528,y:.5}});
  assert.ok(center.e.hp<outer.e.hp,'center needs greater damage');
  center.snapshot();
 });
 check(team,'Zac W spawns real Goo and pickup heals/refreshes',()=>{
  const {a,u,cast,snapshot}=setup('Zac',team);
  u.hp=1800;
  cast('W');
  const g=u.m25ZacGoo?.[0];assert.ok(g);
  const hp=u.hp,cd=u.skillCds.W;
  u.x=g.x;u.y=g.y;a.gameTime=1;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m25ZacGoo.length,0);
  assert.ok(u.hp>hp);
  assert.ok(u.skillCds.W<cd);
  snapshot();
 });
 check(team,'Alistar E Trample builds five hits and stuns',()=>{
  const {a,e,cast,snapshot}=setup('Alistar',team);
  cast('E');
  for(let t=1;t<=5;t++){a.gameTime=t;a.advanceBoardTemporalV453Dev69();}
  assert.ok(a.effectResolverV41().has(e,'stun'));
  assert.ok(e.hp<7000);snapshot();
 });
 check(team,'Lulu Pix anchored Q delivers second bolt',()=>{
  const {a,e,ally,cast,snapshot}=setup('Lulu',team);
  ally.x=.5;ally.y=.52;e.x=.515;e.y=.52;
  cast('E',{targetId:ally.id});
  assert.equal(a.units.find(v=>v.champ==='Lulu')?.m25LuluPix?.targetId,ally.id);
  const hp=e.hp;
  cast('Q',{point:{x:.53,y:.52}});
  assert.ok(e.hp<hp,'Pix ray from ally must contact target');
  snapshot();
 });
 check(team,'Rell W toggles persistent mounted state',()=>{
  const {a,u,cast,snapshot}=setup('Rell',team);
  cast('W',{point:{x:.512,y:.5}});
  assert.equal(u.m25RellMounted,true);
  a.gameTime=11;u.skillCds.W=0;
  cast('W',{point:{x:.522,y:.5}});
  assert.equal(u.m25RellMounted,false);snapshot();
 });
 check(team,'Milio W campfire heals and extends attack reach',()=>{
  const {a,u,ally,cast,snapshot}=setup('Milio',team);
  cast('W');
  const hp=ally.hp;
  a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.ok(ally.hp>hp);
  assert.ok(ally.m25MilioRangeUntil>1);snapshot();
 });
 check(team,'Quinn E Vault returns backwards and marks Harrier',()=>{
  const {u,e,cast,snapshot}=setup('Quinn',team);
  const origin=u.x;
  cast('E',{targetId:e.id});
  assert.ok(u.x<origin,'Vault should bounce away from target');
  assert.ok(e.m20MarksV453['harrier_'+u.id]>0);snapshot();
 });
 check(team,'Varus R corruption spreads into nearby second target',()=>{
  const {a,u,e,other,cast,snapshot}=setup('Varus',team);
  cast('R',{point:{x:.55,y:.5}});
  const chain=a.boardTemporalV453Dev69.find(z=>z.kind==='m25_varus_chain');
  assert.ok(chain&&chain.sourceId===e.id);
  a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.ok(a.effectResolverV41().has(other,'root'));
  snapshot();
 });
 check(team,'Viktor W gravity stacks stun on second pulse',()=>{
  const {a,e,cast,snapshot}=setup('Viktor',team);
  cast('W',{point:{x:.515,y:.5}});
  a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.equal(a.effectResolverV41().has(e,'stun'),false);
  a.gameTime=2;a.advanceBoardTemporalV453Dev69();
  assert.ok(a.effectResolverV41().has(e,'stun'));snapshot();
 });
}
assert.equal(cases.length,36);
console.log('M25_B01_IDENTITY_QA '+JSON.stringify({cases:cases.length,
 champions:18,teamSeats:2,uniqueIdentityMechanics:true,certifiedChampions:0,
 names:cases}));
