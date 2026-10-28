import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const map=JSON.parse(readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const masks=JSON.parse(readFileSync(new URL('../data/masks_128.json',import.meta.url)));
const make=(mode='manual')=>new Arena(map,masks,{mode,roundSeconds:10,decisionSeconds:60});
function check(label,fn){try{fn();console.log('✓',label)}catch(e){console.error('✗',label);throw e}}
check('preparação de 60s congela mundo (mesmo com chamada tick)',()=>{
 const s=make(),old=s.units.map(u=>[u.x,u.y]);for(let i=0;i<70;i++)s.tick();
 assert.equal(s.gameTime,0);assert.equal(s.waveIndex,0);assert.deepEqual(s.units.map(u=>[u.x,u.y]),old);
});
check('turno só avança após confirmação e execução visível em passos',()=>{
 const s=make();s.lock('blue');s.continueExecution(1);assert.equal(s.gameTime,0); // calling without playTurn must not mutate
 s.teams.blue.ready=false;const run=s.playTurn();assert.equal(run.ok,false); // manual mode: red must confirm
 s.lock('red');assert.equal(s.playTurn().ok,true);assert.equal(s.gameTime,0);
 const a=s.continueExecution(1);assert.equal(s.gameTime,1);assert.equal(a.remaining,9);
});
check('texto com 4 funções, abreviações e red→krugs é parseado',()=>{
 const s=make();const msg='MID farmar safe sem trocar, SUP tentar ficar pockeando e controlar mana e cdr enquanto o ADC farma e nega farm inimigo. Nosso TOP aproveitar 1v1 quando tiver visão e freezar wave.';
 const r=interpretCommands(msg,s);assert.equal(r.ok,true,JSON.stringify(r.errors));assert.deepEqual(r.commands.map(c=>c.role),['MID','SUP','ADC','TOP']);
 const res=applyCommands(r,s);assert.equal(res.ok,true,JSON.stringify(res.errors));
 assert.equal(s.units.find(u=>u.id==='blue_TOP').tactics.wave,'freeze');assert.equal(s.units.find(u=>u.id==='blue_MID').policy,'safe');
 const jungle=interpretCommands('jg vai no red de baixo depois krugs de baixo',s);assert.equal(jungle.ok,true,JSON.stringify(jungle.errors));assert.equal(jungle.commands[0].actions.find(a=>a.type==='plan').payload.length,2);
});
check('AA / kite / on-hit podem ser escolhidos sem combo QWER',()=>{
 const s=make();for(const [phrase,style] of [['ADC AA','aa'],['ADC kite','kite'],['ADC dps on hit','on_hit'],['ADC habilidade + AA','skill_aa']]){
  const pv=interpretCommands(phrase,s);assert.equal(pv.ok,true,phrase+JSON.stringify(pv.errors));assert.equal(applyCommands(pv,s).ok,true);assert.equal(s.units.find(u=>u.id==='blue_ADC').combatStyle,style);
 }
});
check('Nexus protegido por torre, inibidor e guardas; fila da lane respeitada',()=>{
 const s=make(),id=i=>s.structures.find(a=>a.id===i);
 const nexus=id('red_nexus');assert.equal(s.structureVulnerable(nexus),false);assert.equal(s.damage(nexus,100000,s.units[0]),0);
 const tower=id('red_mid_t3');assert.equal(s.structureVulnerable(tower),false);
 for(const t of ['red_mid_t1','red_mid_t2']){assert.ok(s.structureVulnerable(id(t)));id(t).alive=false;}
 assert.ok(s.structureVulnerable(tower));tower.alive=false;
 const inhib=id('red_mid_inhibitor');assert.ok(s.structureVulnerable(inhib));inhib.alive=false;
 assert.equal(s.structureVulnerable(nexus),false);
 for(const g of ['red_nexus_guard_1','red_nexus_guard_2']){assert.ok(s.structureVulnerable(id(g)));id(g).alive=false;}
 assert.ok(s.structureVulnerable(nexus));assert.ok(s.damage(nexus,100,s.units[0])>0);
});
check('minions param na torre viva e torre mata a wave',()=>{
 const s=make();s.finishPreparation();
 const tower=s.structures.find(a=>a.id==='red_mid_t1'),line=s.lanes.mid,p=s.lineProgress(line,tower);
 const min={id:'wave_test',team:'blue',lane:'mid',progress:p-.025,hp:240,maxHp:240,kind:'melee',range:.021,speed:.006,spawnAt:0,damage:20,armor:0,attackAt:0,interval:2};
 const getPos=()=>{let d=line.total*min.progress,i=1;while(i<line.lens.length-1&&line.lens[i]<d)i++;const seg=(d-line.lens[i-1])/Math.max(1e-8,line.lens[i]-line.lens[i-1]);return {x:line.path[i-1].x+(line.path[i].x-line.path[i-1].x)*seg,y:line.path[i-1].y+(line.path[i].y-line.path[i-1].y)*seg}}
 Object.assign(min,getPos());s.minions=[min];s.units=[];
 const hp=tower.hp;for(let i=0;i<18;i++){s.gameTime++;s.buildMinionIndex();s.moveMinions();s.buildMinionIndex();s.resolveCombat();}
 assert.ok(min.progress<=p+1e-6,`minion bypassed tower progress=${min.progress} > ${p}`);assert.ok(tower.hp<hp,'minion must damage tower');assert.ok(min.hp<240,'tower must return fire');
});
check('recusar duelo/recuar não torna atacante sem dano se inimigo continua no range',()=>{
 const s=make();s.finishPreparation();s.units.forEach(u=>{u.autoFollow=false;u.autoJungle=false;u.autoAttack=false;u.x=.1;u.y=.1});s.structures=[];s.minions=[];
 const a=s.units.find(u=>u.id==='blue_ADC'),b=s.units.find(u=>u.id==='red_ADC');a.x=.45;a.y=.45;b.x=.454;b.y=.45;a.autoAttack=true;a.order={kind:'attack',targetId:b.id,combatStyle:'aa'};
 b.autoRespond=false;s.resolveCombat();assert.ok(b.hp<b.maxHp,'o primeiro ataque independe da aceitação');
 assert.ok(Object.values(s.duelRequests).some(r=>r.state==='engaged'),'há registro de um ataque efetuado');
 s.gameTime++;s.processAmbushResponses();assert.ok(Object.values(s.duelRequests).some(r=>r.state==='pending'));
 assert.ok(s.respondToDuel('red',b.id,'retreat'));assert.ok(b.retreatUntil>s.gameTime);
 s.gameTime++;s.resolveCombat();assert.ok(b.hp<b.maxHp||b.shield<1,'ranged AA must connect despite retreat');
 b.x=.9;b.y=.9;const hp=b.hp;s.gameTime++;s.resolveCombat();assert.equal(b.hp,hp,'out-of-range attacks must not connect');
});
check('jungle concede CS e XP ao campeão que limpa o campo',()=>{
 const s=make();s.finishPreparation();s.units.forEach(u=>{u.autoFollow=false;u.autoJungle=false;u.autoAttack=false;u.x=.11;u.y=.11});
 const j=s.units.find(u=>u.id==='blue_JG'),camp=s.camps.find(c=>c.timerKey==='red'&&c.y>.5);
 j.x=camp.x;j.y=camp.y;j.order={kind:'jungle'};j.ad=600;camp.alive=true;camp.health=85;s.gameTime=90;
 const xp=j.xp;s.updateObjectives();assert.ok(!camp.alive,'camp cleared');assert.ok(j.cs>=1,'JG CS must increase');assert.ok(j.xp>xp,'JG XP must increase');
});
check('decisão de confronto congela o tabuleiro sem avanço escondido',()=>{
 const s=make();s.finishPreparation();s.phase='executing';s.executionRemaining=5;
 const initial=s.units.map(u=>[u.x,u.y,u.hp]);const t=s.gameTime;
 assert.equal(s.pauseForDecision('encounter','blue_ADC','red_ADC'),true);
 const r=s.continueExecution(3);assert.equal(r.paused,true);
 s.tick();assert.equal(s.gameTime,t);assert.deepEqual(s.units.map(u=>[u.x,u.y,u.hp]),initial);
 assert.ok(s.pendingDecision);s.answerDecision();assert.equal(s.pendingDecision,null);
 assert.equal(s.continueExecution(1).simulated,1);
});
const h=readFileSync(new URL('../index.html',import.meta.url),'utf8'),js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
check('HUD com campo texto + pausa por escolha + opções AA',()=>{
 assert.match(h,/id="textOrders"/);assert.match(h,/id="combatModes"/);assert.match(js,/continueExecution\(1\)/);
 assert.doesNotMatch(js,/match\.startLiveWindow\(\)/);assert.match(js,/match\.pendingDecision/);
});
console.log('10 contratos de produto v1.6 testados.');
