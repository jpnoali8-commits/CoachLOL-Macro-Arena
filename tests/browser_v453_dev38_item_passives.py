"""Chromium full offline match: same game engine and map; decisions are automated, not manually played."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, io, json, re, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V453_DEV38';out.mkdir(parents=True,exist_ok=True)
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
    initial=page.evaluate('''() => {
      const a=new window.CoachArena.Arena(window.MAP_DATA,window.MASK_DATA,{seed:38,roundSeconds:10});
      window.__dev28.setMatch(a);
      const hero=a.units.find(u=>u.id==='blue_MID');
      const shop=a.map.objects.find(o=>o.id==='blue_spawn_shop');hero.x=shop.x;hero.y=shop.y;hero.gold=20000;
      window.__dev28.choose(hero);window.__dev28.openShop('all');
      return {catalog:window.CoachArena.catalog.length};
    }''')
    assert initial['catalog']==70,initial
    page.locator('#itemGrid .itemBtn').filter(has_text='Estilingue do Patrulheiro').click()
    scout_description=page.locator('#shopItemDescription').inner_text()
    assert 'Bullseye' in scout_description and '40' in scout_description,scout_description
    scout_screenshot=out/'scout_bullseye_dev38_chromium.png';page.screenshot(path=str(scout_screenshot))
    page.locator('#shopPurchase').click()
    page.locator('#itemGrid .itemBtn').filter(has_text='Canhão Fumegante').click()
    rfc_description=page.locator('#shopItemDescription').inner_text()
    assert 'Energizado' in rfc_description and '150' in rfc_description,rfc_description
    rfc_screenshot=out/'canhao_energizado_dev38_chromium.png';page.screenshot(path=str(rfc_screenshot))
    page.locator('#shopPurchase').click()
    proc=page.evaluate('''() => {
      const a=window.__dev28.match,u=a.units.find(v=>v.id==='blue_MID');
      const target=a.units.find(v=>v.id==='red_MID');target.hp=target.maxHp=6000;target.armor=0;target.mr=0;
      u.energizeStacksV453Dev38=100;
      a.attack(u,target,100);
      return {hp:target.hp,stacks:u.energizeStacksV453Dev38,inventory:u.items.slice(),range:a.itemAttackRangeV453Dev38(u)};
    }''')
    assert proc['hp']==5860 and proc['stacks']==6 and proc['inventory']==['rapid_firecannon'],proc
    page.locator('#itemGrid .itemBtn').filter(has_text='Anel de Doran').click()
    doran_description=page.locator('#shopItemDescription').inner_text()
    assert 'mana/s' in doran_description and 'minions' in doran_description,doran_description
    doran_screenshot=out/'anel_doran_dev38_chromium.png';page.screenshot(path=str(doran_screenshot))
    assert not errors,errors
    result={'status':'PASS','scenario':'3 item passives in original browser UI + engine proc during live client session',
            'catalog':initial['catalog'],'scoutDescription':scout_description,'rfcDescription':rfc_description,
            'doranDescription':doran_description,'energizedProc':proc,'javascriptErrors':errors,
            'screenshots':[str(v.relative_to(root)) for v in (scout_screenshot,rfc_screenshot,doran_screenshot)]}
    (out/'chromium_dev38_report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('DEV38_CHROMIUM_PASS',json.dumps(result,ensure_ascii=False)[:1900]);browser.close()
