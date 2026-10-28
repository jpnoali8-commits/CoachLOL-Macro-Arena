import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';

const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json');
const mask=read('masks_128.json');
const scenarios=[
 {name:'seed36 base',seed:36,top:'Volibear',mid:'Ahri',adc:'Jinx'},
 {name:'seed451 campeões alternativos',seed:451,top:'Darius',mid:'Vex',adc:'Caitlyn'},
 {name:'seed452 alcance misto',seed:452,top:'Warwick',mid:'Lux',adc:'Vayne'}
];
const failures=[];

const forecastArena=new Arena(map,mask,{seed:36,roundSeconds:10,mode:'bot'});
const forecastAttacker=forecastArena.units.find(u=>u.team==='blue'&&u.role==='TOP');
const forecastTarget={id:'m_farm_damage_test',team:'red',lane:'top',kind:'melee',hp:500,maxHp:500,armor:30,shield:0,stasisUntil:0,statusEffectsV41:[]};
const predicted=forecastArena.predictBasicAttackDamageV452c(forecastAttacker,forecastTarget,'auto');
const expected=Math.round(forecastAttacker.ad*100/(100+forecastTarget.armor));
assert.equal(predicted,expected,'nível não pode aplicar uma segunda escala ao AD');
forecastArena.attack(forecastAttacker,forecastTarget,forecastArena.basicAttackPowerV452c(forecastAttacker,forecastTarget,'auto',{commit:true}));
assert.equal(forecastTarget.hp,500-expected,'previsão deve coincidir com o HP removido pelo ataque real');

const timingArena=new Arena(map,mask,{seed:36,roundSeconds:10,mode:'manual'});
const timingFarmer=timingArena.units.find(u=>u.id==='blue_ADC');
timingArena.gameTime=10;timingFarmer.attackAt=10.5;
const timingTarget={id:'m_attack_timing',team:'red',lane:'bot',kind:'caster',x:timingFarmer.x,y:timingFarmer.y,
 hp:200,maxHp:200,armor:0,shield:0,stasisUntil:0,statusEffectsV41:[],spawnAt:0};
const timing=timingArena.captureFarmContextV452c(timingTarget,'blue').farmers.find(f=>f.id===timingFarmer.id);
assert.equal(timing.attackReadyAt,10.5,'telemetria deve preservar cooldown simulado');
assert.equal(timing.attackReady,false);
assert.equal(timing.attackIntervalSeconds,timingArena.basicAttackIntervalV452c(timingFarmer));
assert.equal(timing.attackTimingModel,'class_interval_proxy_1s_tick');
assert.equal(timing.windupSeconds,null,'não declarar windup que o tick de 1s não modela');

const forecastMinionArena=new Arena(map,mask,{seed:36,roundSeconds:10,mode:'manual'});
for(const u of forecastMinionArena.units)u.hp=0;
const targetMinion={id:'m_future_damage_target',team:'red',lane:'top',kind:'caster',x:.5,y:.5,
 hp:200,maxHp:200,armor:0,shield:0,spawnAt:0};
const alliedMinion={id:'m_future_damage_ally',team:'blue',lane:'top',kind:'melee',x:.5,y:.5,
 hp:465,maxHp:465,armor:0,damage:18,range:.014,attackAt:11,interval:1.6,spawnAt:0};
forecastMinionArena.minions.push(targetMinion,alliedMinion);forecastMinionArena.gameTime=10;
forecastMinionArena.buildMinionIndex();
const incoming=forecastMinionArena.captureFarmContextV452c(targetMinion,'blue').upcomingMinionAttacks;
assert.equal(incoming.length,1,'forecast deve incluir o golpe aliado no próximo segundo');
assert.equal(incoming[0].id,alliedMinion.id);
assert.equal(incoming[0].predictedDamage,forecastMinionArena.predictMinionAttackDamageV452c(alliedMinion,targetMinion));
forecastMinionArena.gameTime=11;forecastMinionArena.resolveCombat();
assert.equal(targetMinion.hp,200-incoming[0].predictedDamage,'previsão deve coincidir com dano de minion resolvido');

