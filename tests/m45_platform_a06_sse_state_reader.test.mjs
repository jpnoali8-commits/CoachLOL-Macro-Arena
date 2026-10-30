import assert from 'node:assert/strict';
import {readFirstSseState} from './m45_platform_a06_sse_state_reader.mjs';
const stream=chunks=>({async read(){if(!chunks.length)return {done:true};return {done:false,value:new TextEncoder().encode(chunks.shift())};}});
let n=0;
async function check(name,fn){await fn();console.log('PASS SSE '+name);n++;}
await check('comment and state in separate network chunks',async()=>{
 const data=await readFirstSseState(stream([': connected\n\n','event: state\n','data: {"team":"blue","revision":1}\n\n']));
 assert.deepEqual(data,{team:'blue',revision:1});
});
await check('fragmented CRLF message with heartbeat',async()=>{
 const data=await readFirstSseState(stream([': heartbeat\r','\n\r\n','event: st','ate\r\n','data: {"team":"red"}\r\n\r\n']));
 assert.deepEqual(data,{team:'red'});
});
await check('ignored non-state event before state',async()=>{
 const data=await readFirstSseState(stream(['event: update\ndata: {"secret":"do not treat as state"}\n\n','event: state\ndata: {"ok":true}\n\n']));
 assert.deepEqual(data,{ok:true});
});
await check('end without state fails closed',async()=>{await assert.rejects(readFirstSseState(stream([': connected\n\n'])),/sse_stream_ended_before_state/);});
await check('oversized stream fails closed',async()=>{await assert.rejects(readFirstSseState(stream(['event: state\ndata: {"x":"'+('a'.repeat(120))+'"}\n\n']),{maxBytes:100}),/sse_frame_too_large/);});
console.log('A06 SSE parser '+n+'/5 PASS');
