# Requer Playwright para Python e Chrome/Chromium em /usr/bin/chromium; teste opcional de smoke sem servidor.
from playwright.sync_api import sync_playwright
from pathlib import Path
import re,json,tempfile,os,shutil
root=Path(__file__).resolve().parent.parent
html=(root/'index.html').read_text()
def inline_css(m):
 tag=m.group(0);q=re.search(r'href="([^"]+)"',tag)
 if not q:return tag
 file=root/q.group(1)
 return '<style>\n'+file.read_text()+'\n</style>' if file.is_file() else tag
def inline_script(m):
 src=m.group(1);f=root/src
 if not f.is_file():return m.group(0)
 js=f.read_text()
 if src=='app.js':
  assert js.rstrip().endswith('})();')
  js=js.rstrip()[:-5]+"""// QA instrumentation: never written into distributed app
 window.match=match;window.choose=choose;window.worldScreen=worldScreen;window.requestDraw=requestDraw;
 window.showComboComposer=showComboComposer;window.tacticalReview=tacticalReview;
 Object.defineProperty(window,'selectedUnitIds',{get(){return selectedUnitIds}});
 Object.defineProperty(window,'camera',{get(){return camera}});
 Object.defineProperty(window,'lastPopupKey',{get(){return lastPopupKey},set(v){lastPopupKey=v}});
 })();"""
 return '<script>\n'+js+'\n</script>'
html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
with sync_playwright() as p:
 executable=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome') or shutil.which('chrome')
 launch_options={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
 if executable:launch_options['executable_path']=executable
 browser=p.chromium.launch(**launch_options)
 page=browser.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1)
 errs=[]
 page.on('pageerror',lambda err:errs.append(getattr(err,'stack',str(err))))
 print('loading inline',len(html),flush=True)
 page.set_content(html,timeout=60000,wait_until='domcontentloaded')
 page.wait_for_timeout(900)
 print('title',page.title(),'errors',errs[:4],flush=True)
 print('typeof',page.evaluate("({match:typeof match,arena:!!window.CoachArena})"),flush=True)
 if errs:raise RuntimeError(str(errs[:4]))
 page.evaluate("""() => {match.finishPreparation(); choose(match.units.find(u=>u.id==='blue_ADC')); requestDraw();}""")
 page.evaluate("""() => {const a=match.units.find(u=>u.id==='blue_TOP'),b=match.units.find(u=>u.id==='blue_MID');a.x+=.12;a.y-=.12;b.x+=.06;b.y-=.07;requestDraw();}""")
 coords=page.evaluate("""() => Object.fromEntries(match.units.filter(u=>u.team==='blue').map(u=>[u.role,{...worldScreen(u.x,u.y),id:u.id}]))""")
 print('coords',json.dumps(coords),flush=True)
 rect=page.locator('#board').bounding_box();print('board',rect,flush=True)
 cam_before=page.evaluate('({...camera})')
 def canvas_point(role):return rect['x']+coords[role]['x'],rect['y']+coords[role]['y']
 for role in ['TOP','MID']:
  x,y=canvas_point(role)
  page.keyboard.down('Shift');page.mouse.click(x,y);page.keyboard.up('Shift');page.wait_for_timeout(170)
 clicked=page.evaluate('Array.from(selectedUnitIds)');print('shift click',clicked,flush=True)
 assert 'blue_TOP' in clicked and 'blue_MID' in clicked, 'Shift+cliques separados devem acumular aliados'
 x,y=canvas_point('ADC');page.keyboard.down('Shift');page.mouse.click(x,y);page.keyboard.up('Shift');page.wait_for_timeout(120)
 print('overlap picker',page.locator('.clusterTargetPicker').is_visible(),flush=True)
 assert page.locator('.clusterTargetPicker').is_visible(),'tokens sobrepostos precisam de seletor contextual'
 page.locator('.clusterTargetPicker .clusterTarget').filter(has_text='Warwick').click()
 assert 'blue_JG' in page.evaluate('Array.from(selectedUnitIds)')
 x1=min(coords[r]['x'] for r in ['TOP','MID'])-24+rect['x'];y1=min(coords[r]['y'] for r in ['TOP','MID'])-24+rect['y']
 x2=max(coords[r]['x'] for r in ['TOP','MID'])+24+rect['x'];y2=max(coords[r]['y'] for r in ['TOP','MID'])+24+rect['y']
 x1=max(rect['x']+4,x1);y1=max(rect['y']+4,y1);x2=min(rect['x']+rect['width']-4,x2);y2=min(rect['y']+rect['height']-4,y2)
 page.keyboard.down('Shift');page.mouse.move(x1,y1);page.mouse.down();page.mouse.move(x2,y2,steps=9);page.wait_for_timeout(250)
 print('rect',page.locator('#groupSelectRect').is_visible(),page.locator('#groupSelectRect').bounding_box(),flush=True)
 page.screenshot(path=str(Path(tempfile.gettempdir())/'v381_selecao_shift_arrastar.png'))
 page.mouse.up();page.keyboard.up('Shift');page.wait_for_timeout(140)
 selected_ids=page.evaluate('Array.from(selectedUnitIds)');cam_after=page.evaluate('({...camera})')
 print('selected area',selected_ids,'camera unchanged',all(cam_before[k]==cam_after[k] for k in ['px','py','angle']),flush=True)
 assert 'blue_TOP' in selected_ids and 'blue_MID' in selected_ids
 assert cam_before['px']==cam_after['px'] and cam_before['py']==cam_after['py']
 assert not page.locator('#groupSelectRect').is_visible()
 page.evaluate("""() => {const e=match.units.find(u=>u.id==='red_MID'),a=match.units.find(u=>u.id==='blue_MID'); e.x=a.x+.01;e.y=a.y;showComboComposer(e.id);}""")
 print('modal',page.locator('#targetTitle').inner_text(),flush=True)
 print('modes',page.locator('#comboEngageMode option').all_text_contents(),flush=True)
 assert page.locator('#comboEngageMode').is_visible()
 page.screenshot(path=str(Path(tempfile.gettempdir())/'v381_editor_combo.png'))
 page.evaluate("""() => {
 const d=match.units.find(u=>u.id==='blue_MID'),e=match.units.find(u=>u.id==='red_MID');
 document.getElementById('targetPanel').hidden=true;match.phase='decision';match.executionRemaining=8;
 match.pendingDecision={kind:'combat_reaction',unitId:d.id,enemyId:e.id,at:match.gameTime};
 const key=match.duelKey(e,d);match.duelRequests[key]={key,initiator:e.id,responder:d.id,state:'pending',firstHitAt:match.gameTime};
 lastPopupKey=null;tacticalReview();}""")
 print('defense options',page.locator('#targetButtons button').all_text_contents(),flush=True)
 page.locator('#targetButtons button').filter(has_text='Montar contra-combo').click()
 assert page.locator('#reactionCombatChoice').is_visible()
 page.screenshot(path=str(Path(tempfile.gettempdir())/'v381_editor_reacao.png'))
 print('browser errors',errs,flush=True)
 browser.close()
 if errs:raise RuntimeError(str(errs[:7]))
