"""Chromium smoke: real inline app/engine and local CC0/svg atlas, controlled Oracle LOS."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, io, json, re, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV28';out.mkdir(parents=True,exist_ok=True)
icons=root/'assets'/'ui'/'map_cc0_v452d4_dev16'
manifest=json.loads((icons/'manifest.json').read_text('utf8'))
icon_uris={Path(n).stem:'data:image/svg+xml;base64,'+base64.b64encode((icons/n).read_bytes()).decode('ascii') for n in manifest['files']}
base=Image.open(root/'assets/user_rift_masks_20261026/mapa_atualizado.jpg').convert('RGB');base.thumbnail((1150,1150))
b=io.BytesIO();base.save(b,format='JPEG',quality=79)
atlas={'assets/user_rift_masks_20261026/mapa_atualizado.jpg':'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode('ascii')}
html=(root/'index.html').read_text('utf8')
def css(m):
    q=re.search(r'href="([^"]+)"',m.group(0));f=root/q.group(1) if q else None
    return '<style>\n'+f.read_text('utf8')+'\n</style>' if f and f.exists() else m.group(0)
def js(m):
    f=root/m.group(1)
    if not f.exists():return m.group(0)
    source=f.read_text('utf8')
    if f.name=='app.js':
        assert source.rstrip().endswith('})();')
        source=source.replace("img.src='assets/ui/map_cc0_v452d4_dev16/'+key+'.svg'","img.src=window.__dev28Icons[key]")
        source=source.replace('image.src=path;','image.src=(window.__dev28Atlas[path]||path);')
        source=source.replace('if(image.src&&!image.src.endsWith(path))', 'if(image.src&&!image.src.endsWith(path)&&image.src!==(window.__dev28Atlas[path]||path))')
        source=source.rstrip()[:-5]+'''\n  window.__dev28={get match(){return match},get sprites(){return MAP_CC0_ART_V452D4_DEV16},get image(){return image},requestDraw,render,choose};\n  })();'''
    return '<script>\n'+source+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',js,html)
html=html.replace('</head>','<script>window.__dev28Icons='+json.dumps(icon_uris)+';window.__dev28Atlas='+json.dumps(atlas)+';</script></head>')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('window.__dev28 && window.__dev28.image.complete',timeout=60000)
    report=page.evaluate('''() => {
      const api=window.__dev28,a=api.match;
      const wallPoint={x:.94140625,y:.02734375},hiddenPoint={x:.894,y:.04};
      a.gameTime=1200;a.phase='executing';
      const u=a.units.find(x=>x.id==='blue_JG');u.x=wallPoint.x;u.y=wallPoint.y;u.hp=u.maxHp;u.trinket='oracle';u.oracleCd=0;
      const mk=(id,team,type,pt)=>({id,team,type,owner:team+'_TOP',x:pt.x,y:pt.y,hp:4,maxHp:4,until:null,disabledUntil:0});
      a.wards=[mk('red_secret','red','stealth',hiddenPoint)];
      api.choose(u);
      const knownBefore=a.perspective('blue').wards.some(w=>w.id==='red_secret');
      const action=a.activateOracle('blue',u.id);
      if(!action.ok)throw Error(action.reason);
      const knownBehindWall=a.perspective('blue').wards.some(w=>w.id==='red_secret');
      const oracleSuppressedBehindWall=a.wardVisionSuppressedV452d4Dev26(a.wards[0]);
      const normalVisionBehindWall=a.canSeePoint('blue',hiddenPoint);
      const pink=a.wards.push(mk('blue_pink','blue','control',wallPoint));
      u.oracleUntil=0;
      const knownByPinkBehindWall=a.perspective('blue').wards.some(w=>w.id==='red_secret');
      a.wards.pop();u.oracleUntil=action.until;
      u.x=hiddenPoint.x;u.y=hiddenPoint.y;
      const knownNearTarget=a.perspective('blue').wards.some(w=>w.id==='red_secret');
      const enemyProjection=a.perspective('blue').wards.find(w=>w.id==='red_secret');
      api.requestDraw();api.render();
      return {knownBefore,knownBehindWall,oracleSuppressedBehindWall,normalVisionBehindWall,knownByPinkBehindWall,knownNearTarget,enemyFields:Object.keys(enemyProjection||{}).sort(),spriteCount:Object.values(api.sprites).filter(x=>x.complete&&x.naturalWidth>0).length,mapLoaded:api.image.complete&&api.image.naturalWidth>0};
    }''')
    assert report['knownBefore'] is False,report
    assert report['knownBehindWall'] is True,report
    assert report['oracleSuppressedBehindWall'] is True,report
    assert report['normalVisionBehindWall'] is False,report
    assert report['knownByPinkBehindWall'] is False,report
    assert report['knownNearTarget'] is True,report
    assert report['enemyFields']==sorted(['id','team','type','x','y','hp','maxHp']),report
    page.wait_for_timeout(500)
    report['spriteCount']=page.evaluate('''() => Object.values(window.__dev28.sprites).filter(x=>x.complete&&x.naturalWidth>0).length''')
    assert report['spriteCount']==15 and report['mapLoaded'],report
    assert not errors,errors
    shot=out/'oracle_wall_detection_chromium.png';page.screenshot(path=str(shot),full_page=False)
    (out/'chromium_oracle_wall_smoke.json').write_text(json.dumps({'status':'PASS','scope':'Actual offline game engine / map assets inlined in isolated Chromium controlled fixture; NOT a full organic match','results':report,'javascriptErrors':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('PASS Chromium Oracle THROUGH wall, pink BLOCKED, team privacy / 15 SVG atlas; image',shot)
    browser.close()
