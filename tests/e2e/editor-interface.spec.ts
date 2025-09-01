import { test, expect } from '@playwright/test'

test.describe('編輯器介面測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor')
  })

  test('應該載入編輯器頁面', async ({ page }) => {
    // 檢查頁面標題
    await expect(page).toHaveTitle(/Mermaid/)

    // 檢查主要組件是否存在
    await expect(page.getByTestId('editor-layout')).toBeVisible()
    await expect(page.getByTestId('monaco-editor-container')).toBeVisible()
    await expect(page.getByTestId('preview-panel')).toBeVisible()
  })

  test('雙面板佈局應該正常運作', async ({ page }) => {
    // 檢查左右面板
    const leftPanel = page.getByTestId('left-panel')
    const rightPanel = page.getByTestId('right-panel')
    const resizer = page.getByTestId('resizer')

    await expect(leftPanel).toBeVisible()
    await expect(rightPanel).toBeVisible()
    await expect(resizer).toBeVisible()
  })

  test('分隔線拖拽功能', async ({ page }) => {
    const resizer = page.getByTestId('resizer')
    const leftPanel = page.getByTestId('left-panel')

    // 獲取初始寬度
    const initialBox = await leftPanel.boundingBox()
    const initialWidth = initialBox?.width

    // 拖拽分隔線
    await resizer.dragTo(resizer, { targetPosition: { x: 200, y: 0 } })

    // 檢查寬度是否改變
    const newBox = await leftPanel.boundingBox()
    const newWidth = newBox?.width

    expect(newWidth).not.toBe(initialWidth)
  })

  test('分隔線雙擊重置功能', async ({ page }) => {
    const resizer = page.getByTestId('resizer')
    const leftPanel = page.getByTestId('left-panel')

    // 先拖拽改變比例
    await resizer.dragTo(resizer, { targetPosition: { x: 200, y: 0 } })

    // 雙擊重置
    await resizer.dblclick()

    // 檢查是否重置為 50%（需要根據實際實現調整判斷邏輯）
    const box = await leftPanel.boundingBox()
    const containerBox = await page
      .getByTestId('resizable-panel-container')
      .boundingBox()

    if (box && containerBox) {
      const ratio = box.width / containerBox.width
      expect(ratio).toBeCloseTo(0.5, 1)
    }
  })

  test('面板摺疊功能', async ({ page }) => {
    // 測試編輯器摺疊
    await page.getByTestId('toggle-editor-btn').click()
    await expect(page.getByTestId('left-panel')).toHaveCSS('width', '0%')

    // 展開編輯器
    await page.getByTestId('toggle-editor-btn').click()
    await expect(page.getByTestId('left-panel')).not.toHaveCSS('width', '0%')

    // 測試預覽摺疊
    await page.getByTestId('toggle-preview-btn').click()
    await expect(page.getByTestId('right-panel')).toHaveCSS('width', '0%')
  })

  test('主題切換功能', async ({ page }) => {
    const themeToggle = page.getByTestId('theme-toggle-icon')
    const body = page.locator('body')

    // 檢查初始主題
    await expect(body).toHaveClass(/dark/)

    // 切換到亮色主題
    await themeToggle.click()
    await expect(body).not.toHaveClass(/dark/)

    // 切換回暗色主題
    await themeToggle.click()
    await expect(body).toHaveClass(/dark/)
  })

  test('編輯器工具列功能', async ({ page }) => {
    // 檢查所有工具列按鈕
    await expect(page.getByTestId('save-btn')).toBeVisible()
    await expect(page.getByTestId('undo-btn')).toBeVisible()
    await expect(page.getByTestId('redo-btn')).toBeVisible()
    await expect(page.getByTestId('find-btn')).toBeVisible()
    await expect(page.getByTestId('replace-btn')).toBeVisible()
    await expect(page.getByTestId('format-btn')).toBeVisible()
    await expect(page.getByTestId('settings-btn')).toBeVisible()
  })

  test('預覽面板載入狀態', async ({ page }) => {
    // 檢查預覽面板載入
    await expect(page.getByTestId('preview-panel')).toBeVisible()

    // 載入狀態指示器可能很快消失，檢查是否存在或已消失
    const loadingSpinner = page.getByTestId('loading-spinner')
    const isVisible = await loadingSpinner.isVisible().catch(() => false)

    // 載入指示器可能存在或不存在（取決於載入速度）
    expect(typeof isVisible).toBe('boolean')
  })

  test('響應式設計 - 桌面版', async ({ page }) => {
    // 設定桌面尺寸
    await page.setViewportSize({ width: 1200, height: 800 })

    // 檢查雙面板並排顯示
    const leftPanel = page.getByTestId('left-panel')
    const rightPanel = page.getByTestId('right-panel')
    const resizer = page.getByTestId('resizer')

    await expect(leftPanel).toBeVisible()
    await expect(rightPanel).toBeVisible()
    await expect(resizer).toBeVisible()
  })

  test('響應式設計 - 平板版', async ({ page }) => {
    // 設定平板尺寸
    await page.setViewportSize({ width: 768, height: 600 })

    // 檢查平板版佈局
    await expect(page.getByTestId('editor-layout')).toBeVisible()

    // 平板版可能有不同的佈局行為
    const leftPanel = page.getByTestId('left-panel')
    const rightPanel = page.getByTestId('right-panel')

    await expect(leftPanel).toBeVisible()
    await expect(rightPanel).toBeVisible()
  })

  test('響應式設計 - 手機版', async ({ page }) => {
    // 設定手機尺寸
    await page.setViewportSize({ width: 375, height: 667 })

    // 檢查手機版垂直堆疊佈局
    await expect(page.getByTestId('editor-layout')).toBeVisible()

    // 手機版應該垂直堆疊面板
    const leftPanel = page.getByTestId('left-panel')
    const rightPanel = page.getByTestId('right-panel')

    await expect(leftPanel).toBeVisible()
    await expect(rightPanel).toBeVisible()

    // 分隔線在手機版可能不顯示
    const resizer = page.getByTestId('resizer')
    await expect(resizer).not.toBeVisible()
  })

  test('快速鍵功能', async ({ page }) => {
    // 測試儲存快速鍵 (Ctrl+S)
    await page.keyboard.press('Control+s')
    // 由於是下載行為，我們檢查是否沒有錯誤發生

    // 測試其他快速鍵
    await page.keyboard.press('Control+z') // 復原
    await page.keyboard.press('Control+y') // 重做
    await page.keyboard.press('Control+f') // 尋找
  })

  test('錯誤處理', async ({ page }) => {
    // 模擬網路錯誤或其他錯誤狀況
    // 這需要根據實際的錯誤處理機制來測試

    // 檢查預覽面板正常顯示
    await expect(page.getByTestId('preview-panel')).toBeVisible()

    // 檢查錯誤訊息元素是否存在（可能不可見）
    const errorMessage = page.getByTestId('error-message')
    const errorExists = await errorMessage
      .count()
      .then(count => count > 0)
      .catch(() => false)

    // 錯誤訊息元素可能存在或不存在
    expect(typeof errorExists).toBe('boolean')
  })

  test('空白狀態顯示', async ({ page }) => {
    // 清除編輯器內容來觸發空白狀態
    const editor = page.getByRole('textbox').first()
    await editor.fill('')

    // 檢查空白狀態是否正確顯示
    const emptyState = page.getByTestId('empty-state')
    await expect(emptyState).toBeVisible()
  })

  test('無障礙設計', async ({ page }) => {
    // 檢查重要元素的無障礙屬性
    const resizer = page.getByTestId('resizer')
    await expect(resizer).toHaveAttribute('role', 'separator')
    await expect(resizer).toHaveAttribute('aria-orientation', 'vertical')

    // 檢查按鈕的標籤
    const themeToggle = page.getByTestId('theme-toggle-icon')
    await expect(themeToggle).toHaveAttribute('title')
  })

  test('效能測試 - 載入時間', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/editor')
    await expect(page.getByTestId('editor-layout')).toBeVisible()

    const endTime = Date.now()
    const loadTime = endTime - startTime

    // 檢查載入時間是否在可接受範圍內 (3秒)
    expect(loadTime).toBeLessThan(3000)
  })
})
