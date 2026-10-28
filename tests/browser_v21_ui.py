from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text().split('<script src="data/bootstrap.js">')[0]+'</body></html>'
html=html.replace('<link rel="stylesheet" href="styles.css"/>','<style>'+(BASE/'styles.css').read_text()+'</style>')
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+(BASE/'styles.css').read_text()+'</style>')
app=(BASE/'app.js').read_text()
map_uri='data:image/jpeg;base64,'+base64.b64encode((BASE/'assets/mapa_atualizado.jpg').read_bytes()).decode()
app=app.replace("image.src='assets/mapa_atualizado.jpg'",'image.src='+repr(map_uri))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
 page=b.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 for name in ['data/bootstrap.js','engine.browser.js','commands.browser.js']:
  page.add_script_tag(content=(BASE/name).read_text())
 page.add_script_tag(content=app)
 page.wait_for_timeout(300)
 assert not errors,errors
 assert page.locator('.smallNote').count()==0
 assert 'MÁSCARAS v6' not in page.locator('.brand').inner_text()
 assert page.locator('header.header #scorePanel').count()==0  # class only
 assert page.locator('header.header .scorePanel').count()==1
 assert page.locator('#champName').inner_text()=='Jinx'
 assert page.locator('#tacticTitle').inner_text()=='PATH · GANK'
 assert page.locator('#quickSkillUp').is_visible()
 assert page.locator('#autoSkillToggle').is_visible()
 assert page.locator('#baseOpenShop').is_visible()
 # Non-JG cannot see jungle clear menu items
 page.locator('#tacticPanel').evaluate('(e)=>e.open=true')
 assert 'Full clear' not in page.locator('#tacticChoices').inner_text()
 assert 'Freeze' in page.locator('#tacticChoices').inner_text()
 page.locator('#tacticChoices button').filter(has_text='Freeze').first.click()
 assert not errors,errors
 page.locator('#roster button').nth(1).click()
 assert page.locator('#tacticTitle').inner_text()=='JUNGLE · PATH · GANK'
 page.locator('#tacticPanel').evaluate('(e)=>e.open=true')
 assert 'Full clear' in page.locator('#tacticChoices').inner_text()
 assert page.locator('#smitePanel').is_visible()
 page.locator('#autoSkillToggle').check()
 assert page.locator('#autoSkillToggle').is_checked()
 # voice button must fail closed, not send audio remotely
 assert page.locator('#voiceLocal').count()==1
 page.locator('#voiceLocal').click()
 assert 'local' in page.locator('#voiceFeedback').inner_text().lower()
 page.screenshot(path='/mnt/data/CoachLOL_Preview_v21_Compact_HUD.png',full_page=True)
 assert not errors,errors
 print('PASS: header, shop near HP, auto-up, role tactics, voice local guard, browser without JS errors')
 b.close()
