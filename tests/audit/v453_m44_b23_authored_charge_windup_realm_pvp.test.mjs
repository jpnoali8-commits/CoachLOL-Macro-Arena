/* M44 B23 — charge/windup exceptions and projectile realm at launch. Runs both PvP seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs){
 const opp=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:20230,draft:{[side]:{MID:mine},[opp]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===opp+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const point={x:v.x,y:v.y};
 const cast=(who,slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(who.team,who.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  let receipt,fn=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{const z=fn(actor,cmd);if(actor.id===who.id)receipt=z;return z;};
  try{a.resolveBoardSkillsV453Dev69();}finally{a.executeBoardSkillV453Dev69=fn;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));return receipt;
 };
 const chargeStart=(who,slot)=>{
  const q=a.queueBoardChargeStartV453Dev69(who.team,who.id,slot);
  assert.equal(q.ok,true,JSON.stringify(q));a.resolveBoardSkillsV453Dev69();
  assert.ok(who.m34ChargeStateV453);
 };
 return {a,u,v,opp,point,cast,chargeStart};
}
const test=(name,mine,theirs,fn)=>cases.push({name,mine,theirs,fn});
test('authored delivery taxonomy keeps three distinct holds','Irelia','Annie',({a})=>{
 assert.equal(a.m44B22DeliveryKindV453('irelia_w_dance'),'defensive_channel');
 assert.equal(a.m44B22DeliveryKindV453('m40_sett_haymaker'),'windup');
 assert.equal(a.m44B22DeliveryKindV453('galio_durand'),'charge');
 assert.equal(a.m44B22DeliveryKindV453('unimplemented_R'),'unknown');
});
test('Irelia W ignores CC and releases on its original timer','Irelia','Annie',({a,u,v,point})=>{
 assert.equal(a.castIreliaDanceV453Dev69M7(u,point).ok,true);
 a.applyEffectV41(u,'stun',{source:v,duration:3,key:'b23_irelia_cc'});
 const state=u.ireliaDanceV453Dev69M7,hp=v.hp;
 a.gameTime=state.releaseAt;a.advanceIreliaDanceV453Dev69M7();
 assert.ok(state.released);assert.ok(v.hp<hp);assert.ok(u.ireliaDanceV453Dev69M7);
 assert.ok(!a.m44B22ChannelInterruptHistory?.some(z=>z.kind==='irelia_w_dance'));
});
test('Irelia W recast while stunned has no second cost','Irelia','Annie',({a,u,v,point})=>{
 assert.equal(a.castIreliaDanceV453Dev69M7(u,point).ok,true);
 const mana=u.mana,cd=u.skillCds.W;
 a.applyEffectV41(u,'stun',{source:v,duration:2,key:'b23_irelia_recast'});
 a.gameTime+=.2;
 const z=a.castIreliaDanceV453Dev69M7(u,point);
 assert.ok(z.ok&&z.recast);assert.equal(u.mana,mana);assert.equal(u.skillCds.W,cd);
});
test('Irelia W death prevents deferred release','Irelia','Annie',({a,u,point})=>{
 assert.equal(a.castIreliaDanceV453Dev69M7(u,point).ok,true);
 u.hp=0;a.gameTime+=1;a.advanceIreliaDanceV453Dev69M7();
 assert.equal(u.ireliaDanceV453Dev69M7,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='irelia_w_dance'&&z.reason==='death'));
});
test('Irelia W forced relocation invalidates charge','Irelia','Annie',({a,u,point})=>{
 assert.equal(a.castIreliaDanceV453Dev69M7(u,point).ok,true);
 u.x+=.04;a.gameTime+=1;a.advanceIreliaDanceV453Dev69M7();
 assert.equal(u.ireliaDanceV453Dev69M7,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='irelia_w_dance'&&z.reason==='movement'));
});
test('Irelia W realm relocation invalidates charge','Irelia','Mordekaiser',({a,u,v,point})=>{
 assert.equal(a.castIreliaDanceV453Dev69M7(u,point).ok,true);
 assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 a.gameTime+=1;a.advanceIreliaDanceV453Dev69M7();
 assert.equal(u.ireliaDanceV453Dev69M7,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='irelia_w_dance'&&z.reason==='realm_change'));
});
test('Sett shield survives interrupted timed Haymaker','Sett','Annie',({a,u,v,point,cast})=>{
 u.m23GritV453={value:300,nextDecayAt:100};cast(u,'W',{point});
 const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m40_sett_haymaker'&&z.ownerId===u.id);
 assert.ok(z);assert.ok(a.effectResolverV41().list(u).some(z=>z.type==='shield'));
 a.applyEffectV41(u,'stun',{source:v,duration:2,key:'b23_sett_cc'});
 a.gameTime+=.1;assert.equal(a.m40InterruptChannelV453Dev69(u),true);
 assert.ok(!a.boardTemporalV453Dev69.some(p=>p.id===z.id));
 assert.ok(a.effectResolverV41().list(u).some(p=>p.type==='shield'));
 assert.equal(a.m40InterruptChannelV453Dev69(u),false);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='m40_sett_haymaker'&&z.reason==='cc'));
});
test('Sett movement cancels pending impact','Sett','Annie',({a,u,point,cast})=>{
 cast(u,'W',{point});u.x+=.04;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m40_sett_haymaker'&&z.ownerId===u.id));
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='m40_sett_haymaker'&&z.reason==='movement'));
});
test('Sett realm change cancels pending impact','Sett','Mordekaiser',({a,u,v,point,cast})=>{
 cast(u,'W',{point});assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m40_sett_haymaker'&&z.ownerId===u.id));
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='m40_sett_haymaker'&&z.reason==='realm_change'));
});
test('Sett normal W still hits after windup','Sett','Annie',({a,u,v,point,cast})=>{
 cast(u,'W',{point});const hp=v.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<hp);assert.ok(!u.m40AuthoredChannelV453);
});
test('Viktor R interruption attributes Sett W to original caster','Sett','Viktor',({a,u,v,point,cast})=>{
 cast(u,'W',{point});assert.equal(a.m41ViktorStormDisruptV453Dev69(v,u),true);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m40_sett_haymaker'));
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='m40_sett_haymaker'&&z.sourceId===v.id&&z.reason==='viktor_r'));
});
test('Galio start costs no mana; hard CC cancels charge','Galio','Annie',({a,u,v,chargeStart})=>{
 const mana=u.mana;chargeStart(u,'W');assert.equal(u.mana,mana);
 a.applyEffectV41(u,'stun',{source:v,duration:2,key:'b23_galio_cc'});
 assert.equal(a.m40InterruptChannelV453Dev69(u),true);
 assert.equal(u.m34ChargeStateV453,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='galio_durand'&&z.reason==='cc'));
});
test('Galio moving cancels charge','Galio','Annie',({a,u,chargeStart})=>{
 chargeStart(u,'W');u.x+=.04;
 assert.equal(a.m40InterruptChannelV453Dev69(u),true);
 assert.equal(u.m34ChargeStateV453,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='galio_durand'&&z.reason==='movement'));
});
test('Galio realm change cancels charge','Galio','Mordekaiser',({a,u,v,chargeStart})=>{
 chargeStart(u,'W');assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 assert.equal(a.m40InterruptChannelV453Dev69(u),true);
 assert.equal(u.m34ChargeStateV453,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='galio_durand'&&z.reason==='realm_change'));
});
test('Galio valid release preserves authored defense tail','Galio','Annie',({a,u,chargeStart,point})=>{
 chargeStart(u,'W');a.gameTime+=1;
 const q=a.queueBoardChargeReleaseV453Dev69(u.team,u.id,'W',{point});
 assert.equal(q.ok,true,JSON.stringify(q));a.resolveBoardSkillsV453Dev69();
 assert.ok(!u.m40AuthoredChannelV453);
 assert.ok(u.m40GalioWDefenseUntil>a.gameTime);
});
test('Viktor cancels Galio pre-release hold','Galio','Viktor',({a,u,v,chargeStart})=>{
 chargeStart(u,'W');assert.equal(a.m41ViktorStormDisruptV453Dev69(v,u),true);
 assert.equal(u.m34ChargeStateV453,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='galio_durand'&&z.reason==='viktor_r'&&z.sourceId===v.id));
});
test('original fired projectile can hit after caster death','Morgana','Annie',({a,u,v,point,cast})=>{
 cast(u,'Q',{point});const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_authored_projectile'&&z.ownerId===u.id);
 assert.ok(z);const hp=v.hp;u.hp=0;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.ok(z.hitIds.includes(v.id)||v.hp<hp);
});
test('projectile keeps launch realm after caster is exiled','Morgana','Mordekaiser',({a,u,v,opp,cast})=>{
 const outside=a.units.find(z=>z.id===opp+'_ADC');outside.x=.53;outside.y=.5;
 cast(u,'Q',{point:{x:.54,y:.5}});
 const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_authored_projectile'&&z.ownerId===u.id);
 assert.ok(z);assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 const hp=outside.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.ok(z.hitIds.includes(outside.id)||outside.hp<hp);
 assert.ok(!z.hitIds.includes(v.id));
});
test('Kassadin Q cancels Sett windup using shared receipt','Sett','Kassadin',({a,u,v,point,cast})=>{
 cast(u,'W',{point});cast(v,'Q',{targetId:u.id});
 assert.equal(u.m40AuthoredChannelV453,null);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m40_sett_haymaker'&&z.ownerId===u.id));
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='m40_sett_haymaker'&&z.reason==='kassadin_q'&&z.sourceId===v.id));
});
test('Kassadin Q cancels Galio W charge without release','Galio','Kassadin',({a,u,v,chargeStart,cast})=>{
 chargeStart(u,'W');cast(v,'Q',{targetId:u.id});
 assert.equal(u.m34ChargeStateV453,null);
 assert.equal(u.m40AuthoredChannelV453,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(z=>z.kind==='galio_durand'&&z.reason==='kassadin_q'&&z.sourceId===v.id));
});
test('Viktor R cannot interrupt Irelia CC-immune W','Irelia','Viktor',({a,u,v,point})=>{
 assert.equal(a.castIreliaDanceV453Dev69M7(u,point).ok,true);
 assert.equal(a.m41ViktorStormDisruptV453Dev69(v,u),false);
 assert.ok(u.ireliaDanceV453Dev69M7);
 assert.ok(!a.m44B22ChannelInterruptHistory?.some(z=>z.kind==='irelia_w_dance'));
});
test('Galio W mitigates magic damage and preserves defense on release','Galio','Annie',({a,u,v,chargeStart,point})=>{
 chargeStart(u,'W');
 const dealt=a.damage(u,300,v,'magic','spell');
 assert.ok(dealt>0&&dealt<300,'Galio charge mitigation missing');
 a.gameTime+=1;
 assert.equal(a.queueBoardChargeReleaseV453Dev69(u.team,u.id,'W',{point}).ok,true);
 a.resolveBoardSkillsV453Dev69();
 assert.ok(u.m40GalioWDefenseUntil>a.gameTime,'released defense tail missing');
});
test('Irelia W never mitigates true damage','Irelia','Annie',({a,u,v,point})=>{
 assert.equal(a.castIreliaDanceV453Dev69M7(u,point).ok,true);
 const physical=a.damage(u,300,v,'physical','spell');
 const trueHit=a.damage(u,300,v,'true','spell');
 assert.ok(physical>0&&physical<trueHit);
});
let passed=0;const failures=[];
for(const side of ['blue','red'])for(const c of cases){
 try{
  const f=fixture(side,c.mine,c.theirs);c.fn(f);
  const snap=f.a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
  passed++;
 }catch(e){failures.push({side,name:c.name,error:String(e?.stack||e)});}
}
for(const f of failures)console.error('M44_B23_FAIL',JSON.stringify(f));
console.log('M44_B23',JSON.stringify({cases:cases.length,seats:2,passed,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
