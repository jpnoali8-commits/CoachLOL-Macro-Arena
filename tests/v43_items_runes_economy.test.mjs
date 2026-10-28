import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,catalog,ITEM_RECIPES,ECONOMY_PATCH_V43,RUNE_PAGES_V43,ITEM_EFFECTS_V43,ECONOMY_RULES_V43,checksumV40} from '../engine.mjs';
const dat=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const make=()=>new Arena(dat('coachlol_map_v6.json'),dat('masks_128.json'),{seed:43,roundSeconds:10});
const test=(label,fn)=>{fn();console.log('✓ V4.3 '+label)};
const champ=(a,side='blue',role='MID')=>a.units.find(u=>u.id===side+'_'+role);
const prepare=(a,u)=>{const st=a.map.objects.find(o=>o.id===u.team+'_spawn_shop');assert.ok(st);u.x=st.x;u.y=st.y;u.gold=40000;u.items=[];u.ap=0;u.rabadonBonusV43=0;u.abilityHaste=0;return u;};
const buy=(a,u,id)=>assert.equal(a.buy(u.team,u.id,id),true,'buy '+id);

test('patch e catálogo: itens selecionados com dados básicos, sem afirmar catálogo completo',()=>{
 assert.equal(ECONOMY_PATCH_V43,'26.21');const item=id=>catalog.find(i=>i.id===id);
 assert.equal(item('long_sword').stats.ad,10);assert.equal(item('rabadon').stats.ap,130);
 assert.equal(item('mercurys_treads').cost,1250);assert.equal(item('sorcerers_shoes').stats.magicPenFlat,12);
 assert.equal(item('void_staff').stats.magicPenPercent,40);assert.equal(item('oblivion_orb').cost,800);
 assert.equal(ITEM_EFFECTS_V43.rabadon.kind,'ap_multiplier');assert.equal(ECONOMY_RULES_V43.sellRatio,.7);
});
test('desconto de receita não consome componente duplicado duas vezes',()=>{
 const a=make(),u=prepare(a,champ(a));buy(a,u,'needless_rod');buy(a,u,'needless_rod');
 const expected=u.gold-1100,apBefore=u.ap;assert.equal(a.itemPurchaseCost(u,'rabadon'),1100);
 buy(a,u,'rabadon');assert.deepEqual(u.items,['rabadon']);assert.equal(u.gold,expected);
 assert.equal(apBefore,130);assert.equal(u.ap,Math.round(130*1.3));
});
test('Rabadon reescala ao comprar ou vender AP adicional, sem multiplicadores cumulativos',()=>{
 const a=make(),u=prepare(a,champ(a));buy(a,u,'rabadon');assert.equal(u.ap,169);
 buy(a,u,'amp_tome');assert.equal(u.ap,195,'(130+20)*1.3');
 const sold=a.sellItemV43('blue',u.id,1);assert.equal(sold.ok,true);assert.equal(sold.refund,280);
 assert.equal(u.ap,169);const cap=a.sellItemV43('blue',u.id,0);assert.ok(cap.ok);assert.equal(u.ap,0);
 assert.equal(u.rabadonBonusV43,0);assert.ok(u.economyLedgerV43.every(x=>x.balance>=0));
});
test('venda da fonte reverte stats, vida máxima e ouro; fora da fonte falha sem mutações',()=>{
 const a=make(),u=prepare(a,champ(a));const hp=u.maxHp;buy(a,u,'ruby_crystal');assert.equal(u.maxHp,hp+150);
 const before=u.gold;u.x=.6;u.y=.6;const failed=a.sellItemV43('blue',u.id,0);assert.equal(failed.ok,false);
 assert.equal(u.items.length,1);assert.equal(u.gold,before);const st=a.map.objects.find(o=>o.id==='blue_spawn_shop');u.x=st.x;u.y=st.y;
 const result=a.sellItemV43('blue',u.id,0);assert.ok(result.ok);assert.equal(result.refund,280);assert.equal(u.maxHp,hp);
 assert.equal(u.gold,before+280);
});
test('orbe e carrasco aplicam Feridas Dolorosas até através de escudo comum',()=>{
 for(const [item,kind] of [['oblivion_orb','magic'],['executioners_calling','physical']]){
  const a=make(),u=prepare(a,champ(a)),enemy=champ(a,'red');buy(a,u,item);
  enemy.shield=500;enemy.hp=enemy.maxHp;const old=enemy.hp;
  a.damage(enemy,100,u,kind,'spell');assert.equal(enemy.hp,old);
  assert.equal(a.effectResolverV41().has(enemy,'grievous_wounds'),true);
  a.gameTime+=4;assert.equal(a.effectResolverV41().has(enemy,'grievous_wounds'),false);
 }
});
test('página de runas é exclusiva da preparação e troca shards sem duplicação',()=>{
 const a=make(),u=champ(a);const ap=u.ap,hp=u.maxHp;
 assert.equal(a.chooseRunePageV43('blue',u.id,'sorcery').ok,true);assert.equal(u.ap,ap+9);
 assert.equal(a.chooseRunePageV43('blue',u.id,'sorcery').unchanged,true);assert.equal(u.ap,ap+9);
 assert.equal(a.chooseRunePageV43('blue',u.id,'resolve').ok,true);assert.equal(u.ap,ap);assert.equal(u.maxHp,hp+65);
 a.finishPreparation();assert.equal(a.chooseRunePageV43('blue',u.id,'sorcery').ok,false);
 assert.equal(u.runePageV43,'resolve');assert.equal(u.maxHp,hp+65);
});
test('Cometa protótipo provoca dano extra somente na primeira spell durante o CD de 20 segundos',()=>{
 const a=make(),u=champ(a),victim=champ(a,'red');a.chooseRunePageV43('blue',u.id,'sorcery');
 victim.hp=10000;victim.maxHp=10000;victim.mr=0;const before=victim.hp;
 a.damage(victim,40,u,'magic','spell');const first=before-victim.hp;assert.ok(first>40);
 assert.equal(u.runeProcNextV43,20);const secondBefore=victim.hp;a.damage(victim,40,u,'magic','spell');assert.equal(secondBefore-victim.hp,40);
 a.gameTime=20;const thirdBefore=victim.hp;a.damage(victim,40,u,'magic','spell');assert.ok(thirdBefore-victim.hp>40);
});
test('Ritmo protótipo acumula ataques sem ativar com DoT ou spell',()=>{
 const a=make(),u=champ(a),enemy=champ(a,'red');a.chooseRunePageV43('blue',u.id,'precision');
 u.hp=u.maxHp-150;enemy.hp=5000;enemy.maxHp=5000;enemy.armor=0;
 a.damage(enemy,10,u,'magic','spell');assert.equal(u.runeStacksV43,0);
 for(let i=0;i<4;i++)a.damage(enemy,10,u,'physical','basic');assert.equal(u.runeStacksV43,4);
 const hp=u.hp;a.damage(enemy,10,u,'physical','basic');assert.ok(u.hp>hp);assert.equal(u.runeStacksV43,0);
});
test('Aperto protótipo ativa por segundos simulados, não por fator de velocidade',()=>{
 const a=make(),u=champ(a),enemy=champ(a,'red');a.chooseRunePageV43('blue',u.id,'resolve');
 enemy.hp=10000;enemy.maxHp=10000;enemy.armor=0;enemy.mr=0;
 let hp=enemy.hp;a.damage(enemy,10,u,'physical','basic');assert.equal(hp-enemy.hp,10,'primeiro impacto entra em combate');
 a.gameTime=2;hp=enemy.hp;a.damage(enemy,10,u,'physical','basic');assert.equal(hp-enemy.hp,10);
 a.gameTime=4;hp=enemy.hp;a.damage(enemy,10,u,'physical','basic');assert.ok(hp-enemy.hp>10);
});
test('snapshot determinístico preserva runas, saldo, inventário e recargas de efeitos',()=>{
 const a=make(),u=prepare(a,champ(a)),victim=champ(a,'red');
 a.chooseRunePageV43('blue',u.id,'sorcery');buy(a,u,'oblivion_orb');a.damage(victim,10,u,'magic','spell');
 const b=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
 assert.deepEqual(champ(b).economyLedgerV43,u.economyLedgerV43);assert.equal(champ(b).runeProcNextV43,u.runeProcNextV43);
 a.gameTime+=1;b.gameTime+=1;a.damage(victim,10,u,'magic','spell');b.damage(champ(b,'red'),10,champ(b),'magic','spell');
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
});
test('Node e navegador têm implementação e contratos idênticos',()=>{
 const code=readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),context={window:{}};
 vm.runInNewContext(code,context,{timeout:4000});const other=context.window.CoachArena;
 assert.equal(other.ECONOMY_PATCH_V43,ECONOMY_PATCH_V43);
 assert.deepEqual(Object.keys(other.RUNE_PAGES_V43),Object.keys(RUNE_PAGES_V43));
 assert.equal(other.Arena.prototype.sellItemV43 instanceof Function,false,'funções VM possuem protótipo próprio');
 assert.equal(typeof other.Arena.prototype.sellItemV43,'function');
});
test('um proc de runa letal não duplica abates, mortes nem recompensa',()=>{
 const a=make(),u=champ(a),target=champ(a,'red');a.chooseRunePageV43('blue',u.id,'sorcery');
 target.hp=40;target.mr=0;const gold=u.gold,kills=u.kills,deaths=target.deaths;
 a.damage(target,15,u,'magic','spell');
 assert.equal(target.hp,0);assert.equal(u.kills,kills+1);assert.equal(target.deaths,deaths+1);
 assert.equal(u.gold,gold+300);
});
test('shards com Rabadon recalculam AP apenas uma vez na troca de runas',()=>{
 const a=make(),u=prepare(a,champ(a));buy(a,u,'rabadon');
 assert.equal(a.chooseRunePageV43('blue',u.id,'sorcery').ok,true);
 assert.equal(u.ap,181,'(130+9)*1.3 arredondado');
 assert.equal(a.chooseRunePageV43('blue',u.id,'none').ok,true);
 assert.equal(u.ap,169);
});
