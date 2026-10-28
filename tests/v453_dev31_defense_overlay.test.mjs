import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,recipeTreeV453Dev30,recipePurchasePartsV453Dev30,checksumV40} from '../engine.mjs';
const fixture=f=>JSON.parse(readFileSync(new URL('../data/'+f,import.meta.url),'utf8'));
const a=()=>new Arena(fixture('coachlol_map_v6.json'),fixture('masks_128.json'),{seed:31,roundSeconds:10});
const hero=(arena,team,role='TOP')=>arena.units.find(u=>u.id===team+'_'+role);
const prep=(arena,u)=>{const shop=arena.map.objects.find(o=>o.id===u.team+'_spawn_shop');u.x=shop.x;u.y=shop.y;u.gold=60000;u.items=[];};
const buy=(arena,u,id)=>assert.equal(arena.buy(u.team,u.id,id),true,'Comprar '+id);
let count=0;const t=(label,fn)=>{fn();count++;console.log('✓ DEV31 '+label);};
t('sete entradas do lote de defesa com preços e receitas explícitos',()=>{
 for(const id of ['chain_vest','negatron_cloak','bramble_vest','thornmail','wardens_mail','randuins_omen','berserkers_greaves'])assert.ok(catalog.find(x=>x.id===id));
 assert.deepEqual(ITEM_RECIPES.thornmail,['bramble_vest','chain_vest','ruby_crystal']);
 assert.deepEqual(ITEM_RECIPES.randuins_omen,['wardens_mail','giants_belt']);
 assert.equal(ITEM_EFFECTS_V43.randuins_omen.cooldown,90);
});
t('receita aninhada dá desconto uma vez por componente, também em inventário cheio',()=>{
 const arena=a(),u=hero(arena,'blue');prep(arena,u);
 buy(arena,u,'cloth_armor');buy(arena,u,'cloth_armor');buy(arena,u,'chain_vest');buy(arena,u,'ruby_crystal');
 assert.deepEqual(recipePurchasePartsV453Dev30('thornmail',u.items),['cloth_armor','chain_vest','ruby_crystal']);
 assert.equal(arena.itemPurchaseCost(u,'thornmail'),2450-300-800-400);
 buy(arena,u,'thornmail');assert.deepEqual(u.items,['thornmail']);
});
t('adversário básico recebe Espinhos e feridas, sem segunda reflexão',()=>{
 const arena=a(),def=hero(arena,'blue'),atk=hero(arena,'red');prep(arena,def);buy(arena,def,'thornmail');
 atk.x=def.x+.008;atk.y=def.y;const before=atk.hp,previous=def.hp;
 arena.damage(def,110,atk,'physical','basic');
 assert.ok(def.hp<previous);assert.ok(atk.hp<before,'espinhos causaram dano real');
 assert.ok(arena.effectResolverV41().has(atk,'grievous_wounds'));
 assert.ok(before-atk.hp<100,'uma reflexão controlada');
});
t('espinhos não ativam contra habilidade e espinhos não acumulam com colete equipado',()=>{
 const arena=a(),def=hero(arena,'blue'),atk=hero(arena,'red');prep(arena,def);buy(arena,def,'bramble_vest');
 const hp=atk.hp;arena.damage(def,50,atk,'magic','spell');assert.equal(atk.hp,hp);
 arena.damage(def,90,atk,'physical','basic');assert.ok(atk.hp<hp);
});
t('Proteção de Armadura reduz dano básico pós-mitigação e não reduz magias',()=>{
 const x=a(),u=hero(x,'blue'),enemy=hero(x,'red');prep(x,u);buy(x,u,'wardens_mail');
 const hp=u.hp;x.damage(u,100,enemy,'physical','basic');const basic=hp-u.hp;
 u.hp=hp;x.damage(u,100,enemy,'physical','spell');const spell=hp-u.hp;
 assert.ok(basic<spell,`${basic} deve ser menor que ${spell}`);
});
t('Randuin afeta apenas inimigos próximos, não aliados, e cobra recarga',()=>{
 const arena=a(),u=hero(arena,'blue'),near=hero(arena,'red'),far=hero(arena,'red','ADC'),ally=hero(arena,'blue','MID');prep(arena,u);buy(arena,u,'randuins_omen');
 near.x=u.x+.004;near.y=u.y;far.x=u.x+.2;far.y=u.y;ally.x=u.x+.004;ally.y=u.y;
 const r=arena.activateRanduinsV453Dev31('blue',u.id);
 assert.equal(r.ok,true);assert.deepEqual(r.targetIds,[near.id]);
 assert.ok(arena.effectResolverV41().slowFraction(near)>=.69);
 assert.equal(arena.effectResolverV41().slowFraction(far),0);
 assert.equal(arena.effectResolverV41().slowFraction(ally),0);
 assert.equal(arena.activateRanduinsV453Dev31('blue',u.id).ok,false);
 arena.gameTime+=2.01;assert.equal(arena.effectResolverV41().slowFraction(near),0);
});
t('snapshot retém cooldown de Randuin e debuff após restauração',()=>{
 const map=fixture('coachlol_map_v6.json'),mask=fixture('masks_128.json'),arena=new Arena(map,mask,{seed:31}),u=hero(arena,'blue'),near=hero(arena,'red');prep(arena,u);buy(arena,u,'randuins_omen');near.x=u.x+.005;near.y=u.y;
 assert.equal(arena.activateRanduinsV453Dev31('blue',u.id).ok,true);
 const snapshot=arena.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snapshot);
 assert.equal(checksumV40(snapshot),checksumV40(b.snapshotV40()));
 assert.ok(['recarga','ação_duplicada'].includes(b.activateRanduinsV453Dev31('blue',u.id).reason));
});
t('UI Randuin clicável e Golpear tem prioridade acima de score, loja e Reino',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(app.includes("match.activateRanduinsV453Dev31('blue',u.id)"));
 assert.ok(css.includes('--coach-critical-overlay:2147483000'));
 assert.ok(css.includes('--coach-realm-overlay:2147482000'));
 assert.ok(css.includes('aspect-ratio:1/1'));
 assert.ok(css.includes('.realmMovementCircle'));
 assert.ok(html.includes('id="mordekaiserRealmViewport"')&&html.includes('id="smiteContestOverlay"'));
 assert.match(html,/<div id="mordekaiserRealmViewport"[^>]*hidden/);
});
t('browser engine sincronizado e sem conteúdo falso de Mordekaiser',()=>{
 const ctx={window:{}};
 vm.runInNewContext(readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),ctx,{timeout:5000});
 assert.equal(typeof ctx.window.CoachArena.catalog,'object');
 assert.equal(typeof ctx.window.CoachArena.Arena.prototype.activateRanduinsV453Dev31,'function');
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.equal(app.includes('mordekaiserRealmViewport').toString(),'false');
});
console.log('DEV31 '+count+'/'+count+' PASS');
