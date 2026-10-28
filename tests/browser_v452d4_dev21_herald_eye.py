from pathlib import Path
import base64, io, json, re, shutil
from PIL import Image
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / 'docs' / 'QA_EVIDENCE_V452D4_DEV21'
out.mkdir(parents=True, exist_ok=True)
icons = root / 'assets' / 'ui' / 'map_cc0_v452d4_dev16'
manifest = json.loads((icons / 'manifest.json').read_text('utf-8'))
icon_uris = {Path(n).stem:'data:image/svg+xml;base64,'+base64.b64encode((icons/n).read_bytes()).decode('ascii') for n in manifest['files']}
base=Image.open(root/'assets/user_rift_masks_20261026/mapa_atualizado.jpg').convert('RGB')
base.thumbnail((1350,1350))
buf=io.BytesIO();base.save(buf,format='JPEG',quality=82)
atlas={'assets/user_rift_masks_20261026/mapa_atualizado.jpg':'data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode('ascii')}
html=(root/'index.html').read_text('utf-8')
def css(m):
    tag=m.group(0);q=re.search(r'href="([^"]+)"',tag);f=root/q.group(1) if q else None
    return '<style>\n'+f.read_text('utf-8')+'\n</style>' if f and f.exists() else tag
def js(m):
    f=root/m.group(1)
    if not f.exists():return m.group(0)
    source=f.read_text('utf-8')
    if f.name=='app.js':
        assert source.rstrip().endswith('})();')
        source=source.replace("img.src='assets/ui/map_cc0_v452d4_dev16/'+key+'.svg'", "img.src=window.__dev21IconURIs[key]")
        source=source.replace("if(image.src&&!image.src.endsWith(path))", "if(image.src&&!image.src.endsWith(path)&&image.src!==(window.__dev21AtlasData?.[path]||path))")
        source=source.replace('image.src=path;', 'image.src=(window.__dev21AtlasData?.[path]||path);')
        source=source.rstrip()[:-5]+'''
  window.__dev21={get match(){return match},get image(){return image},get sprites(){return MAP_CC0_ART_V452D4_DEV16},get selected(){return selected},requestDraw,render,worldScreen,choose,get camera(){return camera}};
  })();'''
    return '<script>\n'+source+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',js,html)
html=html.replace('</head>','<script>window.__dev21IconURIs='+json.dumps(icon_uris)+';window.__dev21AtlasData='+json.dumps(atlas)+';</script></head>')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security','--disable-gpu'])
    page=browser.new_page(viewport={'width':1500,'height':950},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('typeof window.__dev21==="object"',timeout=60000)
    report=page.evaluate('''() => {
      const api=window.__dev21, a=api.match, u=a.units.find(x=>x.id==='blue_ADC');
      a.phase='executing';a.gameTime=1200;
      for(const v of a.units){v.x=v.team==='blue'?.05:.95;v.y=v.team==='blue'?.05:.95;v.attackAt=999999;}
      u.hp=u.maxHp;u.x=.5-300/a.worldWidth;u.y=.5;u.attackAt=0;u.autoAttack=true;
      const merc={id:'dev21_red_herald',team:'red',lane:'mid',x:.5,y:.5,hp:5000,maxHp:5000,
       facingX:1,facingY:0,armor:90,mr:60,spawnAt:1150,expiresAt:1600,
       lastCharge:-999,lastBasicAttack:-999,charges:0,hitTowerIds:[],eyeReadyAtV452d4Dev21:1200};
      a.heraldMercenariesV45=[merc];a.minions=[];a.visionCache={};
      api.camera.zoom=1.42;api.camera.px=0;api.camera.py=12;api.camera.angle=0;api.camera.tilt=.55;
      api.choose(u);api.requestDraw();return {target:api.worldScreen(merc.x,merc.y),hp:merc.hp};
    }''')
    page.wait_for_timeout(1100)
    states=page.evaluate('''() => ({icons:Object.values(window.__dev21.sprites).filter(x=>x.complete&&x.naturalWidth>0).length,mapLoaded:window.__dev21.image.complete&&window.__dev21.image.naturalWidth>0})''')
    assert states['icons']==15 and states['mapLoaded'],states
    page.screenshot(path=str(out/'herald_eye_open_chromium.png'),full_page=False)
    rect=page.locator('#board').bounding_box()
    assert rect, 'Map board missing'
    page.mouse.click(rect['x']+report['target']['x'],rect['y']+report['target']['y'])
    result=page.evaluate('''() => {
      const a=window.__dev21.match,u=a.units.find(x=>x.id==='blue_ADC');
      const h=a.heraldMercenariesV45[0],ordered=u.order.kind==='attack_herald';
      const before=h.hp;a.resolveCombat();window.__dev21.requestDraw();
      return {ordered,before,after:h.hp,eyeHits:h.eyeHitsV452d4Dev21,eyeReadyAt:h.eyeReadyAtV452d4Dev21};
    }''')
    assert result['ordered'],result
    assert result['after']<result['before']-1800,result
    assert result['eyeHits']==1,result
    page.wait_for_timeout(250)
    page.screenshot(path=str(out/'herald_eye_hit_chromium.png'),full_page=False)
    assert not errors,errors
    (out/'chromium_herald_eye.json').write_text(json.dumps({'fixture':'real app/engine in Chromium with authored source atlas and 15 actual SVG assets inlined; controlled local fight, NOT a full match','result':result,'assets':states,'javascript_errors':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('DEV21 Chromium PASS',result,states,'0 JavaScript errors')
    browser.close()
