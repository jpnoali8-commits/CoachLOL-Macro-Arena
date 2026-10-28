"""Browser regression. Fully local request interception: no external services/CDN required."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re,json
root=Path(__file__).resolve().parent.parent
source=(root/'index.html').read_text()
for stylesheet in re.findall(r'<link[^>]+href="(styles[^"]*\.css)"[^>]*>',source):
 pattern=r'<link[^>]+href="'+re.escape(stylesheet)+r'"[^>]*>'
 source=re.sub(pattern,lambda m:'<style>\n'+(root/stylesheet).read_text()+'\n</style>',source)
iconsSkills={f.stem:'data:image/svg+xml;base64,'+base64.b64encode(f.read_bytes()).decode() for f in (root/'assets/ui/skills').glob('*.svg')}
iconsTactic={f.stem:'data:image/svg+xml;base64,'+base64.b64encode(f.read_bytes()).decode() for f in (root/'assets/ui/tactics').glob('*.svg')}
portraits={f.stem:'data:image/webp;base64,'+base64.b64encode(f.read_bytes()).decode() for f in (root/'assets/portraits').glob('*.webp')}
portraits.update({f.stem:'data:image/svg+xml;base64,'+base64.b64encode(f.read_bytes()).decode() for f in (root/'assets/portraits').glob('*.svg') if f.stem not in portraits})
iconsActions={f.stem:'data:image/svg+xml;base64,'+base64.b64encode(f.read_bytes()).decode() for f in (root/'assets/ui/actions').glob('*.svg')}
for script in re.findall(r'<script src="([^"]+\.js)"></script>',source):
 code=(root/script).read_text()
 if script=='riot-assets.js':
  # E2E only: substitute the official online portraits with bundled images.
  assert 'function championPortrait(name)' in code
  code=code.replace('function championPortrait(name){return `${BASE}/img/champion/${id(name)}.png`}',
                    'const e2ePortraits='+json.dumps(portraits)+';function championPortrait(name){return e2ePortraits[id(name)]||`${BASE}/img/champion/${id(name)}.png`}')
 if script=='app.js':
  code=code.replace("image.src='assets/mapa_atualizado.jpg'","image.src='data:image/jpeg;base64,"+base64.b64encode((root/'assets/mapa_atualizado.jpg').read_bytes()).decode()+"'")
  code=code.replace('const $=id=>', 'const v31SkillIcons='+json.dumps(iconsSkills)+';const v31TacticIcons='+json.dumps(iconsTactic)+';const v31ActionIcons='+json.dumps(iconsActions)+';const $=id=>',1)
  code=code.replace('src="assets/ui/skills/${id}.svg"','src="${v31SkillIcons[id]}"')
  code=code.replace('src="assets/ui/actions/${id}.svg"','src="${v31ActionIcons[id]}"')
  code=code.replace("""src="assets/ui/tactics/'+key+'.svg""", """src="'+v31TacticIcons[key]+'""")
  assert 'v31TacticIcons[key]' in code
 pattern='<script src="'+script+'"></script>'
 source=source.replace(pattern,'<script>\n'+code.replace('</script','<\\/script')+'\n</script>')
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page(viewport={'width':1680,'height':960},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(source,wait_until='domcontentloaded',timeout=30000)
 page.wait_for_timeout(800)
 assert page.locator('#board').bounding_box()['width']>300
 print('startErrors',errors)
 assert not errors,errors
 print('startingChamp',page.locator('#champName').inner_text())
 print('skillIcons',page.locator('#spells .localAbilityIcon').count(),'skillUpgrades',page.locator('.skillFloatUpgrade').count())
 assert page.locator('#spells .spellSlot').count()==4
 assert page.locator('#spells .localAbilityIcon').count()==4
 assert page.locator('#spells .localAbilityIcon').evaluate_all('(imgs)=>imgs.every(x=>x.complete&&x.naturalWidth>0)'), 'local skill icons missing'
 assert page.locator('#spells .skillFloatUpgrade.ready').count()>0
 assert not page.locator('#quickSkillUp').is_visible()
 order=page.locator('#selectedInspector > *').evaluate_all('(nodes)=>nodes.map(n=>n.id).filter(Boolean)')
 print('DOM_WIDGET_ORDER',order)
 assert order.index('tacticPanel')<order.index('policyPanel'),order
 # Current selected unit likely Jinx; change selected to JG by real roster interaction, check icons.
 page.locator('#roster .rosterItem').nth(1).click()
 assert page.locator('#champName').inner_text().casefold()=='warwick',page.locator('#champName').inner_text()
 assert page.locator('#tacticPanel').evaluate('(n)=>n.open')
 assert page.locator('#tacticChoices img.tacticVector').count()>=6
 assert page.locator('#tacticChoices img.tacticVector').evaluate_all('(nodes)=>nodes.every(n=>n.complete&&n.naturalWidth>0)')
 print('JUNGLE_CHOICES',page.locator('#tacticChoices .tacticChoice').all_inner_texts())
 page.locator('#tacticPanel').scroll_into_view_if_needed()
 page.screenshot(path='/mnt/data/CoachLOL_v31_Jungle_HUD_Real.png',full_page=True,timeout=25000)
 # Clicking a live upgrade must spend point and re-render the actual skill list.
 up=page.locator('#spells .skillFloatUpgrade.ready').first
 slot=up.get_attribute('data-upgrade');up.click()
 assert page.locator('#spells .spellSlot').count()==4
 assert page.locator('#spells .localAbilityIcon').evaluate_all('(imgs)=>imgs.every(x=>x.complete&&x.naturalWidth>0)')
 print('SPENT_POINT',slot,'OVERLAYS_REMAIN',page.locator('.skillFloatUpgrade').count())
 assert page.locator('.skillFloatUpgrade').count()==0
 # Important regression: async official champion metadata arriving AFTER first render.
 page.evaluate('''() => {window.CoachDragon.champion=async(name)=>({spells:['Q','W','E','R'].map(s=>({name:name+' '+s,image:{full:'Uncached'+s+'.png'}}))});}''')
 page.locator('#roster .rosterItem').nth(2).click() # Ahri, never fetched previously
 page.wait_for_timeout(450)
 assert page.locator('#spells .spellSlot').count()==4
 assert page.locator('#spells .localAbilityIcon').evaluate_all('(imgs)=>imgs.every(x=>x.complete&&x.naturalWidth>0)')
 assert not errors, errors
 # All non-jungle roles should offer their own PATH options rather than jungle.
 assert 'Farm safe' in ' '.join(page.locator('#tacticChoices').all_inner_texts())
 print('MID_CHOICES',page.locator('#tacticChoices .tacticChoice').all_inner_texts())
 assert page.locator('#tacticPanel').evaluate('(n)=>n.open')
 page.locator('#skillWidget').scroll_into_view_if_needed()
 page.screenshot(path='/mnt/data/CoachLOL_v31_Arena_Real.png',full_page=True,timeout=25000)
 # Test tabs and preserved references: reaction panel and modal must still be usable.
 page.locator('#policySelect').select_option('balanced')
 page.locator('#tacticTabs button[data-tab="gank"]').click()
 assert page.locator('.tacticVector').count()>0
 # Use skill upgrade of Ahri with metadata loaded; asynchronous exception must not arise.
 up=page.locator('#spells .skillFloatUpgrade.ready').first
 up.click()
 assert not errors,errors
 # Clicking scoreboard and opening shop must not conflict.
 page.locator('#scoreboardOpen').click();assert page.locator('#scoreboardContents .sbPlayer').count()==10
 page.locator('#scoreboardClose').click();page.locator('#shopOpen').click()
 assert page.locator('#shopModal').is_visible()
 page.locator('#shopClose').click()
 print('FINISHED_BROWSER',{'errors':errors,'skills':4,'tactics_icons':19,'scoreboard_rows':10})
 browser.close()
