import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,REACTIONS} from '../engine.mjs';
const map=JSON.parse(readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const mask=JSON.parse(readFileSync(new URL('../data/masks_128.json',import.meta.url)));
const make=(mode='manual')=>{
 const s=new Arena(map,mask,{mode,decisionSeconds:30});
 s.mask={...mask,wall:'0'.repeat(mask.size*mask.size),brush:'0'.repeat(mask.size*mask.size)};
 s.structures=[];s.minions=[];s.camps=[];
 for(const u of s.units){u.autoFollow=false;u.autoJungle=false;u.reaction='balanced';u.policy='balanced';u.autoRespond=false;u.x=.10;u.y=.10;}
 return s;
};
const test=(name,fn)=>{fn();console.log('✓',name)};
test('20 perfis categorizados e configuráveis, para ambos os times',()=>{
 const s=make();assert.ok(REACTIONS.length>=20);assert.ok(new Set(REACTIONS.map(r=>r.group)).size>=4);
 for(const r of REACTIONS){assert.ok(r.hint&&r.icon);assert.equal(s.setReaction('blue','blue_SUP',r.id),true);assert.equal(s.units.find(u=>u.id==='blue_SUP').reaction,r.id);}
 assert.ok(s.setReaction('red','red_SUP','peel_adc'));assert.equal(s.setReaction('blue','blue_SUP','inexistente'),false);
});
test('cura tem alcance, mana e cooldown; não excede HP máximo',()=>{
 const s=make(),n=s.units.find(u=>u.id==='blue_SUP'),j=s.units.find(u=>u.id==='blue_ADC');
 n.x=j.x=.48;n.y=j.y=.46;j.hp=j.maxHp-280;n.mana=100;
 s.setReaction('blue',n.id,'heal');s.applyReaction(n);
 assert.ok(j.hp>j.maxHp-280&&j.hp<=j.maxHp);assert.equal(n.mana,60);
 const hp=j.hp;s.applyReaction(n);assert.equal(j.hp,hp,'cooldown prevents infinite heal');
});
test('peel no ADC dá escudo ao carry quando ameaçado e custa mana',()=>{
 const s=make(),sup=s.units.find(u=>u.id==='blue_SUP'),adc=s.units.find(u=>u.id==='blue_ADC'),red=s.units.find(u=>u.id==='red_MID');
 sup.x=adc.x=.48;sup.y=adc.y=.48;red.x=.485;red.y=.48;sup.mana=100;
 s.setReaction('blue',sup.id,'peel_adc');s.applyReaction(sup);
 assert.ok(adc.shield>=68);assert.equal(sup.mana,70);assert.ok(red.slowPercent>=.18);
});
test('comando manual não retorna automaticamente à lane depois de alcançar o ponto',()=>{
 const s=make(),adc=s.units.find(u=>u.id==='blue_ADC');adc.x=.32;adc.y=.42;adc.autoFollow=true;
 assert.ok(s.setOrder('blue',adc.id,{kind:'move',destination:{x:.37,y:.43}}).ok);assert.equal(adc.manualMoveHold,true);
 for(let i=0;i<12;i++){s.gameTime++;s.reviveAndMove();}
 const old={x:adc.x,y:adc.y};for(let i=0;i<8;i++){s.gameTime++;s.reviveAndMove();}
 assert.ok(Math.hypot(adc.x-old.x,adc.y-old.y)<.00001);
 s.setAutomation('blue',adc.id,{autoFollow:true});assert.equal(adc.manualMoveHold,false);
});
test('respawn abre disponibilidade de compra e só sai da fonte manualmente',()=>{
 const s=make(),u=s.units.find(u=>u.id==='blue_ADC');u.hp=0;u.deadUntil=15;u.x=.5;u.y=.5;
 s.gameTime=15;s.reviveAndMove();assert.equal(u.awaitingShop,true);assert.equal(u.hp,u.maxHp);
 const p={x:u.x,y:u.y};u.autoFollow=true;for(let i=0;i<8;i++){s.gameTime++;s.reviveAndMove();}
 assert.deepEqual({x:u.x,y:u.y},p);assert.equal(s.leaveShop('blue',u.id),true);
});
test('luta justa aguarda resposta do alvo: nenhum dano antes da confirmação',()=>{
 const s=make(),a=s.units.find(u=>u.id==='blue_MID'),d=s.units.find(u=>u.id==='red_MID');
 a.x=.5;a.y=.5;d.x=.505;d.y=.5;
 a.order={kind:'attack',targetId:d.id,combo:['Q','W','E','R'],comboIndex:0};d.order={kind:'defend'};
 let before=d.hp;s.resolveCombat();assert.equal(d.hp,before);
 assert.ok(Object.values(s.duelRequests).some(r=>r.state==='pending'));
 assert.equal(s.respondToDuel('red',d.id,'defend'),true);assert.ok(d.shield>0);
 s.gameTime++;s.resolveCombat();assert.ok(d.hp<before||d.shield<59);
 assert.equal(a.order.comboIndex,1);
});
test('bot responde após um tick; sem atacar antes de responder',()=>{
 const s=make('bot'),a=s.units.find(u=>u.id==='blue_MID'),d=s.units.find(u=>u.id==='red_MID');
 a.x=d.x=.48;a.y=.48;d.y=.485;d.autoRespond=true;
 a.order={kind:'attack',targetId:d.id};
 const hp=d.hp;s.resolveCombat();assert.equal(d.hp,hp);
 s.gameTime++;s.resolveCombat();assert.ok(d.hp<hp);
});
test('um jogador não pode atacar um defensor humano sem resposta',()=>{
 const s=make(),a=s.units.find(u=>u.id==='red_MID'),d=s.units.find(u=>u.id==='blue_MID');
 a.x=d.x=.48;a.y=.48;d.y=.485;a.order={kind:'attack',targetId:d.id};
 let hp=d.hp;for(let i=0;i<5;i++){s.gameTime++;s.resolveCombat();}
 assert.equal(d.hp,hp);assert.ok(s.respondToDuel('blue',d.id,'fight'));
 s.gameTime++;s.resolveCombat();assert.ok(d.hp<hp);
});
test('gank e roaming ignoram handshake, por design',()=>{
 for(const kind of ['gank','roam']){const s=make(),a=s.units.find(u=>u.id==='red_MID'),d=s.units.find(u=>u.id==='blue_MID');
 a.x=d.x=.49;a.y=.49;d.y=.485;a.order={kind,targetId:d.id};const hp=d.hp;
 s.resolveCombat();assert.ok(d.hp<hp);assert.equal(Object.keys(s.duelRequests).length,0);}
});
test('dano básico no nível 1 tem escala menor que dano cheio',()=>{
 const s=make(),a=s.units.find(u=>u.id==='blue_MID'),d=s.units.find(u=>u.id==='red_MID');
 a.x=d.x=.49;a.y=.49;d.y=.485;a.order={kind:'attack',targetId:d.id};
 s.duelRequests[s.duelKey(a,d)]={key:s.duelKey(a,d),initiator:a.id,responder:d.id,createdAt:0,state:'ready',response:'fight',until:30};
 const hp=d.hp;s.resolveCombat();assert.ok(hp-d.hp>0&&hp-d.hp<60,'dano reduzido lvl1');
});
test('HUD inicia a câmera em 55%, tem QWER e posturas agrupadas',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(app.includes('tilt:.55'));assert.ok(html.includes('value="55"'));assert.ok(html.includes('id="policyFavorites"'));
 assert.ok(html.includes('id="comboPanel"')&&html.includes('id="baseHUD"'));
});
console.log('11 testes v1.5 concluídos');
