const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Users\\MR\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1228\\chrome-headless-shell-win64\\chrome-headless-shell.exe', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const pages = ['/', '/listings', '/dashboard', '/dealer', '/categories', '/listings/test-slug', '/tenders', '/parts', '/search', '/admin'];
  for (const path of pages) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    let status = '?';
    try {
      const resp = await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle', timeout: 20000 });
      status = resp ? resp.status() : 'no-resp';
    } catch (e) {
      status = 'GOTO-ERR: ' + e.message.slice(0, 80);
    }
    await page.waitForTimeout(1500);
    const len = await page.evaluate(() => document.body ? document.body.innerHTML.length : 0);
    const txt = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 120).replace(/\n/g, ' ') : 'NO BODY');
    console.log(`PATH ${path} | STATUS ${status} | HTML_LEN ${len} | ERRORS ${errors.length}`);
    if (errors.length) console.log('   ' + errors.slice(0, 3).join(' || '));
    console.log('   TXT: ' + txt);
    await page.close();
  }
  await browser.close();
})();
