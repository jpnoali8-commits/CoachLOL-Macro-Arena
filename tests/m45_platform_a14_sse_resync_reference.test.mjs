import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {DurableCheckpointReference as Store} from './m45_platform_a13_durable_reference.mjs';
import {SseStateDecoder} from './m45_platform_a07_sse_frames.mjs';
import {PerSeatSseResyncReference as Server,PerSeatSseConsumerReference as Client} from './m45_platform_a14_sse_resync_reference.mjs';
const temp=mkdtempSync(join(tmpdir(),'coachlol-a14-'));
let n=0;
const check=(name,fn)=>{fn();n++;console.log('PASS A14 NODE '+name)};
const blue={seatId:'p1'},red={seatId:'p2'};
const command=(seat,id,unit)=>({kind:'order.stop',round:1,requestId:id,unitId:unit});
try{
 const file=join(temp,'room.json'),store=new Store(file),server=new Server(store);
 check('01 initial cursor and team-scoped snapshot from committed checkpoint',()=>{
  const a=server.recover(blue),b=server.recover(red);
  assert.equal(a.ok,true);assert.equal(a.reason,'initial');assert.equal(a.id,'a13reference/p1/0');
  assert.equal(a.frame.data.team,'blue');assert.equal(b.frame.data.team,'red');
  assert.equal(a.frame.data.projection.commands.length,0);
 });
 check('02 unauthorized seat never receives state or cursor',()=>{
  assert.deepEqual(server.recover({seatId:'p3'}),{ok:false,reason:'unauthorized'});
  assert.deepEqual(server.recover(null),{ok:false,reason:'unauthorized'});
 });
 check('03 commits produce independent per-seat filtered snapshots',()=>{
  assert.equal(store.commit(blue,command('p1','ba','blue_TOP')).ok,true);
  assert.equal(store.commit(red,command('p2','ra','red_JG')).ok,true);
  const a=server.recover(blue),b=server.recover(red);
  assert.deepEqual(a.frame.data.projection.commands,[{unitId:'blue_TOP',kind:'order.stop'}]);
  assert.deepEqual(b.frame.data.projection.commands,[{unitId:'red_JG',kind:'order.stop'}]);
  assert.equal(a.frame.data.revision,2);assert.equal(b.frame.data.revision,2);
 });
 check('04 resync ignores foreign seat cursor and sends only own snapshot',()=>{
  const foreign=server.recover(blue,{lastEventId:'a13reference/p2/1'});
  assert.equal(foreign.reason,'foreign_or_invalid_cursor');assert.equal(foreign.frame.data.seatId,'p1');
  assert.equal(JSON.stringify(foreign).includes('red_JG'),false);
 });
 check('05 missed revisions recover a full current authorized snapshot',()=>{
  const r=server.recover(blue,{lastEventId:'a13reference/p1/0'});
  assert.equal(r.reason,'gap_snapshot');assert.equal(r.frame.data.revision,2);
 });
 check('06 same revision reconnect safely returns snapshot with same cursor',()=>{
  const r=server.recover(blue,{lastEventId:'a13reference/p1/2'});
  assert.equal(r.reason,'same_revision_snapshot');assert.equal(r.id,'a13reference/p1/2');
 });
 check('07 future, malformed and cross-room cursor are not trusted',()=>{
  assert.equal(server.recover(blue,{lastEventId:'a13reference/p1/999'}).reason,'future_cursor');
  assert.equal(server.recover(blue,{lastEventId:'../../secret'}).reason,'foreign_or_invalid_cursor');
  assert.equal(server.recover(blue,{lastEventId:'previousroom/p1/1'}).reason,'foreign_or_invalid_cursor');
 });
 check('08 actual SSE frames pass existing A07 incremental decoder',()=>{
  const r=server.recover(blue),wire=server.wire(r),reader=new SseStateDecoder();
  const bytes=new TextEncoder().encode(wire),split=Math.floor(bytes.length/2);
  assert.deepEqual(reader.push(bytes.slice(0,split)),[]);
  const result=reader.push(bytes.slice(split));assert.equal(result.length,1);
  assert.equal(result[0].id,r.id);assert.equal(result[0].state.team,'blue');
 });
 check('09 duplicate frames accepted once and older revisions dropped',()=>{
  const c=new Client({roomId:'a13reference',seatId:'p1'}),r=server.recover(blue);
  assert.equal(c.accept({id:r.id,state:r.frame.data}),true);
  assert.equal(c.accept({id:r.id,state:r.frame.data}),false);
  assert.equal(c.accept({id:'a13reference/p1/1',state:{...r.frame.data,revision:1}}),false);
 });
 check('10 client rejects foreign seat and manipulated event ID',()=>{
  const c=new Client({roomId:'a13reference',seatId:'p1'}),r=server.recover(red);
  assert.equal(c.accept({id:r.id,state:r.frame.data}),false);
  const blueFrame=server.recover(blue);
  assert.equal(c.accept({id:'a13reference/p1/999',state:blueFrame.frame.data}),false);
 });
 check('11 store restart returns same cursor and durable receipt without replay',()=>{
  const packet=command('p1','bb','blue_ADC');const ack=store.commit(blue,packet);
  const restartedStore=new Store(file),restarted=new Server(restartedStore);
  assert.deepEqual(restartedStore.commit(blue,packet),ack);
  assert.equal(restarted.recover(blue).id,'a13reference/p1/3');
  assert.equal(restartedStore.read().commands.length,3);
 });
 check('12 lost ACK after rename resolves to prior receipt and one cursor',()=>{
  const packet=command('p1','bc','blue_MID');store.fault='after_rename';
  assert.throws(()=>store.commit(blue,packet),/INJECT_AFTER_RENAME/);
  const newStore=new Store(file),ack=newStore.commit(blue,packet),resync=new Server(newStore).recover(blue);
  assert.equal(ack.revision,4);assert.equal(resync.id,'a13reference/p1/4');
  assert.equal(newStore.read().commands.length,4);store.fault=null;
 });
 check('13 failure before durable rename does not advance SSE cursor',()=>{
  const before=server.recover(blue).id,packet=command('p1','bd','blue_SUP');
  store.fault='after_temp_fsync';assert.throws(()=>store.commit(blue,packet),/INJECT_AFTER_TEMP_FSYNC/);store.fault=null;
  assert.equal(server.recover(blue).id,before);
  assert.equal(new Store(file).read().commands.length,4);
 });
 check('14 unclassified/private malformed events are denied by explicit DTO allowlist',()=>{
  const s=store.read();s.events.push({kind:'mystery',privateDebug:'leak',text:'secret'});
  s.events.push({scope:'team',team:'red',kind:'order_accepted',privateDebug:'enemy-secret'});
  s.events.push({scope:'public',kind:'order_accepted',privateDebug:'global-secret'});
  store.write(s);const r=server.recover(blue),json=JSON.stringify(r);
  assert.equal(json.includes('leak'),false);assert.equal(json.includes('enemy-secret'),false);
  assert.equal(json.includes('global-secret'),false);assert.equal(json.includes('privateDebug'),false);
  assert.equal(json.includes('privateSeed'),false);
 });
 check('15 one ready and second ready persist once and cursor is monotonic',()=>{
  const before=server.recover(blue).frame.data.revision;
  const first=store.commit(blue,{kind:'ready',round:1,requestId:'ready1'});
  assert.equal(first.ok,true);assert.equal(server.recover(blue).frame.data.revision,before+1);
  const second=store.commit(red,{kind:'ready',round:1,requestId:'ready2'});
  assert.equal(second.ok,true);assert.equal(new Store(file).read().executionCount,1);
  assert.deepEqual(new Store(file).commit(red,{kind:'ready',round:1,requestId:'ready2'}),second);
  assert.equal(new Store(file).read().executionCount,1);
 });
 check('16 duplicate wire snapshots in same data chunk accepted only once by client',()=>{
  const r=server.recover(blue),parser=new SseStateDecoder(),enc=new TextEncoder();
  const frames=parser.push(enc.encode(server.wire(r)+server.wire(r)));
  assert.equal(frames.length,2);
  const c=new Client({roomId:'a13reference',seatId:'p1'});
  assert.equal(c.accept(frames[0]),true);assert.equal(c.accept(frames[1]),false);
 });
 console.log('M45 A14 NATIVE NODE '+n+'/16 PASS (QA store + real disk, NOT Rust/HTTP/browser)');
}finally{rmSync(temp,{recursive:true,force:true})}
