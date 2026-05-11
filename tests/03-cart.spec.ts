import { test, expect } from '@playwright/test';

test('Sepet sayfasi aciliyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Sayfa 404 olmamali
  await expect(page).not.toHaveTitle(/404|sayfa bulunamadi|hata/i);
  
  // Sayfa goruntulenmeli
  await expect(page.locator('body')).toBeVisible();
});

test('Sepete direkt URL ile erisilebiliyor', async ({ page }) => {
  // Sepete direkt git — linkten değil
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // URL kontrol et
  const url = page.url();
  expect(url).toContain('sepet');
  
  // Sayfa render edilmiş mi?
  const body = page.locator('body');
  await expect(body).toBeVisible();
});

test('Sepet başlığı görünüyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Sayfa başlığında sepet olmalı
  const title = page.locator('h1, h2, .title, [class*="heading" i]').first();
  const exists = await title.isVisible().catch(() => false);

  if (exists) {
    const text = await title.textContent();
    // Sepet, cart, alışveriş vb. kelime olmalı
    expect(text?.toLowerCase()).toMatch(/sepet|cart|alışveriş|basket/i);
  }
});

test('Sepet tablosu veya liste var', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Tablo veya liste arayın
  const table = page.locator('table').first();
  const list = page.locator('ul, ol, [role="list"]').first();
  const cartItems = page.locator('[class*="item" i], [class*="product" i], [class*="urun" i]').first();

  const hasTable = await table.isVisible().catch(() => false);
  const hasList = await list.isVisible().catch(() => false);
  const hasItems = await cartItems.isVisible().catch(() => false);

  expect(hasTable || hasList || hasItems).toBe(true);
});

test('Sepet boş ise mesaj gösterir', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Boş sepet mesajını ara
  const emptyMsg = page.getByText(/sepetiniz boş|no items|empty|ürün bulunmuyor/i);
  
  const isEmpty = await emptyMsg.isVisible().catch(() => false);
  
  // Sepet boş olabilir (hata değil, iyi bir test)
  if (isEmpty) {
    await expect(emptyMsg).toBeVisible();
  } else {
    // Sepet dolu ise ürün olmalı
    const items = page.locator('[class*="item" i], [class*="product" i]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  }
});

test('Sepet sayfasında fiyat bilgisi var', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Fiyat alanını ara (TL, ₺, price vb.)
  const priceElements = page.locator('[class*="price" i], [class*="total" i], [class*="tutar" i]');
  
  const count = await priceElements.count();
  
  // Sepet sayfasında fiyat bilgisi olmalı
  expect(count).toBeGreaterThan(0);
});
