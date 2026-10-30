/** M45 A03 isolated V8 diagnostic. PASS means LEGACY vulnerability reproduced, NOT G3 secure.
 * Source 374d87d5f49b52514ec68bbe666df086363c1ec5, blob 1737f4f675bd9cc5ed0a48defc68b2fddc124d71. Requires engine.mjs file only, no assets.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const src=readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
const sha=createHash('sha1').update('blob '+Buffer.byteLength(src)+String.fromCharCode(0)).update(src).digest('hex');
assert.equal(sha,'1737f4f675bd9cc5ed0a48defc68b2fddc124d71','Source changed, regenerate baseline');
const method=(start,end,name)=>{
 const a=src.indexOf(start),b=src.indexOf(end,a);
 assert.ok(a>=0&&b>a,name+' boundary not found');
 return Function('return ({'+src.slice(a,b).trim()+'}).'+name)();
};
const event=method(" event(text,team=null,kind='info',unitId=null,details=null){",'\n // A legal push','event');
const perspective=method(' perspective(team){','\n // Skill ranks','perspective');
function mock(){
 const t=()=>({kills:0,dragons:[],baronUntil:0,elderUntil:0});
 return {round:1,gameTime:200,eventCounter:0,events:[],lastTacticalAlerts:[],
  units:[],minions:[],structures:[],camps:[],wards:[],teams:{blue:t(),red:t()},
  visionSources:()=>[],canSeePoint:()=>false,visible:()=>false,wardKnownTo:()=>false,
  campKnowledge:{blue:{},red:{}},heraldMercenariesV45:[],objectiveLedgerV44:[],teamfightLedgerV44:[]};
}
let checks=0;
const show=(label,create)=>{
 const arena=mock();create(arena);
 const data=perspective.call(arena,'red').events;
 checks++;console.log('OBSERVED '+label+' red_count='+data.length);
 return data;
};
let a=show('anonymous generated private flag false',arena=>event.call(arena,'campeão não observado usou Flash'));
assert.equal(a.length,1);assert.equal(a[0].public,false);
a=show('unclassified private field',arena=>event.call(arena,'CANARY',null,'info',null,{private:true,internal:'SECRET'}));
assert.equal(a.length,1);assert.equal(a[0].internal,'SECRET');
a=show('public string false truthy',arena=>event.call(arena,'PRIVATE','blue','info','blue_TOP',{public:'false'}));
assert.equal(a.length,1);
a=show('blue owner event hidden',arena=>event.call(arena,'OWN_BLUE','blue','purchase','blue_TOP'));
assert.equal(a.length,0);
a=show('explicit global public visible',arena=>event.call(arena,'GLOBAL',null,'objective',null,{public:true}));
assert.equal(a.length,1);
console.log('DIAGNOSTIC_ONLY '+checks+'/5, LEGACY_GAP_CONFIRMED, G3 NOT_CERTIFIED');
