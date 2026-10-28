import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const app=readFileSync(path.join(root,'app.js'),'utf8');
const assetRoot=path.join(root,'assets/ui/map_cc0_v452d4_dev16');
const manifest=JSON.parse(readFileSync(path.join(assetRoot,'manifest.json'),'utf8'));
const tests=[];
function test(label,fn){fn();tests.push(label);console.log('✓ DEV16 '+label);}

test('15 SVGs novos declarados no manifesto CC0, sem imagens externas nem texto',()=>{
 assert.equal(manifest.license,'CC0-1.0');assert.equal(manifest.files.length,15);
 assert.match(readFileSync(path.join(assetRoot,'LICENSE-CC0-1.0.txt'),'utf8'),/SOMENTE aos SVGs/);
 for(const file of manifest.files){
  const s=readFileSync(path.join(assetRoot,file),'utf8');
  assert.match(s,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.doesNotMatch(s,/<text|<image|href=|foreignObject|font-family|data:/i);
 }
});

test('olho dourado e olho rosa têm arquivos gráficos diferentes',()=>{
 assert.ok(manifest.files.includes('ward_eye_gold.svg'));
 assert.ok(manifest.files.includes('ward_eye_pink.svg'));
 assert.notEqual(readFileSync(path.join(assetRoot,'ward_eye_gold.svg'),'utf8'),readFileSync(path.join(assetRoot,'ward_eye_pink.svg'),'utf8'));
});

test('Florividente, cura, Hexgate e explosiva usam assets gráficos próprios',()=>{
 for(const key of ['scryer_glow_plant','heal_fruit_plant','hexgate_portal','blast_seed'])assert.ok(manifest.files.includes(key+'.svg'));
 assert.match(app,/drawCC0IconV452d4Dev16\(style\.asset,p\.x,p\.y/);
});

test('círculo da planta explosiva respeita raio lógico e projeção orbital',()=>{
 assert.match(app,/const range=Math\.max\(\.005,Math\.min\(\.09,plant\.radius\|\|\.03\)\)/);
 assert.match(app,/worldScreen\(plant\.x\+range\*Math\.cos\(a\),plant\.y\+range\*Math\.sin\(a\)\)/);
 assert.match(app,/if\(plant\.kind==='blast_cone'\)drawProjectedBlastRadiusV452d4Dev16\(plant\)/);
});

test('minions têm classes e facções distintas, sem B/C/S e sem texto em sprites',()=>{
 for(const color of ['blue','red'])for(const kind of ['melee','caster','siege','super']){
  assert.ok(manifest.files.includes(`minion_${kind}_${color}.svg`));
 }
 assert.match(app,/drawCC0IconV452d4Dev16\('minion_'\+kind\+'_'/);
 assert.doesNotMatch(app,/fillText\('B',p\.x,p\.y-r-5\)/);
 assert.doesNotMatch(app,/fillText\(u\.kind==='siege'\?'C':'S'/);
});

test('aura roxa VFX do Barão acompanha buff real do motor sem alterar combate',()=>{
 assert.match(app,/baronMinionModifiersV452d\(minion\)\?\.empowered/);
 assert.match(app,/drawBaronAuraV452d4Dev16\(u,r\)/);
 assert.match(app,/createRadialGradient/);
 assert.match(app,/rgba\(146,76,251/);
});
console.log('DEV16 '+tests.length+'/'+tests.length+' PASS');
