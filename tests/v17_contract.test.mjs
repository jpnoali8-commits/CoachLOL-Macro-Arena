import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,skillRankCap} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const base=new URL('../',import.meta.url);
const map=JSON.parse(fs.readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const mask=JSON.parse(fs.readFileSync(new URL('../data/masks_128.json',import.meta.url)));
const fresh=(mode='manual')=>new Arena(map,mask,{mode,roundSeconds:10});
const test=(name,run)=>{run();console.log('✓',name)};
test('habilidade inicial exige ponto e R normal bloqueia até 6',()=>{
 const a=fresh(),u=a.units.find(u=>u.id==='blue_ADC');
 assert.equal(u.level,1);assert.equal(u.skillPoints,1);
 assert.equal(a.upgradeSkill('blue',u.id,'R').ok,false);
 assert.equal(a.upgradeSkill('blue',u.id,'W').ok,true);
 assert.equal(u.skillRanks.W,1);assert.equal(a.upgradeSkill('blue',u.id,'Q').ok,false);
 u.skillPoints=1;assert.equal(a.upgradeSkill('blue',u.id,'W').ok,false,'rank 2 of W is illegal at level 1');
 u.level=6;assert.equal(a.upgradeSkill('blue',u.id,'R').ok,true);assert.equal(u.skillRanks.R,1);
 u.skillPoints=1;u.level=10;assert.equal(a.upgradeSkill('blue',u.id,'R').ok,false);
 u.level=11;assert.equal(a.upgradeSkill('blue',u.id,'R').ok,true);u.skillPoints=1;u.level=16;
 assert.equal(a.upgradeSkill('blue',u.id,'R').ok,true);assert.equal(u.skillRanks.R,3);
 assert.equal(skillRankCap({champ:'Karma',level:1},'R'),1);
});
test('XP aumenta nível, dá ponto e auto-up configurado seleciona a skill',()=>{
 const a=fresh(),u=a.units.find(u=>u.id==='blue_MID');
 assert.equal(a.setSkillPlan('blue',u.id,{priority:['E','Q','W'],auto:true}),true);
 assert.equal(u.skillRanks.E,1);assert.equal(u.skillPoints,0);
 a.gainXP(u,760);assert.ok(u.level>=3);assert.ok(u.skillRanks.E>=2);assert.ok(u.skillRanks.Q>=1);
});
test('ordens de ADC por papel e nome são aplicadas sem perder farm nem kite',()=>{
 const a=fresh();const txt='Jinx farm safe e kite com AA; JG red de baixo depois krugs';
 const v=interpretCommands(txt,a);assert.equal(v.ok,true,JSON.stringify(v.errors));
 assert.deepEqual(v.commands.map(c=>c.role),['ADC','JG']);
 assert.equal(applyCommands(v,a).ok,true);
 const adc=a.units.find(v=>v.id==='blue_ADC'),jg=a.units.find(v=>v.id==='blue_JG');
 assert.equal(adc.combatStyle,'kite');assert.equal(adc.order.kind,'farm');assert.equal(adc.autoFarm,true);
 assert.equal(adc.explicitOrder,true);assert.equal(jg.plan.steps.length,2);assert.equal(jg.plan.loopJungle,true);
});
test('prioridade de skills e combo QWER interpretados integralmente',()=>{
 const a=fresh();
 let p=interpretCommands('ADC priorizar upar E Q W',a);assert.equal(p.ok,true,JSON.stringify(p.errors));
 assert.equal(applyCommands(p,a).ok,true);const u=a.units.find(x=>x.id==='blue_ADC');
 assert.deepEqual(u.skillPriority,['E','Q','W']);assert.equal(u.skillRanks.E,1);
 p=interpretCommands('ADC combo Q W E R',a);assert.equal(p.ok,true,JSON.stringify(p.errors));
 assert.deepEqual(p.commands[0].actions.find(x=>x.type==='order').payload.combo,['Q','W','E','R']);
 assert.equal(applyCommands(p,a).ok,true);assert.equal(u.order.kind,'attack');
});
test('jungle ataca o monstro em ciclos (não apenas last hit), ganha XP e CS',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_JG'),camp=a.camps.find(x=>x.timerKey==='red'&&x.y>.5);
 a.finishPreparation();a.phase='executing';a.gameTime=90;a.units.filter(x=>x!==u).forEach(x=>{x.hp=0;});
 u.x=camp.x;u.y=camp.y;u.order={kind:'jungle'};u.autoJungle=false;u.autoFollow=false;
 camp.alive=true;camp.health=520;const initial=camp.health,xp=u.xp;
 a.updateObjectives();assert.ok(camp.health<initial&&camp.health>0,'primeiro golpe não é last-hit');
 a.gameTime++;a.updateObjectives();const hp1=camp.health;
 a.gameTime+=2;a.updateObjectives();assert.ok(camp.health<hp1,'golpe repetido respeita cooldown');
 for(let n=0;n<30&&camp.alive;n++){a.gameTime++;a.updateObjectives();}
 assert.equal(camp.alive,false);assert.ok(u.cs>=1);assert.ok(u.xp>xp);
});
test('rota explicitada mantém controle em waves e em rodadas posteriores',()=>{
 const a=fresh();const u=a.units.find(x=>x.id==='blue_TOP');
 const p=a.findPath(u,{x:.2,y:.72});assert.ok(p);
 assert.equal(a.setPlan('blue',u.id,[{point:{x:.2,y:.72},action:'move',duration:0}]).ok,true);
 u.x=.2;u.y=.72;u.plan.steps[0].path=[];a.finishPreparation();a.phase='executing';
 a.gameTime=31;a.spawnWaves();a.advancePlan(u);assert.equal(u.order.kind,'hold');assert.equal(u.explicitOrder,true);
 const x=u.x,y=u.y;a.gameTime=32;a.reviveAndMove();assert.equal(u.x,x);assert.equal(u.y,y);
 a.phase='planning';a.teams.red.ready=false;a.teams.blue.ready=false;
 assert.equal(a.setOrder('blue',u.id,{kind:'farm'}).ok,true);
 assert.equal(u.order.kind,'farm');assert.equal(u.explicitOrder,true);assert.equal(u.manualMoveHold,false);
});
test('jungle de múltiplas etapas completa e retorna à primeira etapa, sem voltar à lane',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_JG');
 const c=a.camps.filter(c=>c.timerKey==='red'&&c.y>.5)[0];
 const k=a.camps.filter(c=>c.timerKey==='krugs'&&c.y>.5)[0];
 assert.equal(a.setPlan('blue',u.id,[{point:{x:c.x,y:c.y},action:'jungle',duration:0,targetId:c.id},{point:{x:k.x,y:k.y},action:'jungle',duration:0,targetId:k.id}]).ok,true);
 assert.equal(u.explicitOrder,true);
 a.gameTime=91;for(const camp of [c,k]){camp.alive=false;camp.lastClearedAt=91;camp.respawnAt=400;}
 u.x=c.x;u.y=c.y;u.plan.steps[0].path=[];a.advancePlan(u);
 assert.equal(u.plan.index,1);
 u.x=k.x;u.y=k.y;u.plan.steps[1].path=[];a.advancePlan(u);
 assert.equal(u.plan.index,0);assert.equal(u.plan.completed,false);assert.equal(u.explicitOrder,true);
});
test('nome do campeão está sobre avatar e HUD tem comandos de upgrade',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/ctx\.fillText\(u\.champ,p\.x,p\.y-24\)/);
 assert.match(html,/skillUpgradeButtons/);assert.match(html,/autoSkillToggle/);
 assert.match(app,/upgradeSkill\('blue'/);
});
console.log('8 contratos de progressão e ordens v1.7 aprovados');
