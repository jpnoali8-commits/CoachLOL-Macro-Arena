import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles-v29.css',import.meta.url),'utf8');
const begin=app.indexOf('let matrixCache=null');
const end=app.indexOf('function requestDraw()',begin);
const context=vm.createContext({camera:{zoom:1,px:0,py:0,angle:0,tilt:.55},canvas:{clientWidth:1300,clientHeight:900},clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),$:()=>({value:'',textContent:'',classList:{toggle(){}}}),requestDraw(){},Math});
vm.runInContext(app.slice(begin,end),context);
let n=0;
for(const yaw of [0,Math.PI/8,Math.PI/4,Math.PI/2,Math.PI,Math.PI*1.7])for(const tilt of [0,.25,.55])for(const zoom of [.7,1,1.5,2]){
 context.camera.angle=yaw;context.camera.tilt=tilt;context.camera.zoom=zoom;
 for(const x of [.1,.48,.9])for(const y of [.15,.5,.92]){
 const [rx,ry]=vm.runInContext(`(()=>{const p=worldScreen(${x},${y});const q=screenWorld(p.x,p.y);return [q.x,q.y];})()`,context);
 assert.ok(Math.abs(x-rx)<1e-7&&Math.abs(y-ry)<1e-7,'Projection round trip');n++;
 }
}
for(const tilt of [0,.3,.55]){
 context.camera.tilt=tilt;context.camera.zoom=1;
 const sizes=[];
 for(const yaw of [0,.24,.81,1.4,2.3,Math.PI]){context.camera.angle=yaw;sizes.push(vm.runInContext('matrix().size',context));}
 assert.ok(Math.max(...sizes)-Math.min(...sizes)<1e-7,'No implicit zoom when yaw rotates');
}
context.camera.angle=0;context.camera.tilt=.55;context.camera.zoom=1;
const [p1,p2]=vm.runInContext('(()=>{const a=worldScreen(.25,.5),b=worldScreen(.75,.5);return [a.y,b.y]})()',context);
assert.ok(Math.abs(p1-p2)<1e-7,'Initial map axes are aligned, not diagonal');
assert.match(app,/angle:0,tilt:\.55/);
assert.match(app,/\[0,1,2\]\.includes\(e\.button\)/,'Middle button pans');
assert.match(app,/prevMapComposite/);
assert.match(app,/SIMULATION_FRAME_MS=650/);
assert.match(html,/id="shopSearch"/);
assert.match(css,/min\(1500px,98vw\)/);
assert.match(app,/finishCompletedRound\(\)/,'Round recovery');
assert.match(app,/lastPopupKey=null/);
assert.match(html,/id="statGrid"/);
assert.match(html,/id="autoSkillToggle"/);
console.log('✓ v2.9: '+n+' roundtrips, yaw without scale changes, axis-aligned initial camera, middle mouse, shop search, stats, skill, turn recovery and fog interpolation.');
