import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Arena,ITEM_RECIPES,catalog } from '../engine.mjs';
const load=x=>JSON.parse(fs.readFileSync(new URL('../data/'+x,import.meta.url)));
const create=()=>new Arena(load('coachlol_map_v6.json'),load('masks_128.json'),{roundSeconds:10});
const test=(label,fn)=>{fn();console.log('✓',label)};
test('Rabadon: two rods reduce remaining gold cost; consumed once in recipe',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_MID');u.gold=6000;
 assert.deepEqual(ITEM_RECIPES.rabadon,['needless_rod','needless_rod']);
 assert.equal(a.buy('blue',u.id,'needless_rod'),true);assert.equal(a.buy('blue',u.id,'needless_rod'),true);
 assert.equal(a.itemPurchaseCost(u,'rabadon'),1100);
 assert.equal(a.buy('blue',u.id,'rabadon'),true);
 assert.deepEqual(u.items,['rabadon']);assert.equal(u.gold,6000-1200-1200-1100);
});
test('SUP / JG: unique quests cannot be purchased or queued twice',()=>{
 const a=create(),jg=a.units.find(x=>x.id==='blue_JG'),sup=a.units.find(x=>x.id==='blue_SUP');
 assert.equal(a.buy('blue',jg.id,'jungle_gustwalker'),true);
 assert.equal(a.canBuy('blue',jg.id,'jungle_mosstomper').ok,false);
 assert.equal(a.queuePurchase('blue',jg.id,'jungle_scorchclaw').ok,false);
 assert.ok(sup.items.includes('support_atlas'),'SUP starts with unique Atlas');
 assert.equal(a.canBuy('blue',sup.id,'support_atlas').ok,false);
 assert.equal(a.queuePurchase('blue',sup.id,'support_atlas').ok,false);
});
test('SUP may farm waves, with 2026 25% XP penalty only outside bot before level 3',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_SUP'),m={kind:'melee',team:'red',x:.5,y:.5,lane:'mid'};
 for(const hero of a.units){hero.x=0;hero.y=0;}u.x=m.x;u.y=m.y;
 const b=u.xp;a.awardMinionXP(m);const midXp=u.xp-b;
 m.lane='bot';const bb=u.xp;a.awardMinionXP(m);const botXp=u.xp-bb;
 assert.ok(midXp>0&&botXp>midXp);assert.ok(Math.abs(midXp/botXp-.75)<.005);
});
test('Non-JG can be given jungle camp order and receives no pet evolution or Smite',()=>{
 const a=create(),mid=a.units.find(x=>x.id==='blue_MID'),jg=a.units.find(x=>x.id==='blue_JG');
 let camp=a.camps.find(c=>c.timerKey==='red'&&c.x<.5&&c.y>.5)||a.camps.find(c=>c.timerKey==='red');
 const target={x:camp.x,y:camp.y};const point=a.walkable(target.x,target.y)?target:(a.findPath(mid,target)?.at(-1)||target);
 const result=a.setPlan('blue',mid.id,[{point,action:'jungle',targetId:camp.id,duration:100}]);
 assert.equal(result.ok,true,JSON.stringify(result));assert.equal(mid.plan.steps[0].action,'jungle');
 assert.equal(mid.junglePet,null);assert.equal(mid.smiteCharges,0);assert.equal(jg.role,'JG');
 assert.equal(a.combatCampTarget(mid),camp.id);
});
test('Second summoner can be queued without overriding existing champion route/order',()=>{
 const a=create(),adc=a.units.find(x=>x.id==='blue_ADC'),mid=a.units.find(x=>x.id==='blue_MID'),sup=a.units.find(x=>x.id==='blue_SUP'),top=a.units.find(x=>x.id==='blue_TOP');
 adc.order={kind:'farm'};mid.order={kind:'farm'};sup.order={kind:'farm'};top.order={kind:'hold'};
 for(const [unit,type] of [[adc,'heal'],[mid,'ignite'],[sup,'exhaust'],[top,'tp']]){
  const r=a.queueSummoner('blue',unit.id,type);assert.equal(r.ok,true,JSON.stringify(r));assert.equal(unit.queuedSummoner.type,type);assert.ok(['farm','hold'].includes(unit.order.kind));
 }
 assert.equal(a.queueSummoner('blue',sup.id,'heal').ok,false);
});
test('Curar fires once, consumes cooldown, and does not erase standing farm plan',()=>{
 const a=create(),adc=a.units.find(x=>x.id==='blue_ADC');adc.order={kind:'farm'};adc.hp=adc.maxHp-220;
 assert.equal(a.queueSummoner('blue',adc.id,'heal').ok,true);a.phase='executing';a.resolveSummonerCasts();
 assert.ok(adc.hp>adc.maxHp-220);assert.ok(adc.healCd>a.gameTime);assert.equal(adc.order.kind,'farm');assert.equal(adc.queuedSummoner,null);
});
test('Teleport selects a living friendly tower position instead of skipping collision',()=>{
 const a=create(),top=a.units.find(x=>x.id==='blue_TOP');top.order={kind:'hold'};
 assert.equal(a.queueSummoner('blue',top.id,'tp').ok,true);a.phase='executing';a.resolveSummonerCasts();
 assert.ok(top.tpCd>a.gameTime);assert.equal(a.walkable(top.x,top.y),true);assert.equal(top.order.kind,'hold');
});
test('rendering HUD uses right-aligned Finalizar Turno, click-to-inspect and dedicated buy button',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const js=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(html,/id="confirm"[^>]*>Finalizar Turno/);
 assert.match(html,/id="shopPurchase"/);assert.match(html,/id="shopRecipeTree"/);
 assert.match(js,/btn\.onclick=\(\)=>\{(?:shopRecipeRoot=item\.id;)?shopSelection=item\.id;renderShop\(shopFilter\);\}/);
 assert.match(js,/\$\('shopPurchase'\)\.onclick/);
});
console.log('8 novos testes v3.2 aprovados');
