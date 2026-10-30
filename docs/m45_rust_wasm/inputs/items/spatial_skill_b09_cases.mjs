// M45 B02B-ITEMS B09 — actual wave collision + authored champion skill resolution.
// Pure JS source fixture: same code runs via Node ESM and isolated V8. Not gameplay.
// Champion identity is changed only in isolated fixture to enter legacy Ezreal Q
// for both seats; Nami uses native blue SUP and a fixture-adjusted red SUP.
export function runSpatialSkillsB09({Arena,map,mask,checksumV40}){
 const cases=[];
 const ok=(v,label)=>{if(!v)throw Error(label);};
 const equal=(a,b,label)=>{if(!Object.is(a,b))throw Error(label+': '+JSON.stringify(a)+' vs '+JSON.stringify(b));};
 const nearest=(a,t,role='ADC')=>a.units.find(x=>x.id===t+'_'+role);
 const other=t=>t==='blue'?'red':'blue';
 const buy=(a,u,...ids)=>{u.gold=50000;u.items=[];for(const id of ids)ok(a.buy(u.team,u.id,id),'purchase '+id);};
 const setups={
  minion(a,team,kind='opposing'){
   a.gameTime=80;
   a.spawnWaves();ok(a.minions.length>0,'wave generator did not produce minions');
   const minion=a.minions.find(m=>m.team===(kind==='friendly'?team:other(team)));
   ok(minion,'missing actual '+kind+' minion');
   a.minions=[minion];
   minion.bodyX=.50;minion.bodyY=.50;minion.x=.50;minion.y=.50;minion.spawnAt=80;
   const u=nearest(a,team);u.items=[];u.gold=50000;u.explicitOrder=true;
   return{u,minion};
  },
  ezreal(a,team,{nashor=false,banshee=false,interceptor=false}={}){
   const u=nearest(a,team),v=nearest(a,other(team),'MID');
   // Fixture only: the original default lobby uses Jinx/Caitlyn ADCs.
   u.champ='Ezreal';u.skillRanks.Q=1;u.mana=500;
   u.items=[];u.gold=50000;v.items=[];v.gold=50000;
   if(nashor)buy(a,u,'nashors_tooth');
   if(banshee)buy(a,v,'banshees_veil');
   u.x=.485;u.y=.5;v.x=.50;v.y=.5;v.maxHp=10000;v.hp=10000;
   a.minions=[];
   let minion=null;
   if(interceptor){
    a.gameTime=80;a.spawnWaves();
    minion=a.minions.find(m=>m.team===other(team));
    ok(minion,'no generated enemy minion for projectile interception');
    a.minions=[minion];minion.x=.492;minion.y=.5;minion.bodyX=.492;minion.bodyY=.5;minion.hp=Math.max(1000,minion.hp);
   }
   return{u,v,minion};
  },
  nami(a,team,{idol=false,spirit=false,liandry=false,banshee=false}={}){
   const u=nearest(a,team,'SUP'),v=nearest(a,other(team),'MID'),ally=nearest(a,team,'ADC');
   u.champ='Nami';u.klass='enchanter';u.skillRanks.W=1;u.mana=500;
   u.items=[];u.gold=50000;v.items=[];v.gold=50000;
   if(idol)buy(a,u,'forbidden_idol');
   if(liandry)buy(a,u,'liandrys_torment');
   if(banshee)buy(a,v,'banshees_veil');
   if(spirit){ally.items=[];ally.gold=50000;buy(a,ally,'spirit_visage');}
   u.x=.495;u.y=.5;ally.x=.496;ally.y=.5;v.x=.500;v.y=.5;
   ally.hp=ally.maxHp-300;v.hp=v.maxHp;a.minions=[];
   return{u,v,ally};
  }
 };
 const spatial=[
 ['REAL_WAVE_BLOCKS_NORMAL',({a,team})=>{
  const {u,minion}=setups.minion(a,team);
  u.x=.49;u.y=.50;
  const destination={x:.51,y:.50},collision=a.minionBodyCollisionAlongV453Dev52(u,destination);
  ok(collision?.minion?.id===minion.id,'real wave collision absent');
  const stage={path:[destination],point:destination,action:'move'};
  const traveled=a.moveAlong(u,stage,300);
  equal(traveled,0,'walked through minion without Phantom Dancer');
  equal(u.x,.49,'unit changed blocked position');
  return{minionId:minion.id,collision:true,traveled,after:{x:u.x,y:u.y}};
 }],
 ['REAL_WAVE_PHANTOM_PASSES',({a,team})=>{
  const {u,minion}=setups.minion(a,team);
  buy(a,u,'phantom_dancer');u.x=.49;u.y=.50;
  const destination={x:.51,y:.50},collision=a.minionBodyCollisionAlongV453Dev52(u,destination);
  ok(collision?.minion?.id===minion.id,'source geometry missing collision');
  const traveled=a.moveAlong(u,{path:[destination],point:destination,action:'move'},300);
  ok(traveled>290&&Math.abs(u.x-.51)<1e-9&&u.y===.5,'Phantom Dancer failed unit ghosting');
  return{minionId:minion.id,traveled,after:{x:u.x,y:u.y}};
 }],
 ['DEAD_WAVE_DOES_NOT_BLOCK',({a,team})=>{
  const {u,minion}=setups.minion(a,team);
  u.x=.49;u.y=.50;minion.hp=0;
  const destination={x:.51,y:.50};
  ok(!a.minionBodyCollisionAlongV453Dev52(u,destination),'dead minion collision persisted');
  const traveled=a.moveAlong(u,{path:[destination],point:destination,action:'move'},300);
  ok(traveled>290&&u.x===.51,'dead minion blocked movement');
  return{deadMinionId:minion.id,traveled};
 }],
 ['FRIENDLY_WAVE_BLOCKS_NORMAL',({a,team})=>{
  const {u,minion}=setups.minion(a,team,'friendly');
  u.x=.49;u.y=.50;
  const destination={x:.51,y:.50};
  ok(a.minionBodyCollisionAlongV453Dev52(u,destination)?.minion?.id===minion.id,'friendly collision absent');
  const traveled=a.moveAlong(u,{path:[destination],point:destination,action:'move'},300);
  equal(traveled,0,'walked through friendly minion without item');
  return{minionId:minion.id,traveled};
 }],
 ['PHANTOM_RESPECTS_WORLD_WALL',({a,team})=>{
  const u=nearest(a,team);
  buy(a,u,'phantom_dancer');
  const start={x:.332,y:.332},destination={x:.337,y:.332};
  ok(a.walkable(start.x,start.y),'start not open');
  ok(!a.walkable(destination.x,destination.y),'target wall not blocked');
  u.x=start.x;u.y=start.y;u.explicitOrder=true;
  const traveled=a.moveAlong(u,{path:[destination],point:destination,action:'move'},75);
  equal(traveled,0,'Phantom phased through terrain');
  ok(a.walkable(u.x,u.y),'Phantom exited legal world geometry');
  return{traveled,start,destination};
 }],
 ['PHANTOM_RFC_WALK_CHARGES',({a,team})=>{
  const {u}=setups.minion(a,team);
  buy(a,u,'phantom_dancer','rapid_firecannon');
  u.x=.49;u.y=.50;const destination={x:.51,y:.50};
  const moved=a.moveAlong(u,{path:[destination],point:destination,action:'move'},300);
  ok(moved>290,'Phantom collision not bypassed');
  const actual=u.energizeStacksV453Dev38;
  ok(actual>10&&actual<100,'legitimate walking should increment Rapid Fire charge');
  return{moved,energizeStacks:actual};
 }]
 ];
 const skill=[
 ['EZREAL_Q_ACTUAL_PROJECTILE_NASHOR',({a,team})=>{
  const {u,v}=setups.ezreal(a,team,{nashor:true});
  const mana=u.mana;
  const cast=a.castEzrealMysticShotV453Dev42(u,v);
  ok(cast.ok&&cast.pending,'Ezreal Q did not schedule projectile');
  equal(v.hp,10000,'Q dealt premature instant damage');
  const castCooldown=u.skillCds.Q;
  a.gameTime=1;a.advanceChampionProjectilesV453Dev42();
  const history=a.championProjectileHistoryV453Dev42.at(-1);
  equal(history.hitId,v.id,'Ezreal Q did not hit intended opponent');
  ok(v.hp<10000,'on-hit projectile failed to damage');
  ok(u.skillCds.Q<castCooldown,'Q hit cooldown refund did not occur');
  ok(u.mana<mana,'Q cast did not spend mana');
  const procs=(a.effectJournalV41||[]).filter(e=>JSON.stringify(e).includes('item_nashors'));
  return{projectileId:cast.projectileId,hitId:history.hitId,damage:10000-v.hp,procJournalCount:procs.length,
   manaSpent:mana-u.mana,cdCast:castCooldown,cdAfter:u.skillCds.Q};
 }],
 ['EZREAL_Q_BANSHEE_BLOCKS_ONHIT',({a,team})=>{
  const {u,v}=setups.ezreal(a,team,{nashor:true,banshee:true});
  const cast=a.castEzrealMysticShotV453Dev42(u,v);ok(cast.ok,'Q cast with Banshee');
  a.gameTime=1;a.advanceChampionProjectilesV453Dev42();
  equal(v.hp,10000,'Banshee failed to block Q and nested Nashor on-hit');
  ok((v.itemAnnulReadyAtV453Dev69Batch2||0)>a.gameTime,'Banshee cooldown not set');
  return{hitId:a.championProjectileHistoryV453Dev42.at(-1)?.hitId,blocked:true,annulReady:v.itemAnnulReadyAtV453Dev69Batch2};
 }],
 ['EZREAL_Q_REAL_MINION_INTERCEPTS',({a,team})=>{
  const {u,v,minion}=setups.ezreal(a,team,{interceptor:true});
  const enemyInitial=v.hp,minionInitial=minion.hp;
  const cast=a.castEzrealMysticShotV453Dev42(u,v);ok(cast.ok,'Q cast at enemy');
  a.gameTime=81;a.advanceChampionProjectilesV453Dev42();
  const hit=a.championProjectileHistoryV453Dev42.at(-1);
  equal(hit.hitId,minion.id,'real minion did not intercept Q');
  equal(v.hp,enemyInitial,'projectile passed through minion to champion');
  ok(minion.hp<minionInitial,'interceptor did not take damage');
  return{interceptor:minion.id,hitId:hit.hitId,minionLostHp:minionInitial-minion.hp,championLostHp:enemyInitial-v.hp};
 }],
 ['NAMI_W_IDOL_HEALS_ALLY_MORE',({a,team})=>{
  const baseline=new Arena(map,mask,{seed:a.seed,mode:'pvp'});
  const first=setups.nami(baseline,team),withIdol=setups.nami(a,team,{idol:true});
  const beforeNormal=first.ally.hp,beforeIdol=withIdol.ally.hp;
  ok(baseline.queueTargetedSkill(team,first.u.id,'W',first.ally.id).ok,'normal Nami queue');
  ok(a.queueTargetedSkill(team,withIdol.u.id,'W',withIdol.ally.id).ok,'Idol Nami queue');
  baseline.resolveTargetedCasts();a.resolveTargetedCasts();
  const normal=first.ally.hp-beforeNormal,boosted=withIdol.ally.hp-beforeIdol;
  ok(normal>0&&boosted>normal,'actual Nami W did not amplify healing via Idol');
  ok(!withIdol.u.pendingTargetedCast,'targeted Nami W not resolved');
  return{normal,boosted,enemyHitHpLoss:withIdol.v.maxHp-withIdol.v.hp,
   castJournal:a.actionJournalV40.at(-1)?.source};
 }],
 ['NAMI_W_SPIRIT_VISAGE_RECIPIENT',({a,team})=>{
  const baseline=new Arena(map,mask,{seed:a.seed,mode:'pvp'});
  const first=setups.nami(baseline,team),enhanced=setups.nami(a,team,{spirit:true});
  const beforeNormal=first.ally.hp,beforeEnhanced=enhanced.ally.hp;
  ok(baseline.queueTargetedSkill(team,first.u.id,'W',first.ally.id).ok,'normal Nami queue');
  ok(a.queueTargetedSkill(team,enhanced.u.id,'W',enhanced.ally.id).ok,'Visage target Nami queue');
  baseline.resolveTargetedCasts();a.resolveTargetedCasts();
  const normal=first.ally.hp-beforeNormal,boosted=enhanced.ally.hp-beforeEnhanced;
  ok(boosted>normal,'spirit visage did not multiply actual Nami W heal on ally');
  return{normal,boosted,recipient:enhanced.ally.id};
 }],
 ['NAMI_W_LIANDRY_BURNS_ON_BOUNCE',({a,team})=>{
  const {u,v,ally}=setups.nami(a,team,{liandry:true});
  const before=v.hp;ok(a.queueTargetedSkill(team,u.id,'W',ally.id).ok,'Nami queue');
  a.resolveTargetedCasts();
  ok(v.hp<before,'Nami W enemy bounce did not hit');
  ok(a.effectResolverV41().has(v,'dot'),'Liandry was not applied by real enemy bounce');
  const burn=(v.statusEffectsV41||[]).find(e=>e.key==='liandry_'+u.id);
  return{enemyDamage:before-v.hp,sourceItem:burn?.key,until:burn?.until};
 }],
 ['NAMI_W_BANSHEE_BLOCKS_BOUNCE_AND_BURN',({a,team})=>{
  const {u,v,ally}=setups.nami(a,team,{liandry:true,banshee:true});
  const before=v.hp;ok(a.queueTargetedSkill(team,u.id,'W',ally.id).ok,'Nami queue');
  a.resolveTargetedCasts();
  equal(v.hp,before,'Banshee failed to block actual Nami W enemy bounce');
  ok(!a.effectResolverV41().has(v,'dot'),'blocked Nami W spawned Liandry burn');
  ok((v.itemAnnulReadyAtV453Dev69Batch2||0)>a.gameTime,'Banshee annul not consumed');
  return{blocked:true,enemyLost:before-v.hp,annulReady:v.itemAnnulReadyAtV453Dev69Batch2};
 }]
 ];
 let index=0;
 function execute(category,scenarios){for(const [name,fn] of scenarios)for(const team of ['blue','red']){
  const seed=490900+index++,a=new Arena(map,mask,{seed,mode:'pvp'});
  const c={case_id:'M45-B09-'+name+'-'+team,category,team,seed,status:'FAIL'};
  try{c.before_checksum_v40=checksumV40(a.snapshotV40());c.observed=fn({a,team});c.after_checksum_v40=checksumV40(a.snapshotV40());c.status='PASS';}
  catch(e){c.error=String(e);}
  cases.push(c);
 }}
 execute('WAVE_COLLISION',spatial);
 execute('REAL_CHAMPION_SKILL',skill);
 const failed=cases.filter(c=>c.status!=='PASS');
 return{schema:'coachlol.m45.items.spatial_skills.b09.v1',
  summary:{planned:cases.length,passed:cases.length-failed.length,failed:failed.length,spatial_cases:spatial.length*2,
   actual_skill_cases:skill.length*2,scenarios:spatial.length+skill.length,
   status:failed.length?'FAIL':'PASS',scope:'Actual source engine Ezreal Q projectile and Nami W targeting/bounce, with fixture champion identity on non-default red/ADC slots; not whole kit parity'},
  cases};
}
