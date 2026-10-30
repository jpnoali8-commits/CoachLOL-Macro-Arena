import assert from 'node:assert/strict';
import {SseStateDecoder,SseStateStream} from './m45_platform_a07_sse_frames.mjs';
const enc=new TextEncoder();let count=0;
async function check(name,fn){await fn();count++;console.log('PASS A07-SSE '+name);}
await check('01 independent frames in one network chunk retained',()=>{
 const parser=new SseStateDecoder();const all=parser.push(enc.encode(': connected\n\nevent: state\ndata: {"team":"blue","revision":1}\n\nevent: state\ndata: {"team":"blue","revision":2}\n\n'));
 assert.equal(all.length,2);assert.deepEqual(all.map(x=>x.state.revision),[1,2]);
});
await check('02 fragmented CRLF and heartbeat',()=>{
 const p=new SseStateDecoder();assert.deepEqual(p.push(enc.encode(': heartbeat\r')),[]);
 assert.deepEqual(p.push(enc.encode('\n\r\nevent: state\r\ndata: {"team":"red"}\r')),[]);
 assert.equal(p.push(enc.encode('\n\r\n'))[0].state.team,'red');
});
await check('03 real Unicode bytes across chunk boundary',()=>{
 const p=new SseStateDecoder();const bytes=enc.encode('event: state\ndata: {"text":"ação"}\n\n');
 const cut=bytes.indexOf(0xc3)+1;
 assert.deepEqual(p.push(bytes.slice(0,cut)),[]);
 assert.equal(p.push(bytes.slice(cut))[0].state.text,'ação');
});
await check('04 ID and multi data lines',()=>{
 const p=new SseStateDecoder();const frames=p.push(enc.encode('event: state\nid: 42\ndata: {"team":\ndata: "blue"}\n\n'));
 assert.deepEqual(frames,[{id:'42',state:{team:'blue'}}]);
});
await check('05 malformed or scalar state fails closed',()=>{
 assert.throws(()=>new SseStateDecoder().push(enc.encode('event: state\ndata: {broken}\n\n')),SyntaxError);
 assert.throws(()=>new SseStateDecoder().push(enc.encode('event: state\ndata: null\n\n')),/sse_state_invalid_json_shape/);
});
await check('06 frame size limit applies to complete and partial frame',()=>{
 assert.throws(()=>new SseStateDecoder({maxFrameBytes:20}).push(enc.encode('event: state\ndata: {"x":1234567}\n\n')),/sse_frame_too_large/);
 assert.throws(()=>new SseStateDecoder({maxFrameBytes:20}).push(enc.encode('event: state\ndata: abcdefghijklmno')),/sse_frame_too_large/);
});
await check('07 stream returns consecutive frames without losing buffered second',async()=>{
 const chunks=[enc.encode('event: state\ndata: {"revision":1}\n\nevent: state\ndata: {"revision":2}\n\n')];
 const body={getReader(){return {async read(){return chunks.length?{done:false,value:chunks.shift()}:{done:true}},async cancel(){},releaseLock(){}}}};
 const stream=new SseStateStream(body);assert.equal((await stream.next()).state.revision,1);assert.equal((await stream.next()).state.revision,2);
 await assert.rejects(()=>stream.next(),/sse_stream_ended_before_next_state/);await stream.close();
});
await check('08 empty event and invalid constructor arguments reject',()=>{
 assert.throws(()=>new SseStateDecoder({maxFrameBytes:0}),RangeError);
 assert.throws(()=>new SseStateStream(null),TypeError);
 assert.throws(()=>new SseStateDecoder().push('notbytes'),TypeError);
 assert.throws(()=>new SseStateDecoder().push(enc.encode('event: state\ndata:\n\n')),/sse_state_missing_data/);
});
console.log('M45 A07 SSE NODE '+count+'/8 PASS');
