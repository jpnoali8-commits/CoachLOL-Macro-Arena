/* CoachLOL Macro Arena — deterministic simultaneous turn core v4.3.
 * Ticks are deterministic in seeded game time; UI frame rate has no gameplay impact.
 * v1.6 canonical mode: simultaneous planning while frozen, followed by deterministic short execution.
 * Historic live-mode methods remain for compatibility but are not used by the production UI.
 * Local bot is experimental; online needs an authoritative game server.
 * Data are normalized to the user's 4096x4096 mask atlas.
 * Movement in game units/sec; atlas calibration follows explicit world-coordinate bounds.
 * Champion stats/skills/items are still training abstractions, not Riot 1:1 formulas.
 */
export const ROLES=['TOP','JG','MID','ADC','SUP'];
export const SMITE_CONTEST_RULES_V452D4_DEV9=Object.freeze({patch:'26.21',tiers:[600,1000,1400],firstEvolution:15,fullEvolution:35,range:500});
// Equal-tick arbitration is stable regardless of caller/blue/red iteration.
// A hit that alone clears the opening HP outranks nonlethal hits; for combined
// lethal hits neither can individually secure, highest impact wins the adapted
// training resolution. Never grant an objective in this helper.
export function resolveSimultaneousSmiteV452d4Dev9(openingHP,impacts){
 const valid=(Array.isArray(impacts)?impacts:[]).filter(x=>Number.isFinite(x.hit)&&x.hit>0&&typeof x.actorId==='string');
 const total=valid.reduce((a,x)=>a+x.hit,0);
 const lethal=valid.filter(x=>x.hit>=openingHP);
 const sorted=[...(lethal.length?lethal:valid)].sort((a,b)=>b.hit-a.hit||a.actorId.localeCompare(b.actorId));
 return {total,winner:total>=openingHP?sorted[0]||null:null,remaining:Math.max(0,openingHP-total)};
}


// Training-only tie-break when neither jungler has an available Smite. It is
// deliberately a seeded, single objective/turn roll, independent of render
// speed and combat RNG state. Weights are alive champions near the objective.
export function resolveNoSmiteObjectiveV452d4Dev9(seed,campId,spawnCycle,tick,blueCount,redCount){
 const blue=Math.max(0,Math.min(5,Math.trunc(Number(blueCount)||0))),red=Math.max(0,Math.min(5,Math.trunc(Number(redCount)||0)));
 if(!blue||!red)return {winner:null,blue,red,blueProbability:blue/(blue+red||1),roll:null};
 const str=`${seed}|${campId}|${spawnCycle}|${tick}`;
 let hash=2166136261>>>0;
 for(let i=0;i<str.length;i++)hash=Math.imul(hash^str.charCodeAt(i),16777619)>>>0;
 const roll=hash/4294967296;
 return {winner:roll<blue/(blue+red)?'blue':'red',blue,red,blueProbability:blue/(blue+red),roll};
}

// V4.5.2d-4 alpha — deterministic elemental terrain switching. Physical deltas
// are authored from certified masks (never guessed from a reference screenshot).
export const RIFT_ELEMENTS_V452D4=Object.freeze(['mountain','ocean','infernal','cloud','hextech','chemtech']);
export const RIFT_MODE_RULES_V452D4=Object.freeze({
 standard:Object.freeze({transformAfter:2,thirdElementIndex:3}),
 swiftplay:Object.freeze({transformAfter:1,thirdElementIndex:2})
});

// Data-driven tactical response classes. Values are public for the compact UI.
export const REACTIONS=[
 {id:'balanced',group:'Geral',icon:'⚖',name:'Equilibrada',hint:'Defende e contra-ataca',policy:'balanced'},
 {id:'defend',group:'Proteção',icon:'⬡',name:'Defender',hint:'Escudo próprio ao ser pressionado',policy:'safe'},
 {id:'heal',group:'Proteção',icon:'✚',name:'Curar aliado',hint:'Cura o aliado próximo com menor HP',policy:'safe'},
 {id:'shield',group:'Proteção',icon:'◈',name:'Escudar aliado',hint:'Protege o aliado próximo em risco',policy:'safe'},
 {id:'peel_adc',group:'Proteção',icon:'♜',name:'Peel no ADC',hint:'Prioriza ameaças ao atirador',policy:'safe'},
 {id:'guard_carry',group:'Proteção',icon:'◆',name:'Proteger carry',hint:'Defende o aliado de maior dano',policy:'safe'},
 {id:'frontline',group:'Proteção',icon:'▣',name:'Linha de frente',hint:'Absorve pressão e ganha escudo',policy:'balanced'},
 {id:'anti_dive',group:'Proteção',icon:'⛨',name:'Anti-dive',hint:'Interrompe avanços em aliados',policy:'safe'},
 {id:'kite',group:'Defesa',icon:'➶',name:'Kite',hint:'Desacelera perseguidores',policy:'safe'},
 {id:'disengage',group:'Defesa',icon:'↙',name:'Disengage',hint:'Dá espaço ao grupo',policy:'safe'},
 {id:'retreat',group:'Defesa',icon:'↶',name:'Recuar em risco',hint:'Reage a pouca vida',policy:'safe'},
 {id:'sustain',group:'Defesa',icon:'♥',name:'Sustentação',hint:'Cura moderada fora de combate',policy:'safe'},
 {id:'counterengage',group:'Combate',icon:'⤴',name:'Contra-engage',hint:'Responde à iniciação inimiga',policy:'balanced'},
 {id:'counterattack',group:'Combate',icon:'⚔',name:'Contra-atacar',hint:'Foca quem atacou primeiro',policy:'balanced'},
 {id:'engage',group:'Combate',icon:'➤',name:'Iniciar luta',hint:'Agressividade com alvo visível',policy:'aggressive'},
 {id:'burst',group:'Combate',icon:'✦',name:'Explosão',hint:'Combo quando a luta é autorizada',policy:'aggressive'},
 {id:'chase',group:'Combate',icon:'⇢',name:'Perseguir',hint:'Pressiona inimigos em fuga',policy:'aggressive'},
 {id:'countergank',group:'Macro',icon:'⚑',name:'Counter-gank',hint:'Ajuda aliado ameaçado',policy:'balanced'},
 {id:'guard_objective',group:'Macro',icon:'★',name:'Proteger objetivo',hint:'Controla pressão em objetivos',policy:'safe'},
 {id:'vision',group:'Macro',icon:'◉',name:'Visão segura',hint:'Ward apenas onde há necessidade',policy:'safe'},
 {id:'farm',group:'Macro',icon:'◇',name:'Farm seguro',hint:'Last hit sem perseguição',policy:'safe'},
];
export const CHAMPION_STATS_V38=Object.freeze({
 // LoL Wiki base stats (2026); only champions verified here override abstract class baselines.
 Jinx:{hp:610,mana:260,ad:59,ap:0,armor:26,mr:33,moveSpeed:325},
 Nami:{hp:560,mana:365,ad:54,ap:0,armor:29,mr:30,moveSpeed:335},
 Ahri:{hp:590,mana:418,ad:53,ap:0,armor:21,mr:30,moveSpeed:330},
 Vex:{hp:590,mana:490,ad:54,ap:0,armor:23,mr:28,moveSpeed:335},
 Lux:{hp:580,mana:440,ad:54,ap:0,armor:21,mr:30,moveSpeed:330}
});
// V4.2 authoritative growth curves: LoL stat growth is nonlinear, not a flat increment.
export function growthAtLevelV42(perLevel,level){
 if(level<2)return 0;
 return Number(perLevel||0)*(.7025+.0175*(2*level-3));
}
export const CHAMPION_GROWTH_V38=Object.freeze({Jinx:{hp:105,mana:50,ad:3,armor:4.2,mr:1.1},Nami:{hp:88,mana:43,ad:3.1,armor:5.2,mr:1.3},Ahri:{hp:104,mana:25,ad:3,armor:4.2,mr:1.3},Vex:{hp:104,mana:32,ad:2.75,armor:4.45,mr:1.3},Lux:{hp:99,mana:23.5,ad:3.3,armor:5.2,mr:1.3}});
export const CLASS_MAGIC_RESIST=Object.freeze({tank:32,fighter:32,mage:30,assassin:32,marksman:30,enchanter:30,support:32});
export const CLASS_STATS={
 tank:{hp:1250,mana:360,ad:56,ap:0,armor:48,range:.019,speed:.00195,atkSpeed:1.05,skill:130},
 fighter:{hp:1080,mana:420,ad:82,ap:0,armor:33,range:.020,speed:.0022,atkSpeed:1.0,skill:135},
 mage:{hp:790,mana:780,ad:48,ap:102,armor:21,range:.079,speed:.00207,atkSpeed:1.25,skill:180},
 assassin:{hp:830,mana:470,ad:94,ap:0,armor:23,range:.026,speed:.0026,atkSpeed:.95,skill:190},
 marksman:{hp:825,mana:460,ad:92,ap:0,armor:23,range:.096,speed:.0022,atkSpeed:.78,skill:120},
 enchanter:{hp:760,mana:770,ad:43,ap:75,armor:23,range:.082,speed:.00212,atkSpeed:1.3,skill:130},
 support:{hp:1060,mana:580,ad:54,ap:48,armor:42,range:.020,speed:.00215,atkSpeed:1.1,skill:110},
};
const CK={Kennen:'mage',Khazix:'assassin',Ekko:'assassin',Vayne:'marksman',Nami:'enchanter',Volibear:'fighter',Darius:'fighter',Akali:'assassin',Yuumi:'enchanter',Jinx:'marksman',Caitlyn:'marksman',Lux:'mage',Ahri:'mage',Warwick:'fighter',Mordekaiser:'fighter',Vex:'mage',Lucian:'marksman',Senna:'enchanter',Thresh:'support',Leona:'tank',Yasuo:'fighter',Yone:'fighter',Vi:'fighter',LeeSin:'fighter',JarvanIV:'fighter',Riven:'fighter',Gwen:'fighter',Orianna:'mage',Zed:'assassin',Talon:'assassin',Janna:'enchanter',Braum:'tank',Sona:'enchanter',Jhin:'marksman',Kaisa:'marksman',Ezreal:'marksman',Ashe:'marksman',Pantheon:'fighter',Graves:'marksman',Zyra:'mage',Qiyana:'assassin',Veigar:'mage',Olaf:'fighter',Irelia:'fighter',Nasus:'tank',Chogath:'tank',Viktor:'mage',KSante:'tank'};
export const catalog=[
// DEV69 Batch5 — support actives and reactive procs, verified PC 26.21 / DDragon 16.21.1.
{id:'shurelyas_battlesong',name:"Hino Bélico de Shurelya",cost:2200,stats:{"ap":50,"abilityHaste":15,"movePercent":4,"manaRegenBasePct":125},tags:['support','legendary','unique','active'],icon:'◈',riotId:2065},
{id:'redemption',name:"Redenção",cost:2300,stats:{"ap":30,"abilityHaste":15,"manaRegenBasePct":100,"healShieldPower":10},tags:['support','legendary','unique','active'],icon:'◈',riotId:3107},
{id:'locket_of_the_iron_solari',name:"Medalhão dos Solari de Ferro",cost:2200,stats:{"hp":200,"armor":30,"mr":30,"abilityHaste":10},tags:['support','legendary','unique','active'],icon:'◈',riotId:3190},
{id:'mikaels_blessing',name:"Bênção de Mikael",cost:2300,stats:{"hp":250,"manaRegenBasePct":100,"healShieldPower":12,"abilityHaste":15},tags:['support','legendary','unique','active'],icon:'◈',riotId:3222},
{id:'knights_vow',name:"Juramento do Cavaleiro",cost:2300,stats:{"hp":200,"armor":40,"abilityHaste":10,"hpRegenBasePct":100},tags:['support','legendary','unique','active'],icon:'◈',riotId:3109},
{id:'ardent_censer',name:"Turíbulo Ardente",cost:2200,stats:{"ap":45,"healShieldPower":10,"manaRegenBasePct":125,"movePercent":4},tags:['support','legendary','unique'],icon:'◈',riotId:3504},
{id:'staff_of_flowing_water',name:"Cajado Aquafluxo",cost:2250,stats:{"ap":35,"healShieldPower":10,"manaRegenBasePct":125,"abilityHaste":10},tags:['support','legendary','unique'],icon:'◈',riotId:6616},
{id:'moonstone_renewer',name:"Regenerador de Pedra Lunar",cost:2200,stats:{"ap":25,"hp":200,"abilityHaste":20,"manaRegenBasePct":125},tags:['support','legendary','unique'],icon:'◈',riotId:6617},
{id:'echoes_of_helia',name:"Ecos de Helia",cost:2200,stats:{"ap":35,"hp":200,"abilityHaste":20,"manaRegenBasePct":125},tags:['support','legendary','unique'],icon:'◈',riotId:6620},
{id:'dawncore',name:"Auronúcleo",cost:2500,stats:{"ap":45,"healShieldPower":16,"manaRegenBasePct":100},tags:['support','legendary','unique'],icon:'◈',riotId:6621},
{id:'imperial_mandate',name:"Mandato Imperial",cost:2400,stats:{"ap":60,"abilityHaste":15,"manaRegenBasePct":150,"ccHaste":20},tags:['support','legendary','unique'],icon:'◈',riotId:4005},
{id:'zekes_convergence',name:"Convergência de Zeke",cost:2200,stats:{"hp":300,"armor":25,"mr":25,"abilityHaste":10},tags:['support','legendary','unique'],icon:'◈',riotId:3050},
{id:'bandocanos',name:"Bandocanos",cost:2300,stats:{"hp":200,"armor":20,"mr":20,"abilityHaste":15},tags:['support','legendary','unique'],icon:'◈',riotId:2524},
{id:'cryptbloom',name:"Criptoflora",cost:3000,stats:{"ap":75,"magicPenPercent":30,"abilityHaste":20},tags:['support','legendary','unique'],icon:'◈',riotId:3137},
{id:'hextech_gunblade',name:"Pistola Laminar Hextec",cost:3000,stats:{"ap":80,"ad":40,"omnivamp":10},tags:['support','legendary','unique','active'],icon:'◈',riotId:3146},
{id:'dorans_blade',name:'Lâmina de Doran',cost:450,stats:{ad:10,hp:80},tags:['ADC','fighter','starter'],icon:'⚔'},
{id:'dorans_ring',name:'Anel de Doran',cost:400,stats:{ap:18,hp:90},tags:['mage','starter'],icon:'◈'},
// DEV61: Iniciadores SR 26.21 — atributos e passivas específicas auditados no DDragon 16.21.1.
{id:'dorans_bow',name:'Arco de Doran',cost:400,stats:{ad:8,attackSpeedPct:15,omnivamp:1.5},tags:['marksman','starter'],icon:'➶',riotId:1086},
{id:'dorans_helm',name:'Elmo de Doran',cost:450,stats:{hp:150,armor:8,mr:8},tags:['tank','starter'],icon:'⬡',riotId:1120},
{id:'dorans_shield',name:'Escudo de Doran',cost:450,stats:{hp:140,armor:7},tags:['tank','starter'],icon:'⬡'},
{id:'support_atlas',name:'Atlas Mundial',cost:400,stats:{},tags:['SUP','starter','quest'],roleLock:'SUP',icon:'📜'},
{id:'support_compass',name:'Bússola Rúnica',cost:0,stats:{},tags:['SUP','quest'],roleLock:'SUP',notPurchasable:true,icon:'🧭'},
{id:'support_bounty',name:'Recompensa dos Mundos',cost:0,stats:{},tags:['SUP','quest'],roleLock:'SUP',notPurchasable:true,icon:'🔮'},
{id:'jungle_gustwalker',name:'Filhote de Gustwalker · azul',cost:450,stats:{},tags:['JG','starter','quest'],roleLock:'JG',pet:'gustwalker',icon:'🐾'},
{id:'jungle_mosstomper',name:'Broto de Mosstomper · verde',cost:450,stats:{},tags:['JG','starter','quest'],roleLock:'JG',pet:'mosstomper',icon:'🛡'},
{id:'jungle_scorchclaw',name:'Filhote de Scorchclaw · vermelho',cost:450,stats:{},tags:['JG','starter','quest'],roleLock:'JG',pet:'scorchclaw',icon:'🔥'},
{id:'boots',name:'Botas',cost:300,stats:{speed:25},tags:['move'],icon:'➤'},
{id:'long_sword',name:'Espada Longa',cost:350,stats:{ad:10},tags:['fighter','assassin','marksman'],icon:'⚔'},
{id:'amp_tome',name:'Tomo Amplificador',cost:400,stats:{ap:20},tags:['mage','enchanter'],icon:'✧'},
{id:'ruby_crystal',name:'Cristal de Rubi',cost:400,stats:{hp:150},tags:['tank'],icon:'♥'},
{id:'cloth_armor',name:'Armadura de Pano',cost:300,stats:{armor:15},tags:['tank'],icon:'⬡'},
{id:'null_magic_mantle',name:'Manto Anula-Magia',cost:400,stats:{mr:20},tags:['tank','defense'],icon:'◈'},
{id:'sapphire_crystal',name:'Cristal de Safira',cost:300,stats:{mana:300},tags:['mage'],icon:'◆'},
{id:'bf_sword',name:'Espada G.P.C.',cost:1300,stats:{ad:40},tags:['marksman','fighter'],icon:'⚔'},
{id:'pickaxe',name:'Picareta',cost:875,stats:{ad:25},tags:['fighter','marksman'],icon:'⛏'},
{id:'agility_cloak',name:'Manto da Agilidade',cost:600,stats:{critChance:15},tags:['marksman'],icon:'◉'},
{id:'infinity_edge',name:'Gume do Infinito',cost:3500,stats:{ad:75,critChance:25},tags:['marksman','legendary','unique'],icon:'⚔'},
{id:'rabadon',name:'Capuz da Morte de Rabadon',cost:3500,stats:{ap:130},tags:['mage','legendary','unique'],icon:'♛'},
{id:'needless_rod',name:'Bastão Desnecessário',cost:1200,stats:{ap:65},tags:['mage'],icon:'✦'},
{id:'giants_belt',name:'Cinto do Gigante',cost:900,stats:{hp:350},tags:['tank'],icon:'⬡'},
{id:'serrated_dirk',name:'Punhal Serrilhado',cost:1000,stats:{ad:20,lethality:10},tags:['assassin'],icon:'⟡'},
// DEV37: official 16.21.1 static stats; Bullseye functional adapter added in dev38.
{id:'scouts_slingshot',name:'Estilingue do Patrulheiro',cost:600,stats:{attackSpeedPct:20},tags:['marksman','epic'],icon:'➶',riotId:3144},
{id:'blighting_jewel',name:'Joia da Ruína',cost:1100,stats:{ap:25,magicPenPercent:13},tags:['mage','epic'],icon:'◆',riotId:4630},
{id:'seekers_armguard',name:'Armaguarda da Caçadora',cost:1600,stats:{ap:40,armor:25},tags:['mage','epic','active'],icon:'⌛',riotId:2420},
{id:'recurve_bow',name:'Arco Recurvo',cost:700,stats:{attackSpeedPct:15},tags:['marksman'],icon:'➶'},
{id:'zhonyas_hourglass',name:'Ampulheta de Zhonya',cost:3250,stats:{ap:105,armor:50},tags:['mage','legendary','unique','active'],icon:'⌛'},
{id:'glowing_mote',name:'Partícula Brilhante',cost:250,stats:{abilityHaste:5},tags:['mage','fighter','support'],icon:'✧'},
{id:'kindlegem',name:'Gema Ardente',cost:800,stats:{hp:200,abilityHaste:10},tags:['tank','fighter','support','epic'],icon:'◉'},
{id:'caulfields_warhammer',name:'Martelo de Guerra de Caulfield',cost:1050,stats:{ad:20,abilityHaste:10},tags:['fighter','assassin','epic'],icon:'⚒'},
{id:'ionian_boots',name:'Botas Ionianas da Lucidez',cost:900,stats:{speed:45,abilityHaste:10,summonerHaste:10},tags:['move','boots','unique'],icon:'➤'},
{id:'vampiric_scepter',name:'Cetro Vampírico',cost:900,stats:{ad:15,lifeSteal:7},tags:['fighter','marksman','epic'],icon:'♥'},
// V4.3 — selected audited components and stat-only items. Passives not declared
// in ITEM_EFFECTS_V43 are intentionally NOT simulated; never imply full Riot parity.
{id:'blasting_wand',name:'Varinha Explosiva',cost:850,stats:{ap:45},tags:['mage'],icon:'✧'},
{id:'oblivion_orb',name:'Orbe do Oblívio',cost:800,stats:{ap:25},tags:['mage','epic'],icon:'◈',effect:'grievous_magic'},
{id:'executioners_calling',name:'Chamado do Carrasco',cost:800,stats:{ad:15},tags:['fighter','marksman','epic'],icon:'⚔',effect:'grievous_physical'},
{id:'sorcerers_shoes',name:'Sapatos do Feiticeiro',cost:1100,stats:{speed:45,magicPenFlat:12},tags:['move','boots','unique'],icon:'✦'},
{id:'mercurys_treads',name:'Passos de Mercúrio',cost:1250,stats:{speed:45,mr:20,tenacity:30},tags:['move','boots','unique'],icon:'⬡'},
{id:'void_staff',name:'Cajado do Vazio',cost:3000,stats:{ap:95,magicPenPercent:40},tags:['mage','legendary','unique'],icon:'◆'},
{id:'last_whisper',name:'Último Sussurro',cost:1450,stats:{ad:20,armorPenPercent:18},tags:['marksman','fighter','epic'],icon:'➶'},
// V4.5.3-dev29: 26.21 item batch. No claim of complete shop or full patch combat parity.
{id:'dagger',name:'Adaga',cost:250,stats:{attackSpeedPct:10},tags:['marksman','fighter'],icon:'➶'},
{id:'sheen',name:'Brilho',cost:900,stats:{abilityHaste:10},tags:['fighter','epic'],icon:'✧'},
{id:'phage',name:'Fago',cost:1100,stats:{ad:15,hp:200},tags:['fighter','epic'],icon:'⚒'},
{id:'hearthbound_axe',name:'Machado de Aquecimento',cost:1200,stats:{ad:20,attackSpeedPct:20},tags:['fighter','epic'],icon:'⚒'},
{id:'rectrix',name:'Rectrix',cost:775,stats:{ad:15,movePercent:4},tags:['assassin','epic'],icon:'➤'},
{id:'trinity_force',name:'Força da Trindade',cost:3333,stats:{ad:36,hp:333,abilityHaste:15,attackSpeedPct:30},tags:['fighter','legendary','unique'],icon:'⚔'},
{id:'black_cleaver',name:'Cutelo Negro',cost:3000,stats:{ad:45,hp:400,abilityHaste:20},tags:['fighter','legendary','unique'],icon:'⚒'},
{id:'youmuus_ghostblade',name:'Lâmina Fantasma de Youmuu',cost:2800,stats:{ad:55,lethality:18,movePercent:4},tags:['assassin','legendary','unique','active'],icon:'➤'},
// DEV31: verified PC 26.21 item batch; nonlisted effects remain pending.
{id:'chain_vest',name:'Cota de Malha',cost:800,stats:{armor:40},tags:['tank','defense'],icon:'⬡',riotId:1031},
{id:'negatron_cloak',name:'Capa Negatron',cost:850,stats:{mr:45},tags:['tank','defense'],icon:'◈',riotId:1057},
{id:'bramble_vest',name:'Colete Espinhoso',cost:800,stats:{armor:30},tags:['tank','epic','defense'],icon:'⬡',riotId:3076},
{id:'thornmail',name:'Armadura de Espinhos',cost:2450,stats:{armor:75,hp:150},tags:['tank','legendary','unique','defense'],icon:'⬡',riotId:3075},
{id:'wardens_mail',name:'Proteção de Armadura',cost:1000,stats:{armor:40},tags:['tank','epic','defense'],icon:'⬡',riotId:3082},
// Dev47: PC 26.21, Frozen Heart and its missing component, not a reference-only card.
{id:'glacial_buckler',name:'Broquel Glacial',cost:900,stats:{armor:25,mana:300,abilityHaste:10},tags:['tank','epic','defense'],icon:'❄',riotId:3024},
{id:'frozen_heart',name:'Coração Congelado',cost:2500,stats:{armor:75,mana:400,abilityHaste:20},tags:['tank','legendary','unique','defense'],icon:'❄',riotId:3110},
// DEV49: componentes stat-only SR 26.21 / DDragon 16.21.1. Não inventar passivas.
{id:'steel_sigil',name:'Sigilo de Aço',cost:1100,stats:{ad:15,armor:30},tags:['fighter','tank','epic','defense'],icon:'⬡',riotId:2019},
{id:'brutalizer',name:'Brutalizador',cost:1337,stats:{ad:25,abilityHaste:10,lethality:5},tags:['fighter','assassin','epic'],icon:'⚔',riotId:2020},
{id:'tunneler',name:'Tunelizador',cost:1150,stats:{ad:15,hp:250},tags:['fighter','epic'],icon:'⚒',riotId:2021},
// DEV59: PC Summoner's Rift 26.21, official 16.21.1 recipes/stats.
// Mercury actives cleanse typed CC except airborne; numeric cooldown/sprint are adapters.
{id:'quicksilver_sash',name:'Bandana de Mercúrio',cost:1300,stats:{mr:30},tags:['fighter','epic','defense','active'],icon:'◈',riotId:3140},
{id:'mercurial_scimitar',name:'Cimitarra Mercurial',cost:3200,stats:{ad:50,mr:35,lifeSteal:10},tags:['fighter','legendary','unique','defense','active'],icon:'⚔',riotId:3139},
// DEV50: Riot Data Dragon 16.21.1 / Summoner's Rift; all five recipes below are exact.
// Defensive boots passives are resolved in effectiveMS() and damage(), not descriptions.
{id:'swifties',name:'Botas da Rapidez',cost:1000,stats:{speed:55,slowResist:25},tags:['move','boots','unique'],icon:'➤',riotId:3009},
{id:'plated_steelcaps',name:'Botas Galvanizadas de Aço',cost:1200,stats:{speed:45,armor:25},tags:['move','boots','unique','defense'],icon:'⬡',riotId:3047},
{id:'winged_moonplate',name:'Couraça Lunar Alada',cost:800,stats:{hp:200,movePercent:4},tags:['tank','epic'],icon:'⬡',riotId:3066},
{id:'noonquiver',name:'Aljava Vespertina',cost:1300,stats:{ad:15,critChance:20},tags:['marksman','epic'],icon:'➶',riotId:6670},
{id:'aether_wisp',name:'Cintilação Etérea',cost:900,stats:{ap:30,movePercent:4},tags:['mage','epic'],icon:'✧',riotId:3113},
// DEV51: lote SR 26.21 de regeneração/defesa. Valores de regeneração são
// porcentagens DA REGENERAÇÃO BASE, não pontos de vida/mana por segundo.
// No CoachLOL as bases por campeão ainda são aproximações, explicitamente auditadas.
{id:'faerie_charm',name:'Amuleto da Fada',cost:200,stats:{manaRegenBasePct:50},tags:['mage','support','basic'],icon:'◈',riotId:1004},
{id:'rejuvenation_bead',name:'Pérola do Rejuvenescimento',cost:300,stats:{hpRegenBasePct:100},tags:['tank','support','basic'],icon:'♥',riotId:1006},
{id:'crystalline_bracer',name:'Braçadeira Cristalina',cost:800,stats:{hp:200,hpRegenBasePct:100},tags:['tank','epic','defense'],icon:'◉',riotId:3801},
{id:'spectres_cowl',name:'Capuz do Espectro',cost:1250,stats:{hp:200,mr:35,hpRegenBasePct:100},tags:['tank','epic','defense'],icon:'⬡',riotId:3211},
{id:'bandleglass_mirror',name:'Espelho de Bandópolis',cost:900,stats:{ap:20,abilityHaste:10,manaRegenBasePct:100},tags:['mage','support','epic'],icon:'✧',riotId:4642},
// DEV52: SR 26.21 (16.21.1); each passive below is handled by combat/effects, never just a tooltip.
{id:'forbidden_idol',name:'Ídolo Proibido',cost:600,stats:{manaRegenBasePct:50,healShieldPower:8},tags:['support','epic'],icon:'✧',riotId:3114},
{id:'fated_ashes',name:'Cinzas do Destino',cost:900,stats:{ap:30},tags:['mage','epic'],icon:'🔥',riotId:2508},
{id:'spirit_visage',name:'Semblante Espiritual',cost:2700,stats:{hp:400,mr:50,abilityHaste:10,hpRegenBasePct:100},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:3065},
// DEV53: componentes SR 26.21 / DDragon 16.21.1. Passivas ativas no motor, não apenas tooltip.
{id:'lost_chapter',name:'Capítulo Perdido',cost:1200,stats:{ap:40,mana:300,abilityHaste:10},tags:['mage','epic'],icon:'◆',riotId:3802},
{id:'catalyst_of_aeons',name:'Catalisador das Eras',cost:1300,stats:{hp:300,mana:375},tags:['mage','tank','epic'],icon:'◈',riotId:3803},
// DEV54: efeitos rastreados pelo motor. Versão congelada Data Dragon 16.21.1.
{id:'haunting_guise',name:'Máscara Assustadora',cost:1300,stats:{ap:30,hp:200},tags:['mage','epic'],icon:'◈',riotId:3147},
{id:'guinsoos_rageblade',name:'Lâmina da Fúria de Guinsoo',cost:3000,stats:{ad:30,ap:30,attackSpeedPct:25},tags:['marksman','legendary','unique'],icon:'⚔',riotId:3124},
// DEV55: Summoner's Rift 26.21; ghosting affects UNIT collision, never terrain.
{id:'wits_end',name:'Limite da Razão',cost:2800,stats:{attackSpeedPct:50,mr:45,tenacity:20},tags:['marksman','fighter','legendary','unique'],icon:'✦',riotId:3091},
// DEV56: Data Dragon 16.21.1 SR reference; tear stacks are authoritative.
{id:'tear_of_the_goddess',name:'Lágrima da Deusa',cost:400,stats:{mana:240},tags:['mage','basic','mana'],icon:'◆',riotId:3070},
// DEV58: Gloria SR 26.21; base stats e perda ao morrer conferidas no DDragon.
{id:'dark_seal',name:'Lacre Sombrio',cost:350,stats:{ap:15,hp:50},tags:['mage','basic','unique'],icon:'◆',riotId:1082},
{id:'mejais_soulstealer',name:'Ladrão de Almas de Mejai',cost:1500,stats:{ap:20,hp:100},tags:['mage','legendary','unique'],icon:'◆',riotId:3041},
// DEV57: SR 26.21; numbers in non-numeric passives are explicit CoachLOL adaptations.
{id:'bamis_cinder',name:'Brasa de Bami',cost:900,stats:{hp:150,abilityHaste:5},tags:['tank','epic','defense'],icon:'🔥',riotId:6660},
{id:'hexdrinker',name:'Hexdrinker',cost:1300,stats:{ad:25,mr:25},tags:['fighter','epic','defense','lifeline'],icon:'⬡',riotId:3155},
{id:'hextech_alternator',name:'Alternador Hextec',cost:1100,stats:{ap:45},tags:['mage','epic'],icon:'✧',riotId:3145},
{id:'phantom_dancer',name:'Dançarina Fantasma',cost:2650,stats:{attackSpeedPct:65,critChance:25,movePercent:10},tags:['marksman','legendary','unique'],icon:'◉',riotId:3046},
{id:'randuins_omen',name:'Presságio de Randuin',cost:2700,stats:{armor:75,hp:350},tags:['tank','legendary','unique','active','defense'],icon:'⬡',riotId:3143},
{id:'berserkers_greaves',name:'Grevas do Berserker',cost:1100,stats:{speed:45,attackSpeedPct:30},tags:['move','marksman','boots','unique'],icon:'➤',riotId:3006},
// DEV32: verified 26.21 Summoner's Rift recipes and attributes. Special effects
// below are explicit training adapters, not full 1:1 LoL simulation.
{id:'zeal',name:'Zelo',cost:1200,stats:{attackSpeedPct:15,critChance:15,movePercent:4},tags:['marksman','epic'],icon:'◈',riotId:3086},
{id:'kraken_slayer',name:'Mata-Cráquens',cost:3000,stats:{ad:45,attackSpeedPct:40,movePercent:4},tags:['marksman','legendary','unique'],icon:'⚔',riotId:6672},
{id:'rapid_firecannon',name:'Canhão Fumegante',cost:2650,stats:{attackSpeedPct:35,critChance:25,movePercent:4},tags:['marksman','legendary','unique'],icon:'➶',riotId:3094},
{id:'navori_flickerblade',name:'Adagas Rápidas Navori',cost:2650,stats:{attackSpeedPct:40,critChance:25,movePercent:4},tags:['marksman','legendary','unique'],icon:'➶',riotId:6675},
{id:'health_potion',name:'Poção de Vida',cost:50,stats:{},tags:['consumable','health'],icon:'♥',riotId:2003},
{id:'refillable_potion',name:'Poção com Refil',cost:150,stats:{},tags:['consumable','health','unique'],icon:'♥',riotId:2031},
// DEV69 / items batch 1 — Riot 16.21.1; individual effects resolved below.
{id:'cull',name:'Abatedora',cost:450,stats:{ad:7},tags:['marksman','starter','unique'],icon:'⚔',riotId:1083},
{id:'lord_dominiks_regards',name:'Lembranças do Lorde Dominik',cost:3300,stats:{ad:35,armorPenPercent:35,critChance:25},tags:['marksman','legendary','unique','fatality'],icon:'➶',riotId:3036},
// DEV69 batch 2 — Annul family; PC 26.21 / Data Dragon 16.21.1.
{id:'verdant_barrier',name:'Barreira Verdejante',cost:1600,stats:{ap:40,mr:25},tags:['mage','epic','defense','annul'],icon:'◈',riotId:4632},
{id:'banshees_veil',name:'Véu da Banshee',cost:3000,stats:{ap:105,mr:40},tags:['mage','legendary','unique','defense','annul'],icon:'◈',riotId:3102},
{id:'edge_of_night',name:'Limiar da Noite',cost:3000,stats:{ad:50,lethality:15,hp:250},tags:['assassin','legendary','unique','defense','annul'],icon:'⬡',riotId:3814},
// DEV69 batch 2 expansion: data-verified reactive/on-hit item families.
{id:'chempunk_chainsword',name:'Serrespada Quimiopunk',cost:3000,stats:{"ad":45,"hp":450,"abilityHaste":15},tags:["fighter","legendary","unique"],icon:'☣',riotId:6609},
{id:'seryldas_grudge',name:'Rancor de Serylda',cost:3000,stats:{"ad":45,"armorPenPercent":35,"abilityHaste":15},tags:["assassin","legendary","unique","fatality"],icon:'❄',riotId:6694},
{id:'shadowflame',name:'Chama Sombria',cost:3200,stats:{"ap":110,"magicPenFlat":15},tags:["mage","legendary","unique"],icon:'◆',riotId:4645},
{id:'the_collector',name:'A Coletora',cost:3000,stats:{"ad":50,"critChance":25,"lethality":10},tags:["assassin","marksman","legendary","unique"],icon:'⚔',riotId:6676},
{id:'abyssal_mask',name:'Máscara Abissal',cost:2650,stats:{"hp":350,"mr":45,"abilityHaste":15},tags:["tank","legendary","unique"],icon:'◈',riotId:8020},
{id:'cosmic_drive',name:'Ímpeto Cósmico',cost:3000,stats:{"hp":350,"ap":70,"abilityHaste":25,"movePercent":4},tags:["mage","legendary","unique"],icon:'➤',riotId:4629},
{id:'overlords_bloodmail',name:'Armadura Sangrenta do Suserano',cost:3300,stats:{"hp":550,"ad":30},tags:["fighter","legendary","unique"],icon:'♥',riotId:2501},
{id:'riftmaker',name:'Criafendas',cost:3100,stats:{"hp":350,"ap":70,"abilityHaste":15},tags:["mage","legendary","unique"],icon:'◈',riotId:4633},
{id:'liandrys_torment',name:'Tormento de Liandry',cost:3000,stats:{"hp":300,"ap":60},tags:["mage","legendary","unique"],icon:'🔥',riotId:6653},
{id:'bloodletters_curse',name:'Maldição Sanguinária',cost:2900,stats:{"hp":400,"ap":65,"abilityHaste":15},tags:["mage","legendary","unique"],icon:'◆',riotId:8010},
{id:'kaenic_rookern',name:'Rookern Lamúrico',cost:2900,stats:{"hp":400,"mr":80,"hpRegenBasePct":100},tags:["tank","legendary","unique"],icon:'◈',riotId:2504},
{id:'maw_of_malmortius',name:'Mandíbula de Malmortius',cost:3100,stats:{"ad":60,"mr":40,"abilityHaste":15},tags:["fighter","legendary","unique","lifeline"],icon:'◈',riotId:3156},
{id:'immortal_shieldbow',name:'Arco-escudo Imortal',cost:3000,stats:{"ad":55,"critChance":25},tags:["marksman","legendary","unique","lifeline"],icon:'◈',riotId:6673},
{id:'steraks_gage',name:'Sinal de Sterak',cost:3200,stats:{"hp":400,"tenacity":20},tags:["fighter","legendary","unique","lifeline"],icon:'◈',riotId:3053},
{id:'force_of_nature',name:'Força da Natureza',cost:2800,stats:{"hp":400,"mr":55,"movePercent":4},tags:["tank","legendary","unique"],icon:'➤',riotId:4401},
// DEV69 batch3 — auto-attack/cleave family, official 16.21.1 source; see QA.
{id:'blade_of_ruined_king',name:'Espada do Rei Destruído',cost:3200,stats:{"ad":40,"attackSpeedPct":25,"lifeSteal":10},tags:["marksman","fighter","legendary","unique"],icon:'⚔',riotId:3153},
{id:'terminus',name:'Terminus',cost:3000,stats:{"ad":30,"attackSpeedPct":35},tags:["marksman","fighter","legendary","unique"],icon:'◈',riotId:3302},
{id:'runaans_hurricane',name:'Furacão de Runaan',cost:2650,stats:{"attackSpeedPct":40,"critChance":25,"movePercent":5},tags:["marksman","legendary","unique"],icon:'➶',riotId:3085},
{id:'yun_tal_wildarrows',name:'Flechatroz de Yun Tal',cost:3000,stats:{"ad":50,"attackSpeedPct":45},tags:["marksman","legendary","unique"],icon:'➶',riotId:3032},
{id:'hexoptik_c44',name:'Hexótica C44',cost:2800,stats:{"ad":55,"critChance":25},tags:["marksman","legendary","unique"],icon:'➶',riotId:2523},
{id:'hullbreaker',name:'Quebracascos',cost:3000,stats:{"ad":40,"hp":500,"movePercent":4},tags:["fighter","tank","legendary","unique"],icon:'⬡',riotId:3181},
{id:'sundered_sky',name:'Céu Dividido',cost:3100,stats:{"ad":40,"hp":400,"abilityHaste":10},tags:["fighter","legendary","unique"],icon:'⚔',riotId:6610},
{id:'eclipse',name:'Eclipse',cost:2900,stats:{"ad":60,"abilityHaste":15},tags:["fighter","assassin","legendary","unique"],icon:'◉',riotId:6692},
{id:'essence_reaver',name:'Colhedor de Essência',cost:3050,stats:{"ad":50,"abilityHaste":20,"critChance":25},tags:["marksman","legendary","unique","spellblade"],icon:'⚔',riotId:3508},
{id:'bloodthirster',name:'Sedenta por Sangue',cost:3400,stats:{"ad":80,"lifeSteal":15},tags:["marksman","legendary","unique"],icon:'♥',riotId:3072},
{id:'tiamat',name:'Tiamat',cost:1200,stats:{"ad":25},tags:["fighter","epic","cleave"],icon:'⌘',riotId:3077},
{id:'ravenous_hydra',name:'Hidra Raivosa',cost:3300,stats:{"ad":65,"abilityHaste":15,"lifeSteal":12},tags:["fighter","legendary","unique","cleave"],icon:'⌘',riotId:3074},
{id:'titanic_hydra',name:'Hidra Titânica',cost:3300,stats:{"ad":40,"hp":600},tags:["fighter","tank","legendary","unique","cleave"],icon:'⌘',riotId:3748},
{id:'profane_hydra',name:'Hidra Profana',cost:2850,stats:{"ad":55,"lethality":18,"abilityHaste":10},tags:["assassin","legendary","unique","cleave"],icon:'⌘',riotId:6698},
{id:'stridebreaker',name:'Quebrapassos',cost:3300,stats:{"ad":40,"attackSpeedPct":25,"hp":450},tags:["fighter","legendary","unique","cleave"],icon:'⌘',riotId:6631},
// Dev69 Batch4 — canonical patch 26.21 DDragon 16.21.1; deterministic defense/sustain rules.
{id:'eternal_despair',name:'Desespero Eterno',cost:2800,stats:{"hp":400,"armor":50,"abilityHaste":15},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:2502},
{id:'sunfire_aegis',name:'Égide de Fogo Solar',cost:2800,stats:{"hp":350,"armor":50,"abilityHaste":10},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:3068},
{id:'hollow_radiance',name:'Resplendor Vazio',cost:2800,stats:{"hp":400,"mr":40,"abilityHaste":10,"hpRegenBasePct":100},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:6664},
{id:'warmogs_armor',name:'Armadura de Warmog',cost:3100,stats:{"hp":1000,"hpRegenBasePct":100},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:3083},
{id:'heartsteel',name:'Coração de Aço',cost:3000,stats:{"hp":900,"hpRegenBasePct":100},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:3084},
{id:'jaksho_the_protean',name:"Jak'Sho, o Inconstante",cost:3200,stats:{"hp":350,"armor":45,"mr":45},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:6665},
{id:'dead_mans_plate',name:'Couraça do Defunto',cost:2900,stats:{"hp":350,"armor":55,"movePercent":4},tags:['tank','legendary','unique','defense'],icon:'◈',riotId:3742},
{id:'guardian_angel',name:'Anjo Guardião',cost:3200,stats:{"ad":55,"armor":45},tags:['fighter','legendary','unique','defense'],icon:'◈',riotId:3026},
{id:'deaths_dance',name:'Dança da Morte',cost:3300,stats:{"ad":60,"armor":50,"abilityHaste":15},tags:['fighter','legendary','unique','defense'],icon:'◈',riotId:6333},
{id:'rod_of_ages',name:'Bastão das Eras',cost:2600,stats:{"hp":350,"mana":500,"ap":45},tags:['mage','legendary','unique'],icon:'◈',riotId:6657},
{id:'winters_approach',name:'Aproximação Invernal',cost:2400,stats:{"hp":550,"mana":500,"abilityHaste":15},tags:['tank','legendary','unique'],icon:'◈',riotId:3119},
{id:'archangels_staff',name:'Cajado do Arcanjo',cost:2900,stats:{"ap":70,"mana":600,"abilityHaste":25},tags:['mage','legendary','unique'],icon:'◈',riotId:3003},
{id:'manamune',name:'Manamune',cost:2900,stats:{"ad":35,"mana":500,"abilityHaste":15},tags:['fighter','legendary','unique'],icon:'◈',riotId:3004},
{id:'experimental_hexplate',name:'Hexoplaca Experimental',cost:3000,stats:{"ad":40,"attackSpeedPct":20,"hp":450,"ultimateHaste":30},tags:['fighter','legendary','unique'],icon:'◈',riotId:3073},
{id:'spear_of_shojin',name:'Lança de Shojin',cost:3100,stats:{"ad":45,"hp":450,"basicHaste":25},tags:['fighter','legendary','unique'],icon:'◈',riotId:3161},
// DEV33 — checked SR 26.21 components and combat effects; does not certify full catalog parity.
{id:'fiendish_codex',name:'Códice Demoníaco',cost:850,stats:{ap:25,abilityHaste:10},tags:['mage','epic'],icon:'◈',riotId:3108},
{id:'nashors_tooth',name:"Dente de Na'Shor",cost:2900,stats:{ap:80,abilityHaste:15,attackSpeedPct:50},tags:['mage','legendary','unique'],icon:'✦',riotId:3115},
{id:'mortal_reminder',name:'Lembrete Mortal',cost:3000,stats:{ad:35,armorPenPercent:30,critChance:25},tags:['marksman','legendary','unique','fatality'],icon:'➶',riotId:3033},
{id:'morellonomicon',name:'Morellonomicon',cost:2850,stats:{ap:75,hp:350,abilityHaste:15},tags:['mage','legendary','unique'],icon:'◈',riotId:3165},
{id:'rylais_crystal_scepter',name:'Cetro de Cristal de Rylai',cost:2600,stats:{ap:65,hp:400},tags:['mage','legendary','unique'],icon:'✧',riotId:3116},
{id:'ward',name:'Sentinela de Controle',cost:75,stats:{},tags:['vision','consumable'],icon:'◉'},
{id:'trinket_stealth',name:'Totem de Vigilância · Ward Amarela',cost:0,stats:{},tags:['vision','trinket'],icon:'◈'},
{id:'trinket_oracle',name:'Lente Reveladora · Varredura',cost:0,stats:{},tags:['vision','trinket'],icon:'◎'},
{id:'trinket_farsight',name:'Alteração Vidente · Sentinela Azul',cost:0,stats:{},tags:['vision','trinket'],icon:'◉',riotId:3363},
{id:'statikk_shiv',name:"Faca de Statikk",cost:3000,stats:{"ad":45,"ap":45,"attackSpeedPct":30,"movePercent":4},tags:["marksman","legendary","unique"],icon:'✦',riotId:3087},
{id:'stormrazor',name:"Chuva de Canivete",cost:3200,stats:{"ad":50,"attackSpeedPct":25,"critChance":25},tags:["marksman","legendary","unique"],icon:'✦',riotId:3095},
{id:'lich_bane',name:"Perdição de Lich",cost:2900,stats:{"ap":100,"movePercent":6,"abilityHaste":10},tags:["mage","legendary","unique","spellblade"],icon:'✦',riotId:3100},
{id:'malignance',name:"Malevolência",cost:2700,stats:{"ap":90,"mana":600,"abilityHaste":15,"ultimateHaste":20},tags:["mage","legendary","unique"],icon:'✦',riotId:3118},
{id:'horizon_focus',name:"Foco do Horizonte",cost:2700,stats:{"ap":75,"abilityHaste":25},tags:["mage","legendary","unique"],icon:'✦',riotId:4628},
{id:'stormsurge',name:"Ápice da Tempestade",cost:2800,stats:{"ap":90,"magicPenFlat":15,"movePercent":6},tags:["mage","legendary","unique"],icon:'✦',riotId:4646},
{id:'ludens_companion',name:"Eco de Luden",cost:2750,stats:{"ap":100,"mana":600,"abilityHaste":10},tags:["mage","legendary","unique"],icon:'✦',riotId:6655},
{id:'iceborn_gauntlet',name:"Manopla dos Glacinatas",cost:2900,stats:{"hp":300,"armor":50,"abilityHaste":15},tags:["tank","legendary","unique","spellblade"],icon:'✦',riotId:6662},
{id:'serpents_fang',name:"Presa da Serpente",cost:2500,stats:{"ad":55,"lethality":15},tags:["assassin","legendary","unique"],icon:'✦',riotId:6695},
{id:'axiom_arc',name:"Arco do Axioma",cost:2750,stats:{"ad":55,"lethality":18,"abilityHaste":20},tags:["assassin","legendary","unique"],icon:'✦',riotId:6696},
{id:'hubris',name:"Húbris",cost:2800,stats:{"ad":55,"lethality":18,"abilityHaste":10},tags:["assassin","legendary","unique"],icon:'✦',riotId:6697},
{id:'voltaic_cyclosword',name:"Cicloespada Voltaica",cost:3000,stats:{"ad":55,"lethality":10,"abilityHaste":10},tags:["assassin","legendary","unique"],icon:'✦',riotId:6699},
{id:'blackfire_torch',name:"Tocha de Chamas Negras",cost:2800,stats:{"ap":80,"mana":600,"abilityHaste":20},tags:["mage","legendary","unique"],icon:'✦',riotId:2503},
{id:'yun_tal_demon_arrows',name:"Dardos de Caça-Demônios",cost:2650,stats:{"attackSpeedPct":45,"critChance":25,"movePercent":4,"ultimateHaste":30},tags:["marksman","legendary","unique"],icon:'✦',riotId:2512},
{id:'dusk_and_dawn',name:"Aurora e Crepúsculo",cost:3100,stats:{"hp":300,"ap":60,"abilityHaste":20,"attackSpeedPct":20},tags:["fighter","legendary","unique","spellblade"],icon:'✦',riotId:2510},
// DEV69 Batch7 — the remaining Riot PC 26.21 normal SR rows.
{id:'elixir_of_iron',name:"Elixir de Ferro",cost:500,stats:{},tags:["consumable","elixir"],icon:'✦',riotId:2138},
{id:'elixir_of_sorcery',name:"Elixir da Feitiçaria",cost:500,stats:{},tags:["consumable","elixir"],icon:'✦',riotId:2139},
{id:'elixir_of_wrath',name:"Elixir da Ira",cost:500,stats:{},tags:["consumable","elixir"],icon:'✦',riotId:2140},
{id:'shattered_armguard',name:"Armaguarda Despedaçada",cost:1600,stats:{"ap":40,"armor":25},tags:["mage","epic","defense","spent"],icon:'✦',riotId:2421},
{id:'endless_hunger',name:"Fome Eterna",cost:3100,stats:{"ad":65,"omnivamp":5,"tenacity":20},tags:["fighter","legendary","unique"],icon:'✦',riotId:2517},
{id:'bastionbreaker',name:"Quebra-Bastião",cost:3000,stats:{"ad":55,"lethality":18,"abilityHaste":15},tags:["assassin","legendary","unique"],icon:'✦',riotId:2520},
{id:'actualizer',name:"Concretizador",cost:2800,stats:{"ap":90,"mana":300,"abilityHaste":10},tags:["mage","legendary","unique","active"],icon:'✦',riotId:2522},
{id:'protoplasm_harness',name:"Couraça Protoplasmática",cost:2600,stats:{"hp":600,"abilityHaste":20},tags:["tank","legendary","unique","defense","lifeline"],icon:'✦',riotId:2525},
{id:'whispering_circlet',name:"Tiara Sussurrante",cost:2250,stats:{"hp":200,"mana":300,"manaRegenBasePct":75,"healShieldPower":8},tags:["support","legendary","unique","mana"],icon:'✦',riotId:2526},
{id:'voracious_greaves',name:"Grevas Vorazes",cost:1100,stats:{"speed":45,"omnivamp":4},tags:["move","boots","unique"],icon:'✦',riotId:3008},
{id:'hextech_rocketbelt',name:"Explocinturão Hextec",cost:2650,stats:{"hp":350,"ap":60,"abilityHaste":10},tags:["mage","legendary","unique","active"],icon:'✦',riotId:3152},
{id:'immortal_journey',name:"Caminho Imortal",cost:1100,stats:{"speed":45,"omnivamp":4},tags:["move","boots","unique","noxian"],icon:'✦',riotId:3168},
{id:'swift_march',name:"Marcha Célere",cost:1000,stats:{"speed":65,"slowResist":25},tags:["move","boots","unique","noxian"],icon:'✦',riotId:3170},
{id:'scarlet_lucidity',name:"Lucidez Escarlate",cost:900,stats:{"speed":45,"abilityHaste":20,"summonerHaste":20},tags:["move","boots","unique","noxian"],icon:'✦',riotId:3171},
{id:'war_greaves',name:"Grevas Bélicas",cost:1100,stats:{"speed":45,"attackSpeedPct":45,"lifeSteal":5},tags:["move","boots","unique","noxian"],icon:'✦',riotId:3172},
{id:'chained_crushers',name:"Esmagadores Acorrentados",cost:1250,stats:{"speed":45,"mr":25,"tenacity":30},tags:["move","boots","unique","noxian"],icon:'✦',riotId:3173},
{id:'armored_mobilization',name:"Mobilização Blindada",cost:1200,stats:{"speed":45,"armor":35},tags:["move","boots","unique","noxian"],icon:'✦',riotId:3174},
{id:'enchanted_footwear',name:"Sapatos Enfeitiçados",cost:1100,stats:{"speed":45,"magicPenFlat":20,"magicPenPercent":8},tags:["move","boots","unique","noxian"],icon:'✦',riotId:3175},
{id:'umbral_glaive',name:"Glaive Sombria",cost:2800,stats:{"ad":60,"lethality":18,"abilityHaste":15},tags:["assassin","legendary","unique","vision"],icon:'✦',riotId:3179},
{id:'diadem_of_songs',name:'Diadema de Canções',cost:2250,stats:{hp:200,mana:1000,manaRegenBasePct:100,healShieldPower:8},tags:['support','quest','unique'],notPurchasable:true,icon:'◈',riotId:2530},
/* DEV30_OFFICIAL_ITEMS_START (generated only from authentic input) */
/* DEV30_OFFICIAL_ITEMS_END */
];
// DEV60: Riot Data Dragon 16.21.1 / Summoner's Rift 26.21 gold.sell.
// Authoritative, item-specific refund. Never assume 70% for starters,
// consumables, Guardian Angel, and other official exceptions.
export const ITEM_SELL_VALUES_V453_DEV60=Object.freeze({"aether_wisp":630,"agility_cloak":420,"amp_tome":280,"bamis_cinder":630,"bandleglass_mirror":630,"berserkers_greaves":770,"bf_sword":910,"black_cleaver":2100,"blasting_wand":595,"blighting_jewel":770,"boots":210,"bramble_vest":560,"brutalizer":936,"catalyst_of_aeons":910,"caulfields_warhammer":735,"chain_vest":560,"cloth_armor":210,"crystalline_bracer":560,"dagger":175,"dark_seal":140,"dorans_blade":180,"dorans_ring":160,"dorans_bow":160,"dorans_helm":180,"dorans_shield":180,"executioners_calling":560,"faerie_charm":140,"fated_ashes":630,"fiendish_codex":595,"forbidden_idol":420,"frozen_heart":1750,"giants_belt":630,"glacial_buckler":630,"glowing_mote":175,"guinsoos_rageblade":2100,"haunting_guise":910,"health_potion":20,"hearthbound_axe":840,"hexdrinker":910,"hextech_alternator":770,"infinity_edge":2450,"ionian_boots":630,"jungle_gustwalker":0,"jungle_mosstomper":0,"jungle_scorchclaw":0,"kindlegem":560,"kraken_slayer":2100,"last_whisper":1015,"long_sword":245,"lost_chapter":840,"mejais_soulstealer":1050,"mercurial_scimitar":2240,"mercurys_treads":875,"morellonomicon":1995,"mortal_reminder":2100,"nashors_tooth":2030,"navori_flickerblade":1855,"needless_rod":840,"negatron_cloak":595,"noonquiver":910,"null_magic_mantle":280,"oblivion_orb":560,"phage":770,"phantom_dancer":1855,"pickaxe":613,"plated_steelcaps":840,"quicksilver_sash":910,"rabadon":2450,"randuins_omen":1890,"rapid_firecannon":1855,"rectrix":543,"recurve_bow":490,"refillable_potion":60,"rejuvenation_bead":120,"ruby_crystal":280,"rylais_crystal_scepter":1820,"sapphire_crystal":210,"scouts_slingshot":420,"seekers_armguard":640,"serrated_dirk":700,"sheen":630,"sorcerers_shoes":770,"spectres_cowl":875,"spirit_visage":1890,"steel_sigil":770,"support_atlas":160,"swifties":700,"tear_of_the_goddess":280,"thornmail":1715,"trinity_force":2333,"trinket_oracle":0,"trinket_stealth":0,"tunneler":805,"vampiric_scepter":630,"void_staff":2100,"ward":30,"wardens_mail":700,"winged_moonplate":560,"wits_end":1960,"youmuus_ghostblade":1960,"zeal":840,"zhonyas_hourglass":2275,"cull":180,"lord_dominiks_regards":2310,"verdant_barrier":1120,"banshees_veil":2100,"edge_of_night":2100,"chempunk_chainsword":2100,"seryldas_grudge":2100,"shadowflame":2240,"the_collector":2100,"abyssal_mask":1855,"cosmic_drive":2100,"overlords_bloodmail":2310,"riftmaker":2170,"liandrys_torment":2100,"bloodletters_curse":2030,"kaenic_rookern":2030,"maw_of_malmortius":2170,"immortal_shieldbow":2100,"steraks_gage":2240,"force_of_nature":1960,"blade_of_ruined_king":2240,"terminus":2100,"runaans_hurricane":1855,"yun_tal_wildarrows":2100,"hexoptik_c44":1960,"hullbreaker":2100,"sundered_sky":2170,"eclipse":2030,"essence_reaver":2135,"bloodthirster":2380,"tiamat":840,"ravenous_hydra":2310,"titanic_hydra":2310,"profane_hydra":1995,"stridebreaker":2310,"eternal_despair":1960,"sunfire_aegis":1960,"hollow_radiance":1960,"warmogs_armor":2170,"heartsteel":2100,"jaksho_the_protean":2240,"dead_mans_plate":2030,"guardian_angel":1280,"deaths_dance":2310,"rod_of_ages":1820,"winters_approach":1680,"archangels_staff":2030,"manamune":2030,"experimental_hexplate":2100,"spear_of_shojin":2170,"shurelyas_battlesong":1540,"redemption":1610,"locket_of_the_iron_solari":1540,"mikaels_blessing":1610,"knights_vow":1610,"ardent_censer":1540,"staff_of_flowing_water":1575,"moonstone_renewer":1540,"echoes_of_helia":1540,"dawncore":1750,"imperial_mandate":1680,"zekes_convergence":1540,"bandocanos":1610,"cryptbloom":2100,"hextech_gunblade":2100,"statikk_shiv":2100,"stormrazor":2240,"lich_bane":2030,"malignance":1890,"horizon_focus":1890,"stormsurge":1960,"ludens_companion":1925,"iceborn_gauntlet":2030,"serpents_fang":1750,"axiom_arc":1925,"hubris":1960,"voltaic_cyclosword":2100,"blackfire_torch":1960,"yun_tal_demon_arrows":1855,"dusk_and_dawn":2170,"elixir_of_iron":200,"elixir_of_sorcery":200,"elixir_of_wrath":200,"shattered_armguard":640,"endless_hunger":2170,"bastionbreaker":2100,"actualizer":1960,"protoplasm_harness":1820,"whispering_circlet":1575,"voracious_greaves":770,"hextech_rocketbelt":1855,"immortal_journey":770,"swift_march":700,"scarlet_lucidity":630,"war_greaves":770,"chained_crushers":875,"armored_mobilization":840,"enchanted_footwear":770,"umbral_glaive":1960,"trinket_farsight":0});
export const officialSaleValueV453Dev60=id=>Object.prototype.hasOwnProperty.call(ITEM_SELL_VALUES_V453_DEV60,id)?ITEM_SELL_VALUES_V453_DEV60[id]:null;

// v3.2: structured component recipes. Other items retain standalone prices until catalog expansion.
export const ITEM_RECIPES={rabadon:['needless_rod','needless_rod'],infinity_edge:['bf_sword','pickaxe','agility_cloak'],ionian_boots:['boots','glowing_mote'],kindlegem:['ruby_crystal','glowing_mote'],caulfields_warhammer:['long_sword','glowing_mote','long_sword'],vampiric_scepter:['long_sword'],oblivion_orb:['amp_tome'],executioners_calling:['long_sword'],sorcerers_shoes:['boots'],mercurys_treads:['boots','null_magic_mantle'],void_staff:['blighting_jewel','blasting_wand'],last_whisper:['long_sword','long_sword'],
 giants_belt:['ruby_crystal'],serrated_dirk:['long_sword','long_sword'],
 scouts_slingshot:['dagger','dagger'],blighting_jewel:['amp_tome'],
 seekers_armguard:['amp_tome','cloth_armor','amp_tome'],
 zhonyas_hourglass:['needless_rod','seekers_armguard'],
 sheen:['glowing_mote'],phage:['ruby_crystal','long_sword'],
 hearthbound_axe:['long_sword','dagger','long_sword'],rectrix:['long_sword'],
 trinity_force:['sheen','phage','hearthbound_axe'],black_cleaver:['phage','kindlegem','pickaxe'],
 youmuus_ghostblade:['serrated_dirk','rectrix','long_sword'],
 chain_vest:['cloth_armor'],negatron_cloak:['null_magic_mantle'],
 bramble_vest:['cloth_armor','cloth_armor'],thornmail:['bramble_vest','chain_vest','ruby_crystal'],
 steel_sigil:['cloth_armor','long_sword','cloth_armor'],brutalizer:['glowing_mote','pickaxe'],tunneler:['long_sword','ruby_crystal'],
 swifties:['boots'],plated_steelcaps:['boots','cloth_armor'],winged_moonplate:['ruby_crystal'],noonquiver:['long_sword','agility_cloak'],aether_wisp:['amp_tome'],
 faerie_charm:[],rejuvenation_bead:[],crystalline_bracer:['ruby_crystal','rejuvenation_bead'],spectres_cowl:['ruby_crystal','null_magic_mantle','rejuvenation_bead'],bandleglass_mirror:['faerie_charm','amp_tome','glowing_mote'],
 forbidden_idol:['faerie_charm'],fated_ashes:['amp_tome'],spirit_visage:['spectres_cowl','kindlegem'],
 lost_chapter:['amp_tome','sapphire_crystal','glowing_mote'],catalyst_of_aeons:['ruby_crystal','ruby_crystal','sapphire_crystal'],
 haunting_guise:['amp_tome','ruby_crystal'],guinsoos_rageblade:['amp_tome','recurve_bow','pickaxe'],wits_end:['recurve_bow','negatron_cloak','recurve_bow'],phantom_dancer:['dagger','zeal','dagger'],hextech_alternator:['amp_tome','amp_tome'],bamis_cinder:['ruby_crystal','glowing_mote'],hexdrinker:['long_sword','null_magic_mantle','long_sword'],dark_seal:[],mejais_soulstealer:['dark_seal'],
 quicksilver_sash:['null_magic_mantle'],mercurial_scimitar:['quicksilver_sash','pickaxe','vampiric_scepter'],
 wardens_mail:['cloth_armor','cloth_armor'],glacial_buckler:['cloth_armor','sapphire_crystal','glowing_mote'],frozen_heart:['wardens_mail','glacial_buckler'],randuins_omen:['wardens_mail','giants_belt'],
 berserkers_greaves:['boots','dagger','dagger'],
 recurve_bow:['dagger'],zeal:['agility_cloak','dagger'],kraken_slayer:['rectrix','hearthbound_axe','recurve_bow'],
 rapid_firecannon:['zeal','scouts_slingshot'],navori_flickerblade:['zeal','dagger','dagger'],
 fiendish_codex:['amp_tome','glowing_mote'],nashors_tooth:['recurve_bow','blasting_wand','fiendish_codex'],
 mortal_reminder:['executioners_calling','last_whisper','agility_cloak'],
 lord_dominiks_regards:['last_whisper','noonquiver'],
 eternal_despair:['chain_vest','kindlegem','ruby_crystal'],
 sunfire_aegis:['bamis_cinder','chain_vest','ruby_crystal'],
 hollow_radiance:['bamis_cinder','spectres_cowl'],
 warmogs_armor:['giants_belt','giants_belt','crystalline_bracer'],
 heartsteel:['giants_belt','crystalline_bracer','giants_belt'],
 jaksho_the_protean:['giants_belt','chain_vest','negatron_cloak'],
 dead_mans_plate:['winged_moonplate','ruby_crystal','chain_vest'],
 guardian_angel:['steel_sigil','bf_sword'],
 deaths_dance:['steel_sigil','pickaxe','caulfields_warhammer'],
 rod_of_ages:['blasting_wand','catalyst_of_aeons'],
 winters_approach:['tear_of_the_goddess','giants_belt','kindlegem'],
 archangels_staff:['tear_of_the_goddess','lost_chapter','fiendish_codex'],
 manamune:['tear_of_the_goddess','caulfields_warhammer','long_sword'],
 experimental_hexplate:['tunneler','dagger','phage'],
 spear_of_shojin:['pickaxe','tunneler','ruby_crystal'],
 verdant_barrier:['amp_tome','null_magic_mantle','amp_tome'],banshees_veil:['needless_rod','verdant_barrier'],edge_of_night:['serrated_dirk','tunneler'],
 morellonomicon:['oblivion_orb','blasting_wand','kindlegem'],
 rylais_crystal_scepter:['blasting_wand','giants_belt','amp_tome'],
 /* DEV30_OFFICIAL_RECIPES_START */
 /* DEV30_OFFICIAL_RECIPES_END */
 // DEV69 Batch7 exact Riot recipe graph
 elixir_of_iron:[],
 elixir_of_sorcery:[],
 elixir_of_wrath:[],
 shattered_armguard:["amp_tome","cloth_armor","amp_tome"],
 endless_hunger:["caulfields_warhammer","pickaxe","long_sword"],
 bastionbreaker:["brutalizer","serrated_dirk"],
 actualizer:["lost_chapter","blasting_wand"],
 protoplasm_harness:["kindlegem","giants_belt"],
 whispering_circlet:["forbidden_idol","ruby_crystal","tear_of_the_goddess"],
 voracious_greaves:["boots"],
 hextech_rocketbelt:["hextech_alternator","kindlegem","ruby_crystal"],
 immortal_journey:["voracious_greaves"],
 swift_march:["swifties"],
 scarlet_lucidity:["ionian_boots"],
 war_greaves:["berserkers_greaves"],
 chained_crushers:["mercurys_treads"],
 armored_mobilization:["plated_steelcaps"],
 enchanted_footwear:["sorcerers_shoes"],
 umbral_glaive:["serrated_dirk","caulfields_warhammer"],
// DEV69 Batch6 recipes verified from DDragon 16.21.1
 statikk_shiv:["scouts_slingshot","aether_wisp","pickaxe"],
 stormrazor:["bf_sword","agility_cloak","scouts_slingshot"],
 lich_bane:["sheen","aether_wisp","blasting_wand"],
 malignance:["lost_chapter","blasting_wand"],
 horizon_focus:["fiendish_codex","fiendish_codex","amp_tome"],
 stormsurge:["hextech_alternator","aether_wisp"],
 ludens_companion:["lost_chapter","hextech_alternator"],
 iceborn_gauntlet:["sheen","ruby_crystal","chain_vest"],
 serpents_fang:["serrated_dirk","pickaxe"],
 axiom_arc:["brutalizer","caulfields_warhammer"],
 hubris:["serrated_dirk","caulfields_warhammer"],
 voltaic_cyclosword:["brutalizer","long_sword","long_sword"],
 blackfire_torch:["lost_chapter","fated_ashes"],
 yun_tal_demon_arrows:["zeal","scouts_slingshot"],
 dusk_and_dawn:["sheen","blasting_wand","kindlegem","dagger"],
// DEV69 support Batch5 verified recipes (Riot 16.21.1).
 shurelyas_battlesong:["aether_wisp", "bandleglass_mirror"],
 redemption:["fiendish_codex", "forbidden_idol"],
 locket_of_the_iron_solari:["kindlegem", "cloth_armor", "null_magic_mantle"],
 mikaels_blessing:["kindlegem", "forbidden_idol"],
 knights_vow:["kindlegem", "chain_vest", "rejuvenation_bead"],
 ardent_censer:["aether_wisp", "forbidden_idol"],
 staff_of_flowing_water:["fiendish_codex", "forbidden_idol"],
 moonstone_renewer:["kindlegem", "bandleglass_mirror"],
 echoes_of_helia:["kindlegem", "bandleglass_mirror"],
 dawncore:["blasting_wand", "forbidden_idol", "forbidden_idol"],
 imperial_mandate:["amp_tome", "bandleglass_mirror", "amp_tome"],
 zekes_convergence:["kindlegem", "cloth_armor", "null_magic_mantle"],
 bandocanos:["kindlegem", "cloth_armor", "null_magic_mantle"],
 cryptbloom:["blighting_jewel", "fiendish_codex", "fiendish_codex"],
 hextech_gunblade:["vampiric_scepter", "hextech_alternator", "amp_tome"],
 // DEV69 reactive batch: exact Riot 16.21.1 component IDs.
 chempunk_chainsword:['executioners_calling','giants_belt','caulfields_warhammer'],
 seryldas_grudge:['caulfields_warhammer','last_whisper'],
 shadowflame:['hextech_alternator','needless_rod'],
 the_collector:['pickaxe','serrated_dirk','agility_cloak'],
 abyssal_mask:['kindlegem','negatron_cloak'],
 cosmic_drive:['kindlegem','aether_wisp','fiendish_codex'],
 overlords_bloodmail:['tunneler','tunneler'],
 riftmaker:['haunting_guise','fiendish_codex'],
 liandrys_torment:['haunting_guise','fated_ashes'],
 bloodletters_curse:['haunting_guise','fiendish_codex'],
 kaenic_rookern:['spectres_cowl','negatron_cloak'],
 maw_of_malmortius:['hexdrinker','caulfields_warhammer'],
 immortal_shieldbow:['pickaxe','noonquiver'],
 steraks_gage:['pickaxe','tunneler','ruby_crystal'],
 force_of_nature:['negatron_cloak','ruby_crystal','winged_moonplate'],
 blade_of_ruined_king:["vampiric_scepter", "recurve_bow", "pickaxe"],
 terminus:["hearthbound_axe", "recurve_bow"],
 runaans_hurricane:["zeal", "scouts_slingshot"],
 yun_tal_wildarrows:["bf_sword", "scouts_slingshot", "long_sword"],
 hexoptik_c44:["pickaxe", "noonquiver", "long_sword"],
 hullbreaker:["tunneler", "winged_moonplate", "pickaxe"],
 sundered_sky:["tunneler", "caulfields_warhammer"],
 eclipse:["caulfields_warhammer", "pickaxe", "long_sword"],
 essence_reaver:["sheen", "caulfields_warhammer", "agility_cloak"],
 bloodthirster:["bf_sword", "pickaxe", "vampiric_scepter"],
 tiamat:["long_sword", "long_sword"],
 ravenous_hydra:["tiamat", "vampiric_scepter", "caulfields_warhammer"],
 titanic_hydra:["tiamat", "tunneler", "giants_belt"],
 profane_hydra:["tiamat", "brutalizer"],
 stridebreaker:["tiamat", "phage", "dagger"],
};
// V4.5.3-dev30 — inventory-aware recursive recipe graph. A prebuilt item
// takes priority over its subcomponents, so a component is never redeemed twice.
// Used by the authoritative purchase system and by the shop recipe UI.
export function recipePurchasePartsV453Dev30(itemId,inventory=[]){
 const available=[...(Array.isArray(inventory)?inventory:[])],consumed=[];
 const visit=(id,path)=>{
  if(path.includes(id)||path.length>12)return;
  const pos=available.indexOf(id);
  if(pos>=0){available.splice(pos,1);consumed.push(id);return;}
  // A spent Seeker's Armguard keeps its full recipe credit for Zhonya.
  if(itemId==='zhonyas_hourglass'&&id==='seekers_armguard'){
   const broken=available.indexOf('shattered_armguard');
   if(broken>=0){available.splice(broken,1);consumed.push('shattered_armguard');return;}
  }
  for(const child of ITEM_RECIPES[id]||[])visit(child,[...path,id]);
 };
 for(const component of ITEM_RECIPES[itemId]||[])visit(component,[itemId]);
 return consumed;
}
export function recipeTreeV453Dev30(itemId){
 const visit=(id,path=[])=>({id,components:path.length>=12||path.includes(id)?[]:(ITEM_RECIPES[id]||[]).map(child=>visit(child,[...path,id]))});
 return visit(itemId);
}
// V4.3: versioned experimental rune-page contracts. Stats and simplified
// keystone effects are independent of champion kits and cosmetic speed x1/x2.
// V4.5.2: partial tactical objective effects; per-champion holders, not map-wide aura.
export const OBJECTIVE_BUFF_RULES_V452=Object.freeze({
 baronSeconds:180,baronAuraRadius:1500,elderSeconds:180,elderExecuteFraction:.20,
 elderExecuteDelay:1,dragonSoulStacks:4,baronSiegeMultiplier:1.40,
 elderBurnTotalMin:75,elderBurnTotalMax:225,elderBurnRampStart:25*60,elderBurnRampEnd:45*60
});
// V4.5.2d-2: isolated, server-time Dragon Soul adapters; these mechanics are
// not yet a patch-certified 1:1 implementation of projectile timing/visuals.
// V4.5.2d-4-dev14: Hand of Baron grants champion AD/AP instead of the
// legacy 12% basic-attack multiplier. The time-scaling curve is a bounded
// interpolation, NOT certified as Riot's exact per-second formula.
export const BARON_CHAMPION_RULES_V452D4_DEV14=Object.freeze({
 minMinutes:20,maxMinutes:40,minAD:12,maxAD:48,minAP:20,maxAP:80,
 curveExponent:1.365
});
export function baronChampionBonusAtV452d4Dev14(capturedAt){
 const r=BARON_CHAMPION_RULES_V452D4_DEV14;
 const minutes=Math.max(0,(Number(capturedAt)||0)/60);
 const scaled=Math.min(1,Math.max(0,(minutes-r.minMinutes)/(r.maxMinutes-r.minMinutes)));
 const ratio=Math.pow(scaled,r.curveExponent);
 return {ad:r.minAD+(r.maxAD-r.minAD)*ratio,ap:r.minAP+(r.maxAP-r.minAP)*ratio};
}
export const SOUL_RULES_V452D2=Object.freeze({
 infernalCooldown:3,infernalRadius:240,hextechCooldown:8,hextechRadius:300,
 hextechChains:3,hextechSlowSeconds:2,oceanSeconds:4,
 mountainRechargeSeconds:5,cloudUltimateSeconds:6,cloudUltimateCooldown:30,
 chemtechThreshold:.5,chemtechFactor:.13
});
export const SUMMONER_LOADOUT_V452=Object.freeze(['flash','smite','barrier','ignite','heal','exhaust','tp','ghost','cleanse']);
export function normalizeSummonerSlotsV452d4Dev11(role,raw,smiteKey='f'){
 const defaultOther={TOP:'tp',JG:'flash',MID:'ignite',ADC:'heal',SUP:'exhaust'}[role]||'flash';
 const fallback=role==='JG'?(smiteKey==='d'?['smite','flash']:['flash','smite']):['flash',defaultOther];
 if(!Array.isArray(raw)||raw.length!==2)return fallback;
 let pair=raw.map(x=>String(x||'').toLowerCase());
 if(pair.some(x=>!SUMMONER_LOADOUT_V452.includes(x))||pair[0]===pair[1])return fallback;
 if(role==='JG')return pair.includes('smite')?pair:fallback;
 return pair.includes('smite')?fallback:pair;
}

export const ECONOMY_PATCH_V43='26.21';
export const RUNE_PAGES_V43=Object.freeze({
 none:Object.freeze({name:'Sem página personalizada',shards:{},keystone:null,maturity:'none'}),
 sorcery:Object.freeze({name:'Feitiçaria · Cometa Arcano',shards:{ap:9},keystone:'arcane_comet',maturity:'prototype'}),
 precision:Object.freeze({name:'Precisão · Ritmo Experimental',shards:{ad:5.4},keystone:'fleet_footwork',maturity:'prototype'}),
 resolve:Object.freeze({name:'Determinação · Aperto dos Mortos-Vivos',shards:{hp:65},keystone:'grasp',maturity:'prototype'})
});
// SR batch family parameters; no new ESM imports because Node/browser share one engine.
// Snapshot-safe: transient state is recorded only on champion units, never in UI.
export const ITEM_FAMILY_RULES_V453_DEV69=Object.freeze({
 kaenic_rookern:{rechargeSeconds:15,shieldMaxHpRatio:.15},
 maw_of_malmortius:{cooldown:90,threshold:.30,shieldSeconds:3,flatMelee:200,flatRanged:150,bonusAdMelee:1.5,bonusAdRanged:1.125},
 immortal_shieldbow:{cooldown:90,threshold:.30,shieldSeconds:3,shieldBase:400,shieldPerLevel:300/17},
 steraks_gage:{cooldown:90,threshold:.30,shieldSeconds:4.5,shieldBonusHealthRatio:.60,baseAdRatio:.50},
 force_of_nature:{stacks:8,mr:70,speedFraction:.06,stackSeconds:5},
 cosmic_drive:{flatSpeed:20,seconds:4},
 shadowflame:{threshold:.40,bonusFraction:.20},
 the_collector:{executeThreshold:.05,killGold:25},
 liandrys_torment:{burnMaxHpPerSecond:.02,burnSeconds:3,ampPerSecond:.02,maxAmp:.06},
 riftmaker:{bonusHpToAp:.02,ampPerSecond:.02,maxAmp:.08},
 overlords_bloodmail:{bonusHpToAd:.025,maxMissingHpAdRatio:.12},
 bloodletters_curse:{shredPerStack:.075,maxStacks:4,seconds:6},
 abyssal_mask:{amplifyMagic:.12,radius:550},
 seryldas_grudge:{slowFraction:.30,seconds:1,threshold:.50},
 chempunk_chainsword:{woundsSeconds:3}
});

// Batch3: narrow deterministic training adapters, not 1:1 LoL certification.

// Dev69 Batch4; per-champion serialized state. Numeric combat values below are
// training adaptations. They must not be labeled as Riot 1:1 certified.
export const ITEM_DEFENSE_RULES_V453_DEV69_B4=Object.freeze({
 eternal_despair:{pulseSeconds:4,radius:500,magicDamage:70,healFactor:2.5},
 sunfire_aegis:{radius:325,baseDamage:15,hpRatio:.015,seconds:3},
 hollow_radiance:{radius:325,baseDamage:12,hpRatio:.012,seconds:3,killDamage:90},
 warmogs_armor:{requiredBonusHp:2000,outOfCombat:8,healPct:.05,bonusHpPct:.12},
 heartsteel:{distance:700,chargeSeconds:3,targetCooldown:30,damageFlat:70,hpDamageRatio:.06,healthGainRatio:.10},
 jaksho_the_protean:{combatSeconds:5,resistRatio:.30},
 dead_mans_plate:{maxMoveSpeed:20,chargeSeconds:5,damageFlat:60,slowSeconds:1},
 guardian_angel:{cooldown:300,stasisSeconds:4,reviveHpRatio:.50},
 deaths_dance:{deferRatio:.30,duration:3,healOnTakedown:.10},
 rod_of_ages:{stackSeconds:60,maxStacks:10,hpPerStack:10,manaPerStack:30,apPerStack:3},
 winters_approach:{maxManaBonus:360,bonusHpFromMana:.08},
 archangels_staff:{maxManaBonus:360,bonusApFromMana:.01},
 manamune:{maxManaBonus:360,bonusAdFromMana:.025},
 experimental_hexplate:{ultimateBuffSeconds:8,attackSpeedPct:30,movePercent:15},
 spear_of_shojin:{stacks:4,damagePerStack:.03,seconds:6}
});

export const ITEM_ATTACK_RULES_V453_DEV69_B3=Object.freeze({
 blade_of_ruined_king:{meleeCurrentHp:.10,rangedCurrentHp:.06,slow:.30,slowDuration:1,monsterCap:60},
 terminus:{magicOnHit:30,resistPerLight:4,penPerDark:10/3,maxStacks:3,seconds:5},
 runaans_hurricane:{bolts:2,damageRatio:.40,radius:550},
 yun_tal_wildarrows:{critPerHit:.25,maxCrit:25,frenzyAttackSpeed:30,frenzyDuration:6,frenzyCooldown:30},
 hexoptik_c44:{maxBonus:.10,maxRange:500,killRangeBonus:100,killDuration:8},
 hullbreaker:{fifthRatio:.03,fifthStructureRatio:.06},
 sundered_sky:{firstHitBonus:.50,healMissingHpRatio:.04,perTargetCooldown:6},
 eclipse:{twoHitWindow:2,shieldDuration:2,cooldown:6,shieldBonusAd:.40},
 essence_reaver:{spellbladeRatio:1,manaOnHit:25,cooldown:1.5},
 bloodthirster:{overhealShieldLimit:150},
 tiamat:{splashRatio:.25,radius:300,activeRatio:.60,activeCooldown:10},
 ravenous_hydra:{splashRatio:.40,radius:300,activeRatio:1,activeCooldown:10},
 titanic_hydra:{splashRatio:.35,radius:300,activeRatio:1,activeCooldown:10},
 profane_hydra:{splashRatio:.35,radius:300,activeRatio:1,activeCooldown:10},
 stridebreaker:{splashRatio:.35,radius:300,activeRatio:.80,activeCooldown:15,slow:.35,duration:3}
});

export const ITEM_SUPPORT_RULES_V453_DEV69_B5=Object.freeze({
 shurelyas_battlesong:{radius:850,movePercent:.30,duration:4,cooldown:75},
 redemption:{radius:550,range:2400,delay:2.5,cooldown:90,healBase:150,healPerLevel:200/17,enemyMaxHpRatio:.10},
 locket_of_the_iron_solari:{radius:850,cooldown:90,shieldBase:290,shieldPerLevel:70/17,shieldDuration:2.5},
 mikaels_blessing:{radius:850,cooldown:120,healBase:100,healPerLevel:150/17},
 knights_vow:{range:800,redirect:.14,returnHeal:.12},
 ardent_censer:{duration:6,attackSpeedPct:25,onHitMagic:20},
 staff_of_flowing_water:{duration:6,bonusAp:40,bonusHaste:15},
 moonstone_renewer:{range:850,healRatio:.30,shieldRatio:.35},
 echoes_of_helia:{maxCharges:3,chargePerDamage:.30,healPerCharge:35},
 dawncore:{bonusHealPerRegen100:2,bonusApPerRegen100:15},
 imperial_mandate:{duration:4,damageAmp:.07},
 zekes_convergence:{duration:5,radius:500,magicDps:30,slow:.30},
 bandocanos:{duration:4,radius:850,flatMove:20,attackSpeedPct:15},
 cryptbloom:{radius:750,healBase:100,healApRatio:.25,cooldown:60},
 hextech_gunblade:{range:700,cooldown:30,baseMagic:150,apRatio:.25,slow:.25,slowDuration:1.5}
});
export const ITEM_REMAINDER_RULES_V453_DEV69_B7=Object.freeze({
 elixir_of_iron:{seconds:180,hp:300,tenacity:25,allyMove:.15,radius:750},
 elixir_of_sorcery:{seconds:180,ap:50,manaRegenBasePct:15,bonusTrue:25,championCooldown:5},
 elixir_of_wrath:{seconds:180,ad:30,physicalVamp:12},
 shattered_armguard:{stasisSeconds:2.5},
 endless_hunger:{hastePerBonusAd:.12,feastOmnivamp:8,feastSeconds:8,assistWindow:3},
 bastionbreaker:{skillTrueDamage:65,skillCooldown:10,sabotageDamage:120,sabotageSeconds:8},
 actualizer:{activeSeconds:8,cooldown:90,manaCostMultiplier:2,spellDamageAmp:.15,shieldHealAmp:.15,basicCdRate:.30},
 protoplasm_harness:{threshold:.30,cooldown:90,bonusHp:250,seconds:5,movePct:.10,tenacity:25},
 whispering_circlet:{maxManaStacks:360,manaPerSpell:4,chargeCooldown:8,maxCharges:5},
 voracious_greaves:{omnivampPerKill:.6,maxKills:10},
 immortal_journey:{damageAboveHalf:.04,healBelowHalf:.12},
 swift_march:{adaptiveFromMoveSpeed:.05},
 scarlet_lucidity:{sprintSeconds:4,moveFlat:20},
 war_greaves:{attackSpeedPct:45,lifeStealPct:5},
 enchanted_footwear:{magicPenFlat:20,magicPenPct:8},
 chained_crushers:{shield:130,seconds:5,cooldown:20},
 armored_mobilization:{shield:130,seconds:5,cooldown:20,attackReduction:.10},
 hextech_rocketbelt:{distance:400,radius:250,magicDamage:130,apRatio:.25,cooldown:40},
 umbral_glaive:{concealSeconds:3,trueDamage:70,revealRadius:900,revealSeconds:5,wardBonusHits:2},
 noxian:{unlockTeamKills:5,minTimeSeconds:900},
 farsight:{range:2800}
});
export const ITEM_OFFENSE_RULES_V453_DEV69_B6=Object.freeze({
 statikk_shiv:{chainRadius:500,chainTargets:4,magicDamage:70},
 stormrazor:{bonusMagic:90,movePct:.45,moveSeconds:1.5},
 lich_bane:{baseADRatio:.75,apRatio:.40},
 malignance:{seconds:3,damagePerSecond:35},
 horizon_focus:{minRange:600,revealSeconds:6,splashRadius:1400,splashSeconds:3},
 stormsurge:{requiredPct:.25,window:2.5,delay:2,damage:130,cooldown:30,radius:450},
 ludens_companion:{echoes:6,magicPerEcho:24,cooldown:10,splashRadius:500},
 iceborn_gauntlet:{baseADRatio:1,slow:.30,slowDuration:2,fieldRadius:300},
 serpents_fang:{shieldCut:.35,rangedCut:.25,seconds:3},
 axiom_arc:{ultimateRefundFraction:.15,assistRefundFraction:.10},
 hubris:{baseBonusAd:10,perKillBonusAd:2,seconds:90},
 voltaic_cyclosword:{healthRatio:.08,buffSeconds:4},
 blackfire_torch:{duration:3,magicPerSecond:22,apRatio:.10,bonusApPerTarget:.04},
 yun_tal_demon_arrows:{shots:3,seconds:8,attackSpeedPct:50,bonusTrueFraction:.15},
 dusk_and_dawn:{baseMagic:50,apRatio:.40,healBase:30,healApRatio:.15}
});
export const ITEM_EFFECTS_V43=Object.freeze({
 // Annul spell-shields: cooldowns from SR item rules; DDragon 16.21.1 stats/recipes.
 verdant_barrier:{kind:'annul',cooldown:60},
 banshees_veil:{kind:'annul',cooldown:40},
 edge_of_night:{kind:'annul',cooldown:40},
 // DEV69: no guessed data: 1083/3036, SR patch 26.21, Data Dragon 16.21.1.
 cull:{kind:'reap',healOnHit:3,goldPerMinion:1,maxMinions:100,questCompletionGold:350,maturity:'dev69_item_batch1'},
 lord_dominiks_regards:{kind:'giant_slayer',maxBonusFraction:.15,maxBonusHealth:1500,maturity:'dev69_item_batch1'},
 blighting_jewel:{kind:'magic_penetration',value:13,maturity:'dev37_verified_stat'},
 seekers_armguard:{kind:'single_use_stasis',duration:2.5,maturity:'dev37_partial_active'},
 scouts_slingshot:{kind:'bullseye',damage:40,cooldown:40,attackReduction:1,maturity:'dev38_partial_damage_and_on_attack'},
 dorans_ring:{kind:'drain_helping_hand',manaPerSecond:1,championManaPerSecond:2,championDuration:5,manalessHealRatio:.45,minionBasicDamage:5,maturity:'dev38_whole_second_adapter'},
 rabadon:{kind:'ap_multiplier',ratio:.30,maturity:'audited_stat'},
 oblivion_orb:{kind:'grievous_magic',duration:3,maturity:'prototype'},
 executioners_calling:{kind:'grievous_physical',duration:3,maturity:'prototype'},
 sheen:{kind:'spellblade',ratio:1,duration:10,cooldown:1.5,maturity:'dev29_partial'},
 trinity_force:{kind:'spellblade_quicken',ratio:2,duration:10,cooldown:1.5,maturity:'dev29_partial'},
 phage:{kind:'on_hit_speed',duration:2,maturity:'dev29_partial'},
 black_cleaver:{kind:'armor_shred',maxStacks:5,perStack:.06,duration:6,maturity:'dev29_partial'},
 youmuus_ghostblade:{kind:'sprint_active',cooldown:45,maturity:'dev29_partial'},
 bramble_vest:{kind:'thorns',base:10,woundsSeconds:3,maturity:'dev31_partial'},
 thornmail:{kind:'thorns',base:20,bonusArmorRatio:.10,woundsSeconds:3,maturity:'dev31_partial'},
 wardens_mail:{kind:'rock_solid',flat:15,maxRatio:.20,maturity:'dev31_partial'},
 frozen_heart:{kind:'winter_caress_aura',radius:700,attackSpeedSlow:.20,maturity:'dev47_attack_interval_aura_adapter'},
 swifties:{kind:'slow_resistance',percent:25,maturity:'dev50_authoritative_movement'},
 plated_steelcaps:{kind:'basic_attack_reduction',percent:10,maturity:'dev50_basic_damage_post_resistance'},
 forbidden_idol:{kind:'heal_shield_power',percent:8,maturity:'dev52_real_stat_support_effect'},
 fated_ashes:{kind:'ability_burn',totalMagicDamage:15,duration:3,tick:1,scope:'champion_abilities_only',maturity:'dev52_champion_dot_adapter_monsters_pending'},
 spirit_visage:{kind:'self_heal_shield_bonus',percent:25,maturity:'dev52_v41_effect_resolver_only'},
 haunting_guise:{kind:'madness_champion_combat_ramp',perSecond:.02,maxBonus:.06,expiresAfter:5,maturity:'dev54_authoritative_damage_window_adaptation'},
 wits_end:{kind:'fray_magic_onhit',magicDamage:45,maturity:'dev55_45_flat_magic_adapter_current_level_scaling_unverified'},
 tear_of_the_goddess:{kind:'mana_flow',baseMana:240,manaPerChampionSkill:6,manaPerOtherSkill:3,maxStackBonus:360,rechargeSeconds:8,maxCharges:4,minionBasicBonus:5,maturity:'dev56_authoritative_flow_and_minion_hit_adapter'},
 bamis_cinder:{kind:'immolate_short_aura',radius:300,magicPerSecond:8,activeSeconds:3,maturity:'dev57_partial_training_aura_numeric_unverified'},
 hexdrinker:{kind:'lifeline_magic_barrier',hpThreshold:.30,magicShield:200,shieldSeconds:2.5,cooldownSeconds:90,maturity:'dev57_partial_magic_only_damage_and_cooldown_unverified'},
 dark_seal:{kind:'glory',maxStacks:10,apPerStack:4,stacksLostOnDeath:5,killStacks:2,assistStacks:1,maturity:'dev58_authoritative_ap_and_death_glory_gain_numbers_adapter'},
 quicksilver_sash:{kind:'mercury_cleanse',cooldownSeconds:90,maturity:'dev59_cc_except_knockup_official_scope_90s_adapter'},
 mercurial_scimitar:{kind:'mercury_cleanse_sprint',cooldownSeconds:90,sprintFraction:.25,sprintSeconds:1.5,maturity:'dev59_cc_except_knockup_25pct_1p5s_90s_adapter'},
 mejais_soulstealer:{kind:'glory',maxStacks:25,apPerStack:5,stacksLostOnDeath:10,killStacks:4,assistStacks:2,speedThreshold:10,movePercent:10,maturity:'dev58_authoritative_ap_speed_and_death_glory_gain_numbers_adapter'},
 hextech_alternator:{kind:'revved_magic',bonusMagic:40,cooldown:40,maturity:'dev56_partial_magic_value_and_cooldown_training_adapter_DDragon_has_no_numbers'},
 phantom_dancer:{kind:'spectral_waltz_ghost',unitCollision:false,terrainCollision:true,maturity:'dev55_explicit_move_orders_only'},
 guinsoos_rageblade:{kind:'rage_and_seething_strike',onHitMagic:30,asPerStack:8,maxStacks:4,stackSeconds:4,doubleEvery:3,maturity:'dev54_authoritative_onhit_double_for_registered_procs'},
 lost_chapter:{kind:'level_up_mana_regen',percent:20,duration:3,maturity:'dev53_authoritative_three_pulses'},
 catalyst_of_aeons:{kind:'eternity_mana_on_champion_hit_and_health_on_spell',manaFromChampionDamagePercent:10,healthFromSpellManaCostPercent:25,maturity:'dev53_authoritative_spell_and_damage'},
 recurve_bow:{kind:'on_hit_physical',damage:15,maturity:'dev40_shield_and_opt_in_ability_partial'},
 kraken_slayer:{kind:'third_basic_hit',maxStacks:2,expireSeconds:4,maturity:'dev39_to_dev40_shield_onhit_partial'},
 navori_flickerblade:{kind:'basic_cooldown_refund',ratio:.15,maturity:'dev32_partial'},
 nashors_tooth:{kind:'on_hit_magic',base:15,apRatio:.15,maturity:'dev40_shield_and_opt_in_ability_partial'},
 mortal_reminder:{kind:'grievous_physical',duration:3,maturity:'dev33_partial'},
 morellonomicon:{kind:'grievous_magic',duration:3,maturity:'dev33_partial'},
 rylais_crystal_scepter:{kind:'ability_slow',fraction:.30,duration:1,maturity:'dev33_partial'},
 rapid_firecannon:{kind:'energized_attack',maxStacks:100,stacksPerAttack:6,travelUnitsPerStack:24,bonusMagicDamage:40,bonusRangeRatio:.35,bonusRangeCap:150,maturity:'dev38_to_dev39_to_dev40_landed_shield_lethal_partial'},
 health_potion:{kind:'potion_heal',total:120,seconds:15,maturity:'dev32_whole_second_adapter'},
 refillable_potion:{kind:'potion_heal',total:100,seconds:12,charges:2,maturity:'dev32_whole_second_adapter'},
 randuins_omen:{kind:'humility_active',slow:.70,duration:2,cooldown:90,range:500,critResistance:.30,maturity:'dev31_partial_crit_not_resolved'}
});
export const ECONOMY_RULES_V43=Object.freeze({sellRatio:.70,sellRound:'floor',slots:6});

export const JUNGLE_PETS=['jungle_gustwalker','jungle_mosstomper','jungle_scorchclaw'];
export const ROLE_STARTERS={TOP:'dorans_shield',JG:'jungle_gustwalker',MID:'dorans_ring',ADC:'dorans_blade',SUP:'support_atlas'};
export function recommendedItems(u){
 if(u.role==='JG')return [...(u.junglePet?[]:JUNGLE_PETS), 'boots',...(u.klass==='mage'?['amp_tome','needless_rod']:u.klass==='tank'?['ruby_crystal','cloth_armor']:['long_sword','serrated_dirk'])];
 if(u.role==='SUP')return [...(u.items.some(id=>id.startsWith('support_'))?[]:['support_atlas']),'ward','boots',...(u.klass==='tank'||u.klass==='support'?['ruby_crystal','cloth_armor']:['amp_tome','sapphire_crystal'])];
 if(u.role==='ADC')return [...(u.items.some(i=>i==='dorans_blade')?[]:['dorans_blade']),'boots','recurve_bow','bf_sword','pickaxe','agility_cloak','infinity_edge','long_sword','ward'];
 if(u.role==='MID')return [...(u.items.some(i=>['dorans_blade','dorans_ring','dorans_shield'].includes(i))?[]:[u.klass==='assassin'?'dorans_blade':'dorans_ring']),'boots',...(u.klass==='mage'?['amp_tome','needless_rod','rabadon','sapphire_crystal']:['long_sword','serrated_dirk'])];
 return [...(u.items.some(i=>['dorans_blade','dorans_ring','dorans_shield'].includes(i))?[]:[u.klass==='tank'?'dorans_shield':'dorans_blade']),'boots',...(u.klass==='mage'?['amp_tome','needless_rod']:['long_sword','ruby_crystal','cloth_armor'])];
}
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
// LoL movement speed is world units / sec. Bounds from Cassiopeia/Meraki SR
// coordinate mapping; atlas alignment remains an editor calibration task.
export const DEFAULT_WORLD_BOUNDS={minX:-120,maxX:14870,minY:-120,maxY:14980};
// Per-champion baseline AA range in Summoner's Rift units (approx. 15k per atlas side).
// Champion-specific dynamic passives (Senna souls, Tristana growth, etc.) are intentionally
// not silently inferred. Attach explicit gameplay rules as they are implemented.
export const CHAMPION_BASE_AA_RANGE=Object.freeze({Volibear:150,Warwick:125,Ahri:550,Jinx:525,Nami:550,Lux:550,Darius:175,LeeSin:125,Vex:550,Caitlyn:650,Leona:125,Vayne:550,Udyr:125,KSante:175});
export const ATLAS_SIDE_UNITS=15000;
// First verified PC Summoner's Rift spell contracts. Every other skill remains
// a conservative training fallback and MUST NOT be described as Riot-accurate.
export const CHAMPION_SPELL_RULES_V382=Object.freeze({
 // Dev41 explicit Q contracts, partial 26.21 reference; other spells are not certified.
 Ezreal:Object.freeze({Q:Object.freeze({kind:'line_onhit',range:1200,width:120,projectile:true,maxHits:1,
  mana:[28,31,34,37,40],cooldown:[5.5,5.25,5,4.75,4.5],effect:'mystic_shot'})}),
 Irelia:Object.freeze({Q:Object.freeze({kind:'target_dash_onhit',range:600,projectile:false,
  mana:[20,20,20,20,20],cooldown:[11,10,9,8,7],effect:'bladesurge'}),
  E:Object.freeze({kind:'two_blade_line',range:775,width:140,projectile:true,
  mana:[50,50,50,50,50],cooldown:[16,14.5,13,11.5,10],effect:'flawless_duet'})}),
 Nami:Object.freeze({
  W:Object.freeze({kind:'unit_target',range:725,bounceRange:800,cooldown:[10,10,10,10,10],mana:[70,75,80,85,90],effect:'ebb_flow'}),
  R:Object.freeze({kind:'line',range:2750,width:500,cooldown:[120,110,100],mana:[100,100,100],effect:'tidal_wave',projectile:true})
 }),
 Lux:Object.freeze({
  R:Object.freeze({kind:'line',range:3400,width:200,cooldown:[60,50,40],mana:[100,100,100],effect:'final_spark',projectile:false})
 }),
 Vex:Object.freeze({
  R:Object.freeze({kind:'line_recast',range:2000,width:260,rangeByRank:[2000,2500,3000],cooldown:[140,120,100],mana:[100,100,100],effect:'shadow_surge',projectile:true,recastSeconds:4})
 })
});
// V4.2 — Registry pinned to Summoner's Rift PC 26.21 (2026-10-21).
// `implemented` describes only the specific mechanic, NOT full champion parity.
// Each partial kit can mix audited abilities and explicitly flagged training fallbacks.
export const KIT_PATCH_V42='26.21';
export const CHAMPION_KITS_V42=Object.freeze({
 Nami:Object.freeze({patch:KIT_PATCH_V42,certification:'partial',passive:{id:'surging_tides',status:'planned'},spells:Object.freeze({
  Q:{name:'Aqua Prison',kind:'ground_circle',range:850,radius:225,mana:[60],cooldown:[12,11,10,9,8],damage:[90,145,200,255,310],apRatio:.50,cc:'suspension',ccSeconds:1.5,effect:'aqua_prison',implemented:'prototype'},
  W:{name:'Ebb and Flow',kind:'unit_target',range:725,bounceRange:800,mana:[70,75,80,85,90],cooldown:[10],effect:'ebb_flow',implemented:'legacy_adapter'},
  E:{name:'Tidecallers Blessing',kind:'ally_target',implemented:'planned'},
  R:{name:'Tidal Wave',kind:'line',range:2750,width:500,mana:[100],cooldown:[120,110,100],damage:[150,250,350],apRatio:.60,effect:'tidal_wave',projectile:true,implemented:'legacy_adapter'}
 })}),
 Lux:Object.freeze({patch:KIT_PATCH_V42,certification:'partial',passive:{id:'illumination',status:'planned'},spells:Object.freeze({
  Q:{name:'Light Binding',kind:'line_projectile',range:1300,width:140,mana:[50],cooldown:[10],damage:[80,120,160,200,240],apRatio:.75,cc:'root',ccSeconds:2,maxHits:2,effect:'light_binding',projectile:true,implemented:'prototype'},
  W:{name:'Prismatic Barrier',kind:'line_shield',implemented:'planned'},
  E:{name:'Lucent Singularity',kind:'ground_zone',range:1100,radius:310,mana:[70,80,90,100,110],cooldown:[10,9.5,9,8.5,8],duration:5,slow:[25,30,35,40,45],damage:[65,115,165,215,265],apRatio:.80,effect:'lucent_singularity',implemented:'prototype'},
  R:{name:'Final Spark',kind:'line',range:3400,width:200,mana:[100],cooldown:[60,50,40],damage:[300,400,500],apRatio:1.2,effect:'final_spark',projectile:false,implemented:'legacy_adapter'}
 })}),
 Vex:Object.freeze({patch:KIT_PATCH_V42,certification:'partial',passive:{id:'doom_gloom',status:'planned'},spells:Object.freeze({
  Q:{name:'Mistral Bolt',kind:'training',implemented:'training'}, W:{name:'Personal Space',kind:'training',implemented:'training'},
  E:{name:'Looming Darkness',kind:'training',implemented:'training'},
  R:{name:'Shadow Surge',kind:'line_recast',range:2000,rangeByRank:[2000,2500,3000],width:260,mana:[100],cooldown:[140,120,100],damage:[75,125,175],apRatio:.2,recastDamage:[150,250,350],recastApRatio:.5,recastSeconds:4,effect:'shadow_surge',projectile:true,implemented:'prototype'}
 })}),
 Jinx:Object.freeze({patch:KIT_PATCH_V42,certification:'data_only',passive:{id:'get_excited',status:'planned'},spells:Object.freeze({})}),
 Ahri:Object.freeze({patch:KIT_PATCH_V42,certification:'data_only',passive:{id:'essence_theft',status:'planned'},spells:Object.freeze({})})
});
// Dev41: only the explicitly audited Q abilities may use the Dev40 on-hit
// contract. Keep per-champion collision/mobility rather than a global skill flag.
export const CHAMPION_ONHIT_SKILLS_V453_DEV41=Object.freeze({
 Ezreal:Object.freeze({slot:'Q',name:'Disparo Místico',kind:'line_onhit',maturity:'partial_26_21',
  damage:[20,45,70,95,120],adRatio:1.3,apRatio:.4,cooldownRefund:1.5}),
 Irelia:Object.freeze({slot:'Q',name:'Surto da Lâmina',kind:'target_dash_onhit',maturity:'partial_26_21',
  damage:[5,25,45,65,85],adRatio:.7,healAdRatio:[.09,.10,.11,.12,.13]})
});
export function kitSpellV42(champ,slot){const s=CHAMPION_KITS_V42[champ]?.spells?.[slot];return s&&s.implemented!=='planned'&&s.implemented!=='training'?s:null;}
// Geometry is shared between different champions, while hit caps and effects remain individual.
export function skillshotHitsV42(caster,point,targets,{range,width,maxHits=Infinity,worldWidth=15000,worldHeight=15000}={}){
 const dx=(point.x-caster.x)*worldWidth,dy=(point.y-caster.y)*worldHeight,len=Math.hypot(dx,dy);
 if(!Number.isFinite(len)||len<.0001)return [];
 const ux=dx/len,uy=dy/len;
 return targets.map(target=>{const x=(target.x-caster.x)*worldWidth,y=(target.y-caster.y)*worldHeight;
  return {target,depth:x*ux+y*uy,lateral:Math.abs(x*uy-y*ux)};
 }).filter(v=>v.depth>=0&&v.depth<=range&&v.lateral<=width/2)
   .sort((a,b)=>a.depth-b.depth||String(a.target.id).localeCompare(String(b.target.id)))
   .slice(0,maxHits).map(v=>v.target);
}
export function areaHitsV42(point,targets,radius,worldWidth=15000,worldHeight=15000){
 return targets.filter(t=>Math.hypot((t.x-point.x)*worldWidth,(t.y-point.y)*worldHeight)<=radius)
  .sort((a,b)=>String(a.id).localeCompare(String(b.id)));
}
export function abilityRule(u,slot){
 const certified=kitSpellV42(u.champ,slot);if(certified)return certified;
 const exact=CHAMPION_SPELL_RULES_V382[u.champ]?.[slot];if(exact)return exact;
 // Fallback: tightly capped range to avoid remote/map-wide casts. No false
 // pretense of a verified individual kit; later milestones replace it.
 const attack=Number.isFinite(u.range)?Math.min(700,Math.max(0,u.range)*ATLAS_SIDE_UNITS):125;
 return {kind:'training',range:slot==='R'?Math.max(attack,950):Math.max(attack,Math.min(650,attack+175)),mana:[{Q:45,W:50,E:55,R:100}[slot]||50],cooldown:[{Q:9,W:12,E:13,R:65}[slot]||10],effect:'training'};
}
export function abilityCost(u,slot){const r=abilityRule(u,slot),level=Math.max(1,u.skillRanks?.[slot]||1);return r.mana[Math.min(r.mana.length-1,level-1)];}
// V3.9: stat schema and reusable action contract. CDR is DERIVED, never an additive stat.
export const STAT_SCHEMA_V39=Object.freeze([
 ['hp','Vida'],['mana','Mana'],['hpRegen','Regeneração de vida'],['manaRegen','Regeneração de mana'],
 ['ad','Dano de ataque'],['ap','Poder de habilidade'],['armor','Armadura'],['mr','Resistência mágica'],
 ['atkSpeed','Velocidade de ataque'],['critChance','Chance de crítico (%)'],['critDamage','Dano crítico (%)'],
 ['moveSpeed','Movimento base'],['abilityHaste','Aceleração de habilidade'],['basicHaste','Aceleração de habilidades básicas'],
 ['ultimateHaste','Aceleração de ultimate'],['summonerHaste','Aceleração de feitiços'],['itemHaste','Aceleração de itens'],
 ['lethality','Letalidade'],['armorPenFlat','Penetração de armadura fixa'],['armorPenPercent','Penetração de armadura (%)'],
 ['magicPenFlat','Penetração mágica fixa'],['magicPenPercent','Penetração mágica (%)'],
 ['lifeSteal','Roubo de vida (%)'],['omnivamp','Vampirismo universal (%)'],['physicalVamp','Vampirismo físico (%)'],
 ['spellVamp','Vampirismo mágico (%)'],['healShieldPower','Poder de cura/escudo (%)'],
 ['tenacity','Tenacidade (%)'],['slowResist','Resistência a lentidão (%)'],['attackRange','Alcance do ataque'],
 ['cooldownReduction','CDR equivalente (%)']
]);
export const ACTION_SCHEMA_V39=Object.freeze({
 cast:Object.freeze(['actorId','slot','targetId','point','direction','stage','createdAt','privacy']),
 result:Object.freeze(['ok','reason','spentMana','cooldownEndsAt','events','effectIds'])
});
// V4.5.2d-3 (SR patch reference 26.21): per-stack elemental bonuses.
// Source: League of Legends Wiki, Dragon Slayer buffs, verified 2026-10-26.
// These modify effective stats ONLY; unit base stats and item calculations
// remain untouched, so level ups, shopping and checkpoint restore cannot double-stack.
export const ELEMENTAL_DRAKE_RULES_V452D3=Object.freeze({
 infernal:Object.freeze({adApFraction:.03}),
 mountain:Object.freeze({resistFraction:.05}),
 ocean:Object.freeze({missingHealthFraction:.02,periodSeconds:5}),
 cloud:Object.freeze({outOfCombatMoveFraction:.05,slowResistPercent:5}),
 hextech:Object.freeze({abilityHaste:5,bonusAttackSpeedFraction:.05}),
 chemtech:Object.freeze({tenacityPercent:6,healShieldPowerPercent:6})
});
export function elementalDragonStatsV452d3(u,dragons=[]){
 const counts=Object.fromEntries(Object.keys(ELEMENTAL_DRAKE_RULES_V452D3).map(key=>[key,0]));
 for(const type of dragons||[])if(Object.hasOwn(counts,type))counts[type]++;
 const infernal=1+counts.infernal*ELEMENTAL_DRAKE_RULES_V452D3.infernal.adApFraction;
 const mountain=1+counts.mountain*ELEMENTAL_DRAKE_RULES_V452D3.mountain.resistFraction;
 const percentAS=counts.hextech*ELEMENTAL_DRAKE_RULES_V452D3.hextech.bonusAttackSpeedFraction;
 return {counts,ad:(Number(u?.ad)||0)*infernal,ap:(Number(u?.ap)||0)*infernal,
  armor:(Number(u?.armor)||0)*mountain,mr:(Number(u?.mr)||0)*mountain,
  // The legacy atkSpeed field is attack INTERVAL in simulated seconds.
  attackInterval:Math.max(.55,(Number(u?.atkSpeed)||0)/(1+percentAS)),
  bonusAttackSpeedPercent:percentAS*100,
  abilityHaste:Math.min(500,Math.max(0,(Number(u?.abilityHaste)||0)+counts.hextech*5)),
  tenacity:Math.min(90,Math.max(0,(Number(u?.tenacity)||0)+counts.chemtech*6)),
  healShieldPower:(Number(u?.healShieldPower)||0)+counts.chemtech*6,
  slowResist:Math.min(100,Math.max(0,(Number(u?.slowResist)||0)+counts.cloud*5)),
  outOfCombatMoveFraction:counts.cloud*.05,
  oceanMissingHealthFraction:counts.ocean*.02};
}
export const hasteCooldown=(seconds,haste=0)=>Math.max(.001,seconds)*100/(100+Math.max(0,Number(haste)||0));
export function championStatsV39(u){
 const fields=Object.fromEntries(STAT_SCHEMA_V39.map(([k])=>[k,Number(u?.[k])||0]));
 fields.critDamage=Number(u?.critDamage)||175;
 fields.attackRange=Math.round((Number(u?.range)||0)*ATLAS_SIDE_UNITS);
 fields.abilityHaste=Math.min(500,Math.max(0,fields.abilityHaste));
 fields.cooldownReduction=100*fields.abilityHaste/(100+fields.abilityHaste);
 fields.moveSpeed=movementSpeed(u?.moveSpeed||0,u?.flatMoveSpeed||0,u?.percentMoveSpeed||0,u?.slowPercent||0);
 return fields;
}
export function castGateV39(u,slot,now,target=null,{checkRange=true,requireVision=true,visible=()=>true,worldDistance=null}={}){
 const rule=abilityRule(u,slot),rank=u.skillRanks?.[slot]||0,cost=abilityCost(u,slot);
 if(!['Q','W','E','R'].includes(slot))return {ok:false,reason:'slot_inválido'};
 if((u.hp||0)<=0)return {ok:false,reason:'morto'};
 if(rank<1)return {ok:false,reason:'não_aprendido'};
 if((u.skillCds?.[slot]||0)>now)return {ok:false,reason:'recarga',remaining:u.skillCds[slot]-now};
 if((u.mana||0)<cost)return {ok:false,reason:'mana'};
 if(target&&requireVision&&!visible(target))return {ok:false,reason:'alvo_oculto'};
 if(target&&checkRange&&worldDistance&&worldDistance(u,target)>rule.range)return {ok:false,reason:'fora_de_alcance',range:rule.range};
 return {ok:true,rule,cost,cooldown:abilityCooldown(u,slot),range:rule.range};
}
export function commitCastV39(u,slot,now,gate){
 if(!gate?.ok)return {ok:false,reason:gate?.reason||'cast_invalidado'};
 // Revalidate to prevent duplicate cast same tick, including queued combos and target casts.
 if((u.skillCds?.[slot]||0)>now||u.mana<gate.cost)return {ok:false,reason:'cast_invalidado'};
 u.mana-=gate.cost;u.skillCds??={Q:0,W:0,E:0,R:0};u.skillCds[slot]=now+gate.cooldown;
 u.skillCd=u.skillCds[slot];return {ok:true,spentMana:gate.cost,cooldownEndsAt:u.skillCds[slot]};
}
export function abilityCooldown(u,slot,extraHaste=0){
 const r=abilityRule(u,slot),level=Math.max(1,u.skillRanks?.[slot]||1),base=r.cooldown[Math.min(r.cooldown.length-1,level-1)];
 const haste=championStatsV39(u).abilityHaste+Math.max(0,Number(extraHaste)||0)+(slot==='R'?Number(u.ultimateHaste)||0:Number(u.basicHaste)||0);
 return hasteCooldown(base,Math.min(500,haste));
}

export function baseAttackRangeWorld(champ,fallback){return CHAMPION_BASE_AA_RANGE[champ]/ATLAS_SIDE_UNITS||fallback;}

export const BASE_MS_BY_CLASS={tank:335,fighter:345,mage:330,assassin:345,marksman:325,enchanter:335,support:335};
export function movementSpeed(base,flat=0,percent=0,slow=0){
 let raw=Math.max(0,(base+flat)*(1+percent)*(1-clamp(slow,0,1)));
 if(raw>490)return raw*.5+230;
 if(raw>415)return raw*.8+83;
 if(raw<220)return raw*.5+110;
 return raw;
}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const alt=t=>t==='blue'?'red':'blue';
const LEVEL_THRESHOLDS=[0,0,280,660,1140,1720,2400,3180,4060,5040,6120,7300,8580,9960,11440,13020,14700,16480,18360];
export const CAMP_DAMAGE_BALANCE=Object.freeze({
 // CoachLOL groups many individual monsters into a single pooled HP; this
 // reduction approximates time lost to target swaps/kiting. No Smite reduction.
 clusteredMonsterMultiplier:.77,soloMonsterMultiplier:.93,
 petBonusDpsMultiplier:.82
});
export const LANE_STRUCTURE_RULES_V451=Object.freeze({
 patch:'26.21',inhibitorRespawnSeconds:300,nexusTurretRespawnSeconds:180,
 nexusTurretRespawnHpFraction:.40,superWaveStopBeforeRespawn:2,
 firstWaveSeconds:30,midWaveSeconds:25,lateWaveSeconds:20,
 midWaveAt:840,lateWaveAt:1800,siegeEveryWaveAt:1500,
 source:'LoL PC SR standard patch 26.1 + 26.21; macro certification partial'
});
export const MINION_XP_RADIUS=1500; // Units in Summoner's Rift; outside range no XP.
const MINION_XP={melee:62,caster:29,siege:75,super:93};
// Default Summoner's Rift rank gates; exceptional transform/innate ultimates
// require champion-specific data and are not treated as standard 6/11/16 casts.
// Summoner's Rift 2026 standard mode. Simplified *grouped* monster HP/AD
// belong to CoachLOL's board simulator, not a claim of 1:1 Riot stat values.
// Swiftplay has different spawn, quest, objective and respawn rules.
export const SIMULATION_TIMING_2026=Object.freeze({
 waveFirst:30,waveInterval:30,firstMainCamp:55,firstSecondaryCamp:67,
 scuttle:175,dragon:300,baron:1200,planningWallTime:60,
 // Observed reference bands, NOT hard win conditions.
 fullClearTargetWarwick:[180,220],smiteMinimumInterval:15
});
export const WARD_RULES_2026=Object.freeze({
 stealth:{durationMin:90,durationMax:120,vision:900,limit:3,hp:3,bounty:10},
 support:{duration:150,vision:900,limit:3,hp:3,bounty:30},
 farsight:{duration:null,vision:500,limit:1,hp:1,bounty:15},
 control:{duration:null,vision:900,limit:1,hp:4,bounty:30},
 oracle:{duration:8,radius:750,cooldown:90}
});
// V4.4 phase windows for standard Summoner's Rift. These are grouped board
// encounters, not an assertion that the client models each Riot monster.
export const OBJECTIVE_PHASES_V44=Object.freeze({
 voidgrubs:{spawn:480,leave:885,once:true,groupCount:3,sharedPit:'baron_pit',fidelity:'individual_v45_prototype'},
 herald:{spawn:900,leave:1185,once:true,groupCount:1,sharedPit:'baron_pit',fidelity:'eye_and_mercenary_v45_prototype'},
 baron:{spawn:1200,leave:null,once:false,sharedPit:'baron_pit'},
 dragon:{spawn:300,leave:null,once:false,sharedPit:'dragon_pit'}
});
export const OBJECTIVE_REWARD_V44=Object.freeze({participationRadius:1200,allyAssistGold:70,allyAssistXP:110,contestedWindow:20});
// V4.5: real objective reward flow, not a complete official monster animation/AI kit.
export const OBJECTIVE_RULES_V45=Object.freeze({
 voidgrubs:{count:3,baseHealth:2269,spawnVoidmitesEvery:12,mitesPerLivingGrub:4,
  touchOfVoidTickDamage:{melee:[0,4,12,16],ranged:[0,2,6,8]},burnDuration:4,burnTick:.5,
  hungerStack:3,hungerCooldown:15,slayerGold:30,slayerXP:65},
 herald:{eyePickupSeconds:20,eyeLifetimeSeconds:240,eyePickupRange:175,
  mercenaryLifetime:135,mercenaryMoveWorldPerSecond:350,chargeRange:320,
  // LoL 26.1: 3000 turret charge damage. Deterministic 1-second tactical approximation.
  chargeDamage:3000,chargeCooldown:6,mercenaryHpBase:2500,mercenaryHpGrowth:270,
  towerAttackDamage:235,towerAttackInterval:2.5,mercenaryBasicDamage:160,mercenaryAttackInterval:2}
});
export const CAMP_RULES_2026=Object.freeze({
 red:{spawn:55,respawn:300,baseHp:2300,attack:28,leash:650},
 blue:{spawn:55,respawn:300,baseHp:2300,attack:28,leash:650},
 wolves:{spawn:55,respawn:135,baseHp:1800,attack:19,leash:650},
 raptors:{spawn:55,respawn:135,baseHp:1750,attack:19,leash:650},
 krugs:{spawn:67,respawn:135,baseHp:1900,attack:22,leash:650},
 gromp:{spawn:67,respawn:135,baseHp:1900,attack:27,leash:450},
 scuttle:{spawn:175,respawn:150,baseHp:1550,attack:0,leash:700},
 dragon:{spawn:300,respawn:300,baseHp:6200,attack:74,leash:1100},
 voidgrubs:{spawn:480,respawn:999999,baseHp:4700,attack:55,leash:1050},
 herald:{spawn:900,respawn:999999,baseHp:12500,attack:98,leash:1100},
 baron:{spawn:1200,respawn:360,baseHp:16300,attack:150,leash:1100}
});
const SPECIAL_R_FROM_LEVEL_ONE=new Set(['Jayce','Nidalee','Elise','Karma']);
export const SKILL_SLOTS=['Q','W','E','R'];
export function skillRankCap(u,slot){
 if(!SKILL_SLOTS.includes(slot))return 0;
 if(u.champ==='Udyr')return u.level>=16?6:Math.min(5,Math.ceil(u.level/2));
 if(slot==='R')return SPECIAL_R_FROM_LEVEL_ONE.has(u.champ)?1:[6,11,16].filter(l=>u.level>=l).length;
 return Math.min(5,Math.ceil(u.level/2));
}

// State is serialized for deterministic checkpoint resume; RNG cannot depend on wall time.
const seeded=(seed=26)=>{let x=seed>>>0;const next=()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);next.getState=()=>x;next.setState=n=>{x=(n>>>0)};return next;};
function ppoint(v){return {x:v[0],y:v[1]}}
const structuredCopy=v=>v===undefined?null:JSON.parse(JSON.stringify(v));
// V4.0: stable, deterministic (NOT cryptographic) checksum for checkpoint comparisons.
// Key ordering is canonical; no Date/time/random or browser resources are used.
export function canonicalStateV40(value){
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonicalStateV40).join(',')+']';
 return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+canonicalStateV40(value[k])).join(',')+'}';
}
export function checksumV40(value){let h=2166136261;const t=canonicalStateV40(value);for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,'0');}
export const ACTION_KINDS_V40=Object.freeze(['skill','summoner','flash','smite','item','recast','tactical','basic_attack','jungle_attack']);
const SUMMONER_CONFIG_V40=Object.freeze({ignite:['igniteCd',180,650],exhaust:['exhaustCd',210,650],heal:['healCd',240,900],barrier:['barrierCd',180,0],ghost:['ghostCd',240,0],tp:['tpCd',420,0],cleanse:['cleanseCd',240,0]});
// V4.1 — effect primitives. Data-driven effects are portable across champion kits.
// Duration uses simulated seconds, never client playback speed.
export const EFFECT_TYPES_V41=Object.freeze({
 stun:{cc:true,tenacity:true,block:['move','attack','skill','summoner','item']},
 root:{cc:true,tenacity:true,block:['move','dash']},
 slow:{cc:true,tenacity:true,block:[]},
 silence:{cc:true,tenacity:true,block:['skill']},
 blind:{cc:true,tenacity:true,block:[]},
 disarm:{cc:true,tenacity:true,block:['attack']},
 grounded:{cc:true,tenacity:true,block:['dash']},
 fear:{cc:true,tenacity:true,block:['move','attack','skill','summoner','item']},
 charm:{cc:true,tenacity:true,block:['move','attack','skill','summoner','item']},
 taunt:{cc:true,tenacity:true,block:['move','skill','summoner','item']},
 polymorph:{cc:true,tenacity:true,block:['attack','skill']},
 sleep:{cc:true,tenacity:true,block:['move','attack','skill','summoner','item']},
 suppression:{cc:true,tenacity:false,block:['move','attack','skill','summoner','item']},
 knockup:{cc:true,tenacity:false,block:['move','attack','skill','summoner','item']},
 stasis:{cc:false,tenacity:false,block:['move','attack','skill','summoner','item']},
 invulnerable:{cc:false,tenacity:false,block:[]},
 cc_immunity:{cc:false,tenacity:false,block:[]},
 spell_shield:{cc:false,tenacity:false,block:[]},
 shield:{cc:false,tenacity:false,block:[]},
 physical_shield:{cc:false,tenacity:false,block:[]},
 magic_shield:{cc:false,tenacity:false,block:[]},
 grievous_wounds:{cc:false,tenacity:false,block:[]},
 dot:{cc:false,tenacity:false,block:[]},
 hot:{cc:false,tenacity:false,block:[]}
});
export class EffectResolverV41 {
 constructor(arena){this.a=arena;}
 list(target){if(target?.champ){this.a.refreshItemAnnulV453Dev69Batch2(target);this.a.refreshKaenicShieldV453Dev69(target);}return (target?.statusEffectsV41||[]).filter(e=>e.until>this.a.gameTime);}
 has(target,type){return this.list(target).some(e=>e.type===type);}
 slowFraction(target){const slow=Math.max(0,...this.list(target).filter(e=>e.type==='slow').map(e=>e.power<=1?e.power:e.power/100));const resistance=target?.champ?this.a.elementalStatsV452d3(target).slowResist:target?.slowResist||0;return Math.min(.95,slow*(1-Math.min(1,Math.max(0,resistance/100))));}
 canAct(target,action){
  if(!target||target.hp<=0)return {ok:false,reason:'morto'};
  if((target.stasisUntil||0)>this.a.gameTime)return {ok:false,reason:'stasis'};
  for(const e of this.list(target))if(EFFECT_TYPES_V41[e.type]?.block.includes(action))return {ok:false,reason:'cc_'+e.type,effectId:e.id};
  return {ok:true};
 }
 observe(target,source){return ['blue','red'].filter(t=>t===target.team||t===source?.team||this.a.canSeePoint(t,target));}
 record(kind,target,source,props={}){
  const e={seq:++this.a.effectSequenceV41,time:this.a.gameTime,kind,targetId:target?.id||null,sourceId:source?.id||null,observedBy:this.observe(target,source),sourceVisibleBy:['blue','red'].filter(t=>source&&(source.team===t||this.a.canSeePoint(t,source))),targetVisibleBy:['blue','red'].filter(t=>target&&(target.team===t||this.a.canSeePoint(t,target))),...props};
  this.a.effectJournalV41.push(e);return e;
 }
 apply(target,type,{source=null,duration=1,power=0,damageType='magic',interval=1,stack='refresh',key=null}={}){
  if(!target||target.hp<=0||!EFFECT_TYPES_V41[type]||!Number.isFinite(duration)||duration<=0||!Number.isFinite(power)||power<0||!Number.isFinite(interval)||interval<=0)return {ok:false,reason:'spec_inválida'};
  if(EFFECT_TYPES_V41[type].cc&&source?.team!==target.team&&this.has(target,'cc_immunity'))return {ok:false,reason:'cc_immunity'};
  if(EFFECT_TYPES_V41[type].cc&&source?.team&&source.team!==target.team&&this.has(target,'spell_shield')){const shield=this.list(target).find(e=>e.type==='spell_shield');shield.until=this.a.gameTime;this.a.consumeItemAnnulV453Dev69Batch2(target,shield);this.record('spell_shield_block',target,source,{effectId:shield.id,type});return {ok:false,reason:'spell_shield'};}
  if(type==='stasis'&&this.has(target,'stasis'))return {ok:false,reason:'stasis_ativa'};
  if(type==='spell_shield'&&this.has(target,'spell_shield'))return {ok:false,reason:'spell_shield_ativo'};
  if(['dot','hot'].includes(type)&&!['magic','physical','true'].includes(damageType))return {ok:false,reason:'tipo_dano_inválido'};
  const baseTenacity=target.champ?this.a.elementalStatsV452d3(target).tenacity:Number(target.tenacity)||0;
  // Dev66: Cleanse's temporary 75% reduction is an independent tenacity source.
  // Effective value combines multiplicatively with existing tenacity (training adapter).
  const tenacity=(target.cleanseTenacityUntilV453Dev66||0)>this.a.gameTime?
   100*(1-(1-Math.min(.9,Math.max(0,baseTenacity/100)))*.25):baseTenacity;
  const adjusted=EFFECT_TYPES_V41[type].tenacity?Math.max(.5,duration*(1-Math.min(.9,Math.max(0,tenacity/100)))):duration;
  if(['shield','physical_shield','magic_shield'].includes(type)){
   if(source?.champ&&source.team===target.team)power*=1+Math.max(0,this.a.elementalStatsV452d3(source).healShieldPower)/100;
   if(target.champ&&target.items?.includes('spirit_visage'))power*=1.25;
   if(source?.items?.includes('actualizer')&&source.b7ActualizerUntil>this.a.gameTime)power*=1+ITEM_REMAINDER_RULES_V453_DEV69_B7.actualizer.shieldHealAmp;
   if(target.b6SerpentUntil>this.a.gameTime&&source?.team===target.team)power*=1-Math.max(0,Math.min(.75,target.b6SerpentCut||0));
  }
  const until=this.a.gameTime+adjusted;
  target.statusEffectsV41??=[];
  const existing=target.statusEffectsV41.find(e=>e.until>this.a.gameTime&&e.type===type&&(key?e.key===key:e.sourceId===(source?.id||null)));
  if(existing&&stack!=='independent'){
   existing.until=Math.max(existing.until,until);
   existing.power=Math.max(existing.power,power);
   this.record('refresh',target,source,{effectId:existing.id,type});return {ok:true,id:existing.id,until:existing.until,refreshed:true};
  }
  const effect={id:++this.a.effectIdV41,type,sourceId:source?.id||null,key:key||null,power,until,appliedAt:this.a.gameTime,damageType,interval,nextTick:this.a.gameTime+interval};
  target.statusEffectsV41.push(effect);
  if(type==='stasis')target.stasisUntil=Math.max(target.stasisUntil||0,until);
  if(['stun','knockup','suppression','fear','charm','sleep'].includes(type))target.stunUntil=Math.max(target.stunUntil||0,until);
  if(type==='root')target.rootUntil=Math.max(target.rootUntil||0,until);
  if(type==='grounded')target.groundedUntil=Math.max(target.groundedUntil||0,until);
  if(type==='slow')target.slowUntil=Math.max(target.slowUntil||0,until);
  if(EFFECT_TYPES_V41[type].cc)target.ccStatus={kind:type,until,source:source?.id||null};
  this.record('apply',target,source,{effectId:effect.id,type,until,power});
  if(['shield','physical_shield','magic_shield'].includes(type)){
    this.a.afterSupportProtectionV453Dev69B5(source,target,power,'shield');
    if(source?.items?.includes('scarlet_lucidity'))source.b7ScarletUntil=this.a.gameTime+ITEM_REMAINDER_RULES_V453_DEV69_B7.scarlet_lucidity.sprintSeconds;
    if(source?.items?.includes('diadem_of_songs'))source.b7ConsonanceUntil=this.a.gameTime+3;
   }
  if(EFFECT_TYPES_V41[type].cc&&source?.champ&&source.team!==target.team)this.a.afterSupportCCV453Dev69B5(source,target,type);
  return {ok:true,id:effect.id,until};
 }
 // Typed shield resolution is stable: earliest-expiring layer, then effect ID.
 absorb(target,damage,damageType){
  let left=Math.max(0,damage),absorbed=0;
  const layers=this.list(target).filter(e=>e.power>0&&(['shield','physical_shield','magic_shield'].includes(e.type))&&(e.type==='shield'||e.type===(damageType+'_shield'))).sort((a,b)=>a.until-b.until||a.id-b.id);
  for(const e of layers){if(left<=0)break;const take=Math.min(left,e.power);e.power-=take;left-=take;absorbed+=take;this.record('shield_absorb',target,null,{effectId:e.id,type:e.type,amount:take});}
  if(left>0&&target.shield>0){const take=Math.min(left,target.shield);target.shield-=take;left-=take;absorbed+=take;if(target.barrierUntil>this.a.gameTime)target.barrierAmount=Math.max(0,(target.barrierAmount||0)-take);}
  return {remaining:left,absorbed};
 }
 heal(target,amount,source=null,{ignoreGrievous=false}={}){
  if(!target||target.hp<=0||!Number.isFinite(amount)||amount<=0)return 0;
  const modifier=ignoreGrievous||!this.has(target,'grievous_wounds')?1:.6;
  const amplification=(source?.champ?1+Math.max(0,this.a.elementalStatsV452d3(source).healShieldPower)/100:1)*(target.champ&&target.items?.includes('spirit_visage')?1.25:1)*
   (source?.items?.includes('actualizer')&&source.b7ActualizerUntil>this.a.gameTime?1+ITEM_REMAINDER_RULES_V453_DEV69_B7.actualizer.shieldHealAmp:1)*
   (target.items?.includes('immortal_journey')&&target.hp<target.maxHp*.5?1+ITEM_REMAINDER_RULES_V453_DEV69_B7.immortal_journey.healBelowHalf:1);
  const received=Math.max(0,Math.min(target.maxHp-target.hp,amount*modifier*amplification));
  target.hp+=received;
  if(received>0){this.record('heal',target,source,{amount:received});this.a.afterSupportProtectionV453Dev69B5(source,target,received,'heal');
    if(source?.items?.includes('scarlet_lucidity'))source.b7ScarletUntil=this.a.gameTime+ITEM_REMAINDER_RULES_V453_DEV69_B7.scarlet_lucidity.sprintSeconds;
    if(source?.items?.includes('diadem_of_songs'))source.b7ConsonanceUntil=this.a.gameTime+3;}
  return received;
 }
 remove(target,{types=null,ccOnly=false,sourceId=null,includeSuppression=false}={}){
  if(!target)return 0;
  const remove=new Set(types||[]);let count=0;
  target.statusEffectsV41=(target.statusEffectsV41||[]).filter(e=>{
   let candidate=types?remove.has(e.type):ccOnly?!!EFFECT_TYPES_V41[e.type]?.cc:true;
   if(ccOnly&&!includeSuppression&&['suppression','knockup'].includes(e.type))candidate=false;
   if(sourceId&&e.sourceId!==sourceId)candidate=false;
   if(!candidate)return true;
   count++;this.record('remove',target,null,{effectId:e.id,type:e.type});return false;
  });
  // Never keep stale legacy blockers after a cleanse.
  const active=this.list(target);
  target.rootUntil=active.filter(e=>e.type==='root').reduce((n,e)=>Math.max(n,e.until),0);
  target.stunUntil=active.filter(e=>['stun','knockup','suppression','fear','charm','sleep'].includes(e.type)).reduce((n,e)=>Math.max(n,e.until),0);
  target.groundedUntil=active.filter(e=>e.type==='grounded').reduce((n,e)=>Math.max(n,e.until),0);
  if(!active.some(e=>EFFECT_TYPES_V41[e.type]?.cc))target.ccStatus=null;
  return count;
 }
 advanceTick(){
  for(const target of this.a.units){
   const all=target.statusEffectsV41||[];
   for(const e of all.slice().sort((a,b)=>a.id-b.id)){
    if(e.until<this.a.gameTime||target.hp<=0)continue;
    if(e.type!=='dot'&&e.type!=='hot')continue;
    let iterations=0;
    while(e.nextTick<=this.a.gameTime&&e.nextTick<=e.until+1e-8&&iterations++<16){
     const origin=this.a.units.find(u=>u.id===e.sourceId)||null;
     if(e.type==='dot')this.a.damage(target,e.power,origin,e.damageType,'dot');
     else this.heal(target,e.power,origin);
     e.nextTick+=e.interval;
     if(target.hp<=0)break;
    }
   }
   const expired=all.filter(e=>e.until<=this.a.gameTime||target.hp<=0);
   if(expired.length){target.statusEffectsV41=all.filter(e=>e.until>this.a.gameTime&&target.hp>0);for(const e of expired)this.record('expire',target,null,{effectId:e.id,type:e.type});}
  }
 }
}

export class Arena {
 constructor(map,mask,{seed=26,roundSeconds=30,decisionSeconds=30,draft=null,mode='bot',riftMode='standard',worldBounds=DEFAULT_WORLD_BOUNDS}={}){
  this.map=map; this.mask=mask;this.rng=seeded(seed);this.seed=seed;this.roundSeconds=roundSeconds;this.decisionSeconds=decisionSeconds;this.mode=mode;
  this.worldBounds={...DEFAULT_WORLD_BOUNDS,...worldBounds};
  this.worldWidth=this.worldBounds.maxX-this.worldBounds.minX;
  this.worldHeight=this.worldBounds.maxY-this.worldBounds.minY;
  this.effectIdV41=0;this.effectSequenceV41=0;this.effectJournalV41=[];this.actionJournalV40=[];this.actionSequenceV40=0;this.actionLocksV40={};this.lastCheckpointV40=null;this.roundHistory=[];this.lastResolvedSeconds=0;this.lastTacticalAlerts=[];
  this.liveWindow=null;this.encounterCooldowns={};this.duelRequests={};this.phase="preparation";this.pendingDecision=null;this.executionRemaining=0;this.preparationSeconds=60;this.planningSeconds=60;
  this.round=1;this.gameTime=0;this.events=[];this.dragonCaptureLedgerV452d3=[];this.championProjectilesV453Dev42=[];this.championProjectileSeqV453Dev42=0;this.ireliaBladesV453Dev43={};this.ireliaBladeHistoryV453Dev43=[];this.projectileBarriersV453Dev43=[];
  this.riftV452d4={schema:'coachlol.rift-state.v1',mode:RIFT_MODE_RULES_V452D4[riftMode]?riftMode:'standard',phase:'base',element:null,transformAt:null,transformDragonIndex:0,revision:0};
  this.riftBundlesV452d4={};this.riftEventsV452d4=[];
  this.scryerConeMaskV452d4=structuredCopy(map.scryerConeMaskV452d4||null);
  this.riftBaseFeaturesV452d4=structuredCopy(map.riftBaseFeaturesV452d4||{});this.riftPlantTimersV452d4={};this.riftScryerCyclesV452d4={};this.riftVisionPulsesV452d4=[];this.riftHexChannelsV452d4=[];this.riftHexCooldownsV452d4={};
  // Optional mask-authoring pipeline feeds bundles through a map copy before match construction.
  for(const [element,bundle] of Object.entries(map.riftBundlesV452d4||{}))this.installRiftBundleV452d4(element,bundle);this.teams={blue:{ready:false,kills:0,dragons:[],baronUntil:0,soulAt:0,elderUntil:0,voidgrubs:0,heralds:0},red:{ready:false,kills:0,dragons:[],baronUntil:0,soulAt:0,elderUntil:0,voidgrubs:0,heralds:0}};
  this.delayedEffects=[];this.specialCastHistory=[];this.campKnowledge={blue:{},red:{}};this.orderHistory=[];this.units=[];this.minions=[];this.wards=[];this.visionActions=[];this.missiles=[];this.nextId=1;this.waveIndex=0;this.nextWave=SIMULATION_TIMING_2026.waveFirst;this.structures=map.objects.filter(o=>['tower','nexus','inhibitor'].includes(o.type)).map(o=>{const hp=o.type==='nexus'?5500:o.type==='inhibitor'?4000:o.lane==='nexus'?3500:o.id.endsWith('_t1')?9000:o.id.endsWith('_t2')?5000:4750;return {...o,hp,maxHp:hp,alive:true,aggro:null,lastShot:-10,armor:o.type==='tower'?60:20,respawnAt:0};});
  this.camps=map.camps.map(c=>{const origin=map.objects.find(o=>o.id===c.objectId)||{};return {...c,name:({krugs:'Krugues',red:'Rubrivira',raptors:'Acuâminas',gromp:'Grompe',wolves:'Lobos',blue:'Azuporã',scuttle:'Aronguejo',voidgrubs:'Vastilarvas',herald:'Arauto do Vale',baron:'Barão Na’Shor',dragon:'Dragão'}[c.timerKey]||origin.name||c.id),x:origin.x,y:origin.y,alive:false,respawnAt:0,spawnCycle:0,health:0,maxHealth:0,patience:100,leashState:'idle',aggroId:null,monsterAttackAt:0};});
  // V4.4: distinct temporal encounters in the same Baron pit; no parallel monsters.
  const baronPit=map.objects.find(o=>o.id==='baron_pit');
  if(baronPit)for(const type of ['voidgrubs','herald'])if(!this.camps.some(c=>c.timerKey===type))
   this.camps.push({id:'camp_'+type+'_v44',objectId:'baron_pit',team:'neutral',timerKey:type,name:type==='voidgrubs'?'Vastilarvas':'Arauto do Vale',
    x:baronPit.x,y:baronPit.y,alive:false,respawnAt:0,spawnCycle:0,health:0,maxHealth:0,
    patience:100,leashState:'idle',aggroId:null,monsterAttackAt:0,exhaustedV44:false});
  this.objectiveLedgerV44=[];this.teamfightLedgerV44=[];
  this.smiteContestV452d4Dev9=null;this.smiteContestDecidedV452d4Dev9=[];
  this.farmTelemetryV452={blue:{},red:{},events:[]};
  this.postgameTimelineV452d4Dev7={schema:'coachlol.postgame.timeline.v1',samples:[]};
  this.structureBurnV45={};this.voidmiteSiegesV45=[];this.heraldEyeV45=null;this.heraldMercenariesV45=[];
  this.ended=false;this.winner=null;
  this.lanes={};for(const name of ['top','mid','bot'])this.lanes[name]=prepareLine(map.waveSystem.lanes[name].blueToRed);
  const defaults={blue:{TOP:'Volibear',JG:'Warwick',MID:'Ahri',ADC:'Jinx',SUP:'Nami'},red:{TOP:'Darius',JG:'LeeSin',MID:'Vex',ADC:'Caitlyn',SUP:'Leona'}};
  const picks=draft||defaults; const draftSpellsV452=draft?.spells||{};
  for(const team of ['blue','red'])for(const role of ROLES){let champ=picks[team]?.[role]||defaults[team][role];let klass=CK[champ]||(role==='TOP'?'fighter':role==='JG'?'fighter':role==='MID'?'mage':role==='ADC'?'marksman':'enchanter');const stats={...CLASS_STATS[klass],...CHAMPION_STATS_V38[champ]};const sp=map.objects.find(o=>o.id===team+'_spawn_shop');let x=sp?.x||(team==='blue'?.065:.93), y=sp?.y||(team==='blue'?.93:.07);
   this.units.push({id:team+'_'+role,team,role,champ,klass,x,y,hp:stats.hp,maxHp:stats.hp,mana:stats.mana,maxMana:stats.mana,ad:stats.ad,ap:stats.ap,armor:stats.armor,mr:stats.mr??CLASS_MAGIC_RESIST[klass],baseStats2026:!!CHAMPION_STATS_V38[champ],range:baseAttackRangeWorld(champ,stats.range),moveSpeed:stats.moveSpeed??BASE_MS_BY_CLASS[klass],flatMoveSpeed:0,percentMoveSpeed:0,slowPercent:0,atkSpeed:stats.atkSpeed,skillPower:stats.skill,level:1,xp:0,skillPoints:1,skillRanks:{Q:0,W:0,E:0,R:SPECIAL_R_FROM_LEVEL_ONE.has(champ)?1:0},skillPriority:['Q','E','W'],skillBuild:null,autoLevelSkills:false,explicitOrder:false,gold:500,postgameV452d4Dev7:{schema:'coachlol.postgame.player.v1',initialGold:500,goldEarned:0,goldSpent:0,goldRefunded:0,damageDealtChampions:{physical:0,magic:0,true:0},damageTakenChampions:{physical:0,magic:0,true:0},wardsPlaced:0,wardsDestroyed:0,complete:true},cs:0,runePageV43:'none',runeProcNextV43:0,runeStacksV43:0,runeLastHitAtV43:-999,rabadonBonusV43:0,economyLedgerV43:[],economySeqV43:0,runeCombatAtV43:null,runeGraspLastProcAtV43:-999,critChance:0,abilityHaste:0,basicHaste:0,ultimateHaste:0,summonerHaste:0,itemHaste:0,lethality:0,armorPenFlat:0,armorPenPercent:0,magicPenFlat:0,magicPenPercent:0,lifeSteal:0,omnivamp:0,physicalVamp:0,spellVamp:0,healShieldPower:0,tenacity:0,slowResist:0,hpRegen:0,manaRegen:0,critDamage:175,kills:0,deaths:0,assists:0,damageContributors:{},items:[],deadUntil:0,shield:0,statusEffectsV41:[],stasisUntil:0,stasisCd:0,rootUntil:0,groundedUntil:0,flashCd:0,exhaustCd:0,igniteCd:0,healCd:0,tpCd:0,barrierCd:0,barrierAmount:0,barrierUntil:0,summonerSpell:role==='JG'?'smite':role==='SUP'?'exhaust':role==='TOP'?'tp':role==='ADC'?'heal':'ignite',baronBuffUntilV452:0,elderBuffUntilV452:0,ghostCd:0,ghostUntil:0,cleanseCd:0,cleanseTenacityUntilV453Dev66:0,elderPendingV452:null,skillCd:0,attackAt:0,combatStyle:'auto',onHitStacks:0,retreatUntil:0,retreatPath:[],path:[],order:{kind:'auto',focus:null,spell:'none'},spentMove:0,wardCharges:2,controlWardStock:0,trinket:"stealth",oracleCd:0,oracleUntil:0,trinketNextChargeAt:210,smiteTier:role==='JG'?1:0,smiteDamage:role==='JG'?600:0,smiteCd:0,smiteCharges:role==='JG'?1:0,smiteRecoveries:role==='JG'?[48]:[],smitePolicy:{mode:'auto',rules:[]},smiteCastHistory:{},junglePet:null,jungleTreats:0,jungleBonusTreats:0,jungleNextBonusAt:60,jungleBuff:null,junglePetStage:0,supportQuest:0,supportCharges:role==='SUP'?3:0,supportNextChargeAt:20,supportLastGoldTick:0,buildPlan:[],purchaseQueue:[],policy:'balanced',reaction:'balanced',autoRespond:team==='red'&&this.mode!=='pvp',reactionCd:0,tactics:{wave:'normal',trade:'normal',poke:'off',conserveMana:false},skillCds:{Q:0,W:0,E:0,R:0},manualMoveHold:false,autoFarm:role!=='JG'&&role!=='SUP',autoAttack:true,autoFollow:role!=='JG',autoJungle:role==='JG',laneFollowPath:[],laneFollowGoal:null,nextLaneUpdate:0,plan:null,lastHitBy:null,lastHitAt:-999,combatUntil:0,threatId:null,reactAt:0,holdUntil:0,regenAt:0,hpRegenBasePct:0,manaRegenBasePct:0,scoutBullseyeReadyAtV453Dev38:0,doransCombatManaUntilV453Dev38:0,energizeStacksV453Dev38:0,ireliaMarkV453Dev42:null});
  }
  for(const u of this.units){
   const chosen=draftSpellsV452[u.team]?.[u.role];
   if(chosen&&SUMMONER_LOADOUT_V452.includes(chosen)&&u.role!=='JG'&&chosen!=='smite')u.summonerSpell=chosen;
   // Each champion has immutable D and F slots. Legacy draft payloads still load.
   const key=draft?.smiteKeys?.[u.team]==='d'?'d':'f';
   const configured=draft?.summonerSlots?.[u.team]?.[u.role];
   const previous=u.role==='JG'?(key==='d'?['smite','flash']:['flash','smite']):['flash',u.summonerSpell];
   u.summonerSlots=normalizeSummonerSlotsV452d4Dev11(u.role,configured??previous,key);
   u.summonerLegacyOriginalV452d4Dev11=u.summonerSpell;
   if(u.role==='JG')u.smiteKey=u.summonerSlots[0]==='smite'?'d':'f';
   else u.summonerSpell=u.summonerSlots.find(x=>x!=='flash')||u.summonerSlots[1];
  }
  // In 2026 the SUPPORT starter is role-assigned. Deduct its cost from opening gold.
  for(const u of this.units.filter(u=>u.role==='SUP'))this.buy(u.team,u.id,'support_atlas');
  // Jungle pet choice remains selectable during preparation; before execution
  // a default is purchased if the player forgot it. Other lanes also get a starter.
  // Bot levels automatically; humans choose their opening ability in the paused shop.
  for(const u of this.units)if(this.mode!=='pvp'&&u.team==='red'){u.autoLevelSkills=true;this.autoSpendSkills(u)}
  this.visionCache={};this.samplePostgameV452d4Dev7(true);this.event('Preparação de 60 segundos: compre itens e planeje rotas; o mapa está pausado.');
 }
 // Authoritative match telemetry: never writes gameplay stats in response to UI.
 // Values are accumulated once at the existing award/damage/ward mutation sites.
 postgameEntryV452d4Dev7(u){
  if(!u?.champ)return null;
  if(!u.postgameV452d4Dev7){
   // Older snapshots cannot reconstruct prior match history reliably.
   u.postgameV452d4Dev7={schema:'coachlol.postgame.player.v1',initialGold:u.gold,
    goldEarned:0,goldSpent:0,goldRefunded:0,
    damageDealtChampions:{physical:0,magic:0,true:0},
    damageTakenChampions:{physical:0,magic:0,true:0},wardsPlaced:0,wardsDestroyed:0,complete:false};
  }
  return u.postgameV452d4Dev7;
 }
 creditGoldV452d4Dev7(u,amount,reason='income'){
  if(!Number.isFinite(amount)||amount<0)throw Error('postgame_credito_invalido');
  if(!u?.champ)throw Error('postgame_credito_sem_campeao');
  u.gold+=amount;
  const t=this.postgameEntryV452d4Dev7(u);
  if(reason==='refund')t.goldRefunded+=amount;
  else t.goldEarned+=amount;
  return amount;
 }
 spendGoldV452d4Dev7(u,amount){
  if(!Number.isFinite(amount)||amount<0||amount>u.gold)throw Error('postgame_gasto_invalido');
  u.gold-=amount;this.postgameEntryV452d4Dev7(u).goldSpent+=amount;
  return amount;
 }
 recordChampionDamageV452d4Dev7(target,attacker,amount,damageType){
  if(!(amount>0)||!target?.champ||!attacker?.team||attacker.team===target.team)return;
  const type=['physical','magic','true'].includes(damageType)?damageType:'physical';
  this.postgameEntryV452d4Dev7(target).damageTakenChampions[type]+=amount;
  if(attacker.champ)this.postgameEntryV452d4Dev7(attacker).damageDealtChampions[type]+=amount;
 }
 samplePostgameV452d4Dev7(force=false){
  // Sample after a fully resolved simulated second, never per render/UI speed.
  if(!force&&(!Number.isInteger(this.gameTime)||this.gameTime%60!==0))return false;
  this.postgameTimelineV452d4Dev7??={schema:'coachlol.postgame.timeline.v1',samples:[]};
  const samples=this.postgameTimelineV452d4Dev7.samples;
  if(samples.at(-1)?.time===this.gameTime)return false;
  const players=Object.fromEntries(this.units.map(u=>{
   const t=this.postgameEntryV452d4Dev7(u);
   return [u.id,{goldEarned:t.goldEarned,goldSpent:t.goldSpent,goldRefunded:t.goldRefunded,
    goldOnHand:u.gold,cs:u.cs,kills:u.kills,deaths:u.deaths,assists:u.assists}];
  }));
  samples.push({time:this.gameTime,players});
  return true;
 }
 // Pre-match geometry contract: all coordinates are authored from certified source masks.
 // Mask indices are 0..size²-1. Original mask arrays and path atlas are immutable.
 installRiftBundleV452d4(element,bundle){
  if(!RIFT_ELEMENTS_V452D4.includes(element))throw Error('elemento_rift_invalido');
  if(this.riftV452d4.phase!=='base'||this.gameTime>0)throw Error('geometria_deve_ser_registrada_antes_da_partida');
  const size=this.mask.size;if(bundle?.size!==size)throw Error('tamanho_mascara_invalido');
  const allowed=['addWall','removeWall','addBrush','removeBrush'];
  const normalized={schema:'coachlol.rift-bundle.v1',size,element};
  for(const key of allowed){
   const values=bundle[key]||[];
   if(!Array.isArray(values)||values.some(i=>!Number.isInteger(i)||i<0||i>=size*size)||new Set(values).size!==values.length)throw Error('indices_'+key+'_invalidos');
   normalized[key]=[...values].sort((a,b)=>a-b);
  }
  if(normalized.addWall.some(x=>normalized.removeWall.includes(x))||normalized.addBrush.some(x=>normalized.removeBrush.includes(x)))throw Error('delta_contraditorio');
  if(element==='infernal'&&(normalized.addWall.length||normalized.removeWall.length||normalized.addBrush.length||normalized.removeBrush.length))throw Error('infernal_14_1_sem_destruicao_de_terreno');
  if(element==='mountain'&&(normalized.addBrush.length||normalized.removeBrush.length))throw Error('mountain_somente_paredes_no_alpha');
  if(element==='ocean'&&(normalized.addWall.length||normalized.removeWall.length))throw Error('ocean_somente_brush_no_alpha');
  const features=bundle.features||{};
  const validatePoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1;
  normalized.features={};
  for(const [kind,entries] of Object.entries(features)){
   if(!['windZones','hexgates','plants','cinderSites','faelights','scryers'].includes(kind)||!Array.isArray(entries)||entries.some(p=>!validatePoint(p)||!p.id||typeof p.id!=='string'))throw Error('feature_invalida_'+kind);
   const ids=entries.map(p=>p.id);if(new Set(ids).size!==ids.length)throw Error('ids_feature_duplicados');
   for(const p of entries)if((kind==='windZones'&&(!Number.isFinite(p.radius)||p.radius<=0||p.radius>.5||!Number.isFinite(p.moveBonus)||p.moveBonus<0||p.moveBonus>1))||
    (kind==='hexgates'&&(!p.pairId||typeof p.pairId!=='string')))throw Error('parametros_feature_invalidos');
   normalized.features[kind]=structuredCopy(entries);
  }
  if(normalized.features.hexgates)for(const gate of normalized.features.hexgates)if(!normalized.features.hexgates.some(g=>g.id===gate.pairId&&g.pairId===gate.id))throw Error('hexgate_sem_par_reciproco');
  this.riftBundlesV452d4[element]=normalized;return {ok:true,element};
 }
 riftMaskV452d4(layer){
  const original=this.mask[layer];if(!['wall','brush'].includes(layer)||!original)return original;
  if(this.riftV452d4.phase!=='active')return original;
  const element=this.riftV452d4.element,bundle=this.riftBundlesV452d4[element];
  if(!bundle)return original;
  this._riftMaskCacheV452d4??={};const key=element+':'+this.riftV452d4.revision+':'+layer;
  if(this._riftMaskCacheV452d4[key])return this._riftMaskCacheV452d4[key];
  const chars=Array.from(original);for(const i of bundle[layer==='wall'?'removeWall':'removeBrush'])chars[i]='0';
  for(const i of bundle[layer==='wall'?'addWall':'addBrush'])chars[i]='1';
  this._riftMaskCacheV452d4[key]=chars.join('');return this._riftMaskCacheV452d4[key];
 }
 riftFeaturesV452d4(kind){return this.riftV452d4.phase==='active'?(this.riftBundlesV452d4[this.riftV452d4.element]?.features?.[kind]||[]):[];}
 featureUnlockedV452d4(kind,feature){
  if(!feature||!['faelights','scryers'].includes(kind))return true;
  const mode=feature.unlockMode||(Number.isFinite(feature.unlockAtSeconds)&&feature.unlockAtSeconds>0?'time':'base');
  if(mode==='time')return this.gameTime>=(feature.unlockAtSeconds||0);
  if(mode==='time_or_rift')return this.gameTime>=(feature.unlockAtSeconds||0)||this.riftV452d4.phase==='active';
  if(feature.unlockPhase==='post_rift')return this.riftV452d4.phase==='active';
  return !Number.isFinite(feature.unlockAtSeconds)||this.gameTime>=(feature.unlockAtSeconds||0);
 }
 riftAllFeaturesV452d4(kind){
  const base=this.riftBaseFeaturesV452d4?.[kind]||[];
  const available=['faelights','scryers'].includes(kind)?base.filter(p=>this.featureUnlockedV452d4(kind,p)):base;
  return [...available,...this.riftFeaturesV452d4(kind)];
 }
 // Site-specific bonus polygons from native 4096x4096 author masks.
 // Activation points are separate from vision polygons (including boundary points).
 // Wards of all placement types grant these areas only while their buff is valid.
 riftFaelightContainsV452d4(site,point){
  const poly=site?.visionPolygon;
  if(!Array.isArray(poly)||poly.length<3)return false;
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
   const [xi,yi]=poly[i],[xj,yj]=poly[j];
   if((yi>point.y)!==(yj>point.y)&&point.x<(xj-xi)*(point.y-yi)/(yj-yi)+xi)inside=!inside;
  }
  // Current safe policy: do not expose points behind a dynamically placed wall.
  return inside&&this.riftLineOfSightWallsV452d4(site,point);
 }
 cloudSpeedBonusV452d4(point){return this.riftFeaturesV452d4('windZones').reduce((max,z)=>Math.hypot(point.x-z.x,point.y-z.y)<=z.radius?Math.max(max,z.moveBonus):max,0);}
 firelightSpeedBonusV452d4(u){return (u.riftFirelightSpeedUntilV452d4||0)>this.gameTime?.15:0;}
 // Authored plants never change the immutable wall/brush atlas. The player
 // chooses a landing direction for the actor; all other nearby champions are
 // launched radially from the cone's centre, including enemies.
 nearestRiftLandingV452d4(point,heading,distance){
  for(const radius of [distance,distance*.85,distance*.65,distance*.45]){
   for(const delta of [0,.13,-.13,.26,-.26,.45,-.45]){
    const a=heading+delta,p={x:point.x+Math.cos(a)*radius,y:point.y+Math.sin(a)*radius};
    if(this.walkable(p.x,p.y))return p;
   }
  }
  return null;
 }
 // V4.5.3-dev45: jogadores enviam intencao para planta. Nao teleporta;
 // navega pelo mapa real, ativa apenas quando estiver no alcance validado.
 requestRiftPlantV453Dev45(team,actorId,plantId,headingRadians=0){
  const u=this.units.find(x=>x.id===actorId&&x.team===team&&x.hp>0);
  const plant=[...this.riftAllFeaturesV452d4('plants'),...this.riftAllFeaturesV452d4('scryers')].find(x=>x.id===plantId);
  if(!u||!plant)return {ok:false,reason:'planta_indisponivel'};
  if(!Number.isFinite(headingRadians))return {ok:false,reason:'angulo_invalido'};
  if((this.riftPlantTimersV452d4[plantId]||0)>this.gameTime)return {ok:false,reason:'planta_em_recarga'};
  let goal={x:plant.x,y:plant.y};
  if(this.mapDistance(u,plant)>210){
   // Plantas podem estar fora da malha caminhavel; escolher ponto proximo.
   const candidates=[];
   for(const radius of [125,175,195,0])for(let i=0;i<(radius?16:1);i++){
    const theta=i*Math.PI/8;
    const q={x:plant.x+Math.cos(theta)*radius/this.worldWidth,y:plant.y+Math.sin(theta)*radius/this.worldHeight};
    if(this.walkable(q.x,q.y)&&this.mapDistance(q,plant)<=210)candidates.push(q);
   }
   candidates.sort((a,b)=>this.mapDistance(u,a)-this.mapDistance(u,b));
   let route=null;for(const q of candidates){const path=this.findPath(u,q);if(path?.length){goal=q;route=path;break;}}
   if(!route)return {ok:false,reason:'planta_sem_caminho'};
   u.pendingPlantV453Dev45={id:plantId,kind:plant.kind,angle:headingRadians,goal,path:route};
  }else u.pendingPlantV453Dev45={id:plantId,kind:plant.kind,angle:headingRadians,goal,path:[]};
  u.order={kind:'hold',spell:'none'};u.explicitOrder=true;u.manualMoveHold=false;
  return {ok:true,queued:true,plantId};
 }
 advanceRiftPlantV453Dev45(u){
  const intent=u.pendingPlantV453Dev45;if(!intent)return false;
  const plant=[...this.riftAllFeaturesV452d4('plants'),...this.riftAllFeaturesV452d4('scryers')].find(p=>p.id===intent.id);
  if(!plant||u.hp<=0||(this.riftPlantTimersV452d4[intent.id]||0)>this.gameTime){u.pendingPlantV453Dev45=null;return false;}
  if(this.mapDistance(u,plant)<=220){
   const result=plant.kind==='scryer_bloom'?this.activateScryerBloomV452d4(u.team,u.id,plant.id,intent.angle):this.activateRiftPlantV452d4(u.team,u.id,plant.id,intent.angle);
   u.pendingPlantV453Dev45=null;
   if(result.ok)this.event(`${u.champ} ativou ${plant.kind}.`,u.team,'rift_plant',u.id);
   return true;
  }
  if(!intent.path?.length)intent.path=this.findPath(u,intent.goal)||[];
  if(intent.path?.length)this.moveAlong(u,{path:intent.path,point:intent.goal},this.effectiveMS(u));
  return true;
 }
 requestRetreatV453Dev45(team,unitId){
  const u=this.units.find(x=>x.id===unitId&&x.team===team&&x.hp>0);
  if(!u)return {ok:false,reason:'campeao_indisponivel'};
  const origin=this.map.objects.find(p=>p.id===team+'_spawn_shop');
  const tower=this.structures.filter(t=>t.team===team&&t.alive&&t.type==='tower').sort((a,b)=>this.mapDistance(u,a)-this.mapDistance(u,b))[0];
  const destinations=[tower,origin].filter(Boolean);
  let goal=null,path=null;
  for(const dest of destinations){const route=this.findPath(u,dest);if(route?.length){goal={x:dest.x,y:dest.y};path=route;break;}}
  if(!goal&&destinations.length){goal={x:destinations.at(-1).x,y:destinations.at(-1).y};path=[];}
  if(!goal)return {ok:false,reason:'retiro_sem_destino'};
  u.policy='safe';u.retreatGoal=goal;u.retreatPath=path;u.retreatUntil=this.gameTime+20;
  u.pendingPlantV453Dev45=null;u.reactionCombo=null;u.pendingTargetedCast=null;
  u.order={kind:'hold',spell:'none'};u.explicitOrder=true;u.manualMoveHold=false;
  this.event(`${u.champ} recebeu ordem de retirada.`,team,'retreat',u.id);
  return {ok:true,goal};
 }
 activateBlastConeV452d4(team,actorId,plantId,angleRadians){
  const actor=this.units.find(u=>u.id===actorId&&u.team===team&&u.hp>0),plant=this.riftAllFeaturesV452d4('plants').find(p=>p.id===plantId&&p.kind==='blast_cone');
  if(!actor||!plant)return {ok:false,reason:'fruta_indisponivel'};
  if(!Number.isFinite(angleRadians)||this.mapDistance(actor,plant)>220)return {ok:false,reason:'direcao_ou_alcance_invalido'};
  if((this.riftPlantTimersV452d4[plant.id]||0)>this.gameTime)return {ok:false,reason:'fruta_em_recarga'};
  const distance=plant.landingDistance*(this.riftV452d4.element==='chemtech'?2:1),targets=[];
  for(const u of this.units){
   if(u.hp<=0||Math.hypot(u.x-plant.x,u.y-plant.y)>(plant.radius||.03))continue;
   const heading=u.id===actorId?angleRadians:Math.atan2(u.y-plant.y,u.x-plant.x);
   const endpoint=this.nearestRiftLandingV452d4(u,heading,distance);
   if(endpoint)targets.push({unit:u,point:endpoint});
  }
  if(!targets.length)return {ok:false,reason:'nenhum_destino_livre'};
  for(const {unit:u,point} of targets){u.x=point.x;u.y=point.y;this.invalidateShopUndoOnDepartureV453Dev61(u);u.laneFollowPath=[];u.retreatPath=[];u.path=[];if(u.order)delete u.order.path;if(u.plan?.steps)for(const step of u.plan.steps)step.path=[];}
  this.riftPlantTimersV452d4[plant.id]=this.gameTime+(plant.respawnSeconds||90);this.visionCache={};
  this.event('Fruta explosiva ativada.',null,'rift_plant',null,{public:true,plantId:plant.id});
  return {ok:true,affected:targets.map(t=>t.unit.id),cooldownUntil:this.riftPlantTimersV452d4[plant.id]};
 }
 activateRiftPlantV452d4(team,actorId,plantId,headingRadians=0){
  const actor=this.units.find(u=>u.id===actorId&&u.team===team&&u.hp>0),plant=this.riftAllFeaturesV452d4('plants').find(p=>p.id===plantId);
  if(!actor||!plant)return {ok:false,reason:'planta_indisponivel'};
  if(plant.kind==='blast_cone')return this.activateBlastConeV452d4(team,actorId,plantId,headingRadians);
  if(this.mapDistance(actor,plant)>220)return {ok:false,reason:'planta_fora_de_alcance'};
  if((this.riftPlantTimersV452d4[plantId]||0)>this.gameTime)return {ok:false,reason:'planta_em_recarga'};
  if(plant.kind==='stim_fruit'||plant.kind==='honeyfruit'){
   // Every authored Honeyfruit point spawns without Chemtech. Chemtech enhances
   // consumption; it must NOT gate existence/spawn or duplicate the pickup.
   const enhanced=this.riftV452d4.phase==='active'&&this.riftV452d4.element==='chemtech';
   actor.hp=Math.min(actor.maxHp,actor.hp+actor.maxHp*.10);
   if(enhanced)actor.shield=(actor.shield||0)+actor.maxHp*.05;
   else this.applyEffectV41(actor,'slow',{duration:3,power:.15,key:'honeyfruit_'+plantId});
  }else if(plant.kind==='firelight_bloom'){
   if(!Number.isFinite(headingRadians))return {ok:false,reason:'angulo_invalido'};
   const pulse={team,x:plant.x,y:plant.y,heading:headingRadians,until:this.gameTime+12,id:plant.id};
   this.riftVisionPulsesV452d4.push(pulse);
   // Chemtech Firelight Bloom: allied champions caught by the directional
   // sweep gain a temporary, prototype MS boost. Never a permanent stat write.
   for(const ally of this.units)if(ally.team===team&&ally.hp>0&&this.riftPulseContainsV452d4(pulse,ally)){
    ally.riftFirelightSpeedUntilV452d4=Math.max(ally.riftFirelightSpeedUntilV452d4||0,this.gameTime+3);
   }
   // Mutated Scryer's Bloom tags enemy wards and lowers them to 1 HP.
   for(const ward of this.wards)if(ward.team!==team&&this.riftPulseContainsV452d4(pulse,ward)){
    ward.hp=Math.min(ward.hp,1);ward.riftRevealedByV452d4??={};ward.riftRevealedByV452d4[team]=pulse.until;
   }
  }else return {ok:false,reason:'tipo_planta_desconhecido'};
  this.riftPlantTimersV452d4[plantId]=this.gameTime+(plant.respawnSeconds||90);this.visionCache={};
  this.event('Planta elemental ativada.',team,'rift_plant',actorId);
  return {ok:true,kind:plant.kind,cooldownUntil:this.riftPlantTimersV452d4[plantId]};
 }
 // Season 2026 Scryer's Bloom: separate from Chemtech Firelight Bloom.
 // Default 200–260s, additional 90–120s, in simulated time. The location
 // registry is an explicitly provisional preview until the author's mask exists.
 // Interval hashing is deterministic and does not perturb the battle RNG.
 scryerCooldownV452d4(site,cycle){
  const min=site.respawnMinSeconds,max=site.respawnMaxSeconds;
  if(!Number.isInteger(min)||!Number.isInteger(max)||min<1||max<min)return null;
  let h=(this.seed||0)>>>0;
  for(const c of String(site.id))h=(Math.imul(h^c.charCodeAt(0),16777619))>>>0;
  h=(Math.imul(h^(cycle>>>0),2246822519))>>>0;
  return min+(h%(max-min+1));
 }
 activateScryerBloomV452d4(team,actorId,siteId,headingRadians=0){
  const actor=this.units.find(u=>u.id===actorId&&u.team===team&&u.hp>0);
  const site=this.riftAllFeaturesV452d4('scryers').find(p=>p.id===siteId);
  if(!actor||!site)return {ok:false,reason:'florividente_indisponivel'};
  if(!Number.isFinite(headingRadians))return {ok:false,reason:'angulo_invalido'};
  if(this.mapDistance(actor,site)>220)return {ok:false,reason:'florividente_fora_do_alcance'};
  if((this.riftPlantTimersV452d4[siteId]||0)>this.gameTime)return {ok:false,reason:'florividente_em_recarga'};
  const cycle=(this.riftScryerCyclesV452d4[siteId]||0)+1;
  const seconds=this.scryerCooldownV452d4(site,cycle);
  if(seconds===null)return {ok:false,reason:'regra_respawn_invalida'};
  const chemtech=this.riftV452d4.phase==='active'&&this.riftV452d4.element==='chemtech';
  // Dev47: one full simulated round of directional vision; distinct from the
  // longer respawn cooldown. Terrain and brush do not obstruct this pulse.
  const visionSeconds=Math.max(1,Math.ceil(this.roundSeconds||30));
  const pulse={team,x:site.x,y:site.y,heading:headingRadians,until:this.gameTime+visionSeconds,id:site.id,kind:'scryer_bloom',enhanced:chemtech};
  this.riftVisionPulsesV452d4.push(pulse);
  for(const ward of this.wards)if(ward.team!==team&&this.riftPulseContainsV452d4(pulse,ward)){
   // Every bloom reveals wards; only the Chemtech enhancement reduces HP.
   if(chemtech)ward.hp=Math.min(ward.hp,1);
   ward.riftRevealedByV452d4??={};ward.riftRevealedByV452d4[team]=pulse.until;
  }
  if(chemtech)for(const ally of this.units)if(ally.team===team&&ally.hp>0&&this.riftPulseContainsV452d4(pulse,ally)){
   ally.riftFirelightSpeedUntilV452d4=Math.max(ally.riftFirelightSpeedUntilV452d4||0,this.gameTime+3);
  }
  this.riftScryerCyclesV452d4[siteId]=cycle;
  this.riftPlantTimersV452d4[siteId]=this.gameTime+seconds;
  this.visionCache={};
  this.event('Florividente ativada.',team,'scryer_bloom',actorId);
  return {ok:true,kind:'scryer_bloom',cooldownUntil:this.riftPlantTimersV452d4[siteId],respawnSeconds:seconds};
 }
 // A landing is selected by fixed-angle ring scan; never invent terrain
 // pixels or teleport into an inaccessible mask cell.
 riftSafeGateLandingV452d4(gate){
  if(this.walkable(gate.x,gate.y))return {x:gate.x,y:gate.y};
  for(const radius of [.005,.01,.018,.025,.035])for(let n=0;n<32;n++){
   const a=n*2*Math.PI/32,p={x:gate.x+Math.cos(a)*radius,y:gate.y+Math.sin(a)*radius};
   if(this.walkable(p.x,p.y))return p;
  }
  return null;
 }
 // Firelight Bloom reveals locally and into a directed cone, never
 // through walls. These ranges are a declared tactical approximation.
 riftLineOfSightWallsV452d4(a,b){
  const count=Math.max(2,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)*155));
  for(let i=1;i<count;i++){const f=i/count;if(this.maskAt('wall',a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f))return false;}
  return true;
 }
 scryerConeWorldPolygonV452d4(pulse){
  const shape=this.scryerConeMaskV452d4,vertices=shape?.polygonLocal;
  if(!Array.isArray(vertices)||vertices.length<3)return [];
  const range=shape.rangeNormalized||.13,c=Math.cos(pulse.heading),s=Math.sin(pulse.heading);
  return vertices.map(([forward,side])=>({x:pulse.x+range*(forward*c-side*s),y:pulse.y+range*(forward*s+side*c)}));
 }
 riftPulseContainsV452d4(pulse,point){
  const dx=point.x-pulse.x,dy=point.y-pulse.y,d=Math.hypot(dx,dy);
  // Scryer's Bloom is a directional reveal through walls and brushes. The
  // Firelight Bloom remains wall-blocked; neither alters real collision.
  if(pulse.kind!=='scryer_bloom'&&!this.riftLineOfSightWallsV452d4(pulse,point))return false;
  if(pulse.kind==='scryer_bloom'&&this.scryerConeMaskV452d4?.polygonLocal){
   // Local mask points right from its LEFT tip, then rotates by the player's angle.
   // No automatic orientation toward the activating champion.
   if(pulse.enhanced&&d<=.035)return true;
   const poly=this.scryerConeWorldPolygonV452d4(pulse);
   let inside=false;
   for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
   }
   return inside;
  }
  if(d>.13)return false;
  return d<=.035||(d<=.13&&Math.cos(Math.atan2(dy,dx)-pulse.heading)>=Math.cos(.55));
 }
 // Hexgates are genuine, interruptible channels resolved on simulated ticks.
 beginHexgateV452d4(team,actorId,gateId){
  const u=this.units.find(v=>v.id===actorId&&v.team===team&&v.hp>0);
  if(!u||this.riftHexChannelsV452d4.some(c=>c.actorId===actorId)||this.riftHexCooldownsV452d4[actorId]>this.gameTime)
   return {ok:false,reason:'canalizacao_indisponivel'};
  if(u.stunUntil>this.gameTime||u.rootUntil>this.gameTime||u.groundedUntil>this.gameTime||u.stasisUntil>this.gameTime)
   return {ok:false,reason:'controle_de_grupo_impede_portal'};
  const preview=this.previewHexgateV452d4(actorId,gateId);if(!preview.ok)return preview;
  const ch={actorId,team,fromId:preview.fromId,toId:preview.toId,startedAt:this.gameTime,until:this.gameTime+preview.channelSeconds,origin:{x:u.x,y:u.y}};
  this.riftHexChannelsV452d4.push(ch);return {ok:true,until:ch.until,fromId:ch.fromId,toId:ch.toId};
 }
 advanceRiftHexgatesV452d4(){
  const unfinished=[];
  for(const ch of this.riftHexChannelsV452d4){
   const actor=this.units.find(u=>u.id===ch.actorId);
   if(!actor||actor.hp<=0||Math.hypot(actor.x-ch.origin.x,actor.y-ch.origin.y)>.007||actor.stunUntil>this.gameTime||actor.rootUntil>this.gameTime||actor.groundedUntil>this.gameTime||actor.stasisUntil>this.gameTime||actor.combatUntil>ch.startedAt){continue;}
   if(this.gameTime<ch.until){unfinished.push(ch);continue;}
   const gate=this.riftFeaturesV452d4('hexgates').find(g=>g.id===ch.toId);
   const dest=gate&&this.riftSafeGateLandingV452d4(gate);
   if(dest){
    actor.x=dest.x;actor.y=dest.y;this.invalidateShopUndoOnDepartureV453Dev61(actor);actor.laneFollowPath=[];actor.retreatPath=[];actor.path=[];
    if(actor.order)delete actor.order.path;
    // Conservative, explicitly provisional repeat-use lock; simulated seconds.
    this.riftHexCooldownsV452d4[actor.id]=this.gameTime+5;
    this.visionCache={};
   }
  }
  this.riftHexChannelsV452d4=unfinished;
 }
 // A Hexgate is a queued tactical move, not an instantaneous secret client warp.
 // The returned instruction must be committed by the authoritative game loop.
 previewHexgateV452d4(actorId,gateId){
  const u=this.units.find(v=>v.id===actorId&&v.hp>0),gates=this.riftFeaturesV452d4('hexgates'),from=gates.find(g=>g.id===gateId);
  if(!u||!from||this.mapDistance(u,from)>200)return {ok:false,reason:'portal_indisponivel_ou_fora_de_alcance'};
  if(this.riftHexCooldownsV452d4[actorId]>this.gameTime)return {ok:false,reason:'portal_em_recarga'};
  const destination=gates.find(g=>g.id===from.pairId);if(!destination||!this.riftSafeGateLandingV452d4(destination))return {ok:false,reason:'destino_bloqueado'};
  return {ok:true,kind:'hexgate_channel',channelSeconds:from.channelSeconds||2,actorId,fromId:from.id,toId:destination.id,point:{x:destination.x,y:destination.y}};
 }
 activateRiftV452d4(element,{dragonIndex=null}={}){
  if(this.riftV452d4.phase==='active')return {ok:false,reason:'transformacao_ja_realizada'};
  if(!RIFT_ELEMENTS_V452D4.includes(element))return {ok:false,reason:'elemento_invalido'};
  const state=this.riftV452d4;state.phase='active';state.element=element;state.transformAt=this.gameTime;state.transformDragonIndex=dragonIndex||state.transformDragonIndex;state.revision++;
  delete this._riftMaskCacheV452d4;delete this._brushReference;delete this._brushGroups;this.visionCache={};
  // A wall can emerge under a unit: settle deterministically on a navigable cell.
  for(const obj of [...this.units,...this.minions])if(obj.hp>0&&!this.walkable(obj.x,obj.y)){
   const safe=this.nearestRiftLandingV452d4(obj,0,.012);if(safe){obj.x=safe.x;obj.y=safe.y;this.invalidateShopUndoOnDepartureV453Dev61(obj);}
  }
  // Navigation caches are NOT authoritative: discard paths and preserve orders.
  for(const u of this.units){u.laneFollowPath=[];u.retreatPath=[];u.path=[];u.farmRetreatPathV452c=[];
   if(u.order){delete u.order.path;delete u.order.castPath;delete u.order.chasePath;}
   if(u.plan?.steps)for(const step of u.plan.steps)step.path=[];
  }
  const e={schema:'coachlol.rift-event.v1',index:this.riftEventsV452d4.length+1,type:'rift_transformed',element,at:this.gameTime,round:this.round,revision:state.revision};
  this.riftEventsV452d4.push(e);
  this.event('Rift Elemental transformado: '+element+'.',null,'objective',null,{riftElement:element,riftRevision:state.revision,public:true});
  return {ok:true,event:e};
 }
 onElementalDragonCaptureV452d4(){
  const captured=this.dragonCaptureLedgerV452d3.length,rule=RIFT_MODE_RULES_V452D4[this.riftV452d4.mode];
  if(this.riftV452d4.phase!=='base'||captured!==rule.transformAfter)return;
  const seen=new Set(this.dragonCaptureLedgerV452d3.map(d=>d.type));
  const candidates=RIFT_ELEMENTS_V452D4.filter(t=>!seen.has(t));
  const allowed=candidates.length?candidates:RIFT_ELEMENTS_V452D4;
  const type=allowed[Math.floor(this.rng()*allowed.length)];
  this.riftV452d4.transformDragonIndex=captured+1;
  this.activateRiftV452d4(type,{dragonIndex:captured+1});
 }
 nextDragonElementV452d4(){
  const captures=this.dragonCaptureLedgerV452d3;
  if(this.riftV452d4.phase==='active')return this.riftV452d4.element;
  const choices=RIFT_ELEMENTS_V452D4.filter(x=>!captures.some(d=>d.type===x));
  const pool=choices.length?choices:RIFT_ELEMENTS_V452D4;
  return pool[Math.floor(this.rng()*pool.length)];
 }
 // Permanent dragon stacks are read from the team source of truth on every use.
 elementalStatsV452d3(u){
  const bonus=this.baronChampionBonusV452d4Dev14(u);
  const extra=u?.champ?this.derivedItemStatsV453Dev69(u):{ad:0,ap:0,mr:0,armor:0};
  const b7=u?.champ?this.b7DerivedStats(u):{ad:0,ap:0,abilityHaste:0,tenacity:0,healShieldPower:0,omnivamp:0,physicalVamp:0};
  const support=u?.champ?this.supportBuffsV453Dev69B5(u):{ap:0,abilityHaste:0,healShieldPower:0};
  const midReward=u?.champ?this.b7MidQuestStatReward(u,(bonus?.ad||0)+extra.ad+b7.ad,(bonus?.ap||0)+extra.ap+support.ap+b7.ap):{ad:0,ap:0};
  const source={...u,ad:(Number(u?.ad)||0)+(bonus?.ad||0)+extra.ad+b7.ad+midReward.ad,
   ap:(Number(u?.ap)||0)+(bonus?.ap||0)+extra.ap+support.ap+b7.ap+midReward.ap,mr:(Number(u?.mr)||0)+extra.mr,armor:(Number(u?.armor)||0)+(extra.armor||0),
   abilityHaste:(Number(u?.abilityHaste)||0)+support.abilityHaste+b7.abilityHaste,healShieldPower:(Number(u?.healShieldPower)||0)+support.healShieldPower+b7.healShieldPower,
    tenacity:(Number(u?.tenacity)||0)+b7.tenacity,omnivamp:(Number(u?.omnivamp)||0)+b7.omnivamp,physicalVamp:(Number(u?.physicalVamp)||0)+b7.physicalVamp};
  return elementalDragonStatsV452d3(source,u?.champ?this.teams[u.team]?.dragons:[]);
 }
 abilityCooldownV452d3(u,slot){return abilityCooldown(u,slot,this.elementalStatsV452d3(u).counts.hextech*ELEMENTAL_DRAKE_RULES_V452D3.hextech.abilityHaste);}
 // Idempotent objective ledger: a single camp spawn can grant one stack only.
 awardElementalDragonV452d3(team,type,{captureId=null,sourceId=null}={}){
  if(!['blue','red'].includes(team)||!Object.hasOwn(ELEMENTAL_DRAKE_RULES_V452D3,type))return {ok:false,reason:'dragon_invalido'};
  this.dragonCaptureLedgerV452d3??=[];
  if(captureId!=null&&this.dragonCaptureLedgerV452d3.some(x=>x.captureId===captureId))return {ok:false,reason:'captura_duplicada'};
  const quantity=1+this.teams[team].dragons.filter(x=>x===type).length;
  this.teams[team].dragons.push(type);
  const entry={schema:'coachlol.dragon.capture.v1',team,type,quantity,captureId,sourceId,
   patch:'26.21',mode:'SummonersRift',time:this.gameTime};
  this.dragonCaptureLedgerV452d3.push(entry);
  this.onElementalDragonCaptureV452d4();
  if(this.teams[team].dragons.length===4&&!this.teams[team].soulAt){
   this.teams[team].soulAt=this.gameTime||.000001;this.teams[team].soulTypeV452=type;
   this.event(`Alma do Dragão conquistada por ${team}; Ancião em 6 minutos.`);
  }
  return {ok:true,entry};
 }
 effectResolverV41(){return new EffectResolverV41(this);}
 applyEffectV41(target,type,options={}){return this.effectResolverV41().apply(typeof target==='string'?this.units.find(u=>u.id===target):target,type,options);}
 effectJournalForV41(team){if(!['blue','red'].includes(team))throw Error('perspectiva_inválida');return this.effectJournalV41.filter(e=>e.observedBy.includes(team)).map(({observedBy,sourceVisibleBy,targetVisibleBy,...e})=>({...e,sourceId:sourceVisibleBy?.includes(team)?e.sourceId:null,targetId:targetVisibleBy?.includes(team)?e.targetId:null}));}
 // Strictly centralized *resource commit*: no mana, cooldown or Smite charges are
 // consumed during queueing. Effects are separate tactical adapters (V4.1/V4.2).
 performActionV40({actorId,kind='skill',slot=null,type=null,targetId=null,point=null,
                   checkRange=true,requireVision=true,costOverride=null,cooldownOverride=null,
                   rangeOverride=null,source='direct',campId=null}={}){
  const u=this.units.find(v=>v.id===actorId),now=this.gameTime;
  if(!u||u.hp<=0||this.ended)return {ok:false,reason:'ator_indisponível'};
  if(!ACTION_KINDS_V40.includes(kind))return {ok:false,reason:'tipo_inválido'};
  const actionType=kind==='basic_attack'||kind==='jungle_attack'?'attack':kind==='flash'?'dash':kind==='skill'||kind==='recast'?'skill':kind==='summoner'?'summoner':'item';
  // Smite is a castable summoner spell during ordinary stun, root, silence,
  // airborne, charm etc. Only suppression / stasis (or death) prevent it.
  // This is independent of the generic skill/action CC lock.
  if(kind==='smite'||kind==='summoner'){
   // Summoner spells that are NOT movement actions remain available under ordinary CC.
   // Suppression and stasis block them; Flash remains a separate dash action below.
   const fx=this.effectResolverV41();
   if((u.stasisUntil||0)>now||fx.has(u,'stasis')||fx.has(u,'suppression'))return {ok:false,reason:'incapacitado_summoner'};
  }else if(!this.effectResolverV41().canAct(u,actionType).ok||(u.stunUntil||0)>now)return {ok:false,reason:'incapacitado'};
  const target=targetId?this.units.find(v=>v.id===targetId&&v.hp>0):null;
  if(targetId&&!target)return {ok:false,reason:'alvo_indisponível'};
  if(point&&(!Number.isFinite(point.x)||!Number.isFinite(point.y)))return {ok:false,reason:'ponto_inválido'};
  const lock=kind+':'+(slot||type||campId||'unknown');
  const key=u.id+'|'+lock;
  // State lock complements CD: duplicate commands in same simulated tick are rejected.
  if(this.actionLocksV40[key]===now)return {ok:false,reason:'ação_duplicada'};
  let cost=0,cd=0,cdField='',range=null,charges=0;
  if(kind==='skill'){
   if(!['Q','W','E','R'].includes(slot))return {ok:false,reason:'slot_inválido'};
   if(!(u.skillRanks?.[slot]>0))return {ok:false,reason:'não_aprendido'};
   const rule=abilityRule(u,slot);
   cost=costOverride??abilityCost(u,slot);cd=cooldownOverride??this.abilityCooldownV452d3(u,slot);
   if(u.items?.includes('actualizer')&&u.b7ActualizerUntil>now){
    cost*=ITEM_REMAINDER_RULES_V453_DEV69_B7.actualizer.manaCostMultiplier;
    if(slot!=='R')cd/=1+ITEM_REMAINDER_RULES_V453_DEV69_B7.actualizer.basicCdRate;
   }
   range=rangeOverride??rule.rangeByRank?.[Math.min((u.skillRanks[slot]||1)-1,rule.rangeByRank.length-1)]??rule.range;
   cdField='skillCds.'+slot;
  }else if(kind==='summoner'){
   const cfg=SUMMONER_CONFIG_V40[type];if(!cfg)return {ok:false,reason:'feitiço_inválido'};
   if(!this.hasSummonerV452d4Dev11(u,type))return {ok:false,reason:'feitiço_não_equipado'};
   [cdField,cd,range]=cfg;
   cd=hasteCooldown(cd,Number(u.summonerHaste)||0);
   if(['ignite','exhaust'].includes(type)&&!target)return {ok:false,reason:'alvo_obrigatório'};
   if(target&&['ignite','exhaust'].includes(type)&&target.team===u.team)return {ok:false,reason:'alvo_aliado'};
   if(target&&type==='heal'&&target.team!==u.team)return {ok:false,reason:'alvo_inimigo'};
  }else if(kind==='basic_attack'||kind==='jungle_attack'){
   cdField=kind==='basic_attack'?'attackAt':'jungleAttackAt';
   cd=cooldownOverride??this.basicAttackIntervalV452c(u);
   range=rangeOverride??((u.range||.035)*this.worldWidth);
  }else if(kind==='recast'){
   if(u.champ!=='Vex'||slot!=='R'||!u.vexMark||u.vexMark.until<now||!this.units.some(v=>v.id===u.vexMark.targetId&&v.hp>0))return {ok:false,reason:'recast_sem_marca'};
   cdField='recastLoggedAt';cd=0;range=null;
  }else if(kind==='tactical'){
   if(!type)return {ok:false,reason:'tática_inválida'};
   cdField='reactionCd';cost=costOverride??0;cd=cooldownOverride??0;
  }else if(kind==='flash'){
   if(!this.hasSummonerV452d4Dev11(u,'flash'))return {ok:false,reason:'flash_não_equipado'};
   if(!point||!this.walkable(point.x,point.y))return {ok:false,reason:'destino_inválido'};
   cdField='flashCd';cd=hasteCooldown(300,Number(u.summonerHaste)||0);range=rangeOverride??400;
  }else if(kind==='item'){
   if(!['zhonyas_hourglass','seekers_armguard','youmuus_ghostblade','randuins_omen'].includes(type)||!u.items?.includes(type))return {ok:false,reason:'item_indisponível'};
   if(type==='seekers_armguard'&&u.armguardSpentV453Dev37)return {ok:false,reason:'armaguarda_já_usada'};
   cdField=type==='zhonyas_hourglass'?'stasisCd':type==='seekers_armguard'?'armguardActiveAtV453Dev37':type==='randuins_omen'?'randuinsCdV453Dev31':'youmuusCdV453Dev29';
   cd=type==='seekers_armguard'?0:hasteCooldown(type==='zhonyas_hourglass'?120:type==='randuins_omen'?90:45,Number(u.itemHaste)||0);
  }else if(kind==='smite'){
   if(u.role!=='JG'||!u.junglePet||u.smiteCharges<=0)return {ok:false,reason:'smite_indisponível'};
   const camp=campId?this.camps.find(c=>c.id===campId&&c.alive):null;
   if(campId&&!camp)return {ok:false,reason:'monstro_indisponível'};
   // A camp-specific Smite may never bypass its 500-unit range, even via a
   // direct action with checkRange:false or during a paused contest.
   if(camp&&this.mapDistance(u,camp)>SMITE_CONTEST_RULES_V452D4_DEV9.range)return {ok:false,reason:'fora_de_alcance_smite'};
   cdField='smiteCd';cd=15;charges=1;
  }
  if(!Number.isFinite(cd)||cd<0||!Number.isFinite(cost)||cost<0)return {ok:false,reason:'spec_inválida'};
  const activeCD=kind==='skill'?(u.skillCds?.[slot]||0):(u[cdField]||0);
  if(activeCD>now+1e-9)return {ok:false,reason:'recarga',remaining:activeCD-now};
  if((u.mana||0)<cost)return {ok:false,reason:'mana'};
  if(target&&requireVision&&target.team!==u.team&&!this.visible(u.team,target))return {ok:false,reason:'alvo_oculto'};
  if(checkRange&&target&&range>0&&this.mapDistance(u,target)>range+1e-7)return {ok:false,reason:'fora_de_alcance',range};
  if(checkRange&&kind==='flash'&&this.mapDistance(u,point)>range+1e-7)return {ok:false,reason:'fora_de_alcance',range};
  if(checkRange&&['basic_attack','jungle_attack'].includes(kind)&&point&&this.mapDistance(u,point)>range+1e-7)return {ok:false,reason:'fora_de_alcance',range};
  // Validate all fields BEFORE mutation. The following cost/CD/charge commit is atomic.
  const previousMana=u.mana,previousCD=activeCD,previousCharges=u.smiteCharges;
  try{
   u.mana-=cost;
   // DEV53: Eternidade cura 25% do mana gasto na habilidade validada.
   // Não dá vida em cast recusado, ataques ou spell de custo zero.
   if(kind==='skill'&&cost>0&&u.items?.some(id=>id==='catalyst_of_aeons'||id==='rod_of_ages'))
    this.effectResolverV41().heal(u,cost*.25,u);
   if(kind==='skill'){u.skillCds??={Q:0,W:0,E:0,R:0};u.skillCds[slot]=now+cd;u.skillCd=u.skillCds[slot];}
   else u[cdField]=now+cd;
   if(charges){u.smiteCharges-=charges;u.smiteRecoveries??=[];u.smiteRecoveries.push(now+90);}
   this.actionLocksV40[key]=now;
   const observedBy=['blue','red'].filter(t=>t===u.team||this.canSeePoint(t,u));
   const entry={seq:++this.actionSequenceV40,round:this.round,time:now,actorId:u.id,team:u.team,
    kind,slot,type,targetId,point:point?{x:point.x,y:point.y}:null,campId,source,cost,
    cooldownEndsAt:now+cd,observedBy};
   this.actionJournalV40.push(entry);
   if(kind==='skill'&&u.items?.some(id=>id==='sheen'||id==='trinity_force'||id==='essence_reaver'||id==='lich_bane'||id==='iceborn_gauntlet'||id==='dusk_and_dawn')&&
      (u.spellbladeNextV453Dev29||0)<=now){u.spellbladeArmedUntilV453Dev29=now+10;}
   if(kind==='skill')this.onOffensiveCastV453Dev69B6(u,slot);
   if(kind==='skill'||kind==='summoner')this.onRemainderCastV453Dev69B7(u,slot,kind);
   if(kind==='skill'&&slot==='R'&&u.items?.includes('experimental_hexplate'))u.hexplateBuffUntilV453Dev69B4=now+ITEM_DEFENSE_RULES_V453_DEV69_B4.experimental_hexplate.ultimateBuffSeconds;
   if(kind==='skill'&&slot==='R'&&u.items?.includes('zekes_convergence'))u.zekeStormUntilV453Dev69B5=now+ITEM_SUPPORT_RULES_V453_DEV69_B5.zekes_convergence.duration;
   if(kind==='skill'&&slot==='R'&&this.soulTypeV452d2(u)==='cloud'&&
      (u.cloudSoulNextBoostAtV452d2||0)<=now){
    u.cloudSoulNextBoostAtV452d2=now+SOUL_RULES_V452D2.cloudUltimateCooldown;
    u.cloudSoulSpeedUntilV452d2=now+SOUL_RULES_V452D2.cloudUltimateSeconds;
   }
   return {ok:true,spentMana:cost,cooldownEndsAt:now+cd,seq:entry.seq};
  }catch(err){
   u.mana=previousMana;if(kind==='skill')u.skillCds[slot]=previousCD;else u[cdField]=previousCD;
   u.smiteCharges=previousCharges;delete this.actionLocksV40[key];
   return {ok:false,reason:'commit_falhou'};
  }
 }
 // Intent entry (pre-cast) stays PRIVATE to the issuing team. It cannot appear
 // in the opposite team's replay before the corresponding observed action.
 recordIntentV40(team,actorId,kind,payload={}){
  const u=this.units.find(v=>v.id===actorId&&v.team===team);
  if(!u)return {ok:false,reason:'sem_posse'};
  const entry={seq:++this.actionSequenceV40,round:this.round,time:this.gameTime,actorId,team,
   kind:'intent',intentKind:kind,payload:structuredCopy(payload),observedBy:[team]};
  this.actionJournalV40.push(entry);return {ok:true,seq:entry.seq};
 }
 // An enemy observer never receives targetId, movement point, hidden intentions or
 // unrevealed actions. Full journal is local-authority/debug data, NOT a PvP API.
 journalForV40(team){if(!['blue','red'].includes(team))throw Error('perspectiva_inválida');
  return this.actionJournalV40.filter(e=>e.team===team||e.observedBy.includes(team)).map(e=>e.team===team?{...e}:
   ({seq:e.seq,round:e.round,time:e.time,actorId:e.actorId,team:e.team,kind:e.kind,slot:e.slot,type:e.type}));
 }
 snapshotV40(){
  const omitted=new Set(['map','mask','rng','lanes','visionCache','_riftMaskCacheV452d4','_brushReference','_brushGroups']);
  const state={};for(const [key,value] of Object.entries(this))if(!omitted.has(key)&&typeof value!=='function')state[key]=structuredCopy(value);
  return {schema:'coachlol.snapshot.v4',version:'4.0.0',seed:this.seed,rngState:this.rng.getState(),state};
 }
 checkpointV40(){const snapshot=this.snapshotV40();const digest=checksumV40(snapshot);
  this.lastCheckpointV40={round:this.round,gameTime:this.gameTime,digest};return {...this.lastCheckpointV40};
 }
 static fromSnapshotV40(map,mask,snapshot){
  if(snapshot?.schema!=='coachlol.snapshot.v4'||snapshot?.version!=='4.0.0'||!snapshot.state||!Number.isInteger(snapshot.rngState))throw Error('snapshot_incompatível');
  const a=new Arena(map,mask,{seed:snapshot.seed,roundSeconds:snapshot.state.roundSeconds,decisionSeconds:snapshot.state.decisionSeconds,mode:snapshot.state.mode,riftMode:snapshot.state.riftV452d4?.mode||'standard',worldBounds:snapshot.state.worldBounds});
  for(const [key,value] of Object.entries(snapshot.state))if(!['map','mask','rng','lanes','visionCache'].includes(key))a[key]=structuredCopy(value);
  // Load V4.3 checkpoints without losing V4.4 temporal objective camps.
  const pit=map.objects.find(o=>o.id==='baron_pit');
  if(pit)for(const type of ['voidgrubs','herald'])if(!a.camps.some(c=>c.timerKey===type))
   a.camps.push({id:'camp_'+type+'_v44',objectId:'baron_pit',team:'neutral',timerKey:type,x:pit.x,y:pit.y,
    alive:false,respawnAt:0,spawnCycle:0,health:0,maxHealth:0,patience:100,leashState:'idle',
    aggroId:null,monsterAttackAt:0,exhaustedV44:a.gameTime>=OBJECTIVE_PHASES_V44[type].leave});
  a.objectiveLedgerV44??=[];a.teamfightLedgerV44??=[];a.smiteContestV452d4Dev9??=null;a.smiteContestDecidedV452d4Dev9??=[];a.dragonCaptureLedgerV452d3??=[];a.farmTelemetryV452??={blue:{},red:{},events:[]};a.farmTelemetryV452.events??=[];
  a.structureBurnV45??={};a.voidmiteSiegesV45??=[];a.heraldEyeV45??=null;a.heraldMercenariesV45??=[];
  for(const c of a.camps)if(c.timerKey==='voidgrubs'&&c.alive&&!Array.isArray(c.grubsV45)){
   const base=Math.max(1,Math.round((c.health||c.maxHealth||6807)/3));
   c.grubsV45=[0,1,2].map(id=>({id,hp:base,maxHp:base,alive:true,decayUntil:0,decayAmount:0}));
   c.health=c.grubsV45.reduce((n,g)=>n+g.hp,0);c.maxHealth=c.health;
  }
  for(const team of ['blue','red']){a.teams[team].voidgrubs??=0;a.teams[team].heralds??=0;}
  a.riftV452d4??={schema:'coachlol.rift-state.v1',mode:'standard',phase:'base',element:null,transformAt:null,transformDragonIndex:0,revision:0};
  a.riftBundlesV452d4??={};a.riftEventsV452d4??=[];a.riftBaseFeaturesV452d4??={};a.riftPlantTimersV452d4??={};a.riftScryerCyclesV452d4??={};a.riftVisionPulsesV452d4??=[];
  // V4.5.2d-4-dev7 snapshots lacked Scryer registry: adopt only newly added sites.
  if(!a.riftBaseFeaturesV452d4.scryers&&map.riftBaseFeaturesV452d4?.scryers)a.riftBaseFeaturesV452d4.scryers=structuredCopy(map.riftBaseFeaturesV452d4.scryers);a.riftHexChannelsV452d4??=[];a.riftHexCooldownsV452d4??={};delete a._riftMaskCacheV452d4;delete a._brushReference;delete a._brushGroups;
  a.postgameTimelineV452d4Dev7??={schema:'coachlol.postgame.timeline.v1',samples:[]};
  for(const u of a.units)a.postgameEntryV452d4Dev7(u);
  // Older snapshots have no state for dev38 item procs. Initialize without
  // reconstructing charges or extending previously elapsed cooldowns.
  for(const u of a.units){u.scoutBullseyeReadyAtV453Dev38??=0;u.doransCombatManaUntilV453Dev38??=0;u.energizeStacksV453Dev38??=0;}
  // Backward compatible with all prior checkpoint payloads.
  a.championProjectilesV453Dev42??=[];a.championProjectileSeqV453Dev42??=0;
  a.ireliaBladesV453Dev43??={};a.ireliaBladeHistoryV453Dev43??=[];a.projectileBarriersV453Dev43??=[];
  for(const u of a.units)u.ireliaMarkV453Dev42??=null;
  a.rng.setState(snapshot.rngState);a.visionCache={};return a;
 }
 // Executable diagnostics for simulations and reproducible match traces.
 // The returned array is empty when no state corruption has been detected.
 validateInvariants(){
  const errors=[];
  const numeric=(label,x,min=0,max=Infinity)=>{
   if(!Number.isFinite(x)||x<min-1e-5||x>max+1e-5)errors.push(`${label}: ${x}`);
  };
  numeric('gameTime',this.gameTime,0);
  if(this.units.length!==10)errors.push(`champions: ${this.units.length}`);
  for(const u of this.units){
   numeric(`${u.id} HP`,u.hp,0,u.maxHp);numeric(`${u.id} maximum HP`,u.maxHp,1);
   numeric(`${u.id} gold`,u.gold);numeric(`${u.id} CS`,u.cs);
   numeric(`${u.id} level`,u.level,1,18);numeric(`${u.id} XP`,u.xp);
   numeric(`${u.id} stasis timer`,u.stasisUntil||0);
   for(const e of u.statusEffectsV41||[]){if(!EFFECT_TYPES_V41[e.type]||!Number.isFinite(e.until)||!Number.isFinite(e.power)||e.power<0)errors.push(`${u.id}: efeito inválido ${e.type}`);}
   if(u.smiteCharges>2||u.smiteCharges<0)errors.push(`${u.id}: cargas de Golpear ${u.smiteCharges}`);
   if(u.plan&&(!Number.isInteger(u.plan.index)||u.plan.index<0||u.plan.index>u.plan.steps.length))errors.push(`${u.id}: índice de rota inválido`);
  }
  for(const c of this.camps){
   if(c.alive){numeric(`${c.id} HP`,c.health,0,c.maxHealth);numeric(`${c.id} maximum HP`,c.maxHealth,1);
    numeric(`${c.id} patience`,c.patience,0,100);
   }
   if(!['idle','engaged','soft','hard'].includes(c.leashState))errors.push(`${c.id}: estado de leash ${c.leashState}`);
  }
  for(const s of this.structures){numeric(`${s.id} HP`,s.hp,0,s.maxHp);}
  for(const c of this.camps){if(!Number.isFinite(c.health)||c.health<0||!Number.isFinite(c.maxHealth)||c.maxHealth<0)
   errors.push(`${c.id}: HP de objetivo inválido`);}
  if(this.ended&&!this.winner)errors.push('partida terminada sem vencedor');
  return errors;
 }
 event(text,team=null,kind='info',unitId=null,details=null){
  const actor=unitId?this.units.find(u=>u.id===unitId):null;
  const observedBy=actor?['blue','red'].filter(t=>t===actor.team||this.visible(t,actor)):[];
  const isPublic=kind==='death'||kind==='objective'&&/drag[aã]o|bar[aã]o|nashor|arauto|vastilarvas/i.test(text)&&/derrot|conquist|eliminad|abatid|morto/i.test(text);
  const e={id:'evt_'+(this.eventCounter=(this.eventCounter||0)+1),time:this.gameTime,tick:this.gameTime,round:this.round,text,team,kind,unitId,observedBy,public:isPublic};
  if(details&&typeof details==='object')Object.assign(e,details);
  this.events.unshift(e);this.events=this.events.slice(0,110);if(kind==='danger'||kind==='death'||kind==='encounter'||kind==='duel_request'){this.lastTacticalAlerts.unshift({time:this.gameTime,round:this.round,text,team,kind,unitId});this.lastTacticalAlerts=this.lastTacticalAlerts.slice(0,12)}}
 // A legal push is outer turret -> inner -> inhibitor turret -> inhibitor ->
 // both Nexus towers -> Nexus. Every lane may unlock the common Nexus guards.
 structureVulnerable(s){
  if(!s||!s.alive)return false;
  const alive=id=>this.structures.some(v=>v.id===id&&v.alive);
  if(s.type==='tower'&&s.lane!=='nexus'){
   if(s.id.endsWith('_t1'))return true;
   if(s.id.endsWith('_t2'))return !alive(s.id.replace('_t2','_t1'));
   if(s.id.endsWith('_t3'))return !alive(s.id.replace('_t3','_t2'))&&!alive(s.id.replace('_t3','_t1'));
  }
  if(s.type==='inhibitor')return !['t1','t2','t3'].some(t=>alive(`${s.team}_${s.lane}_${t}`));
  const opened=['top','mid','bot'].some(l=>!alive(`${s.team}_${l}_inhibitor`));
  if(s.lane==='nexus'&&s.type==='tower')return opened;
  if(s.type==='nexus')return opened&&!this.structures.some(v=>v.team===s.team&&v.type==='tower'&&v.lane==='nexus'&&v.alive);
  return false;
 }
 finishPreparation(){if(this.phase==='preparation'){this.phase='planning';this.processPurchaseQueues('blue');this.processPurchaseQueues('red');this.event('Preparação concluída. Comece a executar as ordens em janelas táticas.','blue','phase');}return this.phase;}
 pauseForDecision(kind,unitId,enemyId=null){if(this.pendingDecision)return false;this.pendingDecision={kind,unitId,enemyId,at:this.gameTime};return true;}
 answerDecision(){
  this.pendingDecision=null;
  // An encounter on the final execution tick must close the round after the
  // player responds. Otherwise phase='decision', remaining=0 deadlocks play.
  if(this.phase==='decision'&&this.executionRemaining===0)this.finishCompletedRound();
  else if(this.phase==='decision')this.phase='executing';
  return true;
 }
 // Project an object onto the actual lane polyline, never assume atlas (x,y) is on the line.
 lineProgress(line,p){let best=Infinity,at=0;for(let i=1;i<line.path.length;i++){
  const a=line.path[i-1],b=line.path[i],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy||1;
  const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/den,0,1),x=a.x+t*dx,y=a.y+t*dy;
  const d=(x-p.x)**2+(y-p.y)**2;if(d<best){best=d;at=(line.lens[i-1]+(line.lens[i]-line.lens[i-1])*t)/line.total;}
 }return at;}
 laneBlocker(minion){const line=this.lanes[minion.lane],forward=minion.team==='blue'?1:-1;
  // Dev25: during a movement tick, structures and their availability are static.
  // Build the expensive lane projections once per team/lane; do not persist the
  // cache across ticks or snapshots (tests and gameplay may mutate structures).
  const cache=this._laneBlockerCacheV452d4Dev25;
  const key=minion.team+':'+minion.lane;
  let candidates=cache?.get(key);
  if(!candidates){
   candidates=this.structures.filter(o=>o.alive&&o.team!==minion.team&&this.structureVulnerable(o)&&
    ((o.type==='tower'&&o.lane===minion.lane)||(o.type==='inhibitor'&&o.lane===minion.lane)||
     ((o.lane==='nexus'||o.type==='nexus')&&!this.structures.some(v=>v.team===o.team&&v.alive&&v.lane===minion.lane&&v.type!=='nexus'))))
    .map(o=>({s:o,p:this.lineProgress(line,o)}))
    .sort((a,b)=>forward*(a.p-b.p));
   cache?.set(key,candidates);
  }
  for(const entry of candidates)if(forward*(entry.p-minion.progress)>-.035)return entry;
  return null;
 }
 maskAt(layer,x,y){let ix=Math.floor(clamp(x,0,.999)*this.mask.size),iy=Math.floor(clamp(y,0,.999)*this.mask.size);return this.riftMaskV452d4(layer)?.[iy*this.mask.size+ix]==='1'}
 walkable(x,y){return x>=.019&&x<=.978&&y>=.019&&y<=.978&&!this.maskAt('wall',x,y)}
 obstacleLine(a,b){const steps=Math.max(2,Math.ceil(dist(a,b)*130));for(let i=1;i<steps;i++){let f=i/steps;if(!this.walkable(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f))return true}return false}
 lineOfSight(a,b){
  const steps=Math.max(2,Math.ceil(dist(a,b)*155));
  const fromBrush=this.brushRegionAt(a.x,a.y),toBrush=this.brushRegionAt(b.x,b.y);
  // An intervening brush occludes what's *behind* it. A champion/ward in that
  // very brush may see outward. Simply checking whether the target is in
  // brush (the old code) incorrectly allowed seeing through brush boundaries.
  for(let i=1;i<steps;i++){
   const f=i/steps,x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;
   if(this.maskAt('wall',x,y))return false;
   const region=this.brushRegionAt(x,y);
   if(region&&region!==fromBrush){
    // Even a target behind a single intervening patch remains concealed.
    // Outside observers also cannot see into bushes without an interior source.
    if(!fromBrush||region!==toBrush)return false;
   }
  }
  return true;
 }
 // A* 128x128 cost grid derived from supplied wall mask; diagonal corner-cutting is forbidden.
 findPath(from,to){let N=this.mask.size,c=(v)=>clamp(Math.floor(v*N),0,N-1), sx=c(from.x),sy=c(from.y),ex=c(to.x),ey=c(to.y);
  const idx=(x,y)=>y*N+x;const goal=idx(ex,ey);if(!this.walkable(to.x,to.y))return null;
  const effectiveWall=this.riftMaskV452d4('wall');let blocked=(x,y)=>x<1||x>=N-1||y<1||y>=N-1||effectiveWall[idx(x,y)]==='1';
  if(blocked(sx,sy)){let found=null;for(let r=1;r<7&&!found;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(!blocked(sx+a,sy+b)){found=[sx+a,sy+b];break}if(found)[sx,sy]=found;else return null;}
  const start=idx(sx,sy),len=N*N,g=new Float32Array(len);g.fill(Infinity);g[start]=0;const parent=new Int32Array(len);parent.fill(-1);const closed=new Uint8Array(len),heap=[];
  const h=(x,y)=>Math.hypot(ex-x,ey-y);function push(id,score){heap.push([id,score]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][1]<=heap[k][1])break;[heap[k],heap[p]]=[heap[p],heap[k]];k=p}}function pop(){const root=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){let l=i*2+1,r=l+1,m=i;if(l<heap.length&&heap[l][1]<heap[m][1])m=l;if(r<heap.length&&heap[r][1]<heap[m][1])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return root[0]}
  push(start,h(sx,sy));let visits=0,found=false;while(heap.length&&visits++<25000){let id=pop();if(closed[id])continue;closed[id]=1;if(id===goal){found=true;break}let x=id%N,y=Math.floor(id/N);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;let xx=x+dx,yy=y+dy;if(blocked(xx,yy)||(dx&&dy&&(blocked(x+dx,y)||blocked(x,y+dy))))continue;let next=idx(xx,yy),ng=g[id]+(dx&&dy?1.414:1)+(this.mask.routes[next]==='1'?-.18:0);if(ng<g[next]){g[next]=ng;parent[next]=id;push(next,ng+h(xx,yy));}}}
  if(!found)return null;let indices=[],it=goal;while(it!==start&&it>=0&&indices.length<2000){indices.push(it);it=parent[it]}indices.reverse();let pts=indices.map(i=>({x:((i%N)+.5)/N,y:(Math.floor(i/N)+.5)/N}));if(pts.length)pts[pts.length-1]={...to};return compress(pts);
 }
 wardActive(w){return (w.until===null||w.until===undefined||w.until>this.gameTime)&&(w.hp===undefined||w.hp>0);}
 wardRadius(w){return (WARD_RULES_2026[w.type||'stealth']?.vision||900)/this.worldWidth*(w.faelightSiteId&&w.faelightUntil>this.gameTime?1.25:1);}
 // A live control ward is not disabled by an opposing control ward. Other
 // wards lose BOTH ordinary vision and their Faelight bonus while suppressed.
 // Reuse one predicate for fog and bonus-region visibility to avoid leaks.
 wardVisionSuppressedV452d4Dev26(w,enemyControls=null){
  if(!this.wardActive(w)||(w.disabledUntil||0)>this.gameTime)return true;
  if(w.type==='control')return false; // control wards are not disabled by other controls or sweeps
  // Oracle drone is a radial electronic scan: terrain and brush do not block it.
  // A lingering scan cannot persist past the 2-second tail after leaving range.
  if(this.oracleDetectsWardV452d4Dev28(w.team==='blue'?'red':'blue',w)||
     (w.oracleSuppressedUntilV452d4Dev28||0)>this.gameTime)return true;
  const detectors=enemyControls||this.wards.filter(e=>e.team!==w.team&&e.type==='control'&&this.wardActive(e)&&(e.disabledUntil||0)<=this.gameTime);
  return detectors.some(e=>e.team!==w.team&&e.id!==w.id&&this.mapDistance(e,w)<=WARD_RULES_2026.control.vision&&this.lineOfSight(e,w));
 }
 // Dev28: unlike control wards, the Oracle sweeper detects through geometry.
 // Detection does not grant normal terrain sight or permission to attack walls.
 oracleDetectsWardV452d4Dev28(team,w){
  return this.wardActive(w)&&this.units.some(u=>u.team===team&&u.hp>0&&u.deadUntil<=this.gameTime&&
   u.oracleUntil>this.gameTime&&this.mapDistance(u,w)<=WARD_RULES_2026.oracle.radius);
 }
 // Update the two-second ward-disabling tail while the drone actually scans it.
 // The field is serialized with the ward; no mutable global detector cache.
 refreshOracleWardsV452d4Dev28(){
  for(const w of this.wards){
   if(w.type==='control'||!this.wardActive(w))continue;
   const enemy=w.team==='blue'?'red':'blue';
   if(this.oracleDetectsWardV452d4Dev28(enemy,w))
    w.oracleSuppressedUntilV452d4Dev28=Math.max(w.oracleSuppressedUntilV452d4Dev28||0,this.gameTime+2);
  }
 }
 wardKnownTo(team,w,sources=null){
  if(w.team===team)return true;
  if(!this.wardActive(w))return false;
  // The drone emits a silhouette even when fog or a wall blocks ordinary sight.
  if(this.oracleDetectsWardV452d4Dev28(team,w))return true;
  if(!this.canSeePoint(team,w,sources))return false;
  if(w.riftRevealedByV452d4?.[team]>this.gameTime)return true;
  if((w.type||'stealth')==='control')return true;
  return this.wards.some(own=>own.team===team&&own.type==='control'&&this.wardActive(own)&&
   (own.disabledUntil||0)<=this.gameTime&&this.mapDistance(own,w)<=WARD_RULES_2026.control.vision&&this.lineOfSight(own,w));
 }
 addWard(team,owner,point,type='stealth'){
  const u=this.units.find(v=>v.id===owner&&v.team===team);
  if(!u||u.hp<=0||!this.walkable(point.x,point.y)||this.mapDistance(u,point)>(type==='farsight'?ITEM_REMAINDER_RULES_V453_DEV69_B7.farsight.range:625))return {ok:false,reason:'Posição fora de alcance ou bloqueada.'};
  if(type==='stealth'&&u.role==='SUP'&&u.supportQuest>=400)type='support';
  if(type==='stealth'&&['oracle','farsight'].includes(u.trinket))return {ok:false,reason:'Troque o trinket na fonte para usar ward amarela.'};
  if(type==='farsight'&&u.trinket!=='farsight')return {ok:false,reason:'Equipe o trinket Sentinela Azul na fonte.'};
  if(type==='control'){
   if((u.controlWardStock||0)<1)return {ok:false,reason:'Compre uma sentinela de controle na fonte.'};
   const old=this.wards.find(w=>w.owner===owner&&w.type==='control');
   if(old)this.wards=this.wards.filter(w=>w!==old);
   u.controlWardStock--;
   const slot=u.items.indexOf('ward');if(slot>=0)u.items.splice(slot,1);
  }else{
   if(u.wardCharges<1)return {ok:false,reason:'Sem cargas de ward.'};
   u.wardCharges--;
   const max=WARD_RULES_2026[type==='farsight'?'farsight':'stealth'].limit;
   const existing=this.wards.filter(w=>w.owner===owner&&w.type!=='control').sort((a,b)=>a.createdAt-b.createdAt);
   if(existing.length>=max){const removed=new Set(existing.slice(0,existing.length-max+1));this.wards=this.wards.filter(w=>!removed.has(w));}
  }
  const duration=['control','farsight'].includes(type)?null:type==='support'?WARD_RULES_2026.support.duration:Math.round(90+30*Math.min(1,(this.units.reduce((sum,x)=>sum+x.level,0)/this.units.length-1)/17));
  const w={id:'ward_'+this.nextId++,owner,team,x:point.x,y:point.y,type,
   hp:type==='control'?4:type==='farsight'?1:3,maxHp:type==='control'?4:type==='farsight'?1:3,createdAt:this.gameTime,until:duration===null?null:this.gameTime+duration,disabledUntil:0};
  const site=['stealth','support','control','farsight'].includes(type)?this.riftAllFeaturesV452d4('faelights').find(f=>f.activationVerified===true&&Math.hypot(f.x-point.x,f.y-point.y)<=f.radius):null;
  if(site){
   this.wards=this.wards.filter(other=>!(other.team===team&&other.faelightSiteId===site.id));
   w.faelightSiteId=site.id;w.faelightUntil=this.gameTime+(site.bonusSeconds||45);
  }
  this.wards.push(w);this.postgameEntryV452d4Dev7(u).wardsPlaced++;
  this.event(`${u.champ} colocou ${type==='control'?'sentinela de controle':'sentinela'} (${duration===null?'permanente':duration+'s'}).`,team,'ward',owner);
  return {ok:true,ward:w};
 }
 revealWard(team,unitId,wardId){
  const u=this.units.find(v=>v.id===unitId&&v.team===team),w=this.wards.find(v=>v.id===wardId);
  if(!u||!w||w.team===team||!this.wardKnownTo(team,w))return {ok:false,reason:'Sentinela não revelada.'};
  if(this.mapDistance(u,w)>u.range*this.worldWidth)return {ok:false,reason:'Aproxime-se para atacar a sentinela.'};
  // A scan behind a wall gives a silhouette, not a wall-piercing basic attack.
  if(!this.lineOfSight(u,w))return {ok:false,reason:'Sentinela detectada, mas sem acesso para atacar através da parede.'};
  w.hp=Math.max(0,w.hp-(u.items?.includes('umbral_glaive')?ITEM_REMAINDER_RULES_V453_DEV69_B7.umbral_glaive.wardBonusHits:1));if(w.hp<=0){this.wards=this.wards.filter(v=>v!==w);this.creditGoldV452d4Dev7(u,(WARD_RULES_2026[w.type||'stealth']?.bounty||10),'ward_bounty');this.postgameEntryV452d4Dev7(u).wardsDestroyed++;this.event(`${u.champ} destruiu sentinela inimiga.`,team,'ward_destroy',u.id);}
  return {ok:true,destroyed:w.hp<=0,hp:w.hp};
 }
 // Trinkets are zero-cost, exclusive-slot purchases. No six-slot inventory occupancy.
 // Switching preserves the existing recharge timer, so it cannot reset cooldown.
 setTrinket(team,unitId,type){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  if(!u||!['stealth','oracle','farsight'].includes(type)||this.teams[team].ready||!['preparation','planning'].includes(this.phase))return {ok:false,reason:'Troca de trinket indisponível.'};
  const shop=this.map.objects.find(o=>o.id===team+'_spawn_shop');
  if(u.hp<=0||!shop||this.mapDistance(u,shop)>1125)return {ok:false,reason:'Troque o trinket somente na fonte.'};
  if((u.trinket||'stealth')===type)return {ok:false,reason:'Trinket já equipado.'};
  u.trinket=type;
  if(type==='oracle')u.wardCharges=0;
  else{u.oracleUntil=0;u.wardCharges=Math.max(0,Math.min(2,u.wardCharges||0));u.trinketNextChargeAt=Math.max(u.trinketNextChargeAt||0,this.gameTime+WARD_RULES_2026.oracle.cooldown);}
  this.event(`${u.champ} trocou trinket para ${type==='oracle'?'Lente Reveladora':type==='farsight'?'Sentinela Azul':'Ward Amarela'}.`,team,'purchase',u.id);
  return {ok:true,bought:true,trinket:type};
 }
 activateOracle(team,unitId){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  if(!u||u.hp<=0||(u.trinket||'stealth')!=='oracle'||u.oracleCd>this.gameTime||this.ended)return {ok:false,reason:'Lente reveladora indisponível.'};
  u.oracleUntil=this.gameTime+Math.max(WARD_RULES_2026.oracle.duration,this.roundSeconds); // adaptação: uma execução tática inteira
  u.oracleCd=this.gameTime+WARD_RULES_2026.oracle.cooldown;
  this.refreshOracleWardsV452d4Dev28();
  this.event(`${u.champ} ativou Lente Reveladora.`,team,'oracle',u.id);
  return {ok:true,until:u.oracleUntil};
 }
 applyCC(source,target,kind,seconds=1){
  const allowed=['stun','root','slow','knockup','suppression','fear','charm','taunt','silence','polymorph','sleep','blind','disarm','grounded'];
  if(!allowed.includes(kind))return {ok:false,reason:'cc_desconhecido'};
  const result=this.applyEffectV41(target,kind,{source,duration:seconds});
  if(result.ok)this.event(`${target.champ}: ${kind} até ${Math.ceil(result.until)}s.`,source?.team||null,'cc',target.id);
  return result;
 }
 displaceBy(source,target,kind,units=350){
  if(!source||!target||source.team===target.team)return {ok:false,reason:'Alvo inválido.'};
  if(kind==='knockback'){const result=this.pushChampionThroughTerrain(source,target,units);this.applyCC(source,target,'knockup',1);return {ok:true,...result};}
  return {ok:false,reason:'Deslocamento desconhecido.'};
 }
 visionSources(team){
  const sources=[];
  for(const u of this.units){if(u.team===team&&u.hp>0&&this.gameTime>=u.deadUntil)sources.push({x:u.x,y:u.y,r:u.role==='SUP'?.115:.10,kind:'champion'});}
  for(const m of this.minions){if(m.team===team&&m.hp>0&&m.spawnAt<=this.gameTime)sources.push({x:m.x,y:m.y,r:.060,kind:'minion'});}
  const enemyControls=this.wards.filter(e=>e.team!==team&&e.type==='control'&&this.wardActive(e)&&(e.disabledUntil||0)<=this.gameTime);
  const activeTeamWards=this.wards.filter(w=>w.team===team&&!this.wardVisionSuppressedV452d4Dev26(w,enemyControls));
  for(const w of activeTeamWards)sources.push({x:w.x,y:w.y,r:this.wardRadius(w),kind:'ward'});
  for(const s of this.structures){if(s.team===team&&s.alive)sources.push({x:s.x,y:s.y,r:.075,kind:'structure'});}
  // Faelight bonus regions must obey the same suppression as the parent ward.
  // Both the bonus region and the +25% ward radius expire with the temporary buff.
  const faelights=this.riftAllFeaturesV452d4('faelights');
  for(const w of activeTeamWards)if(w.faelightSiteId&&w.faelightUntil>this.gameTime){
   const site=faelights.find(f=>f.id===w.faelightSiteId);
   if(site)sources.push({x:site.x,y:site.y,r:0,kind:'faelight_region',site});
  }

  return sources;
 }
 // Connected brush components are derived from the author's mask.
 // A champion or a ward INSIDE the same brush can reveal that brush; a source
 // standing just outside cannot magically see through its concealment.
 brushRegionAt(x,y){
  const size=this.mask.size,raw=this.riftMaskV452d4('brush');
  if(this._brushReference!==raw){
   const groups=new Int32Array(size*size), queue=new Int32Array(size*size);let next=0;
   for(let start=0;start<raw.length;start++){
    if(raw[start]!=='1'||groups[start])continue;
    next++;let head=0,tail=0;queue[tail++]=start;groups[start]=next;
    while(head<tail){const pos=queue[head++],cx=pos%size,cy=(pos/size)|0;
     for(const delta of [[1,0],[-1,0],[0,1],[0,-1]]){
      const xx=cx+delta[0],yy=cy+delta[1];if(xx<0||yy<0||xx>=size||yy>=size)continue;
      const k=yy*size+xx;if(raw[k]==='1'&&!groups[k]){groups[k]=next;queue[tail++]=k;}
     }
    }
   }
   this._brushGroups=groups;this._brushReference=raw;
  }
  const ix=Math.floor(clamp(x,0,.999)*size),iy=Math.floor(clamp(y,0,.999)*size);
  return this._brushGroups[iy*size+ix]||0;
 }
 canSeePoint(team,point,sources=null){
  if(this.riftVisionPulsesV452d4.some(p=>p.team===team&&p.until>this.gameTime&&this.riftPulseContainsV452d4(p,point)))return true;
  const peers=sources||this.visionSources(team);
  const brush=this.brushRegionAt(point.x,point.y);
  return peers.some(p=>p.kind==='faelight_region'
   ?this.riftFaelightContainsV452d4(p.site,point)
   :dist(p,point)<=p.r&&this.lineOfSight(p,point)&&(!brush||this.brushRegionAt(p.x,p.y)===brush));
 }
 visible(team,target,sources=null){
  if(target.team===team)return true;
  // Attacks from concealed brush temporarily disclose the aggressor to the
  // defending team. Do not reveal a hidden champion before the actual cast/hit.
  if(target.revealedUntil?.[team]>this.gameTime&&target.hp>0)return true;
  return this.canSeePoint(team,target,sources);
 }
 // A perspective is a single logical observation. Derive its vision sources
 // once, not separately for every champion, minion, ward and jungle camp.
 // No persistent cache: same-tick mutations (wards, fog, bushes) remain visible.
 perspective(team){const sources=this.visionSources(team);const canSee=point=>this.canSeePoint(team,point,sources);return {round:this.round,time:this.gameTime,
  units:this.units.filter(u=>u.team===team||(u.hp>0&&this.visible(team,u,sources))).map(u=>u.team===team?u:({id:u.id,team:u.team,role:u.role,champ:u.champ,klass:u.klass,x:u.x,y:u.y,hp:u.hp,maxHp:u.maxHp,mana:u.mana,maxMana:u.maxMana,level:u.level})),
  minions:this.minions.filter(m=>m.team===team||this.visible(team,m,sources)),
  // Structures are public objectives: destroyed state and inhibitor respawn remain observable.
  structures:this.structures.map(s=>({...s})),
  // Never leak cleared/respawning neutral camps outside team vision.
  camps:this.camps.map(c=>{
   const seen=canSee(c), known=this.campKnowledge?.[team]?.[c.id];
   if(seen)return {...c,companions:undefined,onDeath:undefined,knownRespawnAt:c.alive?null:(c.respawnAt||null)};
   // A witnessed clear gives your team a clock; an unseen clear never exposes state.
   // Only epic objective captures are globally announced; never expose ordinary
   // camp timers when unseen. This is the same public clock for both teams.
   const epicPublic=['dragon','baron','herald','voidgrubs'].includes(c.timerKey);
   const announcedClear=epicPublic&&Number.isFinite(c.lastClearedAt)&&c.lastClearedAt>=0;
   const publicRespawn=announcedClear&&Number.isFinite(c.respawnAt)&&c.respawnAt>this.gameTime&&c.respawnAt<Number.MAX_SAFE_INTEGER
    ?c.respawnAt:null;
   return {id:c.id,timerKey:c.timerKey,x:c.x,y:c.y,alive:null,unknown:true,
    publicObjective:epicPublic,
    knownRespawnAt:publicRespawn||(known?.respawnAt>this.gameTime?known.respawnAt:null)};
  }),
  wards:this.wards.filter(w=>w.team===team||this.wardKnownTo(team,w,sources)).map(w=>w.team===team?{...w}:{id:w.id,team:w.team,type:w.type,x:w.x,y:w.y,hp:w.hp,maxHp:w.maxHp}),
  team:{kills:this.teams[team].kills,dragons:[...this.teams[team].dragons],baronUntil:this.teams[team].baronUntil,elderUntil:this.teams[team].elderUntil,
   voidgrubs:this.teams[team].voidgrubs||0,heralds:this.teams[team].heralds||0,
   heraldEye:this.units.filter(u=>u.team===team&&u.trinket==='herald_eye').map(u=>({id:u.id,expiresAt:u.heraldEyeExpiresAtV45})),
   heraldMercenaries:this.heraldMercenariesV45.filter(h=>h.team===team||canSee(h)).map(h=>({id:h.id,team:h.team,x:h.x,y:h.y,lane:h.lane,hp:h.hp,maxHp:h.maxHp,charges:h.charges}))},
  objectiveLedger:(this.objectiveLedgerV44||[]).filter(o=>o.owner===team).map(o=>({...o,damageByActor:Object.fromEntries(Object.entries(o.damageByActor||{}).filter(([id])=>id.startsWith(team+'_')))})).slice(-20),
  teamfights:(this.teamfightLedgerV44||[]).filter(f=>f.observedBy.includes(team)).map(f=>({at:f.at,lastAt:f.lastAt,pit:f.pit,hits:f.hits})).slice(-12),
  events:this.events.filter(e=>e.team===team||e.public||e.observedBy?.includes(team)||(!e.team&&!e.unitId)).slice(0,24)};}
 // Skill ranks are physical game state, not a cosmetic QWER selection.
 upgradeSkill(team,unitId,slot){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  slot=String(slot||'').toUpperCase();
  if(!u||this.teams[team].ready||this.phase==='executing'||this.phase==='decision'||!SKILL_SLOTS.includes(slot))return {ok:false,reason:'Upgrade indisponível agora.'};
  if(!u.skillPoints||u.hp<=0)return {ok:false,reason:'Sem pontos disponíveis ou campeão eliminado.'};
  if((u.skillRanks[slot]||0)>=skillRankCap(u,slot))return {ok:false,reason:slot==='R'?'Ultimate bloqueada: nível 6/11/16 (salvo kits especiais).':'Rank máximo para o nível atual.'};
  u.skillRanks[slot]++;u.skillPoints--;this.event(`${u.champ}: ${slot} nível ${u.skillRanks[slot]}.`,team,'skill_up',u.id);return {ok:true};
 }
 // A skill build is a persistent, deterministic plan. Manual upgrades remain valid.
 // Opening learns each selected basic spell once, subsequent stages target an exact rank.
 // Conventional R is prioritized at levels 6/11/16, Udyr's R is a basic stance.
 autoSpendSkills(u){if(!u.autoLevelSkills)return;
  for(let guard=0;guard<25&&u.skillPoints>0;guard++){
   const rank=slot=>u.skillRanks?.[slot]||0;
   const can=slot=>rank(slot)<skillRankCap(u,slot);
   const preferred=u.skillBuild;
   let choice=null;
   if(u.champ!=='Udyr'&&!SPECIAL_R_FROM_LEVEL_ONE.has(u.champ)&&can('R'))choice='R';
   if(!choice&&preferred){
    // Learn each opening skill once, in the requested order. At level 1-3,
    // this prevents an optimizer from starving W/E in favour of Q.
    choice=(preferred.opening||[]).find(slot=>rank(slot)===0&&can(slot));
    if(!choice){
     const stage=(preferred.phases||[]).find(step=>rank(step.slot)<step.target);
     if(stage&&can(stage.slot))choice=stage.slot;
     // Do not bypass an unfinished phase with a later phase just because of
     // a temporary rank cap: spend a legal fallback and resume next level.
     if(!choice){
      const fallback=[...(preferred.priority||u.skillPriority||['Q','E','W']),...['Q','W','E']];
      choice=fallback.find(slot=>can(slot));
     }
    }
   }
   if(!choice){const priority=u.skillPriority||['Q','E','W'];choice=priority.find(slot=>can(slot));}
   if(!choice)break;
   u.skillRanks[choice]++;u.skillPoints--;
   this.event(`${u.champ}: auto-up ${choice} ${u.skillRanks[choice]}.`,u.team,'skill_up',u.id);
  }
 }
 setSkillPlan(team,unitId,{priority,auto,opening,phases,autoR=true}={}){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  if(!u||this.teams[team].ready||this.phase==='executing'||this.phase==='decision')return false;
  const normalize=list=>Array.isArray(list)?[...new Set(list.map(v=>String(v).toUpperCase()))]:[];
  const allowed=u.champ==='Udyr'?['Q','W','E','R']:['Q','W','E'];
  if(priority){const unique=normalize(priority);if(!unique.length||unique.some(v=>!allowed.includes(v)))return false;
   u.skillPriority=[...unique,...allowed.filter(k=>!unique.includes(k))];}
  if(opening||phases){
   const first=opening?normalize(opening):[...u.skillPriority];
   if(!first.length||first.some(slot=>!allowed.includes(slot)))return false;
   const stages=phases||u.skillPriority.map(slot=>({slot,target:5}));
   if(!Array.isArray(stages)||stages.some(step=>!step||!allowed.includes(String(step.slot).toUpperCase())||!Number.isInteger(step.target)||step.target<1||step.target>(u.champ==='Udyr'?6:5)))return false;
   const all=[...first,...allowed.filter(k=>!first.includes(k))];
   u.skillBuild={opening:all,phases:stages.map(step=>({slot:String(step.slot).toUpperCase(),target:step.target})),priority:[...u.skillPriority],autoR:!!autoR};
  }else if(priority){u.skillBuild=null;}
  if(auto!==undefined)u.autoLevelSkills=!!auto;
  this.autoSpendSkills(u);return true;
 }
 // Policies and multi-stage plans are locked per team, but survive every resolution until completion.
 setPolicy(team,unitId,policy){const u=this.units.find(v=>v.id===unitId&&v.team===team);if(!u||(this.teams[team].ready&&this.phase!=='decision')||!['safe','balanced','aggressive'].includes(policy))return false;u.policy=policy;return true;}
 setReaction(team,unitId,reaction){
  const u=this.units.find(v=>v.id===unitId&&v.team===team),profile=REACTIONS.find(v=>v.id===reaction);
  if(!u||!profile||this.teams[team].ready)return false;
  u.reaction=profile.id;u.policy=profile.policy;return true;
 }
 setAutomation(team,unitId,options={}){const u=this.units.find(v=>v.id===unitId&&v.team===team);if(!u||this.teams[team].ready)return false;
  for(const key of ['autoFarm','autoAttack','autoFollow','autoRespond','autoJungle'])if(Object.prototype.hasOwnProperty.call(options,key)){
   // autoFollow preference may be configured, but never releases explicit holds or routes.
   u[key]=!!options[key];if(key==='autoFollow'&&u.autoFollow&&!u.explicitOrder)u.manualMoveHold=false;
  }return true;
 }
 // Visible approaches have a tactical response window. Concealed attacks
 // from brush/fog may land first without a victim-side approval dialog.
 // The attacker must see the victim; gank/roam alone never grant immunity to
 // the normal confrontation flow. This is an RTS/turn-based adaptation.
 duelKey(a,b){return [a.id,b.id].sort().join('/');}
 duelPermission(attacker,defender,bypass=false){
  if(!attacker?.champ||!defender?.champ||attacker.team===defender.team||attacker.hp<=0||defender.hp<=0)return false;
  if(!this.visible(attacker.team,defender))return false; // fog protects targeting, not consent
  const key=this.duelKey(attacker,defender);let req=this.duelRequests[key];
  if(req?.state==='ready'&&this.gameTime>req.until){delete this.duelRequests[key];req=null;}
  if(!req){
   const hidden=!this.visible(defender.team,attacker);
   req={key,initiator:attacker.id,responder:defender.id,createdAt:this.gameTime,
    state:hidden?'surprise':'engaged',response:null,firstHitAt:null,reactionAt:null,until:0};
   this.duelRequests[key]=req;
  }
  // No player may veto a legal cast/attack. Reaction is only offered AFTER impact.
  return true;
 }
 processAmbushResponses(){
  for(const req of Object.values(this.duelRequests)){
   if(!['surprise','engaged','pending'].includes(req.state)||req.firstHitAt==null||this.gameTime<=(req.reactionAt??req.firstHitAt))continue;
   const victim=this.units.find(u=>u.id===req.responder),attacker=this.units.find(u=>u.id===req.initiator);
   if(!victim||victim.hp<=0||!attacker||attacker.hp<=0){delete this.duelRequests[req.key];continue;}
   req.state='pending';req.createdAt=this.gameTime-1;
   // PvP: both teams belong to humans. Never auto-resolve the RED player's
   // reaction merely because historical bot simulations only paused BLUE.
   // Keep the old blue-only pause for bot mode to preserve pacing/farm tests.
   if(victim.team==='blue'||this.mode==='pvp'){
    const type=req.concealedOpener?'pickoff_reaction':'combat_reaction';
    if(this.pauseForDecision(type,victim.id,attacker.id)){
     this.event(`${victim.champ} foi atingido por ${attacker.champ}. Escolha sua reação e combo.`,victim.team,'danger',victim.id);
     return;
    }
   }else if(victim.autoRespond){
    const defensive=['defend','heal','shield','peel_adc','guard_carry','frontline','anti_dive','retreat','disengage','kite'].includes(victim.reaction);
    this.respondToDuel(victim.team,victim.id,defensive?'defend':'fight');
   } // An explicitly controlled red defender may respond later; no veto.
  }
 }
 respondToDuel(team,unitId,response){
  if(!['defend','heal','peel','fight','retreat'].includes(response))return false;
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  const request=Object.values(this.duelRequests).find(r=>r.responder===unitId&&r.state==='pending');
  if(!u||!request||u.hp<=0)return false;
  request.response=response;request.state='ready';request.until=this.gameTime+14;
  if(['defend','heal','peel'].includes(response))u.shield=Math.max(u.shield,55+u.level*4);
  if(response==='heal'){this.effectResolverV41().heal(u,40+u.level*5,u);}
  if(response==='peel'){const carry=this.units.find(a=>a.team===team&&a.role==='ADC'&&a.hp>0);if(carry)carry.shield=Math.max(carry.shield,60+u.level*4);}
  if(response==='retreat')this.requestRetreatV453Dev45(team,u.id);
  this.event(`${u.champ} respondeu ao duelo: ${response}.`,team,'duel_ready',unitId);if(this.pendingDecision?.kind==='duel_request'&&this.pendingDecision.unitId===unitId)this.answerDecision();return true;
 }
 // Reaction intent may be submitted only for the actual defender in a paused
 // combat window. It never overwrites the champion's persistent planning order.
 queueReactionCombo(team,unitId,targetId,steps,{response='fight',chase=false}={}){
  const decision=this.pendingDecision;
  if(this.phase!=='decision'||!decision||!['combat_reaction','pickoff_reaction'].includes(decision.kind)||
    decision.unitId!==unitId)return {ok:false,reason:'Sem janela legítima de reação.'};
  // V4.5.2b: o agressor que criou a janela NÃO limita o alvo do contra-ataque.
  // Qualquer inimigo visível, vivo e próximo pode ser focado pelo defensor.
  const u=this.units.find(x=>x.id===unitId&&x.team===team),target=this.units.find(x=>x.id===targetId&&x.team!==team);
  if(!u||!target||u.hp<=0||target.hp<=0)return {ok:false,reason:'Alvo ou defensor indisponível.'};
  if(target.id!==decision.enemyId&&!this.visible(team,target))return {ok:false,reason:'Alvo alternativo não visível.'};
  if(target.id!==decision.enemyId&&this.mapDistance(u,target)>1800)
   return {ok:false,reason:'Alvo alternativo longe demais do confronto.'};
  if(!['fight','defend','retreat','peel'].includes(response)||!Array.isArray(steps)||steps.length>12||steps.some(x=>!['Q','W','E','R','FLASH','IGNITE','EXHAUST','HEAL','BARRIER','GHOST','CLEANSE'].includes(x)))return {ok:false,reason:'Combo de reação inválido.'};
  for(const slot of steps){
   if(['Q','W','E','R'].includes(slot)&&!(u.skillRanks?.[slot]>0))return {ok:false,reason:slot+' não aprendida.'};
   if(['FLASH','IGNITE','EXHAUST','HEAL','BARRIER','GHOST','CLEANSE'].includes(slot)&&!this.hasSummonerV452d4Dev11(u,slot.toLowerCase()))return {ok:false,reason:slot+' não equipado.'};
  }
  // A resposta encerra o pedido do agressor REAL, não um duelo inventado com o novo alvo.
  const duel=Object.values(this.duelRequests).find(r=>r.responder===u.id&&r.initiator===decision.enemyId&&r.state==='pending');
  if(duel&&!this.respondToDuel(team,u.id,response))return {ok:false,reason:'Reação indisponível.'};
  else if(!duel&&response==='retreat'){u.policy='safe';u.retreatUntil=this.gameTime+12;}
  else if(!duel&&response==='defend')u.shield=Math.max(u.shield,55+u.level*4);
  u.reactionCombo=steps.length?{kind:'attack',targetId,combatStyle:'combo',combo:[...steps],comboIndex:0,
   comboNextAt:this.gameTime+1,comboStatus:'resposta programada',chase:!!chase&&response==='fight',expiresAt:this.gameTime+this.roundSeconds+12}:null;
  this.event(`${u.champ} preparou ${steps.length} etapa(s) de reação.`,team,'reaction',u.id);
  this.answerDecision();return {ok:true};
 }
 hasBaronV452(u){return !!u?.champ&&u.hp>0&&(u.baronBuffUntilV452||0)>this.gameTime;}
 baronChampionBonusV452d4Dev14(u){
  if(!this.hasBaronV452(u)||!Number.isFinite(u.baronCapturedAtV452d4Dev14))return null;
  return baronChampionBonusAtV452d4Dev14(u.baronCapturedAtV452d4Dev14);
 }
 grantBaronV452d4Dev14(owner){
  if(!['blue','red'].includes(owner))return {ok:false,reason:'equipe_invalida'};
  const until=this.gameTime+OBJECTIVE_BUFF_RULES_V452.baronSeconds;
  this.teams[owner].baronUntil=until;
  const holders=[];
  for(const u of this.units){if(u.team!==owner||u.hp<=0)continue;
   u.baronBuffUntilV452=until;u.baronCapturedAtV452d4Dev14=this.gameTime;holders.push(u.id);
  }
  return {ok:true,until,holders,bonus:baronChampionBonusAtV452d4Dev14(this.gameTime)};
 }
 grantElderV452d4Dev14(owner){
  if(!['blue','red'].includes(owner))return {ok:false,reason:'equipe_invalida'};
  const until=this.gameTime+OBJECTIVE_BUFF_RULES_V452.elderSeconds;
  this.teams[owner].elderUntil=until;
  const holders=[];
  for(const u of this.units){if(u.team!==owner||u.hp<=0)continue;
   u.elderBuffUntilV452=until;holders.push(u.id);
  }
  return {ok:true,until,holders};
 }
 hasElderV452(u){return !!u?.champ&&u.hp>0&&(u.elderBuffUntilV452||0)>this.gameTime;}
 baronMinionAuraV452(minion){
  return this.units.some(u=>u.team===minion.team&&this.hasBaronV452(u)&&
   this.mapDistance(u,minion)<=OBJECTIVE_BUFF_RULES_V452.baronAuraRadius);
 }
 // V4.5.2d: authoritative, ephemeral minion-type modifiers (never mutate the
 // base minion record; aura is recomputed from living Baron holders each tick).
 // Known per-type effects, with explicit training approximations for damage reduction.
 baronMinionModifiersV452d(minion){
  const empowered=this.baronMinionAuraV452(minion),type=minion.kind;
  if(!empowered)return {empowered:false,bonusRange:0,bonusAD:0,intervalMultiplier:1,
   incomingChampionMultiplier:1,incomingMinionMultiplier:1,buildingMultiplier:1};
  return {empowered:true,bonusRange:type==='siege'?750:type==='caster'?100:type==='melee'?75:0,
   bonusAD:type==='siege'?50:type==='caster'?20:0,
   intervalMultiplier:type==='siege'?2:type==='super'?.8:1,
   incomingChampionMultiplier:['melee','caster'].includes(type)?.50:1,
   incomingMinionMultiplier:type==='melee'?.15:1,
   buildingMultiplier:type==='siege'?2:1};
 }
 baronMinionAttackDamageV452d(minion,target){
  const mods=this.baronMinionModifiersV452d(minion);
  const building=['tower','inhibitor','nexus'].includes(target?.type);
  return ((minion.damage||0)+mods.bonusAD+(target?.kind?(target.hp||0)*(minion.kind==='melee'?.02:.035):0))*
   (target?.kind?1.30:target?.type?.6:1)*(building?mods.buildingMultiplier:1);
 }
 // The original burn hits at 0.25, 1.25 and 2.25 seconds. The 1s tactical
 // tick preserves total damage and three hits at t+1/+2/+3, not sub-tick VFX.
 elderBurnDamageV452d(at=this.gameTime){
  const rules=OBJECTIVE_BUFF_RULES_V452;
  const ratio=clamp((at-rules.elderBurnRampStart)/Math.max(1,rules.elderBurnRampEnd-rules.elderBurnRampStart),0,1);
  return (rules.elderBurnTotalMin+(rules.elderBurnTotalMax-rules.elderBurnTotalMin)*ratio)/3;
 }
 applyElderBurnV452d(victim,attacker){
  if(!victim?.champ||!attacker?.champ||victim.team===attacker.team||victim.hp<=0||!this.hasElderV452(attacker))return;
  const existing=victim.elderBurnV452d;
  // Refresh without accumulating separate simultaneous burn stacks.
  victim.elderBurnV452d={sourceId:attacker.id,nextAt:this.gameTime+1,
   // The ordinary public integer-time helpers remain for old replay contracts.
   // Active combat consumes the precise micro-tick below instead.
   preciseNextAtV452d4Dev18:this.gameTime+.25,
   remaining:3,power:this.elderBurnDamageV452d(),
   firstAppliedAt:existing?.firstAppliedAt??this.gameTime};
 }
 resolveElderBurnV452d(){
  for(const victim of this.units){
   const burn=victim.elderBurnV452d;
   if(!burn)continue;
   if(victim.hp<=0||burn.remaining<=0){victim.elderBurnV452d=null;continue;}
   if(burn.nextAt>this.gameTime)continue;
   const source=this.units.find(u=>u.id===burn.sourceId);
   // A previously inflicted burn survives death/expiration of its source,
   // but is not allowed to recursively re-apply itself.
   const ticks=Math.min(burn.remaining,1+Math.floor(this.gameTime-burn.nextAt));
   for(let i=0;i<ticks&&victim.hp>0;i++){
    this.damage(victim,burn.power,source||null,'true','elder_burn');
    burn.remaining--;
   }
   burn.nextAt+=ticks;
   if(!burn.remaining||victim.hp<=0)victim.elderBurnV452d=null;
  }
 }
 // V4.5.2d-4-dev18: exact timestamps INSIDE each simulated second.
 // We do not increase global tick frequency or trigger animation/render updates.
 // All events are derived from deterministic champion state and snapshotted.
 advanceElderSubticksV452d4Dev18(throughTime){
  if(!Number.isFinite(throughTime))throw Error('elder_subtick_time_invalid');
  this.elderSubtickLedgerV452d4Dev18??=[];
  let processed=0;
  while(processed<128){
   const pending=[];
   for(const victim of this.units){
    const burn=victim.elderBurnV452d;
    if(burn&&victim.hp>0&&burn.remaining>0){
     const at=burn.preciseNextAtV452d4Dev18??burn.nextAt;
     if(at<=throughTime+1e-8)pending.push({at,kind:'burn',victim});
    }
    const mark=victim.elderPendingV452;
    if(mark){const at=mark.preciseAtV452d4Dev18??mark.at;
     if(at<=throughTime+1e-8)pending.push({at,kind:'execute',victim});}
   }
   if(!pending.length)break;
   pending.sort((a,b)=>a.at-b.at||((a.kind==='burn'?0:1)-(b.kind==='burn'?0:1))||a.victim.id.localeCompare(b.victim.id));
   const task=pending[0],victim=task.victim,at=task.at;
   if(task.kind==='burn'){
    const burn=victim.elderBurnV452d;
    if(!burn)continue;
    const source=this.units.find(u=>u.id===burn.sourceId);
    const before=victim.hp;
    // Elder burn does not itself renew the burn or generate another execute.
    this.damage(victim,burn.power,source||null,'true','elder_burn');
    burn.remaining--;
    if(Number.isFinite(burn.preciseNextAtV452d4Dev18))burn.preciseNextAtV452d4Dev18+=1;
    burn.nextAt+=1;
    if(burn.remaining<=0||victim.hp<=0)victim.elderBurnV452d=null;
    this.elderSubtickLedgerV452d4Dev18.push({at:Math.round(at*100)/100,kind:'burn',victimId:victim.id,
     sourceId:burn.sourceId,damage:Math.round((before-victim.hp)*100)/100});
   }else{
    const mark=victim.elderPendingV452;
    if(!mark)continue;
    victim.elderPendingV452=null;
    const source=this.units.find(u=>u.id===mark.sourceId);
    const canExecute=!!source&&this.hasElderV452(source)&&victim.hp>0&&victim.team!==source.team&&
     victim.hp/Math.max(1,victim.maxHp)<OBJECTIVE_BUFF_RULES_V452.elderExecuteFraction&&
     !(victim.stasisUntil>at)&&!this.effectResolverV41().has(victim,'invulnerable')&&
     !this.effectResolverV41().has(victim,'stasis');
    const before=victim.hp;
    if(canExecute){this.damage(victim,victim.hp+1,source,'true','elder_execute');
     this.event('Dragão Ancião: execução de '+victim.champ+'.',source.team,'elder_execute',source.id);}
    this.elderSubtickLedgerV452d4Dev18.push({at:Math.round(at*100)/100,kind:'execute',victimId:victim.id,
     sourceId:mark.sourceId,executed:!!(canExecute&&victim.hp===0),hpBefore:Math.round(before*100)/100});
   }
   processed++;
  }
  if(processed===128)throw Error('elder_subtick_overflow');
  if(this.elderSubtickLedgerV452d4Dev18.length>120)this.elderSubtickLedgerV452d4Dev18.splice(0,this.elderSubtickLedgerV452d4Dev18.length-120);
  return processed;
 }
 resolveElderPendingV452(){
  for(const victim of this.units){const mark=victim.elderPendingV452;
   if(!mark||mark.at>this.gameTime)continue;
   victim.elderPendingV452=null;
   const source=this.units.find(u=>u.id===mark.sourceId);
   if(!source||!this.hasElderV452(source)||victim.hp<=0||victim.team===source.team)continue;
   if(victim.hp/Math.max(1,victim.maxHp)>=OBJECTIVE_BUFF_RULES_V452.elderExecuteFraction)continue;
   if(victim.stasisUntil>this.gameTime||this.effectResolverV41().has(victim,'invulnerable')||this.effectResolverV41().has(victim,'stasis'))continue;
   this.damage(victim,victim.hp+1,source,'true','elder_execute');
   this.event('Dragão Ancião: execução de '+victim.champ+'.',source.team,'elder_execute',source.id);
  }
 }
 // The soul is permanent for a TEAM and survives champion death. All temporary
 // proc timers belong to individual champions and live in the snapshot.
 soulTypeV452d2(u){return u?.champ?this.teams[u.team]?.soulTypeV452||null:null;}
 // Deterministic damage-triggered procs. Never chain from a proc/DoT/rune or
 // trigger an action from a unit that is dead. Nearby targets must be observable.
 soulHitV452d2(attacker,target,sourceType){
  if(!attacker?.champ||!target||target.hp<=0||attacker.hp<=0||target.team===attacker.team||
    !['basic','spell'].includes(sourceType))return;
  const soul=this.soulTypeV452d2(attacker),now=this.gameTime,r=SOUL_RULES_V452D2;
  if(soul==='infernal'&&(attacker.soulProcAtV452||0)<=now){
   attacker.soulProcAtV452=now+r.infernalCooldown;
   const bonusAD=Math.max(0,(attacker.ad||0)-60),bonusHP=Math.max(0,attacker.maxHp-600);
   const power=100+.225*bonusAD+.135*(attacker.ap||0)+.0275*bonusHP;
   const type=bonusAD>(attacker.ap||0)?'physical':'magic';
   const victims=[target,...this.units.filter(v=>v.id!==target.id&&v.team!==attacker.team&&v.hp>0&&this.visible(attacker.team,v)&&this.mapDistance(v,target)<=r.infernalRadius)];
   for(const victim of victims)this.damage(victim,power,attacker,type,'soul_v452d2');
  }else if(soul==='hextech'&&(attacker.soulHexAtV452d2||0)<=now){
   attacker.soulHexAtV452d2=now+r.hextechCooldown;
   const victims=[target,...this.units.filter(v=>v.id!==target.id&&v.team!==attacker.team&&v.hp>0&&this.visible(attacker.team,v)&&this.mapDistance(v,target)<=r.hextechRadius)
    .sort((a,b)=>this.mapDistance(a,target)-this.mapDistance(b,target)||a.id.localeCompare(b.id)).slice(0,r.hextechChains)];
   for(const victim of victims){
    const damage=25+(Math.min(18,attacker.level)-1)*27.94/17;
    this.damage(victim,damage,attacker,'true','soul_v452d2');
    if(victim.hp>0)this.applyEffectV41(victim,'slow',{source:attacker,duration:r.hextechSlowSeconds,power:.35,key:'hextech_soul_'+attacker.id});
   }
  }else if(soul==='ocean'){
   const againstChampion=!!target.champ,scale=againstChampion?1:.30;
   const totalHeal=(150+.26*Math.max(0,(attacker.ad||0)-60)+.17*(attacker.ap||0)+.07*Math.max(0,attacker.maxHp-600))*scale;
   const totalMana=(100+.035*(attacker.maxMana||0))*scale;
   attacker.oceanSoulRestorationV452d2={nextAt:now+1,remaining:r.oceanSeconds,heal:totalHeal/r.oceanSeconds,mana:totalMana/r.oceanSeconds};
  }
 }
 advanceSoulEffectsV452d2(){
  const now=this.gameTime,r=SOUL_RULES_V452D2;
  for(const u of this.units){
   if(u.hp<=0){u.oceanSoulRestorationV452d2=null;continue;}
   const soul=this.soulTypeV452d2(u),rest=u.oceanSoulRestorationV452d2;
   if(soul==='ocean'&&rest&&rest.remaining>0&&rest.nextAt<=now){
    const ticks=Math.min(rest.remaining,Math.floor(now-rest.nextAt)+1);
    for(let j=0;j<ticks;j++){this.effectResolverV41().heal(u,rest.heal,u);u.mana=Math.min(u.maxMana,u.mana+rest.mana);}
    rest.remaining-=ticks;rest.nextAt+=ticks;if(!rest.remaining)u.oceanSoulRestorationV452d2=null;
   }
   if(soul==='mountain'&&now-(u.soulLastDamageAtV452d2??0)>=r.mountainRechargeSeconds){
    const active=this.effectResolverV41().list(u).some(e=>e.key==='mountain_soul_v452d2'&&e.type==='shield'&&e.power>0);
    if(!active){const strength=220+.16*Math.max(0,(this.elementalStatsV452d3(u).ad||0)-60)+.12*(this.elementalStatsV452d3(u).ap||0)+.12*Math.max(0,u.maxHp-600);
     this.applyEffectV41(u,'shield',{source:u,duration:3600,power:strength,key:'mountain_soul_v452d2'});}
   }
  }
 }
 soulMovementBonusV452d2(u){
  const soul=this.soulTypeV452d2(u);
  if(soul!=='cloud')return 0;
  return (u.cloudSoulSpeedUntilV452d2||0)>this.gameTime?.60:.15;
 }
 summonerSlotsV452d4Dev11(u){
  if(Array.isArray(u.summonerSlots)&&u.summonerSlots.length===2)return u.summonerSlots;
  return normalizeSummonerSlotsV452d4Dev11(u.role,null,u.smiteKey||'f');
 }
 hasSummonerV452d4Dev11(u,type){
  if(this.summonerSlotsV452d4Dev11(u).includes(type))return true;
  // Compatibility for historical unit tests that directly mutate summonerSpell.
  return u.summonerSpell!==u.summonerLegacyOriginalV452d4Dev11&&u.summonerSpell===type&&type!=='smite'&&type!=='flash';
 }
 equippedSummoner(u){return u.summonerSpell||(u.role==='JG'?'smite':u.role==='SUP'?'exhaust':u.role==='TOP'?'tp':u.role==='ADC'?'heal':'ignite');}
 // Summoner loadouts are immutable after loading a match. They are set in Champ Select.
 setSecondarySummoner(team,unitId,type){
  return {ok:false,reason:'Feitiços são escolhidos no Champ Select, antes de iniciar a partida.'};
 }
 // Symmetric rules, applied to BOTH teams after cooldown/mana checks.
 applyReaction(u){
  if(u.hp<=0||u.awaitingShop||u.reactionCd>this.gameTime)return;
  const reaction=u.reaction||'balanced';const allies=this.units.filter(a=>a.team===u.team&&a.hp>0&&a.id!==u.id);
  const enemies=this.units.filter(a=>a.team!==u.team&&a.hp>0&&this.visible(u.team,a));
  const near=(a,b,r)=>dist(a,b)<=r;
  const threatened=a=>enemies.some(e=>near(e,a,.095));
  const lowAllies=allies.filter(a=>near(a,u,.11)&&a.hp<a.maxHp*.8).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
  if(reaction==='heal'&&lowAllies.length&&u.mana>=40){const a=lowAllies[0];if(!this.performActionV40({actorId:u.id,kind:'tactical',type:'heal',costOverride:40,cooldownOverride:14,source:'automation'}).ok)return;this.effectResolverV41().heal(a,42+u.level*7,u);this.event(`${u.champ}: cura automática em ${a.champ}.`,u.team,'reaction',u.id);return;}
  if(reaction==='shield'&&u.mana>=30){const a=allies.filter(a=>near(a,u,.11)&&threatened(a)).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(a){if(!this.performActionV40({actorId:u.id,kind:'tactical',type:'shield',costOverride:30,cooldownOverride:14,source:'automation'}).ok)return;a.shield=Math.max(a.shield,58+u.level*5);return;}}
  if(['peel_adc','guard_carry','anti_dive'].includes(reaction)){
   const carry=reaction==='guard_carry'?allies.sort((a,b)=>(b.ad+b.ap*.6)-(a.ad+a.ap*.6))[0]:this.units.find(a=>a.team===u.team&&a.role==='ADC'&&a.hp>0);
   if(carry&&near(u,carry,.15)&&threatened(carry)&&u.mana>=30){if(!this.performActionV40({actorId:u.id,kind:'tactical',type:'guard_carry',costOverride:30,cooldownOverride:15,source:'automation'}).ok)return;carry.shield=Math.max(carry.shield,68+u.level*5);
    const threat=enemies.filter(e=>near(e,carry,.1)).sort((a,b)=>dist(a,carry)-dist(b,carry))[0];if(threat)threat.slowPercent=Math.max(threat.slowPercent||0,.18);
    this.event(`${u.champ}: proteção de ${carry.champ}.`,u.team,'reaction',u.id);return;}
  }
  if(['defend','frontline','counterengage','guard_objective'].includes(reaction)&&enemies.some(e=>near(e,u,.075))){u.shield=Math.max(u.shield,48+u.level*5);u.reactionCd=this.gameTime+12;return;}
  if(['kite','disengage'].includes(reaction)){
   const pursuer=enemies.find(e=>near(e,u,.070));if(pursuer&&u.mana>=25){if(!this.performActionV40({actorId:u.id,kind:'tactical',type:'disengage',costOverride:25,cooldownOverride:15,source:'automation'}).ok)return;pursuer.slowPercent=Math.max(pursuer.slowPercent||0,.2);return;}
  }
  if(reaction==='sustain'&&this.gameTime-u.lastHitAt>8&&u.hp/u.maxHp<.65&&u.mana>=25){if(!this.performActionV40({actorId:u.id,kind:'tactical',type:'sustain',costOverride:25,cooldownOverride:18,source:'automation'}).ok)return;this.effectResolverV41().heal(u,32+u.level*4,u);return;}
  if(reaction==='retreat'&&u.hp/u.maxHp<.30&&threatened(u)){u.shield=Math.max(u.shield,40);u.reactionCd=this.gameTime+14;return;}
  if(reaction==='vision'&&u.wardCharges>0&&enemies.some(e=>near(e,u,.115))&&!this.wards.some(w=>w.team===u.team&&near(w,u,.075))){this.addWard(u.team,u.id,{x:u.x,y:u.y});u.reactionCd=this.gameTime+90;return;}
  if(reaction==='farm'){u.autoFarm=true;}
 }
 setPlan(team,unitId,steps,policy){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);if(!u||this.teams[team].ready||this.ended||u.hp<=0)return {ok:false,reason:'Unidade indisponível'};
  if(!Array.isArray(steps)||!steps.length||steps.length>16)return {ok:false,reason:'Escolha de 1 a 16 etapas'};
  const legal=['move','farm','gank','fight','ward','jungle','objective','recall','wait','defend','roam','push'];
  let anchor={x:u.x,y:u.y}, normalized=[];
  for(const step of steps){
   if(!legal.includes(step.action||'move'))return {ok:false,reason:'Ação de etapa inválida'};
   if(!step.point||!Number.isFinite(step.point.x)||!Number.isFinite(step.point.y)||!this.walkable(step.point.x,step.point.y))return {ok:false,reason:'Ponto fora da malha navegável'};
   let path=this.findPath(anchor,step.point);if(!path)return {ok:false,reason:'Rota sem passagem entre etapas'};
   if(step.targetId){let e=this.units.find(v=>v.id===step.targetId&&v.team!==team);if(e&&!this.visible(team,e))return {ok:false,reason:'Não é possível fixar inimigo oculto'};}
   if(step.targetId&&['jungle','objective'].includes(step.action)){const camp=this.camps.find(c=>c.id===step.targetId);if(!camp)return {ok:false,reason:'Acampamento escolhido não existe.'};if(dist(camp,step.point)>.065)return {ok:false,reason:'Ponto distante do monstro selecionado.'};}
   normalized.push({point:{x:step.point.x,y:step.point.y},action:step.action||'move',duration:clamp(Number(step.duration)||0,0,180),targetId:step.targetId||(step.action==='jungle'?(this.camps.filter(c=>c.x&&c.y&&dist(c,step.point)<.035).sort((a,b)=>dist(a,step.point)-dist(b,step.point))[0]?.id||null):null),path:path.map(p=>({...p})),startedAt:null});anchor=step.point;
  }
  if(normalized.some(st=>st.action==='push')){u.autoFarm=true;u.autoAttack=true;}
  u.plan={steps:normalized,index:0,completed:false,createdAt:this.gameTime,loopJungle:normalized.every(st=>st.action==='jungle')};u.explicitOrder=true;u.order={kind:'route',spell:'none'};u.awaitingShop=false;u.recallProgress=0;
  if(policy)this.setPolicy(team,unitId,policy);
  this.orderHistory.unshift({id:'order_'+this.nextId++,unitId:u.id,team,time:this.gameTime,round:this.round,type:'plan',label:normalized.map(s=>s.action+(s.targetId?' '+s.targetId:'')).join(' → '),steps:normalized.map(s=>({point:s.point,action:s.action,targetId:s.targetId,duration:s.duration}))});this.orderHistory=this.orderHistory.slice(0,100);
  this.event(`${u.champ}: plano de ${steps.length} etapa(s) preparado.`,team);
  return {ok:true};
 }
 setOrder(team,unitId,order){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);if(!u||this.teams[team].ready||this.ended||u.hp<=0)return {ok:false,reason:'Unidade indisponível'};
  if(!order||typeof order.kind!=='string')return {ok:false,reason:'Ordem inválida'};
  if(order.targetId){const enemy=this.units.find(e=>e.id===order.targetId&&e.team!==team);if(enemy&&!this.visible(team,enemy))return {ok:false,reason:'Alvo oculto na fog'};}
  if(order.kind==='chase'&&!order.targetId)return {ok:false,reason:'Escolha um alvo para perseguir.'};
  if(order.kind==='attack'&&Array.isArray(order.combo)){
   if(order.combo.length>12||order.combo.some(slot=>!['Q','W','E','R','FLASH','IGNITE','EXHAUST','HEAL','BARRIER','GHOST','CLEANSE'].includes(slot)))return {ok:false,reason:'Combo inválido (máximo 12 etapas QWER e feitiços equipados).'};
   // Unlearned steps are allowed in a future tactical plan, but never cast before unlock.
   order={...order,combo:[...order.combo],comboIndex:0,comboNextAt:this.gameTime,comboStatus:'preparado'};
  }
  if(order.kind==='ward'){
   const p=order.destination;
   if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)return {ok:false,reason:'Clique em um ponto válido do mapa para wardar.'};
   if((order.wardType==='control'?(u.controlWardStock||0):u.wardCharges)<=0)return {ok:false,reason:'Este campeão está sem o tipo de sentinela escolhido.'};
   if(!this.walkable(p.x,p.y))return {ok:false,reason:'Ponto de sentinela bloqueado pela máscara.'};
   const path=this.mapDistance(u,p)>625?this.findPath(u,p):[];
   if(path===null)return {ok:false,reason:'Não existe um caminho até o ponto da sentinela.'};
   u.plan=null;u.explicitOrder=true;u.recallProgress=0;u.awaitingShop=false;u.laneFollowPath=[];
   u.order={kind:'ward',wardType:order.wardType||'stealth',destination:{x:p.x,y:p.y},wardPath:path||[],spell:'none'};
   return {ok:true};
  }
  if(order.kind==='move'||order.kind==='roam'||order.kind==='gank'||order.kind==='route'||order.kind==='jungle'||order.kind==='objective'){
   const pts=order.points?.length?order.points:(order.destination?[order.destination]:[]);
   if(pts.length){if(order.kind==='move'||order.kind==='route')u.manualMoveHold=true;const action=order.kind==='jungle'?'jungle':order.kind==='objective'?'objective':['roam','gank'].includes(order.kind)?'gank':'move';return this.setPlan(team,unitId,pts.map(point=>({point,action,duration:0})),order.policy);}
  }
  if(order.kind==='stop'){u.plan=null;u.explicitOrder=true;u.manualMoveHold=true;u.autoFollow=false;u.awaitingShop=false;u.order={kind:'hold',spell:'none'};return {ok:true};}
  // Returning from base does not silently resume lane-following. Only a new
  // explicit navigation command releases the shopping hold.
  if(order.kind==='recall'){u.awaitingShop=false;u.recallProgress=0;u.laneFollowPath=[];u.manualMoveHold=false;}
  else if(u.awaitingShop&&order.kind!=='auto'){u.awaitingShop=false;}
  // Replacing an order is deliberate. Passive policy/automation never deletes it.
  // Farm/push follow waves BY DESIGN; gank/route/jungle/hold never do.
  if(order.kind==='auto'){u.explicitOrder=false;u.manualMoveHold=false;u.autoFollow=true;u.plan=null;}
  else {u.explicitOrder=true;if(order.kind!=='skill'||order.interruptPlan)u.plan=null;}
  if(['farm','push'].includes(order.kind)){u.manualMoveHold=false;u.autoFollow=true;u.autoFarm=true;}
  if(['move','route','jungle','roam','objective','hold','attack','chase'].includes(order.kind))u.autoFollow=false;
  u.order={...order};
  this.orderHistory.unshift({id:'order_'+this.nextId++,unitId:u.id,team,time:this.gameTime,round:this.round,type:'order',label:order.kind,order:{...order}});this.orderHistory=this.orderHistory.slice(0,100);
  return {ok:true};
 }
 setGroupOrders(team,unitIds,orders){
  if(!Array.isArray(unitIds)||!unitIds.length||new Set(unitIds).size!==unitIds.length)return {ok:false,reason:'Seleção de aliados inválida.'};
  const members=unitIds.map(id=>this.units.find(u=>u.id===id&&u.team===team));
  if(members.some(u=>!u||u.hp<=0)||!Array.isArray(orders)||orders.length!==members.length)return {ok:false,reason:'Um dos campeões está indisponível.'};
  if(this.teams[team]?.ready||!['preparation','planning'].includes(this.phase))return {ok:false,reason:'Ordens bloqueadas durante a resolução.'};
  const before=members.map(u=>structuredCopy(u));const history=structuredCopy(this.orderHistory);
  for(let i=0;i<members.length;i++){
   const result=this.setOrder(team,members[i].id,orders[i]);
   if(!result.ok){for(let j=0;j<members.length;j++)Object.assign(members[j],before[j]);this.orderHistory=history;return result;}
  }
  return {ok:true,unitIds};
 }
 cancelChampionOrder(team,unitId){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  if(!u||this.teams[team].ready||['executing','decision','finished'].includes(this.phase))return {ok:false,reason:'Ordens bloqueadas nesta fase.'};
  u.plan=null;u.order={kind:'hold',spell:'none'};u.autoFollow=false;u.explicitOrder=true;u.manualMoveHold=true;
  this.orderHistory.unshift({id:'order_'+this.nextId++,unitId:u.id,team,round:this.round,time:this.gameTime,type:'cancel',label:'Ordem cancelada'});
  this.orderHistory=this.orderHistory.slice(0,100);this.event(u.champ+': ordem removida; posição mantida.',team,'order_change',u.id);
  return {ok:true};
 }
 // v3.5: interrupt-safe escapes and defensive item activations.
 // Inputs are in immutable map coordinates, not pixels. Permitted in the
 // reaction pause; no movement-plan replacement and no approval of an attack.
 castEscape(team,unitId,type,destination){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u||u.hp<=0||this.ended)return {ok:false,reason:'Campeão indisponível.'};
  if(!destination||!Number.isFinite(destination.x)||!Number.isFinite(destination.y)||!this.walkable(destination.x,destination.y))return {ok:false,reason:'Ponto final bloqueado.'};
  if(u.stasisUntil>this.gameTime||u.rootUntil>this.gameTime||u.groundedUntil>this.gameTime)return {ok:false,reason:'Controle de grupo impede deslocamento.'};
  const variants={flash:{range:400,cd:300,key:'flashCd'},Ezreal:{type:'E',range:475,cost:70,cd:26,key:'E'},Tristana:{type:'W',range:900,cost:30,cd:22,key:'W'}};
  const cfg=type==='flash'?variants.flash:(u.champ==='Ezreal'&&type==='E'?variants.Ezreal:u.champ==='Tristana'&&type==='W'?variants.Tristana:null);
  if(!cfg)return {ok:false,reason:'Escape não disponível nesse campeão.'};
  if(type!=='flash'&&(u.skillRanks?.[type]||0)<1)return {ok:false,reason:'Habilidade ainda não aprendida.'};
  const cd=type==='flash'?(u.flashCd||0):(u.skillCds?.[type]||0);
  if(cd>this.gameTime)return {ok:false,reason:'Escape em recarga.'};
  if(cfg.cost&&u.mana<cfg.cost)return {ok:false,reason:'Mana insuficiente.'};
  if(this.mapDistance(u,destination)>cfg.range+1)return {ok:false,reason:'Ponto fora do alcance de '+cfg.range+' unidades.'};
  const old={x:u.x,y:u.y};
  const cast=type==='flash'?this.performActionV40({actorId:u.id,kind:'flash',point:destination,source:'escape'}):
   this.performActionV40({actorId:u.id,kind:'skill',slot:type,point:destination,checkRange:false,costOverride:cfg.cost,cooldownOverride:hasteCooldown(cfg.cd,this.elementalStatsV452d3(u).abilityHaste+(u.basicHaste||0)),source:'escape'});
  if(!cast.ok)return cast;
  u.x=destination.x;u.y=destination.y;this.invalidateShopUndoOnDepartureV453Dev61(u);
  if(u.champ==='Tristana'&&type==='W')this.itemEnergizeRelocateV453Dev39(u,old,destination,{kind:'dash'});
  u.holdUntil=Math.max(u.holdUntil||0,this.gameTime+1);
  // The opponent's committed actions are still checked against their real
  // ranges. A defensive decision never retroactively cancels an earlier hit.
  const request=Object.values(this.duelRequests).find(r=>r.responder===u.id&&r.state==='pending');
  if(request){request.state='ready';request.response='escape';request.until=this.gameTime+4;}
  if(this.pendingDecision?.unitId===u.id&&['duel_request','pickoff_reaction','encounter'].includes(this.pendingDecision.kind))this.answerDecision();
  this.event(u.champ+' usou '+(type==='flash'?'Flash':u.champ+' '+type)+' para reposicionar.',team,'escape',unitId);
  return {ok:true,from:old,to:{x:u.x,y:u.y},remaining:cfg.cd};
 }
 activateStasis(team,unitId){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u||u.hp<=0||this.ended)return {ok:false,reason:'Campeão indisponível.'};
  const zhonya=u.items?.includes('zhonyas_hourglass');
  const armguard=u.items?.includes('seekers_armguard')&&!u.armguardSpentV453Dev37;
  if(!zhonya&&!armguard)return {ok:false,reason:'Nenhum item de estase disponível.'};
  if(zhonya&&(u.stasisCd||0)>this.gameTime)return {ok:false,reason:'Ampulheta em recarga.'};
  const type=zhonya?'zhonyas_hourglass':'seekers_armguard';
  const cast=this.performActionV40({actorId:u.id,kind:'item',type,source:'active_item'});if(!cast.ok)return cast;
  // A armaguarda permanece como item de atributos após sua ativação única.
  // Sua carga só é consumida depois do gate autoritativo aceitar o comando.
  if(type==='seekers_armguard'){
   u.armguardSpentV453Dev37=true;u.b7ArmguardEverUsed=true;
   const i=u.items.indexOf('seekers_armguard');
   if(i>=0){
    const old=catalog.find(v=>v.id==='seekers_armguard'),next=catalog.find(v=>v.id==='shattered_armguard');
    this.removeRabadonV43(u);this.applyItemStatsV43(u,old,-1);u.items[i]='shattered_armguard';this.applyItemStatsV43(u,next,1);this.reapplyRabadonV43(u);
   }
  }
  this.applyEffectV41(u,'stasis',{source:u,duration:2.5});
  this.event(u.champ+' ativou '+(zhonya?'a Ampulheta':'a Armaguarda')+' (estase).',team,'stasis',u.id);
  return {ok:true,itemId:type,until:u.stasisUntil};
 }
 // DEV31: only opposing champions within true world-unit range are slowed.
 activateRanduinsV453Dev31(team,unitId){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u||u.hp<=0||this.ended)return {ok:false,reason:'Campeão indisponível.'};
  if(!u.items?.includes('randuins_omen'))return {ok:false,reason:'Randuin não equipado.'};
  const cast=this.performActionV40({actorId:u.id,kind:'item',type:'randuins_omen',source:'active_item'});
  if(!cast.ok)return cast;
  const victims=this.units.filter(v=>v.hp>0&&v.team!==u.team&&this.mapDistance(u,v)<=500);
  for(const target of victims)this.applyEffectV41(target,'slow',{source:u,duration:2,power:.70,key:'randuins_'+u.id});
  this.event(`${u.champ} ativou Randuin em ${victims.length} adversários.`,u.team,'item_active',u.id);
  return {ok:true,targetIds:victims.map(v=>v.id),cooldownEndsAt:cast.cooldownEndsAt};
 }
 activateYoumuusV453Dev29(team,unitId){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u||u.hp<=0||this.ended)return {ok:false,reason:'Campeão indisponível.'};
  if(!u.items?.includes('youmuus_ghostblade'))return {ok:false,reason:'Youmuu não equipada.'};
  const result=this.performActionV40({actorId:u.id,kind:'item',type:'youmuus_ghostblade',source:'active_item'});
  if(!result.ok)return result;
  const ranged=u.range>.05;
  u.youmuusSprintUntilV453Dev29=this.gameTime+(ranged?4:6);
  u.youmuusSprintRatioV453Dev29=ranged?.15:.20;
  this.event(`${u.champ} ativou Youmuu para acelerar.`,u.team,'item_active',u.id);
  return {ok:true,until:u.youmuusSprintUntilV453Dev29,cooldownEndsAt:result.cooldownEndsAt};
 }
 // Reusable displacement adapter: measured in world units, collision-tested in
 // normalized board coordinates. Never leave the legal playfield. Wall passage
 // is allowed ONLY when there is a walkable exit on the opposite side within
 // the wall-travel budget. This is not a generic no-clip ability.
 pushChampionThroughTerrain(source,target,pushUnits=750,{maxWallUnits=500}={}){
  const dx=(target.x-source.x)*this.worldWidth,dy=(target.y-source.y)*this.worldHeight;
  const length=Math.hypot(dx,dy);if(length<1)return {travelled:0,crossedWall:false,blocked:false};
  const vx=dx/length,vy=dy/length,origin={x:target.x,y:target.y};
  const at=d=>({x:origin.x+vx*d/this.worldWidth,y:origin.y+vy*d/this.worldHeight});
  let end=origin,travelled=0,crossedWall=false,blocked=false,insideWallAt=null;
  for(let d=15;d<=pushUnits+15;d+=15){
   const point=at(Math.min(d,pushUnits));
   const inBounds=point.x>=.019&&point.x<=.978&&point.y>=.019&&point.y<=.978;
   if(!inBounds){blocked=true;break;}
   const open=this.walkable(point.x,point.y);
   if(!open){
    if(insideWallAt===null)insideWallAt=d;
    if(d-insideWallAt>maxWallUnits){blocked=true;break;}
    continue;
   }
   if(insideWallAt!==null){crossedWall=true;insideWallAt=null;}
   end=point;travelled=Math.min(d,pushUnits);
  }
  if(insideWallAt!==null)blocked=true;
  target.x=end.x;target.y=end.y;this.invalidateShopUndoOnDepartureV453Dev61(target);
  this.itemEnergizeRelocateV453Dev39(target,origin,end,{kind:'knockback',travelled});
  // Prior navigation paths are invalid after involuntary displacement;
  // recompute on the next movement update without wiping persistent intent.
  target.laneFollowPath=[];target.retreatPath=[];
  if(target.plan&&!target.plan.completed){const step=target.plan.steps[target.plan.index];if(step)step.path=[];}
  return {travelled,crossedWall,blocked,point:{x:end.x,y:end.y}};
 }
 // Ground-targeted abilities can target terrain, but the caster must stand on navigable ground.
 castApproachPathV42(u,point,range){
  if(this.mapDistance(u,point)<=range)return [];
  if(this.walkable(point.x,point.y)){
   const direct=this.findPath(u,point);if(direct?.length)return direct;
  }
  // Deterministic candidate sampling avoids deadlocking skills aimed at walls.
  const candidates=[];
  for(const factor of [.72,.45])for(let i=0;i<16;i++){
   const angle=i*Math.PI*2/16,dist=range*factor;
   const p={x:point.x+Math.cos(angle)*dist/this.worldWidth,y:point.y+Math.sin(angle)*dist/this.worldHeight};
   if(p.x<=0||p.x>=1||p.y<=0||p.y>=1||!this.walkable(p.x,p.y))continue;
   const route=this.findPath(u,p);if(route?.length)candidates.push({route,length:route.reduce((sum,at,j)=>sum+(j?this.mapDistance(route[j-1],at):this.mapDistance(u,at)),0)});
  }
  candidates.sort((a,b)=>a.length-b.length);
  return candidates[0]?.route||null;
 }
 // V4.2: skill location input is an intent, never an instant long-distance hit.
 queueKitSkillV42(team,unitId,slot,point){
  const u=this.units.find(v=>v.team===team&&v.id===unitId),rule=u&&kitSpellV42(u.champ,slot);
  if(!u||u.hp<=0||this.ended||this.teams[team].ready||!['planning','preparation'].includes(this.phase))return {ok:false,reason:'fase_indisponível'};
  if(!rule||!['ground_circle','ground_zone','line_projectile'].includes(rule.kind))return {ok:false,reason:'kit_não_suportado'};
  // Lux E recast has no second mana/cooldown cost. A zone is not the same as a QWER spell cast.
  if(slot==='E'&&u.champ==='Lux'&&u.luxZoneV42?.expiresAt>this.gameTime){
   u.luxZoneV42.detonate=true;this.recordIntentV40(team,u.id,'kit_recast',{slot});return {ok:true,recast:true};
  }
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.x>1||point.y<0||point.y>1)return {ok:false,reason:'ponto_inválido'};
  const gate=castGateV39(u,slot,this.gameTime);
  if(!gate.ok)return {ok:false,reason:gate.reason};
  if(u.pendingKitCastV42)return {ok:false,reason:'conjuração_pendente'};
  const approach=this.castApproachPathV42(u,point,rule.range);
  if(approach===null)return {ok:false,reason:'destino_sem_aproximação'};
  u.pendingKitCastV42={slot,point:{x:point.x,y:point.y},issuedAt:this.gameTime,lastGoal:{...point},castPath:approach};
  this.recordIntentV40(team,u.id,'kit_location',{slot,point:{x:point.x,y:point.y}});
  return {ok:true,range:rule.range};
 }
 resolveKitSkillsV42(){
  const fx=this.effectResolverV41();
  for(const u of this.units){
   if(u.hp<=0){u.pendingKitCastV42=null;u.luxZoneV42=null;continue;}
   const zone=u.luxZoneV42;
   if(zone){
    if(zone.detonate||(zone.autoWaveV451&&this.gameTime>=zone.placedAt+2)||this.gameTime>=zone.expiresAt){
     const rule=kitSpellV42('Lux','E'),rank=Math.max(1,u.skillRanks.E);
     const hits=areaHitsV42(zone.point,[...this.units,...this.minions].filter(v=>v.team!==u.team&&v.hp>0&&(v.spawnAt===undefined||v.spawnAt<=this.gameTime)),rule.radius,this.worldWidth,this.worldHeight);
     for(const victim of hits)this.damage(victim,rule.damage[Math.min(rank-1,4)]+this.elementalStatsV452d3(u).ap*rule.apRatio,u,'magic','spell');
     this.event(`${u.champ}: E detonada (${hits.length} alvo(s)).`,u.team,'skill_vfx',u.id,
      {observedBy:['blue','red'].filter(t=>t===u.team||this.canSeePoint(t,zone.point)),vfx:{type:'lucent_singularity_explode',at:zone.point,radius:rule.radius,expiresAt:this.gameTime+1}});
     u.luxZoneV42=null;
    }else{
     const slow=rule=>rule.slow[Math.min((u.skillRanks.E||1)-1,4)];
     for(const enemy of areaHitsV42(zone.point,this.units.filter(v=>v.team!==u.team&&v.hp>0),310,this.worldWidth,this.worldHeight))
      fx.apply(enemy,'slow',{source:u,duration:1.25,power:slow(kitSpellV42('Lux','E'))/100,key:'lux_e_'+u.id});
    }
   }
   const q=u.pendingKitCastV42;if(!q)continue;
   const rule=kitSpellV42(u.champ,q.slot);if(!rule){u.pendingKitCastV42=null;continue;}
   if(this.mapDistance(u,q.point)>rule.range+1e-7)continue;
   if(!fx.canAct(u,'skill').ok)continue; // Wait without spending resources.
   const gate=castGateV39(u,q.slot,this.gameTime);if(!gate.ok){u.pendingKitCastV42=null;continue;}
   // Lux Q uses Dev68's actual travel/collision resolver instead of instant V42 line hits.
   if(u.champ==='Lux'&&q.slot==='Q'){
    const launch=this.launchLuxBindingV453Dev68(u,q.point);
    if(launch.ok)u.pendingKitCastV42=null;
    else if(['recarga','mana','não_aprendido'].includes(launch.reason))u.pendingKitCastV42=null;
    continue;
   }
   const performed=this.performActionV40({actorId:u.id,kind:'skill',slot:q.slot,point:q.point,source:'kit_v42'});
   if(!performed.ok){if(['recarga','mana','não_aprendido'].includes(performed.reason))u.pendingKitCastV42=null;continue;}
   u.pendingKitCastV42=null;
   const rank=u.skillRanks[q.slot],enemies=this.units.filter(v=>v.team!==u.team&&v.hp>0);
   const observers=['blue','red'].filter(t=>t===u.team||this.canSeePoint(t,u));
   if(rule.kind==='ground_circle'){
    const hits=areaHitsV42(q.point,[...enemies,...this.minions.filter(m=>m.team!==u.team&&m.hp>0&&m.spawnAt<=this.gameTime)],rule.radius,this.worldWidth,this.worldHeight);
    for(const victim of hits){const spellShielded=fx.has(victim,'spell_shield');this.damage(victim,rule.damage[Math.min(rank-1,4)]+this.elementalStatsV452d3(u).ap*rule.apRatio,u,'magic','spell');
     if(spellShielded||!victim.champ)continue;
     // Suspension should be tenacity-sensitive: CC tag while airborne (prototype).
     fx.apply(victim,'stun',{source:u,duration:rule.ccSeconds,key:'nami_q_'+u.id});}
    this.event(`${u.champ}: Aqua Prison (${hits.length} atingidos).`,u.team,'skill_vfx',u.id,
     {observedBy:observers,vfx:{type:rule.effect,at:q.point,radius:rule.radius,expiresAt:this.gameTime+2}});
   }else if(rule.kind==='line_projectile'){
    // Collision uses both champions and enemy minions; a minion consumes a binding slot.
    const blockers=[...enemies,...this.minions.filter(m=>m.hp>0&&m.team!==u.team&&m.spawnAt<=this.gameTime)];
    const hits=skillshotHitsV42(u,q.point,blockers,{range:rule.range,width:rule.width,maxHits:rule.maxHits,worldWidth:this.worldWidth,worldHeight:this.worldHeight});
    for(const victim of hits){if(victim.projectileGuardUntil>this.gameTime)break; // guard absorbs missile
     const spellShielded=fx.has(victim,'spell_shield');
     this.damage(victim,rule.damage[Math.min(rank-1,4)]+this.elementalStatsV452d3(u).ap*rule.apRatio,u,'magic','spell');
     if(victim.champ&&!spellShielded)fx.apply(victim,'root',{source:u,duration:rule.ccSeconds,key:'lux_q_'+u.id});}
    this.event(`${u.champ}: Light Binding (${hits.length} colisões).`,u.team,'skill_vfx',u.id,
     {observedBy:observers,vfx:{type:rule.effect,from:{x:u.x,y:u.y},to:q.point,width:rule.width,expiresAt:this.gameTime+2}});
   }else if(rule.kind==='ground_zone'){
    u.luxZoneV42={point:{...q.point},expiresAt:this.gameTime+rule.duration,detonate:false,autoWaveV451:!!q.autoWaveV451,placedAt:this.gameTime};
    this.event(`${u.champ}: Lucent Singularity posicionada.`,u.team,'skill_vfx',u.id,
     {observedBy:observers,vfx:{type:rule.effect,at:q.point,radius:rule.radius,expiresAt:this.gameTime+rule.duration}});
   }
  }
 }
 // V3.9 directional targeting adapter. Coordinates, not target ids, are submitted.
 // Resolution follows the same gate+commit contract; never trusts the client for hits.
 queueDirectionalSkill(team,unitId,slot,point){
  const u=this.units.find(v=>v.id===unitId&&v.team===team),rule=u&&abilityRule(u,slot);
  if(!u||u.hp<=0||this.ended||!['planning','preparation'].includes(this.phase)||this.teams[team].ready||u.queuedDirectional||!rule||!['line','line_recast','two_blade_line'].includes(rule.kind))return {ok:false,reason:'Ação direcional indisponível.'};
  if(!point||![point.x,point.y].every(Number.isFinite)||this.mapDistance(u,point)<1)return {ok:false,reason:'Selecione uma direção no mapa.'};
  const recastE=u.champ==='Irelia'&&slot==='E'&&!!this.ireliaBladesV453Dev43?.[u.id];
  const gate=recastE?{ok:true}:castGateV39(u,slot,this.gameTime);
  if(!gate.ok)return {ok:false,reason:gate.reason};
  u.queuedDirectional={slot,point:{x:point.x,y:point.y},issuedAt:this.gameTime};
  this.recordIntentV40(team,unitId,'directional_skill',{slot,point:{x:point.x,y:point.y}});
  this.event(`${u.champ}: ${slot} direcional programado.`,team,'skill_order',u.id);
  return {ok:true};
 }
 // Dev69: only the actual team seat may queue an R2. First-hit mark
 // gives temporary visibility to that team; no target ID can come from fog.
 queueVexRecast(team,unitId){
  const u=this.units.find(v=>v.id===unitId&&v.team===team),mark=u?.vexMark;
  if(!u||u.champ!=='Vex'||u.hp<=0||this.ended||this.teams[team].ready||
      !['planning','preparation'].includes(this.phase))return {ok:false,reason:'fase_indisponível'};
  if(u.queuedVexRecast||u.vexDashV453Dev69)return {ok:false,reason:'recast_duplicado'};
  if(!mark||mark.until<=this.gameTime)return {ok:false,reason:'recast_sem_marca'};
  const t=this.units.find(v=>v.id===mark.targetId&&v.team!==team&&v.hp>0);
  if(!t)return {ok:false,reason:'alvo_indisponível'};
  u.queuedVexRecast=true;
  this.recordIntentV40(team,unitId,'vex_r_recast',{slot:'R'});
  return {ok:true};
 }
 startVexShadowDashV453Dev69(u){
  const mark=u?.vexMark,now=this.gameTime;
  const t=mark&&this.units.find(v=>v.id===mark.targetId&&v.hp>0&&v.team!==u.team);
  if(!u||u.champ!=='Vex'||u.hp<=0||!mark||mark.until<=now||!t)
   return {ok:false,reason:'recast_sem_marca'};
  if(u.vexDashV453Dev69)return {ok:false,reason:'recast_duplicado'};
  const fx=this.effectResolverV41();
  if((u.rootUntil||0)>now||(u.groundedUntil||0)>now||fx.has(u,'root')||fx.has(u,'grounded')||
     (u.stasisUntil||0)>now||!fx.canAct(u,'skill').ok)
   return {ok:false,reason:'deslocamento_interrompido'};
  if((t.stasisUntil||0)>now||fx.has(t,'stasis')||fx.has(t,'untargetable'))
   return {ok:false,reason:'alvo_inalcançável'};
  const commit=this.performActionV40({actorId:u.id,kind:'recast',slot:'R',targetId:t.id,
   source:'vex_r2_v453_dev69',requireVision:false});
  if(!commit.ok)return commit;
  u.vexDashV453Dev69={targetId:t.id,startedAt:now,lastAt:now,
   speed:2200,sourceMarkAt:mark.until};
  u.vexMark=null;
  this.event('Vex iniciou a segunda ativação de Rajada Sombria.',u.team,'skill_vfx',u.id,{
   observedBy:['blue','red'].filter(team=>team===u.team||this.canSeePoint(team,u)),
   vfx:{type:'shadow_surge_recast',from:{x:u.x,y:u.y},to:{x:t.x,y:t.y},
    width:100,expiresAt:now+2}});
  return {...commit,pending:true};
 }
 advanceVexShadowDashV453Dev69(){
  const now=this.gameTime;
  for(const u of this.units){
   const dash=u.vexDashV453Dev69;
   if(!dash)continue;
   const t=this.units.find(v=>v.id===dash.targetId&&v.team!==u.team&&v.hp>0);
   if(u.hp<=0||!t){u.vexDashV453Dev69=null;continue;}
   const elapsed=Math.max(0,now-(dash.lastAt??dash.startedAt));
   if(elapsed<=0)continue;
   dash.lastAt=now;
   const dx=t.x-u.x,dy=t.y-u.y,dist=Math.hypot(dx*this.worldWidth,dy*this.worldHeight);
   const step=dash.speed*elapsed;
   if(dist>step+180){
    // Following the marked target ignores map terrain during the dash.
    const ratio=step/Math.max(1,dist);
    u.x+=dx*ratio;u.y+=dy*ratio;
    this.invalidateShopUndoOnDepartureV453Dev61(u);
    continue;
   }
   const m=Math.hypot(dx,dy)||1;
   const destination=[180,240,320,450].map(offset=>({
    x:t.x-dx/m*offset/this.worldWidth,
    y:t.y-dy/m*offset/this.worldHeight
   })).find(point=>this.walkable(point.x,point.y));
   if(!destination){u.vexDashV453Dev69=null;continue;}
   u.x=destination.x;u.y=destination.y;
   this.invalidateShopUndoOnDepartureV453Dev61(u);
   u.vexDashV453Dev69=null; // once-only arrival, including replay after restore
   const rule=kitSpellV42('Vex','R'),rank=Math.max(1,Math.min(3,u.skillRanks?.R||1));
   this.damage(t,rule.recastDamage[rank-1]+this.elementalStatsV452d3(u).ap*rule.recastApRatio,u,'magic','spell');
   this.event('Vex concluiu a segunda ativação de Rajada Sombria.',u.team,'skill_vfx',u.id,{
    observedBy:['blue','red'].filter(team=>team===u.team||this.canSeePoint(team,u)),
    vfx:{type:'shadow_surge_arrival',at:{x:u.x,y:u.y},expiresAt:now+1}});
  }
 }
 resolveDirectionalSkills(){
  for(const u of this.units){
   if(u.hp<=0)continue;
   if(u.queuedVexRecast){
    u.queuedVexRecast=false;
    this.startVexShadowDashV453Dev69(u);
   }
   const q=u.queuedDirectional;if(!q)continue;
   if(u.champ==='Irelia'&&q.slot==='E'){
    const result=this.castIreliaFlawlessDuetV453Dev43(u,q.point);
    if(result.ok)u.queuedDirectional=null;
    else if(!['incapacitado','recast_aguarde'].includes(result.reason))u.queuedDirectional=null;
    continue;
   }
   if((u.champ==='Nami'||u.champ==='Vex')&&q.slot==='R'){
    const shot=this.launchWaveShadowV453Dev69(u,'R',q.point);
    if(shot.ok||!['incapacitado','deslocamento_interrompido'].includes(shot.reason))
     u.queuedDirectional=null;
    continue;
   }
   if((u.stasisUntil||0)>this.gameTime||(u.stunUntil||0)>this.gameTime)continue;
   u.queuedDirectional=null;
   const gate=castGateV39(u,q.slot,this.gameTime);
   if(!gate.ok)continue;
   const d={x:q.point.x-u.x,y:q.point.y-u.y},size=Math.hypot(d.x,d.y);
   if(size<=0)continue;
   if(!this.performActionV40({actorId:u.id,kind:'skill',slot:q.slot,source:'directional',checkRange:false}).ok)continue;
   const rank=u.skillRanks[q.slot]||1,limit=(gate.rule.rangeByRank?.[Math.min(rank-1,gate.rule.rangeByRank.length-1)]||gate.rule.range)/this.worldWidth;
   const dir={x:d.x/size,y:d.y/size},endpoint={x:u.x+dir.x*limit,y:u.y+dir.y*limit};
   const candidates=this.units.filter(v=>v.team!==u.team&&v.hp>0).map(v=>{
    const rel={x:v.x-u.x,y:v.y-u.y},depth=rel.x*dir.x+rel.y*dir.y;
    const lateral=Math.abs(rel.x*dir.y-rel.y*dir.x);
    return {target:v,depth,lateral};
   }).filter(v=>v.depth>=0&&v.depth<=limit&&v.lateral<=gate.rule.width/2/this.worldWidth).sort((a,b)=>a.depth-b.depth);
   const hits=gate.rule.kind==='line_recast'?candidates.slice(0,1):candidates;
   for(const hit of hits){
    if(gate.rule.projectile&&hit.target.projectileGuardUntil>this.gameTime)continue;
    const spec=kitSpellV42(u.champ,'R');const amount=spec?.damage?.[Math.min(rank-1,spec.damage.length-1)]+this.elementalStatsV452d3(u).ap*(spec?.apRatio||0)||75+50*(rank-1)+this.elementalStatsV452d3(u).ap*.20;
    const shielded=this.effectResolverV41().has(hit.target,'spell_shield');
    this.damage(hit.target,amount,u,'magic','spell');
    if(!shielded&&u.champ==='Nami'){this.applyCC(u,hit.target,'knockup',.5);this.effectResolverV41().apply(hit.target,'slow',{source:u,duration:2.5,power:.70,key:'nami_r_'+u.id});}
    if(!shielded&&u.champ==='Vex'){u.vexMark={targetId:hit.target.id,until:this.gameTime+4};}
   }
   const spectators=['blue','red'].filter(t=>t===u.team||this.canSeePoint(t,u));
   this.event(`${u.champ} lançou ${q.slot} direcional: ${hits.length} alvo(s) na linha.`,u.team,'skill_vfx',u.id,{observedBy:spectators,vfx:{type:gate.rule.effect,from:{x:u.x,y:u.y},to:endpoint,width:gate.rule.width,expiresAt:this.gameTime+2}});
  }
 }
 // The following specials are patch-aware tactical adapters, not full kits.
 queueSpecialUltimate(team,unitId,targetId=null,point=null){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u||u.hp<=0||this.ended||this.teams[team].ready||!['planning','preparation'].includes(this.phase))return {ok:false,reason:'Conjuração indisponível na fase atual.'};
  if(!['Zed','Karthus','Soraka','Jinx','Ashe','Ezreal','KSante'].includes(u.champ))return {ok:false,reason:'Ultimate individual ainda não implementada.'};
  if((u.skillRanks?.R||0)<1||u.level<6)return {ok:false,reason:'Ultimate exige nível 6 e ponto em R.'};
  if((u.skillCds.R||0)>this.gameTime)return {ok:false,reason:'Ultimate em recarga.'};
  const cost=u.champ==='Zed'?0:100;
  if(u.mana<cost)return {ok:false,reason:'Mana insuficiente.'};
  if(['Zed','KSante'].includes(u.champ)){
   const target=this.units.find(v=>v.id===targetId&&v.team!==team&&v.hp>0);
   const limit=u.champ==='KSante'?300:625;
   if(!target||!this.visible(team,target)||this.mapDistance(u,target)>limit)return {ok:false,reason:u.champ+' R exige alvo visível a até '+limit+' unidades.'};
  }
  if(['Jinx','Ashe','Ezreal'].includes(u.champ)&&(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||this.mapDistance(u,point)<1))return {ok:false,reason:'Selecione a direção no mapa.'};
  u.queuedUltimate={targetId,point:point?{x:point.x,y:point.y}:null};this.recordIntentV40(team,unitId,'ultimate',{targetId,point});return {ok:true};
 }
 resolveSpecialUltimates(){
  for(const u of this.units){const q=u.queuedUltimate;if(!q)continue;
   if(u.hp<=0){u.queuedUltimate=null;continue;}
   if(u.skillCds.R>this.gameTime||u.skillRanks.R<1)continue;
   const target=this.units.find(x=>x.id===q.targetId&&x.hp>0);
   if(['Zed','KSante'].includes(u.champ)){
    const limit=u.champ==='KSante'?300:625;
    if(!target||!this.visible(u.team,target)||this.mapDistance(u,target)>limit){u.queuedUltimate=null;continue;}
    if(!this.duelPermission(u,target))continue;
   }
   u.queuedUltimate=null;const cost=u.champ==='Zed'?0:100;
   const cds={Zed:120,Karthus:150,Soraka:150,Jinx:85,Ashe:100,Ezreal:120,KSante:120};
   const cast=this.performActionV40({actorId:u.id,kind:'skill',slot:'R',targetId:['Zed','KSante'].includes(u.champ)?target?.id:null,
    costOverride:cost,cooldownOverride:hasteCooldown(cds[u.champ],this.elementalStatsV452d3(u).abilityHaste+(u.ultimateHaste||0)),source:'special_ultimate'});
   if(!cast.ok)continue;
   if(u.champ==='KSante'&&target){
    const push=this.pushChampionThroughTerrain(u,target,750);
    this.attack(u,target,70+u.skillPower*.4+(push.crossedWall?85:0),'skill');
    this.applyCC(u,target,'root',1);
    u.allOutUntil=this.gameTime+15;
    this.event(`K’Sante R: ${target.champ} foi empurrado ${Math.round(push.travelled)} unidades${push.crossedWall?' através de terreno':''}${push.blocked?' (bloqueio no limite/terreno)':''}.`,u.team,'displacement',u.id);
    continue;
   }
   const effect={id:'fx'+this.nextId++,owner:u.id,team:u.team,champ:u.champ,kind:u.champ==='Zed'?'zed_mark':u.champ==='Karthus'?'karthus_channel':u.champ==='Soraka'?'soraka_heal':'global_projectile',targetId:q.targetId||null,origin:{x:u.x,y:u.y},createdAt:this.gameTime,dueRound:this.round+1,dueAt:this.gameTime+3,power:u.skillPower+this.elementalStatsV452d3(u).ad*.5+this.elementalStatsV452d3(u).ap*.7,point:q.point||null};
   if(effect.kind==='soraka_heal'){
    for(const ally of this.units.filter(v=>v.team===u.team&&v.hp>0)){
     const amount=(150+this.elementalStatsV452d3(u).ap*.5)*(ally.hp/ally.maxHp<.4?1.5:1);
     this.effectResolverV41().heal(ally,amount,u);
    }
    this.event('Soraka: Desejo curou aliados globalmente.',u.team,'ultimate',u.id);
   } else {this.delayedEffects.push(effect);this.event(u.champ+' iniciou '+(effect.kind==='zed_mark'?'Marca Fatal':effect.kind==='karthus_channel'?'Réquiem':'projétil global')+'; resolução anunciada para o próximo turno.',u.team,'ultimate_cast',u.id);}
  }
 }
 // Resolve on the next strategic round to provide a deliberate reaction
 // window. This differs from LoL's actual second-based timing by design.
 resolveDelayedEffects(){
  const remaining=[];
  for(const effect of this.delayedEffects){
   if(this.round<effect.dueRound||this.gameTime<effect.dueAt){remaining.push(effect);continue;}
   const source=this.units.find(v=>v.id===effect.owner);
   if(effect.kind==='zed_mark'){
    const target=this.units.find(v=>v.id===effect.targetId);
    if(target&&target.hp>0){if(target.stasisUntil>this.gameTime)this.event('Marca Fatal anulada por estase.',target.team,'stasis',target.id);
     else this.damage(target,effect.power,source);}
   }else if(effect.kind==='ignite_dot'){
    const target=this.units.find(v=>v.id===effect.targetId);
    if(target?.hp>0)this.damage(target,effect.power,source,'true','dot');
    if(effect.ticksLeft>1){effect.ticksLeft--;effect.dueAt=this.gameTime+1;remaining.push(effect);}
   }else if(effect.kind==='karthus_channel'){
    if(source?.hp>0){for(const enemy of this.units.filter(v=>v.team!==effect.team&&v.hp>0))this.damage(enemy,effect.power,source);
     this.event('Réquiem: canalização concluída.',effect.team,'ultimate',source.id);}
    else this.event('Réquiem interrompido.',effect.team,'ultimate',effect.owner);
   }else if(effect.kind==='global_projectile'){
    if(source&&effect.point){const dx=effect.point.x-effect.origin.x,dy=effect.point.y-effect.origin.y,len=Math.hypot(dx,dy)||1;
     const targets=this.units.filter(v=>v.team!==effect.team&&v.hp>0).map(v=>({v,along:((v.x-effect.origin.x)*dx+(v.y-effect.origin.y)*dy)/len,side:Math.abs((v.x-effect.origin.x)*dy-(v.y-effect.origin.y)*dx)/len})).filter(o=>o.along>0&&o.side<.012&&o.along<len).sort((a,b)=>a.along-b.along);
     const hits=effect.champ==='Ezreal'?targets:targets.slice(0,1);
     for(const hit of hits)this.damage(hit.v,effect.power,source);
     this.event(effect.champ+' R: '+hits.length+' alvo(s) atingido(s) pela trajetória.',effect.team,'ultimate',effect.owner);
    }
   }
  }
  this.delayedEffects=remaining;
 }
 // Dev66 — server-only Cleanse: remove supported disables and summoner debuffs.
 // Does NOT remove suppression, airborne, stasis or Ignite Grievous Wounds.
 // Called only after a successful performActionV40 resource/cooldown commit.
 applyCleanseV453Dev66(u){
  const types=['stun','root','slow','silence','blind','disarm','grounded','fear','charm','taunt','polymorph','sleep'];
  const removed=this.effectResolverV41().remove(u,{types});
  const dotsBefore=this.delayedEffects.length;
  this.delayedEffects=this.delayedEffects.filter(e=>!(e.kind==='ignite_dot'&&e.targetId===u.id));
  const igniteRemoved=dotsBefore-this.delayedEffects.length;
  const exhaustRemoved=(u.exhaustUntil||0)>this.gameTime;
  u.exhaustUntil=0;
  u.cleanseTenacityUntilV453Dev66=this.gameTime+3;
  this.event(`${u.champ} usou Purificar.`,u.team,'summoner',u.id);
  return {removed,igniteRemoved,exhaustRemoved};
 }
 // Dev67: Heal is a two-champion spell, not two heals on the same champion.
 // An explicit living ally within range takes priority. Without one, choose
 // the most injured OTHER ally; with no eligible ally, heal the caster once.
 applySummonerHealV453Dev67(u,target=null,{lockTarget=false}={}){
  const allies=this.units.filter(a=>a!==u&&a.team===u.team&&a.hp>0&&this.mapDistance(u,a)<=900);
  const ally=lockTarget||target?(target&&allies.includes(target)?target:null):allies.sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0]||null;
  const fx=this.effectResolverV41();
  const self=fx.heal(u,100+u.level*12,u);
  const secondary=ally?fx.heal(ally,85+u.level*11,u):0;
  return {self,secondary,allyId:ally?.id||null};
 }
 // One-shot summoner cast is orthogonal to the persistent movement / farm plan.
 queueSummoner(team,unitId,type,targetId=null){
  const u=this.units.find(x=>x.team===team&&x.id===unitId);if(!u||u.hp<=0||this.teams[team].ready||['executing','decision','finished'].includes(this.phase))return {ok:false,reason:'Feitiço indisponível nesta fase.'};
  if(!['heal','ignite','exhaust','tp','barrier','ghost','cleanse'].includes(type))return {ok:false,reason:'Feitiço não implementado.'};
  const key={heal:'healCd',ignite:'igniteCd',exhaust:'exhaustCd',tp:'tpCd',barrier:'barrierCd',ghost:'ghostCd',cleanse:'cleanseCd'}[type];if((u[key]||0)>this.gameTime)return {ok:false,reason:'Feitiço em recarga.'};
  if(!this.hasSummonerV452d4Dev11(u,type))return {ok:false,reason:'Feitiço não equipado.'};
  const target=targetId?this.units.find(x=>x.id===targetId&&x.hp>0):null;
  if(targetId&&!target)return {ok:false,reason:'Alvo indisponível.'};
  if(['ignite','exhaust'].includes(type)&&target&&target.team===team)return {ok:false,reason:'Selecione um inimigo.'};
  if(type==='heal'&&target&&target.team!==team)return {ok:false,reason:'Curar exige aliado.'};
  if(target&&target.team!==team&&!this.visible(team,target))return {ok:false,reason:'Alvo não visível.'};
  u.queuedSummoner={type,targetId};this.recordIntentV40(team,unitId,'summoner',{type,targetId});return {ok:true};
 }
 resolveSummonerCasts(){for(const u of this.units){const q=u.queuedSummoner;if(!q)continue;u.queuedSummoner=null;if(u.hp<=0)continue;const target=this.units.find(x=>x.id===q.targetId&&x.hp>0);const time=this.gameTime;
   // Resolve targets first so an invalid targeted spell does not consume its cooldown.
   if(['ignite','exhaust'].includes(q.type)){
    const candidates=this.units.filter(x=>x.team!==u.team&&x.hp>0&&this.visible(u.team,x)&&this.mapDistance(u,x)<=650);
    // Never substitute a different enemy when an explicit target walked away
    // or entered fog. Targetless casts retain the historical auto-pick.
    const foe=q.targetId?(target&&candidates.includes(target)?target:null):candidates.sort((a,b)=>this.mapDistance(a,u)-this.mapDistance(b,u))[0];
    if(!foe){if(q.targetId&&(!target||target.hp<=0))continue;u.queuedSummoner=q;continue;}
    const cast=this.performActionV40({actorId:u.id,kind:'summoner',type:q.type,targetId:foe.id,source:'planned'});
    if(!cast.ok)continue;
   }else if(q.type!=='tp'){
    const cast=this.performActionV40({actorId:u.id,kind:'summoner',type:q.type,targetId:q.type==='heal'&&target?.team===u.team?target.id:null,source:'planned'});
    if(!cast.ok)continue;
   }
   if(q.type==='cleanse')this.applyCleanseV453Dev66(u);
   if(q.type==='ghost'){
    u.ghostUntil=time+15;
    this.event(u.champ+' ativou Fantasma (+velocidade por 15 segundos simulados).',u.team,'summoner',u.id);
   }
   if(q.type==='barrier'){const power=100+Math.round((u.level-1)*402.35/17);u.shield+=power;u.barrierAmount=(u.barrierAmount||0)+power;u.barrierUntil=time+3;this.event(u.champ+' usou Barreira.',u.team,'summoner',u.id);}
   if(q.type==='heal'){this.applySummonerHealV453Dev67(u,target?.team===u.team?target:null,{lockTarget:!!q.targetId});this.event(u.champ+' usou Curar.',u.team,'summoner',u.id);}
   if(q.type==='tp'){const tower=this.structures.filter(t=>t.team===u.team&&t.alive&&t.type==='tower').sort((a,b)=>this.mapDistance(u,b)-this.mapDistance(u,a))[0];if(!tower)continue;let p=null;for(const r of [.018,.025,.035,.05]){for(let n=0;n<16;n++){const a=n*Math.PI/8,candidate={x:tower.x+Math.cos(a)*r,y:tower.y+Math.sin(a)*r};if(this.walkable(candidate.x,candidate.y)){p=candidate;break;}}if(p)break;}if(!p)continue;const cast=this.performActionV40({actorId:u.id,kind:'summoner',type:'tp',source:'planned'});if(!cast.ok)continue;u.x=p.x;u.y=p.y;this.invalidateShopUndoOnDepartureV453Dev61(u);this.event(u.champ+' usou Teleporte para uma torre aliada.',u.team,'summoner',u.id);}
   if(['ignite','exhaust'].includes(q.type)){const candidates=this.units.filter(x=>x.team!==u.team&&x.hp>0&&this.visible(u.team,x)&&this.mapDistance(u,x)<=650);const foe=q.targetId?(target&&candidates.includes(target)?target:null):candidates.sort((a,b)=>this.mapDistance(a,u)-this.mapDistance(b,u))[0];if(!foe)continue; if(q.type==='ignite'){
    this.damage(foe,20+u.level*3,u,'true','spell');
    this.delayedEffects.push({id:'fx'+this.nextId++,kind:'ignite_dot',owner:u.id,team:u.team,targetId:foe.id,power:13+u.level*3,ticksLeft:4,createdAt:time,dueRound:this.round,dueAt:time+1});
    this.applyEffectV41(foe,'grievous_wounds',{source:u,duration:5,key:'ignite'});
    
   }else{foe.exhaustUntil=time+3;}this.event(u.champ+' usou '+(q.type==='ignite'?'Incendiar':'Exaustão')+' em '+foe.champ+'.',u.team,'summoner',u.id);}
  }}
 // Targeted cast requests are submitted during frozen planning and executed in simulated time.
 // Currently Nami W is implemented; unsupported abilities fail instead of inventing effects.
 queueTargetedSkill(team,unitId,slot,targetId){
  const u=this.units.find(v=>v.team===team&&v.id===unitId),target=this.units.find(v=>v.id===targetId);
  if(!u||!target||u.hp<=0||target.hp<=0||this.teams[team].ready||this.ended||this.phase==='executing'||this.phase==='decision')return {ok:false,reason:'Campeão ou fase indisponível.'};
  if(u.champ!=='Nami'||slot!=='W')return {ok:false,reason:'Essa habilidade ainda não tem execução direcionada certificada. Use um kit auditado ou aguarde a implementação individual.'};
  if(!(u.skillRanks?.W>0))return {ok:false,reason:'Aprenda W antes de usar.'};
  if(target.team!==team&&!this.visible(team,target))return {ok:false,reason:'O inimigo não está visível.'};
  if((u.skillCds?.W||0)>this.gameTime)return {ok:false,reason:`Nami W em recarga: ${Math.ceil(u.skillCds.W-this.gameTime)}s restantes.`};
  if(u.mana<abilityCost(u,'W'))return {ok:false,reason:'Mana insuficiente para W.'};
  u.pendingTargetedCast={slot,targetId,createdAt:this.gameTime,lastSeen:{x:target.x,y:target.y},initialized:false};
  this.recordIntentV40(team,unitId,'target_skill',{slot,targetId});
  this.event(`${u.champ}: W direcionado a ${target.champ}.`,team,'target_skill',u.id);
  return {ok:true};
 }
 resolveTargetedCasts(){
  for(const u of this.units){
   const p=u.pendingTargetedCast;if(!p||u.hp<=0)continue;
   if(u.champ!=='Nami'||p.slot!=='W'){u.pendingTargetedCast=null;continue;}
   if(!p.initialized){
    const primary=this.units.find(v=>v.id===p.targetId&&v.hp>0);
    if(!primary){u.pendingTargetedCast=null;continue;}
    if(primary.team!==u.team&&!this.visible(u.team,primary))continue;
    const rule=abilityRule(u,'W');
    if(this.mapDistance(u,primary)>rule.range)continue;
    const gate=castGateV39(u,'W',this.gameTime,primary,{worldDistance:(a,b)=>this.mapDistance(a,b),visible:v=>v.team===u.team||this.visible(u.team,v)});
    if(!gate.ok)continue;
    if(primary.team!==u.team&&!this.duelPermission(u,primary))continue;
    const rank=u.skillRanks.W;
    if(!this.performActionV40({actorId:u.id,kind:'skill',slot:'W',targetId:primary.id,source:'targeted'}).ok)continue;
    u.lastTargetedCastAt=this.gameTime;p.initialized=true;p.currentId=primary.id;p.visited=[];p.remaining=3;p.amount=90+rank*25+this.elementalStatsV452d3(u).ap*.20;
   }
   while(p.remaining>0&&p.currentId){
    const current=this.units.find(v=>v.id===p.currentId&&v.hp>0);
    if(!current){u.pendingTargetedCast=null;break;}
    if(current.team!==u.team){
     if(!this.visible(u.team,current)){u.pendingTargetedCast=null;break;}
     // A hostile W bounce must honor the same duel-response rules as other attacks.
     if(!this.duelPermission(u,current))break;
    }
    if(current.team===u.team){const healed=this.effectResolverV41().heal(current,p.amount,u);this.event(`Nami W: curou ${current.champ} em ${Math.round(healed)}.`,u.team,'heal',u.id);}
    else{this.attack(u,current,p.amount*.70,'skill');this.event(`Nami W: atingiu ${current.champ}.`,u.team,'skill',u.id);}
    p.visited.push(current.id);p.remaining--;
    const pool=this.units.filter(v=>v.hp>0&&!p.visited.includes(v.id)&&v.team!==current.team&&this.mapDistance(v,current)<=abilityRule(u,'W').bounceRange&&(v.team===u.team||this.visible(u.team,v)));
    pool.sort((a,b)=>dist(current,a)-dist(current,b));p.currentId=pool[0]?.id||null;
    if(!p.currentId||p.remaining<=0){u.pendingTargetedCast=null;break;}
   }
  }
 }
 // Persistent buy plans are intent, not instant remote purchases. The queue
 // is independent of movement and survives subsequent turns/respawns.
 // DEV59: active items execute on the server, not client-side. A champion
 // can use Mercury while stunned/suppressed, but airborne CC is not removed.
 activateItemV453Dev59(team,unitId,itemId,targetId=null,point=null){
  if(['elixir_of_iron','elixir_of_sorcery','elixir_of_wrath','actualizer','hextech_rocketbelt'].includes(itemId))return this.activateRemainderItemV453Dev69B7(team,unitId,itemId,targetId,point);
  if(itemId==='trinket_farsight'){
   const u=this.units.find(v=>v.team===team&&v.id===unitId);
   if(!u||u.trinket!=='farsight'||!point||this.mapDistance(u,point)>ITEM_REMAINDER_RULES_V453_DEV69_B7.farsight.range)return {ok:false,reason:'farsight_nao_equipado_ou_ponto_invalido'};
   return this.addWard(team,unitId,point,'farsight');
  }
  if(Object.prototype.hasOwnProperty.call(ITEM_SUPPORT_RULES_V453_DEV69_B5,itemId)&&['shurelyas_battlesong','redemption','locket_of_the_iron_solari','mikaels_blessing','knights_vow','hextech_gunblade'].includes(itemId))return this.activateSupportItemV453Dev69B5(team,unitId,itemId,targetId);
  if(['tiamat','ravenous_hydra','titanic_hydra','profane_hydra','stridebreaker'].includes(itemId))return this.activateCleaveItemV453Dev69B3(team,unitId,itemId);
  const u=this.units.find(v=>v.id===unitId&&v.team===team&&v.hp>0);
  const effect=ITEM_EFFECTS_V43[itemId];
  if(!u||!effect||!['quicksilver_sash','mercurial_scimitar'].includes(itemId)||!u.items.includes(itemId))return {ok:false,reason:'item_ativo_nao_equipado'};
  if(this.ended||!['preparation','planning','decision'].includes(this.phase)||(this.phase!=='decision'&&this.teams[team].ready))return {ok:false,reason:'fase_invalida'};
  if(this.phase==='decision'&&this.pendingDecision?.unitId!==u.id)return {ok:false,reason:'decisao_nao_autorizada'};
  if((u.stasisUntil||0)>this.gameTime)return {ok:false,reason:'estase'};
  if((u.mercuryReadyAtV453Dev59||0)>this.gameTime)return {ok:false,reason:'item_em_recarga'};
  const removable=['stun','root','slow','silence','blind','disarm','grounded','fear','charm','taunt','polymorph','sleep','suppression'];
  const removed=this.effectResolverV41().remove(u,{types:removable});
  u.mercuryReadyAtV453Dev59=this.gameTime+effect.cooldownSeconds;
  if(itemId==='mercurial_scimitar')u.mercurialSprintUntilV453Dev59=this.gameTime+effect.sprintSeconds;
  this.event(`${u.champ} ativou Mercúrio.`,team,'item_active',u.id);
  return {ok:true,itemId,removed,cooldownUntil:u.mercuryReadyAtV453Dev59};
 }
 queuePurchase(team,unitId,itemId){
  const u=this.units.find(v=>v.team===team&&v.id===unitId),item=catalog.find(i=>i.id===itemId);
  if(!u||!item||item.notPurchasable||item.tags.includes('trinket')||item.tags.includes('noxian')||this.ended||this.teams[team].ready||this.phase==='executing'||this.phase==='decision')return {ok:false,reason:'Compra programada indisponível.'};
  if(item.tags.includes('annul')&&u.items.some(id=>catalog.find(v=>v.id===id)?.tags.includes('annul')&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Apenas um item com Anular por campeão.'};
  if(item.tags.includes('cleave')&&u.items.some(id=>catalog.find(v=>v.id===id)?.tags.includes('cleave')&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Hidras/Fenda exclusivos por campeão.'};
  if(item.tags.includes('spellblade')&&u.items.some(id=>['sheen','trinity_force','essence_reaver','lich_bane','iceborn_gauntlet','dusk_and_dawn'].includes(id)&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Lâmina Arcana exclusiva.'};
  if(item.tags.includes('lifeline')&&u.items.some(id=>catalog.find(v=>v.id===id)?.tags.includes('lifeline')&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Um único efeito Salva-Vidas por campeão.'};
  if(item.tags.includes('fatality')&&u.items.some(i=>catalog.find(v=>v.id===i)?.tags.includes('fatality')&&i!==itemId))return {ok:false,reason:'Apenas um item de Penetração Fatal por campeão.'};
  if(item.roleLock&&item.roleLock!==u.role)return {ok:false,reason:'Item exclusivo de outra função.'};
  if(['sheen','trinity_force'].includes(itemId)&&[...u.items,...(u.purchaseQueue||[])].some(id=>['sheen','trinity_force','essence_reaver','lich_bane','iceborn_gauntlet','dusk_and_dawn'].includes(id)&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Lâmina Arcana exclusiva.'};
  if((item.tags.includes('unique')||item.tags.includes('legendary')||item.tags.includes('epic'))&&(u.items.includes(itemId)||(u.purchaseQueue||[]).includes(itemId)))return {ok:false,reason:'Equipamento completo único: compra duplicada bloqueada.'};
  if(item.tags.includes('starter')&&!item.roleLock&&[...u.items,...(u.purchaseQueue||[])].some(id=>catalog.find(v=>v.id===id)?.tags.includes('starter')&&!catalog.find(v=>v.id===id)?.roleLock))return {ok:false,reason:'Um item inicial por campeão.'};
  if((itemId==='boots'||item.tags.includes('boots'))&&[...u.items,...(u.purchaseQueue||[])].some(id=>id==='boots'||catalog.find(v=>v.id===id)?.tags.includes('boots'))&&!this.itemRecipe(itemId).some(id=>u.items.includes(id)))return {ok:false,reason:'Apenas um par de botas por campeão.'};
  if(JUNGLE_PETS.includes(itemId)&&(u.junglePet||(u.purchaseQueue||[]).some(v=>JUNGLE_PETS.includes(v))))return {ok:false,reason:'Já existe pet de jungle.'};
  if(itemId==='support_atlas'&&[...u.items,...(u.purchaseQueue||[])].some(v=>v.startsWith('support_')))return {ok:false,reason:'Missão de suporte já equipada ou programada.'};
  if(u.items.length>=6&&!recipePurchasePartsV453Dev30(itemId,u.items).length)return {ok:false,reason:'Inventário cheio; combine um componente ou venda antes.'};
  const queue=u.purchaseQueue||(u.purchaseQueue=[]);
  if(queue.length>=12)return {ok:false,reason:'Máximo de 12 compras programadas.'};
  queue.push(itemId);
  this.event(`${u.champ} programou ${item.name} para uma visita à fonte.`,team,'purchase_plan',u.id);
  return {ok:true,queued:true};
 }
 cancelQueuedPurchase(team,unitId,index){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u||this.phase==='executing'||this.teams[team].ready||!Number.isInteger(index)||index<0||index>=(u.purchaseQueue||[]).length)return false;
  u.purchaseQueue.splice(index,1);return true;
 }
 processPurchaseQueues(team){
  if(this.phase!=='planning'&&this.phase!=='preparation')return [];
  const purchased=[];
  for(const u of this.units.filter(v=>v.team===team&&v.hp>0&&v.purchaseQueue?.length)){
   const shop=this.map.objects.find(o=>o.id===team+'_spawn_shop');
   if(!shop||this.mapDistance(u,shop)>1125)continue;
   if(u.items.includes('refillable_potion'))u.refillableChargesV453Dev32=2;
   while(u.purchaseQueue.length){
    let index=0;
    if(u.role==='JG'&&!u.junglePet){const petIndex=u.purchaseQueue.findIndex(id=>JUNGLE_PETS.includes(id));if(petIndex>=0)index=petIndex;}
    const id=u.purchaseQueue[index],check=this.canBuy(team,u.id,id);
    if(!check.ok)break; // Insufficient gold or full slots: keep plan for the next return.
    if(!this.buy(team,u.id,id))break;
    u.purchaseQueue.splice(index,1);purchased.push({unitId:u.id,itemId:id});
   }
  }
  return purchased;
 }
 purchaseOrPlan(team,unitId,itemId){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u)return {ok:false,reason:'Campeão inexistente.'};
  if(['trinket_stealth','trinket_oracle','trinket_farsight'].includes(itemId))return this.setTrinket(team,unitId,itemId==='trinket_oracle'?'oracle':itemId==='trinket_farsight'?'farsight':'stealth');
  const check=this.canBuy(team,unitId,itemId);
  if(check.ok){this.buy(team,unitId,itemId);return {ok:true,bought:true};}
  return this.queuePurchase(team,unitId,itemId);
 }

 // Batch3 offensive item contracts. All casts/secondary targets are server-side.
 refreshAttackItemBonusesV453Dev69B3(u){
  if(!u?.champ)return;
  const y=u.yunTalStacksV453Dev69B3||0;
  const next=u.items?.includes('yun_tal_wildarrows')?Math.min(25,y*ITEM_ATTACK_RULES_V453_DEV69_B3.yun_tal_wildarrows.critPerHit):0;
  const difference=next-(u.yunTalCritAppliedV453Dev69B3||0);
  u.critChance=(u.critChance||0)+difference;u.yunTalCritAppliedV453Dev69B3=next;
 }
 afterBasicAttackItemsV453Dev69B3(u,target,{landed,preHp}={}){
  if(!landed||!u?.champ||!target||u.team===target.team||target.hp<0)return;
  const ids=u.items||[],rules=ITEM_ATTACK_RULES_V453_DEV69_B3;
  if(ids.includes('yun_tal_wildarrows')){
   u.yunTalStacksV453Dev69B3=Math.min(100,(u.yunTalStacksV453Dev69B3||0)+1);
   this.refreshAttackItemBonusesV453Dev69B3(u);
   if(target.champ&&(u.yunTalFrenzyReadyAtV453Dev69B3||0)<=this.gameTime){
    u.yunTalFrenzyReadyAtV453Dev69B3=this.gameTime+rules.yun_tal_wildarrows.frenzyCooldown;
    u.yunTalFrenzyUntilV453Dev69B3=this.gameTime+rules.yun_tal_wildarrows.frenzyDuration;
   }
  }
  if(ids.includes('hullbreaker')&&((target.champ||target.monster)||['tower','inhibitor','nexus'].includes(target.type))){
   u.hullbreakerHitsV453Dev69B3=(u.hullbreakerHitsV453Dev69B3||0)+1;
   if(u.hullbreakerHitsV453Dev69B3%5===0&&target.hp>0){
    const ratio=['tower','inhibitor','nexus'].includes(target.type)?rules.hullbreaker.fifthStructureRatio:rules.hullbreaker.fifthRatio;
    this.damage(target,Math.max(1,target.maxHp*ratio),u,'physical','item_hullbreaker_b3');
   }
  }
  if(target.hp<=0)return;
  if(ids.includes('blade_of_ruined_king')){
   const b=rules.blade_of_ruined_king,ratio=u.range>.05?b.rangedCurrentHp:b.meleeCurrentHp;
   const raw=target.monster?Math.min(b.monsterCap,preHp*ratio):Math.max(1,preHp*ratio);
   this.damage(target,raw,u,'physical','item_bork_b3');
   if(target.champ){
    const state=u.borkHitsV453Dev69B3?.targetId===target.id&&u.borkHitsV453Dev69B3.until>this.gameTime?u.borkHitsV453Dev69B3:{targetId:target.id,n:0,until:this.gameTime+5};
    state.n++;
    if(state.n>=3){this.applyEffectV41(target,'slow',{source:u,duration:b.slowDuration,power:b.slow,key:'bork_'+u.id});state.n=0;}
    state.until=this.gameTime+5;u.borkHitsV453Dev69B3=state;
   }
  }
  if(ids.includes('terminus')){
   const b=rules.terminus;
   this.damage(target,b.magicOnHit,u,'magic','item_terminus_b3');
   if(target.champ){
    const state=u.terminusV453Dev69B3?.until>this.gameTime?u.terminusV453Dev69B3:{light:0,dark:0,until:0,next:'light'};
    if(state.next==='light')state.light=Math.min(b.maxStacks,state.light+1);
    else state.dark=Math.min(b.maxStacks,state.dark+1);
    state.next=state.next==='light'?'dark':'light';state.until=this.gameTime+b.seconds;
    u.terminusV453Dev69B3=state;
   }
  }
  if(ids.includes('runaans_hurricane')){
   const b=rules.runaans_hurricane;
   const eligible=[...this.units,...this.minions].filter(v=>v.id!==target.id&&v.hp>0&&v.team!==u.team&&v.team===target.team&&
    (!v.spawnAt||v.spawnAt<=this.gameTime)&&this.canSeePoint(u.team,v)&&this.mapDistance(target,v)<=b.radius)
    .sort((a,b)=>this.mapDistance(target,a)-this.mapDistance(target,b)||a.id.localeCompare(b.id)).slice(0,b.bolts);
   for(const v of eligible)this.damage(v,Math.max(1,u.ad*b.damageRatio),u,'physical','item_runaan_b3');
  }
  const cleave=ids.find(id=>['tiamat','ravenous_hydra','titanic_hydra','profane_hydra','stridebreaker'].includes(id));
  if(cleave){
   const b=rules[cleave];const candidates=[...this.units,...this.minions].filter(v=>v.id!==target.id&&v.hp>0&&v.team!==u.team&&
    (!v.spawnAt||v.spawnAt<=this.gameTime)&&this.canSeePoint(u.team,v)&&this.mapDistance(target,v)<=b.radius);
   for(const v of candidates)this.damage(v,Math.max(1,u.ad*b.splashRatio),u,'physical','item_cleave_b3');
  }
 }
 afterChampionHitItemsV453Dev69B3(u,target,dealt,sourceType){
  if(!(dealt>0&&u?.champ&&target?.champ&&u.team!==target.team)||sourceType.startsWith('item_')||!['basic','spell','ability_onhit_v453_dev40'].includes(sourceType))return;
  if(u.items?.includes('eclipse')){
   const r=ITEM_ATTACK_RULES_V453_DEV69_B3.eclipse;
   const state=u.eclipseHitsV453Dev69B3;
   if((u.eclipseReadyAtV453Dev69B3||0)<=this.gameTime){
    if(state?.targetId===target.id&&state.until>=this.gameTime&&state.time!==this.gameTime){
     this.applyEffectV41(u,'shield',{source:u,duration:r.shieldDuration,power:Math.max(30,u.ad*r.shieldBonusAd),key:'eclipse_b3'});
     u.eclipseReadyAtV453Dev69B3=this.gameTime+r.cooldown;u.eclipseHitsV453Dev69B3=null;
    }else u.eclipseHitsV453Dev69B3={targetId:target.id,time:this.gameTime,until:this.gameTime+r.twoHitWindow};
   }
  }
 }
 activateCleaveItemV453Dev69B3(team,unitId,itemId){
  const u=this.units.find(x=>x.id===unitId&&x.team===team&&x.hp>0);
  const spec=ITEM_ATTACK_RULES_V453_DEV69_B3[itemId];
  if(!u||!spec||!['tiamat','ravenous_hydra','titanic_hydra','profane_hydra','stridebreaker'].includes(itemId)||!u.items.includes(itemId))return {ok:false,reason:'item_ativo_nao_equipado'};
  if(this.ended||!['preparation','planning','decision'].includes(this.phase)||(this.phase!=='decision'&&this.teams[team].ready))return {ok:false,reason:'fase_invalida'};
  if(this.phase==='decision'&&this.pendingDecision?.unitId!==u.id)return {ok:false,reason:'decisao_nao_autorizada'};
  if(!this.effectResolverV41().canAct(u,'item').ok)return {ok:false,reason:'cc_impede_item'};
  const key='cleaveReadyAtV453Dev69B3';if((u[key]||0)>this.gameTime)return {ok:false,reason:'item_em_recarga'};
  // Only visible enemies in actual world range. An unseen enemy never leaks through active results/events.
  const victims=[...this.units,...this.minions].filter(v=>v.hp>0&&v.team!==team&&
   (!v.spawnAt||v.spawnAt<=this.gameTime)&&this.canSeePoint(team,v)&&this.mapDistance(u,v)<=spec.radius);
  u[key]=this.gameTime+spec.activeCooldown;
  for(const v of victims){this.damage(v,Math.max(1,u.ad*spec.activeRatio),u,'physical','item_cleave_active_b3');
   if(itemId==='stridebreaker'&&v.champ&&v.hp>0)this.applyEffectV41(v,'slow',{source:u,duration:spec.duration,power:spec.slow,key:'stridebreaker_b3'});
  }
  if(itemId==='stridebreaker'&&victims.some(v=>v.champ))u.stridebreakerSprintUntilV453Dev69B3=this.gameTime+spec.duration;
  this.event(u.champ+' ativou '+itemId+'.',team,'item_active',u.id);
  return {ok:true,itemId,hitIds:victims.map(v=>v.id),cooldownUntil:u[key]};
 }


 // Dev69 B6 - item effects are server-owned, deterministic and non-recursive.
 onOffensiveCastV453Dev69B6(u,slot){
  if(slot==='R'){
   if(u.items?.includes('yun_tal_demon_arrows')){u.b6DartShots=3;u.b6DartUntil=this.gameTime+8;}
   if(u.items?.includes('malignance'))u.b6UltimateDamageUntil=this.gameTime+4;
  }
  if(u.items?.includes('voltaic_cyclosword'))u.energizeStacksV453Dev38=100;
 }
 onOffensiveHitV453Dev69B6(u,target,dealt,sourceType){
  if(!(dealt>0&&u?.champ&&target?.champ&&u.team!==target.team)||sourceType.startsWith('item_')||
     !['spell','basic','ability_onhit_v453_dev40'].includes(sourceType))return;
  const now=this.gameTime,ids=u.items||[],r=ITEM_OFFENSE_RULES_V453_DEV69_B6;
  if(ids.includes('serpents_fang')){
   const cut=u.range>.05?r.serpents_fang.rangedCut:r.serpents_fang.shieldCut;
   if(!(target.b6SerpentUntil>now)){
    for(const shield of target.statusEffectsV41||[])if(['shield','physical_shield','magic_shield'].includes(shield.type)&&shield.until>now)shield.power*=1-cut;
    target.shield=Math.max(0,target.shield*(1-cut));
   }
   target.b6SerpentCut=cut;target.b6SerpentUntil=now+r.serpents_fang.seconds;
  }
  if(ids.includes('stormsurge')){
   target.b6StormRecords??={};const old=target.b6StormRecords[u.id],s=old&&now-old.start<=r.stormsurge.window?old:{start:now,total:0,readyAt:old?.readyAt||0};
   s.total+=dealt;
   if(s.total>=target.maxHp*r.stormsurge.requiredPct&&s.readyAt<=now){
    s.readyAt=now+r.stormsurge.cooldown;s.pendingAt=now+r.stormsurge.delay;s.sourceId=u.id;s.sourceTeam=u.team;
   }
   target.b6StormRecords[u.id]=s;
  }
  if(ids.includes('horizon_focus')&&sourceType!=='basic'&&this.mapDistance(u,target)>=r.horizon_focus.minRange){
   target.revealedUntil??={};target.revealedUntil[u.team]=Math.max(target.revealedUntil[u.team]||0,now+r.horizon_focus.revealSeconds);
   for(const enemy of this.units)if(enemy.team!==u.team&&enemy.hp>0&&this.mapDistance(target,enemy)<=r.horizon_focus.splashRadius&&this.canSeePoint(u.team,enemy)){
    enemy.revealedUntil??={};enemy.revealedUntil[u.team]=Math.max(enemy.revealedUntil[u.team]||0,now+r.horizon_focus.splashSeconds);
   }
  }
  if(!['spell','ability_onhit_v453_dev40'].includes(sourceType))return;
  if(ids.includes('blackfire_torch')){
   const s=r.blackfire_torch;
   this.applyEffectV41(target,'dot',{source:u,key:'blackfire_b6_'+u.id,duration:s.duration,power:s.magicPerSecond+u.ap*s.apRatio,interval:1,damageType:'magic'});
   target.b6BlackfireUntil??={};target.b6BlackfireUntil[u.id]=now+s.duration;
  }
  if(ids.includes('ludens_companion')&&(u.b6LudenReadyAt||0)<=now){
   const s=r.ludens_companion;u.b6LudenReadyAt=now+s.cooldown;
   const extras=this.units.filter(v=>v.id!==target.id&&v.hp>0&&v.team!==u.team&&this.canSeePoint(u.team,v)&&this.mapDistance(v,target)<=s.splashRadius)
    .sort((a,b)=>this.mapDistance(a,target)-this.mapDistance(b,target)||a.id.localeCompare(b.id));
   const pool=[target,...extras];
   for(let i=0;i<s.echoes;i++){const victim=pool[i%pool.length];if(victim.hp>0)this.damage(victim,s.magicPerEcho*(victim===target?1:.65),u,'magic','item_luden_b6');}
  }
  if(ids.includes('malignance')&&(u.b6UltimateDamageUntil||0)>now){
   target.b6Malignance??={};target.b6Malignance[u.id]={until:now+r.malignance.seconds,next:now+1};
  }
 }
 onOffensiveBasicV453Dev69B6(u,target,{energized=false,preHp=0}={}){
  if(!u?.champ||target.hp<=0||target.team===u.team)return;
  const ids=u.items||[],r=ITEM_OFFENSE_RULES_V453_DEV69_B6,now=this.gameTime;
  const blade=ids.find(id=>['lich_bane','iceborn_gauntlet','dusk_and_dawn'].includes(id));
  if(blade&&(u.spellbladeArmedUntilV453Dev29||0)>=now&&(u.spellbladeNextV453Dev29||0)<=now){
   u.spellbladeArmedUntilV453Dev29=-1;u.spellbladeNextV453Dev29=now+1.5;
   if(blade==='lich_bane')this.damage(target,u.ad*r.lich_bane.baseADRatio+u.ap*r.lich_bane.apRatio,u,'magic','item_lich_b6');
   if(blade==='iceborn_gauntlet'){
    this.damage(target,u.ad*r.iceborn_gauntlet.baseADRatio,u,'physical','item_iceborn_b6');
    for(const enemy of this.units.filter(v=>v.team!==u.team&&v.hp>0&&this.mapDistance(v,target)<=r.iceborn_gauntlet.fieldRadius&&this.canSeePoint(u.team,v)))
     this.applyEffectV41(enemy,'slow',{source:u,duration:r.iceborn_gauntlet.slowDuration,power:r.iceborn_gauntlet.slow,key:'iceborn_b6_'+u.id});
   }
   if(blade==='dusk_and_dawn'){
    this.damage(target,r.dusk_and_dawn.baseMagic+u.ap*r.dusk_and_dawn.apRatio,u,'magic','item_dusk_b6');
    this.effectResolverV41().heal(u,r.dusk_and_dawn.healBase+u.ap*r.dusk_and_dawn.healApRatio,u);
    if(target.hp>0)this.afterBasicAttackItemsV453Dev69B3(u,target,{landed:true,preHp:target.hp});
   }
  }
  if(energized){
   if(ids.includes('stormrazor')){
    this.damage(target,r.stormrazor.bonusMagic,u,'magic','item_stormrazor_b6');
    u.b6StormrazorUntil=now+r.stormrazor.moveSeconds;
   }
   if(ids.includes('voltaic_cyclosword')){
    this.damage(target,Math.max(1,preHp*r.voltaic_cyclosword.healthRatio),u,'physical','item_voltaic_b6');
    u.b6VoltaicUntil=now+r.voltaic_cyclosword.buffSeconds;
   }
   if(ids.includes('statikk_shiv')){
    const s=r.statikk_shiv;
    const victims=this.units.filter(v=>v.id!==target.id&&v.hp>0&&v.team!==u.team&&v.team===target.team&&
      this.canSeePoint(u.team,v)&&this.mapDistance(target,v)<=s.chainRadius)
      .sort((a,b)=>this.mapDistance(target,a)-this.mapDistance(target,b)||a.id.localeCompare(b.id)).slice(0,s.chainTargets);
    for(const v of victims)this.damage(v,s.magicDamage,u,'magic','item_statikk_b6');
   }
   u.energizeStacksV453Dev38=0;
  }
  if(ids.includes('yun_tal_demon_arrows')&&u.b6DartUntil>now&&(u.b6DartShots||0)>0){
   u.b6DartShots--;this.damage(target,Math.max(1,u.ad*r.yun_tal_demon_arrows.bonusTrueFraction),u,'true','item_darts_b6');
  }
 }
 advanceOffensiveItemsV453Dev69B6(){
  const now=this.gameTime,r=ITEM_OFFENSE_RULES_V453_DEV69_B6;
  for(const target of this.units){
   for(const [ownerId,s] of Object.entries(target.b6StormRecords||{})){
    if(!s.pendingAt||now<s.pendingAt)continue;
    s.pendingAt=null;const owner=this.units.find(v=>v.id===ownerId&&v.team!==target.team);
    if(!owner?.items?.includes('stormsurge'))continue;
    const victim=target.hp>0?target:this.units.filter(v=>v.hp>0&&v.team===target.team&&this.mapDistance(v,target)<=r.stormsurge.radius&&this.canSeePoint(owner.team,v))
     .sort((a,b)=>this.mapDistance(a,target)-this.mapDistance(b,target)||a.id.localeCompare(b.id))[0];
    if(victim)this.damage(victim,r.stormsurge.damage,owner,'magic','item_stormsurge_b6');
   }
   for(const [ownerId,s] of Object.entries(target.b6Malignance||{})){
    if(s.until<=now||target.hp<=0){delete target.b6Malignance[ownerId];continue;}
    if(s.next>now)continue;s.next=now+1;
    const owner=this.units.find(v=>v.id===ownerId&&v.team!==target.team);
    if(owner?.items?.includes('malignance'))this.damage(target,r.malignance.damagePerSecond,owner,'magic','item_malignance_b6');
   }
  }
 }
 onOffensiveKillV453Dev69B6(dead,credited,assists=[]){
  for(const u of [credited,...assists]){
   if(!u?.champ||u.team===dead.team||u.hp<=0)continue;
   if(u.items?.includes('axiom_arc')&&u.skillCds?.R>this.gameTime){
    const fraction=u===credited?ITEM_OFFENSE_RULES_V453_DEV69_B6.axiom_arc.ultimateRefundFraction:ITEM_OFFENSE_RULES_V453_DEV69_B6.axiom_arc.assistRefundFraction;
    u.skillCds.R=Math.max(this.gameTime,u.skillCds.R-(u.skillCds.R-this.gameTime)*fraction);
   }
   if(u.items?.includes('hubris')){u.b6HubrisKills=(u.b6HubrisKills||0)+1;u.b6HubrisUntil=this.gameTime+ITEM_OFFENSE_RULES_V453_DEV69_B6.hubris.seconds;}
  }
 }


 // Batch7 / training adapters. All temporary state is champion-owned and snapshot safe.
 b7HasElixir(u,id){return u?.b7Elixir?.id===id&&u.b7Elixir.until>this.gameTime;}
 b7DerivedStats(u){
  const r=ITEM_REMAINDER_RULES_V453_DEV69_B7,ids=u.items||[],now=this.gameTime;
  let ad=0,ap=0,abilityHaste=0,tenacity=0,healShieldPower=0,omnivamp=0,physicalVamp=0;
  if(this.b7HasElixir(u,'elixir_of_iron'))tenacity+=r.elixir_of_iron.tenacity;
  if(this.b7HasElixir(u,'elixir_of_sorcery'))ap+=r.elixir_of_sorcery.ap;
  if(this.b7HasElixir(u,'elixir_of_wrath')){ad+=r.elixir_of_wrath.ad;physicalVamp+=r.elixir_of_wrath.physicalVamp;}
  if(ids.includes('endless_hunger')){
   const itemAd=ids.reduce((n,id)=>n+(catalog.find(v=>v.id===id)?.stats?.ad||0),0);
   abilityHaste+=Math.max(0,(u.ad||0)-itemAd)*r.endless_hunger.hastePerBonusAd;
   if(u.b7FeastUntil>now)omnivamp+=r.endless_hunger.feastOmnivamp;
  }
  if(ids.includes('whispering_circlet'))healShieldPower+=Math.floor((u.b7CircletMana||0)/120);
  if(ids.includes('diadem_of_songs'))healShieldPower+=Math.floor((u.b7CircletMana||0)/120);
  if(ids.some(id=>id==='voracious_greaves'||id==='immortal_journey'))omnivamp+=Math.min(10,u.b7VoraciousKills||0)*r.voracious_greaves.omnivampPerKill;
  if(ids.includes('protoplasm_harness')&&u.b7ProtoplasmUntil>now)tenacity+=r.protoplasm_harness.tenacity;
  if(ids.includes('scarlet_lucidity')&&u.b7ScarletUntil>now){} // speed resolved in effectiveMS
  return {ad,ap,abilityHaste,tenacity,healShieldPower,omnivamp,physicalVamp};
 }

 // Patch 26.11 reward: 8% of bonus AD, 8% of total AP. No permanent stat
 // mutation: inventory, undo, level-up, snapshot and respawn stay idempotent.
 b7MidQuestStatReward(u,otherAd=0,otherAp=0){
  if(!u?.champ||u.role!=='MID'||!u.b7MidQuestComplete)return {ad:0,ap:0};
  const stats=CHAMPION_STATS_V38[u.champ]||CLASS_STATS[u.klass]||{};
  const growth=CHAMPION_GROWTH_V38[u.champ];
  let nativeAd=Number(stats.ad)||0;
  for(let level=2;level<=Math.max(1,Math.min(18,u.level||1));level++)
   nativeAd+=growth?growthAtLevelV42(growth.ad??3,level):3;
  const bonusAd=Math.max(0,(Number(u.ad)||0)+otherAd-nativeAd);
  return {ad:bonusAd*.08,ap:Math.max(0,(Number(u.ap)||0)+otherAp)*.08};
 }

 // Midlane role quest (Riot 2026). Tier 3 footwear is a FREE reward, never a shop purchase.
 b7MidQuestTier3Map(){return {voracious_greaves:'immortal_journey',swifties:'swift_march',ionian_boots:'scarlet_lucidity',
  berserkers_greaves:'war_greaves',mercurys_treads:'chained_crushers',plated_steelcaps:'armored_mobilization',
  sorcerers_shoes:'enchanted_footwear'};}
 b7InMidLane(u){
  if(!u||u.hp<=0||!this.lanes?.mid)return false;
  const home=this.map.objects.find(o=>o.id===u.team+'_spawn_shop');
  if(home&&this.mapDistance(home,u)<600)return false;
  for(let t=.06;t<=.94;t+=.04)if(this.mapDistance(u,sampleLine(this.lanes.mid,t))<1050)return true;
  return false;
 }
 b7MidQuestAdd(u,points,reason='progress'){
  if(!u?.champ||u.role!=='MID'||u.b7MidQuestComplete||!Number.isFinite(points)||points<=0)return 0;
  const old=u.b7MidQuestPoints||0,after=Math.min(1350,old+points);
  u.b7MidQuestPoints=after;
  if(after>=1350){u.b7MidQuestComplete=true;this.b7MidBootUpgrade(u);
   this.event(u.champ+' completou a missão do MID: botas nível 3 liberadas.',u.team,'role_quest',u.id);}
  return after-old;
 }
 b7MidBootUpgrade(u){
  if(!u?.champ||u.role!=='MID'||!u.b7MidQuestComplete)return false;
  const pair=this.b7MidQuestTier3Map();
  const idx=u.items.findIndex(id=>Object.hasOwn(pair,id));
  if(idx<0)return false;
  const old=catalog.find(i=>i.id===u.items[idx]),next=catalog.find(i=>i.id===pair[old.id]);
  if(!old||!next)return false;
  this.removeRabadonV43(u);this.applyItemStatsV43(u,old,-1);
  u.items[idx]=next.id;this.applyItemStatsV43(u,next,1);this.reapplyRabadonV43(u);
  u.shopUndoV453Dev61=[];u.shopUndoRevokedV453Dev61=true;
  this.event(u.champ+' recebeu '+next.name+' gratuitamente pela missão do MID.',u.team,'item_upgrade',u.id);
  return true;
 }
 b7MidQuestPassive(){
  for(const u of this.units.filter(x=>x.role==='MID')){
   const last=u.b7MidQuestLastTick??this.gameTime-1;
   const delta=Math.max(0,Math.min(1,this.gameTime-last));u.b7MidQuestLastTick=this.gameTime;
   if(this.gameTime<65||u.hp<=0||!delta||u.b7MidQuestComplete)continue;
   // Patch 26.09: no passive progress for 12s after completed recall.
   // Roam allowance begins at level 3: 120s in lane banks 60s outside,
   // capped at 60s. All amounts use simulated authoritative seconds.
   if(this.gameTime<(u.b7MidQuestRecallBlockUntil||0))continue;
   const inLane=this.b7InMidLane(u);
   let bank=Math.max(0,Math.min(60,u.b7MidQuestRoamBank||0)),roam=0;
   if(inLane&&u.level>=3)bank=Math.min(60,bank+delta*.5);
   else if(!inLane&&u.level>=3){roam=Math.min(delta,bank);bank-=roam;}
   u.b7MidQuestRoamBank=bank;
   this.b7MidQuestAdd(u,inLane?delta*1.5:roam*1.5+(delta-roam)/3,'passive');
  }
 }

 b7NoxianUnlocked(team){return !!this.units.find(u=>u.team===team&&u.role==='MID'&&u.b7MidQuestComplete);}
 activateRemainderItemV453Dev69B7(team,unitId,itemId,targetId=null,point=null){
  const u=this.units.find(v=>v.id===unitId&&v.team===team&&v.hp>0),now=this.gameTime,r=ITEM_REMAINDER_RULES_V453_DEV69_B7;
  if(!u||this.ended||!['preparation','planning','decision'].includes(this.phase)||(this.phase!=='decision'&&this.teams[team].ready))return {ok:false,reason:'fase_ou_unidade_invalida'};
  if(this.phase==='decision'&&this.pendingDecision?.unitId!==u.id)return {ok:false,reason:'decisao_nao_autorizada'};
  if(!this.effectResolverV41().canAct(u,'item').ok)return {ok:false,reason:'cc_impede_item'};
  if(['elixir_of_iron','elixir_of_sorcery','elixir_of_wrath'].includes(itemId)){
   const index=u.items.indexOf(itemId);if(index<0||u.level<9)return {ok:false,reason:'elixir_nao_equipado_ou_nivel_insuficiente'};
   u.items.splice(index,1);u.b7Elixir={id:itemId,until:now+180};
   if(itemId==='elixir_of_iron'){u.maxHp+=r.elixir_of_iron.hp;u.hp+=r.elixir_of_iron.hp;u.b7ElixirBonusHp=r.elixir_of_iron.hp;}
   this.invalidateShopUndoOnDepartureV453Dev61(u);
   u.shopUndoV453Dev61=[];u.shopUndoRevokedV453Dev61=true;
   this.event(u.champ+' consumiu '+itemId+'.',team,'item_active',u.id);
   return {ok:true,itemId,until:u.b7Elixir.until};
  }
  if(!u.items?.includes(itemId))return {ok:false,reason:'item_ativo_nao_equipado'};
  if(!['actualizer','hextech_rocketbelt'].includes(itemId))return {ok:false,reason:'item_sem_ativo'};
  u.b7ActiveCooldowns??={};if((u.b7ActiveCooldowns[itemId]||0)>now)return {ok:false,reason:'recarga'};
  if(itemId==='actualizer'){
   u.b7ActualizerUntil=now+r.actualizer.activeSeconds;
   u.b7ActiveCooldowns[itemId]=now+r.actualizer.cooldown;
   this.event(u.champ+' ativou Concretizador.',team,'item_active',u.id);
   return {ok:true,itemId,until:u.b7ActualizerUntil};
  }
  // Rocketbelt requires a concrete authorized destination and never crosses terrain.
  const destination=point||(targetId?this.units.find(v=>v.id===targetId&&v.team!==team&&v.hp>0&&this.visible(team,v)):null);
  if(!destination||!Number.isFinite(destination.x)||!Number.isFinite(destination.y)||!this.walkable(destination.x,destination.y)||
     this.mapDistance(u,destination)>r.hextech_rocketbelt.distance||!this.lineOfSight(u,destination))
   return {ok:false,reason:'destino_ou_alcance_invalido'};
  const from={x:u.x,y:u.y};
  u.x=destination.x;u.y=destination.y;this.invalidateShopUndoOnDepartureV453Dev61(u);
  const victims=this.units.filter(v=>v.hp>0&&v.team!==team&&this.visible(team,v)&&this.mapDistance(u,v)<=r.hextech_rocketbelt.radius)
   .sort((a,b)=>a.id.localeCompare(b.id));
  u.b7ActiveCooldowns[itemId]=now+r.hextech_rocketbelt.cooldown;
  for(const v of victims)this.damage(v,r.hextech_rocketbelt.magicDamage+u.ap*r.hextech_rocketbelt.apRatio,u,'magic','item_rocketbelt_b7');
  this.event(u.champ+' ativou Explocinturão.',team,'item_active',u.id);
  return {ok:true,itemId,from,to:{x:u.x,y:u.y},hitIds:victims.map(v=>v.id)};
 }
 onRemainderCastV453Dev69B7(u,slot,kind){
  const now=this.gameTime,r=ITEM_REMAINDER_RULES_V453_DEV69_B7;
  if(kind==='skill'&&u.items?.includes('whispering_circlet')||kind==='skill'&&u.items?.includes('diadem_of_songs')){
   let next=u.b7CircletNext||0,charges=u.b7CircletCharges??5;
   if(next>0&&now>=next){const restored=Math.min(5-charges,1+Math.floor((now-next)/8));charges+=restored;next=charges>=5?0:next+restored*8;}
   if(charges>0&&(u.b7CircletMana||0)<360){
    u.b7CircletMana=Math.min(360,(u.b7CircletMana||0)+r.whispering_circlet.manaPerSpell);
    u.maxMana+=4;u.mana=Math.min(u.maxMana,u.mana+4);charges--;if(charges<5&&!next)next=now+8;
   }
   u.b7CircletCharges=charges;u.b7CircletNext=next;
   if(u.items.includes('whispering_circlet')&&u.b7CircletMana>=360)this.b7EvolveCirclet(u);
  }
  if(u.items?.includes('scarlet_lucidity')&&['skill','summoner'].includes(kind))u.b7ScarletUntil=now+r.scarlet_lucidity.sprintSeconds;
 }
 b7EvolveCirclet(u){
  const index=u.items?.indexOf('whispering_circlet');if(index<0)return false;
  const old=catalog.find(v=>v.id==='whispering_circlet'),next=catalog.find(v=>v.id==='diadem_of_songs');if(!next)return false;
  this.removeRabadonV43(u);this.applyItemStatsV43(u,old,-1);u.items[index]='diadem_of_songs';this.applyItemStatsV43(u,next,1);
  this.reapplyRabadonV43(u);this.event(u.champ+' evoluiu Tiara Sussurrante.',u.team,'item_upgrade',u.id);return true;
 }
 onRemainderHitV453Dev69B7(attacker,target,dealt,damageType,sourceType){
  if(!(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team)||sourceType.startsWith('item_')||
     !['spell','basic','ability_onhit_v453_dev40'].includes(sourceType))return;
  const u=attacker,now=this.gameTime,r=ITEM_REMAINDER_RULES_V453_DEV69_B7,ids=u.items||[];
  if(this.b7HasElixir(u,'elixir_of_sorcery')&&(u.b7SorceryReady?.[target.id]||0)<=now){
   u.b7SorceryReady??={};u.b7SorceryReady[target.id]=now+r.elixir_of_sorcery.championCooldown;
   if(target.hp>0)this.damage(target,r.elixir_of_sorcery.bonusTrue,u,'true','item_elixir_sorcery_b7');
  }
  if(ids.includes('bastionbreaker')&&sourceType!=='basic'&&(u.b7BastionReady||0)<=now){
   u.b7BastionReady=now+r.bastionbreaker.skillCooldown;
   if(target.hp>0)this.damage(target,r.bastionbreaker.skillTrueDamage,u,'true','item_bastion_skill_b7');
  }
  if(ids.includes('umbral_glaive')&&sourceType==='basic'&&u.b7UmbralHiddenSince>0&&now-u.b7UmbralHiddenSince>=r.umbral_glaive.concealSeconds&&target.hp>0){
   this.damage(target,r.umbral_glaive.trueDamage,u,'true','item_umbral_b7');u.b7UmbralHiddenSince=0;
  }
 }
 onRemainderKillV453Dev69B7(dead,credited,assists=[]){
  const r=ITEM_REMAINDER_RULES_V453_DEV69_B7;
  for(const u of [credited,...assists]){
   if(!u?.champ||u.hp<=0||u.team===dead.team)continue;
   const ids=u.items||[];
   if(ids.includes('endless_hunger'))u.b7FeastUntil=this.gameTime+r.endless_hunger.feastSeconds;
   if(ids.includes('voracious_greaves')||ids.includes('immortal_journey'))u.b7VoraciousKills=Math.min(10,(u.b7VoraciousKills||0)+1);
   if(ids.includes('bastionbreaker'))u.b7SabotageUntil=this.gameTime+r.bastionbreaker.sabotageSeconds;
  }
 }
 advanceRemainderItemsV453Dev69B7(){
  const now=this.gameTime,r=ITEM_REMAINDER_RULES_V453_DEV69_B7;
  for(const u of this.units){
   if(u.b7Elixir?.until<=now){
    if(u.b7ElixirBonusHp){u.maxHp=Math.max(1,u.maxHp-u.b7ElixirBonusHp);u.hp=Math.min(u.maxHp,u.hp);u.b7ElixirBonusHp=0;}
    u.b7Elixir=null;
   }
   if(u.b7ProtoplasmUntil>0&&u.b7ProtoplasmUntil<=now){u.maxHp=Math.max(1,u.maxHp-(u.b7ProtoplasmBonusHp||0));u.hp=Math.min(u.hp,u.maxHp);u.b7ProtoplasmBonusHp=0;u.b7ProtoplasmUntil=0;}
   if(!u.hp||u.hp<=0)continue;
   if(u.items?.includes('diadem_of_songs')&&u.b7ConsonanceUntil>now){
    const ally=this.units.filter(v=>v.hp>0&&v.team===u.team&&this.mapDistance(u,v)<=850&&v.hp<v.maxHp)
      .sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0];
    if(ally)this.effectResolverV41().heal(ally,25,u);
   }
   if(u.items?.includes('umbral_glaive')){
    const wards=this.wards.filter(w=>w.team!==u.team&&w.type!=='control'&&this.wardActive(w)&&this.mapDistance(u,w)<=r.umbral_glaive.revealRadius);
    if(wards.length)for(const w of wards)w.riftRevealedByV452d4={...(w.riftRevealedByV452d4||{}),[u.team]:now+r.umbral_glaive.revealSeconds};
   }
  }
 }

 // B4 family helpers are world-authoritative and use simulation seconds only.
 bonusItemManaV453Dev69B4(u){return Math.max(0,(u?.items||[]).reduce((sum,id)=>sum+(catalog.find(v=>v.id===id)?.stats?.mana||0),0)+(u.tearManaBonusV453Dev56||0));}
 refreshTearEvolutionV453Dev69B4(u){
  const id=['winters_approach','archangels_staff','manamune'].find(id=>u.items?.includes(id));
  u.tearEvolvedV453Dev69B4=!!id&&(u.tearManaBonusV453Dev56||0)>=360;
 }
 growRodV453Dev69B4(u){
  if(!u.items?.includes('rod_of_ages')||!Number.isFinite(u.rodBoughtAtV453Dev69B4))return;
  const s=ITEM_DEFENSE_RULES_V453_DEV69_B4.rod_of_ages;
  const next=Math.max(0,Math.min(s.maxStacks,Math.floor((this.gameTime-u.rodBoughtAtV453Dev69B4)/s.stackSeconds)));
  const delta=next-(u.rodStacksV453Dev69B4||0);if(delta<=0)return;
  this.removeRabadonV43(u);
  this.applyItemStatsV43(u,{stats:{hp:delta*s.hpPerStack,mana:delta*s.manaPerStack,ap:delta*s.apPerStack}},1);
  u.rodStacksV453Dev69B4=next;this.reapplyRabadonV43(u);
  if(next>=s.maxStacks&&!u.rodBonusLevelGrantedV453Dev69B4){u.rodBonusLevelGrantedV453Dev69B4=true;if(u.level<18){u.level++;u.skillPoints=(u.skillPoints||0)+1;}}
 }
 // Every emission is bounded to observed enemy units, never exposes hidden IDs.
 advanceDefensiveItemsV453Dev69B4(){
  const now=this.gameTime,r=ITEM_DEFENSE_RULES_V453_DEV69_B4,fx=this.effectResolverV41();
  for(const u of this.units){
   if(u.gaReviveAtV453Dev69B4&&now>=u.gaReviveAtV453Dev69B4){
    u.gaReviveAtV453Dev69B4=0;
    if(u.hp>0){u.hp=Math.max(u.hp,Math.round(u.maxHp*r.guardian_angel.reviveHpRatio));u.mana=u.maxMana;}
   }
   if(u.hp<=0)continue;
   this.growRodV453Dev69B4(u);this.refreshTearEvolutionV453Dev69B4(u);
   const warmog=ITEM_DEFENSE_RULES_V453_DEV69_B4.warmogs_armor;
   const healthFromOtherItems=(u.items||[]).reduce((sum,id)=>sum+(id==='warmogs_armor'?0:(catalog.find(v=>v.id===id)?.stats?.hp||0)),0);
   const warmogHp=u.items?.includes('warmogs_armor')?healthFromOtherItems*warmog.bonusHpPct:0;
   const winterHp=u.items?.includes('winters_approach')?this.bonusItemManaV453Dev69B4(u)*ITEM_DEFENSE_RULES_V453_DEV69_B4.winters_approach.bonusHpFromMana:0;
   const healthDelta=warmogHp+winterHp-(u.itemDerivedHealthV453Dev69B4||0);
   if(healthDelta){u.maxHp=Math.max(1,u.maxHp+healthDelta);u.hp=Math.min(u.maxHp,Math.max(1,u.hp+healthDelta));u.itemDerivedHealthV453Dev69B4=warmogHp+winterHp;}
   if(u.items?.includes('warmogs_armor')&&this.bonusHealthForGiantSlayerV453Dev69(u)>=r.warmogs_armor.requiredBonusHp&&
      now-(u.lastChampionDamageAtV453Dev69B4??-1e9)>=r.warmogs_armor.outOfCombat)
    fx.heal(u,u.maxHp*r.warmogs_armor.healPct,u);
   if(u.items?.includes('deaths_dance')&&Array.isArray(u.deathDanceQueueV453Dev69B4)){
    for(const d of u.deathDanceQueueV453Dev69B4){
     while(d.next<=now&&d.remaining>0&&u.hp>0){
      d.remaining--;d.next++;const source=this.units.find(v=>v.id===d.attackerId)||null;
      this.damage(u,d.power,source,'true','item_deaths_dance_deferred_b4');
     }
    }
    u.deathDanceQueueV453Dev69B4=u.deathDanceQueueV453Dev69B4.filter(d=>d.remaining>0);
   }
   if(u.items?.includes('heartsteel')){
    const tracking=u.heartsteelNearbyV453Dev69B4||(u.heartsteelNearbyV453Dev69B4={});
    for(const enemy of this.units.filter(v=>v.team!==u.team&&v.hp>0)){
     if(this.mapDistance(u,enemy)<=r.heartsteel.distance&&this.canSeePoint(u.team,enemy)){
      if(tracking[enemy.id]==null)tracking[enemy.id]=now;
     }else delete tracking[enemy.id];
    }
   }
   if(u.items?.includes('dead_mans_plate')){
    // Server-validated movement only. Staying stationary does not charge Momentum.
    const move=u.deadmanPreviousPositionV453Dev69B4;
    if(move&&this.mapDistance(move,u)>2)u.deadmanChargesV453Dev69B4=Math.min(r.dead_mans_plate.chargeSeconds,(u.deadmanChargesV453Dev69B4||0)+1);
    u.deadmanPreviousPositionV453Dev69B4={x:u.x,y:u.y};
   }
   const inFight=(u.combatUntil||0)>now;
   if(!inFight)continue;
   for(const id of ['sunfire_aegis','hollow_radiance','eternal_despair']){
    if(!u.items.includes(id)||now<(u['pulseAt_'+id]||0))continue;
    const spec=r[id];u['pulseAt_'+id]=now+(id==='eternal_despair'?spec.pulseSeconds:1);
    let total=0;
    for(const enemy of [...this.units,...this.minions]){
     if(enemy.team===u.team||enemy.hp<=0||enemy.spawnAt>now||this.mapDistance(u,enemy)>spec.radius||!this.canSeePoint(u.team,enemy))continue;
     const hit=this.damage(enemy,id==='eternal_despair'?spec.magicDamage:spec.baseDamage+u.maxHp*spec.hpRatio,u,'magic','item_immolate_b4');
     if(id==='eternal_despair'&&enemy.champ)total+=hit;
    }
    if(total>0)fx.heal(u,total*r.eternal_despair.healFactor,u);
   }
  }
 }
 afterTankHitV453Dev69B4(attacker,target,dealt,damageType,sourceType){
  if(!(dealt>0&&target?.champ))return;
  if(attacker?.champ&&attacker.team!==target.team){
   target.lastChampionDamageAtV453Dev69B4=this.gameTime;attacker.combatUntil=Math.max(attacker.combatUntil||0,this.gameTime+6);
   if(attacker.items?.includes('jaksho_the_protean')&&!sourceType.startsWith('item_')){
    const p=attacker.jakshoCombatV453Dev69B4;
    attacker.jakshoCombatV453Dev69B4=p?.last>=this.gameTime-5?{start:p.start,last:this.gameTime}:{start:this.gameTime,last:this.gameTime};
   }
   if(target.items?.includes('jaksho_the_protean')){
    const state=target.jakshoCombatV453Dev69B4;
    target.jakshoCombatV453Dev69B4=state?.last>=this.gameTime-5?{start:state.start,last:this.gameTime}:{start:this.gameTime,last:this.gameTime};
   }
  }
  if(!attacker?.champ||attacker.team===target.team||sourceType.startsWith('item_')||!['basic','spell','ability_onhit_v453_dev40'].includes(sourceType))return;
  if(attacker.items?.includes('spear_of_shojin')&&sourceType!=='basic'){
   const s=target.shojinDebuffV453Dev69B4?.[attacker.id],stacks=Math.min(4,(s?.until>this.gameTime?s.stacks:0)+1);
   target.shojinDebuffV453Dev69B4??={};target.shojinDebuffV453Dev69B4[attacker.id]={stacks,until:this.gameTime+6};
  }
 }
 afterTankBasicV453Dev69B4(u,target,landed){
  if(!landed||!u?.champ||!target?.champ||u.team===target.team||target.hp<=0)return;
  const r=ITEM_DEFENSE_RULES_V453_DEV69_B4;
  if(u.items.includes('heartsteel')){
   const ready=(u.heartsteelPerTargetV453Dev69B4||{})[target.id]||0;
   if(ready<=this.gameTime&&this.gameTime-(u.heartsteelNearbyV453Dev69B4?.[target.id]??this.gameTime)>=r.heartsteel.chargeSeconds){
    const raw=r.heartsteel.damageFlat+u.maxHp*r.heartsteel.hpDamageRatio;
    const dealt=this.damage(target,raw,u,'physical','item_heartsteel_b4');
    if(dealt>0){const gain=Math.max(1,Math.floor(dealt*r.heartsteel.healthGainRatio));u.heartsteelBonusHpV453Dev69B4=(u.heartsteelBonusHpV453Dev69B4||0)+gain;u.maxHp+=gain;u.hp+=gain;}
    u.heartsteelPerTargetV453Dev69B4??={};u.heartsteelPerTargetV453Dev69B4[target.id]=this.gameTime+r.heartsteel.targetCooldown;
   }
  }
  if(u.items.includes('dead_mans_plate')&&(u.deadmanChargesV453Dev69B4||0)>0){
   const scale=(u.deadmanChargesV453Dev69B4||0)/r.dead_mans_plate.chargeSeconds;
   this.damage(target,r.dead_mans_plate.damageFlat*scale,u,'physical','item_deadman_b4');
   this.applyEffectV41(target,'slow',{source:u,power:.3*scale,duration:r.dead_mans_plate.slowSeconds,key:'deadman_b4'});
   u.deadmanChargesV453Dev69B4=0;
  }
 }
 onDefensiveTakedownV453Dev69B4(u){
  if(!u?.items?.includes('deaths_dance'))return;
  u.deathDanceQueueV453Dev69B4=[];
  this.effectResolverV41().heal(u,u.maxHp*ITEM_DEFENSE_RULES_V453_DEV69_B4.deaths_dance.healOnTakedown,u);
 }


 // Batch5 — server-only support triggers; a single callback covers Nami W,
 // summoner Heal and all EffectResolver shields without champion-kit edits.
 supportTeamMovePercentV453Dev69B5(u){
  return this.units.some(a=>a.team===u.team&&a.hp>0&&a.items?.includes('shurelyas_battlesong')&&
   a.shurelyaUntilV453Dev69B5>this.gameTime&&this.mapDistance(a,u)<=ITEM_SUPPORT_RULES_V453_DEV69_B5.shurelyas_battlesong.radius)?.30:0;
 }
 supportTeamMoveFlatV453Dev69B5(u){
  return this.units.some(a=>a.team===u.team&&a.hp>0&&a.items?.includes('bandocanos')&&
   a.bandocanosUntilV453Dev69B5>this.gameTime&&this.mapDistance(a,u)<=ITEM_SUPPORT_RULES_V453_DEV69_B5.bandocanos.radius)?20:0;
 }
 supportBuffsV453Dev69B5(u){
  const now=this.gameTime,regen=(u.manaRegenBasePct||0)/100;
  const dawn=u.items?.includes('dawncore')?ITEM_SUPPORT_RULES_V453_DEV69_B5.dawncore:null;
  return {ap:(u.staffBuffUntilV453Dev69B5>now?40:0)+(dawn?regen*dawn.bonusApPerRegen100:0),
   abilityHaste:u.staffBuffUntilV453Dev69B5>now?15:0,
   healShieldPower:dawn?regen*dawn.bonusHealPerRegen100:0};
 }
 supportActivationGateV453Dev69B5(team,unitId,itemId,targetId){
  const u=this.units.find(v=>v.id===unitId&&v.team===team&&v.hp>0);
  if(!u||!u.items?.includes(itemId)||this.ended)return {ok:false,reason:'item_ativo_nao_equipado'};
  if(!['preparation','planning','decision'].includes(this.phase)||(this.phase!=='decision'&&this.teams[team].ready))return {ok:false,reason:'fase_invalida'};
  if(this.phase==='decision'&&this.pendingDecision?.unitId!==u.id)return {ok:false,reason:'decisao_nao_autorizada'};
  if(!this.effectResolverV41().canAct(u,'item').ok)return {ok:false,reason:'cc_impede_item'};
  if((u.supportReadyV453Dev69B5?.[itemId]||0)>this.gameTime)return {ok:false,reason:'item_em_recarga'};
  const target=targetId?this.units.find(v=>v.id===targetId&&v.hp>0):null;
  if(targetId&&!target)return {ok:false,reason:'alvo_indisponivel'};
  const enemy=itemId==='hextech_gunblade';
  if(target&&((enemy&&target.team===team)||(!enemy&&target.team!==team)))return {ok:false,reason:'alvo_invalido'};
  if(enemy&&(!target||!this.visible(team,target)))return {ok:false,reason:'alvo_inimigo_nao_visivel'};
  const limit=ITEM_SUPPORT_RULES_V453_DEV69_B5[itemId]?.range||ITEM_SUPPORT_RULES_V453_DEV69_B5[itemId]?.radius||900;
  if(target&&this.mapDistance(u,target)>limit)return {ok:false,reason:'fora_do_alcance'};
  return {ok:true,u,target};
 }
 activateSupportItemV453Dev69B5(team,unitId,itemId,targetId=null){
  const q=this.supportActivationGateV453Dev69B5(team,unitId,itemId,targetId);if(!q.ok)return q;
  const {u,target}=q,now=this.gameTime,s=ITEM_SUPPORT_RULES_V453_DEV69_B5[itemId],fx=this.effectResolverV41();
  const nearby=team=>this.units.filter(a=>a.team===team&&a.hp>0&&this.mapDistance(u,a)<=s.radius);
  if(itemId==='mikaels_blessing'&&!target)return {ok:false,reason:'alvo_aliado_obrigatorio'};
  if(itemId==='knights_vow'&&(!target||target===u))return {ok:false,reason:'escolha_aliado_distinto'};
  if(itemId==='redemption'&&target&&!this.canSeePoint(team,target))return {ok:false,reason:'alvo_nao_visivel'};
  if(itemId==='shurelyas_battlesong'){
   u.shurelyaUntilV453Dev69B5=now+s.duration;
   // Owner-centered aura with server-side positions; effects expire off-range.
  }else if(itemId==='locket_of_the_iron_solari'){
   for(const ally of nearby(team))fx.apply(ally,'shield',{source:u,power:s.shieldBase+s.shieldPerLevel*(u.level-1),duration:s.shieldDuration,key:'locket_b5_'+u.id});
  }else if(itemId==='mikaels_blessing'){
   fx.remove(target,{types:['stun','root','slow','silence','blind','disarm','grounded','fear','charm','taunt','polymorph','sleep']});
   fx.heal(target,s.healBase+s.healPerLevel*(u.level-1),u);
  }else if(itemId==='knights_vow'){
   u.knightsVowTargetV453Dev69B5=target.id;
  }else if(itemId==='redemption'){
   const center=target||u;
   u.redemptionPendingV453Dev69B5={x:center.x,y:center.y,due:now+s.delay,sourceTeam:team};
  }else if(itemId==='hextech_gunblade'){
   this.damage(target,s.baseMagic+u.ap*s.apRatio,u,'magic','item_gunblade_b5');
   if(target.hp>0)this.applyEffectV41(target,'slow',{source:u,duration:s.slowDuration,power:s.slow,key:'gunblade_b5_'+u.id});
  }
  u.supportReadyV453Dev69B5??={};u.supportReadyV453Dev69B5[itemId]=now+(s.cooldown||0);
  this.event(`${u.champ} ativou ${catalog.find(v=>v.id===itemId)?.name||itemId}.`,team,'item_active',u.id);
  return {ok:true,itemId,targetId:target?.id||null,cooldownUntil:u.supportReadyV453Dev69B5[itemId]};
 }
 afterSupportProtectionV453Dev69B5(source,target,amount,kind){
  if(!source?.champ||!target?.champ||source.hp<=0||source.team!==target.team||source===target||amount<=0||this._supportRelayV453Dev69B5)return;
  const r=ITEM_SUPPORT_RULES_V453_DEV69_B5;
  this._supportRelayV453Dev69B5=true;
  try{
   for(const recipient of [source,target]){
    if(source.items?.includes('ardent_censer'))recipient.ardentUntilV453Dev69B5=this.gameTime+r.ardent_censer.duration;
    if(source.items?.includes('staff_of_flowing_water'))recipient.staffBuffUntilV453Dev69B5=this.gameTime+r.staff_of_flowing_water.duration;
   }
   if(source.items?.includes('echoes_of_helia')&&(source.heliaChargesV453Dev69B5||0)>0){
    const charges=source.heliaChargesV453Dev69B5;source.heliaChargesV453Dev69B5=0;
    this.effectResolverV41().heal(target,charges*r.echoes_of_helia.healPerCharge,source);
   }
   if(source.items?.includes('moonstone_renewer')){
    const other=this.units.filter(u=>u.hp>0&&u.team===source.team&&u!==source&&u!==target&&this.mapDistance(u,source)<=r.moonstone_renewer.range)
     .sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0];
    if(other){
     if(kind==='heal')this.effectResolverV41().heal(other,amount*r.moonstone_renewer.healRatio,source);
     else this.effectResolverV41().apply(other,'shield',{source,duration:3,power:amount*r.moonstone_renewer.shieldRatio,key:'moonstone_b5_'+source.id});
    }
   }
  }finally{this._supportRelayV453Dev69B5=false;}
 }
 afterSupportCCV453Dev69B5(source,target,type){
  if(!source?.champ||source.team===target.team)return;
  if(source.items?.includes('imperial_mandate'))target.imperialVulnerableV453Dev69B5={until:this.gameTime+ITEM_SUPPORT_RULES_V453_DEV69_B5.imperial_mandate.duration,by:source.id};
  if(source.items?.includes('bandocanos'))source.bandocanosUntilV453Dev69B5=this.gameTime+ITEM_SUPPORT_RULES_V453_DEV69_B5.bandocanos.duration;
 }
 afterSupportDamageV453Dev69B5(attacker,target,dealt,sourceType){
  if(!attacker?.champ||!target?.champ||attacker.team===target.team||dealt<=0)return;
  const r=ITEM_SUPPORT_RULES_V453_DEV69_B5;
  if(!sourceType.startsWith('item_')&&attacker.items?.includes('echoes_of_helia')){
   const n=attacker.heliaChargesV453Dev69B5||0;
   attacker.heliaChargesV453Dev69B5=Math.min(r.echoes_of_helia.maxCharges,n+1);
  }
  if(sourceType==='basic'&&attacker.ardentUntilV453Dev69B5>this.gameTime)this.damage(target,r.ardent_censer.onHitMagic,attacker,'magic','item_ardent_b5');
  if(sourceType!=='item_knights_vow_b5'){
   for(const ally of this.units){
    if(ally.team!==attacker.team||ally.hp<=0||ally.knightsVowTargetV453Dev69B5!==attacker.id||!ally.items?.includes('knights_vow')||this.mapDistance(ally,attacker)>r.knights_vow.range)continue;
    this.effectResolverV41().heal(ally,dealt*r.knights_vow.returnHeal,ally);
   }
  }
 }
 advanceSupportItemsV453Dev69B5(){
  const r=ITEM_SUPPORT_RULES_V453_DEV69_B5,fx=this.effectResolverV41(),now=this.gameTime;
  for(const u of this.units){
   if(u.hp<=0)continue;
   if(u.redemptionPendingV453Dev69B5&&u.redemptionPendingV453Dev69B5.due<=now){
    const p=u.redemptionPendingV453Dev69B5;u.redemptionPendingV453Dev69B5=null;
    for(const ally of this.units.filter(v=>v.team===u.team&&v.hp>0&&this.mapDistance(v,p)<=r.redemption.radius))fx.heal(ally,r.redemption.healBase+(u.level-1)*r.redemption.healPerLevel,u);
    for(const foe of this.units.filter(v=>v.team!==u.team&&v.hp>0&&this.mapDistance(v,p)<=r.redemption.radius&&this.visible(u.team,v)))this.damage(foe,foe.maxHp*r.redemption.enemyMaxHpRatio,u,'true','item_redemption_b5');
   }
   if(u.zekeStormUntilV453Dev69B5>now){
    if((u.zekeNextTickV453Dev69B5||0)>now)continue;
    u.zekeNextTickV453Dev69B5=now+1;
    for(const foe of this.units.filter(v=>v.team!==u.team&&v.hp>0&&this.mapDistance(v,u)<=r.zekes_convergence.radius&&this.visible(u.team,v))){
     this.damage(foe,r.zekes_convergence.magicDps,u,'magic','item_zeke_b5');
     this.applyEffectV41(foe,'slow',{source:u,power:r.zekes_convergence.slow,duration:1,key:'zeke_b5_'+u.id});
    }
   }
  }
 }
 afterSupportKillV453Dev69B5(dead,credited,assists=[]){
  const r=ITEM_SUPPORT_RULES_V453_DEV69_B5.cryptbloom;
  for(const u of [credited,...assists]){
   if(!u?.items?.includes('cryptbloom')||u.hp<=0||(u.cryptbloomReadyAtV453Dev69B5||0)>this.gameTime)continue;
   u.cryptbloomReadyAtV453Dev69B5=this.gameTime+r.cooldown;
   for(const ally of this.units.filter(v=>v.team===u.team&&v.hp>0&&this.mapDistance(v,dead)<=r.radius))this.effectResolverV41().heal(ally,r.healBase+u.ap*r.healApRatio,u);
  }
 }
 // Shared, snapshot-deterministic reactive item families. No ESM imports in engine.
 derivedItemStatsV453Dev69(u){
  if(!u?.champ)return {ad:0,ap:0,mr:0};
  const ids=u.items||[],bonusHp=this.bonusHealthForGiantSlayerV453Dev69(u);
  let ad=0,ap=0,mr=0,armor=0;
  if(ids.includes('hubris')&&u.b6HubrisUntil>this.gameTime)
    ad+=ITEM_OFFENSE_RULES_V453_DEV69_B6.hubris.baseBonusAd+(u.b6HubrisKills||0)*ITEM_OFFENSE_RULES_V453_DEV69_B6.hubris.perKillBonusAd;
   if(ids.includes('blackfire_torch')){
    const n=this.units.filter(v=>v.team!==u.team&&v.hp>0&&(v.b6BlackfireUntil?.[u.id]||0)>this.gameTime).length;
    ap+=(u.ap||0)*ITEM_OFFENSE_RULES_V453_DEV69_B6.blackfire_torch.bonusApPerTarget*n;
   }
   if(ids.includes('overlords_bloodmail')){
   const f=ITEM_FAMILY_RULES_V453_DEV69.overlords_bloodmail;
   ad+=bonusHp*f.bonusHpToAd;
   ad+=Math.max(0,u.ad)*f.maxMissingHpAdRatio*Math.max(0,1-u.hp/Math.max(1,u.maxHp));
  }
  if(ids.includes('steraks_gage')){
   const itemAd=ids.reduce((n,id)=>n+(catalog.find(v=>v.id===id)?.stats?.ad||0),0);
   ad+=Math.max(0,(u.ad||0)-itemAd)*ITEM_FAMILY_RULES_V453_DEV69.steraks_gage.baseAdRatio;
  }
  if(ids.includes('riftmaker'))ap+=bonusHp*ITEM_FAMILY_RULES_V453_DEV69.riftmaker.bonusHpToAp;
  if(ids.includes('force_of_nature')&&(u.forceNatureStacksV453Dev69||0)>=8&&(u.forceNatureUntilV453Dev69||0)>this.gameTime)
   mr+=ITEM_FAMILY_RULES_V453_DEV69.force_of_nature.mr;
  if(ids.includes('terminus')&&u.terminusV453Dev69B3?.until>this.gameTime){
   const light=u.terminusV453Dev69B3.light||0;
   armor+=light*ITEM_ATTACK_RULES_V453_DEV69_B3.terminus.resistPerLight;
   mr+=light*ITEM_ATTACK_RULES_V453_DEV69_B3.terminus.resistPerLight;
  }
  if(ids.includes('archangels_staff'))ap+=this.bonusItemManaV453Dev69B4(u)*ITEM_DEFENSE_RULES_V453_DEV69_B4.archangels_staff.bonusApFromMana;
  if(ids.includes('manamune'))ad+=this.bonusItemManaV453Dev69B4(u)*ITEM_DEFENSE_RULES_V453_DEV69_B4.manamune.bonusAdFromMana;
  if(ids.includes('jaksho_the_protean')&&u.jakshoCombatV453Dev69B4?.last>=this.gameTime-5&&
     this.gameTime-u.jakshoCombatV453Dev69B4.start>=ITEM_DEFENSE_RULES_V453_DEV69_B4.jaksho_the_protean.combatSeconds){
    const itemArmor=ids.reduce((n,id)=>n+(catalog.find(v=>v.id===id)?.stats?.armor||0),0);
    const itemMr=ids.reduce((n,id)=>n+(catalog.find(v=>v.id===id)?.stats?.mr||0),0);
    armor+=itemArmor*ITEM_DEFENSE_RULES_V453_DEV69_B4.jaksho_the_protean.resistRatio;
    mr+=itemMr*ITEM_DEFENSE_RULES_V453_DEV69_B4.jaksho_the_protean.resistRatio;
  }
  return {ad,ap,mr,armor};
 }
 itemBattleRampV453Dev69(attacker,id,sourceType){
  if(!attacker?.items?.includes(id)||!['basic','spell','ability_onhit_v453_dev40'].includes(sourceType))return 1;
  const spec=ITEM_FAMILY_RULES_V453_DEV69[id];
  const key=id==='riftmaker'?'riftmakerFightV453Dev69':'liandryFightV453Dev69';
  const prior=attacker[key];
  const start=prior&&prior.lastAt>=this.gameTime-5?prior.started:this.gameTime;
  const ratio=Math.min(spec.maxAmp,spec.ampPerSecond*Math.max(0,Math.floor(this.gameTime-start)));
  attacker[key]={started:start,lastAt:this.gameTime};
  return 1+ratio;
 }
 refreshKaenicShieldV453Dev69(u){
  if(!u?.champ||u.hp<=0||!u.items?.includes('kaenic_rookern')||(u.kaenicReadyAtV453Dev69||0)>this.gameTime)return;
  const spec=ITEM_FAMILY_RULES_V453_DEV69.kaenic_rookern;
  const list=u.statusEffectsV41||(u.statusEffectsV41=[]);
  const key='kaenic_v453_dev69';let shield=list.find(e=>e.key===key&&e.until>this.gameTime);
  if(shield){shield.power=Math.max(0,u.maxHp*spec.shieldMaxHpRatio);return;}
  list.push({id:++this.effectIdV41,type:'magic_shield',sourceId:u.id,key,
   power:Math.max(0,u.maxHp*spec.shieldMaxHpRatio),until:1e12,appliedAt:this.gameTime,
   damageType:'magic',interval:1,nextTick:this.gameTime+1});
 }
 procLifelineV453Dev69(u,damage,damageType){
  if(!u?.champ||damage<=0||u.hp-damage>=u.maxHp*.30||
     (u.lifelineReadyAtV453Dev69||0)>this.gameTime)return;
  const id=u.items?.find(i=>['maw_of_malmortius','immortal_shieldbow','steraks_gage'].includes(i));
  if(!id||id==='maw_of_malmortius'&&damageType!=='magic')return;
  const spec=ITEM_FAMILY_RULES_V453_DEV69[id];
  const bonusAd=(u.items||[]).reduce((n,i)=>n+Math.max(0,catalog.find(v=>v.id===i)?.stats?.ad||0),0);
  let power=id==='maw_of_malmortius'?(u.range>.05?spec.flatRanged+bonusAd*spec.bonusAdRanged:spec.flatMelee+bonusAd*spec.bonusAdMelee):
   id==='immortal_shieldbow'?(spec.shieldBase+Math.min(17,Math.max(0,(u.level||1)-1))*spec.shieldPerLevel)*(u.range>.05?.8:1):
   this.bonusHealthForGiantSlayerV453Dev69(u)*spec.shieldBonusHealthRatio;
  const type=id==='maw_of_malmortius'?'magic_shield':'shield';
  this.effectResolverV41().apply(u,type,{source:u,power,duration:spec.shieldSeconds,key:'lifeline_v453_dev69'});
  u.lifelineReadyAtV453Dev69=this.gameTime+spec.cooldown;
  if(id==='maw_of_malmortius')u.mawVampUntilV453Dev69=this.gameTime+6;
 }
 onBulkItemChampionHitV453Dev69(attacker,target,dealt,damageType,sourceType){
  if(!(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team))return;
  const ids=attacker.items||[],now=this.gameTime,fx=this.effectResolverV41();
  if(damageType==='physical'&&ids.includes('chempunk_chainsword')&&!sourceType.startsWith('item_'))
   fx.apply(target,'grievous_wounds',{source:attacker,duration:3,key:'chempunk_'+attacker.id});
  if(['spell','ability_onhit_v453_dev40'].includes(sourceType)&&ids.includes('seryldas_grudge')&&target.hp/Math.max(1,target.maxHp)<.50)
   fx.apply(target,'slow',{source:attacker,duration:1,power:.30,key:'serylda_'+attacker.id});
  if(['spell','ability_onhit_v453_dev40'].includes(sourceType)&&damageType==='magic'&&ids.includes('bloodletters_curse')){
   const old=target.bloodletterShredV453Dev69?.until>now?target.bloodletterShredV453Dev69:{stacks:0,until:0};
   target.bloodletterShredV453Dev69={stacks:Math.min(4,old.stacks+1),until:now+6};
  }
  if(ids.includes('cosmic_drive')&&['magic','true'].includes(damageType)&&!sourceType.startsWith('item_'))attacker.cosmicSprintUntilV453Dev69=now+4;
  if(ids.includes('liandrys_torment')&&sourceType==='spell'){
   const spec=ITEM_FAMILY_RULES_V453_DEV69.liandrys_torment;
   fx.apply(target,'dot',{source:attacker,duration:spec.burnSeconds,
    power:Math.max(1,target.maxHp*spec.burnMaxHpPerSecond),damageType:'magic',interval:1,key:'liandry_'+attacker.id});
  }
 }
 // Item Annul is unique per champion. Real status effect is restored only
 // when cooldown elapses with no subsequent enemy-champion damage.
 itemAnnulSpecV453Dev69Batch2(u){
  const id=u?.items?.find(id=>['verdant_barrier','banshees_veil','edge_of_night'].includes(id));
  return id?ITEM_EFFECTS_V43[id]:null;
 }
 refreshItemAnnulV453Dev69Batch2(u){
  if(!u?.champ||u.hp<=0)return;
  const spec=this.itemAnnulSpecV453Dev69Batch2(u);
  if(!spec||(u.itemAnnulReadyAtV453Dev69Batch2||0)>this.gameTime)return;
  const effects=u.statusEffectsV41||(u.statusEffectsV41=[]);
  if(effects.some(e=>e.type==='spell_shield'&&e.until>this.gameTime))return;
  effects.push({id:++this.effectIdV41,type:'spell_shield',sourceId:u.id,
   key:'item_annul_v453_dev69b2',power:0,until:1e12,appliedAt:this.gameTime,
   damageType:'magic',interval:1,nextTick:this.gameTime+1});
 }
 consumeItemAnnulV453Dev69Batch2(u,layer){
  if(layer?.key!=='item_annul_v453_dev69b2')return;
  const spec=this.itemAnnulSpecV453Dev69Batch2(u);
  if(spec)u.itemAnnulReadyAtV453Dev69Batch2=this.gameTime+spec.cooldown;
 }
 // Role-specific shop eligibility: no other role may use support/jungle quests.
 canBuy(team,unitId,itemId){
  const u=this.units.find(x=>x.id===unitId&&x.team===team), item=catalog.find(i=>i.id===itemId);
  if(!u||!item||this.teams[team].ready||this.phase==='executing'||this.phase==='decision')return {ok:false,reason:'Compras só durante o planejamento.'};
  if(item.tags.includes('noxian'))return {ok:false,reason:'Evolução gratuita exclusiva da missão do MID.'};
  const shop=this.map.objects.find(o=>o.id===team+'_spawn_shop');
  if(u.hp>0&&(!shop||dist(u,shop)>.075))return {ok:false,reason:'É necessário voltar à fonte.'};
  if(itemId==='health_potion'&&u.items.filter(id=>id===itemId).length>=5)return {ok:false,reason:'Máximo de cinco poções de vida.'};
  if(itemId==='health_potion'&&u.items.includes('refillable_potion')||itemId==='refillable_potion'&&u.items.includes('health_potion'))return {ok:false,reason:'Um único tipo de poção por campeão.'};
  if(item.notPurchasable)return {ok:false,reason:'Este equipamento evolui por missão.'};
  if(item.tags.includes('trinket'))return {ok:false,reason:'Trinkets são trocados sem custo na fonte.'};
  if(item.tags.includes('elixir')&&u.level<9)return {ok:false,reason:'elixir_exige_nivel_9'};
  if(itemId==='seekers_armguard'&&u.b7ArmguardEverUsed)return {ok:false,reason:'armaguarda_gasta'};
  if(itemId==='shattered_armguard'&&!u.b7ArmguardEverUsed)return {ok:false,reason:'somente_apos_armaguarda_consumida'};
  if(item.tags.includes('elixir')&&u.items.some(id=>catalog.find(i=>i.id===id)?.tags.includes('elixir')))return {ok:false,reason:'elixir_exclusivo'};
  if(itemId==='ward'&&(u.controlWardStock||0)>=2)return {ok:false,reason:'Limite de duas pinks no inventário.'};
  if((item.tags.includes('unique')||item.tags.includes('legendary')||item.tags.includes('epic'))&&u.items.includes(itemId))return {ok:false,reason:'Equipamento completo único: compra duplicada bloqueada.'};
  if(item.tags.includes('annul')&&u.items.some(id=>catalog.find(v=>v.id===id)?.tags.includes('annul')&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Apenas um item com Anular por campeão.'};
  if(item.tags.includes('cleave')&&u.items.some(id=>catalog.find(v=>v.id===id)?.tags.includes('cleave')&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Hidras/Fenda exclusivos por campeão.'};
  if(item.tags.includes('spellblade')&&u.items.some(id=>['sheen','trinity_force','essence_reaver','lich_bane','iceborn_gauntlet','dusk_and_dawn'].includes(id)&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Lâmina Arcana exclusiva.'};
  if(item.tags.includes('lifeline')&&u.items.some(id=>catalog.find(v=>v.id===id)?.tags.includes('lifeline')&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Um único efeito Salva-Vidas por campeão.'};
  if(item.tags.includes('fatality')&&u.items.some(i=>catalog.find(v=>v.id===i)?.tags.includes('fatality')&&i!==itemId))return {ok:false,reason:'Apenas um item de Penetração Fatal por campeão.'};
  if(item.roleLock&&item.roleLock!==u.role)return {ok:false,reason:'Item exclusivo da função '+item.roleLock+'.'};
  if(['sheen','trinity_force'].includes(itemId)&&u.items.some(id=>['sheen','trinity_force','essence_reaver','lich_bane','iceborn_gauntlet','dusk_and_dawn'].includes(id)&&!recipePurchasePartsV453Dev30(itemId,u.items).includes(id)))return {ok:false,reason:'Apenas um efeito Lâmina Arcana.'};
  if(u.role==='JG'&&!u.junglePet&&!JUNGLE_PETS.includes(itemId)&&itemId!=='ward')return {ok:false,reason:'Jungler precisa escolher companheiro de selva primeiro.'};
  if(JUNGLE_PETS.includes(itemId)&&u.junglePet)return {ok:false,reason:'Um companheiro de selva por partida.'};
  if(itemId==='support_atlas'&&u.items.some(i=>i.startsWith('support_')))return {ok:false,reason:'Atlas já equipado.'};
  if(itemId==='dark_seal'&&u.items.includes('mejais_soulstealer'))return {ok:false,reason:'Glória exclusiva: não equipar Lacre após Mejai.'};
  if(item.tags.includes('starter')&&!item.roleLock&&u.items.some(i=>catalog.find(c=>c.id===i)?.tags.includes('starter')))return {ok:false,reason:'Um item inicial por campeão.'};
  if((itemId==='boots'||item.tags.includes('boots'))&&u.items.some(i=>i==='boots'||catalog.find(c=>c.id===i)?.tags.includes('boots'))&&!this.itemRecipe(itemId).some(component=>u.items.includes(component)))return {ok:false,reason:'Apenas um par de botas por campeão.'};
  if(u.items.length>=6&&!recipePurchasePartsV453Dev30(itemId,u.items).length)return {ok:false,reason:'Inventário cheio.'};
  if(u.gold<this.itemPurchaseCost(u,itemId))return {ok:false,reason:'Ouro insuficiente.'};
  return {ok:true};
 }
 itemRecipe(itemId){return ITEM_RECIPES[itemId]||[];}
 itemPurchaseCost(u,itemId){const it=catalog.find(v=>v.id===itemId);if(!it)return Infinity;const discount=recipePurchasePartsV453Dev30(itemId,u.items).reduce((sum,id)=>sum+(catalog.find(v=>v.id===id)?.cost||0),0);return Math.max(0,it.cost-discount);}
 buy(team,unitId,itemId){
  const check=this.canBuy(team,unitId,itemId);if(!check.ok)return false;
  const u=this.units.find(x=>x.id===unitId&&x.team===team),item=catalog.find(i=>i.id===itemId);
  const undoBeforeV453Dev61=this.shopUnitStateV453Dev61(u);
  const cost=this.itemPurchaseCost(u,itemId);this.removeRabadonV43(u);this.spendGoldV452d4Dev7(u,cost);
  // Each ingredient instance is consumed at most once (duplicate recipes safe).
  for(const component of recipePurchasePartsV453Dev30(itemId,u.items)){
   const at=u.items.indexOf(component);if(at===-1)continue;
   u.items.splice(at,1);const old=catalog.find(v=>v.id===component);
   if(old)this.applyItemStatsV43(u,old,-1);
  }
  u.items.push(itemId);
  if(itemId==='yun_tal_wildarrows'){u.yunTalStacksV453Dev69B3=0;u.yunTalCritAppliedV453Dev69B3=0;}
  if(itemId==='rod_of_ages'){u.rodBoughtAtV453Dev69B4=this.gameTime;u.rodStacksV453Dev69B4=0;u.rodBonusLevelGrantedV453Dev69B4=false;}
  if(itemId==='heartsteel'){u.heartsteelBonusHpV453Dev69B4=0;u.heartsteelPerTargetV453Dev69B4={};}
  if(itemId==='guardian_angel')u.gaReadyAtV453Dev69B4=this.gameTime+1;
  if(['winters_approach','archangels_staff','manamune'].includes(itemId))this.refreshTearEvolutionV453Dev69B4(u);
  // Buying a new proc item creates its own cooldown/charge state. A consumed
  // Scout's Slingshot cannot keep its proc active after upgrading into RFC.
  if(itemId==='scouts_slingshot')u.scoutBullseyeReadyAtV453Dev38=0;
  if(itemId==='cull')u.cullMinionsV453Dev69=0;
  if(itemId==='kaenic_rookern')u.kaenicReadyAtV453Dev69=this.gameTime+ITEM_FAMILY_RULES_V453_DEV69.kaenic_rookern.rechargeSeconds;
  if(itemId==='kaenic_rookern')u.kaenicReadyAtV453Dev69=this.gameTime+ITEM_FAMILY_RULES_V453_DEV69.kaenic_rookern.rechargeSeconds;
  if(item.tags.includes('annul')){
   // Verdant -> Banshee preserves the cooldown of the consumed component.
   if(!undoBeforeV453Dev61.items?.some(id=>catalog.find(v=>v.id===id)?.tags.includes('annul')))u.itemAnnulReadyAtV453Dev69Batch2=this.gameTime;
   this.refreshItemAnnulV453Dev69Batch2(u);
  }
  if(['rapid_firecannon','statikk_shiv','stormrazor','voltaic_cyclosword'].includes(itemId))u.energizeStacksV453Dev38=0;
  if(itemId==='kraken_slayer')delete u.krakenHitV453Dev32;
  if(itemId==='guinsoos_rageblade'){
   u.guinsooStacksV453Dev54=0;u.guinsooUntilV453Dev54=0;u.guinsooHitCountV453Dev54=0;
  }
  if(itemId==='haunting_guise')delete u.hauntingGuiseCombatV453Dev54;
  if(itemId==='tear_of_the_goddess'){
   u.tearManaBonusV453Dev56=0;u.tearChargesV453Dev56=4;u.tearNextChargeAtV453Dev56=0;
  }
  if(itemId==='hextech_alternator')u.hextechAlternatorReadyAtV453Dev56=0;
  if(itemId==='bamis_cinder')u.bamiActiveUntilV453Dev57=0;
  if(itemId==='hexdrinker'){u.hexdrinkerReadyAtV453Dev57=0;u.hexdrinkerMagicBarrierV453Dev57=0;u.hexdrinkerBarrierUntilV453Dev57=0;}
  if(itemId==='dark_seal'||itemId==='mejais_soulstealer')this.setGloryStacksV453Dev58(u,u.gloryStacksV453Dev58||0);

  if(itemId==='refillable_potion')u.refillableChargesV453Dev32=2;
  if(itemId==='seekers_armguard')u.armguardSpentV453Dev37=false;
   if(['voracious_greaves','immortal_journey'].includes(itemId)&&!undoBeforeV453Dev61.items?.some(x=>['voracious_greaves','immortal_journey'].includes(x)))u.b7VoraciousKills=0;
  if(itemId==='zhonyas_hourglass'&&!u.items.includes('seekers_armguard'))u.armguardSpentV453Dev37=false;
  if(itemId==='ward')u.controlWardStock=(u.controlWardStock||0)+1;
  if(item.pet){u.junglePet=item.pet;u.junglePetStage=1;u.smiteTier=1;u.smiteDamage=600;}
  this.applyItemStatsV43(u,item,1);this.reapplyRabadonV43(u);
  this.recordEconomyV43(u,'purchase',-cost,itemId);
  this.recordShopUndoV453Dev61(u,'purchase',itemId,undoBeforeV453Dev61,cost);
   if(u.role==='MID'&&u.b7MidQuestComplete)this.b7MidBootUpgrade(u);
  this.event(`${u.champ} comprou ${item.name}.`,team,'purchase',u.id);return true;
 }
 // Shop mutations are zero-sum over inventory components and gold. Temporary
 // shield/HP bonuses are not retained after selling an item.
 removeRabadonV43(u){
  if(!u.rabadonBonusV43 && u.items.includes('rabadon')){
   // Compatibility with snapshots made before V4.3.
   u.rabadonBonusV43=Math.round(u.ap-u.ap/1.3);
  }
  if(u.rabadonBonusV43){u.ap-=u.rabadonBonusV43;u.rabadonBonusV43=0;}
 }
 reapplyRabadonV43(u){
  if(u.items.includes('rabadon')){u.rabadonBonusV43=Math.round(u.ap*.30);u.ap+=u.rabadonBonusV43;}
 }
 // DEV58: Glória is shared when Dark Seal upgrades to Mejai, and recalculated
 // atomically with Rabadon. Never count an inventory component twice.
 setGloryStacksV453Dev58(u,stacks){
  const id=u.items?.includes('mejais_soulstealer')?'mejais_soulstealer':u.items?.includes('dark_seal')?'dark_seal':null;
  const spec=id?ITEM_EFFECTS_V43[id]:null;
  const next=spec?Math.max(0,Math.min(spec.maxStacks,Math.trunc(stacks)||0)):0;
  const ap=next*(spec?.apPerStack||0);
  const speed=id==='mejais_soulstealer'&&next>=spec.speedThreshold?spec.movePercent/100:0;
  this.removeRabadonV43(u);
  u.ap+=(ap-(u.gloryBonusApV453Dev58||0));
  u.percentMoveSpeed=(u.percentMoveSpeed||0)+speed-(u.gloryBonusSpeedV453Dev58||0);
  u.gloryStacksV453Dev58=next;u.gloryBonusApV453Dev58=ap;u.gloryBonusSpeedV453Dev58=speed;
  this.reapplyRabadonV43(u);
  return next;
 }
 awardGloryV453Dev58(u,event){
  const id=u?.items?.includes('mejais_soulstealer')?'mejais_soulstealer':u?.items?.includes('dark_seal')?'dark_seal':null;
  if(!id)return 0;
  const spec=ITEM_EFFECTS_V43[id];
  return this.setGloryStacksV453Dev58(u,(u.gloryStacksV453Dev58||0)+(event==='kill'?spec.killStacks:spec.assistStacks));
 }
 applyItemStatsV43(u,item,sign){
  for(const [key,val] of Object.entries(item?.stats||{})){
   const delta=val*sign;
   if(key==='hp'){u.maxHp=Math.max(1,u.maxHp+delta);u.hp=Math.min(u.maxHp,Math.max(1,u.hp+delta));}
   else if(key==='mana'){u.maxMana=Math.max(0,u.maxMana+delta);u.mana=Math.min(u.maxMana,Math.max(0,u.mana+delta));}
   else if(key==='speed')u.flatMoveSpeed=(u.flatMoveSpeed||0)+delta;
   else if(key==='movePercent')u.percentMoveSpeed=(u.percentMoveSpeed||0)+delta/100;
   else if(key==='attackSpeedPct')u.attackSpeedBonusV453Dev29=(u.attackSpeedBonusV453Dev29||0)+delta;
   else if(key==='wards')u.wardCharges=Math.max(0,(u.wardCharges||0)+delta);
   else u[key]=(u[key]||0)+delta;
  }
 }
 recordEconomyV43(u,kind,delta,itemId=null){
  u.economyLedgerV43??=[];
  u.economySeqV43=(u.economySeqV43||0)+1;
  u.economyLedgerV43.push({seq:u.economySeqV43,at:this.gameTime,kind,delta,itemId,balance:u.gold});
  if(u.economyLedgerV43.length>500)u.economyLedgerV43.shift();
 }
 // Rune edits are allowed only BEFORE the first round; this is a local
 // prototype, not a shared ranked-match lobby or a server-signed loadout.
 chooseRunePageV43(team,unitId,pageId){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  const next=RUNE_PAGES_V43[pageId];
  if(!u||!next)return {ok:false,reason:'Página de runas inexistente.'};
  if(this.phase!=='preparation'||this.teams[team].ready||this.ended)return {ok:false,reason:'Runas só podem mudar antes da partida.'};
  if(u.runePageV43===pageId)return {ok:true,unchanged:true};
  const old=RUNE_PAGES_V43[u.runePageV43||'none'];
  this.removeRabadonV43(u);
  for(const [stat,value] of Object.entries(old?.shards||{}))this.applyItemStatsV43(u,{stats:{[stat]:value}},-1);
  for(const [stat,value] of Object.entries(next.shards))this.applyItemStatsV43(u,{stats:{[stat]:value}},1);
  u.runePageV43=pageId;u.runeProcNextV43=0;u.runeStacksV43=0;
  this.reapplyRabadonV43(u);
  return {ok:true,pageId};
 }
 // DEV61 — Reversible shop transactions. No client-provided gold, inventory or snapshots.
 // Unit snapshots exclude the undo stack, preventing recursive and unbounded history.
 shopUnitStateV453Dev61(u){
  const state=structuredCopy(u);delete state.shopUndoV453Dev61;delete state.shopUndoRevokedV453Dev61;return state;
 }
 // Leaving the fountain invalidates the WHOLE prior visit's undo history.
 // This is an irreversible event: going back into the fountain does not
 // resurrect old transactions. New purchases after returning start a new visit.
 invalidateShopUndoOnDepartureV453Dev61(u){
  if(!u?.champ||u.hp<=0||!(u.shopUndoV453Dev61?.length))return false;
  const source=this.map.objects.find(o=>o.id===u.team+'_spawn_shop');
  if(source&&this.mapDistance(u,source)<=1125)return false;
  u.shopUndoV453Dev61=[];
  u.shopUndoRevokedV453Dev61=true;
  return true;
 }
 recordShopUndoV453Dev61(u,kind,itemId,before,amount){
  // A new shop transaction after returning begins a new independent visit.
  this.invalidateShopUndoOnDepartureV453Dev61(u);
  u.shopUndoRevokedV453Dev61=false;
  const history=u.shopUndoV453Dev61||(u.shopUndoV453Dev61=[]);
  history.push({kind,itemId,amount,at:this.gameTime,before,
   afterCanonical:canonicalStateV40(this.shopUnitStateV453Dev61(u))});
  if(history.length>16)history.shift();
 }
 canUndoShopV453Dev61(team,unitId){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  if(!u)return {ok:false,reason:'Campeão inexistente.'};
  this.invalidateShopUndoOnDepartureV453Dev61(u);
  if(u.shopUndoRevokedV453Dev61)return {ok:false,reason:'Você saiu da fonte. As transações anteriores não podem mais ser desfeitas, mesmo após voltar.'};
  const last=u.shopUndoV453Dev61?.at(-1);
  if(!last)return {ok:false,reason:'Nenhuma compra ou venda recente para desfazer.'};
  if(this.teams[team].ready||!['preparation','planning'].includes(this.phase)||this.ended||this.pendingDecision)
   return {ok:false,reason:'Desfazer indisponível nesta fase.'};
  const shop=this.map.objects.find(o=>o.id===team+'_spawn_shop');
  if(u.hp>0&&(!shop||this.mapDistance(u,shop)>1125))return {ok:false,reason:'Você saiu da fonte.'};
  // Any simulated time advancement, combat, item consumption, gold award, skill
  // change or champion order mutation invalidates the recorded post-transaction state.
  if(this.gameTime!==last.at||canonicalStateV40(this.shopUnitStateV453Dev61(u))!==last.afterCanonical)
   return {ok:false,reason:'O item ou estado do campeão mudou após a transação.'};
  return {ok:true,kind:last.kind,itemId:last.itemId,amount:last.amount};
 }
 undoShopV453Dev61(team,unitId){
  const eligibility=this.canUndoShopV453Dev61(team,unitId);if(!eligibility.ok)return eligibility;
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  const history=u.shopUndoV453Dev61;const last=history.pop();
  const restored=structuredCopy(last.before);
  for(const key of Object.keys(u))if(key!=='shopUndoV453Dev61')delete u[key];
  Object.assign(u,restored);u.shopUndoV453Dev61=history;u.shopUndoRevokedV453Dev61=false;
  this.shopUndoAuditV453Dev61??=[];
  this.shopUndoAuditV453Dev61.push({team,unitId,kind:last.kind,itemId:last.itemId,
   amount:last.amount,at:this.gameTime,round:this.round});
  if(this.shopUndoAuditV453Dev61.length>500)this.shopUndoAuditV453Dev61.shift();
  this.event(`${u.champ} desfez ${last.kind==='purchase'?'a compra':'a venda'} de ${catalog.find(i=>i.id===last.itemId)?.name||last.itemId}.`,team,'shop_undo',u.id);
  return {ok:true,kind:last.kind,itemId:last.itemId,amount:last.amount};
 }
 // DEV60: Same preflight on the HUD and on the authoritative server.
 canSellItemV453Dev60(team,unitId,index){
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  if(!u||!Number.isInteger(index)||index<0||index>=u.items.length)return {ok:false,reason:'Posição inválida.'};
  if(this.teams[team].ready||!['preparation','planning'].includes(this.phase)||this.ended||this.pendingDecision)return {ok:false,reason:'Venda indisponível nesta fase.'};
  const shop=this.map.objects.find(o=>o.id===team+'_spawn_shop');
  // Dead champions can shop during the respawn screen. Alive ones must be at their fountain.
  if(u.hp>0&&(!shop||this.mapDistance(u,shop)>1125))return {ok:false,reason:'Volte à fonte para vender.'};
  const itemId=u.items[index],item=catalog.find(v=>v.id===itemId);
  if(!item||item.pet||item.roleLock||item.notPurchasable||item.tags.includes('quest')||item.tags.includes('trinket'))return {ok:false,reason:'Item de missão/pet não pode ser vendido.'};
  const refund=officialSaleValueV453Dev60(itemId);
  if(refund===null)return {ok:false,reason:'Preço de revenda não certificado para este item.'};
  return {ok:true,itemId,refund,price:item.cost,loss:item.cost-refund};
 }
 sellItemV43(team,unitId,index){
  const eligibility=this.canSellItemV453Dev60(team,unitId,index);
  if(!eligibility.ok)return eligibility;
  const u=this.units.find(v=>v.team===team&&v.id===unitId);
  const {itemId,refund}=eligibility,item=catalog.find(v=>v.id===itemId);
  const undoBeforeV453Dev61=this.shopUnitStateV453Dev61(u);
  this.removeRabadonV43(u);
  // Remove permanent item-derived stacks (but not other inventory grants).
  if(itemId==='rod_of_ages'&&(u.rodStacksV453Dev69B4||0)>0){const n=u.rodStacksV453Dev69B4;
   this.applyItemStatsV43(u,{stats:{hp:n*10,mana:n*30,ap:n*3}},-1);u.rodStacksV453Dev69B4=0;}
  if(itemId==='heartsteel'&&(u.heartsteelBonusHpV453Dev69B4||0)>0){
   const hp=u.heartsteelBonusHpV453Dev69B4;u.maxHp=Math.max(1,u.maxHp-hp);u.hp=Math.min(u.hp,u.maxHp);u.heartsteelBonusHpV453Dev69B4=0;}
  if(['winters_approach','archangels_staff','manamune'].includes(itemId)){
   const mana=u.tearManaBonusV453Dev56||0;u.maxMana=Math.max(0,u.maxMana-mana);u.mana=Math.min(u.mana,u.maxMana);
   u.tearManaBonusV453Dev56=0;u.tearEvolvedV453Dev69B4=false;
  }
  u.items.splice(index,1);this.applyItemStatsV43(u,item,-1);
  if(itemId==='ward')u.controlWardStock=Math.max(0,(u.controlWardStock||0)-1);
  if(itemId==='refillable_potion'){u.refillableChargesV453Dev32=0;u.potionHealingV453Dev32=null;}
  if(itemId==='seekers_armguard')u.armguardSpentV453Dev37=false;
  if(itemId==='scouts_slingshot')u.scoutBullseyeReadyAtV453Dev38=0;
  if(itemId==='cull')u.cullMinionsV453Dev69=0;
  if(itemId==='guardian_angel'){u.gaReadyAtV453Dev69B4=0;u.gaReviveAtV453Dev69B4=0;}
  if(itemId==='deaths_dance')u.deathDanceQueueV453Dev69B4=[];
  if(itemId==='heartsteel'){u.heartsteelNearbyV453Dev69B4={};u.heartsteelPerTargetV453Dev69B4={};}
  if(itemId==='rod_of_ages'){u.rodBoughtAtV453Dev69B4=null;u.rodBonusLevelGrantedV453Dev69B4=false;}
  if(['warmogs_armor','winters_approach'].includes(itemId)&&(u.itemDerivedHealthV453Dev69B4||0)){
   // Recompute from REMAINING inventory immediately: no temporary extra HP after sale.
   const warmog=u.items.includes('warmogs_armor')&&itemId!=='warmogs_armor';
   const winter=u.items.includes('winters_approach')&&itemId!=='winters_approach';
   const others=(u.items||[]).reduce((sum,id)=>sum+((id===itemId||id==='warmogs_armor')?0:(catalog.find(v=>v.id===id)?.stats?.hp||0)),0);
   const next=(warmog?others*.12:0)+(winter?this.bonusItemManaV453Dev69B4(u)*.08:0);
   const delta=next-u.itemDerivedHealthV453Dev69B4;u.itemDerivedHealthV453Dev69B4=next;u.maxHp=Math.max(1,u.maxHp+delta);u.hp=Math.min(u.hp,u.maxHp);
  }
  if(itemId==='dead_mans_plate')u.deadmanChargesV453Dev69B4=0;
  if(Object.prototype.hasOwnProperty.call(ITEM_REMAINDER_RULES_V453_DEV69_B7,itemId)){
   if(itemId==='whispering_circlet'||itemId==='diadem_of_songs'){
    u.maxMana=Math.max(0,u.maxMana-(u.b7CircletMana||0));u.mana=Math.min(u.mana,u.maxMana);u.b7CircletMana=0;
   }
   if(itemId==='protoplasm_harness'&&u.b7ProtoplasmBonusHp){u.maxHp=Math.max(1,u.maxHp-u.b7ProtoplasmBonusHp);u.hp=Math.min(u.hp,u.maxHp);u.b7ProtoplasmBonusHp=0;u.b7ProtoplasmUntil=0;}
   if(itemId==='actualizer')u.b7ActualizerUntil=0;
   if(itemId==='scarlet_lucidity')u.b7ScarletUntil=0;
   if(['voracious_greaves','immortal_journey'].includes(itemId))u.b7VoraciousKills=0;
  }
  if(Object.hasOwn(ITEM_OFFENSE_RULES_V453_DEV69_B6,itemId)){
   if(itemId==='malignance')u.b6UltimateDamageUntil=0;
   if(itemId==='yun_tal_demon_arrows')u.b6DartShots=0;
   if(itemId==='hubris')u.b6HubrisUntil=0;
   if(['statikk_shiv','stormrazor','voltaic_cyclosword'].includes(itemId))u.energizeStacksV453Dev38=0;
  }
  if(Object.prototype.hasOwnProperty.call(ITEM_SUPPORT_RULES_V453_DEV69_B5,itemId)){
   if(itemId==='knights_vow')u.knightsVowTargetV453Dev69B5=null;
   if(itemId==='redemption')u.redemptionPendingV453Dev69B5=null;
   if(itemId==='shurelyas_battlesong')u.shurelyaUntilV453Dev69B5=0;
   if(itemId==='zekes_convergence')u.zekeStormUntilV453Dev69B5=0;
   if(itemId==='bandocanos')u.bandocanosUntilV453Dev69B5=0;
   if(itemId==='echoes_of_helia')u.heliaChargesV453Dev69B5=0;
   if(itemId==='cryptbloom')u.cryptbloomReadyAtV453Dev69B5=0;
   if(u.supportReadyV453Dev69B5)delete u.supportReadyV453Dev69B5[itemId];
   for(const ally of this.units.filter(v=>v.team===u.team))for(const e of ally.statusEffectsV41||[])if(e.sourceId===u.id&&e.key?.startsWith('locket_b5_'))e.until=this.gameTime;
  }
  if(itemId==='yun_tal_wildarrows'){u.critChance=Math.max(0,(u.critChance||0)-(u.yunTalCritAppliedV453Dev69B3||0));u.yunTalStacksV453Dev69B3=0;u.yunTalCritAppliedV453Dev69B3=0;u.yunTalFrenzyUntilV453Dev69B3=0;}
  if(itemId==='terminus')u.terminusV453Dev69B3=null;
  if(itemId==='eclipse')u.eclipseHitsV453Dev69B3=null;
  if(itemId==='sundered_sky')u.sunderedTargetsV453Dev69B3={};
  if(itemId==='blade_of_ruined_king')u.borkHitsV453Dev69B3=null;
  if(itemId==='bloodthirster')for(const e of u.statusEffectsV41||[])if(e.key==='bloodthirster_b3')e.until=this.gameTime;
  if(item.tags.includes('cleave'))u.cleaveReadyAtV453Dev69B3=0;
  if(ITEM_FAMILY_RULES_V453_DEV69[itemId]){
   if(itemId==='kaenic_rookern')u.kaenicReadyAtV453Dev69=0;
   if(['maw_of_malmortius','immortal_shieldbow','steraks_gage'].includes(itemId)){u.lifelineReadyAtV453Dev69=0;u.mawVampUntilV453Dev69=0;}
   if(itemId==='force_of_nature'){u.forceNatureStacksV453Dev69=0;u.forceNatureUntilV453Dev69=0;}
   if(itemId==='cosmic_drive')u.cosmicSprintUntilV453Dev69=0;
   for(const e of u.statusEffectsV41||[])if(['kaenic_v453_dev69','lifeline_v453_dev69'].includes(e.key))e.until=this.gameTime;
  }
  if(item.tags.includes('annul')){
   u.itemAnnulReadyAtV453Dev69Batch2=0;
   for(const effect of u.statusEffectsV41||[])if(effect.key==='item_annul_v453_dev69b2')effect.until=this.gameTime;
  }
  if(itemId==='rapid_firecannon')u.energizeStacksV453Dev38=0;
  if(itemId==='kraken_slayer')delete u.krakenHitV453Dev32;
  if(itemId==='guinsoos_rageblade'){
   u.guinsooStacksV453Dev54=0;u.guinsooUntilV453Dev54=0;u.guinsooHitCountV453Dev54=0;
  }
  if(itemId==='haunting_guise')delete u.hauntingGuiseCombatV453Dev54;
  if(itemId==='tear_of_the_goddess'){
   const extra=Math.max(0,u.tearManaBonusV453Dev56||0);
   u.maxMana=Math.max(0,u.maxMana-extra);u.mana=Math.min(u.mana,u.maxMana);
   u.tearManaBonusV453Dev56=0;u.tearChargesV453Dev56=0;u.tearNextChargeAtV453Dev56=0;
  }
  if(itemId==='hextech_alternator')u.hextechAlternatorReadyAtV453Dev56=0;
  if(itemId==='bamis_cinder')u.bamiActiveUntilV453Dev57=0;
  if(itemId==='mercurial_scimitar')u.mercurialSprintUntilV453Dev59=0;
  if(itemId==='hexdrinker'){u.hexdrinkerReadyAtV453Dev57=0;u.hexdrinkerMagicBarrierV453Dev57=0;u.hexdrinkerBarrierUntilV453Dev57=0;}
  if(itemId==='dark_seal'||itemId==='mejais_soulstealer')this.setGloryStacksV453Dev58(u,0);

  if(itemId==='dorans_ring')u.doransCombatManaUntilV453Dev38=0;
  if(itemId==='randuins_omen')u.randuinsCdV453Dev31=0;
  if(itemId==='youmuus_ghostblade'){u.youmuusSprintUntilV453Dev29=0;u.youmuusSprintRatioV453Dev29=0;}
  if(itemId==='sheen'||itemId==='trinity_force')u.spellbladeArmedUntilV453Dev29=-1;
  this.reapplyRabadonV43(u);
  // Refund comes from Data Dragon gold.sell; never from a rounded generic percentage.
  this.creditGoldV452d4Dev7(u,refund,'refund');this.recordEconomyV43(u,'sale',refund,itemId);
  this.recordShopUndoV453Dev61(u,'sale',itemId,undoBeforeV453Dev61,refund);
  this.event(`${u.champ} vendeu ${item.name}.`,team,'sale',u.id);
  return {ok:true,refund,itemId,price:item.cost,loss:item.cost-refund};
 }
 equipStarterDefaults(team,includeLanes=true){
  if(this.phase!=='preparation')return;
  for(const u of this.units.filter(u=>u.team===team)){
   if(u.role==='JG'&&!u.junglePet)this.buy(team,u.id,'jungle_gustwalker');
   else if(includeLanes&&!u.items.some(id=>catalog.find(item=>item.id===id)?.tags.includes('starter'))){
    const itemId=u.role==='MID'&&u.klass==='assassin'?'dorans_blade':u.role==='TOP'&&u.klass!=='tank'?'dorans_blade':ROLE_STARTERS[u.role];
    if(itemId)this.buy(team,u.id,itemId);
   }
  }
 }
 setSmitePolicy(team,unitId,policy){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  if(!u||u.role!=='JG'||this.teams[team].ready||this.pendingDecision||this.phase==='executing'||this.ended)return {ok:false,reason:'Configure o Golpear durante o planejamento de um jungler.'};
  if(!policy||!['auto','hold','targets'].includes(policy.mode))return {ok:false,reason:'Modo de Golpear inválido.'};
  const rules=[];
  if(policy.mode==='targets'){
   if(!Array.isArray(policy.rules)||!policy.rules.length||policy.rules.length>this.camps.length)return {ok:false,reason:'Escolha de 1 a '+this.camps.length+' monstros para Golpear.'};
   for(const rule of policy.rules){
    const c=this.camps.find(v=>v.id===rule.targetId);
    if(!c||rules.some(v=>v.targetId===c.id))return {ok:false,reason:'Alvo de Golpear inexistente ou duplicado.'};
    if(rule.hpThreshold!==null&&rule.hpThreshold!==undefined&&(!Number.isInteger(rule.hpThreshold)||rule.hpThreshold<1||rule.hpThreshold>10000))return {ok:false,reason:'HP precisa ser inteiro entre 1 e 10.000.'};
    rules.push({targetId:c.id,hpThreshold:rule.hpThreshold??null});
   }
  }
  u.smitePolicy={mode:policy.mode,rules};
  const summary=policy.mode==='auto'?'uso automático para finalizar o campo':policy.mode==='hold'?'guardar todas as cargas':rules.map(r=>`${this.camps.find(c=>c.id===r.targetId)?.timerKey} HP ≤ ${r.hpThreshold??'dano do Smite'}`).join(', ');
  this.event(`${u.champ}: Golpear — ${summary}.`,team,'smite_plan',u.id);
  return {ok:true};
 }
 // Only the designated camp is attacked, even if camps have overlapping areas.
 combatCampTarget(u){
  const stage=this.activeStage(u),action=stage?.action;
  if(['jungle','objective'].includes(action)&&stage.targetId)return stage.targetId;
  if(['jungle','objective'].includes(action)||['jungle','objective'].includes(u.order?.kind)){
   // Any champion may clear a camp when ordered. Pet/Smite rewards remain jungler-only.
   const within=this.camps.filter(c=>c.alive&&this.mapDistance(u,c)<=Math.max(510,Math.min(900,u.range*this.worldWidth)));
   return within.sort((a,b)=>this.mapDistance(u,a)-this.mapDistance(u,b)||a.id.localeCompare(b.id))[0]?.id||null;
  }
  return null;
 }
 smitePower(u){return u.role==='JG'&&u.junglePet?[0,600,1000,1400][u.smiteTier||1]:0;}
 smiteReadyForObjectiveV452d4Dev9(u,c){
  if(!u||u.hp<=0||u.role!=='JG'||!this.hasSummonerV452d4Dev11(u,'smite')||!u.junglePet||!c?.alive||this.mapDistance(u,c)>SMITE_CONTEST_RULES_V452D4_DEV9.range)return false;
  const fx=this.effectResolverV41();
  if((u.stasisUntil||0)>this.gameTime||fx.has(u,'stasis')||fx.has(u,'suppression'))return false;
  this.recoverSmite(u);
  return u.smiteCharges>0&&(u.smiteCd||0)<=this.gameTime;
 }
 objectivePitRosterV452d4Dev9(c){
  // A defender counts by presence, even if attacking enemy champions instead
  // of the monster. Outside the pit, dead and fountain units cannot vote.
  return this.units.filter(u=>u.hp>0&&!u.awaitingShop&&this.mapDistance(u,c)<=850);
 }
 noSmitePitResultV452d4Dev9(c,smiteImpacts,attackImpacts,subId=''){
  if(!['dragon','herald','baron','voidgrubs'].includes(c.timerKey)||smiteImpacts.length!==0)return null;
  const nearby=this.objectivePitRosterV452d4Dev9(c);
  const blueJg=nearby.find(u=>u.team==='blue'&&u.role==='JG'),redJg=nearby.find(u=>u.team==='red'&&u.role==='JG');
  if(!blueJg||!redJg||this.smiteReadyForObjectiveV452d4Dev9(blueJg,c)||this.smiteReadyForObjectiveV452d4Dev9(redJg,c))return null;
  if(!attackImpacts.length)return null;
  const counts={blue:nearby.filter(u=>u.team==='blue').length,red:nearby.filter(u=>u.team==='red').length};
  const verdict=resolveNoSmiteObjectiveV452d4Dev9(this.seed,c.id+':'+subId,c.spawnCycle||0,this.gameTime,counts.blue,counts.red);
  const eligible=nearby.filter(u=>u.team===verdict.winner).sort((a,b)=>this.mapDistance(a,c)-this.mapDistance(b,c)||a.id.localeCompare(b.id));
  const attacker=attackImpacts.filter(p=>p.u.team===verdict.winner).sort((a,b)=>b.hit-a.hit||a.u.id.localeCompare(b.u.id))[0]?.u;
  return {...verdict,finisher:attacker||eligible[0]};
 }
 // Final-turn window only: no D/F prompt before a Smite could actually kill
 // the objective on this tick. Earlier ticks remain ordinary teamfights.
 maybePauseSmiteContestV452d4Dev9(c,fighters){
  if(!['dragon','herald','baron','voidgrubs'].includes(c.timerKey)||this.mode!=='bot'||this.phase!=='executing'||this.pendingDecision)return false;
  const firstGrub=c.timerKey==='voidgrubs'?c.grubsV45?.find(g=>g.alive):null;
  const hp=firstGrub?firstGrub.hp:c.health;
  const key=c.id+':'+(c.spawnCycle||0)+(firstGrub?':'+firstGrub.id:'');
  if(this.smiteContestDecidedV452d4Dev9?.includes(key))return false;
  const can=(team)=>fighters.find(u=>u.team===team&&this.smiteReadyForObjectiveV452d4Dev9(u,c));
  const blue=can('blue'),red=can('red');
  if(!blue||!red||hp>Math.max(this.smitePower(blue),this.smitePower(red))||hp<=0)return false;
  this.smiteContestV452d4Dev9={schema:'coachlol.smite-contest.v1',key,campId:c.id,spawnCycle:c.spawnCycle||0,
   openedAt:this.gameTime,openingHP:hp,blueId:blue.id,redId:red.id,grubId:firstGrub?.id||null,decision:null};
  this.pauseForDecision('smite_contest',blue.id,red.id);
  return true;
 }
 // Only the owning human can choose an actual Smite cast or HOLD. A bot
 // decision is made from its own current charges, tier and observed camp HP.
 submitSmiteContestV452d4Dev9(team,unitId,choice){
  const st=this.smiteContestV452d4Dev9,c=this.camps.find(x=>x.id===st?.campId),u=this.units.find(x=>x.id===unitId);
  if(!st||st.decision!==null||this.pendingDecision?.kind!=='smite_contest'||team!=='blue'||unitId!==st.blueId||!u||!c||!c.alive||c.spawnCycle!==st.spawnCycle)return {ok:false,reason:'disputa_indisponivel'};
  if(!['cast','hold'].includes(choice))return {ok:false,reason:'resposta_invalida'};
  const rival=this.units.find(x=>x.id===st.redId);
  const hits=[];
  const commit=(actor)=>{
   if(!actor||!this.smiteReadyForObjectiveV452d4Dev9(actor,c))return false;
   this.recoverSmite(actor);
   if(!actor.junglePet||actor.role!=='JG'||actor.smiteCharges<=0||(actor.smiteCd||0)>this.gameTime)return false;
   const hit=this.smitePower(actor);
   const action=this.performActionV40({actorId:actor.id,kind:'smite',campId:c.id,source:'competitive_objective',checkRange:false});
   if(!action.ok)return false;
   hits.push({actorId:actor.id,hit});
   this.event(`${actor.champ} usou Golpear competitivo: ${hit} dano verdadeiro.`,actor.team,'smite_cast',actor.id);
   return true;
  };
  if(choice==='cast'&&!commit(u))return {ok:false,reason:'golpear_indisponivel'};
  const botPolicy=rival?.smitePolicy||{mode:'auto',rules:[]};
  const botAllowed=botPolicy.mode!=='hold'&&
   (botPolicy.mode!=='targets'||botPolicy.rules?.some(rule=>rule.targetId===c.id&&st.openingHP<=(rule.hpThreshold??this.smitePower(rival))));
  const botCasts=!!rival&&botAllowed&&st.openingHP<=this.smitePower(rival);
  if(botCasts)commit(rival);
  st.decision=choice;st.impacts=hits;st.botCasts=botCasts;
  c.smiteForcedV452d4Dev9={key:st.key,impacts:hits.map(x=>({...x}))};
  if(choice==='hold')c.smiteManualHoldV452d4Dev9=st.key;
  this.smiteContestDecidedV452d4Dev9.push(st.key);
  this.answerDecision();
  return {ok:true,choice,openingHP:st.openingHP,impacts:hits,winner:resolveSimultaneousSmiteV452d4Dev9(st.openingHP,hits).winner};
 }
 recoverSmite(u){
  if(u.role!=='JG'||!u.junglePet)return;
  const due=(u.smiteRecoveries||[]).filter(at=>at<=this.gameTime);
  u.smiteCharges=Math.min(2,(u.smiteCharges||0)+due.length);
  u.smiteRecoveries=(u.smiteRecoveries||[]).filter(at=>at>this.gameTime);
 }
 useSmite(u,c){
  this.recoverSmite(u);
  if(c?.alive===false||!(c?.health>0)||!u.junglePet||u.role!=='JG'||u.smiteCharges<=0||(u.smiteCd||0)>this.gameTime)return 0;
  // Full camp actors use strict pit range/CC gating; legacy callers may pass
  // a health-only camp proxy to test charge/cooldown without coordinates.
  if(this.camps.includes(c)&&!this.smiteReadyForObjectiveV452d4Dev9(u,c))return 0;
  if(!this.camps.includes(c)&&((u.stasisUntil||0)>this.gameTime||this.effectResolverV41().has(u,'suppression')))return 0;
  const policy=u.smitePolicy||{mode:'auto',rules:[]};
  if(policy.mode==='hold')return 0;
  let threshold=this.smitePower(u),chosen=null;
  if(policy.mode==='targets'){
   chosen=policy.rules?.find(r=>r.targetId===c.id);
   if(!chosen)return 0;
   // Explicit rules apply once to each camp spawn; permanent across rounds.
   if(Object.hasOwn(u.smiteCastHistory||{},c.id)&&u.smiteCastHistory[c.id]===(c.spawnCycle||0))return 0;
   threshold=chosen.hpThreshold??threshold;
  }
  const healthToSmite=c.timerKey==='voidgrubs'&&c.grubsV45?.some(g=>g.alive)
   ?Math.min(...c.grubsV45.filter(g=>g.alive).map(g=>g.hp)):c.health;
  if(healthToSmite>threshold||this.mapDistance(u,c)>500)return 0;
  const damage=this.smitePower(u);
  if(damage<=0)return 0;
  const spent=this.performActionV40({actorId:u.id,kind:'smite',campId:this.camps.includes(c)?c.id:null,source:'jungle',checkRange:false});
  if(!spent.ok)return 0;
  if(chosen){u.smiteCastHistory??={};u.smiteCastHistory[c.id]=c.spawnCycle||0;}
  this.event(`${u.champ} Golpear ${c.timerKey} ao chegar em ${Math.ceil(c.health)} HP: ${damage} de dano verdadeiro.`,u.team,'smite_cast',u.id);
  return damage;
 }
 feedJunglePet(u){
  if(u.role!=='JG'||!u.junglePet||u.junglePetStage===3)return false;
  // A single large camp feeds the pet; periodic bonus treats may add one more.
  if(this.gameTime>=u.jungleNextBonusAt){u.jungleBonusTreats=Math.min(3,u.jungleBonusTreats+1);u.jungleNextBonusAt=this.gameTime+60;}
  const bonus=Math.min(1,u.jungleBonusTreats);u.jungleBonusTreats-=bonus;
  u.jungleTreats=Math.min(35,u.jungleTreats+1+bonus);
  if(u.jungleTreats>=35&&u.smiteTier<3){u.smiteTier=3;u.smiteDamage=1400;u.junglePetStage=3;u.jungleBuff=u.junglePet;
   u.items=u.items.filter(id=>!JUNGLE_PETS.includes(id));
   this.event(`${u.champ}: companheiro evoluiu! Smite Primal (1400), efeito ${u.jungleBuff}.`,u.team,'jungle_evolve',u.id);
  }else if(u.jungleTreats>=15&&u.smiteTier<2){u.smiteTier=2;u.smiteDamage=1000;u.junglePetStage=2;
   this.event(`${u.champ}: Smite Desencadeado (1000).`,u.team,'jungle_evolve',u.id);
  }
  return true;
 }
 progressSupport(u,amount){
  if(u.role!=='SUP'||!u.items.some(id=>id==='support_atlas'||id==='support_compass'||id==='support_bounty'))return false;
  if(u.supportQuest>=800)return false;
  const before=u.supportQuest;u.supportQuest=Math.min(800,before+amount);
  if(before<400&&u.supportQuest>=400){u.items=u.items.map(id=>id==='support_atlas'?'support_compass':id);u.wardCharges=Math.max(u.wardCharges,3);
   this.event(`${u.champ}: Atlas → Bússola Rúnica. 3 wards disponíveis.`,u.team,'support_evolve',u.id);}
  if(before<800&&u.supportQuest>=800){u.items=u.items.map(id=>id==='support_compass'?'support_bounty':id);u.wardCharges=Math.max(u.wardCharges,4);
   this.event(`${u.champ}: Recompensa dos Mundos. 4 wards disponíveis.`,u.team,'support_evolve',u.id);}
  return true;
 }
 restoreVisionCharges(){
  for(const u of this.units){
   if(u.trinket==='oracle'||u.role==='SUP'&&u.supportQuest>=400)continue;
   if(u.wardCharges>=2){u.trinketNextChargeAt=Math.max(this.gameTime,u.trinketNextChargeAt||0);continue;}
   if(this.gameTime>=(u.trinketNextChargeAt||210)){
    u.wardCharges=Math.min(2,u.wardCharges+1);
    u.trinketNextChargeAt=this.gameTime+Math.round(210-120*Math.min(1,(this.units.reduce((sum,x)=>sum+x.level,0)/this.units.length-1)/17));
   }
  }
 }
 supportPassiveTick(){
  for(const u of this.units.filter(u=>u.role==='SUP'&&u.hp>0)){
   if(!u.items.some(id=>id.startsWith('support_')))continue;
   if(this.gameTime>=(u.supportLastGoldTick||0)+10){u.supportLastGoldTick=this.gameTime;this.creditGoldV452d4Dev7(u,u.supportQuest>=400?5:3,'support_passive');this.progressSupport(u,u.supportQuest>=400?5:3);}
   if(this.gameTime>=u.supportNextChargeAt){u.supportCharges=Math.min(3,u.supportCharges+1);u.supportNextChargeAt=this.gameTime+20;}
  }
 }
 // A deliberate player action after shopping, never an automatic lane departure.
 leaveShop(team,unitId){
  const u=this.units.find(x=>x.id===unitId&&x.team===team);
  const source=this.map.objects.find(o=>o.id===team+'_spawn_shop');
  if(!u||!source||!u.awaitingShop||u.hp<=0||this.ended||this.teams[team].ready||this.mapDistance(u,source)>1125)return false;
  u.awaitingShop=false;u.autoFollow=true;u.manualMoveHold=false;u.explicitOrder=false;u.plan=null;u.order={kind:'auto',spell:'none'};
  this.event(`${u.champ} saiu da fonte por decisão do jogador.`,team,'shop_leave',u.id);
  return true;
 }
  lock(team){this.teams[team].ready=true}
 // Production UI: both teams commit while the world is frozen. A 60s opening
 // preparation is wall-clock-only. Execution steps are deterministic and are
 // stopped at a genuine decision prompt until the human answers.
 playTurn({autoStarter=true}={}){
  if(this.ended||this.phase==='executing'||this.pendingDecision||this.executionRemaining)return {ok:false,reason:'Termine a decisão atual.'};
  if(this.mode==='bot'&&!this.teams.red.ready)this.botPlan();
  if(this.phase==='preparation'){this.equipStarterDefaults('blue',autoStarter);this.equipStarterDefaults('red',true);}
  if(!this.teams.red.ready)return {ok:false,reason:'Aguardando confirmação da equipe adversária.'};
  this.lock('blue');this.finishPreparation();this.phase='executing';
  this.executionRemaining=this.roundSeconds;
  this.executionStart=this.gameTime;
  return {ok:true,running:true,remaining:this.executionRemaining};
 }
 continueExecution(maxSeconds=Infinity){
  if(this.executionRemaining<=0)return {ok:false,reason:'Não há rodada em execução.',remaining:0};
  if(this.ended||this.pendingDecision)return {ok:false,paused:!!this.pendingDecision,remaining:this.executionRemaining};
  this.phase='executing';
  let simulated=0;
  while(this.executionRemaining>0&&simulated<maxSeconds&&!this.pendingDecision&&!this.ended){this.gameTime++;this.executionRemaining--;simulated++;this.tick();}
  // A Nexus destroyed mid-window is a terminal result, not an eternally
  // executing turn. Finalize only elapsed seconds; never simulate bonus ticks.
  if(this.ended){
   this.executionRemaining=0;
   const finished=this.finishCompletedRound();
   return {...finished,simulated,ended:true,winner:this.winner};
  }
  if(this.pendingDecision){this.phase='decision';return {ok:true,paused:true,simulated,remaining:this.executionRemaining};}
  if(this.executionRemaining>0)return {ok:true,running:true,simulated,remaining:this.executionRemaining};
  const finished=this.finishCompletedRound();return {...finished,simulated};
 }
 finishCompletedRound(){
  if(this.executionRemaining>0||this.pendingDecision)return {ok:false,reason:'Ainda há execução pendente.'};
  const frame={round:this.round,mode:'simultaneous',seconds:this.gameTime-this.executionStart,simulatedSeconds:this.gameTime-this.executionStart,startGameTime:this.executionStart,endGameTime:this.gameTime};
  this.roundHistory.push(frame);this.lastResolvedSeconds=frame.seconds;
  this.round++;this.executionRemaining=0;this.phase=this.ended?'finished':'planning';
  for(const t of ['blue','red'])this.teams[t].ready=false;
  if(!this.ended){this.processPurchaseQueues('blue');this.processPurchaseQueues('red');}
  for(const u of this.units){u.spentMove=0;if(u.plan&&!u.plan.completed)u.order={kind:'route',spell:'none'};else if(u.order?.kind==='flash')u.order={kind:'auto',spell:'none'};}
  this.event(`Turno ${frame.round}: ${frame.seconds}s simulados após as duas confirmações.`,null,'round');
  return {ok:true,paused:false,simulated:0,frame};
 }

 // V4.5.2d-4-dev20: autonomous objective *scouting* is chosen only from
 // publicly published spawn windows or the team's own observed pit state.
 // Never inspect hidden monster health/alive status to select a destination.
 botEpicTargetV452d4Dev20(team){
  if(this.gameTime<420)return null; // Protect the calibrated first five minutes.
  const observed=this.perspective(team).camps;
  const priority=this.gameTime>=1200?['baron','dragon','herald','voidgrubs']:['dragon','herald','voidgrubs'];
  for(const kind of priority){
   if(kind==='herald'&&this.riftV452d4.mode==='swiftplay')continue;
   const entry=observed.find(c=>c.timerKey===kind);if(!entry)continue;
   const phase=OBJECTIVE_PHASES_V44[kind],rules=CAMP_RULES_2026[kind];
   if(this.gameTime<(rules?.spawn||phase?.spawn||0))continue;
   if(phase?.leave&&this.gameTime>=phase.leave)continue;
   if(entry.alive===false||entry.knownRespawnAt>this.gameTime)continue;
   // Unseen camp may be gone: a scouting trip is still fair. Reobserve on
   // arrival and rate-limit repeat attempts using an explicit private clock.
   return {id:entry.id,kind,x:entry.x,y:entry.y,unknown:entry.alive===null};
  }
  return null;
 }
 botEpicRallyV452d4Dev20(team,epic){
  const jungler=this.units.find(u=>u.team===team&&u.role==='JG'&&u.hp>0&&!u.awaitingShop);
  if(!epic||!jungler||jungler.hp/jungler.maxHp<.55||jungler.explicitOrder)return false;
  const current=this.activeStage(jungler);
  if(current?.targetId===epic.id&&['jungle','objective'].includes(current.action)&&!jungler.plan.completed)return true;
  if((jungler.botEpicRetryAtV452d4Dev20||0)>this.gameTime)return false;
  const visit={point:{x:epic.x,y:epic.y},action:'jungle',targetId:epic.id,duration:65};
  const assigned=[];
  for(const u of [jungler,...this.units.filter(u=>u.team===team&&['MID','SUP'].includes(u.role)&&u.hp>0&&!u.awaitingShop).sort((a,b)=>a.role==='MID'?-1:1)]){
   if(u.hp/u.maxHp<(u.role==='JG'?.55:.65)||u.explicitOrder)continue;
   // Do not reset the ongoing joint trip at every 10-second planning window.
   if(this.activeStage(u)?.targetId===epic.id&&!u.plan.completed){assigned.push(u.id);continue;}
   const result=this.setPlan(team,u.id,[visit],'aggressive');
   if(!result.ok)continue;
   u.plan.botGenerated=true;u.plan.botEpicV452d4Dev20=true;u.plan.loopJungle=false;
   u.explicitOrder=false;u.manualMoveHold=false;u.botEpicRetryAtV452d4Dev20=this.gameTime+120;
   assigned.push(u.id);
  }
  if(assigned.includes(jungler.id)){
   this.event(`${team==='blue'?'Azul':'Vermelho'} planejou reconhecimento de ${epic.kind} com ${assigned.length} campeão(ões).`,team,'bot_objective_plan');
   return true;
  }
  return false;
 }
 // DEV23: the game-length target is a distribution, not a hard timer.
 // Turn lane pressure and owned gold into genuine attacks, never auto-damage.
 botBuyUpgradeV452d4Dev23(team,u){
  if(!u.awaitingShop)return false;
  const plan=u.klass==='marksman'?['infinity_edge','last_whisper','bf_sword','vampiric_scepter','long_sword']:
   u.klass==='mage'||u.klass==='enchanter'?['rabadon','void_staff','zhonyas_hourglass','blasting_wand','amp_tome']:
   u.klass==='tank'||u.klass==='support'?['mercurys_treads','kindlegem','giants_belt','ruby_crystal']:
   ['last_whisper','caulfields_warhammer','vampiric_scepter','bf_sword','pickaxe','long_sword'];
  for(const id of plan){
   const item=catalog.find(x=>x.id===id);
   if(!item||u.items.includes(id)||this.itemPurchaseCost(u,id)>u.gold)continue;
   if(this.buy(team,u.id,id)){
    u.botLastUpgradeAtV452d4Dev23=this.gameTime;
    return true;
   }
  }
  return false;
 }
 botShouldShopV452d4Dev23(team,u,threats){
  // A return to shop takes real simulation seconds. Stagger the team so the
  // entire squad does not abandon a late-game push simultaneously.
  if(this.gameTime<810||u.role==='JG'||u.gold<2350||u.hp/u.maxHp<.55||
   threats.length||(u.botLastUpgradeAtV452d4Dev23||0)>this.gameTime-230||
   u.plan&&!u.plan.completed||u.explicitOrder)return false;
  const index=['TOP','JG','MID','ADC','SUP'].indexOf(u.role);
  if((Math.floor(this.gameTime/30)+index)%4!==0)return false;
  // Do not interrupt a siege already at the enemy base.
  const enemyInhibitors=this.structures.some(s=>s.team!==team&&s.type==='inhibitor'&&!s.alive);
  const enemyBase=this.map.objects.find(o=>o.id===alt(team)+'_spawn_shop');
  if(enemyInhibitors&&enemyBase&&this.mapDistance(u,enemyBase)<3200)return false;
  return true;
 }
 // DEV22: public structure state and visible allied wave pressure, never hidden enemy locations.
 // A stalled team may rally several bot laners onto a vulnerable single lane.
 botSiegeFocusLaneV452d4Dev22(team){
  if(this.gameTime<900)return null; // Protect early farm; rally after 15min and a real outer-tower fall.
  const enemy=alt(team),dir=team==='blue'?1:-1;
  const lanes=['top','mid','bot'].map(lane=>{
   const order=['t1','t2','t3','inhibitor'];
   const first=order.map(id=>this.structures.find(s=>s.id===`${enemy}_${lane}_${id}`)).find(s=>s?.alive);
   const tier=first?order.findIndex(id=>first.id.endsWith('_'+id)):4;
   const minions=this.minions.filter(m=>m.team===team&&m.lane===lane&&m.hp>0&&m.spawnAt<=this.gameTime);
   const front=minions.length?Math.max(...minions.map(m=>dir===1?m.progress:1-m.progress)):0;
   // A destroyed inhibitor leaves the lane open toward the Nexus towers.
   const scoring=tier*100+front*25+(first?(1-first.hp/first.maxHp)*30:20);
   return {lane,tier,score:scoring};
  });
  lanes.sort((a,b)=>b.score-a.score||a.lane.localeCompare(b.lane));
  // Coordinate only after at least one outer turret is down.
  return lanes[0]?.tier>=1?lanes[0].lane:null;
 }
 botPlan(team='red'){
  if(!['blue','red'].includes(team))return false;
  const siegeFocus=this.botSiegeFocusLaneV452d4Dev22(team);
  const strategicTarget=this.botEpicTargetV452d4Dev20(team);
  if(strategicTarget)this.botEpicRallyV452d4Dev20(team,strategicTarget);
  for(const u of this.units.filter(u=>u.team===team&&u.hp>0)){
   // A rules-based AI: no access to invisible units, plans live beyond one round,
   // and all random tie-breaks use a seeded PRNG for repeatable tests.
   if(this.round===1&&u.items.length===0){
    const starter=u.role==='SUP'?'support_atlas':u.role==='JG'?'jungle_mosstomper':u.role==='ADC'?'dorans_blade':u.klass==='mage'||u.klass==='enchanter'?'dorans_ring':u.klass==='tank'?'dorans_shield':'dorans_blade';
    this.buy(team,u.id,starter);
   }
   const threats=this.units.filter(v=>v.team!==team&&v.hp>0&&this.visible(team,v)&&dist(u,v)<Math.max(.092,u.range*1.6));
   threats.sort((a,b)=>dist(u,a)-dist(u,b)||(a.id<b.id?-1:1));
   const low=u.hp/u.maxHp<.30,atRisk=threats.length>0&&u.hp/u.maxHp<.55;
   u.policy=(u.role==='ADC'||low)?'safe':u.role==='JG'?'aggressive':'balanced';
   if(u.awaitingShop){
    if(!this.botBuyUpgradeV452d4Dev23(team,u)&&u.items.length<6&&u.gold>=300){
     const item=catalog.find(i=>i.cost<=u.gold&&i.tags.includes(u.klass));
     if(item)this.buy(team,u.id,item.id);
    }
    this.leaveShop(team,u.id);continue;
   }
   if(low){u.plan=null;u.order={kind:'recall'};continue;}
   if(u.order?.kind==='recall')continue;
   if(this.botShouldShopV452d4Dev23(team,u,threats)){
    u.order={kind:'recall',spell:'none'};u.botLastShopOrderV452d4Dev23=this.gameTime;continue;
   }
   if(u.explicitOrder&&!low)continue;
   if(threats.length){
    if(atRisk){u.policy='safe';u.order={kind:'defend'};continue;}
    const pick=threats[Math.floor(this.rng()*Math.min(2,threats.length))];
    u.order={kind:'attack',targetId:pick.id,spell:u.mana>=60&&u.skillCd<=this.gameTime?'Q':'none'};
    continue;
   }
   if(u.explicitOrder&&u.order?.kind!=='auto'&&!low)continue;
   if(u.role==='JG'&&u.plan&&!u.plan.completed){continue;}
   if(u.role==='JG'){
    // Bot-generated jungle paths are not irreversible player orders. Move to
    // the next *available* camp rather than camping one empty spawn forever.
    const nonEpic=new Set(['red','blue','wolves','raptors','krugs','gromp','scuttle']);
    const home=this.map.objects.find(o=>o.id===team+'_spawn_shop');
    const enemy=this.map.objects.find(o=>o.id===alt(team)+'_spawn_shop');
    const viable=this.camps.filter(c=>c.alive&&nonEpic.has(c.timerKey)&&
     this.mapDistance(c,home)<=this.mapDistance(c,enemy))
     .sort((a,b)=>this.mapDistance(a,u)-this.mapDistance(b,u)||a.id.localeCompare(b.id));
    const camp=viable[0];
    if(camp){
     const result=this.setPlan(team,u.id,[{point:{x:camp.x,y:camp.y},action:'jungle',targetId:camp.id,duration:110}],'aggressive');
     if(result.ok){u.plan.botGenerated=true;u.plan.loopJungle=false;u.explicitOrder=false;u.manualMoveHold=false;}
     continue;
    }
   }
   // DEV22: coordinate lane escorts only through the regular path/wave systems.
   // No direct structure damage or hidden-enemy state enters this decision.
   u.botSiegeLaneV452d4Dev22=siegeFocus&&(['MID','ADC','SUP'].includes(u.role)||this.gameTime>=1800&&u.role==='TOP')?siegeFocus:null;
   // Laners follow the wave in the shared deterministic autopilot; no frozen
   // 45-second waypoint that becomes obsolete as the clash moves.
   if(u.explicitOrder)continue;
   u.plan=null;
   const lane=u.botSiegeLaneV452d4Dev22||(u.role==='TOP'?'top':u.role==='MID'?'mid':'bot');
   const siegeReady=this.gameTime>=780&&u.role!=='JG'&&this.minions.some(m=>m.team===team&&m.lane===lane&&m.hp>0&&m.spawnAt<=this.gameTime)&&
    this.structures.some(st=>st.team!==team&&st.alive&&this.structureVulnerable(st)&&
      (st.lane===lane||(st.lane==='nexus'&&this.structures.some(i=>i.team===st.team&&i.type==='inhibitor'&&i.lane===lane&&!i.alive))));
   u.order={kind:siegeReady?'push':'farm',spell:'none'};u.autoFollow=true;u.autoFarm=u.role!=='SUP';
  }
  this.lock(team);
 }
 // A caller (local UI or authoritative multiplayer server) supplies actual elapsed
 // wall seconds since this planning window opened. Resolve only after BOTH locks or
 // timeout. One lock alone never starts simulation, and no order acts early.
 resolve(elapsedSeconds=this.roundSeconds,{timeout=false}={}){if(this.ended)return;
  if(!timeout&&(!this.teams.blue.ready||!this.teams.red.ready))return null;
  const seconds=clamp(Math.ceil(Number.isFinite(elapsedSeconds)?elapsedSeconds:this.roundSeconds),1,this.decisionSeconds);
  this.teams.blue.ready=true;this.teams.red.ready=true;
  const frame={round:this.round,seconds,startGameTime:this.gameTime,blueReady:true,redReady:true,
   orders:Object.fromEntries(['blue','red'].map(team=>[team,this.units.filter(u=>u.team===team).map(u=>({id:u.id,order:structuredCopy(u.order),plan:structuredCopy(u.plan)}))]))};
  this.finishPreparation(); // Never teleport out of base: the opening minute is for purchases/planning.
  const last=this.gameTime;
  for(let t=0;t<seconds&&!this.ended&&!this.pendingDecision;t++){this.gameTime++;this.tick()}
  this.lastResolvedSeconds=this.gameTime-last;
  frame.endGameTime=this.gameTime;frame.simulatedSeconds=this.lastResolvedSeconds;frame.interrupted=!!this.pendingDecision;
  this.roundHistory.push(frame);
  this.round++;this.teams.blue.ready=false;this.teams.red.ready=false;
  for(const u of this.units){u.spentMove=0;if(u.plan&&!u.plan.completed)u.order={kind:'route',spell:'none'};else if(u.order?.kind==='flash')u.order={kind:'auto',spell:'none'};}
  this.event(`Rodada ${this.round-1} resolvida: ${this.lastResolvedSeconds}s de jogo simultâneos.`);return this;
 }
 // v1.3 — Live planning. Existing orders and autopilot advance while the shared
 // decision clock is open. A live window is finalized WITHOUT replaying ticks.
 // Multiplayer must later use an authoritative server (never trust client ticks).
 startLiveWindow(){
  if(this.ended)return null;
  if(this.liveWindow)return this.liveWindow;
  if(this.phase==='preparation'){this.finishPreparation();this.deployToLane();this.event('Modo legado ao vivo iniciado.');}
  // Bot chooses once at this round boundary, not every rendered frame.
  if(this.mode==='bot'&&!this.teams.red.ready)this.botPlan();
  this.liveWindow={round:this.round,startedAt:this.gameTime,elapsed:0};
  return this.liveWindow;
 }
 advanceLiveWindow(seconds=1){
  if(this.ended||this.pendingDecision)return 0;
  const win=this.startLiveWindow();
  const todo=clamp(Math.floor(Number(seconds)||0),0,this.decisionSeconds-win.elapsed);
  for(let i=0;i<todo&&!this.ended&&!this.pendingDecision;i++){
   this.gameTime++;
   this.tick();
   win.elapsed++;
  }
  return todo;
 }
 finishLiveWindow({timeout=false}={}){
  const win=this.startLiveWindow();
  if(!win)return null;
  if(!timeout&&(!this.teams.blue.ready||!this.teams.red.ready))return null;
  this.teams.blue.ready=true;this.teams.red.ready=true;
  // Never call resolve() here: that would advance every second a second time.
  const frame={round:this.round,seconds:win.elapsed,simulatedSeconds:win.elapsed,
   startGameTime:win.startedAt,endGameTime:this.gameTime,mode:'live',
   orders:Object.fromEntries(['blue','red'].map(team=>[team,this.units.filter(u=>u.team===team).map(u=>({id:u.id,order:structuredCopy(u.order),plan:structuredCopy(u.plan)}))]))};
  this.roundHistory.push(frame);
  this.lastResolvedSeconds=win.elapsed;
  this.round++;this.liveWindow=null;
  this.teams.blue.ready=false;this.teams.red.ready=false;
  for(const u of this.units){u.spentMove=0;
   if(u.plan&&!u.plan.completed)u.order={kind:'route',spell:'none'};
   else if(u.order?.kind==='flash')u.order={kind:'auto',spell:'none'};
  }
  this.event(`Janela ${frame.round}: ${frame.seconds}s vividos durante o planejamento; o mundo não foi reexecutado.`);
  return frame;
 }
 detectEncounters(){
  // Nearby enemies are not a mandatory mutual duel. Neither participant needs
  // to accept the fight. Combat windows are opened only by an actual hit.
 }
 deployToLane(){for(const team of ['blue','red'])for(const u of this.units.filter(o=>o.team===team)){let target;
  if(u.role==='JG')target=team==='blue'?{x:.29,y:.65}:{x:.72,y:.34};else{const lane=u.role==='TOP'?'top':u.role==='MID'?'mid':'bot';const line=this.lanes[lane];target=sampleLine(line,team==='blue'?.16:.84);if(u.role==='SUP')target={x:target.x-.012,y:target.y-.008}}
  if(!this.walkable(target.x,target.y)){const path=this.findPath(u,target);target=path?.at(-1)||u}
  u.x=target.x;u.y=target.y;this.invalidateShopUndoOnDepartureV453Dev61(u);
  const stage=this.activeStage(u);if(stage){const replanned=this.findPath(u,stage.point);if(replanned)stage.path=replanned;}
 }}
 advancePotionHealingV453Dev32(){
  for(const u of this.units){
   if(u.items?.includes('refillable_potion')&&u.hp>0){
    const shop=this.map.objects.find(o=>o.id===u.team+'_spawn_shop');
    if(shop&&this.mapDistance(u,shop)<=1125)u.refillableChargesV453Dev32=2;
   }
   const heal=u.potionHealingV453Dev32;
   if(!heal||u.hp<=0)continue;
   // Whole-second model; never heals twice in the same engine tick.
   const now=this.gameTime;
   const steps=Math.max(0,Math.min(heal.duration,Math.floor(now-heal.startedAt))-(heal.appliedSeconds||0));
   if(steps){u.hp=Math.min(u.maxHp,u.hp+steps*heal.total/heal.duration);heal.appliedSeconds=(heal.appliedSeconds||0)+steps;}
   if(heal.appliedSeconds>=heal.duration)u.potionHealingV453Dev32=null;
  }
 }
 usePotionV453Dev32(team,unitId,itemId){
  const u=this.units.find(x=>x.team===team&&x.id===unitId);
  if(!u||!['health_potion','refillable_potion'].includes(itemId)||!u.items?.includes(itemId))return {ok:false,reason:'Poção não equipada.'};
  const shop=this.map.objects.find(o=>o.id===team+'_spawn_shop');
  if(shop&&this.mapDistance(u,shop)<=1125)return {ok:false,reason:'Poções são usadas fora da fonte.'};
  if(u.hp<=0||u.hp>=u.maxHp)return {ok:false,reason:'Vida cheia ou campeão morto.'};
  if((u.potionNextUseAtV453Dev32||0)>this.gameTime)return {ok:false,reason:'recarga'};
  if(u.potionHealingV453Dev32&&u.potionHealingV453Dev32.appliedSeconds<u.potionHealingV453Dev32.duration)return {ok:false,reason:'Poção ainda em efeito.'};
  const refilling=itemId==='refillable_potion';
  if(refilling){if((u.refillableChargesV453Dev32??2)<=0)return {ok:false,reason:'Sem cargas, retorne à fonte.'};u.refillableChargesV453Dev32=(u.refillableChargesV453Dev32??2)-1;}
  else {const index=u.items.indexOf(itemId);u.items.splice(index,1);}
  const effect=ITEM_EFFECTS_V43[itemId];
  u.potionHealingV453Dev32={itemId,total:effect.total,duration:effect.seconds,startedAt:this.gameTime,appliedSeconds:0};
  u.potionNextUseAtV453Dev32=this.gameTime+1;
  this.event(u.champ+' consumiu '+catalog.find(x=>x.id===itemId).name+'.',team,'item',u.id);
  return {ok:true,charges:refilling?u.refillableChargesV453Dev32:0,endsAt:this.gameTime+effect.seconds};
 }
 tick(){if(this.pendingDecision||this.phase==='preparation')return;this.b7MidQuestPassive();this.advancePotionHealingV453Dev32();this.advanceItemRegenV453Dev38();this.advanceDefensiveItemsV453Dev69B4();this.advanceSupportItemsV453Dev69B5();this.advanceOffensiveItemsV453Dev69B6();this.advanceRemainderItemsV453Dev69B7();this.refreshOracleWardsV452d4Dev28();this.advanceRiftHexgatesV452d4();this.riftVisionPulsesV452d4=this.riftVisionPulsesV452d4.filter(p=>p.until>this.gameTime);for(const u of this.units){if(u.barrierUntil&&this.gameTime>=u.barrierUntil){u.shield=Math.max(0,u.shield-(u.barrierAmount||0));u.barrierUntil=0;u.barrierAmount=0;}if(u.reactionCombo?.expiresAt<this.gameTime)u.reactionCombo=null;}this.effectResolverV41().advanceTick();this.advanceSoulEffectsV452d2();this.resolveDelayedEffects();this.advanceElderSubticksV452d4Dev18(this.gameTime);this.processAmbushResponses();if(this.pendingDecision)return;this.advanceStructuresV451();this.spawnWaves();this.reviveAndMove();this.buildMinionIndex();this.moveMinions();this.updateMinionBodiesV453Dev51();this.buildMinionIndex();this.detectEncounters();if(this.pendingDecision)return;this.advanceChampionProjectilesV453Dev42();this.advanceVexShadowDashV453Dev69();this.advanceIreliaBladesV453Dev43();this.resolveSpecialUltimates();if(this.pendingDecision)return;this.resolveCombat();if(this.pendingDecision)return;this.advanceBamiAuraV453Dev57();this.advanceElderSubticksV452d4Dev18(this.gameTime+.999999);this.updateObjectives();if(this.pendingDecision)return;this.advanceObjectivesV45();this.resolveSummonerCasts();if(this.pendingDecision)return;this.supportPassiveTick();this.restoreVisionCharges();this.refreshOracleWardsV452d4Dev28();this.wards=this.wards.filter(w=>this.wardActive(w));
  if(this.structures.some(s=>s.type==='nexus'&&!s.alive)){this.ended=true;this.winner=this.structures.find(s=>s.type==='nexus'&&!s.alive)?.team==='blue'?'red':'blue';this.event(`Nexus destruído. Vitória do ${this.winner}.`)}
  this.samplePostgameV452d4Dev7(this.ended);
 }
 finishStructureDeathsV451(){
  for(const s of this.structures)if(s.alive&&s.hp<=0){
   s.hp=0;s.alive=false;s.aggro=null;
   if(s.type==='tower')for(const mid of this.units.filter(u=>u.role==='MID'&&u.team!==s.team&&u.hp>0&&this.mapDistance(u,s)<=1500))
    this.b7MidQuestAdd(mid,s.lane==='mid'?50:25,'tower_takedown');
   s.respawnAt=s.type==='inhibitor'?this.gameTime+LANE_STRUCTURE_RULES_V451.inhibitorRespawnSeconds:
     (s.type==='tower'&&s.lane==='nexus'?this.gameTime+LANE_STRUCTURE_RULES_V451.nexusTurretRespawnSeconds:0);
   this.event(`${s.name||s.id} destruído.`,null,'structure');
  }
 }
 advanceStructuresV451(){
  for(const s of this.structures){
   if(!s.alive&&s.respawnAt>0&&this.gameTime>=s.respawnAt){
    s.hp=s.type==='tower'&&s.lane==='nexus'?Math.ceil(s.maxHp*LANE_STRUCTURE_RULES_V451.nexusTurretRespawnHpFraction):s.maxHp;
    s.alive=true;s.respawnAt=0;s.aggro=null;s.lastShot=this.gameTime;
    this.event(`${s.name||s.id} regenerado.`,s.team,'objective');
    continue; // first frame returns at exactly 40%; regeneration begins next tick.
   }
   if(s.alive&&s.lane==='nexus'&&s.type==='tower'&&s.hp>0&&s.hp<s.maxHp){
    // 2026 thresholds: regenerates to 40/70/100% bands, capped deterministically.
    const pct=s.hp/s.maxHp,cap=pct<.4?.4:pct<.7?.7:1;
    s.hp=Math.min(s.maxHp*cap,s.hp+6);
   }
  }
 }
 waveIntervalV451(at=this.gameTime){return at>=LANE_STRUCTURE_RULES_V451.lateWaveAt?20:at>=LANE_STRUCTURE_RULES_V451.midWaveAt?25:30;}
 superCountV451(team,lane,at=this.gameTime){
  const inhibitors=this.structures.filter(s=>s.team!==team&&s.type==='inhibitor');
  const eligible=s=>!s.alive&&s.respawnAt>at+LANE_STRUCTURE_RULES_V451.superWaveStopBeforeRespawn*this.waveIntervalV451(at);
  const own=inhibitors.find(s=>s.lane===lane);
  if(!own||!eligible(own))return 0;
  return inhibitors.length===3&&inhibitors.every(eligible)?2:1;
 }
 // A contagem é definida num único ponto: 3 melee + 3 caster até 14:00,
 // com +1 canhão nos ciclos previstos. 2026 altera composições depois de
 // 14:00/30:00; cinco minions TARDIOS não significam erro do spawn inicial.
 // DEV23: capped, 90-second wave upgrades inspired by the 2026 minion
 // system. The existing 0..5-minute farm calibration remains frozen.
 // Coefficients after 5:00 are CoachLOL pacing parameters, NOT Riot 1:1.
 waveStatsV452d4Dev23(kind,at=this.gameTime){
  const levels=Math.max(0,Math.min(50,Math.floor((at-300)/90)));
  const base={melee:{hp:465,damage:18,range:.014,speed:.0130,interval:1.6},
   caster:{hp:290,damage:27,range:.041,speed:.0130,interval:1.5},
   siege:{hp:835,damage:48,range:.055,speed:.0120,interval:2.0},
   super:{hp:1600,damage:145,range:.016,speed:.0081,interval:1.65}}[kind];
  if(!base)return null;
  const cap={melee:{hp:1550,damage:80},caster:{hp:600,damage:125},
   siege:{hp:5850,damage:126},super:{hp:3300,damage:200}}[kind];
  const gain={melee:{hp:35,damage:2.4},caster:{hp:13,damage:3.6},
   siege:{hp:105,damage:3.5},super:{hp:65,damage:2.5}}[kind];
  return {...base,hp:Math.min(cap.hp,Math.round(base.hp+levels*gain.hp)),
   damage:Math.min(cap.damage,Math.round(base.damage+levels*gain.damage)),
   upgradeLevelV452d4Dev23:levels};
 }
 waveCompositionV452b(waveIndex=this.waveIndex,at=this.gameTime,superCount=0){
  const late=at>=1800,mid=at>=840;
  const siege=waveIndex>=3&&(at>=1500?true:at>=840?waveIndex%2===1:waveIndex%3===0);
  // dev45: waves normais = 3 guerreiros + 3 magos; com canhao = 3+3+1.
  const melee=3,caster=3;
  return [...Array(superCount).fill('super'),...Array(melee).fill('melee'),
   ...(siege&&!superCount?['siege']:[]),...Array(caster).fill('caster')];
 }
 // Actual physical, deterministic lateral formation, independent of camera pixels.
 // Three front melee, siege between front and rear, three rear casters.
 minionFormationPointV453Dev48(line,progress,kind,slot,team){
  const base=sampleLine(line,progress),before=sampleLine(line,clamp(progress-.003,0,1)),after=sampleLine(line,clamp(progress+.003,0,1));
  const dx=(after.x-before.x)*this.worldWidth,dy=(after.y-before.y)*this.worldHeight;
  const length=Math.hypot(dx,dy)||1,side=(slot-1)*(kind==='siege'?0:37),depth=kind==='caster'?-95:kind==='siege'?-52:kind==='super'?45:0;
  const direction=team==='red'?-1:1;
  const candidate={x:base.x+((dx*depth*direction-dy*side)/length)/this.worldWidth,y:base.y+((dy*depth*direction+dx*side)/length)/this.worldHeight};
  return this.walkable(candidate.x,candidate.y)?candidate:base;
 }
 // Minion block is authoritative: do not allow two alive lane minions to
 // occupy the same footprint. Cells keep this near-linear across large waves.
 resolveMinionBlockV453Dev48(){
  const buckets=new Map(),cell=48;
  for(const m of this.minions){
   if(m.hp<=0||m.spawnAt>this.gameTime)continue;
   const key=()=>`${m.lane}:${Math.floor(m.x*this.worldWidth/cell)}:${Math.floor(m.y*this.worldHeight/cell)}`;
   const xy={x:Math.floor(m.x*this.worldWidth/cell),y:Math.floor(m.y*this.worldHeight/cell)};
   const radius=m.kind==='siege'?15:m.kind==='super'?20:12;
   for(let ix=-1;ix<=1;ix++)for(let iy=-1;iy<=1;iy++){
    for(const o of buckets.get(`${m.lane}:${xy.x+ix}:${xy.y+iy}`)||[]){
     const ox=(m.x-o.x)*this.worldWidth,oy=(m.y-o.y)*this.worldHeight;
     const distance=Math.hypot(ox,oy),minimum=radius+(o.kind==='siege'?15:o.kind==='super'?20:12);
     if(distance>=minimum)continue;
     const sign=Number(m.id.slice(1))%2===0?1:-1;
     const theta=distance>1e-5?{x:ox/distance,y:oy/distance}:{x:0,y:sign};
     const shift=minimum-distance+.5;
     const next={x:m.x+theta.x*shift/this.worldWidth,y:m.y+theta.y*shift/this.worldHeight};
     if(this.walkable(next.x,next.y)){m.x=next.x;m.y=next.y;}
    }
   }
   const id=key();if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push(m);
  }
 }
 // DEV51: separate authoritative PHYSICAL footprints from legacy lane-progress
 // coordinates. Combat/farm remain anchored to progression; collisions for
 // players and other minion portraits use these serialized body coordinates.
 // Deterministic, bounded local candidate search without RNG, no teleport.
 // DEV57: physical engagement placement; economic spine remains authoritative for
 // attack timing / last-hit. Keep early five-minute calibration unchanged.
 minionCombatFormationV453Dev57(m,ideal){
  // PvP opt-in until lane-farm parity has been certified for every matchup.
  if(this.mode!=='pvp'||this.gameTime<=300||!['melee','caster','siege'].includes(m.kind))return ideal;
  const enemies=this.minions.filter(n=>n.hp>0&&n.team!==m.team&&n.lane===m.lane&&n.spawnAt<=this.gameTime&&
   this.mapDistance(m,n)<=240).sort((a,b)=>this.mapDistance(m,a)-this.mapDistance(m,b)||a.id.localeCompare(b.id));
  const focused=enemies.find(n=>n.id===m.minionFocusIdV453Dev52);
  const held=enemies.find(n=>n.id===m.minionEngagementTargetIdV453Dev58);
  const target=focused||held||enemies[0];
  if(!target){m.minionEngagementTargetIdV453Dev58=null;return ideal;}
  m.minionEngagementTargetIdV453Dev58=target.id;
  const targetPoint=this.minionBodyPositionV453Dev51(target);
  const line=this.lanes[m.lane],a=sampleLine(line,clamp(m.progress-.003,0,1)),b=sampleLine(line,clamp(m.progress+.003,0,1));
  const dx=(b.x-a.x)*this.worldWidth,dy=(b.y-a.y)*this.worldHeight,len=Math.hypot(dx,dy)||1;
  const forward=m.team==='blue'?1:-1,side=(m.formationSlotV453Dev48??1)-1;
  // Melee fan around the enemy front; siege follows; casters stay behind it.
  const back=m.kind==='melee'?-46:m.kind==='siege'?-102:-176;
  const flank=m.kind==='siege'?0:side*(m.kind==='melee'?49:57);
  const pt={x:targetPoint.x+(dx*back*forward-dy*flank)/len/this.worldWidth,
   y:targetPoint.y+(dy*back*forward+dx*flank)/len/this.worldHeight};
  // Prevent teleporting a minion across the lane or behind an obstacle.
  const delta=this.mapDistance(ideal,pt),max=72;
  if(delta>max){pt.x=ideal.x+(pt.x-ideal.x)*max/delta;pt.y=ideal.y+(pt.y-ideal.y)*max/delta;}
  return this.walkable(pt.x,pt.y)?pt:ideal;
 }
 // DEV58: read-only PvP observation. Never alter economic targeting, farm or fog.
 pvpMinionEngagementAuditV453Dev58(){
  const live=this.minions.filter(m=>m.hp>0&&m.spawnAt<=this.gameTime);
  const byId=new Map(live.map(m=>[m.id,m]));
  const engaged=live.filter(m=>m.minionEngagementTargetIdV453Dev58);
  const invalid=engaged.filter(m=>{const t=byId.get(m.minionEngagementTargetIdV453Dev58);return !t||t.team===m.team||t.lane!==m.lane||this.mapDistance(m,t)>240;});
  const focusMismatch=engaged.filter(m=>m.minionFocusIdV453Dev52&&
    byId.get(m.minionFocusIdV453Dev52)&&m.minionFocusIdV453Dev52!==m.minionEngagementTargetIdV453Dev58);
  return {mode:this.mode,at:this.gameTime,engaged:engaged.length,invalid:invalid.map(m=>m.id),focusMismatch:focusMismatch.map(m=>m.id),footprints:this.minionFootprintAuditV453Dev56()};
 }
 minionBodyRadiusV453Dev51(m){return m.kind==='super'?23:m.kind==='siege'?21:16;}
 minionBodyPositionV453Dev51(m){
  return Number.isFinite(m.bodyX)&&Number.isFinite(m.bodyY)?{x:m.bodyX,y:m.bodyY}:
   this.minionFormationPointV453Dev48(this.lanes[m.lane],m.progress,m.kind,m.formationSlotV453Dev48??1,m.team);
 }
 // DEV54: emergency overflow placement extends the existing deterministic
 // solver without changing ordinary positioning (farm/pacing sensitive).
 updateMinionBodiesV453Dev51(){
  const cells=new Map(),size=48,worldW=this.worldWidth,worldH=this.worldHeight;
  const key=(x,y)=>`${Math.floor(x*worldW/size)}:${Math.floor(y*worldH/size)}`;
  const occupants=(x,y)=>{
   const bx=Math.floor(x*worldW/size),by=Math.floor(y*worldH/size),out=[];
   for(let xx=bx-2;xx<=bx+2;xx++)for(let yy=by-2;yy<=by+2;yy++)out.push(...(cells.get(`${xx}:${yy}`)||[]));
   return out;
  };
  // The original minion array is the stable ID order in snapshots/replays.
  for(const m of this.minions){
   if(m.hp<=0||m.spawnAt>this.gameTime){delete m.bodyX;delete m.bodyY;continue;}
   const line=this.lanes[m.lane];if(!line)continue;
   const ideal=this.minionCombatFormationV453Dev57(m,this.minionFormationPointV453Dev48(line,m.progress,m.kind,m.formationSlotV453Dev48??1,m.team));
   const radius=this.minionBodyRadiusV453Dev51(m);
   const free=(point)=>this.walkable(point.x,point.y)&&occupants(point.x,point.y).every(other=>
    this.mapDistance(point,{x:other.bodyX,y:other.bodyY})>=radius+this.minionBodyRadiusV453Dev51(other)+1);
   // DEV55: physical body movement is bounded between ticks and checks the
   // entire swept segment against already resolved minion circles. The legacy
   // lane progress and economic attack spine are deliberately untouched.
   const previous=Number.isFinite(m.bodyX)&&Number.isFinite(m.bodyY)?{x:m.bodyX,y:m.bodyY}:null;
   const deltaTime=previous?Math.max(0,this.gameTime-(m.bodyMotionAtV453Dev55??this.gameTime-1)):1;
   const travelBudget=320*Math.min(1,deltaTime);
   const d=previous?this.mapDistance(previous,ideal):0;
   const desired=previous&&d>travelBudget&&travelBudget>0?
    {x:previous.x+(ideal.x-previous.x)*travelBudget/d,y:previous.y+(ideal.y-previous.y)*travelBudget/d}:
    previous&&travelBudget===0?previous:ideal;
   const sweptFree=(from,to)=>{
    // Sweep only large discontinuities. Ordinary lane-body interpolation
    // retains the already-calibrated dev54 positions and farm timing.
    if(!from||d<=320)return true;
    const dx=(to.x-from.x)*worldW,dy=(to.y-from.y)*worldH,len=dx*dx+dy*dy;
    const candidates=new Map();
    for(const p of [from,to,{x:(from.x+to.x)/2,y:(from.y+to.y)/2}])
     for(const n of occupants(p.x,p.y))candidates.set(n.id,n);
    for(const n of candidates.values()){
     const ox=(from.x-n.bodyX)*worldW,oy=(from.y-n.bodyY)*worldH;
     const r=radius+this.minionBodyRadiusV453Dev51(n)+1;
     const initial=ox*ox+oy*oy-r*r;
     const final=(ox+dx)*(ox+dx)+(oy+dy)*(oy+dy)-r*r;
     if(initial<0){if(final>=initial)continue;return false;}
     const t=len>1e-8?Math.max(0,Math.min(1,-(ox*dx+oy*dy)/len)):0;
     if((ox+t*dx)**2+(oy+t*dy)**2<r*r)return false;
    }
    return true;
   };
   let place=desired;
   if(!free(place)||!sweptFree(previous,place)){
    let found=false;
    // Ranges 20..100 units are small compared with a 15,000-unit map.
    for(const ring of [24,40,58,78,100,128,160,200,256,320]){
     for(let i=0;i<16;i++){
      const angle=2*Math.PI*i/16+Math.PI*((Number(m.id.slice(1))%8)/64);
      const pt={x:desired.x+Math.cos(angle)*ring/worldW,y:desired.y+Math.sin(angle)*ring/worldH};
      if(free(pt)&&sweptFree(previous,pt)){place=pt;found=true;break;}
     }
     if(found)break;
    }
    // DEV56: when dense traffic fills the local search, try a second set of
    // compact lateral slots BEFORE accepting overlapping collision bodies.
    // Normal first-choice positions do not pass through this branch.
    if(!found){
     for(const ring of [352,384,416,448,480]){
      for(let i=0;i<24;i++){
       const angle=2*Math.PI*i/24+Math.PI*((Number(m.id.slice(1))%12)/48);
       const pt={x:desired.x+Math.cos(angle)*ring/worldW,y:desired.y+Math.sin(angle)*ring/worldH};
       if(free(pt)&&sweptFree(previous,pt)){place=pt;found=true;break;}
      }
      if(found)break;
     }
    }
    // If fully walled in, retain the existing walkable lane point. No fake
    // movement through terrain just to claim collision success.
   }
   // DEV55: prefer a previously legal position over crossing through a body.
   if(!free(place)&&previous&&free(previous))place=previous;
   // DEV54: when all candidates fail due to unusually dense congestion,
   // record the constrained body explicitly for QA; do not secretly shift lane
   // progress/HP/gold or change regular first-choice placements.
   if(!free(place))m.minionPhysicalConstrainedV453Dev54=true;
   else delete m.minionPhysicalConstrainedV453Dev54;
   m.bodyX=place.x;m.bodyY=place.y;m.bodyMotionAtV453Dev55=this.gameTime;
   const k=key(place.x,place.y);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(m);
  }
 }
 // DEV56: observable collision report for QA; never changes HP, gold, targeting
 // or map state. Detect constrained bodies rather than silently claiming parity.
 minionFootprintAuditV453Dev56(){
  const active=this.minions.filter(m=>m.hp>0&&m.spawnAt<=this.gameTime&&
   Number.isFinite(m.bodyX)&&Number.isFinite(m.bodyY));
  const overlaps=[];
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
   const a=active[i],b=active[j];
   const delta=this.mapDistance({x:a.bodyX,y:a.bodyY},{x:b.bodyX,y:b.bodyY});
   const limit=this.minionBodyRadiusV453Dev51(a)+this.minionBodyRadiusV453Dev51(b);
   if(delta+1e-4<limit)overlaps.push({a:a.id,b:b.id,delta:+delta.toFixed(3),limit});
  }
  return {active:active.length,constrained:active.filter(m=>m.minionPhysicalConstrainedV453Dev54).length,overlaps};
 }
 spawnWaves(){if(this.gameTime<this.nextWave)return;this.waveIndex++;
  for(const lane of ['top','mid','bot'])for(const team of ['blue','red']){
   const line=this.lanes[lane],start=team==='blue'?0:1;
   const superCount=this.superCountV451(team,lane);
   const kinds=this.waveCompositionV452b(this.waveIndex,this.gameTime,superCount);
   kinds.forEach((kind,i)=>{const prop=this.waveStatsV452d4Dev23(kind);let p=sampleLine(line,start);const laneSlot=kinds.slice(0,i).filter(k=>k===kind).length;const positioned=this.minionFormationPointV453Dev48(line,start,kind,laneSlot,team);this.minions.push({id:'m'+this.nextId++,team,lane,kind,formationSlotV453Dev48:laneSlot,progress:start,x:p.x,y:p.y,hp:prop.hp,maxHp:prop.hp,damage:prop.damage,range:prop.range,speed:prop.speed,attackAt:0,interval:prop.interval,spawnAt:this.gameTime+i*.792,spawnWaveV452c:this.waveIndex,upgradeLevelV452d4Dev23:prop.upgradeLevelV452d4Dev23})});
  }
  this.event(`Leva ${this.waveIndex}: minions saíram das três rotas.`);this.nextWave+=this.waveIntervalV451(this.nextWave);
 }
 activeStage(u){return u.plan&&!u.plan.completed?u.plan.steps[u.plan.index]||null:null}
 mapDistance(a,b){return Math.hypot((a.x-b.x)*this.worldWidth,(a.y-b.y)*this.worldHeight)}
 itemMoveBonusesV453Dev29(u){
  const now=this.gameTime,ranged=u.range>.05;
  return {flat:(u.itemSprintUntilV453Dev29||0)>now?(u.itemSprintFlatV453Dev29||0):0,
   percent:(u.items?.includes('youmuus_ghostblade')&&now>=(u.combatUntil||0)?(ranged?10:20)/Math.max(1,u.moveSpeed):0)+
    ((u.youmuusSprintUntilV453Dev29||0)>now?(u.youmuusSprintRatioV453Dev29||0):0)};
 }
 // DEV50: old slowPercent direct fields and V41 status effects must BOTH
 // respect slow resistance. V41 slowFraction already scales itself; never double scale.
 effectiveSlowV453Dev50(u){
  const resist=Math.min(1,Math.max(0,(u?.champ?this.elementalStatsV452d3(u).slowResist:u?.slowResist||0)/100));
  return Math.max(Math.max(0,u?.slowPercent||0)*(1-resist),this.effectResolverV41().slowFraction(u));
 }
 effectiveMS(u){const sprint=this.itemMoveBonusesV453Dev29(u);return movementSpeed(u.moveSpeed,(u.flatMoveSpeed||0)+sprint.flat+this.supportTeamMoveFlatV453Dev69B5(u)+(u.items?.includes('scarlet_lucidity')&&u.b7ScarletUntil>this.gameTime?ITEM_REMAINDER_RULES_V453_DEV69_B7.scarlet_lucidity.moveFlat:0)+(u.items?.includes('cosmic_drive')&&u.cosmicSprintUntilV453Dev69>this.gameTime?ITEM_FAMILY_RULES_V453_DEV69.cosmic_drive.flatSpeed:0),(u.percentMoveSpeed||0)+sprint.percent+this.cloudSpeedBonusV452d4(u)+(this.gameTime>=(u.combatUntil||0)?this.elementalStatsV452d3(u).outOfCombatMoveFraction:0)+this.soulMovementBonusV452d2(u)+(u.jungleBuff==='gustwalker'&&u.jungleSpeedUntil>this.gameTime?.075:0)+(u.ghostUntil>this.gameTime?.24:0)+(u.items?.includes('force_of_nature')&&(u.forceNatureStacksV453Dev69||0)>=8&&(u.forceNatureUntilV453Dev69||0)>this.gameTime?.06:0)+(u.mercurialSprintUntilV453Dev59>this.gameTime&&u.items?.includes('mercurial_scimitar')?ITEM_EFFECTS_V43.mercurial_scimitar.sprintFraction:0)+(u.items?.includes('experimental_hexplate')&&u.hexplateBuffUntilV453Dev69B4>this.gameTime?ITEM_DEFENSE_RULES_V453_DEV69_B4.experimental_hexplate.movePercent/100:0)+this.supportTeamMovePercentV453Dev69B5(u)+(u.items?.includes('protoplasm_harness')&&u.b7ProtoplasmUntil>this.gameTime?ITEM_REMAINDER_RULES_V453_DEV69_B7.protoplasm_harness.movePct:0)+(u.items?.includes('stormrazor')&&u.b6StormrazorUntil>this.gameTime?ITEM_OFFENSE_RULES_V453_DEV69_B6.stormrazor.movePct:0)+this.firelightSpeedBonusV452d4(u),this.effectiveSlowV453Dev50(u))}
 // Gameplay hitboxes for minion block on explicit player movement orders.
 // Combat damage, farm and targeting still use their original authoritative spine.
 minionBodyCollisionV453Dev48(pos,excludedId=null){
  for(const m of this.minions){
   if(m.hp<=0||m.spawnAt>this.gameTime||m.id===excludedId)continue;
   const line=this.lanes[m.lane];if(!line)continue;
   const body=this.minionBodyPositionV453Dev51(m);
   if(this.mapDistance(pos,body)<(this.minionBodyRadiusV453Dev51(m)+17))return {minion:m,point:body};
  }
  return null;
 }
 minionBodyCollisionAlongV453Dev52(start,end,excludedId=null){
  // DEV53: colisão analítica contínua entre segmento e hitbox circular.
  // A antiga amostragem de 24 unidades podia saltar colisores estreitos,
  // sobretudo em movimento diagonal. Também permite escapar se o início já
  // está dentro de um corpo (não prende o campeão no próximo comando).
  const dx=(end.x-start.x)*this.worldWidth,dy=(end.y-start.y)*this.worldHeight;
  const length2=dx*dx+dy*dy;
  let nearest=null,firstT=Infinity;
  for(const m of this.minions){
   if(m.hp<=0||m.spawnAt>this.gameTime||m.id===excludedId)continue;
   const body=this.minionBodyPositionV453Dev51(m);
   const sx=(start.x-body.x)*this.worldWidth,sy=(start.y-body.y)*this.worldHeight;
   const r=this.minionBodyRadiusV453Dev51(m)+17;
   const c=sx*sx+sy*sy-r*r;
   if(length2<1e-9){if(c<0&&firstT>0){firstT=0;nearest={minion:m,point:body};}continue;}
   const b=2*(sx*dx+sy*dy),discriminant=b*b-4*length2*c;
   if(discriminant<0)continue;
   const endDistance2=(sx+dx)*(sx+dx)+(sy+dy)*(sy+dy);
   if(c<0&&endDistance2>=sx*sx)continue; // não impedir saída do bloqueio
   const t=c<=0?0:(-b-Math.sqrt(discriminant))/(2*length2);
   if(t<0||t>1)continue;
   if(t<firstT||(t===firstT&&m.id<(nearest?.minion.id||'~'))){
    firstT=t;nearest={minion:m,point:body};
   }
  }
  return nearest;
 }
 resolveChampionMinionBlockV453Dev48(u,target,step){
  if(!u.champ||!u.explicitOrder)return target;
  // DEV55: Valsa Espectral ignores UNIT collision, not walls or map geometry.
  if(u.items?.includes('phantom_dancer'))return target;
  const collision=this.minionBodyCollisionAlongV453Dev52(u,target);
  if(!collision)return target;
  const dx=(target.x-u.x)*this.worldWidth,dy=(target.y-u.y)*this.worldHeight,len=Math.hypot(dx,dy)||1;
  for(const side of [1,-1]){
   const candidate={x:target.x+(-dy/len)*side*42/this.worldWidth,y:target.y+(dx/len)*side*42/this.worldHeight};
   if(this.walkable(candidate.x,candidate.y)&&!this.minionBodyCollisionAlongV453Dev52(u,candidate))return candidate;
  }
  return null; // unit body blocks a move when both side passages are unavailable.
 }
 moveAlong(u,stage,remaining){
  if(!stage?.path?.length)return 0;
  let moved=0;
  while(stage.path.length&&remaining>.0001){
   const target=stage.path[0],d=this.mapDistance(u,target);
   if(d<20){stage.path.shift();continue}
   const step=Math.min(remaining,d),desired={x:u.x+(target.x-u.x)/d*step,y:u.y+(target.y-u.y)/d*step};
   const next=(u.champ&&u.explicitOrder&&stage.action==='move')?this.resolveChampionMinionBlockV453Dev48(u,desired,step):desired;
   if(!next)break;
   if(!this.walkable(next.x,next.y)){const repath=this.findPath(u,stage.point);if(!repath?.length){this.event(`${u.champ}: destino sem passagem.`);stage.path=[];break}stage.path=repath;break}
   u.x=next.x;u.y=next.y;this.invalidateShopUndoOnDepartureV453Dev61(u);remaining-=step;moved+=step;
   this.itemEnergizeMoveV453Dev38(u,step);
   if(step>=d-.0001&&next===desired)stage.path.shift();
   else break;
  }
  return moved;
 }
 // Autonomous laning never overwrites an explicit route or order. A champion
 // catches up with its wave and holds combat distance; role/stance determines spacing.
 autoStartJungle(u){
  if(u.role!=='JG'||!u.autoJungle||u.hp<=0||u.awaitingShop||u.explicitOrder||u.plan&&!u.plan.completed||['recall','ward','hold'].includes(u.order?.kind))return;
  const epic=new Set(['baron','dragon','scuttle','herald','voidgrubs']);
  const ownBase=this.map.objects.find(o=>o.id===u.team+'_spawn_shop'),oppBase=this.map.objects.find(o=>o.id===alt(u.team)+'_spawn_shop');
  const candidates=this.camps.filter(c=>!epic.has(c.timerKey)&&c.x&&c.y&&
   this.mapDistance(c,ownBase)<=this.mapDistance(c,oppBase)&&
   (c.alive||(c.respawnAt===0&&this.gameTime<90)||c.respawnAt<=this.gameTime))
   .sort((a,b)=>{const score=c=>(c.alive?0:260)+(c.lastClearedAt!==undefined&&this.gameTime-c.lastClearedAt<45?10000:0)+this.mapDistance(c,u);return score(a)-score(b)});
  for(const camp of candidates){
   const goal=this.walkable(camp.x,camp.y)?{x:camp.x,y:camp.y}:null;
   if(!goal)continue;
   const path=this.findPath(u,goal);if(!path)continue;
   u.plan={steps:[{point:goal,action:'jungle',duration:110,targetId:camp.id,path,startedAt:null}],index:0,completed:false,autoGenerated:true};
   u.order={kind:'route',spell:'none'};break;
  }
 }
 autoAdvanceLane(u,meters){
  if(!u.autoFollow||u.manualMoveHold||u.awaitingShop||u.role==='JG'||u.hp<=0||u.plan&&!u.plan.completed||(u.explicitOrder&&!['farm','push','auto'].includes(u.order?.kind))||['recall','ward','stop','hold'].includes(u.order?.kind))return;
  const lane=u.botSiegeLaneV452d4Dev22||(u.role==='TOP'?'top':u.role==='MID'?'mid':'bot'),line=this.lanes[lane],dir=u.team==='blue'?1:-1;
  const enemies=this.minions.filter(m=>m.team!==u.team&&m.lane===lane&&m.hp>0&&m.spawnAt<=this.gameTime);
  const friends=this.minions.filter(m=>m.team===u.team&&m.lane===lane&&m.hp>0&&m.spawnAt<=this.gameTime);
  const friendFront=friends.length?[...friends].sort((a,b)=>dir===1?b.progress-a.progress:a.progress-b.progress)[0]:null;
  const enemyFront=enemies.length?[...enemies].sort((a,b)=>dir===1?a.progress-b.progress:b.progress-a.progress)[0]:null;
  const lastFriend=friendFront?.progress??(dir===1?.20:.80),frontEnemy=enemyFront?.progress??null;
  const gap=(u.role==='SUP'?.055:Math.min(u.range*(u.tactics?.wave==='freeze'?.08:u.autoFarm?.28:.68),.074))/Math.max(.5,line.total);
  // Dev21: once bot push is authorized, an uncontested friendly wave may
  // escort its champions. The older fallback pinned them to 28/72% forever,
  // preventing natural turret pressure despite minions reaching the tower.
  // This activates only with an actual allied wave and a push order, never
  // at the calibrated opening farm (first 780 simulated seconds).
  const escortPush=this.gameTime>=780&&u.order?.kind==='push'&&!!friendFront;
  let desired=frontEnemy===null?
   (escortPush?lastFriend-dir*Math.max(.015,gap):(dir===1?.28:.72)):
   frontEnemy-dir*gap;
  if(u.tactics?.wave==='freeze'){
   const frontlineEngaged=friendFront&&enemyFront&&this.mapDistance(friendFront,enemyFront)<=Math.max(friendFront.range||0,enemyFront.range||0)*this.worldWidth+25;
   if(!Number.isFinite(u.waveFreezeAnchorV452c)&&frontlineEngaged)
    u.waveFreezeAnchorV452c=clamp((frontEnemy+lastFriend)/2,.13,.87);
   if(Number.isFinite(u.waveFreezeAnchorV452c))desired=frontEnemy===null?u.waveFreezeAnchorV452c-dir*gap:frontEnemy-dir*gap;
  }else if(Number.isFinite(u.waveFreezeAnchorV452c))u.waveFreezeAnchorV452c=null;
  // A lane's allied minions are the primary safety line (avoid solo turret dives).
  const allyMargin=u.role==='SUP'?.025:u.autoFarm&&u.range<.020?.032:.012;
  if(dir===1)desired=Math.min(desired,lastFriend+allyMargin);else desired=Math.max(desired,lastFriend-allyMargin);
  // Freeze anchors on the first local minion clash, holds the wave in range,
  // and keeps the farmer close enough to take CS with last hits only.
  // Deny: threaten the enemy CS zone.
  if(u.tactics?.wave==='deny'&&frontEnemy!==null){const denyMargin=.019;desired=frontEnemy-dir*denyMargin;}
  const breached=this.structures.some(st=>st.team!==u.team&&st.type==='inhibitor'&&!st.alive);
  // DEV22: deep escort is gated by an ACTUAL allied frontline and by opened
  // outer defences on this lane. No wave means no free turret dive.
  const outer=this.structures.find(s=>s.id===`${alt(u.team)}_${lane}_t1`);
  const deepEscort=escortPush&&outer&&!outer.alive&&friendFront&&
    (dir===1?friendFront.progress>=.79:friendFront.progress<=.21);
  // DEV23: after a legally breached inhibitor, route behind an actual
  // allied wave toward the Nexus defenders. No clock-based tower damage,
  // no teleport: the champion still walks using the normal collision path.
  const enemyInhibitor=this.structures.find(st=>st.id===`${alt(u.team)}_${lane}_inhibitor`);
  const openedNexus=!!enemyInhibitor&&!enemyInhibitor.alive&&
   this.structures.some(st=>st.team===alt(u.team)&&st.lane==='nexus'&&st.alive&&this.structureVulnerable(st));
  const nexusEscort=deepEscort&&openedNexus&&
   (dir===1?friendFront.progress>=.90:friendFront.progress<=.10);
  // Lane endpoints are at the foot of the base. Prevent the legacy .965 cap
  // from freezing attackers outside the guard towers while minions tank.
  desired=clamp(desired,nexusEscort?.006:deepEscort?.035:breached?.06:.13,
    nexusEscort?.996:deepEscort?.965:breached?.94:.87);
  let target=sampleLine(line,desired);
  // Once a real allied wave has reached the broken base gate, pick a legal
  // structure and close toward attack distance via pathfinding. The original
  // lane spline ends outside the Nexus guard ring on some mask variants.
  if(nexusEscort){
   const guards=this.structures.filter(st=>st.team!==u.team&&st.alive&&st.lane==='nexus'&&this.structureVulnerable(st))
    .sort((a,b)=>this.mapDistance(friendFront,a)-this.mapDistance(friendFront,b)||a.id.localeCompare(b.id));
   const objective=guards[0];
   const nearTank=this.minions.some(m=>m.team===u.team&&m.hp>0&&m.spawnAt<=this.gameTime&&
     m.lane===lane&&objective&&this.mapDistance(m,objective)<=1100);
   if(objective&&nearTank){
    const d=this.mapDistance(u,objective),range=u.range*this.worldWidth;
    if(d>Math.max(90,range*.83)){
     const f=Math.max(0,(d-Math.max(90,range*.78))/d);
     const candidate={x:u.x+(objective.x-u.x)*f,y:u.y+(objective.y-u.y)*f};
     if(this.walkable(candidate.x,candidate.y))target=candidate;
    }else {u.laneFollowPath=[];return;}
   }
  }
  if(this.mapDistance(u,target)<=Math.max(u.range<.020?30:55,meters*.10)){u.laneFollowPath=[];return;}
  const movedGoal=u.laneFollowGoal?this.mapDistance(u.laneFollowGoal,target):Infinity;
  if(!u.laneFollowPath.length||this.gameTime>=u.nextLaneUpdate&&movedGoal>280){
   const path=this.findPath(u,target);
   if(path?.length){u.laneFollowPath=path;u.laneFollowGoal=target;u.nextLaneUpdate=this.gameTime+7;}
   else{u.nextLaneUpdate=this.gameTime+12;return}
  }
  this.moveAlong(u,{path:u.laneFollowPath,point:u.laneFollowGoal},meters);
 }
 awardMinionXP(minion){
  // XP is granted at death to *physically nearby* living allies, independent
  // of last hit. Junglers still earn separate camp XP through the camp system.
  const nearby=this.units.filter(u=>u.team!==minion.team&&u.hp>0&&this.mapDistance(u,minion)<=MINION_XP_RADIUS);
  if(!nearby.length)return;
  const share=nearby.length===1?1:nearby.length===2?.65:1.3/nearby.length;
  const xp=(MINION_XP[minion.kind]||40)*share;
  for(const u of nearby){const assigned=u.role==='TOP'?'top':u.role==='MID'?'mid':['SUP','ADC'].includes(u.role)?'bot':null;const offLaneQuest=assigned&&u.level<3&&minion.lane!==assigned;this.gainXP(u,xp*(offLaneQuest?.75:1));}
 }
 gainXP(u,xp){
  if(!u||u.hp<=0)return;
  u.xp+=xp;
  while(u.level<18&&u.xp>=(LEVEL_THRESHOLDS[u.level+1]??Infinity)){
   u.level++;u.skillPoints=(u.skillPoints||0)+1;this.autoSpendSkills(u);const growth=CHAMPION_GROWTH_V38[u.champ]||{};
   const audited=!!CHAMPION_GROWTH_V38[u.champ],inc=value=>audited?growthAtLevelV42(value,u.level):value;
   const hpGain=inc(growth.hp??72),manaGain=inc(growth.mana??28);
   this.removeRabadonV43(u);
   u.maxHp+=hpGain;u.hp+=hpGain;u.maxMana+=manaGain;u.mana+=manaGain;
   // DEV53 Capítulo Perdido: restaura 20% do mana máximo APÓS o level-up,
   // parcelado em 3 segundos simulados. Acumula eventos de múltiplos níveis.
   if(u.items?.includes('lost_chapter')&&u.maxMana>0){
    u.lostChapterManaPulsesV453Dev53??=[];
    u.lostChapterManaPulsesV453Dev53.push({amount:u.maxMana*.2/3,remaining:3});
   }
   u.ad+=inc(growth.ad??3);u.ap+=audited?0:inc(u.klass==='mage'?7:2);u.armor+=inc(growth.armor??3);u.mr+=inc(growth.mr??1.3);this.reapplyRabadonV43(u);
   this.event(`${u.champ} alcançou nível ${u.level}.`,u.team,'level',u.id);
  }
 }
 advancePlan(u){const stage=this.activeStage(u);if(!stage)return;
  if(stage.path.length===0||dist(u,stage.point)<.006){
   if(stage.startedAt===null){stage.startedAt=this.gameTime;this.event(`${u.champ}: ${stage.action} (etapa ${u.plan.index+1}).`,u.team)}
   // Jungle means engage the camp with repeated AA/spell cycles until clear,
   // not wait for a passive last-hit timer. Respawned camps can be revisited.
   if(stage.action==='jungle'&&stage.targetId){
    const camp=this.camps.find(c=>c.id===stage.targetId);
    if(camp?.alive&&!stage.campCleared)return;
    if(camp&&!camp.alive&&!(camp.lastClearedAt>=stage.startedAt)&&camp.respawnAt>this.gameTime){stage.campCleared=true;}
   }
   if(this.gameTime-stage.startedAt>=stage.duration||stage.campCleared){
    u.plan.index++;
    if(u.plan.index>=u.plan.steps.length){
     if(u.plan.loopJungle){
      u.plan.index=0;u.plan.steps.forEach(st=>{st.startedAt=null;st.campCleared=false;st.path=[];});
      this.event(`${u.champ}: ciclo jungle concluído; rota segue ativa até nova ordem.`,u.team,'jungle_plan',u.id);
     }else{u.plan.completed=true;u.order={kind:'hold',spell:'none'};u.manualMoveHold=true;this.event(`${u.champ}: rota concluída; mantendo posição até nova ordem.`,u.team);}
    }else{
     const next=u.plan.steps[u.plan.index];next.path=this.findPath(u,next.point)||[];
    }
   }
  }
 }
 reviveAndMove(){if(this.phase==='preparation')return;for(const u of this.units){
  if(u.hp<=0){if(this.gameTime>=u.deadUntil){const p=this.map.objects.find(o=>o.id===u.team+'_spawn_shop');u.x=p.x;u.y=p.y;u.hp=u.maxHp;u.mana=u.maxMana;u.skillCd=0;u.recallProgress=0;u.awaitingShop=true;if(u.role==='SUP'&&u.supportQuest>=400)u.wardCharges=Math.max(u.wardCharges,u.supportQuest>=800?4:3);u.manualMoveHold=false;u.order={kind:'auto',spell:'none'};u.explicitOrder=false;u.plan=null;u.laneFollowPath=[];this.event(`${u.champ} renasceu na fonte. Loja disponível.`,u.team,'respawn',u.id)}else continue;}
  const ocean=this.elementalStatsV452d3(u).oceanMissingHealthFraction;
  // Permanent Ocean drakes heal a percentage of MISSING HP every 5 simulated seconds.
  if(ocean&&this.gameTime%5===0)this.effectResolverV41().heal(u,(u.maxHp-u.hp)*ocean,u);u.mana=clamp(u.mana+1.1,0,u.maxMana);if(u.shield>0)u.shield=Math.max(0,u.shield-.3);
  // Ordens explicitas PvP tem prioridade sobre farm, chase e reacoes automaticas.
  if(u.retreatUntil>this.gameTime&&u.retreatGoal){
   if(this.mapDistance(u,u.retreatGoal)>55){
    if(!u.retreatPath?.length)u.retreatPath=this.findPath(u,u.retreatGoal)||[];
    if(u.retreatPath?.length)this.moveAlong(u,{path:u.retreatPath,point:u.retreatGoal},this.effectiveMS(u));
   }else u.retreatUntil=this.gameTime;
   if(u.retreatUntil>this.gameTime)continue;
  }
  if(this.advanceRiftPlantV453Dev45(u))continue;
  if(this.advanceHeraldCarrierV452d4Dev20(u))continue;
  this.applyReaction(u);
  this.autoStartJungle(u);
  const o=u.order||{kind:'auto'};const stage=this.activeStage(u);
  const retreatThreshold=u.policy==='safe'?.20:u.policy==='aggressive'?.09:.14;
  const retreat=!!u.lastHitBy&&this.gameTime-u.lastHitAt<4&&u.hp/u.maxHp<retreatThreshold;
  if(retreat){u.shield=Math.max(u.shield,40);u.combatUntil=this.gameTime+2;}
  if(retreat&&!u.explicitOrder&&['auto','farm','push'].includes(o.kind)){
   const lane=u.role==='TOP'?'top':u.role==='MID'?'mid':'bot';
   const safe=this.structures.filter(st=>st.team===u.team&&st.type==='tower'&&st.alive&&st.lane===lane)
    .sort((a,b)=>this.mapDistance(u,a)-this.mapDistance(u,b))[0]||this.map.objects.find(p=>p.id===u.team+'_spawn_shop');
   if(safe){
    const goal={x:safe.x,y:safe.y};
    if(!u.farmRetreatGoalV452c||this.mapDistance(u,u.farmRetreatGoalV452c)<45){u.farmRetreatGoalV452c=goal;u.farmRetreatPathV452c=this.findPath(u,goal)||[];}
    if(u.farmRetreatPathV452c?.length)this.moveAlong(u,{path:u.farmRetreatPathV452c,point:u.farmRetreatGoalV452c},this.effectiveMS(u));
   }
   continue;
  }
  if(!retreat&&u.farmRetreatGoalV452c){u.farmRetreatGoalV452c=null;u.farmRetreatPathV452c=[];}
  if(o.kind==='recall' || stage?.action==='recall'&&stage.startedAt!==null){
   const p=this.map.objects.find(q=>q.id===u.team+'_spawn_shop');
   if(this.gameTime-u.lastHitAt<=6){u.recallProgress=0;continue}
   u.recallProgress=(u.recallProgress||0)+1;
   if(u.recallProgress>=(this.hasBaronV452(u)?4:8)){u.x=p.x;u.y=p.y;u.hp=u.maxHp;u.mana=u.maxMana;u.recallProgress=0;if(u.role==='MID')u.b7MidQuestRecallBlockUntil=this.gameTime+12;u.order={kind:'auto',spell:'none'};u.explicitOrder=false;u.plan=null;u.manualMoveHold=false;u.awaitingShop=true;if(u.role==='SUP'&&u.supportQuest>=400)u.wardCharges=Math.max(u.wardCharges,u.supportQuest>=800?4:3);u.laneFollowPath=[];this.event(`${u.champ} completou recall. Loja disponível na fonte.`,u.team,'recall_complete',u.id)}
   continue;
  }
  if(o.kind==='attack_herald'){
   const merc=this.heraldMercenariesV45.find(h=>h.id===o.targetId&&h.hp>0&&h.team!==u.team);
   if(!merc){u.order={kind:'auto',spell:'none'};u.explicitOrder=false;continue;}
   if(!this.canSeePoint(u.team,merc))continue; // Fog cannot be bypassed.
   if(this.mapDistance(u,merc)>u.range*this.worldWidth*.85){
    if(!o.heraldPath?.length||!o.heraldLastGoal||this.mapDistance(o.heraldLastGoal,merc)>210){
     o.heraldPath=this.findPath(u,merc)||[];o.heraldLastGoal={x:merc.x,y:merc.y};}
    if(o.heraldPath.length)this.moveAlong(u,{path:o.heraldPath,point:o.heraldLastGoal},this.effectiveMS(u));
   }
   continue;
  }
  if(o.kind==='ward'){
   const goal=o.destination;
   if(!goal||(o.wardType==='control'?(u.controlWardStock||0):u.wardCharges)<=0){u.order={kind:'auto',spell:'none'};continue;}
   if(this.mapDistance(u,goal)<=625){
    this.addWard(u.team,u.id,goal,o.wardType||'stealth');
    u.order={kind:'hold',spell:'none'};u.explicitOrder=true;u.autoFollow=false;
    this.event(`${u.champ} colocou sentinela na posição escolhida.`,u.team,'ward',u.id);
   }else if(u.holdUntil<=this.gameTime){
    const speed=this.effectiveMS(u);
    if(!o.wardPath?.length)o.wardPath=this.findPath(u,goal)||[];
    this.moveAlong(u,{path:o.wardPath,point:goal},speed);
    if(this.mapDistance(u,goal)<=625){
     this.addWard(u.team,u.id,goal,o.wardType||'stealth');
     u.order={kind:'hold',spell:'none'};u.explicitOrder=true;u.autoFollow=false;
     this.event(`${u.champ} colocou sentinela na posição escolhida.`,u.team,'ward',u.id);
    }
   }
   continue;
  }
  if(stage?.action==='ward'&&stage.startedAt!==null&&!stage.usedWard&&u.wardCharges>0){const cast=this.addWard(u.team,u.id,{x:u.x,y:u.y},stage.wardType||'stealth');stage.usedWard=cast.ok;}
  if((o.kind==='defend'||stage?.action==='defend')&&(u.guardShieldAt||0)<=this.gameTime){u.shield=Math.max(u.shield,62+u.level*5);u.guardShieldAt=this.gameTime+12;}
  if(o.kind==='flash'&&u.lastFlashRound!==this.round){const to=o.destination;if(to&&u.flashCd<=this.gameTime&&dist(u,to)<=.090&&this.performActionV40({actorId:u.id,kind:'flash',point:to,source:'order'}).ok){u.x=to.x;u.y=to.y;this.invalidateShopUndoOnDepartureV453Dev61(u);u.lastFlashRound=this.round;this.event(`${u.champ} usou Flash.`)}}
  if((u.stunUntil||0)>this.gameTime||(u.rootUntil||0)>this.gameTime||!this.effectResolverV41().canAct(u,'move').ok)continue;
  if(u.holdUntil>this.gameTime)continue; // local tactical movement hold
  // V4.2 position casts: path through navigable terrain to maximum spell range.
  const kitPending=u.pendingKitCastV42;
  if(kitPending){
   const rule=kitSpellV42(u.champ,kitPending.slot),goal=kitPending.point;
   if(!rule){u.pendingKitCastV42=null;continue;}
   if(this.mapDistance(u,goal)>rule.range){
    if(!kitPending.castPath?.length||!kitPending.lastGoal){
     const route=this.castApproachPathV42(u,goal,rule.range);if(route===null){u.pendingKitCastV42=null;this.event(u.champ+': sem aproximação para habilidade '+kitPending.slot,u.team,'skill_order',u.id);continue;}kitPending.castPath=route;kitPending.lastGoal={...goal};
    }
    if(kitPending.castPath.length)this.moveAlong(u,{path:kitPending.castPath,point:goal},this.effectiveMS(u));
    continue;
   }
  }
  // A targeted skill is an intention, NOT a cross-map cast. Walk through the
  // same navigation as other orders until the *primary* target is in range.
  // Hidden enemies never supply live coordinates to this movement.
  const queued=u.pendingTargetedCast;
  if(queued?.slot==='W'&&u.champ==='Nami'&&!queued.initialized){
   const target=this.units.find(v=>v.id===queued.targetId&&v.hp>0);
   if(!target){u.pendingTargetedCast=null;continue;}
   const tracking=target.team===u.team||this.visible(u.team,target);
   if(tracking)queued.lastSeen={x:target.x,y:target.y};
   const goal=queued.lastSeen;
   if(goal){
    const gap=this.mapDistance(u,goal),desired=abilityRule(u,'W').range;
    if(gap>desired){
     if(!queued.castPath?.length||!queued.pathGoal||this.mapDistance(queued.pathGoal,goal)>100){
      queued.castPath=this.findPath(u,goal)||[];queued.pathGoal={...goal};
     }
     if(queued.castPath?.length)this.moveAlong(u,{path:queued.castPath,point:goal},this.effectiveMS(u));
     continue;
    }
    // Hold position so lane autopilot cannot pull the caster away first.
    if(tracking)continue;
   }
  }
  if(u.retreatUntil>this.gameTime&&u.retreatGoal){
   if(!u.retreatPath?.length)u.retreatPath=this.findPath(u,u.retreatGoal)||[];
   this.moveAlong(u,{path:u.retreatPath,point:u.retreatGoal},this.effectiveMS(u));
   continue; // Attack range is still checked separately in resolveCombat().
  }
  // Pursue a visible enemy using collision/pathing. On loss of vision the
  // champion goes ONLY to the last known coordinate, not the hidden enemy.
  // All planned Q/W/E/R sequences use the registered ability range.
  // Unknown champion kits use a capped training range, never global reach.
  const skillOrder=u.reactionCombo||u.order;
  const nextSlot=skillOrder?.combo?.[skillOrder.comboIndex||0];
  if(skillOrder?.kind==='attack'&&['Q','W','E','R'].includes(nextSlot)){
   const ownDefense=(u.champ==='Yasuo'&&nextSlot==='W')||(u.champ==='Braum'&&nextSlot==='E')||(u.champ==='Mel'&&nextSlot==='W');
   const target=this.units.find(v=>v.id===skillOrder.targetId&&v.team!==u.team&&v.hp>0);
   if(!ownDefense&&target){
    if(this.visible(u.team,target))skillOrder.lastSeen={x:target.x,y:target.y};
    const goal=skillOrder.lastSeen;
    const effectiveRange=abilityRule(u,nextSlot).range;
    if(goal&&this.mapDistance(u,goal)>effectiveRange){
     if(!skillOrder.castPath?.length||!skillOrder.castGoal||this.mapDistance(skillOrder.castGoal,goal)>110){
      skillOrder.castPath=this.findPath(u,goal)||[];skillOrder.castGoal={...goal};
     }
     if(skillOrder.castPath?.length)this.moveAlong(u,{path:skillOrder.castPath,point:goal},this.effectiveMS(u));
     continue;
    }
    if(goal&&this.visible(u.team,target))continue; // now in range; resolve cast this tick
   }
  }
  const pursuit=u.reactionCombo?.chase?u.reactionCombo:u.order;
  if((pursuit?.kind==='chase'||pursuit?.kind==='attack')&&pursuit.targetId){
   const target=this.units.find(v=>v.id===pursuit.targetId&&v.team!==u.team&&v.hp>0);
   if(target&&this.visible(u.team,target)){pursuit.lastSeen={x:target.x,y:target.y};}
   const goal=pursuit.lastSeen;
   if(goal){
    const visible=!!(target&&this.visible(u.team,target));
    const stopAt=pursuit.kind==='chase'?.025:Math.max(.018,(u.range||.035)*.85);
    if(dist(u,goal)>stopAt){
     if(!pursuit.chasePath?.length||!pursuit.chaseGoal||dist(goal,pursuit.chaseGoal)>.012){
      pursuit.chasePath=this.findPath(u,goal)||[];pursuit.chaseGoal={...goal};
     }
     if(pursuit.chasePath?.length)this.moveAlong(u,{path:pursuit.chasePath,point:goal},this.effectiveMS(u));
    }
    if(!visible&&dist(u,goal)<stopAt)pursuit.chaseLost=true;
    continue; // this explicit order never turns into auto-follow farming
   }
  }
  const cloud=this.elementalStatsV452d3(u).outOfCombatMoveFraction;
  // Training scale: 30 simulated seconds should cover meaningful lane distance, not a few pixels.
  // One tick is one in-game second. Measured MS × elapsed seconds of the
  // completed planning window; no arbitrary normalized map percentage.
  const itemBonusV453Dev29=this.itemMoveBonusesV453Dev29(u);const effectiveSpeed=movementSpeed(u.moveSpeed,(u.flatMoveSpeed||0)+itemBonusV453Dev29.flat,(u.percentMoveSpeed||0)+itemBonusV453Dev29.percent+(this.gameTime>=(u.combatUntil||0)?cloud:0)+this.soulMovementBonusV452d2(u)+(u.jungleBuff==='gustwalker'&&u.jungleSpeedUntil>this.gameTime?.075:0)+this.firelightSpeedBonusV452d4(u),this.effectiveSlowV453Dev50(u));
  if(stage&&stage.startedAt===null&&!retreat){
   if(!stage.path?.length&&this.mapDistance(u,stage.point)>65)stage.path=this.findPath(u,stage.point)||[];
   u.spentMove+=this.moveAlong(u,stage,effectiveSpeed);
   this.advancePlan(u);
  }else if(stage)this.advancePlan(u);
  else if(!retreat)this.autoAdvanceLane(u,effectiveSpeed);
 }}
 buildMinionIndex(){
  // Dev25: numeric spatial buckets eliminate hundreds of ephemeral string keys
  // per second. 128 exceeds the largest possible atlas bucket coordinate.
  const buckets=new Map(),inverse=1/.035;
  for(const m of this.minions){if(m.hp<=0||m.spawnAt>this.gameTime)continue;
   const key=Math.floor(m.x*inverse)+Math.floor(m.y*inverse)*128;
   let bucket=buckets.get(key);if(!bucket){bucket=[];buckets.set(key,bucket);}bucket.push(m);
  }
  this.minionIndex=buckets;
 }
 nearbyMinions(point,r=.05){
  const inverse=1/.035,b=this.minionIndex,out=[],xx=Math.floor(point.x*inverse),yy=Math.floor(point.y*inverse),reach=Math.ceil(r*inverse),radiusSquared=r*r;
  if(!b)return out;
  for(let y=yy-reach;y<=yy+reach;y++)for(let x=xx-reach;x<=xx+reach;x++){
   const bucket=b.get(x+y*128);if(!bucket)continue;
   for(const m of bucket){const dx=m.x-point.x,dy=m.y-point.y;
    if(m.hp>0&&dx*dx+dy*dy<=radiusSquared)out.push(m);
   }
  }
  return out;
 }
 nexusWaveObjectiveV452d4Dev23(m){
  const opened=this.structures.some(s=>s.team!==m.team&&s.type==='inhibitor'&&s.lane===m.lane&&!s.alive);
  if(!opened)return null;
  return this.structures.filter(s=>s.team!==m.team&&s.lane==='nexus'&&s.alive&&this.structureVulnerable(s))
   .sort((a,b)=>this.mapDistance(m,a)-this.mapDistance(m,b)||a.id.localeCompare(b.id))[0]||null;
 }
 moveNexusWaveV452d4Dev23(m){
  const objective=this.nexusWaveObjectiveV452d4Dev23(m);
  if(!objective){m.nexusSiegeGoalV452d4Dev23=null;return false;}
  const opponents=this.nearbyMinions(m,.075).filter(e=>e.team!==m.team&&e.hp>0);
  const enemyHeroes=this.units.some(u=>u.team!==m.team&&u.hp>0&&this.mapDistance(m,u)<=m.range*this.worldWidth+35);
  const mods=this.baronMinionModifiersV452d(m);
  if(opponents.some(e=>this.mapDistance(m,e)<=m.range*this.worldWidth+mods.bonusRange)||enemyHeroes||
    this.minionCanHitStructureV452d4Dev17(m,objective,mods))return true;
  // A path from the lane exit to a visible public structure. No teleport,
  // no HP edits, walls and tower retaliation continue to apply as usual.
  if(m.nexusSiegeGoalV452d4Dev23!==objective.id){
   m.nexusSiegeGoalV452d4Dev23=objective.id;m.nexusSiegePathV452d4Dev23=[];
   m.nexusSiegeRetryAtV452d4Dev23=0;
  }
  if(!m.nexusSiegePathV452d4Dev23?.length&&this.gameTime>=(m.nexusSiegeRetryAtV452d4Dev23||0)){
   m.nexusSiegePathV452d4Dev23=this.findPath(m,objective)||[];
   // A failed route cannot trigger another global A* search on every tick.
   m.nexusSiegeRetryAtV452d4Dev23=this.gameTime+10;
  }
  if(m.nexusSiegePathV452d4Dev23?.length)
   this.moveAlong(m,{path:m.nexusSiegePathV452d4Dev23,point:objective},m.speed*this.worldWidth);
  return true;
 }
 moveMinions(){
  // Cache is valid ONLY while minions are moving. Combat can destroy a tower
  // later in the same tick, so it must not leak into any subsequent phase.
  this._laneBlockerCacheV452d4Dev25=new Map();
  const freezes=Object.fromEntries(['top','mid','bot'].map(lane=>[lane,this.laneFreezeStateV452c(lane)]));for(const m of this.minions){if(m.hp<=0||m.spawnAt>this.gameTime)continue;
  const inBase=m.team==='blue'?m.progress>=.965:m.progress<=.035;
  if((m.nexusSiegeGoalV452d4Dev23||inBase)&&this.moveNexusWaveV452d4Dev23(m))continue;
  // A unit may not stop merely because it has ACQUIRED a target; it must close
  // the remaining gap until it can ACTUALLY attack. That discrepancy previously
  // deadlocked melee waves outside their attack range.
  const enemyMin=this.nearbyMinions(m,.105).filter(e=>e.team!==m.team&&e.lane===m.lane).sort((a,b)=>dist(a,m)-dist(b,m));
  const enemyHero=this.units.filter(u=>u.team!==m.team&&u.hp>0&&dist(u,m)<.05).sort((a,b)=>dist(a,m)-dist(b,m));
  const blocker=this.laneBlocker(m);
  const target=enemyMin[0]||enemyHero[0];
  const minionAttackRange=m.range+this.baronMinionModifiersV452d(m).bonusRange/this.worldWidth;
  const freeze=freezes[m.lane],line=this.lanes[m.lane],dir=m.team==='blue'?1:-1;
  const freezeBoundary=freeze?(m.team==='blue'?freeze.anchor+freeze.halfWidth:freeze.anchor+freeze.redOffset):null;
  const correctingFreeze=!!freeze&&(m.team==='blue'?m.progress>freezeBoundary:m.progress>freezeBoundary&&m.progress<=freeze.anchor+freeze.captureWidth);
  if(target&&dist(target,m)<=minionAttackRange+.002&&!correctingFreeze)continue;
  let step=m.speed,movementDir=dir;
  if(correctingFreeze){movementDir=Math.sign(freezeBoundary-m.progress);step=Math.min(step,Math.abs(freezeBoundary-m.progress)*line.total);}
  else if(target){step=Math.min(step,Math.max(0,dist(m,target)-(minionAttackRange-.002)));if(step<.0005)continue;}
  let wanted=clamp(m.progress+movementDir*step/line.total,0,1);
  // Towers are hard lane blockers. The attack point is projected onto the
  // lane spline to compensate for tower art being offset from its centerline.
  if(blocker){const stop=clamp(blocker.p-dir*.011,0,1);
   if(dir*(wanted-stop)>0)wanted=stop;
  }
  if(freeze){
   // Hold allied minions just past the clash and draw the enemy front into
   // last-hit range. Minions still attack and die normally at the local wave.
   if(m.team==='blue')wanted=Math.min(wanted,freeze.anchor+freeze.halfWidth);
   else wanted=Math.max(wanted,freeze.anchor+freeze.redOffset);
  }
  m.progress=wanted;
  const p=sampleLine(line,m.progress);m.x=p.x;m.y=p.y;
 }
 // Keep lane farm timings stable: lane units maintain spine coordinates.
  // Visual formations and future path-based collision operate separately.
  this._laneBlockerCacheV452d4Dev25=null;
 }
 laneRolesForFarmV452c(lane){
  return lane==='top'?['TOP']:lane==='mid'?['MID']:lane==='bot'?['ADC','SUP']:[];
 }
 laneFreezeStateV452c(lane){
  const laneRole=lane==='top'?'TOP':lane==='mid'?'MID':lane==='bot'?'ADC':null;
  if(!laneRole)return null;
  const anchors=this.units.filter(u=>u.hp>0&&u.role===laneRole&&u.autoFarm&&u.tactics?.wave==='freeze'&&
   Number.isFinite(u.waveFreezeAnchorV452c)).map(u=>u.waveFreezeAnchorV452c);
  const anchor=anchors.length?anchors.reduce((sum,value)=>sum+value,0)/anchors.length:null;
  return anchor===null?null:{anchor,halfWidth:.006,redOffset:-.002,captureWidth:.08};
 }
 // Keep attack forecasting on the same damage path as a committed basic attack.
 basicAttackPowerV452c(u,target,style='auto',{commit=false,bonusDamage=0}={}){
  const elemental=this.elementalStatsV452d3(u);let dmg=elemental.ad;
  dmg+=bonusDamage;
  const onHit=style==='on_hit'||style==='skill_aa';
  const stacks=onHit?((this.gameTime-(u.lastAttackAt??-100)>4)?1:Math.min(5,(u.onHitStacks||0)+1)):0;
  if(onHit)dmg+=Math.min(14,2*stacks)+Math.max(0,elemental.ap)*.06;
  if(target?.kind&&target.team!==u.team&&u.items?.includes('dorans_ring'))dmg+=ITEM_EFFECTS_V43.dorans_ring.minionBasicDamage;
  if(target?.kind&&target.team!==u.team&&u.items?.includes('dorans_helm'))dmg+=5; // Ajudinha, dano básico físico a tropas
  // u.ad already includes champion base-stat growth; scaling the hit again
  // suppressed real level-one damage and made ordinary last hits impossible.
  // Infernal belongs to effective AD/AP above; no extra damage multiplier.
  if(u.exhaustUntil>this.gameTime)dmg*=.65;
  if(target?.champ&&(u.order?.kind==='defend'||u.policy==='safe'))dmg*=.75;
  if(commit){u.onHitStacks=stacks;u.lastAttackAt=this.gameTime;}
  return dmg;
 }
  // DEV69: Additional HP, not champion level-growth HP, drives Giant Slayer.
  // Current SR engine sources: items and the selected rune shard. Future health
  // grants need explicit integration here; snapshots retain inventory/rune IDs.
  bonusHealthForGiantSlayerV453Dev69(target){
   if(!target?.champ)return 0;
   const equipped=(target.items||[]).reduce((sum,id)=>sum+Math.max(0,catalog.find(i=>i.id===id)?.stats?.hp||0),0);
   const rune=Math.max(0,RUNE_PAGES_V43[target.runePageV43||'none']?.shards?.hp||0);
   return equipped+rune;
  }
  giantSlayerMultiplierV453Dev69(attacker,target){
   if(!attacker?.champ||!target?.champ||attacker.team===target.team||!attacker.items?.includes('lord_dominiks_regards'))return 1;
   const spec=ITEM_EFFECTS_V43.lord_dominiks_regards;
   return 1+spec.maxBonusFraction*Math.min(1,this.bonusHealthForGiantSlayerV453Dev69(target)/spec.maxBonusHealth);
  }
 predictBasicAttackDamageV452c(u,target,style='auto'){
  const raw=this.basicAttackPowerV452c(u,target,style);
  const amount=raw*this.giantSlayerMultiplierV453Dev69(u,target);
  const resistance=target?.champ?this.elementalStatsV452d3(target).armor:target.armor||0;
  const penetrable=Math.max(-999,resistance*(1-(u.armorPenPercent||0)/100)-(u.lethality||0)-(u.armorPenFlat||0));
  const multiplier=penetrable>=0?100/(100+penetrable):2-100/(100-penetrable);
  return Math.max(1,Math.round(amount*multiplier));
 }
 // RFC extends only the ONE attack made with a fully Energized charge. The
 // range is an authorization check before commit, not a permanent u.range buff.
 itemAttackRangeV453Dev38(u){
  const base=u.range||0;
  if(!u.items?.includes('rapid_firecannon')||(u.energizeStacksV453Dev38||0)<100)return base;
  const spec=ITEM_EFFECTS_V43.rapid_firecannon;
  return base+Math.min(base*spec.bonusRangeRatio,spec.bonusRangeCap/this.worldWidth);
 }
 itemEnergizeMoveV453Dev38(u,meters){
  if(u.hp<=0||!u.items?.some(id=>['rapid_firecannon','statikk_shiv','stormrazor','voltaic_cyclosword'].includes(id))||meters<=0)return;
  const spec=ITEM_EFFECTS_V43.rapid_firecannon;
  u.energizeStacksV453Dev38=Math.min(spec.maxStacks,(u.energizeStacksV453Dev38||0)+meters/spec.travelUnitsPerStack);
 }
 // Dev39: account only for displacement that physically traversed world distance.
 // Flash, teleport, recall, Hexgates, blink and forced map repair are instantaneous
 // position changes: a long jump is NOT walking distance. Do not infer movement
 // type from delta coordinates alone (which also avoids save/load exploits).
 itemEnergizeRelocateV453Dev39(u,from,to,{kind='teleport',travelled=null}={}){
  if(!from||!to||!Number.isFinite(from.x)||!Number.isFinite(from.y)||
     !Number.isFinite(to.x)||!Number.isFinite(to.y))return 0;
  if(!['dash','knockback'].includes(kind))return 0;
  const geometric=this.mapDistance(from,to);
  const authorized=travelled==null?geometric:Math.max(0,Math.min(geometric,Number(travelled)||0));
  if(!Number.isFinite(authorized)||authorized<=0)return 0;
  this.itemEnergizeMoveV453Dev38(u,authorized);
  return authorized;
 }
 itemAttackChargeV453Dev38(u,target){
  if(!u?.champ||u.team===target?.team)return;
  if(u.items?.some(id=>['rapid_firecannon','statikk_shiv','stormrazor','voltaic_cyclosword'].includes(id)))u.energizeStacksV453Dev38=Math.min(100,(u.energizeStacksV453Dev38||0)+20);
  if(u.items?.includes('scouts_slingshot')&&(u.scoutBullseyeReadyAtV453Dev38||0)>this.gameTime)
   u.scoutBullseyeReadyAtV453Dev38=Math.max(this.gameTime,u.scoutBullseyeReadyAtV453Dev38-ITEM_EFFECTS_V43.scouts_slingshot.attackReduction);
 }
 itemProcStatusV453Dev39(u){
  if(!u?.items)return [];
  const now=this.gameTime||0,out=[];
  if(u.items.includes('rapid_firecannon')){
   const charge=Math.min(100,Math.max(0,u.energizeStacksV453Dev38||0));
   out.push({id:'rapid_firecannon',label:'Energizado',value:Math.floor(charge),max:100,ready:charge>=100,description:charge>=100?'Ataque energizado pronto':Math.floor(charge)+'/100 cargas'});
  }
  if(u.items.includes('scouts_slingshot')){
   const remaining=Math.max(0,Math.ceil((u.scoutBullseyeReadyAtV453Dev38||0)-now));
   out.push({id:'scouts_slingshot',label:'Bullseye',value:remaining?0:1,max:1,ready:remaining===0,description:remaining?remaining+'s restantes':'Pronto'});
  }
  if(u.items.includes('kraken_slayer')){
   const stacks=(u.krakenHitV453Dev32?.until??-1)>=now?Math.min(2,u.krakenHitV453Dev32?.stacks||0):0;
   out.push({id:'kraken_slayer',label:'Mata-Cráquens',value:stacks,max:2,ready:stacks===2,description:stacks+'/2 ataques'});
  }
  if(u.items.includes('dorans_ring')){
   const remaining=Math.max(0,Math.ceil((u.doransCombatManaUntilV453Dev38||0)-now));
   out.push({id:'dorans_ring',label:'Anel de Doran',value:remaining,max:5,ready:remaining>0,description:remaining?'Reforço de mana: '+remaining+'s':'Regen. normal'});
  }
  if(u.items.includes('seekers_armguard')){
   out.push({id:'seekers_armguard',label:'Armaguarda',value:u.armguardSpentV453Dev37?0:1,max:1,ready:!u.armguardSpentV453Dev37,description:u.armguardSpentV453Dev37?'Estase consumida':'Estase disponível'});
  }
  return out;
 }
 // DEV51: regeneração extra proveniente de % da BASE. Os campeões ainda não
 // possuem curvas oficiais individuais de regeneração: 1 HP/s e 1 mana/s
 // são parâmetros de treinamento, não paridade com dados da Riot.
 // DEV56: 4 stored tear charges restore every 8 s; time uses same
 // authoritative clock as skills and replay, not browser-only timers.
 procTearManaV453Dev56(attacker,target){
  if(!attacker?.items?.some(id=>['tear_of_the_goddess','winters_approach','archangels_staff','manamune'].includes(id))||target?.team===attacker.team)return 0;
  if(!target?.champ&&!target?.kind&&!target?.monster&&!target?.campId)return 0;
  const spec=ITEM_EFFECTS_V43.tear_of_the_goddess,now=this.gameTime;
  let charges=Math.max(0,Math.min(spec.maxCharges,attacker.tearChargesV453Dev56??4));
  let next=attacker.tearNextChargeAtV453Dev56||0;
  if(charges<spec.maxCharges&&next>0&&now>=next){
   const refill=Math.min(spec.maxCharges-charges,1+Math.floor((now-next)/spec.rechargeSeconds));
   charges+=refill;next=charges>=spec.maxCharges?0:next+refill*spec.rechargeSeconds;
  }
  const available=Math.max(0,spec.maxStackBonus-(attacker.tearManaBonusV453Dev56||0));
  const gain=charges>0?Math.min(available,target.champ?spec.manaPerChampionSkill:spec.manaPerOtherSkill):0;
  if(gain>0){
   if(charges===spec.maxCharges||next<=0)next=now+spec.rechargeSeconds;
   charges--;attacker.tearManaBonusV453Dev56=(attacker.tearManaBonusV453Dev56||0)+gain;
   attacker.maxMana+=gain;attacker.mana=Math.min(attacker.maxMana,attacker.mana+gain);this.refreshTearEvolutionV453Dev69B4(attacker);
  }
  attacker.tearChargesV453Dev56=charges;attacker.tearNextChargeAtV453Dev56=next;
  return gain;
 }
 // DEV57 short aura in combat. No terrain bypass, targets are spatially local;
 // no recursion (item_bami_ source excluded from aura activation).
 advanceBamiAuraV453Dev57(){
  const spec=ITEM_EFFECTS_V43.bamis_cinder;
  for(const u of this.units){
   if(u.hp<=0||!u.items?.includes('bamis_cinder')||(u.bamiActiveUntilV453Dev57||0)<=this.gameTime)continue;
   if(u.bamiLastPulseV453Dev57===this.gameTime)continue;
   u.bamiLastPulseV453Dev57=this.gameTime;
   for(const target of [...this.units,...this.minions]){
    if(target===u||target.hp<=0||target.team===u.team||target.spawnAt>this.gameTime||
       this.mapDistance(u,target)>spec.radius)continue;
    this.damage(target,spec.magicPerSecond,u,'magic','item_bami_v453_dev57');
   }
  }
 }
 advanceItemBaseRegenV453Dev51(){
  for(const u of this.units){
   if(u.hp<=0)continue;
   const hpPct=Math.max(0,u.hpRegenBasePct||0);
   const manaPct=Math.max(0,u.manaRegenBasePct||0);
   if(hpPct>0&&u.hp<u.maxHp)u.hp=Math.min(u.maxHp,u.hp+hpPct/100);
   if(manaPct>0&&u.maxMana>0&&u.mana<u.maxMana)u.mana=Math.min(u.maxMana,u.mana+manaPct/100);
  }
 }
 advanceItemRegenV453Dev38(){
  this.advanceItemBaseRegenV453Dev51();
  // No regen after selling the item; pulses live in serialized champion state.
  for(const u of this.units){
   if(!u.lostChapterManaPulsesV453Dev53?.length)continue;
   if(!u.items?.includes('lost_chapter')){u.lostChapterManaPulsesV453Dev53=[];continue;}
   if(u.hp<=0)continue;
   for(const pulse of u.lostChapterManaPulsesV453Dev53){
    if(pulse.remaining<=0)continue;
    u.mana=Math.min(u.maxMana,u.mana+pulse.amount);pulse.remaining--;
   }
   u.lostChapterManaPulsesV453Dev53=u.lostChapterManaPulsesV453Dev53.filter(p=>p.remaining>0);
  }
  for(const u of this.units){
   if(u.hp<=0||!u.items?.includes('dorans_ring'))continue;
   const spec=ITEM_EFFECTS_V43.dorans_ring;
   const amount=((u.doransCombatManaUntilV453Dev38||0)>0&&this.gameTime<=(u.doransCombatManaUntilV453Dev38||0))?spec.championManaPerSecond:spec.manaPerSecond;
   if(u.maxMana>0)u.mana=Math.min(u.maxMana,u.mana+amount);
   else this.effectResolverV41().heal(u,amount*spec.manalessHealRatio,u);
  }
 }
 basicAttackIntervalV452c(u){
  // CLASS_STATS keeps a deterministic interval proxy in simulated seconds;
  // this is not a champion-specific LoL attack-speed/windup formula.
  const interval=this.elementalStatsV452d3(u).attackInterval;
  const rage=u.items?.includes('guinsoos_rageblade')&&(u.guinsooUntilV453Dev54||0)>this.gameTime?(u.guinsooStacksV453Dev54||0)*8:0;
  const frenzy=u.items?.includes('yun_tal_wildarrows')&&u.yunTalFrenzyUntilV453Dev69B3>this.gameTime?ITEM_ATTACK_RULES_V453_DEV69_B3.yun_tal_wildarrows.frenzyAttackSpeed:0;
  const hexplate=u.items?.includes('experimental_hexplate')&&u.hexplateBuffUntilV453Dev69B4>this.gameTime?ITEM_DEFENSE_RULES_V453_DEV69_B4.experimental_hexplate.attackSpeedPct:0;
  const b6Darts=u.items?.includes('yun_tal_demon_arrows')&&u.b6DartUntil>this.gameTime&&u.b6DartShots>0?ITEM_OFFENSE_RULES_V453_DEV69_B6.yun_tal_demon_arrows.attackSpeedPct:0;
  const supportAttack=(u.ardentUntilV453Dev69B5>this.gameTime?ITEM_SUPPORT_RULES_V453_DEV69_B5.ardent_censer.attackSpeedPct:0)+(this.units.some(v=>v.team===u.team&&v.hp>0&&v.items?.includes('bandocanos')&&v.bandocanosUntilV453Dev69B5>this.gameTime&&this.mapDistance(v,u)<=ITEM_SUPPORT_RULES_V453_DEV69_B5.bandocanos.radius)?ITEM_SUPPORT_RULES_V453_DEV69_B5.bandocanos.attackSpeedPct:0);
  const bonus=Math.max(0,(u.attackSpeedBonusV453Dev29||0)+rage+frenzy+hexplate+supportAttack+b6Darts)/100;
  // Dev47: Winter's Caress only affects enemy champions within actual world
  // distance. Multiple copies never stack. Training attack interval is an
  // approximation, not Riot's full attack-speed soft caps/windup system.
  const aura=ITEM_EFFECTS_V43.frozen_heart;
  const slowed=this.units.some(enemy=>enemy!==u&&enemy.hp>0&&enemy.team!==u.team&&enemy.items?.includes('frozen_heart')&&
   Math.hypot((enemy.x-u.x)*this.worldWidth,(enemy.y-u.y)*this.worldHeight)<=aura.radius);
  return Math.max(.20,interval/(1+bonus)*(slowed?1/(1-aura.attackSpeedSlow):1));
 }
 // Use real world-space range for structure attacks. A lane-progress proxy
 // alone could let empowered cannons fire hundreds of units too early.
 minionCanHitStructureV452d4Dev17(minion,structure,mods=this.baronMinionModifiersV452d(minion)){
  if(!structure||structure.alive===false||!['tower','inhibitor','nexus'].includes(structure.type)||
   minion.team===structure.team||!this.structureVulnerable(structure))return false;
  // Towers are collider footprints, not zero-radius points. `radius` is
  // expressed in pixels of the painted source atlas. Convert it to world
  // units so a minion on the centerline can hit an offset tower *edge*.
  const sourceWidth=this.map.sourceMasks?.dimensions?.[0]||4096;
  const footprint=Math.max(0,structure.radius||0)*this.worldWidth/sourceWidth;
  const reach=minion.range*this.worldWidth+mods.bonusRange+footprint+25;
  return this.mapDistance(minion,structure)<=reach;
 }
 // DEV52: stable, physically informed target selection for lane minions.
 // Economic lane-range candidate list is retained (farm calibration), but the
 // physical body decides which *eligible* unit is closest and a surviving
 // focus stays locked until it leaves legal range. No hidden unit information.
 legacyCombatMinionTargetV453Dev52(m){
  const range=m.range+this.baronMinionModifiersV452d(m).bonusRange/this.worldWidth;
  const enemyMin=this.nearbyMinions(m,range+.010).filter(x=>x.team!==m.team&&x.lane===m.lane).sort((a,b)=>dist(a,m)-dist(b,m));
  const enemyHero=this.units.filter(x=>x.hp>0&&x.team!==m.team&&dist(x,m)<range).sort((a,b)=>dist(a,m)-dist(b,m));
  const blocker=this.laneBlocker(m),nearBlock=blocker&&this.minionCanHitStructureV452d4Dev17(m,blocker.s,this.baronMinionModifiersV452d(m));
  return enemyMin[0]||enemyHero[0]||(nearBlock?blocker.s:null);
 }
 minionChooseEnemyV453Dev52(m,targets){
  if(!targets.length)return null;
  const body=this.minionBodyPositionV453Dev51(m);
  const d=t=>this.mapDistance(body,t.kind?this.minionBodyPositionV453Dev51(t):t);
  const focus=targets.find(t=>t.id===m.minionFocusIdV453Dev52);
  if(focus)return focus;
  return targets.slice().sort((a,b)=>d(a)-d(b)||a.id.localeCompare(b.id))[0];
 }
 minionAttackTargetV452c(m){
  const mods=this.baronMinionModifiersV452d(m),range=m.range+mods.bonusRange/this.worldWidth;
  const enemyMin=this.nearbyMinions(m,range+.010).filter(x=>x.team!==m.team&&x.lane===m.lane&&dist(x,m)<=range+.002);
  const enemyHero=this.units.filter(x=>x.hp>0&&x.team!==m.team&&dist(x,m)<range).sort((a,b)=>dist(a,m)-dist(b,m));
  const blocker=this.laneBlocker(m),nearBlock=blocker&&this.minionCanHitStructureV452d4Dev17(m,blocker.s,mods);
  return this.minionChooseEnemyV453Dev52(m,enemyMin)||enemyHero[0]||(nearBlock?blocker.s:null);
 }
 predictMinionAttackDamageV452c(attacker,target){
  // Match the exact attack power used by resolveCombat, including Baron type
  // modifiers; avoid a separate legacy 1.40x prediction on empowered minions.
  const raw=this.baronMinionAttackDamageV452d(attacker,target);
  const resistance=target.champ?this.elementalStatsV452d3(target).armor:target.type==='tower'?this.structureResistanceV452d4Dev23(target,'physical'):target.armor||0;
  const multiplier=resistance>=0?100/(100+resistance):2-100/(100-resistance);
  return Math.max(1,Math.round(raw*multiplier));
 }
 captureFarmContextV452c(target,farmingTeam){
  const roles=this.laneRolesForFarmV452c(target.lane);
  const farmers=this.units.filter(u=>u.team===farmingTeam&&roles.includes(u.role)).map(u=>{
   const distance=this.mapDistance(u,target),range=(u.range||.035)*this.worldWidth;
   const canAct=this.effectResolverV41().canAct(u,'attack').ok;
   const order=u.order?.kind||'auto',supportAuthorized=u.role!=='SUP'||['attack','push'].includes(order);
   const automated=u.hp>0&&u.autoFarm&&u.autoAttack&&!u.manualMoveHold&&!u.awaitingShop&&order!=='recall'&&supportAuthorized;
   return {id:u.id,champ:u.champ,role:u.role,distance:Math.round(distance),range:Math.round(range),inRange:distance<=range,
    attackAt:u.attackAt,attackReadyAt:Math.max(this.gameTime,u.attackAt||0),attackReady:(u.attackAt||0)<=this.gameTime&&canAct,
    attackInterval: this.basicAttackIntervalV452c(u),attackIntervalSeconds:this.basicAttackIntervalV452c(u),
    attackTimingModel:'class_interval_proxy_1s_tick',windupSeconds:u.attackWindupSecondsV452c??null,canAct,automated,
    laneProgress:u.laneFollowGoal?Math.round(this.mapDistance(u,u.laneFollowGoal)):null,
    pathPoints:u.laneFollowPath?.length||0,moveHeld:!!u.manualMoveHold,order,autoFarm:!!u.autoFarm,autoAttack:u.autoAttack!==false,
    predictedDamage:this.predictBasicAttackDamageV452c(u,target,u.order?.combatStyle||u.combatStyle||'auto')};
  });
  const inRange=farmers.filter(f=>f.inRange),automated=inRange.filter(f=>f.automated);
  let reason='no_lane_farmer';
  if(farmers.length&&!inRange.length)reason='out_of_range';
  else if(inRange.length&&!automated.length)reason='automation_blocked';
  else if(automated.some(f=>f.attackReady))reason='ready_not_selected';
  else if(automated.length&&automated.every(f=>f.attackAt>this.gameTime))reason='on_cooldown';
  else if(automated.length)reason='crowd_control';
  const upcoming=this.minions.filter(m=>m.team===farmingTeam&&m.lane===target.lane&&m.hp>0&&m.spawnAt<=this.gameTime&&m.attackAt<=this.gameTime+1)
   .filter(m=>this.minionAttackTargetV452c(m)?.id===target.id)
   .sort((a,b)=>a.attackAt-b.attackAt||a.id.localeCompare(b.id))
   .map(m=>({id:m.id,kind:m.kind,attackAt:m.attackAt,secondsUntilAttack:Math.max(0,m.attackAt-this.gameTime),
    distance:Math.round(this.mapDistance(m,target)),range:Math.round((m.range+.010)*this.worldWidth),
    predictedDamage:this.predictMinionAttackDamageV452c(m,target)}));
  return {reason,farmers,upcomingMinionAttacks:upcoming,
   predictedIncomingMinionDamage:upcoming.reduce((sum,hit)=>sum+hit.predictedDamage,0)};
 }
 recordFarmTelemetryV452c(target,attacker,healthBefore,damage,context){
  const lane=target.lane||'unknown',farmingTeam=target.team==='blue'?'red':'blue';
  this.farmTelemetryV452??={blue:{},red:{}};
  const telemetry=this.farmTelemetryV452;
  telemetry.blue??={};telemetry.red??={};telemetry.events??=[];
  const counter=(telemetry[farmingTeam][lane]??={secured:0,missedByWave:0,outOfRange:0,onCooldown:0,missedByCause:{},missedByReason:{}});
  telemetry[farmingTeam][lane]=counter;counter.missedByCause??={};counter.missedByReason??={};
  const secured=!!attacker?.champ&&attacker.team===farmingTeam;
  let cause='other';
  if(attacker?.champ)cause=attacker.team===farmingTeam?'champion_last_hit':'enemy_champion';
  else if(attacker?.kind)cause=attacker.team===farmingTeam?'allied_minion':'enemy_minion';
  else if(attacker?.type==='tower')cause=attacker.team===farmingTeam?'allied_tower':'enemy_tower';
  else if(attacker?.team)cause=attacker.team===farmingTeam?'allied_damage':'enemy_damage';
  const reason=secured?null:(context?.reason||'unknown');
  if(secured)counter.secured=(counter.secured||0)+1;
  else{
   counter.missedByWave=(counter.missedByWave||0)+1;
   counter.missedByCause[cause]=(counter.missedByCause[cause]||0)+1;
   counter.missedByReason[reason]=(counter.missedByReason[reason]||0)+1;
   if(reason==='out_of_range')counter.outOfRange=(counter.outOfRange||0)+1;
   if(reason==='on_cooldown')counter.onCooldown=(counter.onCooldown||0)+1;
  }
  telemetry.events.push({time:this.gameTime,wave:target.spawnWaveV452c??null,lane,minionId:target.id,kind:target.kind,
   minionTeam:target.team,healthBefore:Math.round(healthBefore*100)/100,damage:Math.round(damage*100)/100,
   killer:{id:attacker?.id??null,team:attacker?.team??null,kind:attacker?.champ?'champion':attacker?.kind?'minion':attacker?.type||'other'},
   outcome:secured?'secured':'missed',cause,missReason:reason,farmers:context?.farmers||[],
   upcomingMinionAttacks:context?.upcomingMinionAttacks||[],predictedIncomingMinionDamage:context?.predictedIncomingMinionDamage||0});
  if(telemetry.events.length>512)telemetry.events.splice(0,telemetry.events.length-512);
 }

 structureResistanceV452d4Dev23(target,damageType){
  const armor=damageType==='magic'?(target.mr??target.armor??0):(target.armor??0);
  if(target.type!=='tower'||!target.id?.endsWith('_t1'))return armor;
  // LoL 2026 outer-turret resistance decay: minutes 11..15, no HP edits.
  const elapsed=Math.max(0,Math.min(4,Math.floor(this.gameTime/60)-10));
  return Math.max(0,armor-elapsed*(damageType==='magic'?15:10));
 }
 // DEV47: attribution after a non-champion lethal hit is independent from the
 // environmental finisher. Damage attribution survives the killer's own death.
 // Select the most recent opposing champion hit in the last 15 game seconds;
 // use a stable ID tiebreak to keep snapshots/replays deterministic.
 championKillCreditV453Dev47(target,finisher){
  if(finisher?.champ&&finisher.team!==target.team)return finisher;
  const eligible=Object.entries(target.damageContributors||{})
   .map(([id,at])=>({champ:this.units.find(u=>u.id===id),at:Number(at)}))
   .filter(({champ,at})=>champ?.champ&&champ.team!==target.team&&Number.isFinite(at)&&at<=this.gameTime&&this.gameTime-at<=15)
   .sort((a,b)=>b.at-a.at||a.champ.id.localeCompare(b.champ.id));
  return eligible[0]?.champ||null;
 }
 damage(target,amount,attacker=null,damageType='physical',sourceType='other'){if(sourceType==='basic'&&attacker?.champ&&this.effectResolverV41().has(attacker,'blind'))return 0;
  // Explicit opt-in ability hits can apply item on-hit, without masquerading as
  // basic attacks. Spell shields still block the primary ability and its procs.
  if(['spell','ability_onhit_v453_dev40'].includes(sourceType)&&attacker?.team&&attacker.team!==target.team&&this.effectResolverV41().has(target,'spell_shield')){const layer=this.effectResolverV41().list(target).find(e=>e.type==='spell_shield');layer.until=this.gameTime;this.consumeItemAnnulV453Dev69Batch2(target,layer);this.effectResolverV41().record('spell_shield_block',target,attacker,{effectId:layer.id,type:'damage'});return 0;}
  if(target.hp<=0||target.stasisUntil>this.gameTime||this.effectResolverV41().has(target,'stasis')||this.effectResolverV41().has(target,'invulnerable'))return 0;
  // Dev66: Exaustão também reduz dano de habilidades e procs do campeão.
  // AAs normais já recebem a redução ao calcular basicAttackPowerV452c;
  // evitar redução dupla e não mexer no dano true ou das tropas/torres.
  if(sourceType!=='basic'&&damageType!=='true'&&attacker?.champ&&attacker.team!==target.team&&
     (attacker.exhaustUntil||0)>this.gameTime)amount*=.65;if(['tower','inhibitor','nexus'].includes(target.type)&&!this.structureVulnerable(target))return 0;
 // Type-specific Baron defenses are evaluated against the attacker, rather
 // than inflating the persistent minion HP (which would break snapshots/farm).
 if(attacker?.champ&&target?.champ&&target.team!==attacker.team&&!sourceType.startsWith('item_')){
   if(attacker.items?.includes('immortal_journey')&&attacker.hp>=attacker.maxHp*.5)amount*=1+ITEM_REMAINDER_RULES_V453_DEV69_B7.immortal_journey.damageAboveHalf;
   if(attacker.items?.includes('actualizer')&&attacker.b7ActualizerUntil>this.gameTime&&['spell','ability_onhit_v453_dev40'].includes(sourceType))amount*=1+ITEM_REMAINDER_RULES_V453_DEV69_B7.actualizer.spellDamageAmp;
  }
 if(damageType!=='true'&&target.kind&&target.team!==attacker?.team){
  const protection=this.baronMinionModifiersV452d(target);
  if(protection.empowered){
   if(attacker?.champ)amount*=protection.incomingChampionMultiplier;
   else if(attacker?.kind)amount*=protection.incomingMinionMultiplier;
  }
 }
 // Mountain modifies effective armor/MR, not incoming damage twice.
 if(target.champ&&attacker?.champ&&attacker.team!==target.team&&this.soulTypeV452d2(target)==='chemtech'&&target.hp/Math.max(1,target.maxHp)<SOUL_RULES_V452D2.chemtechThreshold)
  amount*=1-SOUL_RULES_V452D2.chemtechFactor;
 if(attacker?.champ&&target.team!==attacker.team){
  // Infernal scales the attacker's AD/AP when constructing the original hit.
  if(this.soulTypeV452d2(attacker)==='chemtech'&&attacker.hp/Math.max(1,attacker.maxHp)<SOUL_RULES_V452D2.chemtechThreshold)
   amount*=1+SOUL_RULES_V452D2.chemtechFactor;
 }
 // V4.5.3-dev29: a prepared Spellblade empowers one valid basic attack.
 // The extra physical raw damage uses an approximate pre-item base AD; effects
 // remain atomic within the authoritative hit and never recursively proc.
 if(sourceType==='basic'&&attacker?.champ&&target.team!==attacker.team&&
    (attacker.spellbladeArmedUntilV453Dev29||0)>=this.gameTime&&
    (attacker.spellbladeNextV453Dev29||0)<=this.gameTime&&
    attacker.items?.some(id=>id==='sheen'||id==='trinity_force'||id==='essence_reaver')){
  const ratio=attacker.items.includes('trinity_force')?2:1;
  const itemAD=attacker.items.reduce((sum,id)=>sum+(catalog.find(v=>v.id===id)?.stats?.ad||0),0);
  const approxBaseAD=Math.max(1,(attacker.ad||0)-itemAD);
  if(damageType==='physical')amount+=ratio*approxBaseAD;
  else this.damage(target,ratio*approxBaseAD,attacker,'physical','item_spellblade');
  attacker.spellbladeArmedUntilV453Dev29=-1;
  attacker.spellbladeNextV453Dev29=this.gameTime+1.5;
  if(attacker.items.includes('essence_reaver'))attacker.mana=Math.min(attacker.maxMana,attacker.mana+ITEM_ATTACK_RULES_V453_DEV69_B3.essence_reaver.manaOnHit);
 }
 // DEV57: activate Bami on valid enemy damage attempts, not item aura ticks.
 if(!sourceType.startsWith('item_bami_')&&attacker?.team!==target.team){
  if(attacker?.champ&&attacker.items?.includes('bamis_cinder'))attacker.bamiActiveUntilV453Dev57=this.gameTime+ITEM_EFFECTS_V43.bamis_cinder.activeSeconds;
  if(target.champ&&target.items?.includes('bamis_cinder'))target.bamiActiveUntilV453Dev57=this.gameTime+ITEM_EFFECTS_V43.bamis_cinder.activeSeconds;
 }
 // DEV56: Tear 'Ajudinha' only applies on basic hits against enemy minions.
 if(sourceType==='basic'&&attacker?.champ&&target?.kind&&target.team!==attacker.team&&attacker.items?.includes('tear_of_the_goddess'))
  amount+=ITEM_EFFECTS_V43.tear_of_the_goddess.minionBasicBonus;
 // DEV54: Máscara Assustadora: combat time in seconds, no minion/structure boosts,
 // no recursion from item, DOT, rune or environmental damage. Different victims share
 // the attacker's champion-combat window; inventory removal immediately disables it.
 if(attacker?.champ&&target?.champ&&attacker.team!==target.team&&attacker.items?.includes('haunting_guise')&&
    !['item','dot','rune','item_guinsoo_dev54','item_kraken','item_recurve','item_nashors'].some(v=>sourceType===v||sourceType.startsWith(v+'_'))){
   const previous=attacker.hauntingGuiseCombatV453Dev54;
   const started=previous&&this.gameTime-previous.lastHit<=5?previous.started:this.gameTime;
   const elapsed=Math.max(0,this.gameTime-started);
   amount*=1+Math.min(.06,.02*Math.floor(elapsed));
   attacker.hauntingGuiseCombatV453Dev54={started,lastHit:this.gameTime};
 }
  // DEV69: Giant Slayer applies only champion-authored physical/magic damage
  // to opposing champions. It does not amplify true damage or reflected effects.
  if(damageType!=='true'&&attacker?.champ&&target?.champ&&
     !['item','rune','dot'].includes(sourceType)&&!sourceType.startsWith('item_'))
   amount*=this.giantSlayerMultiplierV453Dev69(attacker,target);
 // Family amp affects primary legitimate hits, not recursive item procs.
 if(attacker?.champ&&target?.champ&&attacker.team!==target.team&&!sourceType.startsWith('item_')){
  if(attacker.items?.includes('shadowflame')&&['magic','true'].includes(damageType)&&target.hp/Math.max(1,target.maxHp)<.40)
   amount*=1+ITEM_FAMILY_RULES_V453_DEV69.shadowflame.bonusFraction;
  if(attacker.items?.includes('riftmaker'))amount*=this.itemBattleRampV453Dev69(attacker,'riftmaker',sourceType);
  if(attacker.items?.includes('liandrys_torment'))amount*=this.itemBattleRampV453Dev69(attacker,'liandrys_torment',sourceType);
 }
 // Shojin affects authored skill damage, not child item/rune/DoT procs.
 if(sourceType==='spell'&&attacker?.champ&&target?.champ&&attacker.team!==target.team&&attacker.items?.includes('spear_of_shojin')){
  const stacks=target.shojinDebuffV453Dev69B4?.[attacker.id];
  if(stacks?.until>this.gameTime)amount*=1+stacks.stacks*ITEM_DEFENSE_RULES_V453_DEV69_B4.spear_of_shojin.damagePerStack;
 }
 // Abyssal's aura is owned by an ally near the victim; no fog or enemy inventory broadcast.
 if(damageType==='magic'&&attacker?.team&&target.team!==attacker.team&&
    this.units.some(u=>u.hp>0&&u.team===attacker.team&&u.items?.includes('abyssal_mask')&&
      this.mapDistance(u,target)<=ITEM_FAMILY_RULES_V453_DEV69.abyssal_mask.radius))
  amount*=1+ITEM_FAMILY_RULES_V453_DEV69.abyssal_mask.amplifyMagic;
 if(target.champ)this.refreshKaenicShieldV453Dev69(target);
 const derivedTarget=target.champ?this.elementalStatsV452d3(target):target;
 const cleaverDebuffV453Dev29=target.champ&&target.cleaverDebuffV453Dev29?.until>this.gameTime?target.cleaverDebuffV453Dev29:null;
 const targetRes=target.type==='tower'?this.structureResistanceV452d4Dev23(target,damageType):damageType==='magic'?((derivedTarget.mr||0)*(1-(target.bloodletterShredV453Dev69?.until>this.gameTime?Math.min(4,target.bloodletterShredV453Dev69.stacks)*.075:0))):(derivedTarget.armor||0);
 const effectiveTargetResV453Dev29=damageType==='physical'&&cleaverDebuffV453Dev29?targetRes*(1-Math.min(.30,cleaverDebuffV453Dev29.stacks*.06)):targetRes;
 const term=attacker?.items?.includes('terminus')&&attacker.terminusV453Dev69B3?.until>this.gameTime?attacker.terminusV453Dev69B3.dark||0:0;
 const termPen=term*ITEM_ATTACK_RULES_V453_DEV69_B3.terminus.penPerDark;
 const penetrable=damageType==='true'?0:damageType==='magic'?Math.max(-999,effectiveTargetResV453Dev29*(1-((attacker?.magicPenPercent||0)+termPen)/100)-(attacker?.magicPenFlat||0)):Math.max(-999,effectiveTargetResV453Dev29*(1-((attacker?.armorPenPercent||0)+termPen)/100)-(attacker?.lethality||0)-(attacker?.armorPenFlat||0));
 const resistance=penetrable;const multiplier=resistance>=0?100/(100+resistance):2-100/(100-resistance);const amount2=Math.max(1,Math.round(amount*multiplier));let final=amount2;if(attacker?.jungleBuff==='scorchclaw'&&target.champ&&attacker.team!==target.team&&(attacker.jungleBurnAt||0)<=this.gameTime){final+=Math.round(target.maxHp*.05);target.slowPercent=Math.max(target.slowPercent||0,.20);attacker.jungleBurnAt=this.gameTime+30;}// DEV50 Barricade: 10% reduction to a legal BASIC attack, after resistances,
 // before existing shields. Does not reduce spell, DOT, true damage or item on-hit
 // separately: deliberately scoped to the primary basic hit.
 if(sourceType==='basic'&&target.champ&&target.items?.includes('plated_steelcaps'))final=Math.max(1,Math.round(final*.90));
 if(attacker?.team&&target.champ&&attacker.team!==target.team){target.lastHitBy=attacker.id;target.lastHitAt=this.gameTime;
   // Track participation for the scoreboard. Only real opposing champions qualify.
   if(attacker.champ){target.damageContributors??={};target.damageContributors[attacker.id]=this.gameTime;}target.combatUntil=this.gameTime+6;target.threatId=attacker.id;if(this.gameTime-(target.lastAlertAt??-100)>12){target.lastAlertAt=this.gameTime;this.event(`${target.champ} sofreu ataque de ${attacker.champ||attacker.name||attacker.id}: postura ${target.policy}, reação automática ativada.`,target.team,'danger',target.id);}}  // Physical/magic on-hit anti-heal applies through ordinary shields. A
  // spell shield or invulnerability returns above and prevents the effect.
  if(amount2>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team&&!['dot','rune'].includes(sourceType)){
   if(damageType==='magic'&&attacker.items?.includes('morellonomicon'))this.applyEffectV41(target,'grievous_wounds',{duration:3,source:attacker,key:'morellonomicon'});
   if(damageType==='physical'&&attacker.items?.includes('mortal_reminder'))this.applyEffectV41(target,'grievous_wounds',{duration:3,source:attacker,key:'mortal_reminder'});
   if(sourceType==='spell'&&attacker.items?.includes('rylais_crystal_scepter'))this.applyEffectV41(target,'slow',{duration:1,power:.30,source:attacker,key:'rylais'});
   if(damageType==='magic'&&attacker.items?.includes('oblivion_orb'))this.applyEffectV41(target,'grievous_wounds',{duration:3,source:attacker,key:'oblivion_orb'});
   if(damageType==='physical'&&attacker.items?.includes('executioners_calling'))this.applyEffectV41(target,'grievous_wounds',{duration:3,source:attacker,key:'executioners_calling'});
  }
 // Support Mandate mark: damage amplification is visible only to the receiving server state.
 if(final>0&&target?.champ&&attacker?.champ&&attacker.team!==target.team&&
   target.imperialVulnerableV453Dev69B5?.until>this.gameTime&&!sourceType.startsWith('item_'))
  final*=1+ITEM_SUPPORT_RULES_V453_DEV69_B5.imperial_mandate.damageAmp;
// Apply on-hit item effects only to legal enemy targets. A protected
  // spell-shielded hit returned above and cannot add stacks.
 if(amount2>0&&attacker?.champ&&attacker.team!==target.team&&sourceType==='basic'&&
    attacker.items?.some(id=>['phage','trinity_force'].includes(id))){
  attacker.itemSprintFlatV453Dev29=attacker.range>.05?10:20;
  attacker.itemSprintUntilV453Dev29=this.gameTime+2;
 }
 if(amount2>0&&target.champ&&attacker?.champ&&attacker.team!==target.team&&
    damageType==='physical'&&attacker.items?.includes('black_cleaver')&&!['dot','rune','item_spellblade'].includes(sourceType)){
  const state=target.cleaverDebuffV453Dev29?.until>this.gameTime?target.cleaverDebuffV453Dev29:{stacks:0,until:0,lastProcBy:{}};
  // Avoid more than one non-basic stack per caster per simulation second.
  const allowed=sourceType==='basic'||state.lastProcBy?.[attacker.id]!==this.gameTime;
  if(allowed){state.stacks=Math.min(5,(state.stacks||0)+1);state.until=this.gameTime+6;
   state.lastProcBy??={};state.lastProcBy[attacker.id]=this.gameTime;
   target.cleaverDebuffV453Dev29=state;}
  attacker.itemSprintFlatV453Dev29=attacker.range>.05?10:20;
  attacker.itemSprintUntilV453Dev29=this.gameTime+2;
 }
// Mountain Soul must wait 5 seconds after any damage attempt, including
// hits that are entirely absorbed by a shield.
if(target.champ&&attacker?.team!==target.team&&amount2>0)target.soulLastDamageAtV452d2=this.gameTime;
const farmHealthBeforeV452c=target.hp;
const farmContextV452c=target.id?.startsWith('m')&&target.kind&&target.hp<=final?this.captureFarmContextV452c(target,target.team==='blue'?'red':'blue'):null;
 // DEV31 Rock Solid: incoming basic damage reduced after mitigation (max 20%).
 if(sourceType==='basic'&&target.champ&&target.items?.includes('wardens_mail'))final-=Math.min(15,Math.floor(final*.2));
  if(sourceType==='basic'&&target.champ&&target.items?.includes('armored_mobilization'))final*=1-ITEM_REMAINDER_RULES_V453_DEV69_B7.armored_mobilization.attackReduction;
  if(target?.champ&&attacker?.champ&&attacker.team!==target.team&&damageType!=='true'){
   const itemId=damageType==='magic'&&target.items?.includes('chained_crushers')?'chained_crushers':
      damageType==='physical'&&target.items?.includes('armored_mobilization')?'armored_mobilization':null;
   if(itemId&&(target.b7BootShieldReady||0)<=this.gameTime){
    const s=ITEM_REMAINDER_RULES_V453_DEV69_B7[itemId];target.b7BootShieldReady=this.gameTime+s.cooldown;
    this.applyEffectV41(target,itemId==='chained_crushers'?'magic_shield':'physical_shield',{source:target,power:s.shield,duration:s.seconds,key:'boot_b7_'+itemId});
   }
  }
  if(final>0&&target?.champ&&target.items?.includes('protoplasm_harness')&&
    (target.b7ProtoplasmReady||0)<=this.gameTime&&target.hp-final<target.maxHp*ITEM_REMAINDER_RULES_V453_DEV69_B7.protoplasm_harness.threshold){
    const spec=ITEM_REMAINDER_RULES_V453_DEV69_B7.protoplasm_harness;
    target.b7ProtoplasmReady=this.gameTime+spec.cooldown;target.b7ProtoplasmUntil=this.gameTime+spec.seconds;target.b7ProtoplasmBonusHp=spec.bonusHp;
    target.maxHp+=spec.bonusHp;target.hp+=spec.bonusHp;
  }
 // DEV57 magic-only lifeline triggers before HP crosses 30% from a magic hit.
 if(target.champ&&target.items?.includes('hexdrinker')&&damageType==='magic'){
  const spec=ITEM_EFFECTS_V43.hexdrinker;
  if((target.hexdrinkerBarrierUntilV453Dev57||0)<=this.gameTime)target.hexdrinkerMagicBarrierV453Dev57=0;
  if(final>0&&target.hp-final<target.maxHp*spec.hpThreshold&&
    (target.hexdrinkerReadyAtV453Dev57||0)<=this.gameTime){
   target.hexdrinkerMagicBarrierV453Dev57=spec.magicShield;
   target.hexdrinkerBarrierUntilV453Dev57=this.gameTime+spec.shieldSeconds;
   target.hexdrinkerReadyAtV453Dev57=this.gameTime+spec.cooldownSeconds;
  }
  if((target.hexdrinkerMagicBarrierV453Dev57||0)>0){
   const absorbed=Math.min(final,target.hexdrinkerMagicBarrierV453Dev57);
   final-=absorbed;target.hexdrinkerMagicBarrierV453Dev57-=absorbed;
  }
 }
 // Death's Dance delays physical and magic incoming damage from enemies, never deferred ticks.
 if(final>0&&target?.champ&&target.items?.includes('deaths_dance')&&attacker?.team!==target.team&&
    damageType!=='true'&&sourceType!=='item_deaths_dance_deferred_b4'){
  const delayed=final*ITEM_DEFENSE_RULES_V453_DEV69_B4.deaths_dance.deferRatio;
  final-=delayed;
  target.deathDanceQueueV453Dev69B4??=[];
  target.deathDanceQueueV453Dev69B4.push({power:delayed/3,next:this.gameTime+1,remaining:3,attackerId:attacker?.id||null});
 }
 // Shared Lifeline checks are one-shot and absorb the triggering hit.
 this.procLifelineV453Dev69(target,final,damageType);
 const absorbedV41=this.effectResolverV41().absorb(target,final,damageType);
 if(target.champ&&damageType==='magic'&&final>0&&attacker?.team&&attacker.team!==target.team&&target.items?.includes('kaenic_rookern'))
  target.kaenicReadyAtV453Dev69=this.gameTime+ITEM_FAMILY_RULES_V453_DEV69.kaenic_rookern.rechargeSeconds;
 final=absorbedV41.remaining;
 // Knight's Vow: redirect actual HP damage, never shields or reflection loops.
 if(final>0&&target?.champ&&attacker?.team&&attacker.team!==target.team&&sourceType!=='item_knights_vow_b5'){
  const owner=this.units.find(v=>v.hp>0&&v.team===target.team&&v.id!==target.id&&v.items?.includes('knights_vow')&&
    v.knightsVowTargetV453Dev69B5===target.id&&this.mapDistance(v,target)<=ITEM_SUPPORT_RULES_V453_DEV69_B5.knights_vow.range);
  if(owner){const redirect=final*ITEM_SUPPORT_RULES_V453_DEV69_B5.knights_vow.redirect;
   final=Math.max(0,final-redirect);this.damage(owner,redirect,attacker,damageType,'item_knights_vow_b5');}
 }
 // Guardian Angel intercepts only actual lethal post-shield champion HP damage.
 if(target?.champ&&target.items?.includes('guardian_angel')&&final>=target.hp&&target.hp>0&&
    (target.gaReadyAtV453Dev69B4||0)<=this.gameTime){
  target.gaReadyAtV453Dev69B4=this.gameTime+ITEM_DEFENSE_RULES_V453_DEV69_B4.guardian_angel.cooldown;
  target.gaReviveAtV453Dev69B4=this.gameTime+ITEM_DEFENSE_RULES_V453_DEV69_B4.guardian_angel.stasisSeconds;
  target.stasisUntil=Math.max(target.stasisUntil||0,target.gaReviveAtV453Dev69B4);
  final=Math.max(0,target.hp-1);
 }
 const dealt=Math.min(Math.max(0,target.hp),final);target.hp=Math.max(0,target.hp-final);
  this.recordChampionDamageV452d4Dev7(target,attacker,dealt,damageType);
  // Champion damage while Annul is DOWN resets its recovery cooldown.
  if(dealt>0&&target?.champ&&attacker?.champ&&attacker.team!==target.team){
   const spec=this.itemAnnulSpecV453Dev69Batch2(target);
   if(spec&&(target.itemAnnulReadyAtV453Dev69Batch2||0)>this.gameTime)
    target.itemAnnulReadyAtV453Dev69Batch2=this.gameTime+spec.cooldown;
  }
  // DEV53 Eternidade: somente dano EFETIVAMENTE sofrido de campeão inimigo.
  // Escudos absorvidos, ataques inválidos e fontes neutras não recuperam mana.
  if(dealt>0&&target.champ&&attacker?.champ&&attacker.team!==target.team&&
     target.items?.some(id=>id==='catalyst_of_aeons'||id==='rod_of_ages')&&target.maxMana>0){
   const manaReturn=dealt*.10;target.mana=Math.min(target.maxMana,target.mana+manaReturn);
  }
  // DEV56: stacking needs a landed damaging spell, never DoT, item or basic.
  // Charge state and item proc cooldowns are serialized on the champion.
  if(dealt>0&&attacker?.champ&&attacker.team!==target.team&&
     ['spell','ability_onhit_v453_dev40'].includes(sourceType))
   this.procTearManaV453Dev56(attacker,target);
  this.onBulkItemChampionHitV453Dev69(attacker,target,dealt,damageType,sourceType);
  this.afterChampionHitItemsV453Dev69B3(attacker,target,dealt,sourceType);
  this.afterTankHitV453Dev69B4(attacker,target,dealt,damageType,sourceType);
  this.afterSupportDamageV453Dev69B5(attacker,target,dealt,sourceType);
   this.onOffensiveHitV453Dev69B6(attacker,target,dealt,sourceType);
   this.onRemainderHitV453Dev69B7(attacker,target,dealt,damageType,sourceType);
   if(attacker?.role==='MID'&&target?.champ&&attacker.team!==target.team&&!sourceType.startsWith('item_'))
    this.b7MidQuestAdd(attacker,dealt*(attacker.range>.05?.015:.03),'champion_damage');
  if(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team&&
    ['basic','spell','ability_onhit_v453_dev40'].includes(sourceType)){
   if(attacker.items?.includes('maw_of_malmortius')&&(attacker.mawVampUntilV453Dev69||0)>this.gameTime){
    this.effectResolverV41().heal(attacker,dealt*.10,attacker);
    attacker.mawVampUntilV453Dev69=Math.max(attacker.mawVampUntilV453Dev69,this.gameTime+6);
   }
   const fight=attacker.riftmakerFightV453Dev69;
   if(attacker.items?.includes('riftmaker')&&fight?.lastAt>=this.gameTime&&this.gameTime-fight.started>=4)
    this.effectResolverV41().heal(attacker,dealt*(attacker.range>.05?.06:.10),attacker);
  }
  if(dealt>0&&target?.champ&&attacker?.champ&&attacker.team!==target.team&&damageType==='magic'&&
      target.items?.includes('force_of_nature')){
   const prev=target.forceNatureUntilV453Dev69>this.gameTime?(target.forceNatureStacksV453Dev69||0):0;
   target.forceNatureStacksV453Dev69=Math.min(8,prev+1);
   target.forceNatureUntilV453Dev69=this.gameTime+5;
  }
  // Snapshot the PRIMARY hit outcome before nested soul/rune/elder damage.
  // Nested damage owns its own death credit; the outer action must not double it.
  const lethalPrimaryHitV452d2=target.hp<=0;
  // Collector execution: only primary, non-item champion damage; nested kill is idempotent.
  if(dealt>0&&target?.champ&&target.hp>0&&attacker?.champ&&attacker.team!==target.team&&
      attacker.items?.includes('the_collector')&&!sourceType.startsWith('item_')&&
      target.hp/Math.max(1,target.maxHp)<.05)this.damage(target,target.hp+1,attacker,'true','item_collector_execute');

  // DEV31 Thorns: real post-mitigation attacks only. Item reflection cannot
  // recursively trigger a second Thorns, spellblade or Grievous from this item.
  if(sourceType==='basic'&&dealt>0&&target.champ&&attacker?.champ&&attacker.team!==target.team){
   const thorns=target.items?.includes('thornmail')?'thornmail':target.items?.includes('bramble_vest')?'bramble_vest':null;
   if(thorns){
    const spec=ITEM_EFFECTS_V43[thorns];
    this.applyEffectV41(attacker,'grievous_wounds',{source:target,duration:spec.woundsSeconds,key:'thorns_'+target.id});
    const itemArmor=(target.items||[]).reduce((n,id)=>n+(catalog.find(v=>v.id===id)?.stats?.armor||0),0);
    const reflected=spec.base+Math.round((spec.bonusArmorRatio||0)*Math.max(0,itemArmor));
    this.damage(attacker,reflected,target,'magic','item_thorns');
   }
  }
  if(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team&&
     (sourceType==='basic'||sourceType==='spell')){
   if(attacker.items?.includes('dorans_ring'))attacker.doransCombatManaUntilV453Dev38=this.gameTime+ITEM_EFFECTS_V43.dorans_ring.championDuration;
   const scout=ITEM_EFFECTS_V43.scouts_slingshot;
   if(attacker.items?.includes('scouts_slingshot')&&(attacker.scoutBullseyeReadyAtV453Dev38||0)<=this.gameTime){
    attacker.scoutBullseyeReadyAtV453Dev38=this.gameTime+scout.cooldown;
    if(target.hp>0)this.damage(target,scout.damage,attacker,'magic','item_bullseye_v453_dev38');
   }
  }
  // DEV52 Cinzas do Destino: abilities that actually damage enemy champions
  // start/refresh a 3-second magic burn. Item DOT cannot recursively reproc.
  // Monster bonus remains uncertified until individual camp combat parity.
  if(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team&&
     ['spell','ability_onhit_v453_dev40'].includes(sourceType)&&attacker.items?.includes('fated_ashes')){
   const burn=ITEM_EFFECTS_V43.fated_ashes;
   this.applyEffectV41(target,'dot',{source:attacker,key:'fated_ashes_'+attacker.id,
    duration:burn.duration,power:burn.totalMagicDamage/burn.duration,damageType:'magic',interval:burn.tick});
  }
  if(dealt>0&&attacker?.champ&&attacker.team!==target.team){
   // Auto-attacks use life steal; all damage types can use omnivamp. Auras and AoE
   // require later data-driven modifiers: never credit healing on shield absorption.
   const sustain=sourceType==='basic'?(attacker.lifeSteal||0):0;
   const universal=sourceType==='basic'||sourceType==='spell'?Math.max(0,attacker.omnivamp||0):0;
   const vamp=Math.max(0,sustain+universal+(sourceType==='spell'&&damageType==='magic'?(attacker.spellVamp||0):sourceType==='spell'&&damageType==='physical'?(attacker.physicalVamp||0):0));
   const expected=dealt*vamp/100;
   if(sourceType==='basic'&&attacker.items?.includes('bloodthirster')&&expected>0){
    const overflow=Math.max(0,attacker.hp+expected-attacker.maxHp);
    if(overflow>0)this.effectResolverV41().apply(attacker,'shield',{source:attacker,duration:30,power:Math.min(ITEM_ATTACK_RULES_V453_DEV69_B3.bloodthirster.overhealShieldLimit,overflow),key:'bloodthirster_b3'});
   }
   this.effectResolverV41().heal(attacker,expected,attacker);
  }
  if(dealt>0)this.effectResolverV41().record('damage',target,attacker,{amount:dealt,damageType,sourceType});
  if(dealt>0&&attacker?.champ&&target?.kind&&attacker.team!==target.team&&this.soulTypeV452d2(attacker)==='ocean')
   this.soulHitV452d2(attacker,target,sourceType);
  if(dealt>0&&sourceType==='basic'&&attacker?.champ&&['tower','inhibitor','nexus'].includes(target.type))
   this.applyVoidSiegeV45(attacker,target);
  if(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team){
   // Procs have explicit source tags so they cannot recursively trigger
   // another soul, rune, Elder burn or artificial vision events.
   if(!['item_bullseye_v453_dev38','item_energized_v453_dev38'].includes(sourceType))this.soulHitV452d2(attacker,target,sourceType);
   this.recordTeamfightImpactV44(attacker,target,dealt);
  }
  if(attacker?.champ&&target?.champ&&attacker.team!==target.team){
   const req=this.duelRequests[this.duelKey(attacker,target)];
   if(req&&['surprise','engaged'].includes(req.state)&&req.firstHitAt==null){
    req.concealedOpener=req.state==='surprise';req.firstHitAt=this.gameTime;req.reactionAt=this.gameTime;
    this.event(`${attacker.champ} atingiu ${target.champ}: impacto real, reação posterior.`,attacker.team,req.concealedOpener?'pickoff':'combat',attacker.id);
   }
   // Basic attacks and direct targeted casts from concealed brush expose the
   // aggressor briefly; prevents permanent uncounterable unseen auto-attacks.
   if(!['elder_burn','soul_v452d2'].includes(sourceType)){attacker.revealedUntil??={};attacker.revealedUntil[target.team]=Math.max(attacker.revealedUntil[target.team]||0,this.gameTime+2);}
  }
  if(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team&&
     !['elder_burn','elder_execute','soul_v452d2','item_thorns','item_bullseye_v453_dev38','item_energized_v453_dev38'].includes(sourceType))this.applyElderBurnV452d(target,attacker);
  if(attacker?.champ&&target?.champ&&attacker.team!==target.team&&
     !['elder_burn','elder_execute','soul_v452d2','item_thorns','item_bullseye_v453_dev38','item_energized_v453_dev38'].includes(sourceType)&&
     this.hasElderV452(attacker)&&target.hp>0&&
     target.hp/Math.max(1,target.maxHp)<OBJECTIVE_BUFF_RULES_V452.elderExecuteFraction&&
     !target.elderPendingV452){target.elderPendingV452={sourceId:attacker.id,at:this.gameTime+OBJECTIVE_BUFF_RULES_V452.elderExecuteDelay,
      preciseAtV452d4Dev18:this.gameTime+.5};}
  if(!['elder_burn','soul_v452d2'].includes(sourceType)&&attacker?.role==='SUP'&&attacker.team!==target.team&&(target.champ||target.type==='tower')&&attacker.supportCharges>0&&this.units.some(v=>v.team===attacker.team&&v.id!==attacker.id&&v.hp>0&&dist(v,attacker)<.15)){
    attacker.supportCharges--;const charge=attacker.supportQuest>=400?21:18;this.creditGoldV452d4Dev7(attacker,charge,'support_charge');this.progressSupport(attacker,charge);
   }
  if(lethalPrimaryHitV452d2&&(attacker||target.champ)){if(target.id?.startsWith('m')&&attacker){
    this.awardMinionXP(target);
    // Only a champion delivering the killing blow earns CS/gold; XP is shared.
    this.recordFarmTelemetryV452c(target,attacker,farmHealthBeforeV452c,dealt,farmContextV452c);
    let hero=attacker.champ?attacker:null;
    // V4.5.1: minions/turrets do not transfer a kill to a nearby champion.
    // Only the source of the actual killing hit earns CS and last-hit gold.
    if(hero){hero.cs++;if(hero.role==='MID')this.b7MidQuestAdd(hero,target.lane==='mid'?2:1,'last_hit');const bounty=target.kind==='siege'?50:target.kind==='super'?55:target.kind==='caster'?14:20;const assigned=hero.role==='TOP'?'top':hero.role==='MID'?'mid':['SUP','ADC'].includes(hero.role)?'bot':null;const gained=assigned&&hero.level<3&&target.lane!==assigned?Math.round(bounty*.75):bounty;this.creditGoldV452d4Dev7(hero,gained,'minion');this.recordEconomyV43(hero,'minion',gained,target.kind);
      // DEV69: Reap advances on the authoritative unique minion kill event.
      // A dead minion cannot pay twice, even on replay or reconnect.
      if(hero.items?.includes('cull')){
       const spec=ITEM_EFFECTS_V43.cull,prior=Math.min(spec.maxMinions,Math.max(0,hero.cullMinionsV453Dev69||0));
       if(prior<spec.maxMinions){
        hero.cullMinionsV453Dev69=prior+1;
        const bounty=spec.goldPerMinion+(hero.cullMinionsV453Dev69===spec.maxMinions?spec.questCompletionGold:0);
        this.creditGoldV452d4Dev7(hero,bounty,'cull');this.recordEconomyV43(hero,'cull',bounty,'cull');
       }
      }
      if(hero.cs%5===0)this.event(`${hero.champ}: ${hero.cs} CS.`,hero.team,'farm',hero.id);}
   }else if(target.id?.includes('_')&&target.champ){
    target.deaths=(target.deaths||0)+1;
    // Deferred damage must not spill into a champion's next life after respawn.
    target.deathDanceQueueV453Dev69B4=[];
    // Dying places Annul on cooldown; never grant a fresh shield on respawn.
     const annul=this.itemAnnulSpecV453Dev69Batch2(target);
     if(annul){target.itemAnnulReadyAtV453Dev69Batch2=this.gameTime+annul.cooldown;
      for(const effect of target.statusEffectsV41||[])if(effect.key==='item_annul_v453_dev69b2')effect.until=this.gameTime;}
     target.baronBuffUntilV452=0;target.baronCapturedAtV452d4Dev14=null;target.elderBuffUntilV452=0;target.elderPendingV452=null;target.elderBurnV452d=null;
    // Assist window remains independent from the environmental kill-credit window.
    const credited=this.championKillCreditV453Dev47(target,attacker);
    const assistingChampions=[];
    if(credited){for(const [champId,stamp] of Object.entries(target.damageContributors||{})){
     if(champId===credited.id||this.gameTime-stamp>12||stamp>this.gameTime)continue;
     const helper=this.units.find(v=>v.id===champId&&v.team===credited.team);
     if(helper){helper.assists=(helper.assists||0)+1;assistingChampions.push(helper);}
    }}
    target.damageContributors={};
    this.afterSupportKillV453Dev69B5(target,credited,assistingChampions);
    this.onOffensiveKillV453Dev69B6(target,credited,assistingChampions);
    this.onRemainderKillV453Dev69B7(target,credited,assistingChampions);
    for(const owner of [credited,...assistingChampions])if(owner?.role==='MID')this.b7MidQuestAdd(owner,25,'champion_takedown');
    if(credited){this.onDefensiveTakedownV453Dev69B4(credited);this.creditGoldV452d4Dev7(credited,300,'takedown');this.recordEconomyV43(credited,'takedown',300,target.id);credited.kills++;this.teams[credited.team].kills++;this.awardGloryV453Dev58(credited,'kill');if(credited.items?.includes('the_collector')){
     const bonus=ITEM_FAMILY_RULES_V453_DEV69.the_collector.killGold;
     this.creditGoldV452d4Dev7(credited,bonus,'collector');this.recordEconomyV43(credited,'collector',bonus,'the_collector');
    }}
    for(const helper of assistingChampions){this.onDefensiveTakedownV453Dev69B4(helper);this.awardGloryV453Dev58(helper,'assist');}
     for(const holder of [credited,...assistingChampions])if(holder?.items?.includes('hexoptik_c44'))holder.hexoptikRangeUntilV453Dev69B3=this.gameTime+ITEM_ATTACK_RULES_V453_DEV69_B3.hexoptik_c44.killDuration;
    const gloryItem=target.items?.includes('mejais_soulstealer')?'mejais_soulstealer':target.items?.includes('dark_seal')?'dark_seal':null;
    if(gloryItem)this.setGloryStacksV453Dev58(target,(target.gloryStacksV453Dev58||0)-ITEM_EFFECTS_V43[gloryItem].stacksLostOnDeath);
    target.deadUntil=this.gameTime+Math.min(55,10+target.level*3+Math.max(0,this.gameTime-1500)/110);
    target.plan=null;target.laneFollowPath=[];
    const sourceName=attacker?.champ||attacker?.name||(attacker?.kind?'Minion '+attacker.kind:attacker?.type||'Ambiente');
    const creditText=credited&&credited!==attacker?` (abate creditado a ${credited.champ})`:'';
    this.event(`${sourceName} eliminou ${target.champ}${creditText} (${Math.ceil(target.deadUntil-this.gameTime)}s).`,target.team,'death',target.id);
   }}
  // DEV40: a landed hit still triggers on-hit when protection absorbs all HP
  // damage. Non-on-hit spells/DoT/reflect cannot trigger; explicit opted-in
  // abilities can, but their damage never grants basic-only life steal/charge.
  const landedOnHitV453Dev40=Number.isFinite(amount)&&amount>0&&amount2>0&&['basic','ability_onhit_v453_dev40'].includes(sourceType)&&
     attacker?.champ&&target.team!==attacker.team&&!['tower','inhibitor','nexus'].includes(target.type);
  if(landedOnHitV453Dev40){
   // Reap heals on each genuinely landed basic/on-hit attack, even if a shield
   // absorbed HP damage; this grants no hit on structures, allies or immunities.
   if(attacker.items?.includes('cull')&&(target?.champ||target?.kind||target?.monster))
    this.effectResolverV41().heal(attacker,ITEM_EFFECTS_V43.cull.healOnHit,attacker);
   // Fury stacks only from BASIC attacks, not from opt-in on-hit spells.
   // Double procs cover the registered independent on-hit damage components.
   // This block never recursively invokes the on-hit dispatcher.
   let extraProcV453Dev54=false;
   if(sourceType==='basic'&&attacker.items?.includes('guinsoos_rageblade')){
    const stacks=(attacker.guinsooUntilV453Dev54||0)>this.gameTime?(attacker.guinsooStacksV453Dev54||0):0;
    attacker.guinsooStacksV453Dev54=Math.min(4,stacks+1);
    attacker.guinsooUntilV453Dev54=this.gameTime+4;
    attacker.guinsooHitCountV453Dev54=(attacker.guinsooHitCountV453Dev54||0)+1;
    extraProcV453Dev54=attacker.guinsooStacksV453Dev54===4&&attacker.guinsooHitCountV453Dev54%3===0;
   }
   const countV453Dev54=extraProcV453Dev54?2:1;
   for(let hit=0;hit<countV453Dev54&&target.hp>0;hit++){
    if(attacker.items?.includes('guinsoos_rageblade'))
     this.damage(target,30,attacker,'magic','item_guinsoo_dev54');
    if(attacker.items?.includes('nashors_tooth')&&target.hp>0)
     this.damage(target,15+.15*Math.max(0,attacker.ap||0),attacker,'magic','item_nashors');
    if(attacker.items?.includes('recurve_bow')&&target.hp>0)
     this.damage(target,15,attacker,'physical','item_recurve');
    if(attacker.items?.includes('wits_end')&&target.hp>0)
     this.damage(target,ITEM_EFFECTS_V43.wits_end.magicDamage,attacker,'magic','item_wits_end_dev55');
   }
   if(attacker.items?.includes('kraken_slayer')){
    const old=attacker.krakenHitV453Dev32;
    // Bring It Down charges across different targets; expiration is temporal, not target-bound.
    const stacks=old?.until>=this.gameTime?old.stacks:0;
    if(stacks>=2){
     attacker.krakenHitV453Dev32={targetId:target.id,stacks:0,until:this.gameTime+4};
     if(target.hp>0){const base=150+60*Math.min(17,Math.max(0,(attacker.level||1)-1))/17;
      const missing=1-Math.max(0,target.hp)/Math.max(1,target.maxHp);
      const ranged=attacker.range>.05?.8:1;
      this.damage(target,base*(1+.75*Math.min(1,missing))*ranged,attacker,'physical','item_kraken');}
    }else attacker.krakenHitV453Dev32={targetId:target.id,stacks:stacks+1,until:this.gameTime+4};
   }
   if(sourceType==='basic'&&attacker.items?.includes('navori_flickerblade')&&attacker.skillCds){
    for(const slot of ['Q','W','E']){
     const next=attacker.skillCds[slot]||0;
     if(next>this.gameTime)attacker.skillCds[slot]=this.gameTime+(next-this.gameTime)*.85;
    }
   }
  }
  // DEV56: Alternador bonus is direct magical damage after a valid champion hit.
  // Explicit source allowlist prevents item damage recursively proccing itself.
  if(dealt>0&&target.hp>0&&target.champ&&attacker?.champ&&attacker.team!==target.team&&
     attacker.items?.includes('hextech_alternator')&&
     ['basic','spell','ability_onhit_v453_dev40'].includes(sourceType)&&
     (attacker.hextechAlternatorReadyAtV453Dev56||0)<=this.gameTime){
   attacker.hextechAlternatorReadyAtV453Dev56=this.gameTime+ITEM_EFFECTS_V43.hextech_alternator.cooldown;
   this.damage(target,ITEM_EFFECTS_V43.hextech_alternator.bonusMagic,attacker,'magic','item_hextech_alternator_v453_dev56');
  }
  if(dealt>0&&attacker?.champ&&target?.champ&&attacker.team!==target.team){
   // Apply item passives only on actual unshielded hit; not during DoT or
   // reflected/rune damage to avoid duplicate effects.
   // Prototype rune triggers. Procs are written to the authoritative game
   // state and therefore share the deterministic seed/snapshot/time domain.
   const rune=RUNE_PAGES_V43[attacker.runePageV43||'none']?.keystone;
   if(sourceType==='spell'&&rune==='arcane_comet'&&(attacker.runeProcNextV43||0)<=this.gameTime){
    attacker.runeProcNextV43=this.gameTime+20;
    this.damage(target,30+attacker.level*2+attacker.ap*.12,attacker,'magic','rune');
   }
   if(sourceType==='basic'&&rune==='fleet_footwork'){
    attacker.runeStacksV43=(attacker.runeStacksV43||0)+1;
    if(attacker.runeStacksV43>=5){attacker.runeStacksV43=0;this.effectResolverV41().heal(attacker,25+attacker.level*2,attacker);}
   }
   if(sourceType==='basic'&&rune==='grasp'){
    if(attacker.runeCombatAtV43==null||this.gameTime-(attacker.runeLastHitAtV43??-999)>8)attacker.runeCombatAtV43=this.gameTime;
    const ready=this.gameTime-attacker.runeCombatAtV43>=4&&(attacker.runeGraspLastProcAtV43??-999)+4<=this.gameTime;
    attacker.runeLastHitAtV43=this.gameTime;
    if(ready){attacker.runeGraspLastProcAtV43=this.gameTime;this.damage(target,10+attacker.maxHp*.02,attacker,'magic','rune');this.effectResolverV41().heal(attacker,10+attacker.maxHp*.01,attacker);}
   }
  }
  return final;
 }
 attack(attacker,target,amount,kind='attack'){if(!target||target.hp<=0)return;
  if(attacker?.champ&&this.heraldMercenariesV45.includes(target))return this.attackSummonedHeraldV452d4Dev21(attacker,target,amount,kind);
  const onHitAbility=kind==='skill_on_hit'||kind==='skill_on_hit_magic';
  const basic=kind!=='skill'&&!onHitAbility;
  const fx=this.effectResolverV41();
  const landed=!!(Number.isFinite(amount)&&amount>0&&attacker?.champ&&attacker.team!==target.team&&
    !(basic&&fx.has(attacker,'blind'))&&target.hp>0&&
    !(target.stasisUntil>this.gameTime)&&!fx.has(target,'stasis')&&!fx.has(target,'invulnerable')&&
    !(onHitAbility&&fx.has(target,'spell_shield'))&&
    !(['tower','inhibitor','nexus'].includes(target.type)&&!this.structureVulnerable(target)));
  const chargedB6=basic&&landed&&attacker.items?.some(id=>['rapid_firecannon','statikk_shiv','stormrazor','voltaic_cyclosword'].includes(id))&&(attacker.energizeStacksV453Dev38||0)>=100;
  const energized=basic&&landed&&attacker.items?.includes('rapid_firecannon')&&(attacker.energizeStacksV453Dev38||0)>=100;
  const preHp=target.hp;
  if(basic&&landed&&target.champ&&attacker.items?.includes('sundered_sky')){
   const cds=attacker.sunderedTargetsV453Dev69B3||(attacker.sunderedTargetsV453Dev69B3={});
   if((cds[target.id]||0)<=this.gameTime){amount+=attacker.ad*ITEM_ATTACK_RULES_V453_DEV69_B3.sundered_sky.firstHitBonus;
    cds[target.id]=this.gameTime+ITEM_ATTACK_RULES_V453_DEV69_B3.sundered_sky.perTargetCooldown;
    this.effectResolverV41().heal(attacker,Math.max(0,attacker.maxHp-attacker.hp)*ITEM_ATTACK_RULES_V453_DEV69_B3.sundered_sky.healMissingHpRatio,attacker);
   }
  }
  if(basic&&landed&&target.champ&&attacker.items?.includes('hexoptik_c44')){
   const r=ITEM_ATTACK_RULES_V453_DEV69_B3.hexoptik_c44;
   amount*=1+r.maxBonus*Math.min(1,this.mapDistance(attacker,target)/r.maxRange);
  }
  const dealt=this.damage(target,amount,attacker,(kind==='skill'&&['mage','enchanter','support'].includes(attacker.klass)||kind==='skill_on_hit_magic')?'magic':'physical',onHitAbility?'ability_onhit_v453_dev40':basic?'basic':'spell');
  if(basic&&landed){
   // A shield absorbing the full AA and even a lethal primary AA consume a
   // prepared shot. Immune/blocked attacks do not consume OR generate stacks.
   if(energized){
    attacker.energizeStacksV453Dev38=0;
    if(target.hp>0)this.damage(target,ITEM_EFFECTS_V43.rapid_firecannon.bonusMagicDamage,attacker,'magic','item_energized_v453_dev38');
   }
   this.itemAttackChargeV453Dev38(attacker,target);
   this.afterBasicAttackItemsV453Dev69B3(attacker,target,{landed,preHp});
   this.onOffensiveBasicV453Dev69B6(attacker,target,{energized:chargedB6,preHp});
   this.afterTankBasicV453Dev69B4(attacker,target,landed);
  }
  if(attacker.champ&&target.champ&&attacker.team!==target.team){for(const turret of this.structures){if(turret.type==='tower'&&turret.team===target.team&&turret.alive&&dist(turret,attacker)<.08&&dist(turret,target)<.10){turret.aggro=attacker.id;this.event(`${turret.name}: aggro de dive em ${attacker.champ}.`);}}}}
 // Dev42: immutable launch ray + delayed impact, advanced in the *same* one-
 // second authoritative simulation domain used by replay and live execution.
 // World width/height are respected independently; no targeting future unseen
 // positions and no teleport or instant target-following collision.
 castEzrealMysticShotV453Dev42(u,target){
  if(u?.champ!=='Ezreal'||!target||target.team===u.team||target.hp<=0)
   return {ok:false,reason:'alvo_inválido'};
  const rule=abilityRule(u,'Q');
  if(this.mapDistance(u,target)>rule.range+1e-7)return {ok:false,reason:'fora_de_alcance'};
  if(target.champ&&!this.visible(u.team,target))return {ok:false,reason:'alvo_oculto'};
  const origin={x:u.x,y:u.y};
  const worldX=(target.x-origin.x)*this.worldWidth,worldY=(target.y-origin.y)*this.worldHeight;
  const magnitude=Math.hypot(worldX,worldY);
  if(magnitude<1e-5)return {ok:false,reason:'direção_inválida'};
  const cast=this.performActionV40({actorId:u.id,kind:'skill',slot:'Q',
    targetId:target.champ?target.id:null,point:target.champ?null:{x:target.x,y:target.y},
    source:'champion_onhit_v453_dev42',checkRange:true,rangeOverride:rule.range});
  if(!cast.ok)return cast;
  const rank=Math.max(1,Math.min(5,u.skillRanks?.Q||1));
  const stats=this.elementalStatsV452d3(u),spec=CHAMPION_ONHIT_SKILLS_V453_DEV41.Ezreal;
  const projectile={id:'ezreal_q_'+(++this.championProjectileSeqV453Dev42),kind:'ezreal_q',
   ownerId:u.id,team:u.team,origin,unit:{x:worldX/magnitude,y:worldY/magnitude},
   range:rule.range,width:rule.width,createdAt:this.gameTime,
   dueAt:this.gameTime+Math.max(1,Math.ceil(rule.range/2000)),
   speed:2000,raw:spec.damage[rank-1]+spec.adRatio*(stats.ad||0)+spec.apRatio*(stats.ap||0),
   riftRevision:this.riftV452d4?.revision??0,traveledV453Dev43:0};
  this.championProjectilesV453Dev42.push(projectile);
  this.event('Ezreal lançou Disparo Místico.',u.team,'champion_projectile_launch_v453_dev42',u.id);
  return {...cast,projectileId:projectile.id,pending:true,dueAt:projectile.dueAt};
 }
 // Dev68: Lux Q is a moving, non-homing two-collision projectile. The
 // original V42 kit is a prototype; speed is a training adapter, not Riot parity.
 launchLuxBindingV453Dev68(u,point){
  const rule=kitSpellV42(u?.champ,'Q');
  if(!u||u.champ!=='Lux'||u.hp<=0||!rule||!point||
    !Number.isFinite(point.x)||!Number.isFinite(point.y))return {ok:false,reason:'ponto_inválido'};
  const origin={x:u.x,y:u.y};
  const x=(point.x-origin.x)*this.worldWidth,y=(point.y-origin.y)*this.worldHeight;
  const length=Math.hypot(x,y);
  if(length<1||this.mapDistance(u,point)>rule.range+1e-7)
   return {ok:false,reason:'direção_fora_de_alcance'};
  const rank=Math.max(1,Math.min(5,u.skillRanks?.Q||1));
  const commit=this.performActionV40({actorId:u.id,kind:'skill',slot:'Q',point,
   source:'lux_q_v453_dev68',costOverride:rule.mana[Math.min(rank-1,rule.mana.length-1)],
   cooldownOverride:rule.cooldown[Math.min(rank-1,rule.cooldown.length-1)]});
  if(!commit.ok)return commit;
  const speed=1200; // authored simulation approximation, NOT patch-certified missile speed
  const projectile={id:'lux_q_'+(++this.championProjectileSeqV453Dev42),kind:'lux_q',
   ownerId:u.id,team:u.team,origin,unit:{x:x/length,y:y/length},
   range:rule.range,width:rule.width,speed,maxHits:rule.maxHits,hitIds:[],
   createdAt:this.gameTime,dueAt:this.gameTime+rule.range/speed,
   raw:rule.damage[Math.min(rank-1,rule.damage.length-1)]+this.elementalStatsV452d3(u).ap*rule.apRatio,
   rootSeconds:rule.ccSeconds,traveledV453Dev43:0,riftRevision:this.riftV452d4?.revision??0};
  this.championProjectilesV453Dev42.push(projectile);
  this.event('Lux lançou Ligação da Luz.',u.team,'champion_projectile_launch_v453_dev68',u.id);
  return {...commit,pending:true,projectileId:projectile.id,dueAt:projectile.dueAt};
 }
 // Dev69: Nami and Vex R have individual travelling missiles (no instant damage).
 launchWaveShadowV453Dev69(u,slot,point){
  if(!u||!['Nami','Vex'].includes(u.champ)||slot!=='R'||u.hp<=0||
     !point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||
     point.x<0||point.x>1||point.y<0||point.y>1)
   return {ok:false,reason:'ponto_inválido'};
  const rule=kitSpellV42(u.champ,'R'),origin={x:u.x,y:u.y};
  const dx=(point.x-origin.x)*this.worldWidth,dy=(point.y-origin.y)*this.worldHeight;
  const magnitude=Math.hypot(dx,dy);
  if(magnitude<1)return {ok:false,reason:'direção_inválida'};
  const rank=Math.max(1,Math.min(3,u.skillRanks?.R||1));
  const range=rule.rangeByRank?.[rank-1]||rule.range;
  const commit=this.performActionV40({actorId:u.id,kind:'skill',slot:'R',
   point,source:u.champ.toLowerCase()+'_r_v453_dev69',
   costOverride:rule.mana[Math.min(rank-1,rule.mana.length-1)],
   cooldownOverride:this.abilityCooldownV452d3(u,'R'),checkRange:false});
  if(!commit.ok)return commit;
  const speed=u.champ==='Nami'?850:1600;
  const p={id:u.champ.toLowerCase()+'_r_'+(++this.championProjectileSeqV453Dev42),
   kind:u.champ.toLowerCase()+'_r',ownerId:u.id,team:u.team,origin,
   unit:{x:dx/magnitude,y:dy/magnitude},range,width:rule.width,speed,
   raw:rule.damage[rank-1]+this.elementalStatsV452d3(u).ap*rule.apRatio,
   hitIds:[],createdAt:this.gameTime,dueAt:this.gameTime+range/speed,
   traveledV453Dev43:0,riftRevision:this.riftV452d4?.revision??0};
  this.championProjectilesV453Dev42.push(p);
  this.event(u.champ+' lançou sua ultimate direcional.',u.team,'champion_projectile_launch_v453_dev69',u.id,{
   observedBy:['blue','red'].filter(team=>team===u.team||this.canSeePoint(team,u))});
  return {...commit,projectileId:p.id,pending:true,dueAt:p.dueAt};
 }
 // Swept cast direction is fixed, but potential interceptors are looked up at
 // the tick of impact: a minion that walks into the ray can stop the shot.
 // DEV43: incremental swept intervals, not a full-range ray evaluated after 1s.
 // Legacy snapshots without progress begin at zero; the state is JSON-serializable.
 advanceChampionProjectilesV453Dev42(){
  const still=[];
  const now=this.gameTime;
  for(const p of (this.championProjectilesV453Dev42||[])){
   if(now<=p.createdAt){still.push(p);continue;}
   const owner=this.units.find(u=>u.id===p.ownerId);
   if(!owner)continue;
   const from=Math.min(p.range,Math.max(0,p.traveledV453Dev43||0));
   const to=Math.min(p.range,Math.max(from,(now-p.createdAt)*p.speed));
   if(to<=from+1e-7){still.push(p);continue;}
   const origin=p.origin;
   const position=d=>({x:origin.x+p.unit.x*d/this.worldWidth,y:origin.y+p.unit.y*d/this.worldHeight});
   const end=position(to);
   // Valid moving interceptors, ordered by nearest world-depth, independent of list order.
   const line=[...this.units,...this.minions].filter(v=>v.team!==p.team&&v.hp>0&&
      (v.spawnAt==null||v.spawnAt<=now)).map(v=>{
    const x=(v.x-origin.x)*this.worldWidth,y=(v.y-origin.y)*this.worldHeight;
    return {v,depth:x*p.unit.x+y*p.unit.y,side:Math.abs(x*p.unit.y-y*p.unit.x)};
   }).filter(x=>x.depth>=from-1e-7&&x.depth<=to+1e-7&&x.side<=p.width/2)
    .sort((a,b)=>a.depth-b.depth||String(a.v.id).localeCompare(String(b.v.id)));
   let terrainDepth=Infinity;
   for(let d=from+Math.min(10,(to-from));d<=to+1e-7;d+=10){
    if(!this.walkable(position(Math.min(d,to)).x,position(Math.min(d,to)).y)){
     terrainDepth=Math.min(d,to);break;
    }
   }
   if(!Number.isFinite(terrainDepth)&&!this.walkable(end.x,end.y))terrainDepth=to;
   // Positional barriers are explicit geometry in world-space; no global
   // projectile immunity. Barrier owners/allies never intercept friendly fire.
   let barrierDepth=Infinity;
   for(const b of (this.projectileBarriersV453Dev43||[])){
    if(!b||b.team===p.team||!(b.until>now)||!Number.isFinite(b.x)||!Number.isFinite(b.y))continue;
    const x=(b.x-origin.x)*this.worldWidth,y=(b.y-origin.y)*this.worldHeight;
    const depth=x*p.unit.x+y*p.unit.y,side=Math.abs(x*p.unit.y-y*p.unit.x),radius=Math.max(0,Number(b.radius)||0);
    if(side<=radius&&depth+radius>=from&&depth-radius<=to){
     const crossing=Math.max(from,depth-Math.sqrt(Math.max(0,radius*radius-side*side)));
     barrierDepth=Math.min(barrierDepth,crossing);
    }
   }
   if(p.kind==='nami_r'||p.kind==='vex_r'){
    // These ultimates cross map terrain but obey enemy projectile barriers.
    // Sweep only the untraversed segment, one hit per physical unit ID.
    const cutoff=barrierDepth;
    let reason=null,lastDepth=to;
    for(const {v,depth} of line){
     if(depth>=cutoff-1e-7)break;
     if(p.hitIds.includes(v.id))continue;
     if((v.projectileGuardUntil||0)>now){reason='bloqueio_projétil';lastDepth=depth;break;}
     const shielded=this.effectResolverV41().has(v,'spell_shield');
     this.damage(v,p.raw,owner,'magic','spell');
     p.hitIds.push(v.id);lastDepth=depth;
     if(p.kind==='nami_r'&&v.champ&&!shielded&&v.hp>0){
      this.applyEffectV41(v,'knockup',{source:owner,duration:.5,key:'nami_r_'+p.id});
      this.applyEffectV41(v,'slow',{source:owner,
       duration:2+2*Math.min(1,Math.max(0,depth)/p.range),
       power:.70,key:'nami_r_slow_'+p.id});
     }
     if(p.kind==='vex_r'&&v.champ){
      // The first enemy champion absorbs the missile even if shielded.
      if(!shielded&&v.hp>0){
       owner.vexMark={targetId:v.id,until:now+4};
       v.revealedUntil??={};v.revealedUntil[p.team]=Math.max(v.revealedUntil[p.team]||0,now+4);
      }
      reason=shielded?'escudo_de_feitiço':'impacto_marca';break;
     }
    }
    if(!reason&&Number.isFinite(cutoff)){reason='bloqueio_posicional';lastDepth=cutoff;}
    p.traveledV453Dev43=to;
    if(!reason&&to<p.range-1e-7){still.push(p);continue;}
    reason??='fim_alcance';
    (this.championProjectileHistoryV453Dev42??=[]).push({id:p.id,time:now,ownerId:p.ownerId,
     hitIds:[...p.hitIds],hitId:owner.vexMark?.targetId||null,reason,
     origin,end:position(lastDepth),traveled:lastDepth,riftRevision:p.riftRevision});
    if(this.championProjectileHistoryV453Dev42.length>100)this.championProjectileHistoryV453Dev42.shift();
    this.event((p.kind==='nami_r'?'Onda Violenta: ':'Rajada Sombria: ')+reason,
     p.team,'champion_projectile_impact_v453_dev69',p.ownerId,{
      observedBy:['blue','red'].filter(team=>team===p.team||this.canSeePoint(team,position(lastDepth)))});
    continue;
   }
   if(p.kind==='lux_q'){
    // Incremental sweep: each already-hit entity consumes exactly one slot.
    // Obstacles/terrain terminate the flight; spell shields consume a collision
    // but prevent both the damage and the root (no double-consumption).
    const cutoff=Math.min(terrainDepth,barrierDepth);
    const candidates=line.filter(x=>!(p.hitIds||[]).includes(x.v.id)&&x.depth<cutoff-1e-7);
    let reason=null,lastHit=null,lastDepth=to;
    for(const {v,depth} of candidates){
     lastDepth=depth;
     if((v.projectileGuardUntil||0)>now){reason='bloqueio_projétil';break;}
     const shielded=this.effectResolverV41().has(v,'spell_shield');
     this.damage(v,p.raw,owner,'magic','spell');
     if(v.champ&&!shielded&&v.hp>0)this.applyEffectV41(v,'root',{
      source:owner,duration:p.rootSeconds,key:'lux_q_'+p.id});
     p.hitIds??=[];p.hitIds.push(v.id);lastHit=v.id;
     if(p.hitIds.length>=p.maxHits){reason='impacto_duplo';break;}
    }
    if(!reason&&Number.isFinite(cutoff)){
     reason=terrainDepth<barrierDepth?'parede':'bloqueio_posicional';lastDepth=cutoff;
    }
    p.traveledV453Dev43=to;
    if(!reason&&to<p.range-1e-7){still.push(p);continue;}
    reason??='fim_alcance';
    (this.championProjectileHistoryV453Dev42??=[]).push({id:p.id,time:now,
     ownerId:p.ownerId,hitId:lastHit,hitIds:[...(p.hitIds||[])],reason,
     origin,end:position(lastDepth),traveled:lastDepth,riftRevision:p.riftRevision});
    if(this.championProjectileHistoryV453Dev42.length>100)this.championProjectileHistoryV453Dev42.shift();
    this.event('Ligação da Luz: '+reason,p.team,'champion_projectile_impact_v453_dev68',p.ownerId);
    continue;
   }
   const nearest=line[0];
   const hitBarrier=Number.isFinite(barrierDepth)&&barrierDepth<=terrainDepth&&(!nearest||barrierDepth<=nearest.depth);
   const hitWall=Number.isFinite(terrainDepth)&&terrainDepth<barrierDepth&&(!nearest||terrainDepth<=nearest.depth);
   const victim=!hitBarrier&&!hitWall?nearest?.v:null;
   let reason=null,hitId=null,travelDepth=to;
   if(hitBarrier){reason='bloqueio_posicional';travelDepth=barrierDepth;}
   else if(hitWall){reason='parede';travelDepth=terrainDepth;}
   else if(victim){travelDepth=nearest.depth;
    if(victim.projectileGuardUntil>now)reason='bloqueio_projétil';
    else{
     reason='impacto';hitId=victim.id;
     this.attack(owner,victim,p.raw,'skill_on_hit');
     for(const slot of ['Q','W','E','R'])if((owner.skillCds?.[slot]||0)>now)
      owner.skillCds[slot]=Math.max(now,owner.skillCds[slot]-1.5);
    }
   }
   p.traveledV453Dev43=to;
   if(!reason&&to<p.range-1e-7){still.push(p);continue;}
   reason??='sem_alvo';
   const history={id:p.id,time:now,ownerId:p.ownerId,hitId,reason,
    origin,end:position(travelDepth),traveled:travelDepth,riftRevision:p.riftRevision};
   (this.championProjectileHistoryV453Dev42??=[]).push(history);
   if(this.championProjectileHistoryV453Dev42.length>100)this.championProjectileHistoryV453Dev42.shift();
   this.event('Disparo Místico: '+reason+(hitId?' ('+hitId+')':''),p.team,
    'champion_projectile_impact_v453_dev42',p.ownerId);
  }
  this.championProjectilesV453Dev42=still;
  this.projectileBarriersV453Dev43=(this.projectileBarriersV453Dev43||[]).filter(b=>b.until>now);
 }
 // Irelia E: first and second blades are real board points. The collision
 // line exists only on convergence, and cannot mark on the initial placement.
 castIreliaFlawlessDuetV453Dev43(u,point){
  if(u?.champ!=='Irelia'||u.hp<=0)return {ok:false,reason:'campeão_inválido'};
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||
     !this.walkable(point.x,point.y)||this.mapDistance(u,point)>775)
   return {ok:false,reason:'ponto_inválido'};
  if(!(u.skillRanks?.E>0))return {ok:false,reason:'não_aprendido'};
  const previous=this.ireliaBladesV453Dev43?.[u.id];
  if(previous&&!previous.second&&this.gameTime<previous.expiresAt){
   if(this.gameTime<previous.createdAt+.15)return {ok:false,reason:'recast_aguarde'};
   previous.second={x:point.x,y:point.y};previous.dueAt=this.gameTime+.25;
   this.actionJournalV40.push({seq:++this.actionSequenceV40,round:this.round,time:this.gameTime,
    actorId:u.id,team:u.team,kind:'recast',slot:'E',point:{...previous.second},
    source:'irelia_e_v453_dev43',cost:0,cooldownEndsAt:u.skillCds.E,
    observedBy:['blue','red'].filter(team=>team===u.team||this.canSeePoint(team,u))});
   this.event('Irelia posicionou a segunda lâmina.',u.team,'irelia_e_second_v453_dev43',u.id);
   return {ok:true,recast:true,pending:true,dueAt:previous.dueAt};
  }
  if(previous)return {ok:false,reason:'convergência_pendente'};
  const cast=this.performActionV40({actorId:u.id,kind:'skill',slot:'E',point,
   source:'irelia_e_v453_dev43',checkRange:true,rangeOverride:775});
  if(!cast.ok)return cast;
  this.ireliaBladesV453Dev43??={};
  this.ireliaBladesV453Dev43[u.id]={ownerId:u.id,team:u.team,first:{x:point.x,y:point.y},
   second:null,createdAt:this.gameTime,expiresAt:this.gameTime+3.5,dueAt:null,
   raw:[70,110,150,190,230][Math.min(4,(u.skillRanks.E||1)-1)]+Math.max(0,this.elementalStatsV452d3(u).ap||0)};
  this.event('Irelia posicionou a primeira lâmina.',u.team,'irelia_e_first_v453_dev43',u.id);
  return {...cast,pending:true,firstBlade:true};
 }
 advanceIreliaBladesV453Dev43(){
  const state=this.ireliaBladesV453Dev43||{};
  for(const ownerId of Object.keys(state).sort()){
   const b=state[ownerId],owner=this.units.find(u=>u.id===ownerId);
   if(!owner){delete state[ownerId];continue;}
   if(!b.second){
    if(this.gameTime<b.expiresAt)continue;
    // Auto-recast is permitted at expiry. It is distinct from a paid cast.
    b.second={x:owner.x,y:owner.y};b.dueAt=this.gameTime+.25;
    this.event('Irelia: segunda lâmina automática.',owner.team,'irelia_e_auto_v453_dev43',ownerId);
   }
   if(this.gameTime<b.dueAt)continue;
   const first=b.first,second=b.second;
   const distance=this.mapDistance(first,second);
   const victims=[...this.units,...this.minions].filter(v=>v.team!==owner.team&&v.hp>0&&
    (v.spawnAt==null||v.spawnAt<=this.gameTime)).map(v=>{
     const ax=(second.x-first.x)*this.worldWidth,ay=(second.y-first.y)*this.worldHeight;
     const vx=(v.x-first.x)*this.worldWidth,vy=(v.y-first.y)*this.worldHeight;
     const mag=ax*ax+ay*ay;
     const ratio=mag>1e-7?Math.max(0,Math.min(1,(vx*ax+vy*ay)/mag)):0;
     const separation=Math.hypot(vx-ratio*ax,vy-ratio*ay);
     return {v,separation,ratio};
    }).filter(({separation})=>separation<=70).sort((a,b)=>a.ratio-b.ratio||String(a.v.id).localeCompare(String(b.v.id)));
   const hitIds=[];
   for(const {v} of victims){
    if((v.projectileGuardUntil||0)>this.gameTime)continue;
    const shield=this.effectResolverV41().has(v,'spell_shield');
    if(shield){this.applyEffectV41(v,'stun',{source:owner,duration:.75,key:'irelia_e_'+ownerId});continue;}
    if(v.stasisUntil>this.gameTime||this.effectResolverV41().has(v,'invulnerable'))continue;
    this.damage(v,b.raw,owner,'magic','spell');
    if(v.hp>0){this.applyEffectV41(v,'stun',{source:owner,duration:.75,key:'irelia_e_'+ownerId});
     if(v.champ)this.markIreliaTargetV453Dev42(owner,v,'E');}
    hitIds.push(v.id);
   }
   (this.ireliaBladeHistoryV453Dev43??=[]).push({ownerId,time:this.gameTime,
    first,second,hitIds,distance});
   if(this.ireliaBladeHistoryV453Dev43.length>100)this.ireliaBladeHistoryV453Dev43.shift();
   delete state[ownerId];
   this.event('Irelia E: convergência de lâminas.',owner.team,'irelia_e_hit_v453_dev43',ownerId);
  }
 }
 // Mark contract for Irelia E/R authored hits, not a free mark on Q. This is
 // intentionally opt-in until E/R are individually integrated in a later lot.
 markIreliaTargetV453Dev42(u,target,source='E'){
  if(u?.champ!=='Irelia'||!['E','R'].includes(source)||!target?.champ||
     target.hp<=0||target.team===u.team)return {ok:false,reason:'marca_inválida'};
  target.ireliaMarkV453Dev42={ownerId:u.id,source,until:this.gameTime+5};
  return {ok:true,until:target.ireliaMarkV453Dev42.until};
 }
 // V4.5.3-dev41: opt-in Q resolution with real board line/collider checks.
 // Consumes resources through the existing action journal; all damage goes through
 // attack() and damage() so shields, penetration, procs and kills are authoritative.
 // These are intentionally partial implementations of only Ezreal Q / Irelia Q.
 castChampionOnHitV453Dev41(u,slot,target){
  const spec=CHAMPION_ONHIT_SKILLS_V453_DEV41[u?.champ];
  if(!spec||spec.slot!==slot)return {ok:false,reason:'habilidade_não_mapeada'};
  if(!target||target.hp<=0||target.team===u.team)return {ok:false,reason:'alvo_inválido'};
  const rule=abilityRule(u,slot),meters=this.mapDistance(u,target);
  if(meters>rule.range+1e-7)return {ok:false,reason:'fora_de_alcance'};
  if(target.champ&&!this.visible(u.team,target))return {ok:false,reason:'alvo_oculto'};
  const origin={x:u.x,y:u.y};
  // Advanced projectile is the gameplay default; legacy dev41 test fixtures
  // explicitly opt into their synchronous collision contract.
  if(spec.kind==='line_onhit'&&!this.dev41CompatibilityInstantQ)
   return this.castEzrealMysticShotV453Dev42(u,target);
  // Movement is a physical dash, never a teleport; forbid through-walls and
  // validate a nearby landing cell BEFORE spending cooldown/mana.
  let landing=null;
  if(spec.kind==='target_dash_onhit'){
   const fx=this.effectResolverV41();
   if((u.rootUntil||0)>this.gameTime||(u.groundedUntil||0)>this.gameTime||
      (u.stunUntil||0)>this.gameTime||fx.has(u,'grounded')||fx.has(u,'root')||
      fx.has(u,'knockup')||fx.has(u,'suppression')||fx.has(u,'stun'))
    return {ok:false,reason:'deslocamento_interrompido'};
   if(this.obstacleLine(origin,target))return {ok:false,reason:'parede'};
   const ratio=Math.min(.98,75/Math.max(1,meters));
   landing={x:target.x-(target.x-origin.x)*ratio,y:target.y-(target.y-origin.y)*ratio};
   if(!this.walkable(landing.x,landing.y)||this.obstacleLine(origin,landing))return {ok:false,reason:'destino_bloqueado'};
  }
  const cast=this.performActionV40({actorId:u.id,kind:'skill',slot,targetId:target.champ?target.id:null,
   point:target.champ?null:{x:target.x,y:target.y},source:'champion_onhit_v453_dev41',
   checkRange:true,rangeOverride:rule.range});
  if(!cast.ok)return cast;
  const rank=Math.max(1,Math.min(5,u.skillRanks[slot]||1));
  const stats=this.elementalStatsV452d3(u);
  const raw=spec.damage[rank-1]+spec.adRatio*(stats.ad||0)+(spec.apRatio||0)*(stats.ap||0);
  let hit=null,blocked=null;
  if(spec.kind==='line_onhit'){
   const pool=[...this.units,...this.minions].filter(v=>v.team!==u.team&&v.hp>0&&
    (!v.kind||v.spawnAt==null||v.spawnAt<=this.gameTime));
   const hits=skillshotHitsV42(origin,target,pool,{range:rule.range,width:rule.width,maxHits:1,
    worldWidth:this.worldWidth,worldHeight:this.worldHeight});
   const victim=hits[0]||null;
   if(victim){
    if(this.obstacleLine(origin,victim))blocked='parede';
    else if(victim.projectileGuardUntil>this.gameTime)blocked='bloqueio_projétil';
    else {hit=victim;this.attack(u,victim,raw,'skill_on_hit');
     // Ezreal Q refunds cooldown on an actual projectile collision, including
     // an intercepted spell shield; never on a wall, guard, or empty line.
     for(const key of ['Q','W','E','R'])if((u.skillCds?.[key]||0)>this.gameTime)
      u.skillCds[key]=Math.max(this.gameTime,u.skillCds[key]-spec.cooldownRefund);
    }
   }
  }else{
   u.x=landing.x;u.y=landing.y;this.invalidateShopUndoOnDepartureV453Dev61(u);
   this.itemEnergizeRelocateV453Dev39(u,origin,landing,{kind:'dash'});
   u.holdUntil=Math.max(u.holdUntil||0,this.gameTime+1);
   // Unlike Mystic Shot, Bladesurge is a physical dash: projectile guards
   // are not a universal immunity to contact damage.
   const shielded=this.effectResolverV41().has(target,'spell_shield');
   const immune=target.stasisUntil>this.gameTime||this.effectResolverV41().has(target,'stasis')||
    this.effectResolverV41().has(target,'invulnerable');
   this.attack(u,target,raw,'skill_on_hit');
   if(!shielded&&!immune){hit=target;
    this.effectResolverV41().heal(u,(stats.ad||0)*spec.healAdRatio[rank-1],u);
    const mark=target.ireliaMarkV453Dev42;
    if(mark?.ownerId===u.id&&mark.until>this.gameTime){
     target.ireliaMarkV453Dev42=null;
     if(target.hp>0)u.skillCds.Q=Math.min(u.skillCds.Q||Infinity,this.gameTime+.2);
    }
    if(target.hp<=0)u.skillCds.Q=this.gameTime;
   }else blocked=shielded?'escudo_feitiço':'imune';
  }
  this.event(`${u.champ} Q: ${hit?'atingiu '+(hit.champ||hit.kind||hit.id):'não atingiu'}${blocked?' ('+blocked+')':''}.`,
   u.team,'champion_onhit_v453_dev41',u.id);
  return {...cast,hitId:hit?.id||null,blocked,dash:!!landing};
 }
 // Queue-based spell execution. One ability per simulated second, independent
 // of AA recovery. Unavailable spells WAIT (never silently restart or skip).
 // Range, vision, mana, ranks, and ownership remain authoritative (no consent).
 resolveQueuedCombos(){
  for(const u of this.units){
   const o=u.reactionCombo||u.order||{},sequence=o.combo;
   if((u.stasisUntil||0)>this.gameTime)continue;
   if(u.hp<=0||o.kind!=='attack'||!Array.isArray(sequence)||!sequence.length)continue;
   if((o.comboIndex||0)>=sequence.length){if(o===u.reactionCombo)u.reactionCombo=null;continue;}
   if((o.comboNextAt??0)>this.gameTime)continue;
   if(o.pendingNamiW){
    if(u.pendingTargetedCast){o.comboStatus='Nami W aproximando / conjurando';continue;}
    if((u.lastTargetedCastAt??-1)>=o.pendingNamiW.startedAt){
     o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;
     o.pendingNamiW=null;o.comboStatus='próximo: '+(sequence[o.comboIndex]||'fim');continue;
    }
    o.pendingNamiW=null;o.comboStatus='Nami W interrompido';
   }
   const target=this.units.find(v=>v.id===o.targetId&&v.team!==u.team&&v.hp>0);
   const slot=sequence[o.comboIndex||0];
   const defensiveSkill=(u.champ==='Yasuo'&&slot==='W')||(u.champ==='Braum'&&slot==='E')||(u.champ==='Mel'&&slot==='W');
   const defensive=['BARRIER','HEAL','GHOST','CLEANSE'].includes(slot)||defensiveSkill;
   // Self-defensive summoners do not require a visible/live enemy. They must
   // execute even after retreating into the fog or the attacker dying.
   if(!defensive&&(!target||!this.visible(u.team,target))){o.comboStatus='aguardando alvo visível';continue;}
   if(!defensive&&!this.duelPermission(u,target,false)){o.comboStatus='alvo não autorizado pela visão';continue;}
   const summonerRange=['IGNITE','EXHAUST'].includes(slot)?650:0;
   const slotRange=summonerRange||(u.champ==='Lux'&&slot==='Q'?kitSpellV42('Lux','Q').range:(['Q','W','E','R'].includes(slot)?abilityRule(u,slot).range:(u.range||.035)*this.worldWidth));
   const vexR2=u.champ==='Vex'&&slot==='R'&&u.vexMark?.until>this.gameTime&&u.vexMark?.targetId===target?.id;
   if(!defensive&&slot!=='FLASH'&&!vexR2&&this.mapDistance(u,target)>slotRange){o.comboStatus='fora de alcance: '+Math.round(slotRange)+' unidades';continue;}
   if(['IGNITE','EXHAUST','HEAL','BARRIER','GHOST','CLEANSE'].includes(slot)&&!this.hasSummonerV452d4Dev11(u,slot.toLowerCase())){
    o.comboStatus=slot+' não equipado';o.comboIndex++;continue;
   }
   if(['FLASH','IGNITE','EXHAUST','HEAL','BARRIER','GHOST','CLEANSE'].includes(slot)){
    // Summoner commit is a single atomic operation, shared with planning casts.
    // Flash gets the destination from the existing short reposition calculation below.
    if(slot!=='FLASH'){
     const kind=slot.toLowerCase();
     const cast=this.performActionV40({actorId:u.id,kind:'summoner',type:kind,
       targetId:['IGNITE','EXHAUST'].includes(slot)?target?.id:null,source:'combo'});
     if(!cast.ok){o.comboStatus=cast.reason;continue;}
    }
    if(slot==='FLASH'){
     if(u.flashCd>this.gameTime){o.comboStatus='Flash em recarga';continue;}
     const dx=target.x-u.x,dy=target.y-u.y,meters=this.mapDistance(u,target);
     if(meters<150){o.comboStatus='alvo próximo demais para avançar com Flash';continue;}
     let spot=null;for(const step of [.72,.56,.40,.24]){const rate=Math.min(425,Math.max(0,meters-120))*step/Math.max(1,meters);const p={x:u.x+dx*rate,y:u.y+dy*rate};if(this.walkable(p.x,p.y)){spot=p;break;}}
     if(!spot){o.comboStatus='Flash sem destino livre';continue;}
     const cast=this.performActionV40({actorId:u.id,kind:'flash',point:spot,source:'combo'});
     if(!cast.ok){o.comboStatus=cast.reason;continue;}
     u.x=spot.x;u.y=spot.y;this.invalidateShopUndoOnDepartureV453Dev61(u);
    }else if(slot==='IGNITE'){
     this.damage(target,20+u.level*3,u,'true','spell');
     this.delayedEffects.push({id:'fx'+this.nextId++,kind:'ignite_dot',owner:u.id,team:u.team,targetId:target.id,power:13+u.level*3,ticksLeft:4,createdAt:this.gameTime,dueRound:this.round,dueAt:this.gameTime+1});
     this.applyEffectV41(target,'grievous_wounds',{source:u,duration:5,key:'ignite'});
     
    }else if(slot==='EXHAUST'){
     target.exhaustUntil=this.gameTime+3;
    }else if(slot==='CLEANSE'){
     this.applyCleanseV453Dev66(u);
    }else if(slot==='GHOST'){
     u.ghostUntil=this.gameTime+15;
    }else if(slot==='HEAL'){
     this.applySummonerHealV453Dev67(u);
    }else if(slot==='BARRIER'){
     const shield=100+Math.round((u.level-1)*402.35/17);u.shield+=shield;u.barrierAmount=(u.barrierAmount||0)+shield;
     u.barrierUntil=this.gameTime+3;
    }
    o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;o.comboStatus='próximo: '+(sequence[o.comboIndex]||'fim');
    this.event(`${u.champ} usou ${slot} no combo.`,u.team,'combo',u.id);continue;
   }
   if((u.skillRanks?.[slot]||0)<1){o.comboStatus=slot+' ainda não aprendida';continue;}
   const recastE=u.champ==='Irelia'&&slot==='E'&&!!this.ireliaBladesV453Dev43?.[u.id]&&!this.ireliaBladesV453Dev43[u.id].second;
   if(u.champ==='Lux'&&slot==='Q'){
    const result=this.launchLuxBindingV453Dev68(u,{x:target.x,y:target.y});
    if(!result.ok){o.comboStatus=result.reason;continue;}
    o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;
    o.comboStatus=o.comboIndex>=sequence.length?'concluído':'próximo: '+sequence[o.comboIndex];
    continue;
   }
   // R2 in a combo is a movement recast, not a second paid ultimate.
   if(vexR2){
    const dash=this.startVexShadowDashV453Dev69(u);
    if(!dash.ok){o.comboStatus=dash.reason;continue;}
    o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;
    o.comboStatus=o.comboIndex>=sequence.length?'concluído':'próximo: '+sequence[o.comboIndex];
    continue;
   }
   if(slot==='R'&&['Nami','Vex'].includes(u.champ)){
    const launched=this.launchWaveShadowV453Dev69(u,slot,{x:target.x,y:target.y});
    if(!launched.ok){o.comboStatus=launched.reason;continue;}
    o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;
    o.comboStatus=o.comboIndex>=sequence.length?'concluído':'próximo: '+sequence[o.comboIndex];
    continue;
   }
   const castMana=recastE?0:abilityCost(u,slot),castCooldown=this.abilityCooldownV452d3(u,slot);
   if(!recastE&&(u.skillCds?.[slot]||0)>this.gameTime){o.comboStatus=slot+' em recarga';continue;}
   if(u.mana<castMana){o.comboStatus='mana insuficiente para '+slot;continue;}
   if(u.tactics?.conserveMana&&u.mana-castMana<u.maxMana*.35){o.comboStatus='reserva de mana';continue;}
   // Nami W in combos must use the exact same authoritative cast resolver.
   if(u.champ==='Nami'&&slot==='W'){
    if(u.pendingTargetedCast){o.comboStatus='Nami W em execução';continue;}
    u.pendingTargetedCast={slot:'W',targetId:target.id,createdAt:this.gameTime,lastSeen:{x:target.x,y:target.y}};
    o.pendingNamiW={startedAt:this.gameTime};
    o.comboStatus='Nami W direcionado; aproxima e aguarda conjuração';
    continue;
   }
   if(u.champ==='Irelia'&&slot==='E'){
    const first=!!this.ireliaBladesV453Dev43?.[u.id];
    const point=first?{x:target.x+Math.min(.02,250/this.worldWidth),y:target.y}: 
      {x:target.x-Math.min(.02,250/this.worldWidth),y:target.y};
    const cast=this.castIreliaFlawlessDuetV453Dev43(u,point);
    if(!cast.ok){o.comboStatus=cast.reason;continue;}
    o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;
    o.comboStatus=o.comboIndex>=sequence.length?'concluído':'próximo: '+sequence[o.comboIndex];
    continue;
   }
   // Champion-authored on-hit abilities use dedicated projectile/dash geometry,
   // never the generic training spell or an automatic basic-attack proc.
   if(CHAMPION_ONHIT_SKILLS_V453_DEV41[u.champ]?.slot===slot){
    const resolved=this.castChampionOnHitV453Dev41(u,slot,target);
    if(!resolved.ok){o.comboStatus=resolved.reason;continue;}
    o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;
    o.comboStatus=o.comboIndex>=sequence.length?'concluído':'próximo: '+sequence[o.comboIndex];
    continue;
   }
   const rank=u.skillRanks[slot];
   // Training abstraction; damage is not the official individual champion kit.
   let raw=slot==='Q'?u.skillPower*.62+this.elementalStatsV452d3(u).ap*.22:slot==='W'?u.skillPower*.30+this.elementalStatsV452d3(u).ap*.15:slot==='E'?u.skillPower*.49+this.elementalStatsV452d3(u).ap*.20:u.skillPower*1.12+this.elementalStatsV452d3(u).ap*.40;
   raw*= (.43+.57*Math.min(1,(u.level-1)/17))*(.78+.12*rank);
   const authorized=castGateV39(u,slot,this.gameTime,defensive?null:target,{worldDistance:(a,b)=>this.mapDistance(a,b),requireVision:!defensive,visible:v=>this.visible(u.team,v)});
   if(!authorized.ok){o.comboStatus=authorized.reason;continue;}
   if(!this.performActionV40({actorId:u.id,kind:'skill',slot,targetId:defensive?null:target?.id,source:'combo'}).ok){o.comboStatus='cast invalidado';continue;}
   if(slot==='W')u.shield=Math.max(u.shield,42+u.level*5);
   if(slot==='W'&&u.champ==='Yasuo')u.projectileGuardUntil=this.gameTime+4;
   if(slot==='E'&&u.champ==='Braum')u.projectileGuardUntil=this.gameTime+4;
   if(slot==='W'&&u.champ==='Mel')u.projectileGuardUntil=this.gameTime+3;
   const special=slot==='R'?CHAMPION_SPELL_RULES_V382[u.champ]?.R:null;
   if(special?.kind==='line'){
    const dx=target.x-u.x,dy=target.y-u.y,magnitude=Math.hypot(dx,dy)||1;
    const unitX=dx/magnitude,unitY=dy/magnitude,length=special.range/this.worldWidth;
    const endpoint={x:u.x+unitX*length,y:u.y+unitY*length};
    const hits=[];
    for(const opponent of this.units.filter(v=>v.team!==u.team&&v.hp>0)){
     const relX=opponent.x-u.x,relY=opponent.y-u.y;
     const dot=relX*unitX+relY*unitY,side=Math.abs(relX*unitY-relY*unitX);
     if(dot<0||dot>length||side>special.width/(this.worldWidth*2))continue;
     // A line can hit an unseen opponent, but no hidden coordinate is fed into aim.
     if(special.projectile&&opponent.projectileGuardUntil>this.gameTime)continue;
     const amount=u.champ==='Lux'?300+100*(rank-1)+this.elementalStatsV452d3(u).ap*1.2:150+100*(rank-1)+this.elementalStatsV452d3(u).ap*.6;
     this.damage(opponent,amount,u,'magic');
     if(u.champ==='Nami'){this.applyCC(u,opponent,'knockup',1);opponent.slowPercent=Math.max(opponent.slowPercent||0,.70);}
     hits.push(opponent.id);
    }
    const spectators=['blue','red'].filter(team=>team===u.team||this.canSeePoint(team,u));
    this.event(`${u.champ} conjurou ${slot}: ${hits.length} alvo(s) atingido(s).`,u.team,'skill_vfx',u.id,
      {observedBy:spectators,vfx:{type:special.effect,from:{x:u.x,y:u.y},to:endpoint,width:special.width,expiresAt:this.gameTime+2}});
   }else if(defensiveSkill){
    this.event(`${u.champ}: ${slot} defensivo para bloquear projéteis e proteger a linha de frente.`,u.team,'block',u.id);
   }else if(target?.projectileGuardUntil>this.gameTime&&['Q','W','E','R'].includes(slot)&&(['marksman','mage','enchanter'].includes(u.klass))){
    this.event(`${target.champ} bloqueou o projétil de ${u.champ} (abstração defensiva).`,target.team,'block',target.id);
   }else this.attack(u,target,raw,'skill');
   o.comboIndex=(o.comboIndex||0)+1;o.comboNextAt=this.gameTime+1;
   o.comboStatus=o.comboIndex>=sequence.length?'concluído':'próximo: '+sequence[o.comboIndex];
   this.event(`${u.champ}: ${slot} ${o.comboIndex}/${sequence.length} ${defensiveSkill?'(defesa pessoal)':'em '+(target?.champ||'alvo')}.`,u.team,'combo',u.id);
  }
 }
 // V4.5.1 fast push: an automatic spell is a real kit cast, not free damage.
 // Limited to spells with authored geometry; other kits remain disabled rather than fabricated.
 autoWaveSkillV451(){
  for(const u of this.units){
   if(u.hp<=0||!u.autoFarm||u.autoAttack===false||u.pendingKitCastV42||u.pendingTargetedCast||u.pendingDecision||
      u.awaitingShop||u.manualMoveHold||!this.effectResolverV41().canAct(u,'skill').ok)continue;
   const strategy=u.tactics?.wave;
   if(!(strategy==='push'||strategy==='fast_push')&&u.order?.kind!=='push'&&this.activeStage(u)?.action!=='push')continue;
   if(u.mana/Math.max(1,u.maxMana)<.32)continue;
   if(!['Lux','Nami'].includes(u.champ))continue;
   const slot=u.champ==='Lux'?'E':'Q',rule=kitSpellV42(u.champ,slot);
   if(!rule||!u.skillRanks?.[slot]||!castGateV39(u,slot,this.gameTime).ok)continue;
   if(u.champ==='Lux'&&u.luxZoneV42)continue;
   const lane=u.role==='TOP'?'top':u.role==='MID'?'mid':'bot';
   const enemies=this.minions.filter(m=>m.hp>0&&m.spawnAt<=this.gameTime&&m.lane===lane&&m.team!==u.team&&this.mapDistance(m,u)<=rule.range);
   if(enemies.length<2)continue;
   const radius=rule.radius||225;
   let best=null;
   for(const m of enemies){
    const clustered=enemies.filter(v=>this.mapDistance(m,v)<=radius*.9);
    if(clustered.length<2)continue;
    const point={x:clustered.reduce((n,v)=>n+v.x,0)/clustered.length,y:clustered.reduce((n,v)=>n+v.y,0)/clustered.length};
    if(this.mapDistance(u,point)>rule.range)continue;
    if(!best||clustered.length>best.n)best={point,n:clustered.length};
   }
   if(!best)continue;
   u.pendingKitCastV42={slot,point:best.point,issuedAt:this.gameTime,castPath:[],autoWaveV451:true};
  }
 }
 resolveCombat(){this.autoWaveSkillV451();this.resolveKitSkillsV42();this.resolveDirectionalSkills();this.resolveTargetedCasts();if(this.pendingDecision)return;this.resolveQueuedCombos();if(this.pendingDecision)return; // Skills are processed even while AA is recovering.
  for(const u of this.units){if(u.hp<=0||u.attackAt>this.gameTime||u.autoAttack===false||(u.stunUntil||0)>this.gameTime||!this.effectResolverV41().canAct(u,'attack').ok)continue;let o=u.order||{};if(o.kind==='recall'||u.recallProgress>0)continue;
   let stage=this.activeStage(u);const activeAction=stage?.startedAt!==null?stage?.action:null;
   const effectiveAARange=this.itemAttackRangeV453Dev38(u);
   const enemies=this.units.filter(x=>x.team!==u.team&&x.hp>0&&dist(u,x)<=effectiveAARange&&this.visible(u.team,x));
   if(o.kind==='chase')continue; // follow-only never forces an attack
   let candidate=null;const requested=o.targetId||u.reactionCombo?.targetId||stage?.targetId;
   if(requested)candidate=enemies.find(x=>x.id===requested)||null;
   // Attacks validate vision/range, never consent from the defender.
   if(!candidate&&enemies.length){
    // Retreat is not immunity: aggression and authorized attacks still connect
    // whenever the opponent remains in effective AA range.
    const existing=Object.values(this.duelRequests).find(req=>req.state==='ready'&&req.until>=this.gameTime&&[req.initiator,req.responder].includes(u.id));
    const tradeEnemy=existing&&enemies.find(e=>[existing.initiator,existing.responder].includes(e.id));
    if(tradeEnemy&&u.combatStyle!=='avoid'&&u.retreatUntil<=this.gameTime)candidate=tradeEnemy;

    const retaliation=enemies.find(x=>x.id===u.threatId&&this.gameTime-u.lastHitAt<=8);
    if(!candidate&&retaliation)candidate=retaliation;
    else if(!candidate&&(u.policy==='aggressive'||o.kind==='attack'||activeAction==='gank'||activeAction==='fight'))candidate=enemies.sort((a,b)=>dist(u,a)-dist(u,b))[0];
    else if(!candidate&&u.tactics?.trade!=='avoid'&&u.tactics?.poke!=='off'&&u.tactics?.poke&&u.mana/u.maxMana>(u.tactics.conserveMana?.55:.27))candidate=enemies.sort((a,b)=>dist(u,a)-dist(u,b))[0];
    else if(!candidate&&u.policy==='balanced'&&this.gameTime<u.combatUntil)candidate=enemies[0];
    else if(!candidate&&u.policy==='safe'&&u.hp/u.maxHp>.65&&this.gameTime<u.combatUntil)candidate=enemies[0];
   }
   if(!candidate&&u.autoAttack){
    const enemyHeralds=this.heraldMercenariesV45.filter(h=>h.hp>0&&h.team!==u.team&&
     dist(u,h)<=effectiveAARange&&this.canSeePoint(u.team,h));
    const orderedHerald=o.kind==='attack_herald'&&enemyHeralds.find(h=>h.id===o.targetId);
    // A defending bot attacks visible enemy Heralds. Other champions only
    // auto-defend when the enemy Herald is in range and no champion is targeted.
    if(orderedHerald)candidate=orderedHerald;
    else if(enemyHeralds.length&&(u.team==='red'||u.policy==='aggressive'||o.kind==='defend'))
     candidate=enemyHeralds.sort((a,b)=>dist(a,u)-dist(b,u)||a.id.localeCompare(b.id))[0];
   }
   if(!candidate&&u.autoAttack&&u.role!=='JG'){
    const lane=u.botSiegeLaneV452d4Dev22||(u.role==='TOP'?'top':u.role==='MID'?'mid':'bot');
    const fastPush=u.tactics?.wave==='fast_push';
    const push=u.order?.kind==='push'||activeAction==='push'||u.tactics?.wave==='push'||fastPush;
    const slow=u.tactics?.wave==='slow_push';
    const creeps=this.nearbyMinions(u,effectiveAARange+.004).filter(x=>x.team!==u.team&&x.lane===lane)
     .sort((a,b)=>slow||fastPush?((a.kind==='caster'?0:a.kind==='siege'?1:2)-(b.kind==='caster'?0:b.kind==='siege'?1:2)||a.hp-b.hp||dist(a,u)-dist(b,u)):(push?(dist(a,u)-dist(b,u)||a.hp-b.hp):(a.hp-b.hp||dist(a,u)-dist(b,u))));
    const killable=creeps.find(m=>m.hp<=this.predictBasicAttackDamageV452c(u,m,o.combatStyle||u.combatStyle||'auto'));
    if(u.role==='SUP'&&!['attack','push'].includes(o.kind))candidate=null;
    else if(u.autoFarm){
     const lastHitOnly=slow||u.tactics?.wave==='freeze';
     candidate=killable||(!lastHitOnly&&(push||u.policy==='aggressive')?creeps[0]:null);
    }
    else candidate=(o.kind==='attack'||u.policy==='aggressive')?creeps[0]:null;
   }
   if(!candidate&&u.autoAttack&&(['push','attack','farm'].includes(o.kind)||activeAction==='push')){
    const lane=u.botSiegeLaneV452d4Dev22||(u.role==='TOP'?'top':u.role==='MID'?'mid':'bot');
    candidate=this.structures.filter(x=>x.alive&&x.team!==u.team&&this.structureVulnerable(x)&&
     (x.lane===lane||x.lane==='nexus')&&dist(x,u)<=Math.max(.035,effectiveAARange)&&
     this.nearbyMinions(x,.125).some(m=>m.team===u.team&&m.hp>0))
     .sort((a,b)=>dist(a,u)-dist(b,u))[0]||null;
   }
   if(candidate){
    if(candidate.champ){
     const gank=['gank','roam'].includes(o.kind)||['gank','roam'].includes(activeAction);
     if(!this.duelPermission(u,candidate))continue;
    }
    let bonusDamage=0;
    // QWER is an ordered, abstract combo, not champion-specific official spell data.
    const combo=[]; // Explicit queued spells are handled separately from AA above.
    const style=o.combatStyle||u.combatStyle||'auto'; // aa / kite / skill_aa / on_hit / combo
    const useSkills=!['aa','on_hit','kite','combo'].includes(style);
    const cast=!useSkills?null:combo.length?combo[o.comboIndex||0]||null:o.spell==='Q'?'Q':null;
    if(cast&&combo.length&&(u.skillRanks?.[cast]||0)===0){o.comboIndex++;this.event(`${u.champ}: ${cast} não aprendida; etapa ignorada.`,u.team,'combo_skip',u.id);}
    const costs={Q:45,W:50,E:55,R:100},cds={Q:9,W:12,E:13,R:65};
    const skillCds=u.skillCds||(u.skillCds={Q:0,W:0,E:0,R:0});
    const championQ=cast&&CHAMPION_ONHIT_SKILLS_V453_DEV41[u.champ]?.slot===cast;
    const requiredMana=championQ?abilityCost(u,cast):costs[cast];
    if(cast&&(u.skillRanks?.[cast]||0)>0&&skillCds[cast]<=this.gameTime&&u.mana>=requiredMana&&
      (!u.tactics?.conserveMana||u.mana-requiredMana>=u.maxMana*.35)){
     // Auto-attack orders that explicitly request Q use exactly the same
     // champion-specific resolver as manual combos, never the fallback burst.
     const skill=championQ?(candidate.champ||candidate.kind?
       this.castChampionOnHitV453Dev41(u,cast,candidate):{ok:false,reason:'alvo_incompatível'}):
       this.performActionV40({actorId:u.id,kind:'skill',slot:cast,targetId:candidate.champ?candidate.id:null,
        checkRange:!!candidate.champ,costOverride:requiredMana,
        cooldownOverride:hasteCooldown(cds[cast],this.elementalStatsV452d3(u).abilityHaste+(cast==='R'?(u.ultimateHaste||0):(u.basicHaste||0))),source:'auto_attack_skill'});
     if(skill.ok){
      const scale=(.46+.54*Math.min(1,(u.level-1)/17))*(.76+.12*(u.skillRanks[cast]||1));
      if(!championQ&&cast==='Q')bonusDamage+=u.skillPower*.7*scale+this.elementalStatsV452d3(u).ap*.25;
      if(!championQ&&cast==='E')bonusDamage+=u.skillPower*.5*scale+this.elementalStatsV452d3(u).ap*.2;
      if(!championQ&&cast==='R')bonusDamage+=u.skillPower*1.35*scale+this.elementalStatsV452d3(u).ap*.5;
      if(!championQ&&cast==='W')u.shield=Math.max(u.shield,46+u.level*5);
      if(combo.length){o.comboIndex=(o.comboIndex||0)+1;this.event(`${u.champ}: combo ${o.comboIndex}/${combo.length} executado.`,u.team,'combo',u.id);}
      this.event(`${u.champ} usou ${cast} em sequência tática.`,u.team,'skill',u.id);
     }
    }
    if(o.spell==='exhaust'&&candidate.champ&&this.performActionV40({actorId:u.id,kind:'summoner',type:'exhaust',targetId:candidate.id,source:'auto_attack'}).ok){candidate.exhaustUntil=this.gameTime+3;this.event(`${u.champ} usou Exaustão em ${candidate.champ}.`,u.team,'summoner',u.id)}
    const aa=this.performActionV40({actorId:u.id,kind:'basic_attack',targetId:candidate.champ?candidate.id:null,
      point:{x:candidate.x,y:candidate.y},source:'auto_attack',checkRange:false,cooldownOverride:this.basicAttackIntervalV452c(u)});
    if(!aa.ok)continue;
    const dmg=this.basicAttackPowerV452c(u,candidate,style,{commit:true,bonusDamage});
    this.attack(u,candidate,dmg);
    if(candidate.champ&&style==='kite'&&u.retreatUntil<=this.gameTime){
     const dx=u.x-candidate.x,dy=u.y-candidate.y,sep=Math.hypot(dx,dy)||1;
     // Retain AA range, step a little toward own base and away from enemy.
     const move=.0075,goal={x:u.x+dx/sep*move,y:u.y+dy/sep*move};
     if(this.walkable(goal.x,goal.y)&&dist(goal,candidate)<=u.range*.93){u.x=goal.x;u.y=goal.y;this.invalidateShopUndoOnDepartureV453Dev61(u);}
    }
   }
  }
  // DEV52: early-lane calibration uses its verified target resolver. After
  // the 5-minute CS window, combat and forecasting use the physical body picker.
  for(const m of this.minions){if(m.hp<=0||m.spawnAt>this.gameTime||m.attackAt>this.gameTime)continue;
   const baronMods=this.baronMinionModifiersV452d(m);
   const target=this.gameTime<=300?this.legacyCombatMinionTargetV453Dev52(m):this.minionAttackTargetV452c(m);
   if(target){
    if(this.gameTime>300)m.minionFocusIdV453Dev52=target.kind?target.id:null;
    // The farm autopilot can time a *real basic attack* just before an allied
    // minion's lethal blow. Never give CS/gold to a nearby non-attacker.
    let claimed=false;
    if(target.kind&&target.hp>0){
     const farmers=this.units.filter(u=>u.team===m.team&&u.hp>0&&u.autoFarm&&u.autoAttack&&u.role!=='JG'&&u.role!=='SUP'&&
      !u.manualMoveHold&&!u.awaitingShop&&u.attackAt<=this.gameTime&&u.order?.kind!=='recall'&&
      this.mapDistance(u,target)<=u.range*this.worldWidth&&
      ((u.role==='TOP'?'top':u.role==='MID'?'mid':'bot')===target.lane));
     farmers.sort((a,b)=>this.mapDistance(a,target)-this.mapDistance(b,target)||a.id.localeCompare(b.id));
     for(const u of farmers){
      const style=u.order?.combatStyle||u.combatStyle||'auto';
      const hit=this.predictBasicAttackDamageV452c(u,target,style);
      if(target.hp>hit)continue;
      const action=this.performActionV40({actorId:u.id,kind:'basic_attack',point:{x:target.x,y:target.y},
       checkRange:false,cooldownOverride:this.basicAttackIntervalV452c(u),source:'auto_farm_last_hit_v451'});
      if(!action.ok)continue;
      this.attack(u,target,this.basicAttackPowerV452c(u,target,style,{commit:true}));claimed=target.hp<=0;break;
     }
    }
    if(!claimed){
     this.attack(m,target,this.baronMinionAttackDamageV452d(m,target));
    }
    m.attackAt=this.gameTime+m.interval*baronMods.intervalMultiplier;
   }
  }
  for(const t of this.structures){if(!t.alive||t.type!=='tower'||t.lastShot+2.5>this.gameTime)continue;
   let targets=this.nearbyMinions(t,.13).filter(m=>m.team!==t.team&&(t.lane==='nexus'||m.lane===t.lane));
   let champions=this.units.filter(c=>c.team!==t.team&&c.hp>0&&dist(c,t)<.11);
   let victim=champions.find(c=>c.id===t.aggro);
   if(!victim){t.aggro=null;let order={siege:0,super:0,melee:1,caster:2};targets.sort((a,b)=>(order[a.kind]-order[b.kind])||dist(a,t)-dist(b,t));const herald=this.heraldMercenariesV45.find(h=>h.team!==t.team&&h.hp>0&&this.mapDistance(h,t)<=850);
    const tanking=herald?targets.find(m=>this.mapDistance(m,t)<=850):targets[0];
    victim=tanking||herald||targets[0]||champions[0];}
   if(victim){if(this.heraldMercenariesV45.includes(victim)){
    victim.hp=Math.max(0,victim.hp-OBJECTIVE_RULES_V45.herald.towerAttackDamage);
    t.lastShot=this.gameTime;
    this.event(`${t.name||t.id} atingiu o Arauto (${victim.hp} HP).`,t.team,'herald_tower_hit');
   }else{this.attack(t,victim,victim.champ?190:235);t.lastShot=this.gameTime;}
   if(victim.hp<=0&&victim.champ){victim.deadUntil=this.gameTime+20;this.event(`Torre ${t.id} eliminou ${victim.champ}.`)}}
  }
  this.minions=this.minions.filter(m=>m.hp>0);
  // DEV58: cleanup after combat commits. The formation update occurs BEFORE
  // combat; a fresh combat focus or a dead minion would otherwise leave a
  // stale physical goal for the next second. Never changes attack/CS/HP.
  if(this.mode==='pvp'&&this.gameTime>300){
   const live=new Map(this.minions.map(m=>[m.id,m]));
   for(const m of this.minions){
    const candidate=m.minionFocusIdV453Dev52&&live.get(m.minionFocusIdV453Dev52);
    if(m.minionFocusIdV453Dev52&&!candidate)m.minionFocusIdV453Dev52=null;
    const selected=candidate||live.get(m.minionEngagementTargetIdV453Dev58);
    m.minionEngagementTargetIdV453Dev58=selected&&selected.team!==m.team&&selected.lane===m.lane&&this.mapDistance(m,selected)<=240?selected.id:null;
   }
  }
  this.finishStructureDeathsV451();
 }
 // A camp is a strategic group on this board; companions share the group's HP.
 // Level is sampled on spawn, not continuously every time a player attacks.
 campProfile(c){return CAMP_RULES_2026[c.timerKey]||CAMP_RULES_2026.krugs;}
 spawnCamp(c){
  const cfg=this.campProfile(c);
  const levels=this.units.map(u=>u.level||1);
  const level=Math.max(1,Math.min(18,Math.round(levels.reduce((a,b)=>a+b,0)/Math.max(1,levels.length))));
  c.damageByActorV44={};c.contestedTicksV44=0;c.campLevel=level;c.alive=true;c.spawnCycle=(c.spawnCycle||0)+1;
  for(const team of ['blue','red'])if(this.canSeePoint(team,c))delete this.campKnowledge[team][c.id];
  // These HP figures are grouped training-balancing values, NOT official HP.
  const factor=c.timerKey==='baron'?1+.014*Math.max(0,Math.floor((this.gameTime-1200)/60)):1+.065*(level-1);
  c.maxHealth=Math.round(cfg.baseHp*factor);c.health=c.maxHealth;
  if(c.timerKey==='voidgrubs'){
   const base=Math.round(OBJECTIVE_RULES_V45.voidgrubs.baseHealth*(1+.065*Math.max(0,level-7)));
   c.grubsV45=Array.from({length:3},(_,id)=>({id,hp:base,maxHp:base,alive:true,decayUntil:0,decayAmount:0}));
   c.maxHealth=base*3;c.health=c.maxHealth;c.lastMitesV45=-999;c.neutralMitesV45=[];
  }
  c.patience=100;c.leashState='idle';c.resetAt=0;c.aggroId=null;c.lastFoughtAt=-999;c.monsterAttackAt=this.gameTime+2;
 }
 // Patience and two-stage reset are resolved in simulation seconds. Camps
 // are represented by stationary board markers: monster chase animations and
 // each individual Krug/Raptor health bar are deliberately future milestones.
 advanceCampLeash(c,fighters){
  const cfg=this.campProfile(c);
  const inside=fighters.filter(u=>this.mapDistance(u,c)<=cfg.leash);
  if(c.leashState==='soft'){
   c.health=Math.min(c.maxHealth,c.health+c.maxHealth*.06);
   if(inside.length){c.leashState='engaged';c.patience=Math.max(45,c.patience);c.aggroId=inside[0].id;c.lastFoughtAt=this.gameTime;return;}
   if(this.gameTime-(c.resetAt||this.gameTime)>=6){c.leashState='hard';c.resetAt=this.gameTime;}
   return;
  }
  if(c.leashState==='hard'){
   c.health=Math.min(c.maxHealth,c.health+c.maxHealth*.36);
   if(this.gameTime-(c.resetAt||this.gameTime)>=3){c.health=c.maxHealth;c.damageByActorV44={};c.contestedTicksV44=0;c.patience=100;
    if(c.timerKey==='voidgrubs'&&Array.isArray(c.grubsV45))for(const g of c.grubsV45)if(g.alive){g.hp=g.maxHp;g.decayAmount=0;g.decayUntil=0;}c.leashState='idle';c.aggroId=null;}
   return;
  }
  if(c.leashState==='idle'){
   if(!fighters.length)return;
   c.leashState='engaged';c.patience=100;c.aggroId=fighters[0].id;c.lastFoughtAt=this.gameTime;
  }
  const target=this.units.find(u=>u.id===c.aggroId&&u.hp>0);
  const hasAggro=target&&this.mapDistance(target,c)<=cfg.leash&&this.combatCampTarget(target)===c.id;
  if(!hasAggro){
   // Out-of-leash and abandoned targets lose patience; never teleport a
   // monster across the board or grant a phantom last hit.
   c.patience=Math.max(0,(c.patience??100)-(target?20:28));
  }else{
   c.patience=Math.min(100,(c.patience??100)+9);
   if(fighters.length&&this.gameTime-(c.lastFoughtAt||0)>2)c.patience=Math.max(0,c.patience-5);
  }
  if(c.patience<=0){const actor=this.units.find(u=>u.id===c.aggroId);c.leashState='soft';c.resetAt=this.gameTime;c.aggroId=null;if(actor)this.event(`${c.timerKey}: monstro perdeu paciência e começou a retornar.`,actor.team,'jungle_reset',actor.id);}
 }
 // A skirmish near an epic pit becomes a public-to-participants teamfight
 // summary only when at least two living champions per team are nearby.
 recordTeamfightImpactV44(attacker,target,dealt){
  this.teamfightLedgerV44??=[];
  const radius=1250,pit=this.camps.filter(c=>['dragon','baron','herald','voidgrubs'].includes(c.timerKey))
   .sort((a,b)=>this.mapDistance(attacker,a)-this.mapDistance(attacker,b))[0];
  if(!pit||this.mapDistance(attacker,pit)>radius||this.mapDistance(target,pit)>radius)return;
  const near=this.units.filter(u=>u.hp>0&&this.mapDistance(u,pit)<=radius);
  if(near.filter(u=>u.team==='blue').length<2||near.filter(u=>u.team==='red').length<2)return;
  const last=this.teamfightLedgerV44.at(-1);
  const existing=last&&last.pit===pit.objectId&&this.gameTime-last.lastAt<=OBJECTIVE_REWARD_V44.contestedWindow?last:null;
  const observedBy=['blue','red'].filter(team=>team===attacker.team||team===target.team||this.canSeePoint(team,pit));
  if(existing){existing.lastAt=this.gameTime;existing.hits++;existing.damage+=dealt;
   existing.observedBy=[...new Set([...existing.observedBy,...observedBy])];}
  else{this.teamfightLedgerV44.push({at:this.gameTime,lastAt:this.gameTime,pit:pit.objectId,
   hits:1,damage:dealt,observedBy});this.teamfightLedgerV44=this.teamfightLedgerV44.slice(-60);}
 }

 // Voidmites inside the pit: six-second neutral adds, summoned in groups of
 // four per living grub every 12 simulated seconds. This is a tactical
 // approximation: no full projectile/animation AI or on-kill ability procs.
 advanceNeutralMitesV45(c){
  if(!c.alive||c.leashState!=='engaged')return;
  c.neutralMitesV45??=[];
  const now=this.gameTime;
  c.neutralMitesV45=c.neutralMitesV45.filter(m=>m.hp>0&&now<m.expiresAt);
  if(now-(c.lastMitesV45??-999)>=OBJECTIVE_RULES_V45.voidgrubs.spawnVoidmitesEvery){
   const alive=c.grubsV45?.filter(g=>g.alive).length||0;
   if(alive){
    for(let j=0;j<alive*OBJECTIVE_RULES_V45.voidgrubs.mitesPerLivingGrub;j++)
     c.neutralMitesV45.push({id:`${c.id}_mite_${now}_${j}`,hp:325,maxHp:325,
      expiresAt:now+6,nextAttackAt:now+1});
    c.lastMitesV45=now;
   }
  }
  const victim=this.units.filter(u=>u.hp>0&&this.mapDistance(u,c)<=this.campProfile(c).leash)
   .sort((a,b)=>this.mapDistance(a,c)-this.mapDistance(b,c)||a.id.localeCompare(b.id))[0];
  if(!victim)return;
  for(const mite of c.neutralMitesV45)if(now>=mite.nextAttackAt){
   this.damage(victim,4,null,'physical','voidmite_camp');mite.nextAttackAt=now+1;
  }
 }
 hitNeutralMiteV45(actorId,campId,miteId){
  const u=this.units.find(v=>v.id===actorId),c=this.camps.find(v=>v.id===campId&&v.timerKey==='voidgrubs'&&v.alive);
  const mite=c?.neutralMitesV45?.find(m=>m.id===miteId&&m.hp>0&&m.expiresAt>this.gameTime);
  if(!u||u.hp<=0||!mite||this.mapDistance(u,c)>Math.max(500,(u.range||.03)*this.worldWidth))
   return {ok:false,reason:'voidmite_indisponível_ou_fora_de_alcance'};
  const cast=this.performActionV40({actorId:actorId,kind:'basic_attack',point:{x:c.x,y:c.y},
    source:'voidmite_camp',checkRange:false,cooldownOverride:this.basicAttackIntervalV452c(u)});
  if(!cast.ok)return cast;
  const dealt=Math.min(mite.hp,Math.max(1,Math.round(u.ad*100/(100+0))));mite.hp-=dealt;
  if(mite.hp<=0)c.neutralMitesV45=c.neutralMitesV45.filter(x=>x.id!==miteId);
  // Pit Voidmites have no gold, CS, XP or on-kill effects.
  return {ok:true,damage:dealt,killed:mite.hp<=0};
 }
 // V4.5: each of the three grubs is independently killable. Impacts cannot
 // overflow to the next grub; the attacker must commit another action.
 resolveVoidgrubsV45(c,impacts){
  const grubs=c.grubsV45||[];
  let ordered=[...impacts].sort((a,b)=>(a.kind==='smite'?0:1)-(b.kind==='smite'?0:1)||a.u.id.localeCompare(b.u.id));
  // Simultaneous Smites target the SAME grub. Never spill a losing Smite into
  // the next grub or let blue actor-ID order decide the winning capture.
  const smites=ordered.filter(x=>x.kind==='smite'),first=grubs.find(g=>g.alive);
  if(first&&smites.length>1){
   const verdict=resolveSimultaneousSmiteV452d4Dev9(first.hp,smites.map(x=>({actorId:x.u.id,hit:x.hit})));
   const winning=smites.find(x=>x.u.id===(verdict.winner?.actorId||[...smites].sort((a,b)=>b.hit-a.hit)[0]?.u.id));
   ordered=[{...winning,hit:Math.min(first.hp,verdict.total)},...ordered.filter(x=>x.kind!=='smite')];
  }
  for(const {u,hit,kind} of ordered){
   const grub=grubs.find(g=>g.alive);if(!grub)break;
   const actual=Math.min(grub.hp,Math.max(0,hit));grub.hp-=actual;
   if(grub.hp>0)continue;
   grub.hp=0;grub.alive=false;
   const noSmite=kind!=='smite'?this.noSmitePitResultV452d4Dev9(c,smites,ordered.filter(x=>x.kind==='attack'),grub.id):null;
   const credited=noSmite?.finisher||u;
   this.teams[credited.team].voidgrubs=Math.min(3,(this.teams[credited.team].voidgrubs||0)+1);
   this.creditGoldV452d4Dev7(credited,OBJECTIVE_RULES_V45.voidgrubs.slayerGold,'voidgrub');credited.cs+=2;
   this.recordEconomyV43(credited,'voidgrub_kill',OBJECTIVE_RULES_V45.voidgrubs.slayerGold,`voidgrub_${grub.id}`);
   this.gainXP(credited,OBJECTIVE_RULES_V45.voidgrubs.slayerXP);
   this.objectiveLedgerV44.push({time:this.gameTime,objective:'voidgrub_individual',owner:credited.team,
    grubId:grub.id,finisherId:credited.id,participants:[credited.id],smiteSecured:kind==='smite',
    noSmitePitRoll:noSmite?{blue:noSmite.blue,red:noSmite.red,blueProbability:noSmite.blueProbability,roll:noSmite.roll}:null,
    damageByActor:{...(c.damageByActorV44||{})}});
   this.objectiveLedgerV44=this.objectiveLedgerV44.slice(-100);
   this.event(`${credited.champ} abateu Vastilarva (${this.teams[credited.team].voidgrubs}/3 para ${credited.team}).`,credited.team,'voidgrub',credited.id);
   // Defensive Measures: surviving grubs heal now, then the restored amount
   // decays over ten simulated seconds, without lethal self damage.
   for(const other of grubs.filter(g=>g.alive)){
    const amount=Math.round(other.maxHp*.30+(other.maxHp-other.hp)*.30);
    const heal=Math.min(other.maxHp-other.hp,amount);other.hp+=heal;
    other.decayAmount=(other.decayAmount||0)+heal;other.decayUntil=this.gameTime+10;
   }
  }
  for(const g of grubs.filter(g=>g.alive&&g.decayAmount>0&&g.decayUntil>this.gameTime)){
   const step=Math.min(g.decayAmount,g.decayAmount/Math.max(1,g.decayUntil-this.gameTime));
   g.hp=Math.max(1,g.hp-step);g.decayAmount=Math.max(0,g.decayAmount-step);
  }
  c.health=grubs.reduce((v,g)=>v+(g.alive?g.hp:0),0);
  if(grubs.some(g=>g.alive))return;
  c.health=0;c.alive=false;c.exhaustedV44=true;c.leashState='idle';c.aggroId=null;c.neutralMitesV45=[];
  c.lastClearedAt=this.gameTime;c.respawnAt=Number.MAX_SAFE_INTEGER;
  const blue=this.teams.blue.voidgrubs||0,red=this.teams.red.voidgrubs||0;
  c.lastClearTeam=blue>red?'blue':red>blue?'red':'split';
  this.event(`Vastilarvas derrotadas: Azul ${blue}/3 · Vermelho ${red}/3.`,null,'objective');
 }
 applyVoidSiegeV45(attacker,target){
  const stacks=Math.min(3,this.teams[attacker.team]?.voidgrubs||0);if(!stacks)return;
  const ranged=['mage','marksman','enchanter'].includes(attacker.klass);
  const ticks=OBJECTIVE_RULES_V45.voidgrubs.touchOfVoidTickDamage[ranged?'ranged':'melee'];
  const key=target.id;
  this.structureBurnV45[key]={targetId:key,team:attacker.team,perTick:ticks[stacks],
   until:this.gameTime+4,nextAt:this.gameTime+.5};
  if(stacks===3&&!(attacker.voidmiteNextV45>this.gameTime)){
   attacker.voidmiteNextV45=this.gameTime+OBJECTIVE_RULES_V45.voidgrubs.hungerCooldown;
   this.voidmiteSiegesV45.push({team:attacker.team,targetId:key,nextAt:this.gameTime+2,
    expiresAt:this.gameTime+10,sourceId:attacker.id});
   this.event(`${attacker.champ}: Voidmite invocado para pressionar estrutura.`,attacker.team,'voidmite',attacker.id);
  }
 }
 pickupHeraldEyeV45(unitId){
  const eye=this.heraldEyeV45,u=this.units.find(v=>v.id===unitId);
  if(!eye||eye.holderId||this.gameTime>eye.expiresAt||!u||u.team!==eye.owner||u.hp<=0)
   return {ok:false,reason:'Olho indisponível.'};
  if(this.mapDistance(u,eye)>OBJECTIVE_RULES_V45.herald.eyePickupRange)
   return {ok:false,reason:'Aproxime-se do Olho do Arauto.'};
  eye.holderId=u.id;u.previousTrinketV45=u.trinket||'stealth';u.trinket='herald_eye';
  u.heraldEyeExpiresAtV45=this.gameTime+OBJECTIVE_RULES_V45.herald.eyeLifetimeSeconds;
  this.event(`${u.champ} coletou o Olho do Arauto.`,u.team,'herald_eye',u.id);
  return {ok:true};
 }
 // Dev21: the *summoned* Herald's eye is different from the neutral
 // monster: a champion basic attack from behind deals 40% maximum HP true
 // damage while the eye is open. No bonus on spells, frontal AA, towers,
 // allied attacks or repeated hits inside its 3s cooldown.
 heraldRearEyeV452d4Dev21(merc,champion){
  if(!merc||!champion||!Number.isFinite(champion.x)||!Number.isFinite(champion.y))return false;
  const facingX=Number.isFinite(merc.facingX)?merc.facingX:(merc.team==='blue'?1:-1);
  const facingY=Number.isFinite(merc.facingY)?merc.facingY:0;
  const dx=(champion.x-merc.x)*this.worldWidth,dy=(champion.y-merc.y)*this.worldHeight;
  const n=Math.hypot(dx,dy),f=Math.hypot(facingX,facingY)||1;
  return n>=1&&(dx*facingX+dy*facingY)/(n*f)<=-.45;
 }
 attackSummonedHeraldV452d4Dev21(attacker,merc,amount,kind='attack'){
  if(!attacker?.champ||attacker.hp<=0||!this.heraldMercenariesV45.includes(merc)||
     merc.hp<=0||merc.team===attacker.team)return {ok:false,reason:'alvo_indisponível'};
  if(this.mapDistance(attacker,merc)>attacker.range*this.worldWidth+1e-6||!this.canSeePoint(attacker.team,merc))
   return {ok:false,reason:'fora_de_alcance_ou_sem_visão'};
  const hpBefore=merc.hp;
  const regular=this.damage(merc,Math.max(0,amount),attacker,kind==='skill'?'magic':'physical',kind==='skill'?'spell':'basic');
  let eyeDamage=0;
  if(kind!=='skill'&&merc.hp>0&&this.heraldRearEyeV452d4Dev21(merc,attacker)&&
      this.gameTime>=(merc.eyeReadyAtV452d4Dev21??merc.spawnAt??0)){
   eyeDamage=this.damage(merc,merc.maxHp*.40,attacker,'true','herald_eye');
   merc.eyeReadyAtV452d4Dev21=this.gameTime+3;
   merc.eyeHitsV452d4Dev21=(merc.eyeHitsV452d4Dev21||0)+1;
   this.event(`Olho nas costas do Arauto atingido por ${attacker.champ}!`,attacker.team,'herald_eye_hit',attacker.id);
  }
  merc.lastChampionAttackAtV452d4Dev21=this.gameTime;
  if(merc.hp<=0){merc.hp=0;merc.slainByV452d4Dev21=attacker.id;
   this.event(`${attacker.champ} destruiu o Arauto inimigo.`,attacker.team,'herald_mercenary_destroyed',attacker.id);}
  return {ok:true,regular,eyeDamage,dealt:hpBefore-merc.hp,destroyed:merc.hp<=0};
 }
 // This is an explicit champion command; natural AI combat uses the same
 // attack function and normal AA cooldown. No point-click damage bypass.
 orderAttackSummonedHeraldV452d4Dev21(team,unitId,mercId){
  const u=this.units.find(x=>x.id===unitId&&x.team===team&&x.hp>0);
  const merc=this.heraldMercenariesV45.find(x=>x.id===mercId&&x.hp>0&&x.team!==team);
  if(!u||!merc||!this.canSeePoint(team,merc))return {ok:false,reason:'arauto_não_visível'};
  u.order={kind:'attack_herald',targetId:merc.id,spell:'none'};
  u.plan=null;u.explicitOrder=true;u.manualMoveHold=false;
  return {ok:true};
 }
 // Explicit lane deployment: the chosen carrier must physically reach the
 // deployment point. The Eye is only consumed after arrival, not on order.
 orderHeraldSummonV452d4Dev20(team,unitId,point,lane){
  const u=this.units.find(v=>v.id===unitId&&v.team===team);
  if(!u||u.hp<=0||u.trinket!=='herald_eye'||!(u.heraldEyeExpiresAtV45>this.gameTime))return {ok:false,reason:'Escolha um portador vivo com o Olho do Arauto.'};
  if(!['top','mid','bot'].includes(lane)||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||!this.walkable(point.x,point.y))return {ok:false,reason:'Escolha uma posição caminhável na rota.'};
  const line=this.lanes[lane];if(!line)return {ok:false,reason:'Rota inexistente.'};
  const nearest=Math.min(...line.path.map(v=>this.mapDistance(v,point)));
  if(nearest>1900)return {ok:false,reason:'Ponto fora do corredor da rota.'};
  const path=this.findPath(u,point);
  if(this.mapDistance(u,point)>125&&!path?.length)return {ok:false,reason:'Rota sem caminho disponível.'};
  u.heraldSummonOrderV452d4Dev20={lane,point:{x:point.x,y:point.y},path:path||[],issuedAt:this.gameTime};
  u.order={kind:'herald_deploy',spell:'none'};u.plan=null;u.explicitOrder=true;u.manualMoveHold=true;
  this.event(`${u.champ} levará o Arauto até a rota ${lane}.`,team,'herald_deploy_order',u.id);
  return {ok:true,queued:true,lane};
 }
 advanceHeraldCarrierV452d4Dev20(u){
  const order=u.heraldSummonOrderV452d4Dev20;if(!order)return false;
  if(u.hp<=0||u.trinket!=='herald_eye'||!(u.heraldEyeExpiresAtV45>this.gameTime)){
   u.heraldSummonOrderV452d4Dev20=null;return false;
  }
  if(this.mapDistance(u,order.point)>125){
   if(!order.path?.length)order.path=this.findPath(u,order.point)||[];
   if(order.path.length)this.moveAlong(u,{path:order.path,point:order.point},this.effectiveMS(u));
   return true;
  }
  const summoned=this.summonHeraldV45(u.id,{lane:order.lane});
  if(summoned.ok){u.heraldSummonOrderV452d4Dev20=null;u.order={kind:'auto',spell:'none'};u.explicitOrder=false;u.manualMoveHold=false;}
  return true;
 }
 summonHeraldV45(unitId,options={}){
  const u=this.units.find(v=>v.id===unitId);
  if(!u||u.hp<=0||u.trinket!=='herald_eye'||!(u.heraldEyeExpiresAtV45>this.gameTime))
   return {ok:false,reason:'O campeão não tem um Olho válido.'};
  const lane=['top','mid','bot'].includes(options?.lane)?options.lane:'any';
  const rules=OBJECTIVE_RULES_V45.herald;
  const level=Math.max(9,u.level||1),hp=rules.mercenaryHpBase+rules.mercenaryHpGrowth*(level-1);
  const mercenary={id:`herald_merc_${this.gameTime}_${unitId}`,team:u.team,x:u.x,y:u.y,lane,
   spawnAt:this.gameTime,expiresAt:this.gameTime+rules.mercenaryLifetime,
   lastCharge:-999,lastBasicAttack:-999,charges:0,hitTowerIds:[],lastTowerShot:-999,hp,maxHp:hp,eyeReadyAtV452d4Dev21:this.gameTime,eyeHitsV452d4Dev21:0};
  this.heraldMercenariesV45.push(mercenary);
  u.heraldSummonOrderV452d4Dev20=null;
  u.trinket=u.previousTrinketV45||'stealth';u.previousTrinketV45=null;u.heraldEyeExpiresAtV45=0;
  if(this.heraldEyeV45?.holderId===u.id)this.heraldEyeV45=null;
  this.event(`${u.champ} invocou o Arauto para destruir estruturas.`,u.team,'herald_summon',u.id);
  return {ok:true,id:mercenary.id};
 }
 advanceObjectivesV45(){
  const now=this.gameTime,eye=this.heraldEyeV45;
  if(eye&&!eye.holderId){
   if(now>eye.expiresAt)this.heraldEyeV45=null;
   else{
    const allies=this.units.filter(u=>u.team===eye.owner&&u.hp>0&&this.mapDistance(u,eye)<=OBJECTIVE_RULES_V45.herald.eyePickupRange)
     .sort((a,b)=>this.mapDistance(a,eye)-this.mapDistance(b,eye)||a.id.localeCompare(b.id));
    if(allies.length){const auto=allies.find(u=>u.team==='red'||!this.manualBlueHeraldPickupV452d4Dev20);if(auto)this.pickupHeraldEyeV45(auto.id);}
   }
  }
  for(const u of this.units)if(u.trinket==='herald_eye'&&u.heraldEyeExpiresAtV45<=now){
   // Eye expires without creating a silent free summon; restore original trinket.
   u.trinket=u.previousTrinketV45||'stealth';u.previousTrinketV45=null;u.heraldEyeExpiresAtV45=0;u.heraldSummonOrderV452d4Dev20=null;
   if(this.heraldEyeV45?.holderId===u.id)this.heraldEyeV45=null;
   this.event(`Olho do Arauto de ${u.champ} expirou.`,u.team,'herald_eye',u.id);
  }
  for(const u of this.units){
   if(u.trinket!=='herald_eye'||u.heraldSummonOrderV452d4Dev20||u.hp<=0)continue;
   if(u.team==='blue'&&this.manualBlueHeraldPickupV452d4Dev20)continue;
   const lane='mid',line=this.lanes[lane];if(!line)continue;
   const destination=sampleLine(line,u.team==='blue'?.57:.43);
   if(this.walkable(destination.x,destination.y))this.orderHeraldSummonV452d4Dev20(u.team,u.id,destination,lane);
  }
  for(const burn of Object.values(this.structureBurnV45||{})){
   const t=this.structures.find(s=>s.id===burn.targetId);
   if(!t||!t.alive||now>burn.until){delete this.structureBurnV45[burn.targetId];continue;}
   while(burn.nextAt<=now&&burn.nextAt<=burn.until){
    // Void structure burn is true damage; no attacker champion, so no lifesteal/proc.
    this.damage(t,burn.perTick,{team:burn.team},'true','voidgrub_burn');burn.nextAt+=.5;
   }
  }
  for(const mite of this.voidmiteSiegesV45){
   const t=this.structures.find(s=>s.id===mite.targetId);
   if(!t?.alive||now>mite.expiresAt)continue;
   if(now>=mite.nextAt){this.damage(t,42,{team:mite.team},'physical','voidmite');mite.nextAt=now+2;}
  }
  this.voidmiteSiegesV45=this.voidmiteSiegesV45.filter(m=>now<=m.expiresAt&&this.structures.some(s=>s.id===m.targetId&&s.alive));
  for(const merc of this.heraldMercenariesV45){
   if(now>merc.expiresAt||merc.hp<=0)continue;
   merc.hitTowerIds??=[];
   const objectives=this.structures.filter(st=>st.team!==merc.team&&st.alive&&st.type==='tower'&&
    (merc.lane==='any'||st.lane===merc.lane||st.lane==='nexus')&&this.structureVulnerable(st));
   const target=objectives.sort((a,b)=>this.mapDistance(merc,a)-this.mapDistance(merc,b)||a.id.localeCompare(b.id))[0];
   if(!target)continue;
   const range=OBJECTIVE_RULES_V45.herald.chargeRange;
   const distance=this.mapDistance(merc,target);
   // Face the next vulnerable tower; the rear eye is opposite this vector.
   const fx=(target.x-merc.x)*this.worldWidth,fy=(target.y-merc.y)*this.worldHeight;
   const fl=Math.hypot(fx,fy);
   if(fl>1){merc.facingX=fx/fl;merc.facingY=fy/fl;}
   if(distance>range){
    const step=Math.min(distance-range,OBJECTIVE_RULES_V45.herald.mercenaryMoveWorldPerSecond);
    const next={x:merc.x+(target.x-merc.x)*step/distance,y:merc.y+(target.y-merc.y)*step/distance};
    if(this.walkable(next.x,next.y)){merc.x=next.x;merc.y=next.y;}
    else { // Follow lane instead of passing straight through walls.
     const line=this.lanes[merc.lane==='any'?'mid':merc.lane],ordered=merc.team==='blue'?line.path:[...line.path].reverse();
     const waypoint=ordered.filter(pt=>this.walkable(pt.x,pt.y)).sort((a,b)=>this.mapDistance(a,target)-this.mapDistance(b,target))[0];
     if(waypoint){const d=this.mapDistance(merc,waypoint);if(d>0){merc.x+=(waypoint.x-merc.x)*Math.min(d,step)/d;merc.y+=(waypoint.y-merc.y)*Math.min(d,step)/d;}}
    }
   }else if(!merc.hitTowerIds.includes(target.id)&&now-merc.lastCharge>=OBJECTIVE_RULES_V45.herald.chargeCooldown){
    // One impact per tower, never a loop of repeated charges into one tower.
    // Patch 26.1: every subsequent tower collision deals 2/3 of the previous
    // charge's damage, while remaining the first charge against that tower.
    const chargeDamage=OBJECTIVE_RULES_V45.herald.chargeDamage*Math.pow(2/3,merc.charges||0);
    const dealt=this.damage(target,chargeDamage,
     {team:merc.team},'true','herald_charge');
    merc.lastCharge=now;merc.charges++;merc.hitTowerIds.push(target.id);
    merc.hp=Math.max(0,Math.ceil(merc.hp*.34)); // Charge costs ~66% of current HP.
    this.event(`Arauto acertou ${target.name||target.id} (${Math.round(dealt)} de dano).`,merc.team,'herald_charge');
    if(merc.hp<=0)merc.expiresAt=now-1;
   }else if(merc.hitTowerIds.includes(target.id)&&now-(merc.lastBasicAttack??-999)>=OBJECTIVE_RULES_V45.herald.mercenaryAttackInterval){
    // After charging, continue attacking the SAME tower until it falls.
    this.damage(target,OBJECTIVE_RULES_V45.herald.mercenaryBasicDamage,{team:merc.team},'physical','herald_basic');
    merc.lastBasicAttack=now;
   }
  }
  this.heraldMercenariesV45=this.heraldMercenariesV45.filter(m=>now<=m.expiresAt&&m.hp>0);
  // Minion and turret death handling is shared with the existing engine.
  this.finishStructureDeathsV451();
 }

 monsterRetaliate(c){
  if(!c.alive||c.leashState!=='engaged'||(c.monsterAttackAt||0)>this.gameTime)return;
  const cfg=this.campProfile(c);if(cfg.attack<=0)return;
  const possible=this.units.filter(u=>u.hp>0&&this.mapDistance(u,c)<=cfg.leash);
  if(!possible.length)return;
  // Nearest *present* unit gets aggro; do not favor whichever faction iterates first.
  possible.sort((a,b)=>this.mapDistance(a,c)-this.mapDistance(b,c)||a.id.localeCompare(b.id));
  const target=possible[0];c.aggroId=target.id;
  this.damage(target,Math.round(cfg.attack+((c.campLevel||1)-1)*1.7),null);
  c.monsterAttackAt=this.gameTime+2;
 }
 updateObjectives(){for(const c of this.camps){
  const original=this.map.objects.find(o=>o.id===c.objectId)||this.map.objects.find(o=>o.id===c.id?.replace('camp_',''));
  if(!original)continue;
  c.x=original.x;c.y=original.y;
  const timer=c.timerKey||c.id,cfg=this.campProfile(c),phase=OBJECTIVE_PHASES_V44[timer];
  if(timer==='herald'&&this.riftV452d4.mode==='swiftplay'){c.alive=false;c.respawnAt=Number.MAX_SAFE_INTEGER;continue;}
  if(phase?.once){
   if(c.exhaustedV44)continue;
   if(this.gameTime>=phase.leave){c.alive=false;c.health=0;c.exhaustedV44=true;continue;}
  }
  const soulAt=this.teams.blue.soulAt||this.teams.red.soulAt;
  const initialSpawn=timer==='dragon'&&soulAt?Math.max(300,soulAt+360):cfg.spawn;
  if(timer==='dragon')c.dragonKind=soulAt?'elder':'elemental';
  if(!c.alive){
   if(this.gameTime<initialSpawn||this.gameTime<(c.respawnAt||0))continue;
   this.spawnCamp(c);
  }
  if(!(c.maxHealth>0))c.maxHealth=c.health||cfg.baseHp;
  const fighters=this.units.filter(u=>u.hp>0&&!u.awaitingShop&&
   this.combatCampTarget(u)===c.id&&
   this.mapDistance(u,c)<=Math.max(510,Math.min(900,u.range*this.worldWidth)));
  this.advanceCampLeash(c,fighters);
  if(c.leashState==='soft'||c.leashState==='hard'){if(timer==='voidgrubs')c.neutralMitesV45=[];continue;}
  if(timer==='voidgrubs'&&c.leashState==='engaged')this.advanceNeutralMitesV45(c);
  if(!fighters.length){this.monsterRetaliate(c);continue;}
  if(this.maybePauseSmiteContestV452d4Dev9(c,fighters))return;
  let finisher=null,winningSmite=null;
  // V4.4: Smite is NOT gated by AA cooldown or by whether a basic attack
  // succeeds. Commit and resolve Smite and AA as separate simultaneous phases.
  const openingHP=c.health,smiteImpacts=[],attackImpacts=[];
  const forced=c.smiteForcedV452d4Dev9;
  if(forced){delete c.smiteForcedV452d4Dev9;
   for(const impact of forced.impacts){const actor=this.units.find(u=>u.id===impact.actorId);
    if(actor){smiteImpacts.push({u:actor,hit:impact.hit,kind:'smite'});c.damageByActorV44??={};
     c.damageByActorV44[actor.id]=(c.damageByActorV44[actor.id]||0)+impact.hit;}}
  }
  const ordered=[...fighters].sort((a,b)=>a.id.localeCompare(b.id));
  if(new Set(ordered.map(u=>u.team)).size>1)c.contestedTicksV44=(c.contestedTicksV44||0)+1;
  for(const u of ordered){
   // Smite range is 500 world units even if the champion has a longer AA.
   if(this.mapDistance(u,c)>500)continue;
   if(forced&&(u.id===this.smiteContestV452d4Dev9?.blueId||u.id===this.smiteContestV452d4Dev9?.redId))continue;
   if(u.id===this.smiteContestV452d4Dev9?.blueId&&c.smiteManualHoldV452d4Dev9===this.smiteContestV452d4Dev9?.key)continue;
   const hit=this.useSmite(u,c);
   if(hit>0){smiteImpacts.push({u,hit,kind:'smite'});c.damageByActorV44??={};
    c.damageByActorV44[u.id]=(c.damageByActorV44[u.id]||0)+hit;}
  }
  // All simultaneous Smites are evaluated against the SAME opening HP.
  const smiteTotal=smiteImpacts.reduce((sum,p)=>sum+p.hit,0);
  if(timer!=='voidgrubs'&&smiteTotal>=openingHP&&smiteImpacts.length){
   const verdict=resolveSimultaneousSmiteV452d4Dev9(openingHP,smiteImpacts.map(x=>({actorId:x.u.id,hit:x.hit})));
   winningSmite=smiteImpacts.find(x=>x.u.id===verdict.winner?.actorId)||null;
   finisher=winningSmite.u;
  }
  // If Smite secures the monster, normal attacks cannot retroactively steal it.
  if(!finisher)for(const u of ordered){
   if((u.jungleAttackAt||0)>this.gameTime)continue;
   const aa=this.performActionV40({actorId:u.id,kind:'jungle_attack',point:{x:c.x,y:c.y},campId:c.id,
    source:'jungle',checkRange:false,cooldownOverride:Math.max(1,Math.ceil(u.atkSpeed))});
   if(!aa.ok)continue;
   let hit=Math.round((this.elementalStatsV452d3(u).ad*.72+16+u.level*3)*( ['krugs','raptors','wolves'].includes(timer)?CAMP_DAMAGE_BALANCE.clusteredMonsterMultiplier:CAMP_DAMAGE_BALANCE.soloMonsterMultiplier));
   if(u.role==='JG'&&u.junglePet){hit+=Math.round((20+u.level*3+Math.max(0,u.ap)*.16)*CAMP_DAMAGE_BALANCE.petBonusDpsMultiplier);this.effectResolverV41().heal(u,Math.round(4+u.level*.65),u);}
   const qRank=u.skillRanks?.Q||0;
   if(qRank>0&&(u.skillCds?.Q||0)<=this.gameTime&&u.mana>=45){
    const cast=this.performActionV40({actorId:u.id,kind:'skill',slot:'Q',costOverride:45,cooldownOverride:hasteCooldown(9,this.elementalStatsV452d3(u).abilityHaste+(u.basicHaste||0)),source:'jungle_training',checkRange:false});
    if(cast.ok)hit+=Math.round(u.skillPower*(.27+.10*qRank));
   }
   attackImpacts.push({u,hit,kind:'attack'});c.aggroId=u.id;c.lastFoughtAt=this.gameTime;
   c.damageByActorV44??={};c.damageByActorV44[u.id]=(c.damageByActorV44[u.id]||0)+hit;
  }
  const attackTotal=attackImpacts.reduce((sum,p)=>sum+p.hit,0);
  if(timer==='voidgrubs'){
   this.resolveVoidgrubsV45(c,[...smiteImpacts,...attackImpacts]);
   if(c.alive)this.monsterRetaliate(c);
   continue;
  }
  c.health=Math.max(0,openingHP-smiteTotal-attackTotal);
  let noSmitePitVerdict=null;
  if(c.health<=0&&!finisher){
   // Weighted tie-break is ONLY for a contested, lethal objective tick, with
   // both junglers in the pit but neither having usable Smite. No RNG before
   // the final tick and no RNG if either team actually casts a Smite.
   noSmitePitVerdict=this.noSmitePitResultV452d4Dev9(c,smiteImpacts,attackImpacts);
   finisher=noSmitePitVerdict?.finisher||
    [...attackImpacts].sort((a,b)=>b.hit-a.hit||a.u.id.localeCompare(b.u.id))[0]?.u||
    [...smiteImpacts].sort((a,b)=>b.hit-a.hit||a.u.id.localeCompare(b.u.id))[0]?.u||null;
  }
  if(c.health>0){this.monsterRetaliate(c);continue;}
  if(finisher){
   const owner=finisher.team,chosen=[finisher],epic=['dragon','baron','herald','voidgrubs'].includes(timer);
   c.alive=false;c.health=0;c.leashState='idle';c.aggroId=null;
   c.lastClearedAt=this.gameTime;c.lastClearTeam=owner;c.respawnAt=this.gameTime+cfg.respawn;
   if(phase?.once)c.exhaustedV44=true;
   const participants=this.units.filter(u=>u.hp>0&&u.team===owner&&
    this.mapDistance(u,c)<=OBJECTIVE_REWARD_V44.participationRadius&&
    (u.id===finisher.id||(c.damageByActorV44?.[u.id]||0)>0));
   if(epic)for(const mid of participants.filter(u=>u.role==='MID'))this.b7MidQuestAdd(mid,30,'epic_takedown');
   this.objectiveLedgerV44??=[];
   this.objectiveLedgerV44.push({time:this.gameTime,objective:timer,owner,finisherId:finisher.id,
    participants:participants.map(u=>u.id),contested:(c.contestedTicksV44||0)>0,
    smiteSecured:!!winningSmite,smiteActorId:winningSmite?.u.id||null,
    noSmitePitRoll:noSmitePitVerdict?{blue:noSmitePitVerdict.blue,red:noSmitePitVerdict.red,
     blueProbability:noSmitePitVerdict.blueProbability,roll:noSmitePitVerdict.roll}:null,
    damageByActor:{...(c.damageByActorV44||{})}});
   this.objectiveLedgerV44=this.objectiveLedgerV44.slice(-100);
   for(const viewer of ['blue','red'])if(this.canSeePoint(viewer,c)){this.campKnowledge[viewer][c.id]={respawnAt:c.respawnAt,observedAt:this.gameTime};}
   if(noSmitePitVerdict)this.event(`Disputa sem Golpear: ${noSmitePitVerdict.blue} Azul × ${noSmitePitVerdict.red} Vermelho; sorteio ponderado (${Math.round(noSmitePitVerdict.blueProbability*100)}% Azul).`,null,'objective');
   if(epic){
    // Capture is globally announced; participants, hidden Smite plans and
    // per-player damage remain visible only to their owning team.
    this.event(`${owner==='blue'?'Azul':'Vermelho'} derrotou ${timer==='dragon'?'Dragão':timer==='baron'?'Barão Na’Shor':timer==='herald'?'Arauto':'Vastilarvas'}.`,null,'objective');
   }else this.event(`${owner==='blue'?'Azul':'Vermelho'} limpou ${original.name||original.id} (+ouro/XP; campo em recarga).`,owner,'jungle');
   for(const u of fighters){const st=this.activeStage(u);if(st?.action==='jungle'&&st?.targetId===c.id)st.campCleared=true;}
   const count={krugs:6,raptors:6,wolves:3,red:1,blue:1,gromp:1,scuttle:1,voidgrubs:3}[timer]||1;
   for(const u of chosen){this.creditGoldV452d4Dev7(u,timer==='baron'?350:timer==='dragon'?210:(u.role==='JG'&&u.junglePet?105:85),'camp');
    u.cs+=count;this.gainXP(u,(timer==='baron'?650:timer==='dragon'?440:timer==='krugs'||timer==='raptors'?220:175)*(u.role==='JG'&&u.junglePet?1.12:1));
    if(u.role==='JG'&&u.junglePet&&!['baron','dragon','herald'].includes(timer))this.feedJunglePet(u);
    if(u.jungleBuff==='mosstomper')u.shield=Math.max(u.shield,80+u.level*8);
    if(u.jungleBuff==='gustwalker')u.jungleSpeedUntil=this.gameTime+15;
    if(u.junglePet&&u.smiteTier===3){this.creditGoldV452d4Dev7(u,10,'pet_bonus');this.gainXP(u,10);}
    this.event(`${u.champ} limpou ${timer}: +${count} CS e XP.`,u.team,'jungle_cs',u.id);
   }
   // Only allies who actually participated and stayed close receive the
   // training assist. No globally distributed gold from an unseen objective.
   if(epic)for(const ally of participants.filter(v=>v.id!==finisher.id)){
    this.creditGoldV452d4Dev7(ally,OBJECTIVE_REWARD_V44.allyAssistGold,'epic_assist');
    this.recordEconomyV43(ally,'epic_assist',OBJECTIVE_REWARD_V44.allyAssistGold,timer);
    this.gainXP(ally,OBJECTIVE_REWARD_V44.allyAssistXP);
   }
   if(timer==='voidgrubs')this.teams[owner].voidgrubs=Math.min(3,(this.teams[owner].voidgrubs||0)+3);
   if(timer==='herald'){
    this.teams[owner].heralds=(this.teams[owner].heralds||0)+1;
    this.heraldEyeV45={owner,x:c.x,y:c.y,dropAt:this.gameTime,
     expiresAt:this.gameTime+OBJECTIVE_RULES_V45.herald.eyePickupSeconds,holderId:null};
    this.event('Olho do Arauto disponível para coleta da equipe vencedora.',owner,'herald_eye');
   }
   if(timer==='baron')this.grantBaronV452d4Dev14(owner);
   if(timer==='dragon'){
    if(c.dragonKind==='elder'){this.grantElderV452d4Dev14(owner);
     c.respawnAt=this.gameTime+360;this.event(`Dragão Ancião: execução ativa para ${owner} (modelo simplificado).`);}
    else{const el=this.nextDragonElementV452d4();this.awardElementalDragonV452d3(owner,el,{captureId:c.id+':'+c.spawnCycle,sourceId:finisher.id});
     this.event(`Dragão elemental: ${el} para ${owner}.`);

    }
   }
  }
 }}

}
function prepareLine(points){let path=points.map(ppoint),lens=[0],total=0;for(let i=1;i<path.length;i++){total+=dist(path[i],path[i-1]);lens.push(total)}return {path,lens,total};}
function sampleLine(line,t){let d=clamp(t,0,1)*line.total,i=1;while(i<line.lens.length-1&&line.lens[i]<d)i++;let from=line.path[i-1]||line.path[0],to=line.path[i]||from,div=Math.max(.00001,line.lens[i]-line.lens[i-1]),f=(d-line.lens[i-1])/div;return {x:from.x+(to.x-from.x)*f,y:from.y+(to.y-from.y)*f}}
function compress(pts){if(pts.length<3)return pts;let out=[pts[0]];for(let i=1;i<pts.length-1;i++){let a=out.at(-1),b=pts[i],c=pts[i+1],cross=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);if(Math.abs(cross)>0.00001)out.push(b)}out.push(pts.at(-1));return out}
export const utils={sampleLine,dist,compress};
