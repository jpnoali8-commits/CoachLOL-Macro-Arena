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
  }],
  ['QUICKSILVER_VS_RYLAI_SLOW',({a,u,v})=>{
   buy(a,u,'quicksilver_sash');buy(a,v,'rylais_crystal_scepter');
   a.damage(u,40,v,'magic','spell');
   assert(effects(a,u,'slow'),'Rylai did not slow defender');
   const receipt=a.activateItemV453Dev59(u.team,u.id,'quicksilver_sash');
   assert(receipt.ok,'QSS did not activate');
   assert(!effects(a,u,'slow'),'QSS did not remove slow');
   assert(!a.activateItemV453Dev59(u.team,u.id,'quicksilver_sash').ok,'QSS cooldown bypass');
   return {cleanse:receipt.ok,cooldownUntil:receipt.cooldownUntil};
  }],
  ['MERCURIAL_CLEANSE_AND_SPRINT',({a,u,v})=>{
   buy(a,u,'mercurial_scimitar');
   assert(a.applyEffectV41(u,'root',{source:v,duration:4}).ok,'root did not apply');
   assert(effects(a,u,'root'),'missing root');
   const receipt=a.activateItemV453Dev59(u.team,u.id,'mercurial_scimitar');
   assert(receipt.ok,'Mercurial failed');
   assert(!effects(a,u,'root'),'Mercurial root removal failed');
   assert(u.mercurialSprintUntilV453Dev59>a.gameTime,'Mercurial sprint absent');
   return {until:u.mercurialSprintUntilV453Dev59,cd:receipt.cooldownUntil};
  }],
  ['GUINSOO_NAVORI_ABILITY_COOLDOWN',({a,u,v})=>{
   buy(a,u,'guinsoos_rageblade','navori_flickerblade');
   u.skillCds={Q:10,W:12,E:0,R:100};v.maxHp=10000;v.hp=10000;
   a.attack(u,v,20,'attack');
   eq(u.skillCds.Q,8.5,'Navori Q -15 percent');
   eq(u.skillCds.W,10.2,'Navori W -15 percent');
   eq(u.skillCds.E,0,'Navori E inactive');
   eq(u.skillCds.R,100,'Navori cannot refund R');
   eq(u.guinsooHitCountV453Dev54,1,'Guinsoo first basic');
   return {cooldowns:{...u.skillCds},guinsooCount:u.guinsooHitCountV453Dev54};
  }],
  ['SCOUT_HEXTECH_DISTINCT_COOLDOWNS',({a,u,v})=>{
   buy(a,u,'scouts_slingshot','hextech_alternator');
   a.damage(v,40,u,'magic','spell');
   const scout=u.scoutBullseyeReadyAtV453Dev38,hex=u.hextechAlternatorReadyAtV453Dev56;
   assert(scout>a.gameTime&&hex>a.gameTime,'item cooldown not set');
   const hp=v.hp;a.damage(v,40,u,'magic','spell');
   eq(u.scoutBullseyeReadyAtV453Dev38,scout,'scout repeated');
   eq(u.hextechAlternatorReadyAtV453Dev56,hex,'hextech repeated');
   assert(v.hp<hp,'primary spell did not damage');
   return {scout,hex,postSecondHp:v.hp};
  }],
  ['WITS_NASHOR_TWO_MAGIC_ONHITS',({a,u,v})=>{
   buy(a,u,'wits_end','nashors_tooth');v.hp=10000;v.maxHp=10000;
   const before=v.hp;a.attack(u,v,20,'attack');const withItems=before-v.hp;
   const baseline=new Arena(map,mask,{seed:a.seed,mode:'pvp'});
   const attacker=champ(baseline,u.team),defender=champ(baseline,v.team);
   defender.hp=10000;defender.maxHp=10000;
   const plain=defender.hp-(baseline.attack(attacker,defender,20,'attack'),defender.hp);
   assert(withItems>plain,'mixed item procs not adding damage');
   return {withItems,plain};
  }],
  ['DARKSEAL_MEJAI_UPGRADE_KEEPS_GLORY',({a,u})=>{
   buy(a,u,'dark_seal');
   eq(a.setGloryStacksV453Dev58(u,8),8,'Dark Seal stack setup');
   const before=u.ap;
   buy(a,u,'mejais_soulstealer');
   eq(u.gloryStacksV453Dev58,8,'Mejai did not carry stacks');
   assert(!u.items.includes('dark_seal')&&u.items.includes('mejais_soulstealer'),'recipe not consumed');
   eq(a.setGloryStacksV453Dev58(u,10),10,'Mejai speed threshold');
   assert(u.percentMoveSpeed>0,'Mejai 10 stacks lacks movement bonus');
   return {before,after:u.ap,stacks:u.gloryStacksV453Dev58,speed:u.percentMoveSpeed};
  }],
  ['HEXDRINKER_VS_SHADOWFLAME_MAGIC_ONLY',({a,u,v})=>{
   buy(a,u,'shadowflame');buy(a,v,'hexdrinker');
   v.hp=v.maxHp*.31;const hp=v.hp;
   a.damage(v,95,u,'magic','spell');
   assert(v.hexdrinkerReadyAtV453Dev57>a.gameTime,'Hexdrinker magic lifeline did not fire');
   assert(v.hp>=hp-95,'Hexdrinker magic barrier failed');
   const afterMagic=v.hp;
   a.damage(v,30,u,'physical','basic');
   assert(v.hp<afterMagic,'physical hit incorrectly absorbed by magic-only barrier');
   return {hpBefore:hp,afterMagic,afterPhysical:v.hp,ready:v.hexdrinkerReadyAtV453Dev57};
  }],
  ['TEAR_CATALYST_MANA_EXCHANGE',({a,u,v})=>{
   buy(a,u,'tear_of_the_goddess');buy(a,v,'catalyst_of_aeons');
   v.mana=0;const beforeMana=u.tearManaBonusV453Dev56||0;
   a.damage(v,70,u,'magic','spell');
   assert(v.mana>0,'Catalyst did not return mana on actual champion damage');
   assert((u.tearManaBonusV453Dev56||0)>beforeMana,'Tear did not grant mana on spell hit');
   return {defenderMana:v.mana,tearBonus:u.tearManaBonusV453Dev56};
  }],
  ['BLACK_CLEAVER_SERYLDA_SPELL',({a,u,v})=>{
   buy(a,u,'black_cleaver','seryldas_grudge');
   v.hp=v.maxHp*.40;
   a.damage(v,40,u,'physical','spell');
   assert(effects(a,v,'slow'),'Serylda low HP spell did not slow');
   eq(v.cleaverDebuffV453Dev29?.stacks,1,'Cleaver spell stack missing');
   return {slow:true,armorDebuff:v.cleaverDebuffV453Dev29.stacks};
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
