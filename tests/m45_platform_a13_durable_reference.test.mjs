/** A13 stand-alone Node disk I/O fault injection: not a production server. */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,existsSync,statSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DurableCheckpointReference as Store} from './m45_platform_a13_durable_reference.mjs';
const dir=mkdtempSync(join(tmpdir(),'m45-a13-'));
const file=join(dir,'match.json');let count=0;
const blue={seatId:'p1'},red={seatId:'p2'};
const stop=(id='a')=>({kind:'order.stop',unitId:'blue_TOP',round:1,requestId:id});
const ready=(id)=>({kind:'ready',round:1,requestId:id});
const check=(s,fn)=>{fn();count++;console.log('PASS A13 DISK '+s)};
const fresh=()=>{rmSync(file,{force:true});rmSync(file+'.new',{force:true});return new Store(file)};
try{
 check('01 new checkpoint revision zero',()=>{const s=fresh();assert.equal(s.read().revision,0);assert.equal(s.read().commands.length,0)});
 check('02 successful command durably stores receipt before returning ACK',()=>{const s=fresh(),a=s.commit(blue,stop());assert.equal(a.ok,true);assert.equal(a.revision,1);assert.equal(new Store(file).read().commands.length,1)});
 check('03 retry after restart returns identical original ACK, no second execution',()=>{const s=fresh(),ack=s.commit(blue,stop());const recovered=new Store(file);assert.deepEqual(recovered.commit(blue,stop()),ack);assert.equal(recovered.read().revision,1);assert.equal(recovered.read().commands.length,1)});
 check('04 changed request with same requestId fails closed',()=>{const s=fresh();s.commit(blue,stop());assert.equal(s.commit(blue,{...stop(),unitId:'blue_JG'}).reason,'receipt_conflict');assert.equal(s.read().revision,1)});
 check('05 fault before temp write leaves checkpoint identical',()=>{const s=fresh(),before=readFileSync(file,'utf8');s.fault='before_temp';assert.throws(()=>s.commit(blue,stop()),/INJECT_BEFORE_TEMP/);assert.equal(readFileSync(file,'utf8'),before)});
 check('06 fault after temp fsync and before rename leaves committed image unchanged',()=>{const s=fresh(),before=readFileSync(file,'utf8');s.fault='after_temp_fsync';assert.throws(()=>s.commit(blue,stop()),/INJECT_AFTER_TEMP_FSYNC/);assert.equal(readFileSync(file,'utf8'),before);assert.equal(existsSync(file+'.new'),false)});
 check('07 post-rename lost ACK is reconciled from disk on retry',()=>{const s=fresh();s.fault='after_rename';assert.throws(()=>s.commit(blue,stop()),/INJECT_AFTER_RENAME/);const recovered=new Store(file);const ack=recovered.commit(blue,stop());assert.equal(ack.ok,true);assert.equal(ack.revision,1);assert.equal(recovered.read().commands.length,1)});
 check('08 two distinct seats have independent team ownership',()=>{const s=fresh();assert.equal(s.commit(red,stop('x')).reason,'unauthorized_unit');assert.equal(s.read().revision,0);assert.equal(s.commit(blue,stop()).ok,true)});
 check('09 first ready seals only own seat and remains durable',()=>{const s=fresh(),a=s.commit(blue,ready('blue-ready'));assert.equal(a.ok,true);const recovered=new Store(file);assert.deepEqual(recovered.read().ready,['p1']);assert.equal(recovered.commit(blue,stop('b')).reason,'turn_locked')});
 check('10 second ready executes once and old receipts survive restart',()=>{const s=fresh(),a=s.commit(blue,ready('first')),b=s.commit(red,ready('second'));assert.equal(b.ok,true);const restarted=new Store(file);assert.equal(restarted.read().executionCount,1);assert.equal(restarted.read().phase,'executing');assert.deepEqual(restarted.commit(red,ready('second')),b);assert.deepEqual(restarted.commit(blue,ready('first')),a);assert.equal(restarted.read().executionCount,1)});
 check('11 failure before final ready remains in planning after reconnect',()=>{const s=fresh();s.commit(blue,ready('first'));s.fault='after_temp_fsync';assert.throws(()=>s.commit(red,ready('second')),/INJECT/);const recovered=new Store(file);assert.equal(recovered.read().phase,'planning');assert.deepEqual(recovered.read().ready,['p1']);assert.equal(recovered.read().executionCount??0,0)});
 check('12 owner-only SSE projection excludes foreign order and storage secrets',()=>{const s=fresh();s.commit(blue,stop());s.commit(red,{kind:'order.stop',unitId:'red_JG',round:1,requestId:'red-order'});const a=s.view(blue),b=s.view(red);assert.deepEqual(a.commands,[{unitId:'blue_TOP',kind:'order.stop'}]);assert.deepEqual(b.commands,[{unitId:'red_JG',kind:'order.stop'}]);for(const v of [a,b]){assert.equal(JSON.stringify(v).includes('privateSeed'),false);assert.equal(JSON.stringify(v).includes('receipts'),false);assert.equal(v.events.length,1)}});
 check('13 storage file is not world-readable by default',()=>{const s=fresh();assert.equal(statSync(file).mode&0o077,0)});
 check('14 corrupted checkpoint fails closed instead of silently resetting',()=>{const s=fresh();writeFileSync(file,'{bad');assert.throws(()=>new Store(file).read(),SyntaxError)});
 console.log('M45 A13 NODE DISK '+count+'/14 PASS; NO_PROCESS_CRASH_OR_RUST');
}finally{rmSync(dir,{recursive:true,force:true})}
