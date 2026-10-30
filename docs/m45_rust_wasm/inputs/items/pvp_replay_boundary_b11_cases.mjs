// M45 B02B-ITEMS B11 — frozen gateway/room replay source oracle.
// Shared by Node and isolated V8. V8 uses deterministic shims ONLY for Node
// crypto/filesystem boundaries; no HTTP, TLS, cookie or disk durability is tested.
export function runPvPReplayBoundaryB11({Arena,Gateway,Room,map,mask,checksumV40}){
 const cases=[];let idx=0;
 const ok=(v,m)=>{if(!v)throw Error(m)},eq=(a,b,m)=>ok(Object.is(a,b),m+': '+JSON.stringify(a)+' != '+JSON.stringify(b));
 const js=JSON.stringify,cp=x=>JSON.parse(js(x)),other=t=>t==='blue'?'red':'blue',seat=t=>t==='blue'?'p1':'p2';
 const unit=(a,t,r='MID')=>a.units.find(v=>v.id===t+'_'+r),sum=a=>checksumV40(a.snapshotV40());
 const seats=()=>[{seatId:'p1',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
  {seatId:'p2',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}];
 const msg=(sequence,unitId,kind='item.buy',payload={itemId:'boots'})=>({sequence,unitId,kind,payload});
 const gw=a=>new Gateway(a,seats());
 const restored=(a,g)=>{const b=Arena.fromSnapshotV40(map,mask,cp(a.snapshotV40()));return{b,h:new Gateway(b,seats(),{restoredState:cp(g.exportSession())})}};
 const room=a=>{const r=new Room({id:'b11-fixture',arena:a}),p1=r.join().player,p2=r.join().player;return{r,players:{blue:p1,red:p2}}};
 const reloadRoom=r=>new Room({id:r.id,arena:Arena.fromSnapshotV40(map,mask,cp(r.arena.snapshotV40())),restored:cp(r.checkpoint())});
 const parity=(a,b,tag)=>eq(sum(a),sum(b),tag+' checksum');
 const noSecrets=(v,t)=>{
  eq(v.team,t,'player seat');eq(v.projection.controlledUnitIds.length,5,'own five');
  const s=js(v);for(const k of ['"rngState"','"tokenHash"','"snapshotV40"','"actionJournalV40"','"receipts"'])ok(!s.includes(k),'private snapshot leak '+k);
  for(const e of v.projection.units.filter(x=>x.team!==t))ok(!Object.hasOwn(e,'items')&&!Object.hasOwn(e,'gold')&&!Object.hasOwn(e,'skillCds')&&!Object.hasOwn(e,'statusEffectsV41'),'opponent stats leaked');
 };
 const tests=[
 ['OWN_FIVE_SHOP_DISPATCH',({a,t})=>{
  const g=gw(a);for(const role of ['TOP','JG','MID','ADC','SUP'])unit(a,t,role).gold=50000;
  const ops=[['TOP','boots'],['JG','jungle_gustwalker'],['JG','boots'],['MID','boots'],['ADC','boots'],['SUP','boots']];
  const receipts=[];for(let i=0;i<ops.length;i++){const [role,itemId]=ops[i],x=msg(i+1,t+'_'+role,'item.buy',{itemId});const r=g.submit(seat(t),x);ok(r.ok,'own unit '+role+' '+itemId+': '+r.reason);receipts.push(r)}
  for(const role of ['TOP','JG','MID','ADC','SUP'])ok(unit(a,t,role).items.includes('boots'),'boots missing '+role);
  const before=sum(a),retry=g.submit(seat(t),msg(4,t+'_MID'));eq(js(retry),js(receipts[3]),'existing receipt');eq(sum(a),before,'duplicate purchase');
  return{champions:5,committed:6,petPrecondition:'jungle_gustwalker'};
 }],
 ['CROSS_SEAT_OWNERSHIP_DENIED',({a,t})=>{
  const g=gw(a),before=sum(a),r=g.submit(seat(t),msg(1,unit(a,other(t)).id));
  eq(r.reason,'unidade_nao_autorizada','enemy purchase');eq(sum(a),before,'foreign mutation');return{reason:r.reason};
 }],
 ['ACK_RETRY_AFTER_GATEWAY_RESTORE',({a,t})=>{
  const u=unit(a,t);u.gold=5000;const g=gw(a),m=msg(1,u.id),ack=g.submit(seat(t),m);ok(ack.ok,'first purchase');
  const {b,h}=restored(a,g);parity(a,b,'restored'),before=sum(b);
  eq(js(h.submit(seat(t),m)),js(ack),'restored ACK');eq(sum(b),before,'double debit');return{sameReceipt:true,gold:unit(b,t).gold};
 }],
 ['CONFLICTING_ITEM_AFTER_RESTORE',({a,t})=>{
  const u=unit(a,t);u.gold=5000;const g=gw(a);ok(g.submit(seat(t),msg(1,u.id)).ok,'first');
  const {b,h}=restored(a,g),before=sum(b),r=h.submit(seat(t),msg(1,u.id,'item.buy',{itemId:'long_sword'}));
  eq(r.reason,'sequencia_reutilizada_com_dados_diferentes','item swap');eq(sum(b),before,'swapped item mutated');return{reason:r.reason};
 }],
 ['CONFLICTING_UNIT_AFTER_RESTORE',({a,t})=>{
  const u=unit(a,t);u.gold=5000;const g=gw(a);ok(g.submit(seat(t),msg(1,u.id)).ok,'first');
  const {b,h}=restored(a,g),before=sum(b),r=h.submit(seat(t),msg(1,unit(b,t,'ADC').id));
  eq(r.reason,'sequencia_reutilizada_com_dados_diferentes','unit swap');eq(sum(b),before,'swapped unit mutated');return{reason:r.reason};
 }],
 ['SEQUENCE_GAP_AFTER_RESTORE',({a,t})=>{
  const u=unit(a,t);u.gold=5000;const g=gw(a);ok(g.submit(seat(t),msg(1,u.id)).ok,'first');
  const {b,h}=restored(a,g),before=sum(b),m=msg(3,u.id,'item.buy',{itemId:'long_sword'}),bad=h.submit(seat(t),m);
  eq(bad.reason,'sequencia_fora_de_ordem','gap');eq(sum(b),before,'gap mutated');
  ok(h.submit(seat(t),msg(2,u.id,'item.buy',{itemId:'long_sword'})).ok,'contiguous accepted');
  return{gapRejected:true,sequence:h.seats.get(seat(t)).lastSequence};
 }],
 ['PACKET_TEAM_SPOOF_REJECTED',({a,t})=>{
  const g=gw(a),before=sum(a),r=g.submit(seat(t),{...msg(1,unit(a,t).id),team:other(t)});
  eq(r.reason,'comando_invalido','forged team');eq(sum(a),before,'spoof mutated');return{reason:r.reason};
 }],
 ['PAYLOAD_GOLD_SPOOF_REJECTED',({a,t})=>{
  const g=gw(a),before=sum(a),r=g.submit(seat(t),msg(1,unit(a,t).id,'item.buy',{itemId:'boots',gold:999999,team:other(t)}));
  eq(r.reason,'comando_invalido','forged economy');eq(sum(a),before,'spoof mutated');return{reason:r.reason};
 }],
 ['TWO_SEATS_INDEPENDENT_ACK_RESTORE',({a,t})=>{
  const u=unit(a,t),v=unit(a,other(t));u.gold=v.gold=5000;const g=gw(a),one=g.submit(seat(t),msg(1,u.id)),two=g.submit(seat(other(t)),msg(1,v.id));
  ok(one.ok&&two.ok,'two seat commits');const {b,h}=restored(a,g);parity(a,b,'two seats');
  eq(js(h.submit(seat(t),msg(1,u.id))),js(one),'seat 1 receipt');eq(js(h.submit(seat(other(t)),msg(1,v.id))),js(two),'seat 2 receipt');
  parity(a,b,'two-seats retried');return{revision:h.revision,independent:true};
 }],
 ['REJECTED_REQUEST_DOES_NOT_SPEND_SEQUENCE',({a,t})=>{
  const g=gw(a),u=unit(a,t);u.gold=5000;const before=sum(a),bad=g.submit(seat(t),msg(1,unit(a,other(t)).id));
  ok(!bad.ok,'foreign accepted');eq(sum(a),before,'rejected mutated');const good=g.submit(seat(t),msg(1,u.id));
  ok(good.ok,'seq not reusable after rejected');return{rejected:bad.reason,accepted:good.sequence};
 }],
 ['GATEWAY_FOG_LIMITED_VIEW',({a,t})=>{
  const u=unit(a,t),enemy=unit(a,other(t));u.gold=enemy.gold=5000;const g=gw(a);
  ok(g.submit(seat(t),msg(1,u.id)).ok,'own buy');ok(g.submit(seat(other(t)),msg(1,enemy.id)).ok,'enemy buy');
  const v=g.view(seat(t));eq(v.controlledUnitIds.length,5,'five owned');ok(v.units.find(x=>x.id===u.id)?.items.includes('boots'),'own stock');
  for(const e of v.units.filter(x=>x.team!==t))ok(!Object.hasOwn(e,'items')&&!Object.hasOwn(e,'gold'),'enemy inventory leaked');
  ok(!js(v).includes('"rngState"')&&!js(v).includes('"actionJournalV40"'),'raw arena leaked');
  return{ownerCount:5,visibleEnemies:v.units.filter(x=>x.team!==t).length};
 }],
 ['PRIVATE_INTENT_REPLAY_REDACTED',({a,t})=>{
  const u=unit(a,t),enemy=unit(a,other(t)),r=a.recordIntentV40(t,u.id,'invade',{point:{x:.49,y:.50},targetId:enemy.id});
  ok(r.ok,'intent');eq(a.journalForV40(other(t)).length,0,'intent enemy visibility');
  const b=Arena.fromSnapshotV40(map,mask,cp(a.snapshotV40()));
  eq(b.journalForV40(other(t)).length,0,'intent restore leak');eq(b.journalForV40(t).length,1,'owner missing private intent');
  parity(a,b,'journal checkpoint');return{ownerOnly:true};
 }],
 ['ROOM_VIEW_OWNER_FIELDS_ONLY',({a,t})=>{
  const {r,players}=room(a),enemy=unit(a,other(t));enemy.gold=15777;enemy.items=['banshees_veil'];const v=r.view(players[t]);noSecrets(v,t);
  eq(v.projection.units.filter(x=>x.team===t).length,5,'own unit visibility');
  eq(Object.keys(v.projection.shopUndoAvailableV453Dev61).length,5,'own undo');
  eq(Object.keys(v.projection.shopInRangeV453Dev60).length,5,'own shop');
  ok(!js(v).includes('15777'),'enemy gold exposed');return{ownCount:5,privateShopKeys:5};
 }],
 ['ROOM_DUPLICATE_RETRY_WHEN_READY',({a,t})=>{
  const {r,players}=room(a),p=players[t],u=unit(a,t);u.gold=5000;const m=msg(1,u.id),ack=r.command(p,m);ok(ack.ok,'room buy');
  ok(r.confirm(p).ok,'ready');const before=sum(a),revision=r.revision;
  eq(js(r.command(p,m)),js(ack),'room old ACK');eq(sum(a),before,'double debit');eq(r.revision,revision,'retry revision');
  const bad=r.command(p,msg(2,u.id,'item.buy',{itemId:'long_sword'}));eq(bad.reason,'turno_bloqueado','new buy after ready');
  return{ready:true,retry:true,blocked:bad.reason};
 }],
 ['ROOM_READY_PERSISTS_RECONNECT',({a,t})=>{
  const {r,players}=room(a);ok(r.confirm(players[t]).ok,'ready');const b=reloadRoom(r),p=b.players.find(x=>x.team===t);
  ok(b.view(p).ready.includes(players[t].seatId),'ready lost');
  const bad=b.command(p,msg(1,unit(b.arena,t).id));eq(bad.reason,'turno_bloqueado','ready bypass');
  return{readyPersisted:true};
 }],
 ['ROOM_CHECKPOINT_ACK_SURVIVES',({a,t})=>{
  const {r,players}=room(a),u=unit(a,t);u.gold=5000;const m=msg(1,u.id),ack=r.command(players[t],m);ok(ack.ok,'buy');
  const b=reloadRoom(r),p=b.players.find(x=>x.team===t),before=sum(b.arena);
  eq(js(b.command(p,m)),js(ack),'room checkpoint receipt');eq(sum(b.arena),before,'replay after load mutated');
  eq(b.gateway.seats.get(p.seatId).lastSequence,1,'room lost last sequence');
  return{ackSurvives:true};
 }],
 ['ROOM_DECISION_PRIVATE_TO_DEFENDER',({a,t})=>{
  const {r,players}=room(a),u=unit(a,t,'ADC'),v=unit(a,other(t));
  a.phase='decision';a.pendingDecision={kind:'combat_reaction',unitId:u.id,enemyId:v.id};
  eq(r.view(players[t]).pendingDecision?.unitId,u.id,'defender missing');
  eq(r.view(players[other(t)]).pendingDecision,null,'opponent pending decision leaked');
  return{defender:u.id,filtered:true};
 }],
 ['ROOM_PRIVATE_CHECKPOINT_NOT_PUBLIC',({a,t})=>{
  const {r,players}=room(a),u=unit(a,t);u.gold=5000;ok(r.command(players[t],msg(1,u.id)).ok,'buy');
  const internal=js(r.checkpoint()),external=js(r.view(players[t]));
  for(const k of ['"tokenHash"','"rngState"','"receipts"'])ok(internal.includes(k),'missing checkpoint '+k);
  for(const k of ['"tokenHash"','"rngState"','"receipts"','"snapshotV40"'])ok(!external.includes(k),'leaked '+k);
  return{internalPrivate:true,externalPrivateFiltered:true};
 }],
 ['ROOM_PROJECTION_MUTATION_ISOLATED',({a,t})=>{
  const {r,players}=room(a),u=unit(a,t);u.gold=5000;const v=r.view(players[t]),own=v.projection.units.find(x=>x.id===u.id);
  ok(own,'own projection');own.gold=999999;own.items.push('__fake__');eq(u.gold,5000,'projection mutated gold');
  ok(!u.items.includes('__fake__'),'projection mutated actual inventory');return{detached:true};
 }]
 ];
 for(const [kind,fn] of tests)for(const t of ['blue','red']){
  const seed=451100+idx++,a=new Arena(map,mask,{seed,mode:'pvp'});
  const c={case_id:'M45-B11-'+kind+'-'+t,team:t,category:kind.startsWith('ROOM')?'ROOM_SOURCE':'GATEWAY_SOURCE',seed,status:'FAIL'};
  try{c.before_checksum_v40=sum(a);c.observed=fn({a,t});c.after_checksum_v40=sum(a);c.status='PASS'}catch(e){c.error=String(e)}
  cases.push(c);
 }
 const fail=cases.filter(x=>x.status!=='PASS');
 return{schema:'coachlol.m45.items.pvp_replay_boundary.b11.v1',
 summary:{scenarios:tests.length,planned:cases.length,passed:cases.length-fail.length,failed:fail.length,gateway_cases:cases.filter(x=>x.category==='GATEWAY_SOURCE').length,room_cases:cases.filter(x=>x.category==='ROOM_SOURCE').length,status:fail.length?'FAIL':'PASS'},cases};
}
