// M45: independent JS-authority golden check; Rust parity runs in cargo test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolveNoSmiteObjectiveV452d4Dev9,
  resolveSimultaneousSmiteV452d4Dev9} from '../../engine.mjs';
const fixture=readFileSync(new URL('../fixtures/m45_no_smite.tsv',import.meta.url),'utf8');
let verified=0;
for(const line of fixture.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const [s,c,cy,t,b,r,h,w]=line.split('\t');
  assert.ok(h!==undefined && w!==undefined, 'malformed golden: '+line);
  const result=resolveNoSmiteObjectiveV452d4Dev9(+s,c,+cy,+t,+b,+r);
  assert.equal(result.winner,w==='-'?null:w,line);
  assert.equal(result.blue,Math.max(0,Math.min(5,+b)),line);
  assert.equal(result.red,Math.max(0,Math.min(5,+r)),line);
  const expectedRoll=h==='-'?null:Number(h)/4294967296;
  assert.equal(result.roll,expectedRoll,line);
  assert.equal(result.blueProbability,result.blue/(result.blue+result.red||1),line);
  verified++;
}
for(const [opening,impacts,winner,total] of [
  [1500,[{actorId:'blue_JG',hit:1200},{actorId:'red_JG',hit:900}],'blue_JG',2100],
  [1100,[{actorId:'red_JG',hit:1200},{actorId:'blue_JG',hit:1200}],'blue_JG',2400],
  [100,[{actorId:'red_JG',hit:NaN},{actorId:'blue_JG',hit:0}],null,0]
]) {
  const result=resolveSimultaneousSmiteV452d4Dev9(opening,impacts);
  assert.equal(result.winner?.actorId??null,winner);
  assert.equal(result.total,total);
  verified++;
}
console.log('M45_JS_GOLDENS_PASS '+verified+'/'+verified);
