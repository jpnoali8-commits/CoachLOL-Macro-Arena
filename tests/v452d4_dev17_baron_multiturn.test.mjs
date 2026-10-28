import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const r=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=r('coachlol_map_v6.json'),mask=r('masks_128.json');
let count=0;
function test(name,fn){fn();console.log('✓ DEV17 '+name);count++;}
function fixture(kind='siege',empowered=true){
 const a=new Arena(map,mask,{seed:4517,roundSeconds:10,mode:'bot'});
 a.gameTime=1200;
 const t=a.structures.find(s=>s.id==='red_mid_t1');
 const holder=a.units.find(u=>u.id==='blue_MID');
 for(const u of a.units)u.hp=0;
 holder.hp=holder.maxHp;holder.x=.485;holder.y=.500;
 if(empowered)holder.baronBuffUntilV452=1400;
 const stats={melee:{hp:465,damage:18,range:.014,speed:.013,interval:1.6},caster:{hp:290,damage:27,range:.041,speed:.013,interval:1.5},siege:{hp:835,damage:48,range:.055,speed:.012,interval:2},super:{hp:1600,damage:145,range:.016,speed:.0081,interval:1.65}}[kind];
 const m={id:'dev17_minion',team:'blue',lane:'mid',kind,progress:0,x:.485,y:.5,hp:stats.hp,maxHp:stats.hp,damage:stats.damage,range:stats.range,speed:stats.speed,attackAt:0,interval:stats.interval,spawnAt:0};
 m.progress=a.lineProgress(a.lanes.mid,m);a.minions=[m];a.wards=[];
 return {a,m,t,holder};
}
function step(a,n=1,holderId='blue_MID'){
 const sequence=[];
 for(let i=0;i<n;i++){
  const h=a.units.find(u=>u.id===holderId),m=a.minions.find(x=>x.id==='dev17_minion');
  if(m){h.x=m.x;h.y=m.y;}
  a.buildMinionIndex();a.moveMinions();a.buildMinionIndex();a.resolveCombat();
  const t=a.structures.find(x=>x.id==='red_mid_t1'),min=a.minions.find(x=>x.id==='dev17_minion');
  sequence.push({time:a.gameTime,towerHp:t.hp,minionHp:min?.hp||0,progress:min?.progress??null,attackAt:min?.attackAt??null});
  a.gameTime++;
 }
 return sequence;
}
test('bloqueia disparo remoto apesar de proximidade na spline da rota',()=>{
 const {a,m,t}=fixture();
 const mods=a.baronMinionModifiersV452d(m);
 assert.equal(mods.bonusRange,750);
 assert.ok(a.mapDistance(m,t)>m.range*a.worldWidth+mods.bonusRange+25);
 assert.equal(a.minionCanHitStructureV452d4Dev17(m,t,mods),false);
 a.buildMinionIndex();
 assert.notEqual(a.minionAttackTargetV452c(m)?.id,t.id);
 const turns=step(a,2);
 assert.equal(turns[0].towerHp,t.maxHp);
 assert.equal(turns[1].towerHp,t.maxHp);
});
test('canhão fortalecido percorre ticks e só dispara dentro do alcance 750 adicional',()=>{
 const {a,m,t}=fixture();const observations=[];
 for(let j=0;j<10;j++){
  const hp=t.hp;
  const row=step(a)[0];
  if(row.towerHp<hp){
   const distance=a.mapDistance(m,t),legal=m.range*a.worldWidth+750+25;
   assert.ok(distance<=legal,`ataque da torre fora do range: ${distance} > ${legal}`);
  }
  observations.push(row);
  if(!a.minions.includes(m))break;
 }
 assert.equal(observations[0].towerHp,t.maxHp);
 assert.ok(observations.some(x=>x.towerHp<t.maxHp),'minion deve alcançar e danificar torre');
 assert.ok(observations.some(x=>x.progress>observations[0].progress),'minion deve progredir na rota');
});
test('canhão com Barão chega ao primeiro ataque mais cedo que sem Barão',()=>{
 const buff=fixture('siege',true),base=fixture('siege',false);
 const b=step(buff.a,8),n=step(base.a,8);
 const first=seq=>seq.findIndex(x=>x.towerHp<9000);
 assert.ok(first(b)>=0);
 assert.ok(first(n)>=0);
 assert.ok(first(b)<first(n),`buffed=${first(b)} normal=${first(n)}`);
 assert.ok(b[7].towerHp<n[7].towerHp);
});
test('o cálculo preditivo equivale ao dano efetivo do motor para todas as classes',()=>{
 for(const kind of ['melee','caster','siege','super'])for(const buffed of [false,true]){
  const {a,m,t,holder}=fixture(kind,buffed);
  m.x=t.x;m.y=t.y;holder.x=t.x;holder.y=t.y;
  const forecast=a.predictMinionAttackDamageV452c(m,t);
  const before=t.hp;
  a.attack(m,t,a.baronMinionAttackDamageV452d(m,t));
  assert.equal(before-t.hp,forecast,`previsão divergente ${kind} buff=${buffed}`);
 }
});
test('aura expira sem permanecer no minion e o alcance volta ao normal',()=>{
 const {a,m,t,holder}=fixture();
 const buffed=a.baronMinionModifiersV452d(m);
 a.gameTime=1400;assert.equal(a.baronMinionModifiersV452d(m).empowered,false);
 assert.equal(a.baronMinionModifiersV452d(m).bonusRange,0);
 const noBonus=a.minionCanHitStructureV452d4Dev17(m,t);
 assert.equal(noBonus,false);
 holder.hp=0;
 assert.equal(a.baronMinionModifiersV452d(m).empowered,false);
 assert.equal(buffed.empowered,true);
});
test('snapshot no meio do cerco mantém progresso, torre e próximos ataques determinísticos',()=>{
 const {a}=fixture();step(a,4);
 const restored=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());
 assert.equal(restored.gameTime,a.gameTime);
 const left=step(a,5),right=step(restored,5);
 assert.deepEqual(right,left);
 assert.deepEqual(restored.minions.map(m=>({id:m.id,hp:m.hp,progress:m.progress})),a.minions.map(m=>({id:m.id,hp:m.hp,progress:m.progress})));
});
test('torres invulneráveis e estruturas aliadas não viram alvos do minion',()=>{
 const {a,m,t}=fixture();
 m.x=t.x;m.y=t.y;
 const ally=a.structures.find(s=>s.id==='blue_mid_t1');
 assert.equal(a.minionCanHitStructureV452d4Dev17(m,ally),false);
 const nexus=a.structures.find(s=>s.id==='red_nexus');
 if(nexus)assert.equal(a.minionCanHitStructureV452d4Dev17(m,nexus),false);
});
test('minions regulares e buffados não alteram o bônus base no spawn',()=>{
 const {a,m}=fixture();const raw={hp:m.maxHp,damage:m.damage,range:m.range};
 for(let i=0;i<4;i++)a.baronMinionModifiersV452d(m);
 assert.equal(m.maxHp,raw.hp);assert.equal(m.damage,raw.damage);assert.equal(m.range,raw.range);
});
console.log(`V4.5.2d-4-dev17 ${count}/8 PASS`);
