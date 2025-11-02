# Story 2.1: 基礎國際化框架建立

## Status

**已完成 (Completed)**

## Story

**身份**: 開發者
**需求**: 建立可擴展的國際化框架
**目的**: 為產品提供多語言支援基礎

## 驗收標準

### ✅ AC1: next-intl 框架整合

- [x] 安裝並配置 next-intl v4.3.5
- [x] 建立 i18n 請求配置
- [x] 設定 middleware 路由處理
- [x] 配置 Next.js 編譯選項

### ✅ AC2: 多語言路由系統

- [x] 實現 `/[locale]/` 動態路由
- [x] 支援 zh-TW、zh-CN、en 三種語言
- [x] 設定繁體中文為預設語言
- [x] 根路徑自動重定向到預設語言

### ✅ AC3: 語言包架構

- [x] 建立 `messages/` 目錄結構
- [x] 創建 JSON 格式語言包
- [x] 實現巢狀鍵值結構
- [x] 支援動態參數插值

### ✅ AC4: SSR 支援

- [x] 伺服器端多語言內容渲染
- [x] 正確的 HTML lang 屬性設定
- [x] SEO 友好的 hreflang 標記
- [x] 首屏渲染效能優化

## 技術實現

### 核心檔案

```typescript
// src/i18n/config.ts
export const locales = ['en', 'zh-TW', 'zh-CN'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'zh-TW'

// src/i18n/request.ts
export default getRequestConfig(async ({ locale }) => {
  const actualLocale = locale || defaultLocale
  const messages = (await import(`../../messages/${actualLocale}.json`)).default
  return {
    locale: actualLocale,
    messages,
  }
})

// src/middleware.ts
export default createMiddleware({
  locales,
  defaultLocale,
})
```

### 目錄結構

```
src/
├── app/
│   ├── [locale]/          # 國際化路由
│   │   ├── layout.tsx     # 語言 Layout
│   │   ├── page.tsx       # 首頁
│   │   └── editor/        # 編輯器頁面
│   ├── layout.tsx         # 根 Layout
│   └── page.tsx           # 重定向頁面
├── i18n/
│   ├── config.ts          # 語言配置
│   └── request.ts         # 請求配置
├── messages/
│   ├── en.json           # 英文語言包
│   ├── zh-TW.json        # 繁體中文語言包
│   └── zh-CN.json        # 簡體中文語言包
└── middleware.ts         # 路由中間件
```

### 語言包結構

```json
{
  "common": {
    "description": "AI 驅動的高客製化圖表展示平台",
    "welcome": "歡迎使用！ 🎉",
    "startEditing": "開始編輯"
  },
  "editor": {
    "title": "Mermaid 編輯器",
    "syntaxAnalysis": "語法分析",
    "syntaxCorrect": "語法正確"
  }
}
```

## 測試

### 功能測試

- [x] 不同語言路由正確解析
- [x] 預設語言自動重定向
- [x] 語言包正確載入
- [x] SSR 渲染正確語言內容

### 效能測試

- [x] 語言包載入時間 < 100ms
- [x] 路由切換延遲 < 200ms
- [x] 首屏渲染時間 < 2s
- [x] 記憶體使用合理

## Change Log

| Date       | Version | Description  | Author            |
| ---------- | ------- | ------------ | ----------------- |
| 2025-09-02 | 1.0     | 基礎框架實現 | Claude (sonnet-4) |

## 相關 Commits

- `b713860`: feat: implement internationalization (i18n) system
- `6e82597`: fix: resolve next-intl configuration issues
- `188eeab`: v6 (路由修復與配置優化)
