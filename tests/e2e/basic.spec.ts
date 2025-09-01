import { test, expect } from '@playwright/test'

test.describe('基本功能測試', () => {
  test('主頁面應該正確載入', async ({ page }) => {
    await page.goto('/')

    // 檢查頁面標題
    await expect(page).toHaveTitle(/Mermaid Render/)

    // 檢查主要標題
    await expect(
      page.getByRole('heading', { name: /mermaid render/i })
    ).toBeVisible()

    // 檢查描述文字
    await expect(page.getByText(/ai 驅動的高客製化圖表展示平台/i)).toBeVisible()

    // 檢查 Hello World 區塊
    await expect(page.getByText(/hello world!/i)).toBeVisible()
  })

  test('應該顯示專案技術資訊', async ({ page }) => {
    await page.goto('/')

    // 檢查技術棧資訊
    await expect(page.getByText('Next.js 14')).toBeVisible()
    await expect(page.getByText('TypeScript')).toBeVisible()
    await expect(page.getByText('Tailwind CSS')).toBeVisible()
    await expect(page.getByText('✓ 運行中')).toBeVisible()
  })

  test('響應式設計測試', async ({ page }) => {
    // 桌面檢視
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /mermaid render/i })
    ).toBeVisible()

    // 平板檢視
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(
      page.getByRole('heading', { name: /mermaid render/i })
    ).toBeVisible()

    // 手機檢視
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(
      page.getByRole('heading', { name: /mermaid render/i })
    ).toBeVisible()
  })
})
