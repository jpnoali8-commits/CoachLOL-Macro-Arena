"""Chromium full offline match: same game engine and map; decisions are automated, not manually played."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, io, json, re, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V453_DEV37';out.mkdir(parents=True,exist_ok=True)
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
      const a=new window.CoachArena.Arena(window.MAP_DATA,window.MASK_DATA,{seed:37,roundSeconds:10});
      window.__dev28.setMatch(a);
      const hero=a.units.find(u=>u.id==='blue_MID');
      const shop=a.map.objects.find(o=>o.id==='blue_spawn_shop');hero.x=shop.x;hero.y=shop.y;hero.gold=20000;
      window.__dev28.choose(hero);window.__dev28.openShop('all');
      return {catalog:window.CoachArena.catalog.length};
    }''')
    assert initial['catalog']==70,initial
    page.locator('#itemGrid .itemBtn').filter(has_text='Canhão Fumegante').click()
    fire=page.evaluate('''() => ({root:document.querySelector('#shopRecipeTree .recipeRoot small')?.textContent,
        components:[...document.querySelectorAll('#shopRecipeTree .shopRecipePart small')].map(e=>e.textContent)})''')
    assert len(fire['components'])==7,fire
    assert any('Estilingue' in n for n in fire['components']),fire
    shot1=out/'canhao_fumegante_receita_dev37_chromium.png';page.screenshot(path=str(shot1),full_page=False)
    page.locator('#itemGrid .itemBtn').filter(has_text='Armaguarda da Caçadora').click()
    arm=page.evaluate('''() => ({components:[...document.querySelectorAll('#shopRecipeTree .shopRecipePart small')].map(e=>e.textContent), description:document.querySelector('#shopItemDescription')?.textContent})''')
    assert len(arm['components'])==4,arm
    assert '1 uso' in arm['description'],arm
    page.locator('#shopPurchase').click()
    purchased=page.evaluate('''() => {
      const a=window.__dev28.match,u=a.units.find(v=>v.id==='blue_MID');
      return {items:[...u.items],gold:u.gold};
    }''')
    assert 'seekers_armguard' in purchased['items'],purchased
    page.locator('#shopClose').click()
    active=page.locator('.stasisReaction').filter(has_text='Armaguarda')
    assert active.count()==1,active.count()
    shot2=out/'armaguarda_ativa_dev37_chromium.png';page.screenshot(path=str(shot2),full_page=False)
    active.click()
    activated=page.evaluate('''() => {
      const a=window.__dev28.match,u=a.units.find(v=>v.id==='blue_MID');
      return {stasis:u.stasisUntil-a.gameTime,spent:u.armguardSpentV453Dev37,items:[...u.items]};
    }''')
    assert activated['stasis']==2.5 and activated['spent'] and activated['items']==['seekers_armguard'],activated
    assert page.locator('.stasisReaction').filter(has_text='Armaguarda').count()==0
    assert not errors,errors
    result={'status':'PASS','scenario':'real shop interactive recipe and one-use active via UI, in original app and browser engine',
            'catalog':initial['catalog'],'firecannon':fire,'armguard':arm,'purchase':purchased,'activated':activated,
            'javascriptErrors':errors,'screenshots':[str(shot1.relative_to(root)),str(shot2.relative_to(root))]}
    (out/'chromium_dev37_report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('DEV37_CHROMIUM_PASS',json.dumps(result,ensure_ascii=False)[:1300])
    browser.close()
