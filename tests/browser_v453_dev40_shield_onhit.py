"""Chromium full offline match: same game engine and map; decisions are automated, not manually played."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, io, json, re, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V453_DEV40';out.mkdir(parents=True,exist_ok=True)
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
    initial=page.evaluate("""() => {
       const a=new window.CoachArena.Arena(window.MAP_DATA,window.MASK_DATA,{seed:40,roundSeconds:10});
       window.__dev28.setMatch(a);
       const hero=a.units.find(u=>u.id==='blue_ADC');
       const shop=a.map.objects.find(o=>o.id==='blue_spawn_shop');
       hero.x=shop.x;hero.y=shop.y;hero.gold=100000;
       window.__dev28.choose(hero);
       return {catalog:window.CoachArena.catalog.length,heroId:hero.id};
    }""")
    assert initial['catalog']==70,initial
    # UI measures are produced from real engine and updated across visual refresh.
    statuses=page.evaluate("""() => {
      const a=window.__dev28.match,u=a.units.find(v=>v.id==='blue_ADC');
      for(const id of ['rapid_firecannon','kraken_slayer','scouts_slingshot','dorans_ring'])a.buy('blue',u.id,id);
      u.energizeStacksV453Dev38=85;
      u.krakenHitV453Dev32={targetId:'red_TOP',stacks:2,until:a.gameTime+4};
      u.scoutBullseyeReadyAtV453Dev38=a.gameTime+18;
      u.doransCombatManaUntilV453Dev38=a.gameTime+3;
      window.__dev28.choose(u);
      const rows=[...document.querySelectorAll('#itemProcsV453Dev39 .itemProcV453Dev39')].map(x=>({id:x.dataset.item,text:x.innerText,value:x.getAttribute('aria-valuenow'),max:x.getAttribute('aria-valuemax')}));
      return {rows,html:document.getElementById('itemProcsV453Dev39')?.outerHTML.slice(0,800)};
    }""")
    assert len(statuses['rows'])==4,statuses
    assert next(x for x in statuses['rows'] if x['id']=='rapid_firecannon')['value']=='85'
    assert next(x for x in statuses['rows'] if x['id']=='kraken_slayer')['value']=='2'
    assert next(x for x in statuses['rows'] if x['id']=='scouts_slingshot')['value']=='0'
    screenshot_hud=out/'item_proc_hud_dev40_chromium.png';page.screenshot(path=str(screenshot_hud))
    page.evaluate("window.__dev28.openShop('all')")
    inventory=page.locator('#shopInventory').inner_text()
    assert '85/100' in inventory and '2/2' in inventory and '18s restantes' in inventory,inventory
    screenshot_shop=out/'item_inventory_proc_dev40_chromium.png';page.screenshot(path=str(screenshot_shop))
    # A real browser engine attack consumes the charged hit and updates the HUD.
    after=page.evaluate("""() => {
      const a=window.__dev28.match,u=a.units.find(v=>v.id==='blue_ADC'),t=a.units.find(v=>v.id==='red_ADC');
      t.hp=t.maxHp=20000;t.armor=0;t.mr=0;
      u.items=['rapid_firecannon'];u.energizeStacksV453Dev38=100;
      t.shield=250;
      a.attack(u,t,100);
      window.__dev28.choose(u);
      return {stacks:u.energizeStacksV453Dev38,hp:t.hp,shield:t.shield,charge:[...document.querySelectorAll('#itemProcsV453Dev39 .itemProcV453Dev39')].find(el=>el.dataset.item==='rapid_firecannon')?.getAttribute('aria-valuenow')};
    }""")
    assert after['stacks']==6 and after['charge']=='6' and after['shield']==110 and after['hp']==20000,after
    screenshot_landed=out/'shielded_energized_dev40_chromium.png';page.screenshot(path=str(screenshot_landed))
    invulnerable=page.evaluate("""() => {const a=window.__dev28.match,u=a.units.find(v=>v.id==='blue_ADC'),t=a.units.find(v=>v.id==='red_ADC');u.energizeStacksV453Dev38=100;t.stasisUntil=a.gameTime+10;a.attack(u,t,100);window.__dev28.choose(u);return {stacks:u.energizeStacksV453Dev38,hp:t.hp,shield:t.shield,uiCharge:document.querySelector('#itemProcsV453Dev39 [data-item=\"rapid_firecannon\"]')?.getAttribute('aria-valuenow')}}""")
    assert invulnerable['stacks']==100 and invulnerable['hp']==20000 and invulnerable['uiCharge']=='100',invulnerable
    screenshot_immune=out/'stasis_energized_dev40_chromium.png';page.screenshot(path=str(screenshot_immune))
    assert not errors,errors
    result={'status':'PASS','scenario':'Full original index UI with live engine item-proc HUD and inventory; on-hit refresh after actual browser attack', 'catalog':initial['catalog'],'hud':statuses['rows'],'inventory':inventory,'afterAttack':after,'blockedAttack':invulnerable,'javascriptErrors':errors,'screenshots':[str(s.relative_to(root)) for s in (screenshot_hud,screenshot_shop,screenshot_landed,screenshot_immune)]}
    (out/'chromium_dev40_report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('DEV40_CHROMIUM_PASS',json.dumps(result,ensure_ascii=False)[:1250]);browser.close()
