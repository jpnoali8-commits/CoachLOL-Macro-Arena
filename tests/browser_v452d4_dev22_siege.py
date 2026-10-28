from pathlib import Path
import base64,io,re,shutil,json
from PIL import Image
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV22'
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
  window.__dev22={get match(){return match},get image(){return image},get iconImages(){return MAP_CC0_ART_V452D4_DEV16},
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
    errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function('typeof window.__dev22 === "object"',timeout=60000)
    result=page.evaluate("""() => {
      const api=window.__dev22,a=api.match;
      a.phase='planning';a.gameTime=1480;
      const mid=a.lanes.mid,at=(v)=>{
        const progress=v*mid.total;
        for(let i=1;i<mid.path.length;i++)if(mid.lens[i]>=progress){const f=(progress-mid.lens[i-1])/(mid.lens[i]-mid.lens[i-1]);
          return {x:mid.path[i-1].x+(mid.path[i].x-mid.path[i-1].x)*f,y:mid.path[i-1].y+(mid.path[i].y-mid.path[i-1].y)*f};}
        return mid.path.at(-1);
      };
      for(const id of ['red_mid_t1','red_mid_t2']){const t=a.structures.find(x=>x.id===id);t.alive=false;t.hp=0;}
      for(const u of a.units){if(u.team==='red'){u.hp=0;u.deadUntil=100000;}}
      for(const role of ['MID','ADC','SUP']){const u=a.units.find(x=>x.id==='blue_'+role);const place=at(role==='MID'?.84:.81);u.x=place.x;u.y=place.y;u.hp=u.maxHp;u.autoFollow=true;u.manualMoveHold=false;u.explicitOrder=false;u.plan=null;u.awaitingShop=false;}
      a.minions=[];for(const [i,v] of [.88,.885,.89,.90,.91].entries()){const here=at(v);a.minions.push({id:'dev22_wave_'+i,team:'blue',lane:'mid',kind:i===0?'siege':'melee',x:here.x,y:here.y,progress:v,hp:500,maxHp:500,damage:48,range:.043,interval:2,attackAt:0,spawnAt:0,speed:.012});}
      const aim=a.botSiegeFocusLaneV452d4Dev22('blue');a.botPlan('blue');
      const chosen=['MID','ADC','SUP'].map(role=>a.units.find(u=>u.id==='blue_'+role)).map(u=>({id:u.id,order:u.order.kind,lane:u.botSiegeLaneV452d4Dev22}));
      api.camera.zoom=1.6;api.camera.px=-80;api.camera.py=0;api.camera.angle=0.05;api.camera.tilt=.45;
      api.choose(a.units.find(u=>u.id==='blue_MID'));api.renderStatus();api.requestDraw();
      return {focus:aim,chosen,aliveWave:a.minions.length,objective:'red_mid_t3'};
    }""")
    assert result['focus']=='mid',result
    assert all(x['lane']=='mid' for x in result['chosen']),result
    page.wait_for_timeout(1200)
    shot=out/'dev22_siege_rally_chromium.png'
    page.screenshot(path=str(shot),full_page=False)
    assets=page.evaluate("""() => {
      const api=window.__dev22;
      return {atlas:api.image.naturalWidth>0,svgLoaded:Object.values(api.iconImages).filter(i=>i.complete&&i.naturalWidth>0).length};
    }""")
    assert assets['atlas'] and assets['svgLoaded']==15,assets
    assert not errors,errors
    (out/'chromium_siege_report.json').write_text(json.dumps({'fixture':'controlled champion+wave rally, no organic full match','result':result,'assets':assets,'jsErrors':errors},ensure_ascii=False,indent=2)+'\n')
    print('DEV22 Chromium PASS',result,'15 SVGs & atlas, 0 JS errors, screenshot',shot)
    browser.close()
