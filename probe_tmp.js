const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const consoleMsgs = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message + '\n' + (err.stack || ''));
  });
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('GOTO ERROR: ' + e.message);
  }
  await page.waitForTimeout(4000);
  const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 500) : 'NO BODY');
  const bodyHTMLLen = await page.evaluate(() => document.body ? document.body.innerHTML.length : 0);
  console.log('=== PAGE ERRORS ===');
  console.log(errors.join('\n---\n') || 'NONE');
  console.log('=== CONSOLE (errors/warnings) ===');
  console.log(consoleMsgs.slice(0, 30).join('\n') || 'NONE');
  console.log('=== BODY TEXT (first 500) ===');
  console.log(bodyText);
  console.log('=== BODY HTML LENGTH ===', bodyHTMLLen);
  await browser.close();
})();
