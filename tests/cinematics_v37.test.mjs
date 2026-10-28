import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {normalizeManifest,presentationEvent,visibleToViewer,normalizeCinematicConfig,safeLocalAsset,eventSort} from '../cinematics-core.mjs';
const manifest=JSON.parse(readFileSync(new URL('../data/cinematic_event_manifest_v37.json',import.meta.url),'utf8'));
const registry=normalizeManifest(manifest);
test('Manifesto: eventos normalizados e sem dependência remota',()=>{
 assert.ok(Object.keys(registry).length>=12);
 assert.ok(registry.dragon_slay);
 assert.equal(registry.ultimate_cast.media,null);
 assert.ok(registry.smite_contest.priority>registry.level_up.priority);
});
test('Proteção contra assets remotos, path traversal e scripts',()=>{
 assert.equal(safeLocalAsset('assets/cinematics/ultimate.webm'),true);
 assert.equal(safeLocalAsset('assets/cinematics/zed.glb'),true);
 for(const value of ['https://cdn.com/asset.glb','assets/../../secret.webm','/etc/passwd','assets/cinematics/test.mp4?token=abc','assets/cinematics/test.js'])assert.equal(safeLocalAsset(value),false,value);
 assert.equal(normalizeCinematicConfig({media:{type:'webm',src:'https://site.com/a.webm'}}).media,null);
});
test('Fog: cast inimigo só aparece quando visto no instante do evento',()=>{
 const unseen={kind:'ultimate_cast',team:'red',time:5,round:1,text:'Zed lançou ultimate'};
 assert.equal(visibleToViewer(unseen,'blue'),false);
 assert.equal(presentationEvent(unseen,'blue',registry),null);
 assert.equal(presentationEvent({...unseen,observedBy:['blue']},'blue',registry)?.type,'ultimate_cast');
 assert.equal(presentationEvent(unseen,'red',registry)?.type,'ultimate_cast');
});
test('Fog: não usar posição atual para desbloquear replay de cast antigo',()=>{
 const hidden={kind:'ultimate_cast',team:'red',observedBy:[],time:4,round:1,text:'Karthus canalizando'};
 assert.equal(presentationEvent(hidden,'blue',registry),null);
 assert.equal(presentationEvent({...hidden,observedBy:['blue']},'blue',registry)?.type,'ultimate_cast');
});
test('Morte e objetivos são anúncios públicos, sem localização no pacote',()=>{
 const death={kind:'death',team:'blue',time:7,round:2,text:'Inimigo eliminou Jinx'};
 const r=presentationEvent(death,'red',registry);
 assert.equal(r?.type,'champion_eliminated');
 assert.equal(r?.caption,'Inimigo eliminou Jinx');
 assert.equal('x' in r,false);
 const dragon={kind:'objective',team:'red',time:120,round:12,text:'Dragão derrotado pelos vermelhos'};
 assert.equal(presentationEvent(dragon,'blue',registry)?.type,'dragon_slay');
 const camp={kind:'jungle',team:'red',time:124,round:12,text:'Red inimigo: 500HP'};
 assert.equal(presentationEvent(camp,'blue',registry),null);
});
test('Texto inseguro nunca é injetado como markup',()=>{
 const event={kind:'ultimate_cast',team:'blue',text:'<script>alert(1)</script>',time:3,round:1};
 assert.equal(presentationEvent(event,'blue',registry)?.caption,'scriptalert(1)/script');
});
test('Ordem de prioridade mantém morte e Smite antes de nível',()=>{
 const values=[{priority:25,time:1},{priority:100,time:2},{priority:85,time:3}].sort(eventSort);
 assert.deepEqual(values.map(v=>v.priority),[100,85,25]);
});
test('Renderização observacional: nenhuma mutação de um estado do motor',()=>{
 const game=Object.freeze({hp:200,mana:150,kills:4,gameTime:250});
 const clone=JSON.stringify(game);
 presentationEvent({kind:'ultimate_cast',team:'blue',text:'R',time:200,round:20},'blue',registry);
 assert.equal(JSON.stringify(game),clone);
});
