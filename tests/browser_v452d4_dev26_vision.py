"""Controlled Chromium smoke of the actual CoachLOL engine/browser + fog rendering."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,shutil,json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf8')
def inline_css(m):
    tag=m.group(0);k=re.search(r'href="([^"]+)"',tag)
    file=root/k.group(1) if k else None
    return '<style>'+file.read_text(encoding='utf8')+'</style>' if file and file.exists() else tag
def inline_script(m):
    file=root/m.group(1)
    if not file.exists():return m.group(0)
    js=file.read_text(encoding='utf8')
    if file.name=='app.js':
        assert js.rstrip().endswith('})();')
        js=js.rstrip()[:-5]+'''
  window.__dev26={get match(){return match},requestDraw,render};
  })();'''
    return '<script>'+js+'</script>'
html=re.sub(r'<link\s+[^>]*>',inline_css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*></script>',inline_script,html)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-web-security'])
    page=browser.new_page(viewport={'width':1440,'height':900});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,timeout=60000,wait_until='domcontentloaded')
    page.wait_for_timeout(600)
    result=page.evaluate('''() => {
      const api=window.__dev26,a=api.match;
      const site=a.riftAllFeaturesV452d4('faelights').find(p=>a.walkable(p.x,p.y));
      if(!site)throw Error('No visible base site');
      const own={id:'dev26_w',team:'blue',type:'stealth',x:site.x,y:site.y,hp:3,until:null,faelightSiteId:site.id,faelightUntil:a.gameTime+45};
      const pink={id:'dev26_p',team:'red',type:'control',x:site.x,y:site.y,hp:4,until:null};
      a.wards=[own];const initial=a.visionSources('blue').filter(v=>v.kind==='faelight_region').length;
      a.wards.push(pink);const suppressed=a.visionSources('blue').filter(v=>v.kind==='faelight_region').length;
      api.requestDraw();api.render();
      pink.hp=0;const restored=a.visionSources('blue').filter(v=>v.kind==='faelight_region').length;
      api.requestDraw();api.render();
      return {initial,suppressed,restored,canvasWidth:document.getElementById('board').width};
    }''')
    assert result['initial']==1 and result['suppressed']==0 and result['restored']==1,result
    assert result['canvasWidth']>0,result
    assert not errors,errors
    out=root/'docs/QA_EVIDENCE_V452D4_DEV26/browser_vision_smoke.json'
    out.write_text(json.dumps({'status':'PASS','result':result,'jsErrors':errors,'scope':'Controlled inlined Chromium fixture; complete match NOT tested.'},ensure_ascii=False,indent=2)+'\n')
    print('PASS Chromium vision source/overlay render',result,'errors=',len(errors))
    browser.close()
