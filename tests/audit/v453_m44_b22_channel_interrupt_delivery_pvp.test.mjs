/* M44 B22 — original channel interruption, type taxonomy and fired projectile persistence. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs){
 const other=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:20200,draft:{[side]:{MID:mine},[other]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===other+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(who,slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(who.team,who.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  const fn=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{const r=fn(actor,cmd);if(actor.id===who.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=fn;}
  assert.ok(receipt);return receipt;
 };
 return {a,u,v,cast};
}
const test=(name,mine,theirs,fn)=>cases.push({name,mine,theirs,fn});


test('delivery type is explicit, not a universal fallback','Jhin','Annie',({a})=>{
 for(const [kind,expected] of [
  ['m44_authored_projectile','projectile'],['nami_r','projectile'],
  ['lux_final_spark','beam'],['cone_channel','channel'],
  ['m20_requiem_channel','channel'],['m22_artillery_channel','channel'],
  ['jhin_r_channel','channel'],['m44_b08_karma_burst','delayed_impact'],
  ['m40_sett_haymaker','windup'],['missing-champion-R','unknown']])
  assert.equal(a.m44B22DeliveryKindV453(kind),expected);
});
test('Viktor interrupts original Jhin R future shots','Jhin','Viktor',({a,u,v,cast})=>{
 assert.equal(cast(u,'R').ok,true);assert.ok(u.m16JhinChannel);
 assert.equal(a.m41ViktorStormDisruptV453Dev69(v,u),true);
 assert.equal(u.m16JhinChannel,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(x=>x.kind==='jhin_r_channel'&&x.reason==='viktor_r'&&x.sourceId===v.id));
 assert.equal(a.m44B22CancelChannelsV453(u,'viktor_r',v.id),0);
});
test('Viktor does not delete released original Morgana Q missile','Morgana','Viktor',({a,u,v,cast})=>{
 assert.equal(cast(u,'Q',{point:{x:v.x,y:v.y}}).ok,true);
 const shots=a.boardTemporalV453Dev69.filter(z=>z.kind==='m44_authored_projectile');
 assert.ok(shots.length>0);
 assert.equal(a.m41ViktorStormDisruptV453Dev69(v,u),false);
 assert.ok(a.boardTemporalV453Dev69.some(z=>z.id===shots[0].id));
});
test('Kassadin Q interrupts original Jhin R not the ability hit itself','Jhin','Kassadin',({a,u,v,cast})=>{
 cast(u,'R');assert.ok(u.m16JhinChannel);
 const out=cast(v,'Q',{targetId:u.id});
 assert.equal(out.ok,true);assert.equal(u.m16JhinChannel,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(x=>x.reason==='kassadin_q'&&x.kind==='jhin_r_channel'));
});
test('Miss Fortune R is a cancellable cone, not a projectile','MissFortune','Viktor',({a,u,v,cast})=>{
 const out=cast(u,'R',{point:{x:v.x,y:v.y}});assert.equal(out.ok,true);
 const ch=a.boardTemporalV453Dev69.find(z=>z.kind==='cone_channel'&&z.ownerId===u.id);
 assert.ok(ch);assert.equal(ch.m44B22CastRealmId,null);
 assert.equal(a.m44B22DeliveryKindV453(ch.kind),'channel');
 assert.equal(a.m41ViktorStormDisruptV453Dev69(v,u),true);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.id===ch.id));
});
test('stun cancels Miss Fortune before first damage tick','MissFortune','Annie',({a,u,v,cast})=>{
 cast(u,'R',{point:{x:v.x,y:v.y}});
 a.applyEffectV41(u,'stun',{source:v,duration:3,key:'b22_stun'});
 const hp=v.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='cone_channel'&&z.ownerId===u.id));
 assert.ok(a.m44B22ChannelInterruptHistory.some(x=>x.ownerId===u.id&&x.reason==='cc'));
});
test('Xerath artillery state and channel are both canceled','Xerath','Viktor',({a,u,v,cast})=>{
 cast(u,'R',{point:{x:v.x,y:v.y}});
 const ch=a.boardTemporalV453Dev69.find(z=>z.kind==='m22_artillery_channel'&&z.ownerId===u.id);
 assert.ok(ch);assert.ok(u.m22ArtilleryV453);
 a.m41ViktorStormDisruptV453Dev69(v,u);
 assert.equal(u.m22ArtilleryV453,null);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.id===ch.id));
});
test('Karthus Requiem is canceled by movement before scheduled strike','Karthus','Annie',({a,u,v,cast})=>{
 cast(u,'R');const ch=a.boardTemporalV453Dev69.find(z=>z.kind==='m20_requiem_channel'&&z.ownerId===u.id);
 assert.ok(ch);u.x+=.01;
 const hp=v.hp;a.gameTime+=3;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
 assert.ok(a.m44B22ChannelInterruptHistory.some(x=>x.kind==='m20_requiem_channel'&&x.reason==='movement'));
});
test('Karthus Death Defied retains postmortem Requiem','Karthus','Annie',({a,u,cast})=>{
 cast(u,'R');const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m20_requiem_channel');
 assert.ok(z);
 u.hp=0;u.m23DeathDefiedV453={until:5};
 assert.equal(a.m44B22ChannelInterruptReasonV453(u,z,1),null);
});
test('Miss Fortune channel cancels when cast realm changes','MissFortune','Mordekaiser',({a,u,v,cast})=>{
 cast(u,'R',{point:{x:v.x,y:v.y}});assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='cone_channel'&&z.ownerId===u.id));
 assert.ok(a.m44B22ChannelInterruptHistory.some(x=>x.reason==='realm_change'));
});
test('Jhin R cancels automatically on realm change','Jhin','Mordekaiser',({a,u,v,cast})=>{
 cast(u,'R');assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 a.gameTime+=.1;a.advanceMechanicsV453M16();
 assert.equal(u.m16JhinChannel,null);
 assert.ok(a.m44B22ChannelInterruptHistory.some(x=>x.kind==='jhin_r_channel'&&x.reason==='realm_change'));
});
test('Jhin channel naturally expires without permanent stale state','Jhin','Annie',({a,u,cast})=>{
 cast(u,'R');const expires=u.m16JhinChannel.until;
 a.gameTime=expires+.5;a.advanceMechanicsV453M16();
 assert.equal(u.m16JhinChannel,null);
});
test('interruption leaves unrelated delayed impact intact','Jhin','Viktor',({a,u,v,cast})=>{
 cast(u,'R');
 a.boardTemporalV453Dev69.push({id:99999,kind:'m44_b08_karma_burst',ownerId:u.id,team:u.team,
  point:{x:u.x,y:u.y},radius:250,power:30,nextAt:1,until:2});
 a.m41ViktorStormDisruptV453Dev69(v,u);
 assert.ok(a.boardTemporalV453Dev69.some(z=>z.id===99999));
});
test('interruption journal survives exact snapshot restore','Jhin','Viktor',({a,u,v,cast})=>{
 cast(u,'R');a.m41ViktorStormDisruptV453Dev69(v,u);
 const restored=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(restored.m44B22ChannelInterruptHistory.length,1);
 assert.equal(restored.m44B22ChannelInterruptHistory[0].sourceId,v.id);
});
test('already fired original Jhin R projectile persists after Viktor silence','Jhin','Viktor',({a,u,v,cast})=>{
 cast(u,'R');
 a.gameTime+=1;
 const shot=cast(u,'R',{point:{x:v.x,y:v.y}});
 assert.equal(shot.ok,true);
 const missiles=a.boardTemporalV453Dev69.filter(z=>z.kind==='m44_authored_projectile'&&z.champ==='Jhin');
 assert.ok(missiles.length>0);
 a.m41ViktorStormDisruptV453Dev69(v,u);
 assert.equal(u.m16JhinChannel,null);
 assert.ok(a.boardTemporalV453Dev69.some(z=>z.id===missiles[0].id));
});
let passed=0;const failures=[];
for(const side of ['blue','red'])for(const item of cases){
 try{const f=fixture(side,item.mine,item.theirs);item.fn(f);
 const snap=f.a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));passed++;
 }catch(e){failures.push({side,name:item.name,error:String(e?.stack||e)});}
}
for(const failure of failures)console.error('M44_B22_FAIL',JSON.stringify(failure));
console.log('M44_B22',JSON.stringify({cases:cases.length,seats:2,passed,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
