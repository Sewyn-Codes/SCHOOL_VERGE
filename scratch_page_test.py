
import urllib.request, json, asyncio, websockets

async def check():
    resp = urllib.request.urlopen('http://127.0.0.1:9222/json')
    pages = json.loads(resp.read().decode('utf-8'))
    print('Pages:', pages)
    ws = await websockets.connect(pages[0]['webSocketDebuggerUrl'])
    await ws.send(json.dumps({'id': 1, 'method': 'Runtime.evaluate', 'params': {'expression': '({href: location.href, title: document.title, htmlLen: document.documentElement.outerHTML.length, snippet: document.documentElement.outerHTML.slice(0, 300)})', 'returnByValue': True}}))
    res = json.loads(await ws.recv())
    print('PAGE INFO:', res)
    await ws.close()

asyncio.run(check())
