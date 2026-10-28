from pathlib import Path
from playwright.sync_api import sync_playwright
import re, shutil
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')

def inline_css(m):
    tag=m.group(0); q=re.search(r'href="([^"]+)"',tag)
    f=root/q.group(1) if q else None
    return '<style>\n'+f.read_text(encoding='utf-8')+'\n</style>' if f and f.exists() else tag

def inline_script(m):
    f=root/m.group(1)
    if not f.exists(): return m.group(0)
    js=f.read_text(encoding='utf-8')
    if f.name=='app.js':
        assert js.rstrip().endswith('})();')
        js=js.rstrip()[:-5]+"""
  window.__dev15={get match(){return match},requestDraw,renderStatus,updateInspector,choose,get camera(){return camera}};
  })();"""
    return '<script>\n'+js+'\n</script>'

html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV15'
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_timeout(900)
    result=page.evaluate("""() => {
      const api=window.__dev15,a=api.match;
      a.gameTime=1260;
      const blue=a.units.filter(x=>x.team==='blue');
      blue.forEach((u,i)=>{u.x=0.46+(i%3)*0.05;u.y=0.44+Math.floor(i/3)*0.06;u.hp=u.maxHp;});
      a.wards=[];
      const owner=blue[0];
      owner.x=0.435;owner.y=0.47;owner.wardCharges=2;owner.controlWardStock=1;
      a.addWard('blue',owner.id,{x:0.415,y:0.47},'stealth');
      a.addWard('blue',owner.id,{x:0.455,y:0.47},'control');
      a.riftBaseFeaturesV452d4.plants=[
        {id:'dev15_blast',kind:'blast_cone',x:0.39,y:0.58},
        {id:'dev15_heal',kind:'honeyfruit',x:0.46,y:0.58}
      ];
      a.riftBaseFeaturesV452d4.scryers=[{id:'dev15_scryer',kind:'scryer_bloom',x:0.53,y:0.58,unlockMode:'base'}];
      a.riftPlantTimersV452d4={dev15_blast:0,dev15_heal:0,dev15_scryer:0};
      a.riftV452d4.phase='active';a.riftV452d4.element='hextech';a.riftV452d4.revision=1500;
      a.riftBundlesV452d4.hextech ??= {features:{}};
      a.riftBundlesV452d4.hextech.features ??= {};
      a.riftBundlesV452d4.hextech.features.hexgates=[
        {id:'dev15_gate_a',pairId:'dev15_gate_b',x:0.60,y:0.58},
        {id:'dev15_gate_b',pairId:'dev15_gate_a',x:0.66,y:0.58}
      ];
      a.minions=[{id:'dev15_siege',kind:'siege',team:'blue',lane:'mid',x:0.49,y:0.43,hp:420,maxHp:420,range:0.03,damage:45,spawnAt:0,speed:0,progress:0.5}];
      owner.baronBuffUntilV452=a.gameTime+120;
      api.camera.zoom=1.45;api.camera.px=0;api.camera.py=10;api.camera.angle=0;api.camera.tilt=0.55;
      api.renderStatus();api.requestDraw();
      return {
        wards:a.wards.length,
        plants:a.riftBaseFeaturesV452d4.plants.length,
        scryers:a.riftBaseFeaturesV452d4.scryers.length,
        hexgates:a.riftBundlesV452d4.hextech.features.hexgates.length,
        baron:a.baronMinionModifiersV452d(a.minions[0]).empowered
      };
    }""")
    assert result['wards']==2,result
    assert result['plants']==2 and result['scryers']==1,result
    assert result['hexgates']==2,result
    assert result['baron'] is True,result
    page.wait_for_timeout(500)
    assert not errors,errors
    screen=out/'map_icons_chromium.png'
    page.screenshot(path=str(screen),full_page=False)
    print('DEV15 Chromium map icons PASS: screenshot',screen)
    browser.close()
