/** M28/B01 second authored increment. No kit is marked CERTIFIED by this suite. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const champs=['Xerath','Varus','Viktor','Galio','Mel','Heimerdinger','Lucian'];
let cases=0;const failures=[];
for(const champ of champs)for(const team of ['blue','red']){
 try{
  const other=team==='blue'?'red':'blue';
  const a=new Arena(map,mask,{seed:282828,mode:'pvp',
   draft:{[team]:{MID:champ},[other]:{MID:'Annie'}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3500,maxHp:3500,
   autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
  const u=a.units.find(v=>v.id===team+'_MID'),e=a.units.find(v=>v.id===other+'_MID');
  Object.assign(u,{champ,x:.5,y:.5,level:16,hp:3500,maxHp:3500,
   mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
   skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000});
  a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
  const cast=(slot,opts={})=>{
   const receipt=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
   assert.equal(receipt.ok,true,champ+' '+slot+': '+JSON.stringify(receipt));
   a.resolveBoardSkillsV453Dev69();
  };
  const point={x:.54,y:.5};
  if(champ==='Xerath'||champ==='Varus'){
   e.x=.565;
   cast('Q',{point:{x:.59,y:.5},chargeSeconds:0});
   assert.equal(e.hp,7000,'uncharged range should miss distant enemy');
   u.skillCds.Q=0;
   const denial=a.queueBoardSkillV453Dev69(team,u.id,'Q',
    {point:{x:.59,y:.5},chargeSeconds:3});
   assert.equal(denial.ok,false,'invalid charge accepted');
   const mana=u.mana;assert.equal(denial.reason,'m28_charge_invalid');
   assert.equal(u.mana,mana,'denied charge debited mana');
   cast('Q',{point:{x:.59,y:.5},chargeSeconds:2});
   assert.ok(e.hp<7000,'charged Q should reach distant enemy');
  }else if(champ==='Viktor'){
   cast('Q',{targetId:e.id});
   assert.equal(a.effectResolverV41().has(u,'shield'),true,'Viktor must self-shield');
   e.x=.55;e.y=.5;
   const denial=a.queueBoardSkillV453Dev69(team,u.id,'E',
    {point:{x:.57,y:.5},laserEnd:{x:1.2,y:.5}});
   assert.equal(denial.ok,false,'invalid laser points accepted');
   cast('E',{point:{x:.52,y:.5},laserEnd:{x:.58,y:.5}});
   assert.ok(e.hp<7000,'two-point laser should hit between selected anchors');
   const delayed=a.boardTemporalV453Dev69.find(z=>z.kind==='m26_viktor_aftershock');
   assert.ok(delayed,'laser aftershock not scheduled');
   assert.equal(delayed.origin.x,.52);
  }else if(champ==='Galio'){
   e.x=.523;
   cast('W',{chargeSeconds:2});
   assert.equal(a.effectResolverV41().has(e,'taunt'),true,'charged W must reach 345 units');
   u.skillCds.Q=0;e.x=.515;
   cast('Q',{point});
   assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m28_galio_converge'),
    'Galio Q should create delayed convergent winds');
  }else if(champ==='Mel'){
   cast('Q',{point});
   const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m28_mel_volley');
   assert.ok(z,'Mel Q creates separate projectiles');
   const hp=e.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
   assert.ok(e.hp<hp,'second Mel projectile should deal independent damage');
   u.skillCds.E=0;e.x=.525;e.y=.506;
   cast('E',{point:{x:.55,y:.5}});
   assert.equal(a.effectResolverV41().has(e,'slow'),true,'Mel E outer band slows');
  }else if(champ==='Heimerdinger'){
   e.x=.531;
   cast('E',{point:{x:.52,y:.5}});
   assert.equal(a.effectResolverV41().has(e,'slow'),true,
    'Heimer grenade outer region slows rather than stuns');
  }else if(champ==='Lucian'){
   cast('W',{point});
   assert.ok(e.m20MarksV453?.['ardent_'+u.id]>a.gameTime,'Lucian W marks Ardent');
   a.damage(e,60,u,'physical','basic');
   assert.ok(u.boardSpeedV453Dev69?.until>a.gameTime,'Ardent follow-up speeds Lucian');
   assert.equal(e.m20MarksV453['ardent_'+u.id],undefined,'Ardent must be consumed');
  }
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  cases++;
 }catch(error){failures.push({champ,team,error:String(error.stack||error)})}
}
for(const x of failures)console.error('M28_EXTENDED_FAIL',JSON.stringify(x));
console.log('M28_EXTENDED_QA '+JSON.stringify({champions:champs.length,seats:2,passed:cases,
 failed:failures.length,certifiedChampions:0}));
assert.equal(failures.length,0);assert.equal(cases,champs.length*2);
