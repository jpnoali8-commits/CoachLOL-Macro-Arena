"""Chromium full offline match: same game engine and map; decisions are automated, not manually played."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, io, json, re, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V453_DEV32';out.mkdir(parents=True,exist_ok=True)
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
      const a=new window.CoachArena.Arena(window.MAP_DATA,window.MASK_DATA,{seed:32,roundSeconds:10});
      window.__dev28.setMatch(a);
      const u=a.units.find(x=>x.id==='blue_ADC'),shop=a.map.objects.find(o=>o.id==='blue_spawn_shop');
      u.x=shop.x;u.y=shop.y;u.gold=10000;u.items=[];
      window.__dev28.choose(u);window.__dev28.openShop('all');
      return {gold:u.gold,catalog:window.CoachArena.catalog.length};
    }''')
    assert initial['catalog']==62,initial
    item=page.locator('#itemGrid .itemBtn').filter(has_text='Adagas Rápidas Navori')
    assert item.count()==1,item.count()
    item.click()
    cloak=page.get_by_role('button',name='Comprar Manto da Agilidade pela receita')
    assert cloak.count()==1,cloak.count()
    cloak.click()
    dagger=page.get_by_role('button',name='Comprar Adaga pela receita')
    assert dagger.count()==3,dagger.count()
    dagger.first.click()
    zeal=page.get_by_role('button',name='Comprar Zelo pela receita')
    zeal.click()
    daggers=page.get_by_role('button',name='Comprar Adaga pela receita')
    assert daggers.count()==2,daggers.count()
    daggers.first.click()
    page.get_by_role('button',name='Comprar Adaga pela receita').last.click()
    state=page.evaluate('''() => {
      const a=window.__dev28.match,u=a.units.find(x=>x.id==='blue_ADC');
      return {items:[...u.items],gold:u.gold,remaining:a.itemPurchaseCost(u,'navori_flickerblade'),
      root:document.querySelector('#shopRecipeTree .recipeRoot small')?.textContent,
      loaded:window.__dev28.image.naturalWidth>0,
      svgCount:Object.values(window.__dev28.sprites).filter(x=>x.complete&&x.naturalWidth>0).length};
    }''')
    assert state['items']==['zeal','dagger','dagger'] and state['remaining']==950,state
    assert state['loaded'] and state['svgCount']==15,state
    shot=out/'navori_components_chromium.png';page.screenshot(path=str(shot),full_page=False)
    page.locator('#shopPurchase').click()
    page.locator('#shopClose').click()
    final=page.evaluate('''() => {
      const a=window.__dev28.match,u=a.units.find(x=>x.id==='blue_ADC');
      return {items:[...u.items],gold:u.gold};
    }''')
    assert final['items']==['navori_flickerblade'] and final['gold']==7350,final
    assert not errors,errors
    (out/'chromium_dev32_report.json').write_text(json.dumps({'status':'PASS','scope':'Navori nested component purchase / real HUD / atlas and 15 SVGs','preFinal':state,'final':final,'javascriptErrors':errors},ensure_ascii=False,indent=2)+'\n')
    print('PASS dev32 Chromium',state,final,'screenshot',shot)
    browser.close()
