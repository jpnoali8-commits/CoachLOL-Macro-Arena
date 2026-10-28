"""Chromium full offline match: same game engine and map; decisions are automated, not manually played."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, io, json, re, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V453_DEV43';out.mkdir(parents=True,exist_ok=True)
icons=root/'assets'/'ui'/'map_cc0_v452d4_dev16'
manifest=json.loads((icons/'manifest.json').read_text('utf8'))
icon_uris={Path(n).stem:'data:image/svg+xml;base64,'+base64.b64encode((icons/n).read_bytes()).decode('ascii') for n in manifest['files']}
base=Image.open(root/'assets/user_rift_masks_20261026/mapa_atualizado.jpg').convert('RGB');base.thumbnail((1150,1150))
b=io.BytesIO();base.save(b,format='JPEG',quality=79)
atlas={'assets/user_rift_masks_20261026/mapa_atualizado.jpg':'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode('ascii')}
for atlas_name in ['mapa_Ocean_atualizado.jpg','mapa_mountain_atualizado.jpg']:
    variant=Image.open(root/'assets/user_rift_masks_20261026'/atlas_name).convert('RGB');variant.thumbnail((1150,1150))
    buffer=io.BytesIO();variant.save(buffer,format='JPEG',quality=79)
    atlas['assets/user_rift_masks_20261026/'+atlas_name]='data:image/jpeg;base64,'+base64.b64encode(buffer.getvalue()).decode('ascii')
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
        source=source.rstrip()[:-5]+'''\n  window.__dev28={get match(){return match},setMatch(m){match=m},get sprites(){return MAP_CC0_ART_V452D4_DEV16},get image(){return image},requestDraw,render,renderStatus,syncEndgameFlow,choose,openShop,renderShop};\n  })();'''
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
    fired=page.evaluate("""() => {
      const a=new window.CoachArena.Arena(window.MAP_DATA,window.MASK_DATA,{seed:42,roundSeconds:10,draft:{blue:{ADC:'Ezreal',TOP:'Irelia'}}});
      window.__dev28.setMatch(a);
      const u=a.units.find(x=>x.champ==='Ezreal'),v=a.units.find(x=>x.id==='red_MID');
      Object.assign(u,{x:.5,y:.5,items:['recurve_bow'],skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},ad:100,ap:0,mana:400});
      Object.assign(v,{x:.532,y:.5,hp:1200,maxHp:1200,armor:0,mr:0,shield:400});
      a.visible=()=>true;
      const q=a.castChampionOnHitV453Dev41(u,'Q',v);
      window.__dev28.choose(u);window.__dev28.requestDraw();window.__dev28.render();
      return {q,missiles:a.championProjectilesV453Dev42.length,hp:v.hp,shield:v.shield,legacy:a.dev41CompatibilityInstantQ||false};
    }""")
    assert fired['q']['ok'] and fired['q']['pending'] and fired['missiles']==1 and fired['hp']==1200 and fired['shield']==400 and not fired['legacy'],fired
    first=out/'ezreal_q_em_voo_dev43_chromium.png';page.screenshot(path=str(first))
    impacted=page.evaluate("""() => {
      const a=window.__dev28.match,u=a.units.find(x=>x.champ==='Ezreal'),v=a.units.find(x=>x.id==='red_MID');
      a.gameTime=1;a.advanceChampionProjectilesV453Dev42();window.__dev28.requestDraw();window.__dev28.render();
      return {hp:v.hp,shield:v.shield,qcd:u.skillCds.Q,active:a.championProjectilesV453Dev42.length,
        history:a.championProjectileHistoryV453Dev42.at(-1)};
    }""")
    assert impacted['hp']==1200 and impacted['shield']==235 and impacted['qcd']==4 and impacted['active']==0,impacted
    second=out/'ezreal_q_impacto_escudo_dev43_chromium.png';page.screenshot(path=str(second))
    marked=page.evaluate("""() => {
      const a=window.__dev28.match,u=a.units.find(x=>x.champ==='Irelia'),v=a.units.find(x=>x.id==='red_TOP');
      Object.assign(u,{x:.5,y:.5,items:['recurve_bow'],skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},ad:100,mana:400});
      Object.assign(v,{x:.532,y:.5,hp:1200,maxHp:1200,armor:0,mr:0});
      a.markIreliaTargetV453Dev42(u,v,'E');const q=a.castChampionOnHitV453Dev41(u,'Q',v);
      window.__dev28.choose(u);window.__dev28.requestDraw();window.__dev28.render();
      return {q,reset:u.skillCds.Q,mark:v.ireliaMarkV453Dev42,mana:u.mana,x:u.x};
    }""")
    assert marked['q']['ok'] and marked['reset']==1.2 and marked['mark'] is None and marked['x']>.5,marked
    third=out/'irelia_q_marca_dev43_chromium.png';page.screenshot(path=str(third))
    duet=page.evaluate("""() => {
      const a=window.__dev28.match,u=a.units.find(x=>x.champ==='Irelia'),v=a.units.find(x=>x.id==='red_TOP');
      Object.assign(u,{x:.5,y:.5,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},mana:400,ap:0});
      Object.assign(v,{x:.51,y:.5,hp:1200,maxHp:1200,mr:0,shield:0,ireliaMarkV453Dev42:null,stunUntil:0});
      a.gameTime=0;const first=a.castIreliaFlawlessDuetV453Dev43(u,{x:.496,y:.5});
      a.gameTime=.2;const second=a.castIreliaFlawlessDuetV453Dev43(u,{x:.525,y:.5});
      window.__dev28.choose(u);window.__dev28.requestDraw();window.__dev28.render();
      return {first,second,pending:a.ireliaBladesV453Dev43[u.id],hp:v.hp};
    }""")
    assert duet['first']['ok'] and duet['second']['ok'] and duet['hp']==1200,duet
    fourth=out/'irelia_e_laminas_dev43_chromium.png';page.screenshot(path=str(fourth))
    converged=page.evaluate("""() => {
      const a=window.__dev28.match,u=a.units.find(x=>x.champ==='Irelia'),v=a.units.find(x=>x.id==='red_TOP');
      a.gameTime=.5;a.advanceIreliaBladesV453Dev43();
      const marked=!!v.ireliaMarkV453Dev42;const stun=v.stunUntil;
      window.__dev28.requestDraw();window.__dev28.render();
      return {hp:v.hp,marked,stun,history:a.ireliaBladeHistoryV453Dev43.at(-1)};
    }""")
    assert converged['marked'] and converged['hp']==1130 and converged['stun']>.5,converged
    fifth=out/'irelia_e_convergencia_dev43_chromium.png';page.screenshot(path=str(fifth))
    # Time precision test in the same browser-backed motor, before any other cast.
    precision=page.evaluate("""() => {
      const a=new window.CoachArena.Arena(window.MAP_DATA,window.MASK_DATA,{seed:43,draft:{blue:{ADC:'Ezreal',TOP:'Irelia'}}});
      const u=a.units.find(x=>x.champ==='Ezreal'),v=a.units.find(x=>x.id==='red_MID');
      Object.assign(u,{x:.5,y:.5,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},mana:400,maxMana:400,items:['recurve_bow'],ad:100,ap:0});
      Object.assign(v,{x:.532,y:.5,hp:1200,maxHp:1200,armor:0,mr:0,shield:0,projectileGuardUntil:0});
      a.visible=()=>true;const cast=a.castChampionOnHitV453Dev41(u,'Q',v);
      a.gameTime=.2;a.advanceChampionProjectilesV453Dev42();
      const middle={distance:a.championProjectilesV453Dev42[0]?.traveledV453Dev43,hp:v.hp};
      a.gameTime=.25;a.advanceChampionProjectilesV453Dev42();
      return {cast,middle,endHp:v.hp,reason:a.championProjectileHistoryV453Dev42.at(-1)?.reason};
    }""")
    assert round(precision['middle']['distance'])==400 and precision['middle']['hp']==1200 and precision['endHp']<1200,precision

    assert not errors,errors
    result={'status':'PASS','scenario':'Original CoachLOL index + engine.browser.js + dynamic projectile and marked Irelia Q',
        'fired':fired,'impacted':impacted,'irelia':marked,'javascriptErrors':errors,
        'screenshots':[str(x.relative_to(root)) for x in (first,second,third,fourth,fifth)],
        'duet':duet,'converged':converged,'precision':precision}
    (out/'chromium_dev43_report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('DEV43_CHROMIUM_PASS',json.dumps(result,ensure_ascii=False));browser.close()
