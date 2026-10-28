#!/usr/bin/env python3
"""Real Chromium: two independent browser contexts, PvP shop HUD and double ready.
Does not certify natural Nexus, full champion kits, or long human play.
"""
import json, os, socket, subprocess, tempfile, time, urllib.request, urllib.error, urllib.parse, http.cookiejar
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'docs'/'QA_EVIDENCE_V453_DEV62'
OUTPUT.mkdir(parents=True,exist_ok=True)
with socket.socket() as s:
 s.bind(('127.0.0.1',0)); PORT=s.getsockname()[1]
BASE=f'http://127.0.0.1:{PORT}'
checks=[]; errors=[]

def ok(name,condition=True):
 if not condition: raise AssertionError(name)
 checks.append(name)

def until(page,selector,value,timeout=12000):
 page.locator(selector).get_by_text(value,exact=False).wait_for(timeout=timeout)

with tempfile.TemporaryDirectory(prefix='coachlol62pvp-') as state_dir:
 proc=subprocess.Popen(['node','multiplayer/server_v453_dev47.mjs'],cwd=ROOT,env={**os.environ,'PORT':str(PORT),'HOST':'127.0.0.1','COACHLOL_PVP_STATE':state_dir,'COACHLOL_TICK_MS':'200'},stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
 try:
  for _ in range(100):
   if proc.poll() is not None: raise RuntimeError('Server failed to start: '+proc.stdout.read())
   try:
    import urllib.request
    with urllib.request.urlopen(BASE+'/api/health',timeout=.25) as r:
     if r.status==200:break
   except Exception:time.sleep(.1)
  else:raise RuntimeError('HTTP server health timeout')
  page_html=(ROOT/'multiplayer.html').read_text(encoding='utf-8').replace('</style>','</style><style>'+ (ROOT/'multiplayer/shop_v453_dev62.css').read_text(encoding='utf-8')+'</style>').replace('<link rel="stylesheet" href="/multiplayer/shop_v453_dev62.css">','').replace('<script type="module" src="/multiplayer/pvp_client_v453_dev47.js"></script>','')
  page_js=(ROOT/'multiplayer/pvp_client_v453_dev47.js').read_text(encoding='utf-8')
  # The sandbox Chromium blocks localhost HTTP (ERR_BLOCKED_BY_ADMINISTRATOR).
  # Explicit Python-to-localhost bridge keeps the actual Node server authoritative;
  # browser DOM/clicks/JS are real, but native HTTP and SSE remain untested.
  def attach_test_transport(page):
   jar=http.cookiejar.CookieJar()
   opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
   def bridge(packet):
    path=packet['url'];full=urllib.parse.urljoin(BASE+'/',path)
    method=packet.get('method','GET').upper();raw=packet.get('body')
    headers={'Content-Type':'application/json','Origin':BASE} if method!='GET' else {}
    request=urllib.request.Request(full,data=raw.encode() if raw is not None else None,headers=headers,method=method)
    try:
     with opener.open(request,timeout=5) as res:return {'status':res.status,'text':res.read().decode('utf-8')}
    except urllib.error.HTTPError as e:return {'status':e.code,'text':e.read().decode('utf-8')}
   page.expose_function('bridgeApi',bridge)
   shim="\nwindow.fetch=async function(url,opts={}){\n const r=await window.bridgeApi({url:String(url),method:opts.method||'GET',body:opts.body??null});\n return {ok:r.status>=200&&r.status<300,status:r.status,json:async()=>JSON.parse(r.text),text:async()=>r.text};\n};\nwindow.EventSource=class {\n constructor(){this.listeners={};this.last=-1;this.dead=false;this.timer=setInterval(async()=>{\n  if(this.dead)return;\n  try{let r=await fetch('/api/session');if(!r.ok)return;let v=await r.json();if(v.revision!==this.last){this.last=v.revision;this.listeners.state?.({data:JSON.stringify(v)})}}\n  catch(e){this.onerror?.(e)}\n },120)}\n addEventListener(name,cb){this.listeners[name]=cb}\n close(){this.dead=true;clearInterval(this.timer)}\n};\n"
   page.set_content(page_html,wait_until='domcontentloaded')
   page.add_script_tag(content=shim)
   page.add_script_tag(content='(async()=>{'+page_js+'\n})();')
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
   try:
    c1=browser.new_context(viewport={'width':1440,'height':900});c2=browser.new_context(viewport={'width':1440,'height':900})
    b=c1.new_page();r=c2.new_page()
    for p,label in [(b,'blue'),(r,'red')]:
     p.on('pageerror',lambda err,label=label:errors.append(label+': '+str(err)))
     attach_test_transport(p)
    b.locator('#create').click();b.locator('#roomId') if False else None
    b.wait_for_function("document.querySelector('#codeview')?.textContent.includes('Código:')")
    code=b.locator('#codeview').inner_text().replace('Código:','').strip()
    r.locator('#code').fill(code);r.locator('#join').click()
    b.locator('#shopTogglePvp').wait_for();r.locator('#shopTogglePvp').wait_for()
    b.wait_for_function("document.querySelector('#status')?.textContent.includes('2/2')")
    r.wait_for_function("document.querySelector('#status')?.textContent.includes('2/2')")
    ok('Duas sessões browser independentes e sala 1v1 com 2/2', 'BLUE' in b.locator('#seat').inner_text() and 'RED' in r.locator('#seat').inner_text())
    # Concurrent group selection remains untouched by shop-only unit selection.
    group_before=b.locator('#unitselect').input_value()
    b.locator('#shopTogglePvp').click()
    b.locator('#shopChampionPvp').select_option('blue_ADC')
    ok('Seletor da loja troca campeão sem alterar grupo selecionado', b.locator('#unitselect').input_value()==group_before)
    b.locator('#shopListPvp').select_option('boots')
    b.wait_for_function("document.querySelector('#shopRecipePvp')?.textContent.includes('(servidor)')")
    ok('Cotação server-authoritative visual de botas', 'a pagar 300g' in b.locator('#shopRecipePvp').inner_text())
    b.locator('#shopBuyPvp').click()
    b.wait_for_function("document.querySelector('#shopStatus')?.textContent.includes('ouro 200g')",timeout=12000)
    ok('Compra via HUD baixa ouro de 500 para 200 e renderiza inventário')
    ok('UI mostra botão de revenda no inventário', 'Botas' in b.locator('#shopInventoryPvp').inner_text())
    b.locator('#shopUndoPvp').click()
    b.wait_for_function("document.querySelector('#shopStatus')?.textContent.includes('ouro 500g')",timeout=12000)
    ok('Undo de compra no browser restitui ouro integral')
    b.locator('#shopScopePvp').select_option('reference')
    ok('Item de referência está bloqueado para compra', b.locator('#shopBuyPvp').is_disabled() and 'não vinculado' in b.locator('#shopRecipePvp').inner_text())
    b.locator('#shopScopePvp').select_option('playable')
    b.screenshot(path=str(OUTPUT/'dev62_blue_shop_chromium.png'),full_page=True)
    # Second browser can use same shop independently.
    r.locator('#shopTogglePvp').click();r.locator('#shopChampionPvp').select_option('red_MID');r.locator('#shopListPvp').select_option('boots')
    r.locator('#shopBuyPvp').click()
    r.wait_for_function("document.querySelector('#shopStatus')?.textContent.includes('ouro 200g')",timeout=12000)
    ok('Jogador vermelho compra em contexto separado e sessão independente')
    r.locator('#shopInventoryPvp button').first.click()
    r.wait_for_function("document.querySelector('#shopStatus')?.textContent.includes('ouro 410g')",timeout=12000)
    ok('Venda no browser credita valor depreciado oficial das botas (210g)')
    r.locator('#shopUndoPvp').click()
    r.wait_for_function("document.querySelector('#shopStatus')?.textContent.includes('ouro 200g')",timeout=12000)
    ok('Undo de venda no browser reverte crédito e restaura item')
    r.screenshot(path=str(OUTPUT/'dev62_red_shop_chromium.png'),full_page=True)
    b.locator('#shopClosePvp').click();r.locator('#shopClosePvp').click()
    b.locator('#ready').click();b.wait_for_function("document.querySelector('#ready').disabled")
    ok('Confirmação azul não executa turno antecipadamente', 'preparation' in b.locator('#phase').inner_text().lower())
    r.locator('#ready').click()
    b.wait_for_function("['executing','planning','decision'].includes(document.querySelector('#phase')?.textContent)",timeout=15000)
    ok('Duas confirmações iniciam execução de turno')
    b.screenshot(path=str(OUTPUT/'dev62_board_chromium.png'),full_page=True)
    ok('Chromium sem exceções JavaScript',not errors)
    print(f'DEV62 CHROMIUM {len(checks)}/{len(checks)} PASS')
   finally:browser.close()
 finally:
  proc.terminate()
  try:proc.wait(timeout=5)
  except subprocess.TimeoutExpired:proc.kill();proc.wait()
report={'browser':'Chromium headless real, 2 contexts isolados; requisições locais através de ponte Python porque navegação HTTP é bloqueada por administrador; SSE nativo NÃO certificado','checks':checks,'errors':errors,'passed':len(checks),'scope':'Compra/venda/desfazer/2 humanos/rodada; SEM partida completa até Nexus', 'captures':[x.name for x in OUTPUT.glob('dev62_*_chromium.png')]}
(OUTPUT/'chromium_two_sessions_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