function simulate(scenario,{roamingADC=false,waveStrategy='normal'}={}){
 const a=new Arena(map,mask,{seed:scenario.seed,roundSeconds:10,mode:'bot',draft:{blue:{
  TOP:scenario.top,MID:scenario.mid,ADC:scenario.adc
 }}});
 a.finishPreparation();a.deployToLane();a.phase='executing';a.detectEncounters=()=>{};
 const attack=a.attack.bind(a);a.farmAttackAuditV452c=[];
 a.attack=(attacker,target,...args)=>{const before=target?.hp;const result=attack(attacker,target,...args);
  if(attacker?.champ&&target?.kind&&target.team!==attacker.team&&Number.isFinite(before))
   a.farmAttackAuditV452c.push({attackerId:attacker.id,minionId:target.id,kind:target.kind,damage:before-target.hp,lethal:target.hp<=0});
  return result;
 };
 a.freezeLastHitAuditV452c=[];
 const recordFarm=a.recordFarmTelemetryV452c.bind(a);
 a.recordFarmTelemetryV452c=(target,attacker,healthBefore,damage,context)=>{recordFarm(target,attacker,healthBefore,damage,context);
  if(waveStrategy==='freeze'&&target.team==='red'){
   const event={lane:target.lane,progress:target.progress,anchor:a.laneFreezeStateV452c(target.lane)?.anchor??null,
    outcome:attacker?.team==='blue'&&attacker?.champ?'secured':'missed'};
   if(event.outcome==='secured')a.freezeLastHitAuditV452c.push(event);
  }
 };
 a.freezeBandViolationsV452c=[];
 const moveMinions=a.moveMinions.bind(a);
 a.moveMinions=()=>{moveMinions();if(waveStrategy!=='freeze')return;
  for(const lane of ['top','mid','bot']){const state=a.laneFreezeStateV452c(lane);if(!state)continue;
   for(const minion of a.minions.filter(m=>m.hp>0&&m.spawnAt<=a.gameTime&&m.lane===lane))
    if(minion.team==='blue'?minion.progress>state.anchor+state.halfWidth+1e-9:minion.progress<state.anchor+state.redOffset-1e-9)
     a.freezeBandViolationsV452c.push({lane,id:minion.id,time:a.gameTime});
  }
 };
 for(const u of a.units)if(u.team==='blue'&&u.role!=='JG')u.tactics.wave=waveStrategy;
 for(const u of a.units)if(u.team==='red'){u.hp=0;u.deadUntil=999;u.autoAttack=false;}
 if(roamingADC){const adc=a.units.find(u=>u.id==='blue_ADC');adc.x=.06;adc.y=.94;adc.manualMoveHold=true;adc.autoFollow=false;}
 for(let second=0;second<300&&!a.ended;second++){a.gameTime++;a.tick();}
 return a;
}

for(const scenario of scenarios){
 const a=simulate(scenario);
 const rows=[];
 for(const [role,lane] of [['TOP','top'],['MID','mid'],['ADC','bot']]){
  const champion=a.units.find(u=>u.team==='blue'&&u.role===role);
  const secured=a.farmTelemetryV452.blue[lane]?.secured||0;
  const minionGold=champion.economyLedgerV43.filter(entry=>entry.kind==='minion').length;
  const securedEvents=a.farmTelemetryV452.events.filter(event=>event.lane===lane&&event.minionTeam==='red'&&event.outcome==='secured');
  rows.push({role,champion:champion.champ,cs:champion.cs,secured,minionGold,deaths:champion.deaths});
  if(champion.cs<35||champion.cs>62)failures.push(scenario.name+' '+role+': '+champion.cs+' CS');
  if(secured!==champion.cs)failures.push(scenario.name+' '+role+': secured='+secured+' CS='+champion.cs);
  if(minionGold!==champion.cs)failures.push(scenario.name+' '+role+': minion gold events='+minionGold+' CS='+champion.cs);
  if(champion.deaths!==0)failures.push(scenario.name+' '+role+': morreu em lane livre');
  if(securedEvents.length!==champion.cs)failures.push(scenario.name+' '+role+': secured telemetry events='+securedEvents.length+' CS='+champion.cs);
  for(const event of securedEvents){
   if(event.killer.id!==champion.id||event.cause!=='champion_last_hit'||event.healthBefore<=0||event.damage<event.healthBefore)
    failures.push(scenario.name+' '+role+': last hit telemetry does not match the real killing blow');
   if(!Array.isArray(event.farmers)||!Array.isArray(event.upcomingMinionAttacks)||event.wave<1)
    failures.push(scenario.name+' '+role+': incomplete per-minion telemetry');
  }
 }
 if(scenario===scenarios[0]){
  if(a.farmTelemetryV452.events.length>512)failures.push('telemetria de farm excedeu o limite de 512 eventos');
  if('farmTelemetryV452' in a.perspective('red'))failures.push('telemetria privada de farm vazou na perspectiva adversária');
  const restored=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());
  if(JSON.stringify(restored.farmTelemetryV452)!==JSON.stringify(a.farmTelemetryV452))failures.push('checkpoint não restaurou telemetria detalhada de farm');
  const capArena=new Arena(map,mask,{seed:36,roundSeconds:10,mode:'bot'});
  const capMinion={id:'m_telemetry_cap',team:'red',lane:'top',kind:'melee',spawnWaveV452c:1};
  for(let event=0;event<513;event++)capArena.recordFarmTelemetryV452c(capMinion,null,100,10,{reason:'out_of_range',farmers:[],upcomingMinionAttacks:[]});
  if(capArena.farmTelemetryV452.events.length!==512)failures.push('telemetria de farm não aplicou o limite de 512 eventos');
 }
 console.log(JSON.stringify({scenario:scenario.name,seed:scenario.seed,waves:a.waveIndex,lanes:rows,invariants:a.validateInvariants().length}));
 assert.deepEqual(a.validateInvariants(),[]);
}

