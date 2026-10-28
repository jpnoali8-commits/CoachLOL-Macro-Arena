import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const map=JSON.parse(readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const mask=JSON.parse(readFileSync(new URL('../data/masks_128.json',import.meta.url)));
const clean=()=>{
 const s=new Arena(map,mask,{mode:'manual',decisionSeconds:30});
 // Isolate user command behavior from combat & jungle while retaining the atlas grid.
 s.mask={...mask,wall:'0'.repeat(mask.size*mask.size),brush:'0'.repeat(mask.size*mask.size)};
 for(const v of s.units){v.autoFollow=false;v.autoJungle=false;v.lastHitAt=-999;v.holdUntil=0;}
 return s;
};
let count=0;
function test(label,fn){fn();count++;console.log('✓',label);}
test('ward exige clique num ponto explícito e cargas',()=>{
 const s=clean(),u=s.units.find(x=>x.id==='blue_ADC');u.x=.25;u.y=.25;
 assert.equal(s.setOrder('blue',u.id,{kind:'ward'}).ok,false);
 assert.equal(s.setOrder('blue',u.id,{kind:'ward',destination:{x:1.9,y:.25}}).ok,false);
 assert.equal(s.setOrder('blue',u.id,{kind:'ward',destination:{x:.25,y:.25}}).ok,true);
 s.gameTime++;s.reviveAndMove();
 assert.equal(s.wards.length,1);assert.equal(s.wards[0].x,.25);assert.equal(s.wards[0].y,.25);
 assert.equal(u.wardCharges,1);assert.equal(u.order.kind,'auto');
});
test('ward distante caminha e é posicionada no ponto marcado, não no campeão',()=>{
 const s=clean(),u=s.units.find(x=>x.id==='blue_ADC');u.x=.23;u.y=.27;
 const point={x:.58,y:.52};const before=u.wardCharges;
 assert.ok(s.setOrder('blue',u.id,{kind:'ward',destination:point}).ok);
 assert.equal(u.order.kind,'ward');
 // UI can finalize a planning window before the target is reached.
 s.round=2;s.teams.blue.ready=s.teams.red.ready=true;
 s.resolve(1);assert.equal(u.order.kind,'ward','ward order persists across windows');
 for(let i=0;i<35&&!s.wards.length;i++){s.gameTime++;s.reviveAndMove();}
 assert.equal(s.wards.length,1);assert.deepEqual({x:s.wards[0].x,y:s.wards[0].y},point);
 assert.equal(u.wardCharges,before-1);assert.ok(s.mapDistance(u,point)<=625);
});
test('recall entrega evento de loja e mantém unidade na fonte até comando',()=>{
 const s=clean(),u=s.units.find(x=>x.id==='blue_MID');u.x=.51;u.y=.47;
 assert.ok(s.setOrder('blue',u.id,{kind:'recall'}).ok);
 for(let i=0;i<8;i++){s.gameTime++;s.reviveAndMove();}
 const home=s.map.objects.find(o=>o.id==='blue_spawn_shop');
 assert.equal(u.awaitingShop,true);assert.equal(u.x,home.x);assert.equal(u.y,home.y);
 assert.ok(s.events.some(e=>e.kind==='recall_complete'&&e.unitId===u.id&&e.team==='blue'));
 const p={x:u.x,y:u.y};u.autoFollow=true;
 for(let i=0;i<4;i++){s.gameTime++;s.reviveAndMove();}
 assert.deepEqual({x:u.x,y:u.y},p,'no automatic travel out of shop');
 assert.ok(s.setOrder('blue',u.id,{kind:'defend'}).ok);
 assert.equal(u.awaitingShop,false,'explicit command releases shopping hold');
});
test('saída da loja depende da confirmação do jogador',()=>{
 const s=clean(),u=s.units.find(x=>x.id==='blue_SUP');u.x=.6;u.y=.6;
 assert.equal(s.leaveShop('blue',u.id),false,'cannot skip recall');
 assert.ok(s.setOrder('blue',u.id,{kind:'recall'}).ok);
 for(let i=0;i<8;i++){s.gameTime++;s.reviveAndMove();}
 assert.equal(s.leaveShop('blue',u.id),true);
 assert.equal(u.awaitingShop,false);assert.equal(u.autoFollow,true);
 assert.equal(s.leaveShop('blue',u.id),false,'cannot leave twice');
});
test('perspectiva 2.5D tem inversa exata de clique para ângulos variados',()=>{
 for(const tilt of [0,.2,.32,.55])for(const angle of [0,.3,-1.2,2.5]){
  const size=665,cx=560,cy=420,cos=Math.cos(angle),sin=Math.sin(angle),vscale=1-tilt*.36;
  for(const [x,y] of [[.1,.2],[.4,.6],[.8,.8],[.51,.49]]){
   const v=y-.5,d=1-tilt*v,rx=size*(x-.5)/d,ry=size*vscale*v/d;
   const sx=cx+rx*cos-ry*sin,sy=cy+rx*sin+ry*cos;
   const dx=sx-cx,dy=sy-cy,q=(-dx*sin+dy*cos)/vscale;
   const invV=q/(size+tilt*q),invD=1-tilt*invV;
   const xx=.5+(dx*cos+dy*sin)*invD/size,yy=.5+invV;
   assert.ok(Math.abs(x-xx)<1e-10&&Math.abs(y-yy)<1e-10,`tilt ${tilt}, angle ${angle}`);
  }
 }
});
test('interface tem comandos na lateral e atalhos B/4 sem doca inferior',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(!app.includes("appendChild($('selectedInspector'))"));
 assert.ok(!html.includes('id="dockHost"'));
 assert.ok(html.includes('id="actions"')&&html.includes('id="viewTiltRange"'));
 assert.ok(app.includes("b:'recall','4':'ward'"));
 assert.ok(app.includes("{kind:'ward',destination:pos}"));
});
console.log(`\n${count} testes v1.4 aprovados`);
