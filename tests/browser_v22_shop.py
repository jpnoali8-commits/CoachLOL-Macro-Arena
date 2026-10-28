from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text().split('<script src="data/bootstrap.js">')[0]+'</body></html>'
html=html.replace('<link href="styles.css" rel="stylesheet"/>','<style>'+(BASE/'styles.css').read_text()+'</style>')
html=html.replace('<link rel="stylesheet" href="styles.css"/>','<style>'+(BASE/'styles.css').read_text()+'</style>')
app=(BASE/'app.js').read_text()
map_uri='data:image/jpeg;base64,'+base64.b64encode((BASE/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'",'image.src='+repr(map_uri))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=b.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
 errs=[];page.on('pageerror',lambda e:errs.append(str(e)+"\n"+str(e.stack)))
 page.set_content(html)
 for file in ['data/bootstrap.js','engine.browser.js','commands.browser.js']:
  page.add_script_tag(content=(BASE/file).read_text())
 page.add_script_tag(content=app)
 page.wait_for_timeout(450)
 assert not errs,errs
 assert page.locator('#openingShopBanner').is_visible(), 'opening shop CTA missing'
 page.locator('#openingShopOpen').click()
 assert page.locator('#shopModal').is_visible()
 assert page.locator('#shopChampionPicker button').count()==5
 assert page.locator('.shopCatalog .itemBtn').count()>0
 assert 'Jinx' in page.locator('#shopUnit').inner_text()
 page.locator('#shopChampionPicker button').filter(has_text='Ahri').click()
 assert 'Ahri' in page.locator('#shopUnit').inner_text()
 # queue expensive item and confirm modal remains open on subsequent transaction
 page.locator('#shopTabs button[data-filter="all"]').click()
 page.locator('.itemBtn').filter(has_text='Rabadon').click()
 assert page.locator('#shopModal').is_visible()
 assert 'Rabadon' in page.locator('#shopQueue').inner_text()
 page.locator('.itemBtn').filter(has_text='Espada Longa').click()
 assert page.locator('#shopModal').is_visible()
 assert 'Espada Longa' in (page.locator('#shopQueue').inner_text()+page.locator('#shopInventory').inner_text())
 page.locator('#shopChampionPicker button').filter(has_text='Jinx').click()
 assert 'Jinx' in page.locator('#shopUnit').inner_text()
 page.locator('.itemBtn').filter(has_text='Lâmina de Doran').click()
 assert page.locator('#shopModal').is_visible()
 assert 'Lâmina de Doran' in page.locator('#shopInventory').inner_text()
 page.screenshot(path='/mnt/data/CoachLOL_Preview_v22_Loja_Arsenal.png',full_page=True)
 assert not errs,errs
 print('OK v2.2 Browser: opening shop, five champions, queue expensive items, multiple purchases, no JS errors')
 b.close()