const roaming=simulate(scenarios[0],{roamingADC:true});
const roamingADC=roaming.units.find(u=>u.id==='blue_ADC');
console.log(JSON.stringify({scenario:'ADC fora da lane',seed:scenarios[0].seed,cs:roamingADC.cs,
 telemetry:roaming.farmTelemetryV452.blue.bot}));
if(roamingADC.cs>4)failures.push('ADC fora da lane recebeu '+roamingADC.cs+' CS');
if(!roaming.farmTelemetryV452.events.some(event=>event.lane==='bot'&&event.minionTeam==='red'&&event.missReason==='out_of_range'&&event.farmers.some(farmer=>farmer.id===roamingADC.id)))
 failures.push('telemetria não registrou o ADC fora de alcance');
assert.deepEqual(roaming.validateInvariants(),[]);

assert.deepEqual(failures,[],failures.join('\n'));
console.log('V4.5.2c farm: três rotas, três seeds/lineups e cenário de roaming aprovados.');

for(const waveStrategy of ['freeze','slow_push','fast_push']){
 const a=simulate(scenarios[0],{waveStrategy});
 const rows=[];
 for(const [role,lane] of [['TOP','top'],['MID','mid'],['ADC','bot']]){
  const champion=a.units.find(u=>u.team==='blue'&&u.role===role),secured=a.farmTelemetryV452.blue[lane]?.secured||0;
  rows.push({role,cs:champion.cs,secured,freezeAnchor:champion.waveFreezeAnchorV452c??null,
   deaths:champion.deaths});
  if(champion.cs===0)failures.push(waveStrategy+' '+role+': ficou sem farm em lane livre');
  if(waveStrategy==='freeze'&&champion.cs<10)failures.push('freeze '+role+': menos de 10 CS reais em 5 minutos');
  if(secured!==champion.cs)failures.push(waveStrategy+' '+role+': secured='+secured+' CS='+champion.cs);
 }
 const hits=a.farmAttackAuditV452c;
 if(['freeze','slow_push'].includes(waveStrategy)&&hits.some(hit=>!hit.lethal))
  failures.push(waveStrategy+': ataque básico não letal desrespeitou a política de wave');
 if(waveStrategy==='freeze'){
  for(const lane of ['top','mid','bot']){
   const controller=a.units.find(u=>u.team==='blue'&&u.role===(lane==='top'?'TOP':lane==='mid'?'MID':'ADC'));
   const anchor=controller.waveFreezeAnchorV452c;
   if(!Number.isFinite(anchor))failures.push('freeze '+lane+': não estabeleceu âncora no primeiro choque local');
   else{
    const laneMinions=a.minions.filter(m=>m.lane===lane&&m.spawnAt<=a.gameTime&&m.hp>0);
    const crossed=laneMinions.some(m=>m.team==='blue'?m.progress>anchor+.006001:m.progress<anchor-.001999);
    if(crossed)failures.push('freeze '+lane+': minion cruzou a banda de contenção');
    if(!laneMinions.some(m=>Math.abs(m.progress-anchor)<=.012))failures.push('freeze '+lane+': nenhuma wave permaneceu no ponto de controle');
    if(!a.freezeLastHitAuditV452c.some(event=>event.lane===lane&&Math.abs(event.progress-anchor)<=.012))
     failures.push('freeze '+lane+': nenhum last hit foi registrado na wave mantida localmente');
   }
  }
  if(a.freezeBandViolationsV452c.length)
   failures.push('freeze: minion cruzou a faixa local em '+a.freezeBandViolationsV452c.length+' ticks');
 }
 if(waveStrategy==='fast_push'&&!hits.some(hit=>!hit.lethal))
  failures.push('fast_push: não limpou a wave com ataques não letais');
 assert.deepEqual(a.validateInvariants(),[]);
 console.log(JSON.stringify({scenario:'estratégia '+waveStrategy,seed:scenarios[0].seed,lanes:rows,
  championMinionAttacks:hits.length,nonlethalBasicHits:hits.filter(hit=>!hit.lethal).length}));
}

