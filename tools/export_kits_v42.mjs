import {writeFileSync} from 'node:fs';
import {CHAMPION_KITS_V42,KIT_PATCH_V42} from '../engine.mjs';
const manifest={schema:'coachlol.championKits.v4.2',mode:'SummonersRift',patch:KIT_PATCH_V42,
 generatedFrom:'engine.mjs/CHAMPION_KITS_V42',
 statusVocabulary:['training','planned','legacy_adapter','prototype','certified'],
 legalNote:'Implementações são adaptações de treino; não são código/arte da Riot nem kits certificados 1:1.',
 sources:{riot:'https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-21-notes/',
 Nami:'https://wiki.leagueoflegends.com/en-us/Nami',Lux:'https://wiki.leagueoflegends.com/en-us/Lux',
 Vex:'https://wiki.leagueoflegends.com/en-us/Vex',Jinx:'https://wiki.leagueoflegends.com/en-us/Jinx'},
 champions:CHAMPION_KITS_V42};
writeFileSync(new URL('../data/champion_kits_v42.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
