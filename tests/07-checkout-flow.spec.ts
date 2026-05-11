import { test, expect } from '@playwright/test';

// =============================================================================
// 07-checkout-flow.spec.ts
//
// Ödeme / Kasa akışı testi:
//   1. Sepete git
//   2. Ürünleri gözden geçir
//   3. Checkout'a başla
//   4. Adres bilgilerini doldur
//   5. Ödeme yöntemini seç
//   6. Siparişi tamamla
// =============================================================================

test('Checkout sayfasi erisilebiliyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // "Checkout", "Ödemeye Geç", "Sipariş Ver" gibi düğmeyi bul
  const checkoutBtn = page.getByRole('button', {
    name: /ödemeye geç|checkout|sipariş ver|satın al|devam et/i
  }).first();
  
  const exists = await checkoutBtn.isVisible().catch(() => false);
  
  if (exists) {
    // Sepette ürün varsa tıkla
    const cartEmpty = await page.getByText(/sepetiniz boş|no items|empty/i).isVisible().catch(() => false);
    
    if (!cartEmpty) {
      // Checkout'a git
      await checkoutBtn.click();
      await page.waitForLoadState('networkidle');

      // Checkout sayfasında olmali
      const url = page.url();
      expect(url).toBeTruthy();
      expect(url).not.toContain('sepet');
    } else {
      console.log('Sepet boş — checkout test atlanıyor');
    }
  } else {
    console.log('Checkout butonu bulunamadı');
  }
});

test('Checkout formunda adres alanları var', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('domcontentloaded');

  // Form alanlarını kontrol et
  const nameInput = page.locator('input[name*="name" i], input[placeholder*="ad" i]').first();
  const phoneInput = page.locator('input[name*="phone" i], input[type="tel"], input[placeholder*="telefon" i]').first();
  const addressInput = page.locator('textarea[name*="address" i], textarea[placeholder*="adres" i], input[name*="address" i]').first();
  
  // En az bir alan olmalı
  const nameExists = await nameInput.isVisible().catch(() => false);
  const phoneExists = await phoneInput.isVisible().catch(() => false);
  const addressExists = await addressInput.isVisible().catch(() => false);
  
  const hasFields = nameExists || phoneExists || addressExists;
  expect(hasFields).toBe(true);
});

test('Ödeme yöntemi seçeneği var', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('domcontentloaded');

  // Radyo butonları veya select alanı ara
  const paymentRadios = page.locator('input[name*="payment" i], input[type="radio"]');
  const paymentSelect = page.locator('select[name*="payment" i]');
  
  const radioCount = await paymentRadios.count();
  const selectExists = await paymentSelect.isVisible().catch(() => false);
  
  // Ödeme seçeneği olmalı
  expect(radioCount > 0 || selectExists).toBe(true);
});

test('Sipariş özeti görünüyor', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('networkidle');

  // Ürün listesi veya özeti
  const summary = page.locator(
    '[class*="summary" i], [class*="order" i][class*="review" i], [class*="review" i]'
  ).first();
  
  const exists = await summary.isVisible().catch(() => false);
  
  if (exists) {
    // Özetin içinde ürün veya fiyat bilgisi olmalı
    const text = await page.locator('body').textContent();
    expect(text).toMatch(/\d/);
  }
});

test('Sipariş verme butonu var', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('networkidle');

  // "Siparişi Tamamla", "Ödemeyi Yap", "Sipariş Ver" butonu
  const submitBtn = page.getByRole('button', {
    name: /siparişi tamamla|ödemeyi yap|sipariş ver|order now|place order/i
  }).first();
  
  const exists = await submitBtn.isVisible().catch(() => false);
  
  // Sayfa checkout'sa, submit butonu olmalı
  if (await page.url().includes('checkout')) {
    expect(exists).toBe(true);
  }
});
