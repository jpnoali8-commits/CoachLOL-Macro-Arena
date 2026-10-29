/** M26/B01: champion-owned board mechanics, two human seats, snapshot replay. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const cases=[];
function setup(champ,team){
 const opponent=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:20262601,mode:'pvp',
  draft:{[team]:{MID:champ},[opponent]:{MID:'Annie'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:3000,maxHp:3000,
  autoFarm:false,autoFollow:false,autoJungle:false,autoAttack:false,deadUntil:0});
 const u=a.units.find(v=>v.id===team+'_MID');
 const e=a.units.find(v=>v.id===opponent+'_MID');
 const e2=a.units.find(v=>v.id===opponent+'_TOP');
 const ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,hp:2800,maxHp:2800,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.515,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(e2,{x:.54,y:.5,hp:7000,maxHp:7000,armor:0,mr:0});
 Object.assign(ally,{x:.505,y:.5,hp:2000,maxHp:3000,armor:0,mr:0});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,opts={}){
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
  assert.equal(queued.ok,true,champ+' '+slot+' queue '+JSON.stringify(queued));
  const prev=a.executeBoardSkillV453Dev69.bind(a);let result;
  a.executeBoardSkillV453Dev69=(actor,q)=>(result=prev(actor,q));
  a.resolveBoardSkillsV453Dev69();a.executeBoardSkillV453Dev69=prev;
  assert.equal(result?.ok,true,champ+' '+slot+' execute '+JSON.stringify(result));
  return {queued,result};
 }
 function snap(){
  const before=a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,before);
  assert.equal(checksumV40(before),checksumV40(restored.snapshotV40()));
 }
 return {a,u,e,e2,ally,team,opponent,cast,snap};
}
const failures=[];
const check=(seat,name,fn)=>{try{fn();cases.push(seat+' '+name)}
 catch(e){failures.push({seat,name,error:String(e?.stack||e)});}};
for(const seat of ['blue','red']){
 check(seat,'Jarvan Q shreds physical armor on actual hit',()=>{
  const a1=setup('JarvanIV',seat),base=setup('JarvanIV',seat);
  a1.cast('Q',{point:{x:.53,y:.5}});
  assert.ok(a1.e.m26JarvanArmorShred?.until>0);
  a1.e.armor=120;base.e.armor=120;
  const withShred=a1.a.damage(a1.e,200,a1.u,'physical','basic');
  const normal=base.a.damage(base.e,200,base.u,'physical','basic');
  assert.ok(withShred>normal);a1.snap();
 });
 check(seat,'Vi E Shockwave reaches champion behind primary victim',()=>{
  const {e,e2,cast,snap}=setup('Vi',seat);
  e2.x=.535;const hp=e2.hp;
  cast('E',{targetId:e.id});
  assert.ok(e2.hp<hp,'Vi E must propagate behind chosen target');
  snap();
 });
 check(seat,'Varus E maintains antiheal zone for entrants',()=>{
  const {a,e2,cast,snap}=setup('Varus',seat);
  e2.x=.08;cast('E',{point:{x:.53,y:.5}});
  assert.ok(a.boardTemporalV453Dev69.some(v=>v.kind==='m26_varus_hail'));
  e2.x=.53;a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.ok(a.effectResolverV41().has(e2,'grievous_wounds'));
  snap();
 });
 check(seat,'Gragas W reduces actual incoming spell damage',()=>{
  const buffed=setup('Gragas',seat),plain=setup('Gragas',seat);
  buffed.cast('W');assert.ok(buffed.u.m26GragasDrinkUntil>0);
  buffed.a.effectResolverV41().remove(buffed.u,
   {types:['shield','magic_shield','physical_shield']});
  const reduced=buffed.a.damage(buffed.u,320,buffed.e,'magic','spell');
  const normal=plain.a.damage(plain.u,320,plain.e,'magic','spell');
  assert.ok(reduced<normal);buffed.snap();
 });
 check(seat,'Shen R shields first and arrives after interruptible channel',()=>{
  const {a,u,ally,cast,snap}=setup('Shen',seat);
  ally.x=.54;const origin=u.x;
  cast('R',{targetId:ally.id});
  assert.ok(a.effectResolverV41().has(ally,'shield'));
  assert.equal(u.x,origin);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m26_shen_arrival'));
  a.gameTime=2;a.advanceBoardTemporalV453Dev69();
  assert.equal(u.x,ally.x);
  snap();
 });
 check(seat,'Corki E Gatling stacks armor shred through three pulses',()=>{
  const {a,u,e,cast,snap}=setup('Corki',seat);
  cast('E',{point:{x:.53,y:.5}});
  const z=a.boardTemporalV453Dev69.find(x=>x.kind==='m26_corki_gatling');assert.ok(z);
  for(let t=1;t<=3;t++){a.gameTime=t;a.advanceBoardTemporalV453Dev69();}
  assert.equal(e.m26CorkiShred[u.id].stacks,3);
  const original=setup('Corki',seat);
  e.armor=120;original.e.armor=120;
  const enhanced=a.damage(e,150,u,'physical','basic');
  const normal=original.a.damage(original.e,150,original.u,'physical','basic');
  assert.ok(enhanced>normal);
  snap();
 });
 check(seat,'Xerath R bullseye has greater damage than outer artillery zone',()=>{
  const direct=setup('Xerath',seat),outer=setup('Xerath',seat);
  direct.cast('R',{point:{x:.53,y:.5}});
  outer.cast('R',{point:{x:.53,y:.5}});
  outer.e.x=.529;
  direct.a.gameTime=1;outer.a.gameTime=1;
  const center={x:.515,y:.5};
  direct.cast('R',{point:center});outer.cast('R',{point:center});
  assert.ok(direct.e.hp<outer.e.hp);
  direct.snap();
 });
 check(seat,'Yunara transcendent E dashes toward enemy if R state is active',()=>{
  const {a,u,cast,snap}=setup('Yunara',seat);
  cast('R');a.gameTime=1;const x=u.x;
  cast('E');assert.ok(u.x>x,'transcendent E must relocate caster');
  snap();
 });
 check(seat,'Alistar R reduction changes actual incoming damage',()=>{
  const actual=setup('Alistar',seat),baseline=setup('Alistar',seat);
  const {a,u,e,cast,snap}=actual;
  cast('R');a.effectResolverV41().remove(u,{types:['shield','magic_shield','physical_shield']});
  assert.ok(u.m26AlistarUnbreakableUntil>a.gameTime);
  const reduced=a.damage(u,300,e,'magic','spell');
  const normal=baseline.a.damage(baseline.u,300,baseline.e,'magic','spell');
  assert.ok(reduced<normal);
  snap();
 });
 check(seat,'Lee Sin E reveals enemies hit by Tempest',()=>{
  const {a,u,e,cast,snap}=setup('LeeSin',seat);
  cast('E');assert.ok(e.m26LeeReveal?.[seat]>a.gameTime);
  snap();
 });
 check(seat,'Lulu R increases allied max HP and launches adjacent enemy',()=>{
  const {a,e,ally,cast,snap}=setup('Lulu',seat);
  const before=ally.maxHp;cast('R',{targetId:ally.id});
  assert.ok(ally.maxHp>before&&a.effectResolverV41().has(e,'knockup'));
  a.gameTime=7;a.advanceBoardPassivesV453Dev69();
  assert.equal(ally.maxHp,before);
  snap();
 });
 check(seat,'Quinn R next basic attack creates Skystrike near primary target',()=>{
  const {a,u,e,e2,cast,snap}=setup('Quinn',seat);
  e2.x=.519;
  cast('R');assert.ok(u.m26QuinnFlightUntil>0);
  const hp=e2.hp;
  a.damage(e,180,u,'physical','basic');
  assert.ok(e2.hp<hp,'Skystrike should strike second nearby champion');
  assert.equal(u.m26QuinnFlightUntil,0);
  snap();
 });
 check(seat,'Viktor E laser aftershock strikes once next turn',()=>{
  const {a,e,cast,snap}=setup('Viktor',seat);
  cast('E',{point:{x:.53,y:.5}});
  assert.ok(a.boardTemporalV453Dev69.some(v=>v.kind==='m26_viktor_aftershock'));
  const hp=e.hp;
  a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.hp<hp);
  const newHp=e.hp;a.advanceBoardTemporalV453Dev69();
  assert.equal(e.hp,newHp);
  snap();
 });
 check(seat,'Kog Maw Q shreds enemy armor and magic resist',()=>{
  const enhanced=setup('KogMaw',seat),base=setup('KogMaw',seat);
  enhanced.cast('Q',{point:{x:.53,y:.5}});
  assert.ok(enhanced.e.m26KogShred?.[enhanced.u.id]?.until>0);
  enhanced.e.armor=110;base.e.armor=110;
  const hit=enhanced.a.damage(enhanced.e,150,enhanced.u,'physical','basic');
  const comparison=base.a.damage(base.e,150,base.u,'physical','basic');
  assert.ok(hit>comparison);
  enhanced.snap();
 });
 check(seat,'Zac R creates three subsequent bounce pulses without repeat cast',()=>{
  const {a,e,cast,snap}=setup('Zac',seat);
  cast('R');
  const z=a.boardTemporalV453Dev69.find(v=>v.kind==='m26_zac_bounce');assert.ok(z);
  const hp=e.hp;
  for(let t=1;t<=3;t++){a.gameTime=t;a.advanceBoardTemporalV453Dev69();}
  assert.equal(z.ticksLeft,0);
  assert.ok(e.hp<hp);
  assert.ok(z.hitIds.includes(e.id));
  snap();
 });
 check(seat,'Zilean ally-attached Q follows ally to detonation',()=>{
  const {a,u,e,e2,ally,cast,snap}=setup('Zilean',seat);
  // Isolate the allied bomb anchor from the enemy TOP at the same coordinates.
  e2.x=.08;ally.x=.54; e.x=.58;
  cast('Q',{point:{x:.54,y:.5}});
  const z=a.boardTemporalV453Dev69.find(v=>v.kind==='m22_zilean_bomb');
  assert.equal(z?.anchorId,ally.id);
  const hp=e.hp;ally.x=.58;a.gameTime=3;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.hp<hp,'bomb must detonate at moving ally');
  snap();
 });
 check(seat,'Braum W adds actual resistance to protected ally',()=>{
  const protectedFixture=setup('Braum',seat),plainFixture=setup('Braum',seat);
  const {a,e,ally,cast,snap}=protectedFixture;
  cast('W',{targetId:ally.id});
  assert.ok(ally.m26BraumResists?.until>0);
  a.effectResolverV41().remove(ally,{types:['shield','physical_shield','magic_shield']});
  const hit=a.damage(ally,320,e,'physical','basic');
  const plain=plainFixture.a.damage(plainFixture.ally,320,plainFixture.e,'physical','basic');
  assert.ok(hit<plain,'Braum W should affect actual armor mitigation');
  snap();
 });
 check(seat,'Braum E negates first frontal skill and not behind attacker',()=>{
  const {a,u,e,e2,cast,snap}=setup('Braum',seat);
  // Braum faces the nearest enemy at cast time; move the rear adversary afterwards.
  e2.x=.54;cast('E');e2.x=.49;
  a.effectResolverV41().remove(u,{types:['shield','magic_shield','physical_shield']});
  assert.ok(u.m26BraumShield?.dx>0,'facing must point at the initial forward enemy');
  assert.equal(a.damage(u,300,e,'magic','spell'),0);
  const frontal=a.damage(u,300,e,'magic','spell');
  assert.ok(frontal>0);
  const fromBehind=a.damage(u,300,e2,'magic','spell');
  assert.ok(fromBehind>frontal,'rear spell must not receive frontal reduction');
  snap();
 });
 check(seat,'Braum R leaves real glacial fissure with delayed slow',()=>{
  const {a,e,cast,snap}=setup('Braum',seat);
  cast('R',{point:{x:.53,y:.5}});
  assert.ok(a.boardTemporalV453Dev69.some(v=>v.kind==='m26_braum_fissure'));
  a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.ok(a.effectResolverV41().has(e,'slow'));
  snap();
 });
 check(seat,'Locke nails accumulate three stacks then E consumes',()=>{
  const {a,u,e,cast,snap}=setup('Locke',seat);
  for(let i=0;i<3;i++){
   a.gameTime=i;u.skillCds.Q=0;cast('Q',{point:{x:.53,y:.5}});
  }
  assert.equal(e.m26LockeNails[u.id].stacks,3);
  cast('E',{point:{x:.515,y:.5}});
  assert.equal(e.m26LockeNails[u.id],null);
  assert.ok(a.effectResolverV41().has(e,'slow'));snap();
 });
 check(seat,'Rell Q removes real target shield on contact',()=>{
  const {a,u,e,cast,snap}=setup('Rell',seat);
  a.applyEffectV41(e,'shield',{source:e,duration:5,power:700,key:'qa_rell_shield'});
  assert.ok(a.effectResolverV41().has(e,'shield'));
  cast('Q',{point:{x:.53,y:.5}});
  assert.equal(a.effectResolverV41().has(e,'shield'),false);
  snap();
 });
 check(seat,'Rell R magnet pulls enemy on later simulated pulse',()=>{
  const {a,e,cast,snap}=setup('Rell',seat);
  e.x=.525;cast('R');
  const start=e.x;
  a.gameTime=1;a.advanceBoardTemporalV453Dev69();
  assert.ok(e.x<start,'magnet must keep pulling after first cast');
  snap();
 });
 check(seat,'Karthus E aura pulses, spends mana and toggles off without double cost',()=>{
  const {a,u,e,cast,snap}=setup('Karthus',seat);
  const first=cast('E');
  assert.ok(first.result.toggled&&u.m26KarthusE);
  const hp=e.hp,mana=u.mana,cd=u.skillCds.E;
  a.gameTime=1;a.advanceBoardPassivesV453Dev69();
  assert.ok(e.hp<hp);
  assert.ok(u.mana<mana);
  const off=cast('E');
  assert.equal(off.queued.recast,true);
  assert.equal(off.result.spentMana,0);
  assert.equal(u.mana,mana-12);
  assert.equal(u.skillCds.E,cd);
  assert.equal(u.m26KarthusE,null);
  snap();
 });
 check(seat,'Urgot R recast suppression finishes after one second',()=>{
  const {a,u,e,e2,cast,snap}=setup('Urgot',seat);
  e2.x=.516;cast('R',{point:{x:.53,y:.5}});e.hp=e.maxHp*.24;
  a.gameTime=1;const second=cast('R',{targetId:e.id});
  assert.equal(second.result.channel,true);
  assert.ok(e.hp>0&&a.effectResolverV41().has(e,'suppression'));
  a.gameTime=2.1;a.advanceBoardPassivesV453Dev69();
  assert.equal(e.hp,0);
  assert.ok(a.effectResolverV41().has(e2,'fear'));
  snap();
 });
 check(seat,'Urgot R channel can be interrupted before final execution',()=>{
  const {a,u,e,cast,snap}=setup('Urgot',seat);
  cast('R',{point:{x:.53,y:.5}});e.hp=e.maxHp*.24;
  a.gameTime=1;cast('R',{targetId:e.id});
  a.applyEffectV41(u,'stun',{source:e,duration:2,key:'qa_urgot_interrupt'});
  a.gameTime=1.5;a.advanceBoardPassivesV453Dev69();
  a.gameTime=2.2;a.advanceBoardPassivesV453Dev69();
  assert.ok(e.hp>0);
  assert.equal(u.m26UrgotReel,null);
  snap();
 });
 check(seat,'Tahm Kench acquires three Taste stacks on real basic attacks',()=>{
  const {a,u,e,cast,snap}=setup('TahmKench',seat);
  for(let i=0;i<3;i++){a.gameTime=i*.1;a.damage(e,90,u,'physical','basic');}
  assert.equal(e.m24TasteV453[u.id].stacks,3);
  cast('R',{targetId:e.id});assert.equal(u.m24DevourV453.targetId,e.id);
  snap();
 });
 check(seat,'Fizz W adds seastone bleed only after actual basic',()=>{
  const {a,u,e,cast,snap}=setup('Fizz',seat);
  cast('W');assert.ok(u.m26FizzBleedUntil>0);
  a.damage(e,100,u,'physical','basic');
  assert.ok(a.effectResolverV41().has(e,'dot'));
  snap();
 });
 check(seat,'Syndra R uses additional owned spheres as distinct bolts',()=>{
  const withOrb=setup('Syndra',seat),base=setup('Syndra',seat);
  withOrb.cast('Q',{point:{x:.51,y:.5}});
  withOrb.a.gameTime=1;base.a.gameTime=1;
  const hpOrb=withOrb.e.hp,hpBase=base.e.hp;
  withOrb.cast('R',{targetId:withOrb.e.id});
  base.cast('R',{targetId:base.e.id});
  assert.equal(withOrb.u.m26SyndraLastVolley.shots,4);
  assert.equal(base.u.m26SyndraLastVolley.shots,3);
  assert.ok(hpOrb-withOrb.e.hp>hpBase-base.e.hp);
  withOrb.snap();
 });
 check(seat,'Seraphine Encore extends only after crossing allied champion',()=>{
  const withAlly=setup('Seraphine',seat),without=setup('Seraphine',seat);
  withAlly.ally.x=.535;
  withAlly.e.x=.625;without.e.x=.625;
  without.ally.x=.08;
  withAlly.cast('R',{point:{x:.605,y:.5}});
  without.cast('R',{point:{x:.605,y:.5}});
  assert.ok(withAlly.e.hp<without.e.hp);
  withAlly.snap();
 });
}
for(const f of failures)console.error('M26_B01_FAIL',JSON.stringify(f));
console.log('M26_B01_IDENTITY_QA '+JSON.stringify({
 cases:cases.length,failures:failures.length,champions:25,teamSeats:2,
 certifiedChampions:0,names:cases
}));
assert.equal(failures.length,0,'M26 champion-specific behavior failed');
assert.equal(cases.length,58);
