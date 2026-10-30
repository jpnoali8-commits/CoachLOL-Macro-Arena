// M45 B02B-ITEMS B10 — snapshot/reconnect behavioral oracle over frozen legacy Arena.
// Pure JS fixture shared by V8 and Node; no production gameplay implementation.
export function runItemsSnapshotReplayB10({Arena,map,mask,checksumV40}){
 const cases=[];let seq=0;
 const ok=(x,msg)=>{if(!x)throw Error(msg)};
 const eq=(a,b,msg)=>ok(Object.is(a,b),msg+': '+JSON.stringify(a)+' != '+JSON.stringify(b));
 const get=(a,id)=>a.units.find(u=>u.id===id),op=t=>t==='blue'?'red':'blue';
 const cloned=x=>JSON.parse(JSON.stringify(x)),sum=a=>checksumV40(a.snapshotV40());
 const restore=a=>Arena.fromSnapshotV40(map,mask,cloned(a.snapshotV40()));
 const parity=(a,b,stage)=>{eq(sum(a),sum(b),stage+' checksum');eq(a.validateInvariants().length,0,stage+' invariants A');eq(b.validateInvariants().length,0,stage+' invariants B')};
 const buy=(a,u,...ids)=>{u.gold=50000;u.items=[];for(const id of ids)ok(a.buy(u.team,u.id,id),'buy '+id)};
 const ez=(a,t,{nashor=false,banshee=false,interceptor=false}={})=>{
  const u=get(a,t+'_ADC'),v=get(a,op(t)+'_MID');u.champ='Ezreal';u.skillRanks.Q=1;u.mana=500;
  buy(a,u,...(nashor?['nashors_tooth']:[]));v.hp=v.maxHp=10000;v.gold=50000;v.items=[];
  if(banshee)buy(a,v,'banshees_veil');u.x=.485;u.y=.5;v.x=.5;v.y=.5;a.minions=[];
  let m=null;if(interceptor){a.gameTime=80;a.spawnWaves();m=a.minions.find(x=>x.team===op(t));ok(m,'real minion absent');a.minions=[m];m.x=.492;m.y=.5;m.bodyX=.492;m.bodyY=.5;m.hp=Math.max(1000,m.hp)}
  return{u,v,m};
 };
 const nami=(a,t,{idol=false,spirit=false,liandry=false,banshee=false}={})=>{
  const u=get(a,t+'_SUP'),ally=get(a,t+'_ADC'),v=get(a,op(t)+'_MID');u.champ='Nami';u.klass='enchanter';u.skillRanks.W=1;u.mana=500;
  buy(a,u,...[...(idol?['forbidden_idol']:[]),...(liandry?['liandrys_torment']:[])]);
  if(spirit)buy(a,ally,'spirit_visage');v.gold=50000;v.items=[];if(banshee)buy(a,v,'banshees_veil');
  u.x=.495;u.y=.5;ally.x=.496;ally.y=.5;v.x=.5;v.y=.5;ally.hp=ally.maxHp-300;v.hp=v.maxHp;a.minions=[];
  return{u,ally,v};
 };
 const shot=(a,u,v)=>{const x=a.castEzrealMysticShotV453Dev42(u,v);ok(x.ok&&x.pending,'Ezreal Q launch');return x};
 const queue=(a,t,u,ally)=>ok(a.queueTargetedSkill(t,u.id,'W',ally.id).ok,'Nami W queue');
 const advance=(a,b,when,kind='projectile')=>{a.gameTime=when;b.gameTime=when;if(kind==='projectile'){a.advanceChampionProjectilesV453Dev42();b.advanceChampionProjectilesV453Dev42()}else{a.effectResolverV41().advanceTick();b.effectResolverV41().advanceTick()}parity(a,b,kind+'@'+when)};
 const defs=[
 ['EZREAL_PENDING_NASHOR', (a,t)=>{const {u,v}=ez(a,t,{nashor:true}),p=shot(a,u,v),b=restore(a);parity(a,b,'pending');eq(a.championProjectilesV453Dev42.length,1,'pending count');advance(a,b,1);ok(v.hp<10000,'Q hit');eq(a.championProjectileHistoryV453Dev42.at(-1).hitId,v.id,'Q target');return{projectile:p.projectileId,damage:10000-v.hp,cd:u.skillCds.Q}}],
 ['EZREAL_PARTIAL_SWEEP', (a,t)=>{const {u,v}=ez(a,t,{nashor:true});shot(a,u,v);a.gameTime=.025;a.advanceChampionProjectilesV453Dev42();const p=a.championProjectilesV453Dev42[0],progress=p?.traveledV453Dev43;ok(progress>0&&progress<150,'partial progress');const b=restore(a);parity(a,b,'partial');advance(a,b,1);ok(v.hp<10000,'pending impact');return{savedTravel:progress,hit:a.championProjectileHistoryV453Dev42.at(-1).hitId}}],
 ['EZREAL_MINION_INTERCEPT', (a,t)=>{const {u,v,m}=ez(a,t,{interceptor:true}),before=m.hp;shot(a,u,v);const b=restore(a);parity(a,b,'intercept checkpoint');advance(a,b,81);eq(a.championProjectileHistoryV453Dev42.at(-1).hitId,m.id,'minion hit');eq(v.hp,10000,'minion protection');return{minion:m.id,minionDamage:before-m.hp}}],
 ['EZREAL_BANSHEE_BLOCK', (a,t)=>{const {u,v}=ez(a,t,{nashor:true,banshee:true});shot(a,u,v);const b=restore(a);advance(a,b,1);eq(v.hp,10000,'annul health');ok(v.itemAnnulReadyAtV453Dev69Batch2>1,'annul charge');return{annulReady:v.itemAnnulReadyAtV453Dev69Batch2}}],
 ['EZREAL_POSITIONAL_BARRIER', (a,t)=>{const {u,v}=ez(a,t);shot(a,u,v);a.gameTime=.025;a.advanceChampionProjectilesV453Dev42();a.projectileBarriersV453Dev43=[{team:v.team,x:.492,y:.5,radius:55,until:2}];const b=restore(a);parity(a,b,'barrier checkpoint');advance(a,b,1);eq(a.championProjectileHistoryV453Dev42.at(-1).reason,'bloqueio_posicional','barrier reason');eq(v.hp,10000,'barrier health');return{reason:'bloqueio_posicional'}}],
 ['EZREAL_AFTER_HIT_NO_REPEAT', (a,t)=>{const {u,v}=ez(a,t,{nashor:true});shot(a,u,v);a.gameTime=1;a.advanceChampionProjectilesV453Dev42();const hp=v.hp,h=a.championProjectileHistoryV453Dev42.length,b=restore(a);parity(a,b,'hit checkpoint');advance(a,b,2);advance(a,b,3);eq(v.hp,hp,'duplicate damage');eq(a.championProjectileHistoryV453Dev42.length,h,'duplicate hit record');return{hp,impactRecords:h}}],
 ['NAMI_QUEUED_IDOL_VISAGE', (a,t)=>{const {u,ally,v}=nami(a,t,{idol:true,spirit:true});queue(a,t,u,ally);const b=restore(a);parity(a,b,'queued heal');const hp=ally.hp;a.resolveTargetedCasts();b.resolveTargetedCasts();parity(a,b,'resolved heal');ok(ally.hp>hp&&v.hp<v.maxHp,'Nami bounced');return{healed:ally.hp-hp,enemyDamage:v.maxHp-v.hp}}],
 ['NAMI_LIANDRY_BOUNCE_TICKS', (a,t)=>{const {u,ally,v}=nami(a,t,{liandry:true});queue(a,t,u,ally);const b=restore(a);parity(a,b,'queued Liandry');a.resolveTargetedCasts();b.resolveTargetedCasts();parity(a,b,'bounce and dot');ok(a.effectResolverV41().has(v,'dot'),'missing source burn');const hp=v.hp;for(const time of [1,2,3,4])advance(a,b,time,'effect');ok(v.hp<hp,'DoT missing damage');return{burnDamage:hp-v.hp,activeAt4:a.effectResolverV41().has(v,'dot')}}],
 ['NAMI_SAME_SECOND_DOT_NO_REPEAT', (a,t)=>{const {u,ally,v}=nami(a,t,{liandry:true});queue(a,t,u,ally);a.resolveTargetedCasts();ok(a.effectResolverV41().has(v,'dot'),'Liandry absent');a.gameTime=1;a.effectResolverV41().advanceTick();const hp=v.hp,b=restore(a);parity(a,b,'after first tick');a.effectResolverV41().advanceTick();b.effectResolverV41().advanceTick();parity(a,b,'repeat same clock');eq(v.hp,hp,'duplicate same-second tick');advance(a,b,2,'effect');ok(v.hp<hp,'second tick absent');return{afterFirst:hp,afterSecond:v.hp}}],
 ['NAMI_BANSHEE_REJECTS_BURN', (a,t)=>{const {u,ally,v}=nami(a,t,{liandry:true,banshee:true});queue(a,t,u,ally);const b=restore(a);a.resolveTargetedCasts();b.resolveTargetedCasts();parity(a,b,'blocked W');eq(v.hp,v.maxHp,'W blocked damage');ok(!a.effectResolverV41().has(v,'dot'),'blocked W created burn');ok(v.itemAnnulReadyAtV453Dev69Batch2>0,'annul missing');return{annulReady:v.itemAnnulReadyAtV453Dev69Batch2}}],
 ['BANSHEE_RECHARGE_TIMELINE', (a,t)=>{const {u,v}=ez(a,t,{banshee:true});shot(a,u,v);a.gameTime=1;a.advanceChampionProjectilesV453Dev42();const ready=v.itemAnnulReadyAtV453Dev69Batch2;ok(ready>1,'no cooldown');const b=restore(a);parity(a,b,'cooldown saved');a.gameTime=ready-.01;b.gameTime=ready-.01;eq(a.effectResolverV41().has(v,'spell_shield'),false,'early charge');eq(b.effectResolverV41().has(get(b,v.id),'spell_shield'),false,'early restore charge');parity(a,b,'cooldown elapsed not ready');a.gameTime=ready;b.gameTime=ready;eq(a.effectResolverV41().has(v,'spell_shield'),true,'recharge failed');eq(b.effectResolverV41().has(get(b,v.id),'spell_shield'),true,'restored recharge failed');parity(a,b,'recharged');return{ready,restored:true}}],
 ['PHANTOM_RFC_PERSIST_STACKS', (a,t)=>{const u=get(a,t+'_ADC');buy(a,u,'phantom_dancer','rapid_firecannon');u.x=.49;u.y=.5;u.explicitOrder=true;a.minions=[];a.gameTime=80;a.spawnWaves();const m=a.minions.find(x=>x.team===op(t));ok(m,'spawned minion');a.minions=[m];m.x=.5;m.y=.5;m.bodyX=.5;m.bodyY=.5;const dest={x:.51,y:.5};const traveled=a.moveAlong(u,{path:[dest],point:dest,action:'move'},300);ok(traveled>290&&u.energizeStacksV453Dev38>0,'Phantom/RFC setup');const b=restore(a);parity(a,b,'stored RFC');const next={x:.515,y:.5};a.gameTime=81;b.gameTime=81;a.moveAlong(u,{path:[next],point:next,action:'move'},70);b.moveAlong(get(b,u.id),{path:[next],point:next,action:'move'},70);parity(a,b,'continued RFC');return{traveled,charge:u.energizeStacksV453Dev38}}]
 ];
 for(const [kind,fn] of defs)for(const team of ['blue','red']){
  const seed=451000+seq++,a=new Arena(map,mask,{seed,mode:'pvp'}),entry={case_id:'M45-B10-'+kind+'-'+team,team,kind,seed,status:'FAIL'};
  try{entry.before_checksum_v40=sum(a);entry.observed=fn(a,team);entry.after_checksum_v40=sum(a);entry.status='PASS'}catch(e){entry.error=String(e)}
  cases.push(entry);
 }
 const failures=cases.filter(c=>c.status!=='PASS');
 return{schema:'coachlol.m45.items.snapshot_replay.b10.v1',summary:{scenarios:defs.length,planned:cases.length,passed:cases.length-failures.length,failed:failures.length,status:failures.length?'FAIL':'PASS'},cases};
}