function firstWaveTarget(strategy,{meleeHp=500,casterHp=500}={}){
 const a=new Arena(map,mask,{seed:36,roundSeconds:10,mode:'manual'}),u=a.units.find(x=>x.id==='blue_MID');
 for(const other of a.units)if(other!==u){other.hp=0;other.deadUntil=999;other.autoAttack=false;}
 u.x=.5;u.y=.5;u.range=.08;u.attackAt=0;u.autoFarm=true;u.autoAttack=true;u.manualMoveHold=true;u.autoFollow=false;
 u.tactics.wave=strategy;u.order={kind:'auto'};u.policy='balanced';
 const melee={id:'m_priority_melee',kind:'melee',team:'red',lane:'mid',x:.501,y:.5,hp:meleeHp,maxHp:500,armor:0,spawnAt:0};
 const caster={id:'m_priority_caster',kind:'caster',team:'red',lane:'mid',x:.503,y:.5,hp:casterHp,maxHp:500,armor:0,spawnAt:0};
 a.minions.push(melee,caster);a.gameTime=10;a.phase='executing';
 const attack=a.attack.bind(a);let first=null;a.attack=(attacker,target,...args)=>{if(attacker?.id===u.id&&target?.kind)first??=target.kind;return attack(attacker,target,...args);};
 a.buildMinionIndex();a.resolveCombat();return first;
}
assert.equal(firstWaveTarget('push'),'melee','push deve priorizar o alvo mais próximo');
assert.equal(firstWaveTarget('fast_push'),'caster','fast_push deve priorizar caster para limpar dano de wave');
assert.equal(firstWaveTarget('freeze',{meleeHp:30,casterHp:40}),'melee','freeze deve buscar o last hit mais próximo do limiar de abate');
assert.equal(firstWaveTarget('slow_push',{meleeHp:30,casterHp:40}),'caster','slow_push deve priorizar caster apenas quando o last hit é letal');

function autoWaveCast(champ,slot){
 const a=new Arena(map,mask,{seed:36,roundSeconds:10,mode:'manual'}),u=a.units.find(x=>x.id==='blue_MID');
 u.champ=champ;u.x=.5;u.y=.5;u.mana=500;u.maxMana=500;u.skillRanks[slot]=1;u.skillCds[slot]=0;
 u.attackAt=100;u.tactics.wave='fast_push';u.order={kind:'auto'};
 for(const other of a.units)if(other!==u){other.hp=0;other.deadUntil=999;other.autoAttack=false;}
 const minions=[];
 for(let i=0;i<3;i++){const minion={id:'m_auto_wave_'+champ+'_'+i,kind:'caster',team:'red',lane:'mid',
  x:.502+i*.0004,y:.5,hp:50,maxHp:600,spawnAt:0,armor:0};minions.push(minion);a.minions.push(minion);}
 a.gameTime=15;a.phase='executing';a.resolveCombat();return {a,u,minions};
}
const namiWave=autoWaveCast('Nami','Q');
assert.equal(namiWave.u.cs,3,'Nami Q deve receber CS apenas pelos minions que realmente matou');
assert.ok(namiWave.minions.every(m=>m.hp===0));
assert.ok(namiWave.u.skillCds.Q>namiWave.a.gameTime);
assert.equal(namiWave.u.mana,440,'Nami Q cobra o custo uma vez');
const namiMana=namiWave.u.mana;
for(let i=0;i<3;i++)namiWave.a.minions.push({id:'m_nami_cooldown_'+i,kind:'caster',team:'red',lane:'mid',x:.502+i*.0004,y:.5,hp:600,maxHp:600,spawnAt:0,armor:0});
namiWave.a.autoWaveSkillV451();assert.equal(namiWave.u.pendingKitCastV42,null,'Q em recarga não deve entrar na fila');
assert.equal(namiWave.u.mana,namiMana);

const luxWave=autoWaveCast('Lux','E');
assert.ok(luxWave.u.luxZoneV42?.autoWaveV451,'Lux E deve criar a zona real do kit');
assert.equal(luxWave.u.mana,430,'Lux E cobra o custo uma vez');
luxWave.a.phase='planning';
const recast=luxWave.a.queueKitSkillV42('blue',luxWave.u.id,'E',luxWave.u.luxZoneV42.point);
assert.ok(recast.ok&&recast.recast,'a detonação deve usar o recast legal do kit');
luxWave.a.resolveKitSkillsV42();
assert.equal(luxWave.u.cs,3,'Lux E deve receber CS somente quando a detonação mata');
assert.ok(luxWave.minions.every(m=>m.hp===0));
assert.equal(luxWave.u.mana,430,'recast de Lux E não cobra mana novamente');
assert.ok(luxWave.u.skillCds.E>luxWave.a.gameTime);
console.log(JSON.stringify({scenario:'fast_push com kits legais',nami:{cs:namiWave.u.cs,mana:namiWave.u.mana},
 lux:{cs:luxWave.u.cs,mana:luxWave.u.mana,recast:true}}));
