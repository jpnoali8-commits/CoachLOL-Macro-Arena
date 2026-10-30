import assert from 'node:assert/strict';
import {ClientSequenceReference as Client} from './m45_platform_a08_sequence_reference.mjs';
let count=0;
const check=(name,fn)=>{fn();count++;console.log('PASS A08 REFERENCE '+name);};
const bind=(c,id='room-a')=>c.bind({roomId:id,seatId:'p1',nextSequence:1,revision:0});
const ack=(p)=>({ok:true,sequence:p.sequence,unitId:p.unitId,kind:p.kind});
check('01 normal ACK then SSE leaves next=2',()=>{
 const c=new Client();let ep=bind(c),p=c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}});
 assert.equal(c.onAck(ack(p),{roomId:'room-a',seatId:'p1',epoch:ep}),true);
 assert.equal(c.onSnapshot({roomId:'room-a',seatId:'p1',revision:1,nextSequence:2}),true);
 assert.equal(c.next,2);
});
check('02 SSE before ACK does not skip next sequence',()=>{
 const c=new Client();let ep=bind(c),p=c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}});
 assert.equal(c.onSnapshot({roomId:'room-a',seatId:'p1',revision:1,nextSequence:2}),true);
 assert.equal(c.next,1);
 assert.equal(c.onAck(ack(p),{roomId:'room-a',seatId:'p1',epoch:ep}),true);
 assert.equal(c.next,2);
 assert.equal(c.command({kind:'order.stop',unitId:'blue_MID',payload:{}}).sequence,2);
});
check('03 lost ACK retries exact original packet, blocks changed command',()=>{
 const c=new Client();bind(c);let original=c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}});
 assert.throws(()=>c.command({kind:'order.recall',unitId:'blue_TOP',payload:{}}),/awaiting_previous_receipt/);
 assert.deepEqual(c.retry(),original);assert.deepEqual(c.retry(),original);
});
check('04 switching room resets both sequence and revision',()=>{
 const c=new Client();let old=bind(c),p=c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}});
 c.onAck(ack(p),{roomId:'room-a',seatId:'p1',epoch:old});
 c.onSnapshot({roomId:'room-a',seatId:'p1',revision:50,nextSequence:2});
 const newer=bind(c,'room-b');
 assert.notEqual(newer,old);assert.equal(c.next,1);assert.equal(c.lastRevision,0);
 assert.equal(c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}}).sequence,1);
});
check('05 stale SSE from other room or lower revision rejected',()=>{
 const c=new Client();bind(c);
 assert.equal(c.onSnapshot({roomId:'room-old',seatId:'p1',revision:100,nextSequence:100}),false);
 assert.equal(c.onSnapshot({roomId:'room-a',seatId:'p2',revision:100,nextSequence:100}),false);
 assert.equal(c.onSnapshot({roomId:'room-a',seatId:'p1',revision:3,nextSequence:2}),true);
 assert.equal(c.onSnapshot({roomId:'room-a',seatId:'p1',revision:2,nextSequence:10}),false);
 assert.equal(c.next,2);assert.equal(c.lastRevision,3);
});
check('06 stale ACK from old room cannot release pending new command',()=>{
 const c=new Client();let old=bind(c),first=c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}});
 let newer=bind(c,'room-b'),second=c.command({kind:'order.stop',unitId:'blue_JG',payload:{}});
 assert.equal(c.onAck(ack(first),{roomId:'room-a',seatId:'p1',epoch:old}),false);
 assert.deepEqual(c.retry(),second);
 assert.equal(c.onAck(ack(second),{roomId:'room-b',seatId:'p1',epoch:newer}),true);
 assert.equal(c.next,2);
});
check('07 malformed success cannot consume pending receipt',()=>{
 const c=new Client();let ep=bind(c),p=c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}});
 assert.equal(c.onAck({...ack(p),unitId:'red_TOP'},{roomId:'room-a',seatId:'p1',epoch:ep}),false);
 assert.deepEqual(c.retry(),p);assert.equal(c.next,1);
});
check('08 newer valid snapshot while command pending still requires ACK',()=>{
 const c=new Client();bind(c);const p=c.command({kind:'order.stop',unitId:'blue_TOP',payload:{}});
 c.onSnapshot({roomId:'room-a',seatId:'p1',revision:4,nextSequence:2});
 assert.equal(c.next,1);assert.deepEqual(c.retry(),p);
});
console.log('M45 A08 PROPOSED SEQUENCE CONTRACT '+count+'/8 PASS (not engine production/Rust)');
