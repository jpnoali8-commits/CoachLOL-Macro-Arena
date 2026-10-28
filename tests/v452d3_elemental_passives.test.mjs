import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,elementalDragonStatsV452d3,ELEMENTAL_DRAKE_RULES_V452D3,abilityCooldown} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const make=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:45223,roundSeconds:10,mode:'bot'});
const test=(label,fn)=>{fn();console.log('✓ V4.5.2d-3 '+label);};
const close=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-6,`${message||'mismatch'}: ${actual} !== ${expected}`);
const add=(a,team,type,n=1)=>{for(let i=0;i<n;i++)assert.equal(a.awardElementalDragonV452d3(team,type,{captureId:`${team}-${type}-${i}`,sourceId:team+'_JG'}).ok,true);};

test('Regras oficiais das seis famílias e varredura 0–3 stacks sem mutação',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');
 const old={ad:u.ad,ap:u.ap,armor:u.armor,mr:u.mr,atkSpeed:u.atkSpeed,abilityHaste:u.abilityHaste};
 assert.deepEqual(Object.keys(ELEMENTAL_DRAKE_RULES_V452D3).sort(),['infernal','mountain','ocean','cloud','hextech','chemtech'].sort());
 for(const type of Object.keys(ELEMENTAL_DRAKE_RULES_V452D3))for(let n=0;n<=3;n++){
  const stat=elementalDragonStatsV452d3(u,Array(n).fill(type));
  assert.equal(stat.counts[type],n);
  close(stat.ad,u.ad*(1+(type==='infernal'?.03*n:0)));
  close(stat.ap,u.ap*(1+(type==='infernal'?.03*n:0)));
  close(stat.armor,u.armor*(1+(type==='mountain'?.05*n:0)));
  close(stat.mr,u.mr*(1+(type==='mountain'?.05*n:0)));
  close(stat.abilityHaste,u.abilityHaste+(type==='hextech'?5*n:0));
  close(stat.bonusAttackSpeedPercent,type==='hextech'?5*n:0);
  close(stat.tenacity,u.tenacity+(type==='chemtech'?6*n:0));
  close(stat.healShieldPower,u.healShieldPower+(type==='chemtech'?6*n:0));
  close(stat.slowResist,u.slowResist+(type==='cloud'?5*n:0));
  close(stat.outOfCombatMoveFraction,type==='cloud'?.05*n:0);
  close(stat.oceanMissingHealthFraction,type==='ocean'?.02*n:0);
 }
 assert.deepEqual(Object.fromEntries(Object.keys(old).map(k=>[k,u[k]])),old,'stats do campeão são imutáveis pelo buff');
});

test('Capturas por equipe têm ledger versionado e deduplicação por respawn do camp',()=>{
 const a=make(),initialRed=a.teams.red.dragons.length;
 add(a,'blue','hextech',3);add(a,'red','mountain',1);
 assert.equal(a.dragonCaptureLedgerV452d3.length,4);
 assert.equal(a.teams.red.dragons.length,initialRed+1);
 const before=a.teams.blue.dragons.length;
 assert.equal(a.awardElementalDragonV452d3('red','cloud',{captureId:'blue-hextech-2'}).ok,false);
 assert.equal(a.teams.blue.dragons.length,before);
 assert.deepEqual(a.dragonCaptureLedgerV452d3.filter(e=>e.type==='hextech').map(e=>e.quantity),[1,2,3]);
 assert.equal(a.dragonCaptureLedgerV452d3[0].patch,'26.21');
 assert.equal(a.dragonCaptureLedgerV452d3[0].schema,'coachlol.dragon.capture.v1');
 assert.equal(a.elementalStatsV452d3(a.units.find(u=>u.id==='red_TOP')).counts.hextech,0);
 add(a,'blue','infernal',1);
 assert.equal(a.teams.blue.soulTypeV452,'infernal','Alma é separada dos passivos');
});

test('Infernal muda AD/AP efetivos sem multiplicar uma segunda vez dano bruto ou stats de itens',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP'),foe=a.units.find(x=>x.id==='red_TOP');
 a.gameTime=200;foe.x=u.x+.001;foe.y=u.y;
 const aa=a.basicAttackPowerV452c(u,foe),ad=u.ad;
 add(a,'blue','infernal',2);
 close(a.elementalStatsV452d3(u).ad,ad*1.06);
 close(a.basicAttackPowerV452c(u,foe)/aa,1.06);
 assert.equal(u.ad,ad);
 u.ad+=20;u.ap+=70; // simulate item/level recalc, then verify derived source
 close(a.elementalStatsV452d3(u).ad,(ad+20)*1.06);
 close(a.elementalStatsV452d3(u).ap,u.ap*1.06);
});

