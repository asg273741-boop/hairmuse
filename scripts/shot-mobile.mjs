// Captures true mobile-viewport screenshots via Chrome DevTools Protocol.
// Usage: node scripts/shot-mobile.mjs <url> <outfile> [menuOpen]
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET = process.argv[2] ?? 'http://localhost:4321/';
const OUT = process.argv[3] ?? 'mobile.png';
const MENU_OPEN = process.argv[4] === 'menu';
const PORT = 9224;

let spawned = null;
async function portAlive() {
  try {
    return (await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok;
  } catch {
    return false;
  }
}
if (!(await portAlive())) {
  spawned = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), 'hm-shot-'))}`,
      '--no-first-run',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );
}

let wsUrl;
for (let i = 0; i < 60; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const page = list.find((t) => t.type === 'page');
    if (page) {
      wsUrl = page.webSocketDebuggerUrl;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 250));
}
if (!wsUrl) throw new Error('no debugging target');

const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let msgId = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) {
    pending.get(data.id)(data);
    pending.delete(data.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
});
await send('Page.navigate', { url: TARGET });
await new Promise((r) => setTimeout(r, 3000));

if (MENU_OPEN) {
  await send('Runtime.evaluate', {
    expression: `(() => { const t = document.getElementById('nav-toggle'); t.checked = true; return 'ok'; })()`,
    returnByValue: true,
  });
  await new Promise((r) => setTimeout(r, 600));
}

const { result } = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(OUT, Buffer.from(result.data, 'base64'));
console.log('saved', OUT);
ws.close();
if (spawned) spawned.kill();
