/**
 * M45 PLATFORM A05 — exact legacy call-expressions executed, NOT entire match.
 * Node: node tests/m45_platform_a05_real_event_callsites.test.mjs
 * Source 374d87d5f49b52514ec68bbe666df086363c1ec5; engine Git blob 1737f4f675bd9cc5ed0a48defc68b2fddc124d71.
 * PASS records known legacy exposure (Rust MUST reverse privacy failures).
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source=readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
const hash=createHash('sha1').update('blob '+Buffer.byteLength(source)+String.fromCharCode(0)).update(source).digest('hex');
assert.equal(hash,'1737f4f675bd9cc5ed0a48defc68b2fddc124d71','Source changed: re-audit required');
function extract(start,end,name){
 const a=source.indexOf(start),b=source.indexOf(end,a);
 assert.ok(a>=0&&b>a,'Unable to extract '+name);
 return Function('return ({'+source.slice(a,b).trim()+'}).'+name)();
}
const legacyEvent=extract(" event(text,team=null,kind='info',unitId=null,details=null){",'\n // A legal push','event');
const legacyView=extract(' perspective(team){','\n // Skill ranks','perspective');
const lines=source.split('\n');
const mkTeam=()=>({kills:0,dragons:[],baronUntil:0,elderUntil:0});
function arenaFixture(){
 return {round:11,gameTime:900,eventCounter:0,events:[],lastTacticalAlerts:[],
  units:[],minions:[],structures:[],camps:[],wards:[],teams:{blue:mkTeam(),red:mkTeam()},
  visionSources:()=>[],canSeePoint:()=>false,visible:()=>false,wardKnownTo:()=>false,
  campKnowledge:{blue:{},red:{}},heraldMercenariesV45:[],objectiveLedgerV44:[],teamfightLedgerV44:[],
  event(...args){return legacyEvent.apply(this,args);}
 };
}
let checks=0;
function check(label,fn){fn();checks++;console.log('A05 LEGACY_DIAGNOSTIC '+label);}
const scenarios=[
 [3921,{u:{champ:'Lee Sin'}},'destino sem passagem'],
 [4147,{u:{champ:'Lee Sin'}},'usou Flash'],
 [5010,{turret:{name:'Torre Vermelha'},attacker:{champ:'Lee Sin'}},'aggro de dive'],
 [5740,{t:{id:'red_top_t1'},victim:{champ:'Lee Sin'}},'eliminou']
];
for(const [line,scope,text] of scenarios){
 check('exact callsite line '+line,()=>{
  const original=lines[line-1],found=original.match(/this\.event\(\x60[^\x60]*\x60\)/);
  assert.ok(found,'Original event callsite not found at '+line);
  const a=arenaFixture();
  Function(...Object.keys(scope),'return function(){'+found[0]+';}')(...Object.values(scope)).call(a);
  assert.equal(a.events.length,1);
  assert.ok(a.events[0].text.includes(text));
  assert.equal(a.events[0].team,null);
  assert.equal(a.events[0].unitId,null);
  assert.equal(a.events[0].public,false);
  assert.equal(legacyView.call(a,'red').events.length,1,
   'Legacy behavior changed: update baseline and check privacy fix');
 });
}
check('owner classified event is not visible to hostile team',()=>{
 const a=arenaFixture();a.event('item purchase','blue','purchase','blue_JG');
 assert.equal(legacyView.call(a,'red').events.length,0);
});
check('details overriding visibility and arbitrary fields leak',()=>{
 const a=arenaFixture();
 a.event('private purchase','blue','purchase','blue_JG',
   {team:null,unitId:null,public:'false',observedBy:[],privateDebug:'A05_SECRET'});
 const red=legacyView.call(a,'red').events;
 assert.equal(red.length,1);
 assert.equal(red[0].privateDebug,'A05_SECRET');
 assert.equal(red[0].public,'false');
});
check('explicit global public remains globally visible',()=>{
 const a=arenaFixture();a.event('Nexus destruido',null,'objective',null,{public:true});
 assert.equal(legacyView.call(a,'blue').events.length,1);
 assert.equal(legacyView.call(a,'red').events.length,1);
});
console.log('A05 '+checks+'/7 ISOLATED LEGACY_CALLSITE_DIAGNOSTIC; SECURITY_G3_NOT_CERTIFIED');
