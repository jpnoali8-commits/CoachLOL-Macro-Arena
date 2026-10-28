from pathlib import Path
import base64,io,re,shutil,json
from PIL import Image
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV25'
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
  window.__dev17={get match(){return match},get image(){return image},get iconImages(){return MAP_CC0_ART_V452D4_DEV16},
  get renderStatus(){return renderStatus},requestDraw,render,worldScreen,screenWorld,choose,get camera(){return camera}};
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
    page.wait_for_function('typeof window.__dev17==="object"',timeout=60000)
    first=page.evaluate("""() => {
      const api=window.__dev17,a=api.match;
      a.phase='planning';a.gameTime=1200;
      const tower=a.structures.find(s=>s.id==='red_mid_t1');
      const holder=a.units.find(u=>u.id==='blue_MID');
      for(const u of a.units)u.hp=0;
      holder.hp=holder.maxHp;holder.x=.485;holder.y=.5;
      holder.baronBuffUntilV452=1400;
      a.minions=[];
      const m={id:'dev17_siege_live',team:'blue',lane:'mid',kind:'siege',progress:0,x:.485,y:.5,
        hp:835,maxHp:835,damage:48,range:.055,speed:.012,interval:2,attackAt:0,spawnAt:0};
      m.progress=a.lineProgress(a.lanes.mid,m);a.minions=[m];
      api.camera.zoom=1.42;api.camera.px=0;api.camera.py=0;api.camera.angle=.18;api.camera.tilt=.52;
      api.choose(holder);api.renderStatus();api.requestDraw();
      return {towerHp:tower.hp,towerId:tower.id,baron:a.baronMinionModifiersV452d(m).empowered};
    }""")
    assert first['baron'] is True,first
    page.wait_for_timeout(900)
    start=out/'baron_siege_start_chromium.png'
    page.screenshot(path=str(start),full_page=False)
    result=page.evaluate("""() => {
      const api=window.__dev17,a=api.match,holder=a.units.find(u=>u.id==='blue_MID');
      const tower=a.structures.find(s=>s.id==='red_mid_t1'),rows=[];
      for(let i=0;i<8;i++){
       const m=a.minions.find(u=>u.id==='dev17_siege_live');if(!m)break;
       holder.x=m.x;holder.y=m.y;
       a.buildMinionIndex();a.moveMinions();a.buildMinionIndex();a.resolveCombat();
       rows.push({time:a.gameTime,towerHp:tower.hp,hp:m.hp,
         distance:Math.round(a.mapDistance(m,tower)),range:Math.round(m.range*a.worldWidth+a.baronMinionModifiersV452d(m).bonusRange+(tower.radius||0)*a.worldWidth/a.map.sourceMasks.dimensions[0])});
       a.gameTime++;
      }
      api.renderStatus();api.requestDraw();
      return {rows,damage:9000-tower.hp,alive:a.minions.length,
        validRangeOnHits:rows.every((row,i)=>i===0||row.towerHp>=rows[i-1].towerHp||row.distance<=row.range+25)};
    }""")
    assert result['damage']>0,result
    assert result['validRangeOnHits'],result
    page.wait_for_timeout(1300)
    art=page.evaluate("""() => {
      const all=Object.entries(window.__dev17.iconImages).map(([key,img])=>({key,ready:img.complete&&img.naturalWidth>0}));
      return {loaded:all.length,mapLoaded:window.__dev17.image.naturalWidth>0,allReady:all.every(x=>x.ready)};
    }""")
    assert art['loaded']==15 and art['allReady'] and art['mapLoaded'],art
    assert not errs,errs
    end=out/'baron_siege_after_8_ticks_chromium.png'
    page.screenshot(path=str(end),full_page=False)
    (out/'baron_siege_chromium_report.json').write_text(json.dumps({
      'type':'Chromium actual UI, controlled eight-tick motor sequence (not organic complete match)',
      'first':first,'result':result,'assets':art,'jsErrors':errs
    },ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('DEV25 Chromium PASS',result,'15/15 sprites + atlas, 0 JS errors; screenshots:',start,end)
    browser.close()