test('Montanha fortalece somente armor/MR do campeão; não fortalece minions da equipe',()=>{
 const a=make(),vict=a.units.find(x=>x.id==='red_TOP'),att=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=200;vict.hp=vict.maxHp;vict.armor=100;vict.mr=80;att.hp=att.maxHp;
 const hp=vict.hp;a.damage(vict,200,att,'physical','basic');const base=hp-vict.hp;
 vict.hp=vict.maxHp;add(a,'red','mountain',2);
 const hp2=vict.hp;a.damage(vict,200,att,'physical','basic');const buffed=hp2-vict.hp;
 assert.ok(buffed<base);close(a.elementalStatsV452d3(vict).armor,110);
 const minion={id:'m_test',kind:'melee',team:'red',hp:1000,maxHp:1000,armor:100};
 assert.equal(a.elementalStatsV452d3(minion).armor,100);
});

test('Hextech aplica AH ao cast atômico e acelera somente o intervalo AA sem cooldown negativo',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=200;u.skillRanks.Q=1;u.mana=500;u.atkSpeed=1.25;
 const normal=abilityCooldown(u,'Q'),beforeInterval=a.basicAttackIntervalV452c(u);
 add(a,'blue','hextech',3);
 const stats=a.elementalStatsV452d3(u);assert.equal(stats.abilityHaste,15);
 close(a.abilityCooldownV452d3(u,'Q'),normal*100/115);
 close(a.basicAttackIntervalV452c(u),Math.max(.55,beforeInterval/1.15));
 const result=a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',checkRange:false});
 assert.equal(result.ok,true);close(u.skillCds.Q-a.gameTime,a.abilityCooldownV452d3(u,'Q'));
 assert.equal(u.mana,500-result.spentMana);assert.ok(u.skillCds.Q>=a.gameTime);
});

test('Quimtec tenacity reduz CC elegível, preserva knockup e amplia cura/escudo uma vez',()=>{
 const a=make(),target=a.units.find(x=>x.id==='blue_TOP'),enemy=a.units.find(x=>x.id==='red_TOP');
 a.gameTime=200;add(a,'blue','chemtech',2);
 const stun=a.applyEffectV41(target,'stun',{duration:10,source:enemy});close(stun.until-a.gameTime,8.8);
 const knockup=a.applyEffectV41(target,'knockup',{duration:10,source:enemy});close(knockup.until-a.gameTime,10);
 target.hp=target.maxHp-100;
 close(a.effectResolverV41().heal(target,50,target),56);
 const shield=a.applyEffectV41(target,'shield',{source:target,duration:5,power:50,key:'chemtest'});
 const effect=target.statusEffectsV41.find(e=>e.id===shield.id);close(effect.power,56);
});

test('Nuvens: fora de combate +5% OOC por stack e resistência a slow, sem movimento em combate',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');a.gameTime=200;
 u.slowPercent=0;const base=a.effectiveMS(u);
 add(a,'blue','cloud',2);
 assert.ok(a.effectiveMS(u)>base);
 const e=a.applyEffectV41(u,'slow',{source:a.units.find(x=>x.id==='red_TOP'),duration:4,power:.5});
 assert.equal(e.ok,true);close(a.effectResolverV41().slowFraction(u),.45);
 u.combatUntil=a.gameTime+5;
 assert.ok(a.effectiveMS(u)<base,'em combate perde bônus OOC');
});

test('Oceânico cura vida AUSENTE a cada cinco segundos simulados sem overheal',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=204;add(a,'blue','ocean',2);u.hp=u.maxHp-100;
 const backup=a.units;a.units=[u];a.phase='executing';
 a.gameTime=205;a.reviveAndMove();close(u.hp,u.maxHp-96);
 a.gameTime=206;a.reviveAndMove();close(u.hp,u.maxHp-96);
 a.units=backup;
});

test('Morte/respawn e snapshot não acumulam bônus permanentemente nos campos brutos',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=210;add(a,'blue','infernal',3);add(a,'blue','hextech',1);
 const baseAD=u.ad,eff=a.elementalStatsV452d3(u);
 const restored=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());const clone=restored.units.find(v=>v.id===u.id);
 assert.deepEqual(restored.dragonCaptureLedgerV452d3,a.dragonCaptureLedgerV452d3);
 assert.deepEqual(restored.elementalStatsV452d3(clone),eff);
 close(clone.ad,baseAD);
 clone.hp=0;clone.deadUntil=restored.gameTime;restored.phase='executing';
 restored.reviveAndMove();close(restored.elementalStatsV452d3(clone).ad,baseAD*1.09);
 clone.ad+=11;close(restored.elementalStatsV452d3(clone).ad,(baseAD+11)*1.09);
});

test('Sem dragões, cooldown e AA mantêm baseline herdado',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');u.skillRanks.Q=1;
 close(a.abilityCooldownV452d3(u,'Q'),abilityCooldown(u,'Q'));
 close(a.basicAttackIntervalV452c(u),Math.max(.55,u.atkSpeed));
 close(a.basicAttackPowerV452c(u,null),u.ad);
});
console.log('V4.5.2d-3: 10 contratos de passivos elementais aprovados');
