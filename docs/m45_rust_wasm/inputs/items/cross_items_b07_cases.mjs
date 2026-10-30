// M45 B02B-ITEMS B07 — cross-item combat oracle (source-only, not new gameplay).
// Shared unchanged between isolated V8 execution and native Node ESM golden.
export function runCrossItemsB07({Arena,map,mask,checksumV40}){
 const cases=[],assert=(cond,why)=>{if(!cond)throw Error(why);};
 const eq=(x,y,why)=>{if(!Object.is(x,y))throw Error(why+': '+JSON.stringify(x)+' vs '+JSON.stringify(y));};
 const champ=(a,t,r='MID')=>a.units.find(u=>u.id===t+'_'+r);
 const pair=t=>t==='blue'?'red':'blue';
 const effects=(a,u,type)=>a.effectResolverV41().has(u,type);
 const buy=(a,u,...items)=>{for(const item of items)assert(a.buy(u.team,u.id,item),'buy '+item+' for '+u.id);};
 const checks=[
  ['MORELLO_LIANDRY_MAGIC',({a,u,v})=>{
   buy(a,u,'morellonomicon','liandrys_torment');
   a.damage(v,90,u,'magic','spell');
   assert(effects(a,v,'grievous_wounds'),'morello magic GW');
   assert(effects(a,v,'dot'),'Liandry burn');
   const dot=v.statusEffectsV41.find(e=>e.key==='liandry_'+u.id);
   assert(dot&&dot.damageType==='magic'&&dot.until>a.gameTime,'burn source');
   return {gw:true,burnPower:dot.power,burnUntil:dot.until};
  }],
  ['EXECUTIONER_CLEAVER_PHYSICAL',({a,u,v})=>{
   buy(a,u,'executioners_calling','black_cleaver');
   a.damage(v,90,u,'physical','basic');
   assert(effects(a,v,'grievous_wounds'),'executioner physical GW');
   eq(v.cleaverDebuffV453Dev29?.stacks,1,'first cleaver stack');
   const first=v.cleaverDebuffV453Dev29.stacks;
   a.damage(v,90,u,'physical','basic');
   eq(v.cleaverDebuffV453Dev29.stacks,2,'second cleaver stack');
   return {first,stacks:v.cleaverDebuffV453Dev29.stacks};
  }],
  ['RYLAI_FATED_ASHES_SPELL_ONLY',({a,u,v})=>{
   buy(a,u,'rylais_crystal_scepter','fated_ashes');
   a.damage(v,40,u,'magic','basic');
   assert(!effects(a,v,'slow'),'basic triggered Rylai slow');
   assert(!effects(a,v,'dot'),'basic triggered Fated Ashes burn');
   a.damage(v,40,u,'magic','spell');
   assert(effects(a,v,'slow'),'spell lacked Rylai slow');
   assert(effects(a,v,'dot'),'spell lacked Fated Ashes burn');
   return {slow:true,burn:true};
  }],
  ['BANSHEE_BLOCKS_LIANDRY_BLOODLETTER',({a,u,v})=>{
   buy(a,u,'liandrys_torment','bloodletters_curse');buy(a,v,'banshees_veil');
   const hp=v.hp,blocked=a.damage(v,80,u,'magic','spell');
   eq(blocked,0,'first spell damage');eq(v.hp,hp,'shielded HP');
   assert(!effects(a,v,'dot'),'shielded spell generated Liandry burn');
   assert(!v.bloodletterShredV453Dev69?.stacks,'shielded spell generated shred');
   const landed=a.damage(v,80,u,'magic','spell');
   assert(landed>0,'unshielded spell did not land');
   assert(effects(a,v,'dot'),'unshielded spell lacked burn');
   eq(v.bloodletterShredV453Dev69.stacks,1,'unshielded shred');
   return {blocked,landed,shred:1};
  }],
  ['BRAMBLE_HEXTECH_NO_REFLECTION_LOOP',({a,u,v})=>{
   buy(a,u,'hextech_alternator');buy(a,v,'bramble_vest');
   const hpBefore=u.hp,vBefore=v.hp;
   const first=a.damage(v,70,u,'physical','basic');
   assert(first>0&&v.hp<vBefore,'no primary hit');
   assert(u.hp<hpBefore,'no thorn reflection');
   assert(effects(a,u,'grievous_wounds'),'missing Thorn antiheal');
   assert(u.hextechAlternatorReadyAtV453Dev56>a.gameTime,'Hextech did not proc');
   return {primary:first,reflected:hpBefore-u.hp,hextechUntil:u.hextechAlternatorReadyAtV453Dev56};
  }],
  ['THORNMAIL_MORTAL_BIDIRECTIONAL_GW',({a,u,v})=>{
   buy(a,u,'mortal_reminder');buy(a,v,'thornmail');
   a.damage(v,80,u,'physical','basic');
   assert(effects(a,v,'grievous_wounds'),'Mortal GW missing');
   assert(effects(a,u,'grievous_wounds'),'Thornmail GW missing');
   return {attackerWounded:true,defenderWounded:true};
  }],
  ['STEELCAPS_WARDEN_COMBINED_BASIC_REDUCTION',({a,u,v})=>{
   buy(a,v,'plated_steelcaps','wardens_mail');
   const mitigated=a.damage(v,100,u,'physical','basic');
   const noItems=new Arena(map,mask,{seed:a.seed,mode:'pvp'});
   const t=champ(noItems,v.team),s=champ(noItems,u.team);
   const plain=noItems.damage(t,100,s,'physical','basic');
   assert(mitigated<plain,'two armor items did not reduce basic damage');
   return {mitigated,plain};
  }],
  ['BANSHEE_BLOCKS_HEXTECH_CHARGE',({a,u,v})=>{
   buy(a,u,'hextech_alternator');buy(a,v,'banshees_veil');
   eq(a.damage(v,70,u,'magic','spell'),0,'spell shield');
   assert((u.hextechAlternatorReadyAtV453Dev56||0)<=a.gameTime,'blocked spell spent Alternator');
   const landed=a.damage(v,70,u,'magic','spell');
   assert(landed>0&&u.hextechAlternatorReadyAtV453Dev56>a.gameTime,'unblocked spell did not trigger Alternator');
   return {landed,cooldownUntil:u.hextechAlternatorReadyAtV453Dev56};
  }],
  ['GUINSOO_NASHOR_RECURVE_SIXTH_ATTACK',({a,u,v})=>{
   buy(a,u,'guinsoos_rageblade','nashors_tooth','recurve_bow');
   v.hp=50000;v.maxHp=50000;
   const deltas=[];
   for(let i=0;i<6;i++){const hp=v.hp;a.attack(u,v,20,'attack');deltas.push(hp-v.hp);}
   eq(u.guinsooHitCountV453Dev54,6,'Guinsoo 6 legal hits');
   eq(u.guinsooStacksV453Dev54,4,'Guinsoo stack cap');
   assert(deltas[5]>deltas[4],'sixth stack4 trigger did not double onhit');
   return {deltas,stacks:u.guinsooStacksV453Dev54,hitCount:u.guinsooHitCountV453Dev54};
  }],
  ['KRAKEN_GUINSOO_THIRD_HIT',({a,u,v})=>{
   buy(a,u,'kraken_slayer','guinsoos_rageblade');
   v.hp=50000;v.maxHp=50000;
   const deltas=[];
   for(let i=0;i<3;i++){const hp=v.hp;a.attack(u,v,25,'attack');deltas.push(hp-v.hp);}
   assert(deltas[2]>deltas[1],'Kraken third hit did not spike');
   eq(u.krakenHitV453Dev32.stacks,0,'Kraken third-hit reset');
   return {deltas,kraken:u.krakenHitV453Dev32};
  }],
  ['RABADON_DARK_SEAL_GLORY_ATOMIC',({a,u})=>{
   buy(a,u,'dark_seal','rabadon');
   const full=u.ap;
   eq(a.setGloryStacksV453Dev58(u,10),10,'Dark Seal glory cap');
   assert(u.ap>full,'glory did not raise amplified AP');
   const boosted=u.ap;
   eq(a.setGloryStacksV453Dev58(u,0),0,'glory reset');
   eq(u.ap,full,'AP not restored after removing 10 stacks');
   return {full,boosted,restored:u.ap};
  }],
  ['RIFTMAKER_LIANDRY_RAMP_EXCLUDES_DOT',({a,u,v})=>{
   buy(a,u,'riftmaker','liandrys_torment');
   v.hp=10000;v.maxHp=10000;
   const first=a.damage(v,70,u,'magic','spell');
   const time0={rift:u.riftmakerFightV453Dev69?.lastAt,liandry:u.liandryFightV453Dev69?.lastAt};
   a.gameTime+=4;
   a.damage(v,7,u,'magic','dot');
   eq(u.riftmakerFightV453Dev69?.lastAt,time0.rift,'dot refreshed Riftmaker ramp');
   eq(u.liandryFightV453Dev69?.lastAt,time0.liandry,'dot refreshed Liandry ramp');
   const later=a.damage(v,70,u,'magic','spell');
   assert(later>first,'combined source ramp did not progress');
   return {first,later,rampTime:time0};
  }],
  ['BLOODLETTER_ABYSSAL_TEAM_MAGIC',({a,u,v,team})=>{
   buy(a,u,'bloodletters_curse');
   const ally=champ(a,team,'SUP');ally.gold=50000;ally.items=[];
   buy(a,ally,'abyssal_mask');ally.x=v.x;ally.y=v.y;
   v.hp=10000;v.maxHp=10000;v.mr=50;
   const first=a.damage(v,80,u,'magic','spell');
   eq(v.bloodletterShredV453Dev69.stacks,1,'Bloodletter initial shred');
   const second=a.damage(v,80,u,'magic','spell');
   eq(v.bloodletterShredV453Dev69.stacks,2,'Bloodletter second shred');
   assert(second>first,'bloodletter MR stack not reflected in second hit');
   return {first,second,stacks:2,auraOwner:ally.id};
  }],
  ['KAENIC_BANSHEE_TWO_LAYER_DEFENSE',({a,u,v})=>{
   buy(a,v,'kaenic_rookern','banshees_veil');
   a.gameTime+=15;a.refreshKaenicShieldV453Dev69(v);
   const shield=v.statusEffectsV41.find(e=>e.key==='kaenic_v453_dev69'&&e.until>a.gameTime);
   assert(shield?.power>0,'Kaenic charge unavailable');
   const initial=shield.power;
   eq(a.damage(v,75,u,'magic','spell'),0,'Banshee missing');
   eq(shield.power,initial,'Banshee consumed Kaenic layer');
   a.damage(v,75,u,'magic','spell');
   assert(shield.power<initial,'second spell did not consume Kaenic');
   return {kaenicBefore:initial,kaenicAfter:shield.power};
  }]
 ];
 let serial=0;
 for(const [name,fn] of checks)for(const team of ['blue','red']){
  const seed=470700+serial++,a=new Arena(map,mask,{seed,mode:'pvp'});
  const u=champ(a,team),v=champ(a,pair(team));
  const result={id:'M45-B07-'+name+'-'+team,scenario:name,seed,team,status:'FAIL'};
  try{
   assert(u&&v,'missing champion');u.items=[];v.items=[];u.gold=50000;v.gold=50000;
   const before=checksumV40(a.snapshotV40());
   const observed=fn({a,u,v,team});
   result.status='PASS';result.before_checksum_v40=before;
   result.after_checksum_v40=checksumV40(a.snapshotV40());result.observed=observed;
  }catch(e){result.error=String(e);}
  cases.push(result);
 }
 const failures=cases.filter(x=>x.status!=='PASS');
 return {schema:'coachlol.m45.items.cross_items.b07.v1',
  summary:{planned:cases.length,passed:cases.length-failures.length,failed:failures.length,status:failures.length?'FAIL':'PASS'},
  scenarios:checks.map(x=>x[0]),cases};
}
