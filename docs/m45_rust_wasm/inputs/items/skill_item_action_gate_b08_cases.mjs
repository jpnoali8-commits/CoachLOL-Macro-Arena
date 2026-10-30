// M45 B08 — skill action gates crossed with item damage handlers.
// Scope: authoritative performActionV40 + damage/attack; NOT full QWER kit/projectile.
export function runSkillItemGateB08({Arena,map,mask,checksumV40}){
 const cases=[],ok=(v,m)=>{if(!v)throw Error(m)};
 const eq=(x,y,m)=>{if(!Object.is(x,y))throw Error(m+': '+x+' / '+y)};
 const items=[
 ['SHEEN_Q_ARMS_ONE_BASIC',({a,u,v})=>{
  ok(a.buy(u.team,u.id,'sheen'),'buy Sheen');u.skillRanks.Q=1;
  const r=a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',source:'b08_cast_gate'});
  ok(r.ok,'Q action gate');ok(u.spellbladeArmedUntilV453Dev29>=a.gameTime,'Sheen armed by Q');
  const before=v.hp;a.damage(v,35,u,'physical','basic');
  eq(u.spellbladeArmedUntilV453Dev29,-1,'consume Sheen');
  ok(before-v.hp>35,'Sheen basic empower missing');
  return {spentMana:r.spentMana,cooldownUntil:r.cooldownEndsAt,firstDealt:before-v.hp};
 }],
 ['TRINITY_W_ARMS_BUT_DOUBLE_CAST_BLOCKS',({a,u,v})=>{
  ok(a.buy(u.team,u.id,'trinity_force'),'buy Trinity');u.skillRanks.W=1;
  const first=a.performActionV40({actorId:u.id,kind:'skill',slot:'W',source:'b08_cast_gate'});
  ok(first.ok,'W action gate');ok(u.spellbladeArmedUntilV453Dev29>=a.gameTime,'Trinity armed');
  const again=a.performActionV40({actorId:u.id,kind:'skill',slot:'W',source:'b08_cast_gate'});
  ok(!again.ok,'duplicate W allowed in same tick');
  a.damage(v,40,u,'physical','basic');
  eq(u.spellbladeArmedUntilV453Dev29,-1,'Trinity consumed');
  return {first,secondDenied:again.reason,spellbladeNext:u.spellbladeNextV453Dev29};
 }],
 ['TEAR_Q_CAST_THEN_VALID_SPELL_HIT',({a,u,v})=>{
  ok(a.buy(u.team,u.id,'tear_of_the_goddess'),'buy Tear');u.skillRanks.Q=1;
  const before=u.tearManaBonusV453Dev56||0;
  const gate=a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',source:'b08_cast_gate'});
  ok(gate.ok,'Q cast gate');const dealt=a.damage(v,42,u,'magic','spell');
  ok(dealt>0,'Q-typed spell impact');
  ok((u.tearManaBonusV453Dev56||0)>before,'Tear stack not earned after hit');
  return {manaSpent:gate.spentMana,tearDelta:u.tearManaBonusV453Dev56-before};
 }],
 ['BANSHEE_BLOCKS_CAST_HIT_AND_BURN',({a,u,v})=>{
  ok(a.buy(u.team,u.id,'fated_ashes'),'buy Ashes');
  ok(a.buy(v.team,v.id,'banshees_veil'),'buy Banshee');u.skillRanks.Q=1;
  const cast=a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',source:'b08_cast_gate'});
  ok(cast.ok,'Q cast gate');const hp=v.hp;
  const blocked=a.damage(v,60,u,'magic','spell');
  eq(blocked,0,'Banshee should block first spell-class impact');
  eq(v.hp,hp,'Banshee blocked HP');
  ok(!a.effectResolverV41().has(v,'dot'),'blocked spell started Fated burn');
  const hit=a.damage(v,60,u,'magic','spell');
  ok(hit>0&&a.effectResolverV41().has(v,'dot'),'second impact did not burn');
  return {blocked,hit,castSeq:cast.seq};
 }]
 ];
 for(let i=0;i<items.length;i++)for(const team of ['blue','red']){
  const [name,fn]=items[i],seed=481900+i*2+(team==='red'?1:0),a=new Arena(map,mask,{seed,mode:'pvp'});
  const u=a.units.find(v=>v.id===team+'_MID'),v=a.units.find(x=>x.id===(team==='blue'?'red':'blue')+'_MID');
  const c={case_id:'M45-B08-'+name+'-'+team,seed,team,scope:'ACTION_GATE_AND_HIT_ADAPTER_NOT_FULL_KIT',status:'FAIL'};
  try{u.items=[];v.items=[];u.gold=50000;v.gold=50000;
   c.before_checksum_v40=checksumV40(a.snapshotV40());
   c.observed=fn({a,u,v});c.after_checksum_v40=checksumV40(a.snapshotV40());c.status='PASS';
  }catch(e){c.error=String(e)}
  cases.push(c);
 }
 const fails=cases.filter(x=>x.status==='FAIL');
 return{schema:'coachlol.m45.items.skill_action_gate.b08.v1',
  summary:{planned:cases.length,passed:cases.length-fails.length,failed:fails.length,scope:'No champion full QWER/passive/combo certification'},
  cases};
}
