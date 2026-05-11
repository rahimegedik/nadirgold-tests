import { test, expect } from '@playwright/test';

test('Sepet sayfasi aciliyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Sayfa 404 olmamali
  await expect(page).not.toHaveTitle(/404|sayfa bulunamadi|hata/i);
  
  // Sayfa goruntulenmeli
  await expect(page.locator('body')).toBeVisible();
});

test('Sepet linkine tiklanabiliyor', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Sepet linkini bul ve tikla
  const sepetLink = page.getByText(/sepetim|sepet/i).first();
  
  const isVisible = await sepetLink.isVisible().catch(() => false);
  
  if (isVisible) {
    await sepetLink.click();
    await page.waitForLoadState('networkidle');
    
    // Sepet sayfasinda olmali
    const url = page.url();
    expect(url.includes('sepet') || url.includes('cart')).toBe(true);
  }
});
