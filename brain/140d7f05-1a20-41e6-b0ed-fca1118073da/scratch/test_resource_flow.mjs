import { CdpBrowser } from './cdp_browser.mjs';

const browser = new CdpBrowser(9222);
await browser.launchTab();

const TS = Date.now();
const providerEmail = `test.api.${TS}@example.com`;
const providerPassword = 'Password123!';

try {
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: providerEmail, password: providerPassword, phone: '01012345678' })
  });
  const regData = await regRes.json();
  const token = regData.data.token;

  await browser.navigate('http://localhost:4200/login');
  await browser.sleep(500);

  // Set in localStorage
  await browser.evaluate(`
    localStorage.setItem("dawwarha_jwt", ${JSON.stringify(token)});
    localStorage.setItem("dawwarha_user", JSON.stringify(${JSON.stringify(regData.data.user)}));
  `);

  browser.networkRequests = [];

  await browser.navigate('http://localhost:4200/dashboard');
  await browser.sleep(2000);

  console.log('Final URL:', await browser.getUrl());
  console.log('Network requests recorded:');
  for (const r of browser.networkRequests.filter(req => req.url.includes('/api/'))) {
    console.log(`  ${r.method} ${r.url} -> ${r.status}`);
  }

} finally {
  await browser.close();
}
