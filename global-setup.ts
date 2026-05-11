import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function globalSetup(config: FullConfig) {
  const authDir = path.join(process.cwd(), 'playwright', '.auth');
  const authFile = path.join(authDir, 'user.json');

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('LOGIN_EMAIL veya LOGIN_PASSWORD .env içinde yok');
  }

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    slowMo: 500,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 1) Siteye git — önce Google SSO ekranı gelebilir
  await page.goto('https://www.nadirgold.work', {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });

  // 2) Google login ekranındaysa manuel giriş bekle
  if (page.url().includes('accounts.google.com')) {
    console.log('Google login ekranı açık. Lütfen manuel Google girişi yap.');

    await page.waitForURL(
      url => !url.toString().includes('accounts.google.com'),
      { timeout: 300_000 }
    );
  }

  // 3) NadirGold login sayfasına git
  await page.goto('https://www.nadirgold.work/hesap/giris', {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });

  // 4) Çerez popup varsa kapat
  await page.getByText(/Kabul Et/i).click().catch(() => {});
  await page.getByText(/Reddet/i).click().catch(() => {});

  // 5) NadirGold login bilgilerini doldur
  await page.getByPlaceholder(/E-posta adresi/i).fill(email);
  await page.getByPlaceholder(/Şifre|Sifre/i).fill(password);

  await page.getByRole('button', { name: /Giriş Yap|Giris Yap/i }).click();

  // 6) Login sayfasından çıkmasını bekle
  await page.waitForURL(
    url =>
      !url.toString().includes('/hesap/giris') &&
      !url.toString().includes('accounts.google.com'),
    { timeout: 120_000 }
  );

  // 7) Oturumu kaydet
  await context.storageState({ path: authFile });
  await browser.close();

  console.log('Oturum kaydedildi:', authFile);
}

export default globalSetup;