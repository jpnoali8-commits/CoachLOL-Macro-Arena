import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,OBJECTIVE_BUFF_RULES_V452} from '../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const make=()=>new Arena(read('coachlol_map_v6.json'),read('masks_128.json'),{seed:4524,roundSeconds:10,mode:'bot'});
const test=(name,fn)=>{fn();console.log('✓ V4.5.2d '+name);};
const eq=(x,y)=>assert.ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);

test('Barão separa melee/caster/canhão/super sem mutar os atributos-base',()=>{
 const a=make(),holder=a.units.find(u=>u.id==='blue_TOP');
 a.gameTime=1200;holder.baronBuffUntilV452=1380;
 for(const kind of ['melee','caster','siege','super']){
  const m={id:'m_'+kind,kind,team:'blue',x:holder.x,y:holder.y,damage:100,range:.02,interval:2,hp:200,maxHp:200};
  const before=JSON.stringify(m),buff=a.baronMinionModifiersV452d(m);
  assert.equal(buff.empowered,true);
  assert.equal(JSON.stringify(m),before,'aura não deve alterar atributos-base');
  assert.equal(buff.bonusRange,kind==='siege'?750:kind==='caster'?100:kind==='melee'?75:0);
  assert.equal(buff.bonusAD,kind==='siege'?50:kind==='caster'?20:0);
  if(kind==='siege'){
   eq(buff.intervalMultiplier,2);
   const tower={type:'tower',hp:1000};
   const enhanced=a.baronMinionAttackDamageV452d(m,tower);
   holder.hp=0;
   const ordinary=a.baronMinionAttackDamageV452d(m,tower);
   assert.ok(enhanced>ordinary*2,'canhão deve receber AD e bônus de estrutura');
   holder.hp=holder.maxHp;
  }
 }
});
test('Barão: aura termina imediatamente com morte, distância e expiração',()=>{
 const a=make(),holder=a.units.find(u=>u.id==='blue_TOP');
 a.gameTime=1200;holder.baronBuffUntilV452=1380;
 const m={team:'blue',kind:'caster',x:holder.x,y:holder.y,damage:70};
 assert.equal(a.baronMinionModifiersV452d(m).bonusAD,20);
 m.x=.98;m.y=.98;assert.equal(a.baronMinionModifiersV452d(m).empowered,false);
 m.x=holder.x;m.y=holder.y;holder.hp=0;assert.equal(a.baronMinionModifiersV452d(m).empowered,false);
 holder.hp=holder.maxHp;a.gameTime=1381;assert.equal(a.baronMinionModifiersV452d(m).empowered,false);
});
test('Barão reduz dano de campeão e minion conforme tipo, sem alterar HP máximo',()=>{
 const a=make(),ally=a.units.find(u=>u.id==='blue_TOP'),enemy=a.units.find(u=>u.id==='red_TOP');
 a.gameTime=1200;ally.baronBuffUntilV452=1380;
 const mk=kind=>({id:'m_buff_'+kind,kind,team:'blue',x:ally.x,y:ally.y,hp:1000,maxHp:1000,armor:0});
 let melee=mk('melee');a.damage(melee,100,enemy,'physical','basic');eq(melee.hp,950);
 let caster=mk('caster');a.damage(caster,100,enemy,'physical','basic');eq(caster.hp,950);
 let meleeVsMinion=mk('melee');a.damage(meleeVsMinion,100,{team:'red',kind:'melee'},'physical','basic');eq(meleeVsMinion.hp,985);
 assert.equal(melee.maxHp,1000);
 let trueDmg=mk('melee');a.damage(trueDmg,100,enemy,'true','basic');eq(trueDmg.hp,900);
 ally.hp=0;let plain=mk('melee');a.damage(plain,100,enemy,'physical','basic');eq(plain.hp,900);
});
test('Ancião causa burn verdadeira em três ticks discretos, sem recursão',()=>{
 const a=make(),src=a.units.find(u=>u.id==='blue_TOP'),victim=a.units.find(u=>u.id==='red_TOP');
 a.gameTime=1500;src.elderBuffUntilV452=1650;victim.hp=victim.maxHp;
 const start=victim.hp;
 a.damage(victim,5,src,'true','spell');
 const afterHit=victim.hp;
 assert.ok(afterHit<start);
 assert.equal(victim.elderBurnV452d.remaining,3);
 assert.equal(victim.elderBurnV452d.nextAt,1501);
 const oneThird=OBJECTIVE_BUFF_RULES_V452.elderBurnTotalMin/3;
 a.resolveElderBurnV452d();eq(victim.hp,afterHit);
 for(let i=1;i<=3;i++){
  a.gameTime=1500+i;a.resolveElderBurnV452d();
  eq(victim.hp,afterHit-i*oneThird);
  assert.equal(victim.elderBurnV452d?.remaining??0,Math.max(0,3-i));
 }
 a.gameTime=1504;a.resolveElderBurnV452d();eq(victim.hp,afterHit-3*oneThird);
});
test('Ancião: burn preserva fonte, não revela ações ocultas e respeita estase',()=>{
 const a=make(),src=a.units.find(u=>u.id==='blue_TOP'),victim=a.units.find(u=>u.id==='red_TOP');
 a.gameTime=1800;src.elderBuffUntilV452=1950;
 a.damage(victim,10,src,'true','spell');
 let snap=a.snapshotV40(),copy=Arena.fromSnapshotV40(a.map,a.mask,snap);
 assert.deepEqual(copy.units.find(u=>u.id===victim.id).elderBurnV452d,victim.elderBurnV452d);
 src.hp=0;const old=victim.hp;
 a.gameTime=1801;victim.stasisUntil=1802;a.resolveElderBurnV452d();eq(victim.hp,old);
 // Damage is prevented during stasis, and not deferred indefinitely.
 assert.equal(victim.elderBurnV452d.remaining,2);
 a.gameTime=1802;a.resolveElderBurnV452d();assert.ok(victim.hp<old);
 assert.equal(a.hasElderV452(src),false);
 assert.ok(!a.events.some(e=>e.type==='elder_burn'&&e.team==null), 'a burn não cria evento público de intenção');
});
test('Burn do Ancião não cria procs de Alma Infernal ou exposição adicional',()=>{
 const a=make(),src=a.units.find(u=>u.id==='blue_TOP'),victim=a.units.find(u=>u.id==='red_TOP');
 a.gameTime=1500;src.elderBuffUntilV452=1650;a.teams.blue.soulTypeV452='infernal';
 a.damage(victim,5,src,'true','spell');
 const before=victim.hp;const revealBefore=src.revealedUntil?.red||0;
 src.soulProcAtV452=1501; // proc liberado antes dos ticks de burn
 for(let i=1;i<=3;i++){a.gameTime=1500+i;a.resolveElderBurnV452d();}
 eq(victim.hp,before-OBJECTIVE_BUFF_RULES_V452.elderBurnTotalMin);
 assert.equal(src.revealedUntil?.red||0,revealBefore);
 assert.equal(src.soulProcAtV452,1501,'burn não consome proc de alma');
});
test('Ancião escala queimadura por minuto simulado com limite explícito',()=>{
 const a=make(),r=OBJECTIVE_BUFF_RULES_V452;
 eq(a.elderBurnDamageV452d(60),r.elderBurnTotalMin/3);
 eq(a.elderBurnDamageV452d(45*60),r.elderBurnTotalMax/3);
 assert.ok(a.elderBurnDamageV452d(35*60)>a.elderBurnDamageV452d(25*60));
 assert.ok(a.elderBurnDamageV452d(35*60)<a.elderBurnDamageV452d(45*60));
});
console.log('V4.5.2d: 7 contratos de objetivos aprovados');
