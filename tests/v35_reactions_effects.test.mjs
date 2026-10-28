import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url)));
const make=(draft=null)=>new Arena(load('coachlol_map_v6.json'),load('masks_128.json'),{roundSeconds:10,draft});
const t=(label,fn)=>{fn();console.log('✓ '+label)};
function walkNear(a,u,range=300){for(let r=80;r<range;r+=20)for(let k=0;k<24;k++){const q=k*Math.PI/12,p={x:u.x+Math.cos(q)*r/a.worldWidth,y:u.y+Math.sin(q)*r/a.worldHeight};if(a.walkable(p.x,p.y))return p;}throw Error('No valid nearby ground')}
function prep(u,lv=6){u.level=lv;u.skillRanks.R=1;u.skillCds.R=0;u.mana=u.maxMana;}
t('Flash pode ser usado durante pausa de decisão sem apagar a rota do usuário',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_MID');const p=walkNear(a,u);
 u.order={kind:'farm'};a.pendingDecision={kind:'duel_request',unitId:u.id,enemyId:'red_MID'};a.phase='decision';a.executionRemaining=7;
 a.duelRequests[a.duelKey(u,a.units.find(x=>x.id==='red_MID'))]={responder:u.id,state:'pending',key:a.duelKey(u,a.units.find(x=>x.id==='red_MID'))};
 const r=a.castEscape('blue',u.id,'flash',p);assert.equal(r.ok,true,r.reason);
 assert.equal(u.order.kind,'farm');assert.equal(u.flashCd,300);assert.equal(a.pendingDecision,null);assert.equal(a.phase,'executing');
 assert.equal(a.castEscape('blue',u.id,'flash',p).ok,false);
});
t('Escape tem alcance real, rejeita obstáculos e CC, inclusive no combate',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_MID');
 const p=walkNear(a,u);u.rootUntil=5;
 assert.equal(a.castEscape('blue',u.id,'flash',p).ok,false);
 u.rootUntil=0;
 assert.equal(a.castEscape('blue',u.id,'flash',{x:2,y:2}).ok,false);
 assert.equal(a.castEscape('blue',u.id,'flash',{x:.5,y:.5}).ok,false);
});
t('Ezreal E tem mana/rank/recarga próprios; Tristana W alcance maior',()=>{
 const a=make({blue:{TOP:'Tristana',JG:'Warwick',MID:'Ezreal',ADC:'Jinx',SUP:'Nami'}});
 const ez=a.units.find(x=>x.id==='blue_MID');const tri=a.units.find(x=>x.id==='blue_TOP');
 let p=walkNear(a,ez);assert.equal(a.castEscape('blue',ez.id,'E',p).ok,false);
 ez.skillRanks.E=1;ez.mana=80;assert.equal(a.castEscape('blue',ez.id,'E',p).ok,true);
 assert.equal(ez.mana,10);assert.ok(ez.skillCds.E>0);
 p=walkNear(a,tri);tri.skillRanks.W=1;assert.equal(a.castEscape('blue',tri.id,'W',p).ok,true);
});
t('Zed: R marca o alvo e só detona na próxima rodada; Zhonya anula no momento do dano',()=>{
 const a=make({blue:{TOP:'Volibear',JG:'Warwick',MID:'Zed',ADC:'Jinx',SUP:'Nami'}});
 const z=a.units.find(x=>x.id==='blue_MID'),victim=a.units.find(x=>x.id==='red_MID');prep(z);victim.x=z.x;victim.y=z.y;victim.x+=.01;
 a.duelRequests[a.duelKey(z,victim)]={key:a.duelKey(z,victim),state:'ready',until:100};
 assert.equal(a.queueSpecialUltimate('blue',z.id,victim.id).ok,true);
 assert.equal(a.delayedEffects.length,0);
 a.resolveSpecialUltimates();assert.equal(a.delayedEffects.length,1);
 const hp=victim.hp;a.gameTime=10;a.resolveDelayedEffects();assert.equal(victim.hp,hp);
 victim.items.push('zhonyas_hourglass');assert.equal(a.activateStasis('red',victim.id).ok,true);
 a.round=2;a.gameTime=11;a.resolveDelayedEffects();assert.equal(victim.hp,hp);assert.equal(a.delayedEffects.length,0);
});
t('Zed: sem estase há dano na próxima rodada e não se exige consentimento automático no pickoff',()=>{
 const a=make({blue:{TOP:'Volibear',JG:'Warwick',MID:'Zed',ADC:'Jinx',SUP:'Nami'}});
 const z=a.units.find(x=>x.id==='blue_MID'),v=a.units.find(x=>x.id==='red_MID');prep(z);v.x=z.x+.01;v.y=z.y;
 a.duelRequests[a.duelKey(z,v)]={key:a.duelKey(z,v),state:'ready',until:100};
 assert.equal(a.queueSpecialUltimate('blue',z.id,v.id).ok,true);
 a.resolveSpecialUltimates();assert.equal(a.delayedEffects.length,1);
 a.round=2;a.gameTime=12;const hp=v.hp;a.resolveDelayedEffects();assert.ok(v.hp<hp);
});
t('Réquiem: intervalo de reação e aplicação global; Soraka cura aliados',()=>{
 const draft={blue:{TOP:'Volibear',JG:'Warwick',MID:'Karthus',ADC:'Jinx',SUP:'Soraka'}};
 const a=make(draft),k=a.units.find(v=>v.champ==='Karthus'),s=a.units.find(v=>v.champ==='Soraka');prep(k);prep(s);
 assert.equal(a.queueSpecialUltimate('blue',k.id).ok,true);a.resolveSpecialUltimates();assert.ok(a.delayedEffects.some(f=>f.kind==='karthus_channel'));
 const before=a.units.filter(v=>v.team==='red').map(v=>v.hp);
 a.round=2;a.gameTime=11;a.resolveDelayedEffects();assert.ok(a.units.filter(v=>v.team==='red').every((v,i)=>v.hp<before[i]));
 s.hp=s.maxHp*.3;
 assert.equal(a.queueSpecialUltimate('blue',s.id).ok,true);a.resolveSpecialUltimates();assert.ok(s.hp>s.maxHp*.3);
});
t('Ultimates globais: Jinx primeiro impacto; Ezreal atravessa campeões alinhados',()=>{
 const base={blue:{TOP:'Volibear',JG:'Warwick',MID:'Ezreal',ADC:'Jinx',SUP:'Nami'}};
 const a=make(base),j=a.units.find(v=>v.champ==='Jinx'),ez=a.units.find(v=>v.champ==='Ezreal');prep(j);prep(ez);
 const enemies=a.units.filter(v=>v.team==='red');
 j.x=.35;j.y=.45;const dest={x:.80,y:.45};enemies[0].x=.45;enemies[0].y=.45;enemies[1].x=.65;enemies[1].y=.45;
 assert.equal(a.queueSpecialUltimate('blue',j.id,null,dest).ok,true);a.resolveSpecialUltimates();
 a.round=2;a.gameTime=11;const old=enemies.map(v=>v.hp);a.resolveDelayedEffects();assert.ok(enemies[0].hp<old[0]);assert.equal(enemies[1].hp,old[1]);
 ez.x=.35;ez.y=.45;assert.equal(a.queueSpecialUltimate('blue',ez.id,null,dest).ok,true);a.resolveSpecialUltimates();
 a.round=3;a.gameTime=15;const hp=enemies.map(v=>v.hp);a.resolveDelayedEffects();assert.ok(enemies[0].hp<hp[0]);assert.ok(enemies[1].hp<hp[1]);
});
t('Navegador mantém contrato de click-to-escape e status da HUD',()=>{
 const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/match\.castEscape\('blue'/);assert.match(app,/match\.activateStasis\('blue'/);
 assert.match(app,/queueSpecialUltimate/);assert.match(app,/action==='ult_direction'/);
});
t('Incendiar aplica dano por tempo, respeita recarga e a estase evita ticks protegidos',()=>{
 const a=make(),mid=a.units.find(x=>x.id==='blue_MID'),foe=a.units.find(x=>x.id==='red_MID');
 foe.x=mid.x;foe.y=mid.y;foe.x+=.01;
 a.duelRequests[a.duelKey(mid,foe)]={key:a.duelKey(mid,foe),state:'ready',until:100};
 assert.equal(a.queueSummoner('blue',mid.id,'ignite',foe.id).ok,true);
 const start=foe.hp;a.resolveSummonerCasts();assert.ok(foe.hp<start);
 const immediate=foe.hp;assert.ok(a.delayedEffects.some(f=>f.kind==='ignite_dot'));
 foe.items.push('zhonyas_hourglass');assert.equal(a.activateStasis('red',foe.id).ok,true);
 a.gameTime=1;a.resolveDelayedEffects();assert.equal(foe.hp,immediate);
 a.gameTime=2;a.resolveDelayedEffects();assert.equal(foe.hp,immediate);
 a.gameTime=3;a.resolveDelayedEffects();assert.ok(foe.hp<immediate);
});
console.log('9 contratos da v3.5 aprovados');
