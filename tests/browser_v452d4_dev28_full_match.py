"""Chromium full offline match: same game engine and map; decisions are automated, not manually played."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, io, json, re, shutil
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'docs'/'QA_EVIDENCE_V452D4_DEV28';out.mkdir(parents=True,exist_ok=True)
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
        source=source.rstrip()[:-5]+'''\n  window.__dev28={get match(){return match},setMatch(m){match=m},get sprites(){return MAP_CC0_ART_V452D4_DEV16},get image(){return image},requestDraw,render,renderStatus,syncEndgameFlow,choose};\n  })();'''
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
    draft=json.loads((root/'data'/'pacing_drafts_v452d4_dev24.json').read_text('utf8'))['profiles']['baseline']
    report=page.evaluate('''({draft})=>{
       const Arena=window.CoachArena.Arena;
       const a=new Arena(window.MAP_DATA,window.MASK_DATA,{seed:26,draft,mode:'bot',roundSeconds:10});
       window.__dev28.setMatch(a);
       for(const u of a.units.filter(u=>u.team==='blue'))u.autoLevelSkills=true;
       let rounds=0,decisionCount=0,issues=[];
       while(!a.ended&&a.gameTime<2700&&rounds<650&&decisionCount<2000){
          if(a.pendingDecision){
             const d=a.pendingDecision;let reply;
             if(['combat_reaction','pickoff_reaction'].includes(d.kind)){
               const unit=a.units.find(u=>u.id===d.unitId);
               reply=a.queueReactionCombo(unit?.team||'blue',d.unitId,d.enemyId,[],{response:'defend'});
             } else if(d.kind==='smite_contest')reply=a.submitSmiteContestV452d4Dev9('blue',d.unitId,'cast');
             else reply=a.answerDecision();
             if(reply?.ok===false){issues.push(d.kind+':'+reply.reason);break;}
             decisionCount++;continue;
          }
          if(a.executionRemaining>0)a.continueExecution(10);
          else{
             if(!a.teams.blue.ready)a.botPlan('blue');
             const r=a.playTurn();if(!r.ok){issues.push('turn:'+r.reason);break;}
             rounds++;
          }
          if(a.gameTime%180===0){const err=a.validateInvariants();if(err.length){issues.push(...err.slice(0,4));break;}}
       }
       const ended=a.ended&&a.winner&&a.structures.some(s=>s.id===(a.winner==='blue'?'red':'blue')+'_nexus'&&!s.alive);
       const results={ended:!!ended,winner:a.winner,time:a.gameTime,rounds,decisionCount,structuresDestroyed:a.structures.filter(s=>!s.alive).length,dragons:a.dragonCaptureLedgerV452d3?.length,issues};
       window.__dev28.requestDraw();window.__dev28.renderStatus();window.__dev28.render();window.__dev28.syncEndgameFlow();
       return results;
    }''',{'draft':draft})
    page.wait_for_timeout(350)
    assert page.locator('#endgameOverlay').is_visible(), 'Tela de vitória não foi apresentada'
    page.locator('#endgameIntroContinue').click()
    assert page.locator('#resultOverlay').is_visible(), 'Pós-jogo não foi apresentado após Continuar'
    report['postgameTitle']=page.locator('#resultTitle').inner_text()
    report['postgameDuration']=page.locator('.resultScoreline').count()
    report['spriteCount']=page.evaluate('''() => Object.values(window.__dev28.sprites).filter(x=>x.complete&&x.naturalWidth>0).length''')
    report['mapLoaded']=page.evaluate('''() => window.__dev28.image.complete&&window.__dev28.image.naturalWidth>0''')
    assert report['ended'] and not report['issues'] and report['time']<2700,report
    assert report['spriteCount']==15 and report['mapLoaded'],report
    assert report['postgameTitle']=='Vitória do time azul' and report['postgameDuration']>0,report
    assert not errors,errors
    shot=out/'full_seed26_nexus_postgame_chromium.png';page.screenshot(path=str(shot),full_page=False)
    (out/'chromium_full_seed26_report.json').write_text(json.dumps({'status':'PASS','scope':'Full 5v5 bot-vs-bot engine simulated inside the actual Chromium game page with normal Nexus destruction; NOT manually played, not UI draft workflow','results':report,'javascriptErrors':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('PASS full browser-driven 5v5 bot match',report,'screenshot',shot)
    browser.close()
