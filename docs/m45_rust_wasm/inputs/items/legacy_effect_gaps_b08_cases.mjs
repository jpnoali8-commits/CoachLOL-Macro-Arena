// CoachLOL M45 B02B-ITEMS B08: 22 uncovered rule IDs, blue and red.
// Pure audit fixture — can run in V8 or Node without game-rule changes.
export function runEffectGapsB08({Arena,map,mask,checksumV40}){
 const cases=[];
 const ok=(v,s)=>{if(!v)throw Error(s)};
 const eq=(a,b,s)=>{if(!Object.is(a,b))throw Error(s+': '+JSON.stringify(a)+' vs '+JSON.stringify(b))};
 const champ=(a,t,r='MID')=>a.units.find(u=>u.id===t+'_'+r);
 const buy=(a,u,...items)=>{for(const item of items)ok(a.buy(u.team,u.id,item),'buy '+item)};
 const enemy=t=>t==='blue'?'red':'blue';
 const rules=[
 ['dorans_ring',({a,u,v})=>{
  buy(a,u,'dorans_ring');u.mana=0;
  a.advanceItemRegenV453Dev38();const basic=u.mana;
  a.damage(v,20,u,'magic','spell');u.mana=0;
  a.advanceItemRegenV453Dev38();const champion=u.mana;
  ok(champion>basic,'champion hit regen not stronger');
  return {basic,champion,activeUntil:u.doransCombatManaUntilV453Dev38};
 }],
 ['cull',({a,u,v})=>{
  buy(a,u,'cull');u.hp=Math.max(1,u.hp-70);const before=u.hp;
  a.attack(u,v,40,'attack');
  ok(u.hp>before,'legal basic must heal Cull');
  return {healed:u.hp-before,stacks:u.cullMinionsV453Dev69||0};
 }],
 ['health_potion',({a,u})=>{
  buy(a,u,'health_potion');u.x=.5;u.y=.5;u.hp=u.maxHp-150;
  const first=a.usePotionV453Dev32(u.team,u.id,'health_potion');ok(first.ok,'potion');
  ok(!u.items.includes('health_potion'),'consumable not removed');
  a.gameTime+=2;a.advancePotionHealingV453Dev32();
  ok(u.hp>u.maxHp-150,'potion pulse');
  return {healApplied:u.potionHealingV453Dev32?.appliedSeconds??0,hp:u.hp};
 }],
 ['refillable_potion',({a,u})=>{
  buy(a,u,'refillable_potion');const shop=a.map.objects.find(v=>v.id===u.team+'_spawn_shop');
  u.x=.5;u.y=.5;u.hp=u.maxHp-200;
  const first=a.usePotionV453Dev32(u.team,u.id,'refillable_potion');ok(first.ok,'first use');
  eq(u.refillableChargesV453Dev32,1,'charge one');
  a.gameTime+=13;a.advancePotionHealingV453Dev32();
  const second=a.usePotionV453Dev32(u.team,u.id,'refillable_potion');ok(second.ok,'second use');
  eq(u.refillableChargesV453Dev32,0,'charge two');
  u.x=shop.x;u.y=shop.y;a.advancePotionHealingV453Dev32();
  eq(u.refillableChargesV453Dev32,2,'fountain refill');
  return {first:first.charges,second:second.charges,refilled:u.refillableChargesV453Dev32};
 }],
 ['seekers_armguard',({a,u})=>{
  buy(a,u,'seekers_armguard');
  const first=a.activateStasis(u.team,u.id);ok(first.ok,'first stasis');
  ok(u.armguardSpentV453Dev37,'armguard charge consumed');
  ok(!a.activateStasis(u.team,u.id).ok,'cannot reuse armguard');
  ok(u.items.includes('seekers_armguard'),'item persists');
  return {charged:u.armguardSpentV453Dev37,until:u.stasisUntil};
 }],
 ['swifties',({a,u,v})=>{
  const slowed=(target)=>{target.slowPercent=.40;return a.effectiveSlowV453Dev50(target)};
  const baseline=slowed(u);buy(a,u,'swifties');
  const resistant=slowed(u);
  ok(resistant<baseline,'swifties should resist slow');
  return {baseline,resistant};
 }],
 ['lord_dominiks_regards',({a,u,v})=>{
  buy(a,u,'lord_dominiks_regards');
  const high=v.maxHp;v.maxHp=3500;v.hp=3500;
  const boosted=a.damage(v,100,u,'physical','spell');
  const base=a.units.find(x=>x.id===u.id);
  const target=a.units.find(x=>x.id===v.id);
  target.maxHp=high;target.hp=high;
  const normal=a.damage(target,100,base,'physical','spell');
  ok(boosted>normal,'Giant Slayer should prefer high-bonus HP opponent');
  return {boosted,normal};
 }],
 ['phage',({a,u,v})=>{
  buy(a,u,'phage');
  const before=a.itemMoveBonusesV453Dev29(u);
  a.damage(v,30,u,'physical','basic');
  const after=a.itemMoveBonusesV453Dev29(u);
  ok(after.flat>before.flat,'Phage on hit speed absent');
  return {flatBefore:before.flat,flatAfter:after.flat};
 }],
 ['phantom_dancer',({a,u})=>{
  buy(a,u,'phantom_dancer');u.explicitOrder=true;
  const point={x:u.x+.002,y:u.y+.002};
  const after=a.resolveChampionMinionBlockV453Dev48(u,point,100);
  eq(after,point,'dummy');
  return {point,after,unitCollisionBypass:true};
 }],
 ['sheen',({a,u,v})=>{
  buy(a,u,'sheen');
  u.spellbladeArmedUntilV453Dev29=a.gameTime+10;
  u.spellbladeNextV453Dev29=0;
  const before=v.hp;
  a.damage(v,40,u,'physical','basic');
  ok(before-v.hp>40,'Sheen empowered hit absent');
  eq(u.spellbladeArmedUntilV453Dev29,-1,'spellblade charge consumed');
  return {dealt:before-v.hp,charge:u.spellbladeArmedUntilV453Dev29};
 }],
 ['spirit_visage',({a,u})=>{
  buy(a,u,'spirit_visage');u.hp=u.maxHp-150;
  const healed=a.effectResolverV41().heal(u,40,u);
  ok(healed>40,'self healing not amplified');
  return {healed};
 }],
 ['trinity_force',({a,u,v})=>{
  buy(a,u,'trinity_force');
  u.spellbladeArmedUntilV453Dev29=a.gameTime+10;
  u.spellbladeNextV453Dev29=0;
  const before=v.hp;
  a.damage(v,40,u,'physical','basic');
  eq(u.spellbladeArmedUntilV453Dev29,-1,'Trinity spellblade consumed');
  ok(before-v.hp>80,'Trinity spellblade bonus absent');
  return {dealt:before-v.hp};
 }],
 ['rapid_firecannon',({a,u,v})=>{
  buy(a,u,'rapid_firecannon');
  const normal=a.itemAttackRangeV453Dev38(u);
  a.itemEnergizeMoveV453Dev38(u,2400);
  eq(u.energizeStacksV453Dev38,100,'RFC charge cap');
  ok(a.itemAttackRangeV453Dev38(u)>normal,'RFC range not extended');
  u.hp=u.maxHp;v.hp=v.maxHp;
  a.attack(u,v,25,'attack');
  ok(u.energizeStacksV453Dev38<100,'RFC charge not consumed');
  return {rangeBefore:normal,rangeCharged:a.itemAttackRangeV453Dev38(u),chargeAfter:u.energizeStacksV453Dev38};
 }],
 ['frozen_heart',({a,u,v})=>{
  buy(a,v,'frozen_heart');
  const far=a.basicAttackIntervalV452c(u);
  v.x=u.x;v.y=u.y;
  const near=a.basicAttackIntervalV452c(u);
  ok(near>far,'Frozen Heart did not slow nearby enemy');
  return {far,near};
 }],
 ['forbidden_idol',({a,u,v})=>{
  buy(a,u,'forbidden_idol');
  v.hp=v.maxHp-120;
  const heal=a.effectResolverV41().heal(v,40,u);
  ok(heal>40,'Idol heal amp not applied');
  const r=a.applyEffectV41(v,'shield',{source:u,duration:3,power:50,key:'b08_idol'});
  ok(r.ok,'Idol shield apply');
  const layer=v.statusEffectsV41.find(x=>x.key==='b08_idol');
  ok(layer.power>50,'Idol shield amp not applied');
  return {heal,shield:layer.power};
 }],
 ['youmuus_ghostblade',({a,u})=>{
  buy(a,u,'youmuus_ghostblade');
  const base=a.effectiveMS(u);
  const r=a.activateYoumuusV453Dev29(u.team,u.id);
  ok(r.ok,'Youmuu activate');
  const boosted=a.effectiveMS(u);
  ok(boosted>base,'Youmuu sprint not applied');
  ok(!a.activateYoumuusV453Dev29(u.team,u.id).ok,'Youmuu double activate');
  return {base,boosted,until:r.until};
 }],
 ['randuins_omen',({a,u,v})=>{
  buy(a,u,'randuins_omen');v.x=u.x;v.y=u.y;
  const r=a.activateRanduinsV453Dev31(u.team,u.id);
  ok(r.ok,'Randuin activate');
  ok(r.targetIds.includes(v.id),'enemy omitted');
  ok(a.effectResolverV41().has(v,'slow'),'Randuin not slowing victim');
  ok(!a.activateRanduinsV453Dev31(u.team,u.id).ok,'Randuins repeated');
  return {targetIds:r.targetIds};
 }],
 ['haunting_guise',({a,u,v})=>{
  buy(a,u,'haunting_guise');v.hp=10000;v.maxHp=10000;
  const first=a.damage(v,80,u,'magic','spell');
  a.gameTime+=4;const next=a.damage(v,80,u,'magic','spell');
  ok(next>first,'Haunting Guise combat ramp not accumulated');
  return {first,next};
 }],
 ['lost_chapter',({a,u})=>{
  buy(a,u,'lost_chapter');
  const level=u.level;
  a.gainXP(u,10000);
  ok(u.level>level,'xp did not level');
  ok((u.lostChapterManaPulsesV453Dev53||[]).length>0,'level-up pulses not scheduled');
  u.mana=0;
  a.advanceItemRegenV453Dev38();
  ok(u.mana>0,'lost chapter did not restore mana');
  return {levelBefore:level,levelAfter:u.level,mana:u.mana,pulses:u.lostChapterManaPulsesV453Dev53.length};
 }],
 ['oblivion_orb',({a,u,v})=>{
  buy(a,u,'oblivion_orb');a.damage(v,40,u,'magic','spell');
  ok(a.effectResolverV41().has(v,'grievous_wounds'),'Oblivion antiheal missing');
  return {gw:true};
 }],
 ['blighting_jewel',({a,u,v})=>{
  const before=a.damage(v,100,u,'magic','spell');
  buy(a,u,'blighting_jewel');v.hp=v.maxHp;
  const after=a.damage(v,100,u,'magic','spell');
  ok(after>before,'magic pen did not increase magic impact');
  return {before,after};
 }],
 ['bamis_cinder',({a,u,v})=>{
  buy(a,u,'bamis_cinder');v.x=u.x;v.y=u.y;
  const hp=v.hp;
  a.damage(v,30,u,'physical','basic');
  ok(u.bamiActiveUntilV453Dev57>a.gameTime,'Bami aura not activated');
  const beforePulse=v.hp;a.advanceBamiAuraV453Dev57();
  ok(v.hp<beforePulse,'Bami aura failed to tick');
  const afterFirst=v.hp;a.advanceBamiAuraV453Dev57();
  eq(v.hp,afterFirst,'Bami double tick on same game second');
  return {primary:hp-beforePulse,aura:beforePulse-v.hp,until:u.bamiActiveUntilV453Dev57};
 }]
 ];
 for(let i=0;i<rules.length;i++)for(const team of ['blue','red']){
  const [id,fn]=rules[i],seed=480800+i*2+(team==='red'?1:0);
  const a=new Arena(map,mask,{seed,mode:'pvp'}),u=champ(a,team),v=champ(a,enemy(team));
  const entry={case_id:'M45-B08-'+id+'-'+team,item_id:id,team,seed,status:'FAIL'};
  try{
   ok(u&&v,'missing actor');
   u.gold=50000;v.gold=50000;u.items=[];v.items=[];
   entry.before_checksum_v40=checksumV40(a.snapshotV40());
   entry.observed=fn({a,u,v});
   entry.after_checksum_v40=checksumV40(a.snapshotV40());
   entry.status='PASS';
  }catch(e){entry.error=String(e)}
  cases.push(entry);
 }
 const failed=cases.filter(x=>x.status==='FAIL');
 return{schema:'coachlol.m45.items.legacy_effect_gaps.b08.v1',
  summary:{rule_ids:rules.map(x=>x[0]),planned:cases.length,passed:cases.length-failed.length,failed:failed.length,status:failed.length?'FAIL':'PASS'},
  cases};
}
