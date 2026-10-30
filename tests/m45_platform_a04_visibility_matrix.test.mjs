/**
 * M45 PLATFORM-A04: source-pinned legacy team projection / event goldens.
 * These are ISOLATED REAL METHODS, not full engine or network certification.
 * Run: node tests/m45_platform_a04_visibility_matrix.test.mjs
 * Source integration 374d87d5f49b52514ec68bbe666df086363c1ec5; engine blob 1737f4f675bd9cc5ed0a48defc68b2fddc124d71.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const s=readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
const sha=createHash('sha1').update('blob '+Buffer.byteLength(s)+String.fromCharCode(0)).update(s).digest('hex');
assert.equal(sha,'1737f4f675bd9cc5ed0a48defc68b2fddc124d71','source drift: regenerate and review golden');
function extract(start,end,name){
 const i=s.indexOf(start),j=s.indexOf(end,i);
 assert.ok(i>=0&&j>i,'method boundary changed: '+name);
 return Function('return ({'+s.slice(i,j).trim()+'}).'+name)();
}
const emit=extract(" event(text,team=null,kind='info',unitId=null,details=null){",'\n // A legal push','event');
const view=extract(' perspective(team){','\n // Skill ranks','perspective');
function arenaFixture(){
 const team=()=>({kills:0,dragons:[],baronUntil:0,elderUntil:0});
 const a={
  round:2,gameTime:120,eventCounter:0,events:[],lastTacticalAlerts:[],
  units:[
   {id:'blue_TOP',team:'blue',champ:'B',role:'TOP',klass:'fighter',x:.2,y:.2,hp:100,maxHp:500,mana:50,maxMana:300,level:3,
    items:['PRIVATE_BLUE_ITEM'],order:{kind:'PRIVATE_BLUE_ORDER'}},
   {id:'red_TOP',team:'red',champ:'R',role:'TOP',klass:'mage',x:.8,y:.8,hp:200,maxHp:500,mana:100,maxMana:400,level:4,
    items:['PRIVATE_RED_ITEM'],order:{kind:'PRIVATE_RED_ORDER'},debugSecret:'PRIVATE_RED_SECRET'}
  ],
  minions:[{id:'blue_m',team:'blue',hp:40},{id:'red_m',team:'red',hp:50}],
  structures:[],
  camps:[
   {id:'red_camp',timerKey:'red',x:.8,y:.8,alive:false,respawnAt:500,health:0,maxHealth:100,aggroId:'PRIVATE_AGGRO'},
   {id:'baron_camp',timerKey:'baron',x:.8,y:.8,alive:false,lastClearedAt:90,respawnAt:500,health:0,maxHealth:8000,aggroId:'PRIVATE_AGGRO'}
  ],
  wards:[
   {id:'blue_ward',team:'blue',type:'control',x:.2,y:.2,hp:1,maxHp:1,privateFlag:'blue-only'},
   {id:'red_ward',team:'red',type:'stealth',x:.8,y:.8,hp:1,maxHp:1,privateFlag:'red-only'}
  ],
  teams:{blue:team(),red:team()},campKnowledge:{blue:{},red:{}},
  heraldMercenariesV45:[],objectiveLedgerV44:[],teamfightLedgerV44:[],
  visionSources:()=>[],canSeePoint:()=>false,
  visible:(who,unit)=>unit.team===who,
  wardKnownTo:()=>false
 };
 return a;
}
let passed=0;
function check(label,fn){fn();passed++;console.log('LEGACY GOLDEN '+label);}
const a=arenaFixture();
check('01 hidden champions/minions filtered for both teams',()=>{
 const b=view.call(a,'blue'),r=view.call(a,'red');
 assert.deepEqual(b.units.map(x=>x.id),['blue_TOP']);
 assert.deepEqual(r.units.map(x=>x.id),['red_TOP']);
 assert.deepEqual(b.minions.map(x=>x.id),['blue_m']);
 assert.deepEqual(r.minions.map(x=>x.id),['red_m']);
});
check('02 enemy visible champion uses explicit public field subset',()=>{
 a.visible=(who,u)=>u.team===who||u.id==='red_TOP';
 const b=view.call(a,'blue'),enemy=b.units.find(x=>x.id==='red_TOP');
 assert.ok(enemy);
 assert.deepEqual(Object.keys(enemy),['id','team','role','champ','klass','x','y','hp','maxHp','mana','maxMana','level']);
 assert.equal(Object.hasOwn(enemy,'items'),false);
 assert.equal(Object.hasOwn(enemy,'order'),false);
 assert.equal(Object.hasOwn(enemy,'debugSecret'),false);
});
check('03 ward visibility and subset',()=>{
 a.wardKnownTo=(who,w)=>who==='blue'&&w.id==='red_ward';
 const b=view.call(a,'blue');
 assert.deepEqual(b.wards.map(x=>x.id),['blue_ward','red_ward']);
 const redWard=b.wards.find(w=>w.id==='red_ward');
 assert.deepEqual(Object.keys(redWard),['id','team','type','x','y','hp','maxHp']);
 assert.equal(Object.hasOwn(redWard,'privateFlag'),false);
});
check('04 hidden camp timers/health are vision-gated',()=>{
 const b=view.call(a,'blue');
 const normal=b.camps.find(x=>x.id==='red_camp');
 const epic=b.camps.find(x=>x.id==='baron_camp');
 assert.equal(normal.alive,null);assert.equal(normal.unknown,true);
 assert.equal(normal.knownRespawnAt,null);assert.equal(Object.hasOwn(normal,'health'),false);
 assert.equal(epic.knownRespawnAt,500);
 assert.equal(Object.hasOwn(epic,'aggroId'),false);
});
check('05 observed/owner/public events vs anonymous events',()=>{
 emit.call(a,'BLUE_PRIVATE','blue','purchase','blue_TOP');
 emit.call(a,'RED_PRIVATE','red','purchase','red_TOP');
 emit.call(a,'PUBLIC_GLOBAL',null,'objective',null,{public:true});
 emit.call(a,'NO_OWNER_PRIVATE_BY_DEFAULT');
 const b=view.call(a,'blue'),r=view.call(a,'red');
 assert.equal(b.events.some(e=>e.text==='RED_PRIVATE'),false);
 assert.equal(r.events.some(e=>e.text==='BLUE_PRIVATE'),false);
 for(const v of [b,r]){
  assert.equal(v.events.some(e=>e.text==='PUBLIC_GLOBAL'),true);
  // This explicitly documents an unsafe LEGACY observation: Rust MUST reject.
  assert.equal(v.events.some(e=>e.text==='NO_OWNER_PRIVATE_BY_DEFAULT'),true);
 }
});
check('06 observed event leaks extra unwhitelisted details in legacy',()=>{
 emit.call(a,'OBSERVED_RED_ACTION','red','skill_vfx','red_TOP',{observedBy:['blue'],internalSecret:'INTERNAL_FIELD_LEAK'});
 const b=view.call(a,'blue');
 const seen=b.events.find(e=>e.text==='OBSERVED_RED_ACTION');
 assert.ok(seen);assert.equal(seen.internalSecret,'INTERNAL_FIELD_LEAK');
});
check('07 truthy public string is accepted in legacy, Rust must require boolean true',()=>{
 emit.call(a,'STRING_FALSE','red','info','red_TOP',{public:'false'});
 const b=view.call(a,'blue');
 assert.equal(b.events.some(e=>e.text==='STRING_FALSE'),true);
});
console.log('M45 PLATFORM A04 ISOLATED LEGACY GOLDENS '+passed+'/7 PASS; G3_NOT_CERTIFIED');
