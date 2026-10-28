import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const begin=app.indexOf('let matrixCache=null');
const end=app.indexOf('function requestDraw()',begin);
assert.ok(begin>0&&end>begin,'Camera transformations remain intact');
const cameraCode=app.slice(begin,end);
const context=vm.createContext({
  camera:{zoom:1,px:0,py:0,angle:Math.PI/4,tilt:.55},
  canvas:{clientWidth:1300,clientHeight:900},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  $:()=>({value:'',textContent:'',classList:{toggle(){}}}),
  requestDraw(){},Math
});
vm.runInContext(cameraCode,context);
const projection=(yaw,tilt,x,y)=>{
  context.camera.angle=yaw;context.camera.tilt=tilt;
  const result=vm.runInContext(`(()=>{const p=worldScreen(${x},${y});return [p.x,p.y,screenWorld(p.x,p.y).x,screenWorld(p.x,p.y).y,matrix().size];})()`,context);
  return result;
};
let samples=0;
for(const yaw of [0,Math.PI/6,Math.PI/4,Math.PI/2,Math.PI,5*Math.PI/4,2*Math.PI]){
 for(const tilt of [0,.25,.55]){
  for(const x of [.05,.22,.5,.77,.95])for(const y of [.05,.35,.5,.86,.95]){
   const [px,py,xx,yy,size]=projection(yaw,tilt,x,y);
   assert.ok(Number.isFinite(px)&&Number.isFinite(py)&&size>0,'Projective camera stays finite');
   assert.ok(Math.abs(x-xx)<1e-8&&Math.abs(y-yy)<1e-8,`Round trip failed ${yaw} ${tilt} (${x},${y}): ${xx},${yy}`);
   samples++;
  }
 }
}
// Neutral orbit direction ensures a mirrored blue/red base pair have equal depth.
context.camera.angle=Math.PI/4;context.camera.tilt=.55;
const blue=vm.runInContext('worldScreen(.10,.90)',context);
const red=vm.runInContext('worldScreen(.90,.10)',context);
assert.ok(Math.abs(blue.y-red.y)<1e-6,'Mirrored bases share depth/scale in default camera');
assert.ok(Math.abs((blue.x+red.x)/2-650)<1e-6,'Both bases center symmetrically');
assert.match(app,/if\(wasMoved\|\|button!==0\)return/,'Right click must not issue move/ward orders');
assert.match(app,/camera\.angle=pointer\.angle\+dx\*\.006/,'Right drag changes yaw from horizontal movement');
assert.match(app,/angle:Math\.PI\/4,tilt:\.55/,'Neutral azimuth is the default and reset');
console.log(`✓ v2.8 Câmera orbital: ${samples} projeções inversas verificadas; bases simétricas; clique direito seguro.`);
