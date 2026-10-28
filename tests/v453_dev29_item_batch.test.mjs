import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,checksumV40} from '../engine.mjs';
const data=f=>JSON.parse(readFileSync(new URL('../data/'+f,import.meta.url),'utf8'));
const create=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:29,roundSeconds:10});
const hero=(a,team='blue',role='MID')=>a.units.find(u=>u.id===team+'_'+role);
const prep=(a,u)=>{const spawn=a.map.objects.find(o=>o.id===u.team+'_spawn_shop');u.x=spawn.x;u.y=spawn.y;u.gold=50000;u.items=[];return u;};
const buy=(a,u,id)=>assert.equal(a.buy(u.team,u.id,id),true,`compra ${id}`);
const t=(label,cb)=>{cb();console.log('✓ DEV29 '+label);};

t('catálogo e receitas com componentes auditáveis, sem inventário completo',()=>{
 for(const id of ['sheen','phage','hearthbound_axe','rectrix','trinity_force','black_cleaver','youmuus_ghostblade'])assert.ok(catalog.find(i=>i.id===id));
 assert.deepEqual(ITEM_RECIPES.trinity_force,['sheen','phage','hearthbound_axe']);
 assert.deepEqual(ITEM_RECIPES.black_cleaver,['phage','kindlegem','pickaxe']);
 assert.equal(ITEM_EFFECTS_V43.sheen.cooldown,1.5);
});
t('Trindade consome 3 componentes, desconta ouro uma vez e reverte stats',()=>{
 const a=create(),u=prep(a,hero(a)),hp=u.maxHp,ad=u.ad,haste=u.abilityHaste;
 for(const id of ITEM_RECIPES.trinity_force)buy(a,u,id);
 const before=u.gold;assert.equal(a.itemPurchaseCost(u,'trinity_force'),133);
 buy(a,u,'trinity_force');assert.deepEqual(u.items,['trinity_force']);assert.equal(u.gold,before-133);
 assert.equal(u.maxHp,hp+333);assert.equal(u.ad,ad+36);assert.equal(u.abilityHaste,haste+15);
 assert.equal(a.sellItemV43(u.team,u.id,0).ok,true);
 assert.equal(u.ad,ad);assert.equal(u.maxHp,hp);assert.equal(u.abilityHaste,haste);
});
t('Cutelo e Youmuu têm receitas atômicas e desconto limitado',()=>{
 const a=create(),u=prep(a,hero(a));
 for(const id of ITEM_RECIPES.black_cleaver)buy(a,u,id);
 assert.equal(a.itemPurchaseCost(u,'black_cleaver'),225);
 buy(a,u,'black_cleaver');assert.deepEqual(u.items,['black_cleaver']);
 const b=create(),w=prep(b,hero(b));for(const id of ITEM_RECIPES.youmuus_ghostblade)buy(b,w,id);
 assert.equal(b.itemPurchaseCost(w,'youmuus_ghostblade'),675);buy(b,w,'youmuus_ghostblade');assert.deepEqual(w.items,['youmuus_ghostblade']);
});
t('Lâmina Arcana: skill prepara AA, recarga impede disparo duplo, expira em 10s',()=>{
 const a=create(),u=prep(a,hero(a)),v=hero(a,'red');buy(a,u,'sheen');
 v.hp=v.maxHp=20000;v.armor=0;u.skillRanks.Q=1;u.mana=1000;
 assert.equal(a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',source:'dev29'}).ok,true);
 assert.ok(u.spellbladeArmedUntilV453Dev29>=10);
 const before=v.hp;a.damage(v,30,u,'physical','basic');const proc=before-v.hp;
 assert.ok(proc>30);assert.ok((u.spellbladeNextV453Dev29||0)>=1.5);
 const hp=v.hp;a.damage(v,30,u,'physical','basic');assert.equal(hp-v.hp,30);
 a.gameTime=11;u.skillCds.Q=0;assert.equal(a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',source:'dev29'}).ok,true);
 a.gameTime=22;const late=v.hp;a.damage(v,30,u,'physical','basic');assert.equal(late-v.hp,30);
});
t('Trindade causa bônus maior que Brilho, com única fonte Spellblade',()=>{
 const run=item=>{const a=create(),u=prep(a,hero(a)),v=hero(a,'red');buy(a,u,item);v.hp=v.maxHp=20000;v.armor=0;u.skillRanks.Q=1;u.mana=1000;a.performActionV40({actorId:u.id,kind:'skill',slot:'Q'});const first=v.hp;a.damage(v,10,u,'physical','basic');return first-v.hp;};
 assert.ok(run('trinity_force')>run('sheen'));
 const a=create(),u=prep(a,hero(a));buy(a,u,'sheen');
 assert.equal(a.canBuy(u.team,u.id,'trinity_force').ok,true,'upgrade consumes sheen');
 assert.equal(a.canBuy(u.team,u.id,'sheen').ok,false,'duplicate sheen');
});
t('Cutelo reduz armadura após 5 aplicações, expira em 6s e não recursa proc',()=>{
 const a=create(),u=prep(a,hero(a)),v=hero(a,'red');buy(a,u,'black_cleaver');v.hp=v.maxHp=20000;v.armor=100;
 let initial;for(let i=0;i<5;i++){a.gameTime=i;const hp=v.hp;a.damage(v,100,u,'physical','basic');if(!i)initial=hp-v.hp;}
 assert.equal(v.cleaverDebuffV453Dev29.stacks,5);assert.equal(v.cleaverDebuffV453Dev29.until,10);
 a.gameTime=5;const hp=v.hp;a.damage(v,100,u,'physical','basic');assert.ok(hp-v.hp>initial,'shred applies to later hit');
 a.gameTime=13;const later=v.hp;a.damage(v,100,null,'physical','other');assert.equal(later-v.hp,50,'debunk expires');
});
t('Youmuu: ativo de tempo simulado, recarga, venda e movimento',()=>{
 const a=create(),u=prep(a,hero(a));buy(a,u,'youmuus_ghostblade');const before=a.effectiveMS(u);
 const effect=a.activateYoumuusV453Dev29(u.team,u.id);assert.equal(effect.ok,true);assert.ok(a.effectiveMS(u)>before);
 assert.equal(a.activateYoumuusV453Dev29(u.team,u.id).ok,false);
 a.gameTime=7;assert.ok(a.effectiveMS(u)<=a.effectiveMS({...u,youmuusSprintUntilV453Dev29:0})+1e-8);
 a.gameTime=46;assert.equal(a.activateYoumuusV453Dev29(u.team,u.id).ok,true);
 const sold=a.sellItemV43(u.team,u.id,0);assert.equal(sold.ok,true);assert.ok(!u.items.includes('youmuus_ghostblade'));
});
t('snapshot determinístico conserva buffs, armadura e cooldown ativo',()=>{
 const a=create(),u=prep(a,hero(a)),v=hero(a,'red');buy(a,u,'black_cleaver');
 a.damage(v,100,u,'physical','basic');const b=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
 a.gameTime=1;b.gameTime=1;a.damage(v,100,u,'physical','basic');b.damage(hero(b,'red'),100,hero(b),'physical','basic');
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
});
t('motor do navegador compartilha métodos e catálogo de itens',()=>{
 const ctx={window:{}};vm.runInNewContext(readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),ctx,{timeout:4000});
 assert.equal(typeof ctx.window.CoachArena.Arena.prototype.activateYoumuusV453Dev29,'function');
 assert.equal(ctx.window.CoachArena.catalog.find(v=>v.id==='trinity_force').cost,3333);
});
console.log('DEV29 9/9 PASS');
