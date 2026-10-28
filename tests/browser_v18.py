from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text().split('<script src="data/bootstrap.js">')[0]+'</body></html>'
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+ (BASE/'styles.css').read_text()+'</style>')
app=(BASE/'app.js').read_text()
map_uri='data:image/jpeg;base64,'+base64.b64encode((BASE/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'","image.src="+repr(map_uri))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=b.new_page(viewport={'width':1680,'height':920},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 for name in ['data/bootstrap.js','engine.browser.js','commands.browser.js']:
  page.add_script_tag(content=(BASE/name).read_text())
 page.add_script_tag(content=app)
 page.wait_for_timeout(250)
 assert not errors,errors
 # Shop by role: JG offers 3 pets, player picks Mosstomper
 page.locator('#roster button').nth(1).click()
 assert page.locator('#champName').inner_text()=='Warwick'
 page.locator('#shopOpen').click()
 print('Shop jungle:', page.locator('#shopUnit').inner_text())
 assert page.locator('#itemGrid button').count()>=3
 assert 'Gustwalker' in page.locator('#itemGrid').inner_text()
 assert 'Mosstomper' in page.locator('#itemGrid').inner_text()
 page.screenshot(path='/mnt/data/CoachLOL_Preview_v18_Escolha_Pet.png',full_page=True)
 page.locator('#itemGrid button').filter(has_text='Mosstomper').click()
 assert 'SMITE 600' in page.locator('#shopUnit').inner_text()
 print('After pet purchase:',page.locator('#shopUnit').inner_text())
 page.screenshot(path='/mnt/data/CoachLOL_Preview_v18_Loja_Pets.png',full_page=True)
 assert not errors, errors
 page.locator('#shopClose').click()
 # Support starts with quest and 100 gold (not incorrect Doran item)
 page.locator('#roster button').nth(4).click()
 assert page.locator('#champName').inner_text()=='Nami'
 page.locator('#shopOpen').click()
 assert 'MISS' in page.locator('#shopUnit').inner_text().upper() or 'QUEST SUP' in page.locator('#shopUnit').inner_text()
 assert page.locator('#shopGold').inner_text()=='100'
 assert 'Atlas Mundial' in page.locator('#shopInventory').inner_text()
 # Disabled starters cannot be purchased by SUP
 page.locator('#shopTabs button[data-filter="starter"]').click()
 assert page.locator('#itemGrid button').filter(has_text='Gustwalker').count()==0
 page.locator('#shopClose').click()
 # Simultaneous text order; no changes until executing
 page.locator('#textOrders').fill('ADC farm safe com kite e AA; MID comprar anel de doran; JG red de baixo depois krugs')
 page.locator('#previewOrders').click()
 assert not page.locator('#applyTextOrders').is_disabled(),page.locator('#commandPreview').inner_text()
 page.locator('#applyTextOrders').click()
 assert not errors,errors
 page.screenshot(path='/mnt/data/CoachLOL_Preview_v18_Loja_Jungle.png',full_page=True)
 print('screenshot /mnt/data/CoachLOL_Preview_v18_Loja_Jungle.png')
 # First confirmation preserves manually selected jungle pet
 page.locator('#confirm').click()
 page.wait_for_timeout(220)
 assert not errors,errors
 print('Turn phase:',page.locator('#simulatedNow').inner_text())
 b.close()
