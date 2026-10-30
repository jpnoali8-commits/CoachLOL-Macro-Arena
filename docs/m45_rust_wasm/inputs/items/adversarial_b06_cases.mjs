// CoachLOL M45 B02B-ITEMS B06: pure JS adversarial cases used by BOTH
// the Node ESM oracle and isolated V8 source-runtime audit.
// No legacy game rules change. No Node imports, no fake golden outputs.
export function runAdversarialItemsB06({Arena,Gateway,map,mask,checksumV40}){
 const cases=[],counts={};
 const eq=(a,b,label)=>{if(!Object.is(a,b))throw Error(label+': '+JSON.stringify(a)+' != '+JSON.stringify(b));};
 const ok=(x,label)=>{if(!x)throw Error(label);};
 const same=(a,b,label)=>eq(JSON.stringify(a),JSON.stringify(b),label);
 const money=u=>({gold:u.gold,items:[...u.items]});
 const opponent=team=>team==='blue'?'red':'blue';
 let seq=0;
 const seats=[
  {seatId:'p1',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
  {seatId:'p2',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}
 ];
 function scenario(label,fn,{type='economy',teams=['blue','red']}={}){
  for(const team of teams){
   const seed=460600+seq*2+(team==='red'?1:0);seq++;
   const a=new Arena(map,mask,{seed,mode:'pvp'});
   const u=a.units.find(v=>v.id===team+'_MID');
   const enemy=a.units.find(v=>v.id===opponent(team)+'_MID');
   const source=a.map.objects.find(v=>v.id===team+'_spawn_shop');
   const c={id:'M45-B06-'+label+'-'+team,category:type,team,seed,status:'FAIL'};
   try{
    ok(u&&enemy&&source,'missing actor/source');
    u.gold=50000;u.items=[];u.x=source.x;u.y=source.y;
    const pre=checksumV40(a.snapshotV40());
    const facts=fn({a,u,enemy,team,source,Gateway,seats,eq,ok,same,money,opponent,checksumV40});
    c.status='PASS';c.observed={...facts,pre_checksum_v40:pre,post_checksum_v40:checksumV40(a.snapshotV40())};
   }catch(e){c.error=String(e);}
   cases.push(c);counts[c.status]=(counts[c.status]||0)+1;
  }
 }
 scenario('NO_FUNDS',({a,u,team,money,same,ok})=>{
  u.gold=0;const prior=money(u);ok(!a.canBuy(team,u.id,'boots').ok,'free boots');
  ok(!a.buy(team,u.id,'boots'),'buy despite 0 funds');same(money(u),prior,'funds mutation');return {denied:true};
 });
 scenario('EXACT_FUNDS',({a,u,team,eq,ok})=>{
  u.gold=300;ok(a.buy(team,u.id,'boots'),'exact money buy');eq(u.gold,0,'zero balance');
  eq(u.items[0],'boots','inventory');return {gold:u.gold};
 });
 scenario('INVALID_ITEM_ID',({a,u,team,money,same,ok})=>{
  const before=money(u);ok(!a.canBuy(team,u.id,'__unknown__').ok,'unknown allowed');
  ok(!a.buy(team,u.id,'__unknown__'),'unknown purchased');same(money(u),before,'unknown mutated');return {denied:true};
 });
 scenario('FOREIGN_BUY_DENIED',({a,u,team,opponent,money,same,ok})=>{
  const before=money(u);ok(!a.buy(opponent(team),u.id,'boots'),'foreign buy');
  same(money(u),before,'foreign buy mutated');return {denied:true};
 });
 scenario('FOREIGN_SELL_DENIED',({a,u,team,opponent,money,same,ok})=>{
  ok(a.buy(team,u.id,'boots'),'setup');const prior=money(u);
  ok(!a.sellItemV43(opponent(team),u.id,0).ok,'foreign sell');
  same(money(u),prior,'foreign sell mutated');return {denied:true};
 });
 scenario('FOREIGN_UNDO_DENIED',({a,u,team,opponent,money,same,ok})=>{
  ok(a.buy(team,u.id,'boots'),'setup');const prior=money(u);
  ok(!a.undoShopV453Dev61(opponent(team),u.id).ok,'foreign undo');
  same(money(u),prior,'foreign undo mutated');return {denied:true};
 });
 scenario('SELL_BAD_INDEX',({a,u,team,money,same,ok})=>{
  ok(a.buy(team,u.id,'boots'),'setup');const prior=money(u);
  for(const i of [-1,1,2.5,'0',NaN])ok(!a.sellItemV43(team,u.id,i).ok,'bad index '+i);
  same(money(u),prior,'bad index mutated');return {tested:5};
 });
 scenario('SELL_ONCE_ONLY',({a,u,team,money,same,ok,eq})=>{
  ok(a.buy(team,u.id,'boots'),'setup');const r=a.sellItemV43(team,u.id,0);
  ok(r.ok,'sale');eq(r.refund,210,'refund');const post=money(u);
  ok(!a.sellItemV43(team,u.id,0).ok,'second sale');
  same(money(u),post,'second sale changed gold');return {refund:r.refund};
 });
 scenario('SELL_UNDO_ATOMIC',({a,u,team,money,same,ok})=>{
  ok(a.buy(team,u.id,'boots'),'setup');const prior=money(u);
  ok(a.sellItemV43(team,u.id,0).ok,'sale');
  ok(a.undoShopV453Dev61(team,u.id).ok,'undo sale');
  same(money(u),prior,'sale undo mutated');return {restored:true};
 });
 scenario('DUPLICATE_LEGENDARY_DENIED',({a,u,team,money,same,ok})=>{
  ok(a.buy(team,u.id,'rabadon'),'setup legendary');
  const prior=money(u);ok(!a.canBuy(team,u.id,'rabadon').ok,'duplicate allowed');
  ok(!a.buy(team,u.id,'rabadon'),'duplicate purchase');
  same(money(u),prior,'duplicate mutated');return {denied:true};
 });
 scenario('LIFELINE_EXCLUSIVE',({a,u,team,money,same,ok})=>{
  ok(a.buy(team,u.id,'maw_of_malmortius'),'maw');
  const prior=money(u);ok(!a.canBuy(team,u.id,'immortal_shieldbow').ok,'lifeline pair allowed');
  same(money(u),prior,'lifeline altered');return {denied:true};
 });
 scenario('ANNUL_EXCLUSIVE',({a,u,team,ok})=>{
  ok(a.buy(team,u.id,'edge_of_night'),'edge');
  ok(!a.canBuy(team,u.id,'banshees_veil').ok,'second annul allowed');return {denied:true};
 });
 scenario('FULL_SLOTS_DENIED',({a,u,team,money,same,ok,eq})=>{
  for(let i=0;i<6;i++)ok(a.buy(team,u.id,'dagger'),'fill '+i);
  eq(u.items.length,6,'slots');const prior=money(u);
  ok(!a.canBuy(team,u.id,'long_sword').ok,'seven slots allowed');
  ok(!a.buy(team,u.id,'long_sword'),'buy despite full');
  same(money(u),prior,'full slot mutated');return {slots:6};
 });
 scenario('COMPONENT_USED_ONCE',({a,u,team,ok,eq})=>{
  ok(a.buy(team,u.id,'long_sword'),'part1');
  ok(a.buy(team,u.id,'long_sword'),'part2');
  const before=u.gold;
  const price=a.itemPurchaseCost(u,'serrated_dirk');
  ok(a.buy(team,u.id,'serrated_dirk'),'upgrade');
  eq(u.gold,before-price,'upgrade gold');
  eq(u.items.filter(x=>x==='long_sword').length,0,'component not consumed');
  eq(u.items.filter(x=>x==='serrated_dirk').length,1,'upgrade duplicated');
  return {upgradePrice:price,inventory:[...u.items]};
 });
 scenario('COMPONENTS_UPGRADE_WHEN_FULL',({a,u,team,ok,eq})=>{
  for(let i=0;i<6;i++)ok(a.buy(team,u.id,i<2?'long_sword':'dagger'),'six parts');
  eq(u.items.length,6,'setup slots');
  ok(a.canBuy(team,u.id,'serrated_dirk').ok,'upgrade incorrectly blocked');
  ok(a.buy(team,u.id,'serrated_dirk'),'recipe full slots');
  eq(u.items.length,5,'expected 4 dagger + 1 dirk');
  return {inventory:[...u.items]};
 });
 scenario('UNDO_AFTER_INCOME_DENIED',({a,u,team,ok})=>{
  ok(a.buy(team,u.id,'boots'),'buy');a.creditGoldV452d4Dev7(u,45,'test_reward');
  ok(!a.canUndoShopV453Dev61(team,u.id).ok,'undo after income');
  return {balance:u.gold};
 });
 scenario('UNDO_AFTER_TIME_DENIED',({a,u,team,ok})=>{
  ok(a.buy(team,u.id,'boots'),'buy');a.gameTime++;
  ok(!a.canUndoShopV453Dev61(team,u.id).ok,'undo after game tick');
  return {time:a.gameTime};
 });
 scenario('UNDO_AFTER_HP_MUTATION_DENIED',({a,u,team,ok})=>{
  ok(a.buy(team,u.id,'boots'),'buy');u.hp=Math.max(1,u.hp-10);
  ok(!a.canUndoShopV453Dev61(team,u.id).ok,'undo after HP changed');
  return {hp:u.hp};
 });
 scenario('UNDO_AFTER_READY_DENIED',({a,u,team,ok})=>{
  ok(a.buy(team,u.id,'boots'),'buy');a.teams[team].ready=true;
  ok(!a.canUndoShopV453Dev61(team,u.id).ok,'undo despite ready');return {ready:true};
 });
 scenario('UNDO_DEPARTURE_IRREVERSIBLE',({a,u,team,source,ok})=>{
  ok(a.buy(team,u.id,'boots'),'buy');
  u.x=team==='blue'?.5:.5;u.y=.5;
  ok(a.invalidateShopUndoOnDepartureV453Dev61(u),'not invalidated');
  u.x=source.x;u.y=source.y;
  ok(!a.canUndoShopV453Dev61(team,u.id).ok,'undo revived by return');return {revoked:u.shopUndoRevokedV453Dev61};
 });
 scenario('UNDO_NEW_VISIT',({a,u,team,source,ok,eq})=>{
  ok(a.buy(team,u.id,'boots'),'buy');
  u.x=.5;u.y=.5;ok(a.invalidateShopUndoOnDepartureV453Dev61(u),'departure');
  u.x=source.x;u.y=source.y;
  ok(a.buy(team,u.id,'long_sword'),'new visit');
  ok(a.undoShopV453Dev61(team,u.id).ok,'new undo');
  eq(u.items.filter(x=>x==='boots').length,1,'old item lost');
  eq(u.items.filter(x=>x==='long_sword').length,0,'new item retained');
  return {inventory:[...u.items]};
 });
 scenario('ROLE_LOCK_SUPPORT',({a,u,team,ok})=>{
  ok(!a.canBuy(team,u.id,'support_atlas').ok,'MID bought support item');
  const sup=a.units.find(x=>x.id===team+'_SUP');sup.gold=50000;sup.items=[];
  ok(a.canBuy(team,sup.id,'support_atlas').ok,'SUP cannot buy Atlas');
  return {midDenied:true,supAllowed:true};
 });
 scenario('JUNGLE_FIRST_PET',({a,team,ok,eq})=>{
  const j=a.units.find(x=>x.id===team+'_JG');j.items=[];j.gold=50000;j.junglePet=null;
  ok(!a.canBuy(team,j.id,'boots').ok,'JG bypassed pet');
  ok(a.buy(team,j.id,'jungle_gustwalker'),'pet');
  eq(j.junglePet,'gustwalker','pet state');
  ok(a.canBuy(team,j.id,'boots').ok,'boots after pet');return {pet:j.junglePet};
 });
 scenario('TRINKET_NOT_BUYABLE',({a,u,team,ok})=>{
  ok(!a.canBuy(team,u.id,'trinket_oracle').ok,'trinket buy');
  ok(!a.queuePurchase(team,u.id,'trinket_oracle').ok,'trinket queue');
  return {denied:true};
 });
 scenario('QUEUE_REMOTE_VISIT',({a,u,team,source,ok,eq})=>{
  u.x=.5;u.y=.5;const initial=u.gold;
  const r=a.queuePurchase(team,u.id,'long_sword');ok(r.ok,'queue outside fountain');
  ok(!a.canBuy(team,u.id,'long_sword').ok,'immediate buy outside fountain');
  eq(u.gold,initial,'queued debit');
  u.x=source.x;u.y=source.y;
  const bought=a.processPurchaseQueues(team);
  eq(bought.length,1,'planned did not buy');
  eq(u.items[0],'long_sword','queued missing');
  eq((u.purchaseQueue||[]).length,0,'queue not cleared');
  return {purchased:bought,gold:u.gold};
 });
 scenario('QUEUE_CANCEL',({a,u,team,ok,eq})=>{
  ok(a.queuePurchase(team,u.id,'long_sword').ok,'queue');
  ok(a.cancelQueuedPurchase(team,u.id,0),'cancel');
  eq(u.purchaseQueue.length,0,'cancelled item remains');
  eq(a.processPurchaseQueues(team).length,0,'cancelled order executed');
  return {cancelled:true};
 });
 scenario('QUEUE_CAP',({a,u,team,ok,eq})=>{
  for(let i=0;i<12;i++)ok(a.queuePurchase(team,u.id,'long_sword').ok,'queue '+i);
  eq(u.purchaseQueue.length,12,'queue length');
  ok(!a.queuePurchase(team,u.id,'long_sword').ok,'13th accepted');
  eq(u.purchaseQueue.length,12,'overflow mutated queue');
  return {queued:12};
 });
 scenario('GATEWAY_REPLAY_IDEMPOTENT',({a,u,team,Gateway,seats,ok,eq,checksumV40})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  const cmd={sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}};
  const first=gw.submit(seat,cmd);ok(first.ok,'first');
  const prior={gold:u.gold,items:[...u.items],hash:checksumV40(a.snapshotV40())};
  const retry=gw.submit(seat,cmd);ok(retry.ok,'retry');
  eq(retry.revision,first.revision,'duplicate revision');
  eq(u.gold,prior.gold,'double debit');eq(checksumV40(a.snapshotV40()),prior.hash,'retry mutated state');
  return {first,retry,gold:u.gold};
 },{type:'gateway'});
 scenario('GATEWAY_SEQUENCE_CONFLICT',({a,u,team,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  ok(gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}}).ok,'first');
  const before=u.gold;
  const clash=gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'long_sword'}});
  ok(!clash.ok,'same-seq changed payload');eq(u.gold,before,'conflict gold');return {reason:clash.reason};
 },{type:'gateway'});
 scenario('GATEWAY_SEQUENCE_GAP',({a,u,team,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  const bad=gw.submit(seat,{sequence:2,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(!bad.ok,'gap accepted');eq(u.gold,50000,'gap charged');
  const good=gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(good.ok,'valid seq blocked after rejected gap');return {bad,good};
 },{type:'gateway'});
 scenario('GATEWAY_REJECTED_PAYLOAD_RETRY',({a,u,team,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  const bad=gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots',gold:999999}});
  ok(!bad.ok,'extra gold accepted');eq(u.gold,50000,'bad payload charged');
  const good=gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(good.ok,'rejected sequence consumed');return {bad,good};
 },{type:'gateway'});
 scenario('GATEWAY_FOREIGN_UNIT',({a,team,Gateway,seats,ok})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  const other=opponent(team)+'_MID';
  const invalid=gw.submit(seat,{sequence:1,unitId:other,kind:'item.buy',payload:{itemId:'boots'}});
  ok(!invalid.ok,'foreign unit accepted');return {reason:invalid.reason};
 },{type:'gateway'});
 scenario('GATEWAY_MULTICHAMP_OWNER',({a,team,Gateway,seats,ok})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2',id=team+'_TOP';
  const resp=gw.submit(seat,{sequence:1,unitId:id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(resp.ok,'own top rejected');return {resp};
 },{type:'gateway'});
 scenario('GATEWAY_RESTORE_RECEIPT',({a,u,team,Gateway,seats,ok,eq,checksumV40})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2',packet={sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}};
  const first=gw.submit(seat,packet);ok(first.ok,'first packet');
  const snapshot=a.snapshotV40(),session=gw.exportSession();
  const copied=Arena.fromSnapshotV40(map,mask,snapshot),reconnect=new Gateway(copied,seats,{restoredState:session});
  const pre=checksumV40(copied.snapshotV40());
  const retry=reconnect.submit(seat,packet);ok(retry.ok,'restore retry');
  eq(retry.revision,first.revision,'restore revision');eq(checksumV40(copied.snapshotV40()),pre,'replayed receipt mutated');
  return {first,retry,replayHash:pre};
 },{type:'gateway'});
 scenario('GATEWAY_UNDO_REPLAY',({a,u,team,Gateway,seats,ok,eq,checksumV40})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  ok(gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}}).ok,'buy');
  const cmd={sequence:2,unitId:u.id,kind:'item.undo',payload:{}};
  const first=gw.submit(seat,cmd);ok(first.ok,'undo');
  const gold=u.gold,before=checksumV40(a.snapshotV40()),audit=(a.shopUndoAuditV453Dev61||[]).length;
  const again=gw.submit(seat,cmd);ok(again.ok,'undo replay rejected');
  eq(u.gold,gold,'replay refund twice');eq(checksumV40(a.snapshotV40()),before,'replay mutation');
  eq((a.shopUndoAuditV453Dev61||[]).length,audit,'double undo audit');
  return {first,again,audit};
 },{type:'gateway'});
 scenario('GATEWAY_TWO_SEATS_SAME_SEQUENCE',({a,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),cmd=team=>({sequence:1,unitId:team+'_MID',kind:'item.buy',payload:{itemId:'boots'}});
  const x=gw.submit('p1',cmd('blue')),y=gw.submit('p2',cmd('red'));
  ok(x.ok&&y.ok,'seat interference');eq(a.units.find(z=>z.id==='blue_MID').items.length,1,'blue');
  eq(a.units.find(z=>z.id==='red_MID').items.length,1,'red');
  return {blue:x,red:y};
 },{type:'gateway',teams:['blue']});
 scenario('GATEWAY_READY_LOCK',({a,u,team,Gateway,seats,ok})=>{
  const gw=new Gateway(a,seats);a.teams[team].ready=true;
  const denied=gw.submit(team==='blue'?'p1':'p2',{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(!denied.ok,'ready state accepted shop packet');return {denied};
 },{type:'gateway'});
 scenario('GATEWAY_TRINKET_KNOWN_GAP',({a,u,team,Gateway,seats,ok,checksumV40})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2',pre=checksumV40(a.snapshotV40());
  const outcomes=['item.buy','item.queue','item.trinket'].map(kind=>({kind,
   receipt:gw.submit(seat,{sequence:1,unitId:u.id,kind,payload:{itemId:'trinket_oracle'}})}));
  ok(outcomes.every(x=>!x.receipt.ok),'gateway trinket accidentally enabled');
  ok(checksumV40(a.snapshotV40())===pre,'invalid trinket mutated');
  return {known_functional_gap:true,negative_only:true,outcomes};
 },{type:'legacy_gap'});

 scenario('GATEWAY_REUSED_SEQ_DIFFERENT_UNIT',({a,u,team,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  const buy=gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(buy.ok,'first buy');
  const top=a.units.find(x=>x.id===team+'_TOP'),gold=top.gold,items=[...top.items];
  const attack=gw.submit(seat,{sequence:1,unitId:top.id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(!attack.ok,'same seq different own unit accepted');
  eq(top.gold,gold,'different own-unit debit');same(top.items,items,'different own-unit inventory');
  return {first:buy,denied:attack};
 },{type:'gateway'});
 scenario('GATEWAY_QUEUE_RETRY_NO_DUPLICATE',({a,u,team,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  const cmd={sequence:1,unitId:u.id,kind:'item.queue',payload:{itemId:'long_sword'}};
  const first=gw.submit(seat,cmd);ok(first.ok,'queue first');
  const retry=gw.submit(seat,cmd);ok(retry.ok,'queue retry');
  eq(u.purchaseQueue.length,1,'duplicate queue');
  eq(u.gold,50000,'queue spent gold');
  return {first,retry,queue:[...u.purchaseQueue]};
 },{type:'gateway'});
 scenario('GATEWAY_SELL_RETRY_NO_DUPLICATE_GOLD',({a,u,team,Gateway,seats,ok,eq,checksumV40})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  ok(gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}}).ok,'buy');
  const cmd={sequence:2,unitId:u.id,kind:'item.sell',payload:{index:0}};
  const first=gw.submit(seat,cmd);ok(first.ok,'sale');
  const balance=u.gold,digest=checksumV40(a.snapshotV40());
  const retry=gw.submit(seat,cmd);ok(retry.ok,'sale retry');
  eq(u.gold,balance,'duplicate gold sale');eq(checksumV40(a.snapshotV40()),digest,'duplicate sale state');
  return {first,retry,balance};
 },{type:'gateway'});
 scenario('GATEWAY_CANCEL_QUEUE_RETRY',({a,u,team,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  ok(gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.queue',payload:{itemId:'long_sword'}}).ok,'queue');
  const cmd={sequence:2,unitId:u.id,kind:'item.cancelQueue',payload:{index:0}};
  const first=gw.submit(seat,cmd);ok(first.ok,'cancel');
  const retry=gw.submit(seat,cmd);ok(retry.ok,'cancel retry');
  eq(u.purchaseQueue.length,0,'cancelled queue returned');
  return {first,retry};
 },{type:'gateway'});
 scenario('GATEWAY_MALFORMED_PACKET_RETRY',({a,u,team,Gateway,seats,ok,eq})=>{
  const gw=new Gateway(a,seats),seat=team==='blue'?'p1':'p2';
  const malformed={sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'},team:'red',gold:9000000};
  const reject=gw.submit(seat,malformed);ok(!reject.ok,'trusted client-supplied fields');
  eq(u.gold,50000,'malformed packet charged');
  const valid=gw.submit(seat,{sequence:1,unitId:u.id,kind:'item.buy',payload:{itemId:'boots'}});
  ok(valid.ok,'malformed packet consumed sequence');return {reject,valid};
 },{type:'gateway'});
 scenario('SELL_OUTSIDE_FOUNTAIN_DENIED',({a,u,team,ok,eq})=>{
  ok(a.buy(team,u.id,'boots'),'buy');u.x=.5;u.y=.5;
  const prior=u.gold;
  ok(!a.canSellItemV453Dev60(team,u.id,0).ok,'remote sell preflight');
  ok(!a.sellItemV43(team,u.id,0).ok,'remote sale');
  eq(u.gold,prior,'remote sale credit');return {inventory:[...u.items],gold:u.gold};
 });
 scenario('HEALTH_POTION_CAP',({a,u,team,ok,eq})=>{
  for(let i=0;i<5;i++)ok(a.buy(team,u.id,'health_potion'),'potion '+i);
  eq(u.items.length,5,'potion count');
  ok(!a.canBuy(team,u.id,'health_potion').ok,'sixth potion accepted');
  return {potions:u.items.length};
 });
 scenario('HEALTH_POTION_REFILLABLE_EXCLUSIVE',({a,u,team,ok})=>{
  ok(a.buy(team,u.id,'health_potion'),'health setup');
  ok(!a.canBuy(team,u.id,'refillable_potion').ok,'refillable with health');
  return {potions:[...u.items]};
 });

 scenario('SHOP_COMMAND_ORDER_AND_REPLAY_HASH',({Arena:Unused,a,Gateway,seats,ok,same,checksumV40})=>{
  // One owner controls five champions; shop actions are independent by team,
  // but their arrival order affects the GLOBAL event log and canonical snapshot.
  const mk=order=>{
   const sandbox=new Arena(map,mask,{seed:460699,mode:'pvp'});
   for(const team of ['blue','red']){
    const actor=sandbox.units.find(x=>x.id===team+'_MID');
    actor.items=[];actor.gold=2000;
   }
   const gw=new Gateway(sandbox,seats);
   // Starter purchases already emitted their own events during Arena setup.
   // Compare only events emitted by these two adversarial test commands.
   const eventCountBefore=sandbox.events.length;
   const receipts=[];
   for(const team of order){
    const cmd={sequence:1,unitId:team+'_MID',kind:'item.buy',
      payload:{itemId:team==='blue'?'boots':'long_sword'}};
    const ack=gw.submit(team==='blue'?'p1':'p2',cmd);
    ok(ack.ok,'cross-team buy failed');
    receipts.push({team,ack});
   }
   const balances=Object.fromEntries(['blue','red'].map(team=>{
    const u=sandbox.units.find(x=>x.id===team+'_MID');
    return [team,{gold:u.gold,items:[...u.items]}];
   }));
   return {order,balances,hash:checksumV40(sandbox.snapshotV40()),
    events:sandbox.events.slice(0,sandbox.events.length-eventCountBefore).filter(x=>x.kind==='purchase').map(x=>x.team),
    receipts};
  };
  const br=mk(['blue','red']),rb=mk(['red','blue']);
  same(br.balances,rb.balances,'economic order independence');
  ok(br.hash!==rb.hash,'legacy full snapshots unexpectedly identical: revise replay policy');
  same(br.events,['red','blue'],'event log order one');
  same(rb.events,['blue','red'],'event log order two');
  return {blue_then_red:br,red_then_blue:rb,
   finding:'ECONOMY_COMMUTATIVE_BUT_CANONICAL_SNAPSHOT_EVENT_ORDER_DEPENDENT',
   classification:'REPLAY_CONTRACT_NOT_AUTOMATIC_BUG'};
 },{type:'replay_contract',teams:['blue']});
 return {schema:'coachlol.m45.items.adversarial.b06.v1',
  origin:'LEGACY_ITEMS_SOURCE',cases,
  summary:{planned:cases.length,passed:counts.PASS||0,failed:counts.FAIL||0,
   status:counts.FAIL?'FAIL':'PASS_WITH_LEGACY_TRINKET_GAP',
   negative_gap_cases:cases.filter(x=>x.category==='legacy_gap').length,
   gateway_cases:cases.filter(x=>x.category==='gateway').length,
   replay_contract_cases:cases.filter(x=>x.category==='replay_contract').length,
   economy_cases:cases.filter(x=>x.category==='economy').length}};
}
