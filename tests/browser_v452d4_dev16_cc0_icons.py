from pathlib import Path
import base64,io,re,shutil,json
from PIL import Image
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV16'
out.mkdir(parents=True,exist_ok=True)
icon_dir=root/'assets/ui/map_cc0_v452d4_dev16'
manifest=json.loads((icon_dir/'manifest.json').read_text(encoding='utf8'))
icon_uris={Path(n).stem:'data:image/svg+xml;base64,'+base64.b64encode((icon_dir/n).read_bytes()).decode('ascii') for n in manifest['files']}
# Inlined screenshot fixture uses a downscaled ORIGINAL atlas photo so all
# map imagery remains part of a real Chromium render without local URL access.
base=Image.open(root/'assets/user_rift_masks_20261026/mapa_atualizado.jpg').convert('RGB')
base.thumbnail((1350,1350))
buf=io.BytesIO();base.save(buf,format='JPEG',quality=81)
map_data={'assets/user_rift_masks_20261026/mapa_atualizado.jpg':'data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode('ascii')}
html=(root/'index.html').read_text(encoding='utf8')
def inline_css(m):
    tag=m.group(0);q=re.search(r'href="([^"]+)"',tag)
    f=root/q.group(1) if q else None
    return '<style>\n'+f.read_text(encoding='utf8')+'\n</style>' if f and f.exists() else tag

def inline_script(m):
    f=root/m.group(1)
    if not f.exists():return m.group(0)
    js=f.read_text(encoding='utf8')
    if f.name=='app.js':
        assert js.rstrip().endswith('})();')
        old="img.src='assets/ui/map_cc0_v452d4_dev16/'+key+'.svg'"
        assert old in js
        js=js.replace(old,"img.src=window.__dev16IconURIs[key]")
        js=js.replace("if(image.src&&!image.src.endsWith(path))", "if(image.src&&!image.src.endsWith(path)&&image.src!==(window.__dev16AtlasData?.[path]||path))")
        js=js.replace('image.src=path;', 'image.src=(window.__dev16AtlasData?.[path]||path);')
        js=js.rstrip()[:-5]+"""
  window.__dev16={get match(){return match},get image(){return image},get iconImages(){return MAP_CC0_ART_V452D4_DEV16},
  requestDraw,render,worldScreen,screenWorld,choose,get camera(){return camera}};
  })();"""
    return '<script>\n'+js+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
prelude='<script>window.__dev16IconURIs='+json.dumps(icon_uris)+';window.__dev16AtlasData='+json.dumps(map_data)+';</script>'
html=html.replace('</head>',prelude+'</head>')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security','--disable-gpu'])
    page=browser.new_page(viewport={'width':1500,'height':950},device_scale_factor=1)
    errs=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('typeof window.__dev16==="object"',timeout=60000)
    # Setup a controlled board: real paths, authoritative wards, real Baron aura.
    report=page.evaluate('''() => {
     const api=window.__dev16,a=api.match;
     a.gameTime=1200;
     const ally=a.units.filter(x=>x.team==='blue');
     ally.forEach((u,i)=>{u.x=.42+(i%3)*.035;u.y=.43+Math.floor(i/3)*.055;u.hp=u.maxHp;});
     const blue=ally[0];blue.x=.435;blue.y=.47;blue.wardCharges=3;blue.controlWardStock=2;
     const w1=a.addWard('blue',blue.id,{x:.415,y:.47},'stealth');
     const w2=a.addWard('blue',blue.id,{x:.455,y:.47},'control');
     a.riftBaseFeaturesV452d4.plants=[
       {id:'dev16_blast',kind:'blast_cone',x:.43,y:.55,radius:.03,landingDistance:.052,respawnSeconds:90},
       {id:'dev16_honey',kind:'honeyfruit',x:.50,y:.55,radius:.015,respawnSeconds:90}];
     a.riftBaseFeaturesV452d4.scryers=[{id:'dev16_scryer',kind:'scryer_bloom',x:.57,y:.55,unlockMode:'base'}];
     a.riftPlantTimersV452d4={};
     a.riftV452d4.phase='active';a.riftV452d4.element='hextech';a.riftV452d4.revision=1600;
     a.riftBundlesV452d4.hextech ??= {features:{}};
     a.riftBundlesV452d4.hextech.features ??= {};
     a.riftBundlesV452d4.hextech.features.hexgates=[
       {id:'dev16_hex_a',pairId:'dev16_hex_b',x:.63,y:.55},
       {id:'dev16_hex_b',pairId:'dev16_hex_a',x:.68,y:.55}];
     blue.baronBuffUntilV452=a.gameTime+160;
     a.minions=[];
     const coords=[['melee','.46','.43'],['caster','.495','.43'],['siege','.53','.43'],['super','.565','.43']];
     for(const [team,dy] of [['blue',0],['red',.075]])for(const [i,item] of coords.entries()){
      const [kind,sx,sy]=item;
      a.minions.push({id:'dev16_'+kind+'_'+team,kind,team,lane:'mid',x:Number(sx),y:Number(sy)+dy,
        hp:400,maxHp:400,armor:10,range:.035,damage:40,spawnAt:0,speed:.001,progress:.5});
     }
     a.visionCache={};
     api.camera.zoom=1.4;api.camera.px=0;api.camera.py=12;api.camera.angle=.26;api.camera.tilt=.56;
     api.choose(blue);api.requestDraw();
     return {ward1:w1.ok,ward2:w2.ok,baron:a.baronMinionModifiersV452d(a.minions[0]).empowered,
       rendered:a.riftAllFeaturesV452d4('plants').length};
    }''')
    assert report['ward1'] and report['ward2'],report
    assert report['baron'] is True,report
    assert report['rendered']==2,report
    page.wait_for_timeout(1600)
    # CSS/images must really load, not only fall back to placeholder circles.
    sprite_state=page.evaluate('''() => {
      const art=window.__dev16.iconImages;
      const all=Object.entries(art).map(([key,img])=>({key,loaded:img.complete&&img.naturalWidth>0}));
      return {images:all,loadedAll:all.length===15&&all.every(x=>x.loaded),mapLoaded:window.__dev16.image.complete&&window.__dev16.image.naturalWidth>0};
    }''')
    assert sprite_state['loadedAll'],sprite_state
    assert not errs,errs
    screenshot=out/'cc0_icons_map_actual_chromium.png'
    page.screenshot(path=str(screenshot),full_page=False)
    (out/'chromium_state.json').write_text(json.dumps({'report':report,'assets':sprite_state,'javascript_errors':errs,'fixture':'controlled, inlined original SVG files and downsampled source atlas, not full match'},indent=2),encoding='utf8')
    print('DEV16 Chromium PASS', report, sprite_state,'screenshot',screenshot)
    browser.close()
