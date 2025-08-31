# Story 1.1: 專案基礎架構建立

## Status

Approved

## Story

**As a** 開發者,
**I want** 建立完整的 Monorepo 專案架構與開發環境,
**so that** 團隊能夠高效協作開發並確保程式碼品質

## Acceptance Criteria

1. 建立 Next.js 14 + TypeScript 前端專案結構
2. 建立 Node.js + Fastify 後端專案結構
3. 配置 ESLint、Prettier、Husky git hooks
4. 建立基礎 CI/CD 流程（GitHub Actions）
5. 配置開發環境 Docker 化（可選）
6. 建立基本的測試框架設定（Jest + Testing Library）
7. 專案能夠成功啟動並顯示「Hello World」頁面

## Tasks / Subtasks

- [ ] 前端專案建立 (AC: 1)
  - [ ] 初始化 Next.js 14 專案結構
  - [ ] 設定 App Router 模式
  - [ ] 配置 TypeScript 設定
  - [ ] 整合 Tailwind CSS 和 Radix UI
- [ ] 後端專案建立 (AC: 2)
  - [ ] 建立 Node.js + Fastify 後端結構
  - [ ] 設定 TypeScript 配置
  - [ ] 整合 Prisma ORM
  - [ ] 建立 API 路由結構
- [ ] 程式碼品質工具設定 (AC: 3)
  - [ ] 配置 ESLint 規則
  - [ ] 設定 Prettier 格式化
  - [ ] 整合 Husky git hooks
  - [ ] 配置 lint-staged 預提交檢查
- [ ] CI/CD 流程建立 (AC: 4)
  - [ ] 建立 GitHub Actions 工作流程
  - [ ] 設定自動化測試執行
  - [ ] 配置程式碼品質檢查
  - [ ] 設定分支保護規則
- [ ] Docker 開發環境 (AC: 5)
  - [ ] 建立 Dockerfile.frontend
  - [ ] 建立 Dockerfile.backend
  - [ ] 設定 docker-compose.yml
  - [ ] 配置開發環境變數
- [ ] 測試框架設定 (AC: 6)
  - [ ] 設定 Jest 測試環境
  - [ ] 整合 React Testing Library
  - [ ] 配置 Playwright E2E 測試
  - [ ] 設定測試覆蓋率報告
- [ ] Hello World 驗證 (AC: 7)
  - [ ] 前端專案成功啟動並顯示首頁
  - [ ] 後端 API 正常運行
  - [ ] 資料庫連接正常
  - [ ] 基本路由功能運作

## Dev Notes

### 專案結構規範

根據 docs/architecture/source-tree.md：

```
Mermaid-Render/
├── src/                  # 前端程式碼
│   ├── app/             # Next.js App Router
│   ├── components/      # React 組件
│   ├── lib/            # 工具庫
│   └── styles/         # 樣式檔案
├── server/              # 後端程式碼
│   ├── src/            # 源碼
│   ├── prisma/         # 資料庫配置
│   └── tests/          # 後端測試
├── .github/            # GitHub Actions
├── docs/               # 專案文件
└── package.json        # 專案配置
```

### 技術棧要求

根據 docs/architecture/tech-stack.md：

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + Radix UI
- **後端**: Node.js + Fastify + Prisma ORM
- **資料庫**: PostgreSQL
- **開發工具**: ESLint + Prettier + Husky

### 核心依賴套件

**前端核心依賴**:

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-tooltip": "^1.0.0"
}
```

**後端核心依賴**:

```json
{
  "fastify": "^4.24.0",
  "@prisma/client": "^5.6.0",
  "typescript": "^5.0.0"
}
```

**開發工具依賴**:

```json
{
  "eslint": "^8.0.0",
  "prettier": "^3.0.0",
  "husky": "^8.0.0",
  "jest": "^29.0.0",
  "playwright": "^1.40.0"
}
```

### 關鍵實作檢查點

**前端檢查點**:

```bash
src/app/layout.tsx          # 根佈局檔案
src/app/page.tsx           # 主頁面
src/components/            # 組件庫目錄
tailwind.config.js         # Tailwind 配置
next.config.js             # Next.js 配置
```

**後端檢查點**:

```bash
server/src/server.ts       # 主服務入口
server/src/routes/         # API 路由
server/src/services/       # 業務邏輯
server/prisma/schema.prisma # 資料庫架構
```

**CI/CD 檢查點**:

```bash
.github/workflows/ci.yml  # CI 工作流程
.github/workflows/cd.yml  # CD 工作流程
.husky/pre-commit         # Git pre-commit hook
```

### Testing

**測試檔案位置**: `__tests__/` 目錄和各模組 `*.test.ts` 檔案
**測試框架**: Jest + React Testing Library + Playwright
**覆蓋率要求**: 單元測試 > 80%
**測試類型**:

- 單元測試: 組件和函式測試
- 整合測試: API 端點測試
- E2E 測試: 關鍵使用者流程

**驗證命令**:

```bash
npm run dev               # 前端啟動
npm run server            # 後端啟動
npm run test              # 測試執行
npm run build             # 建置驗證
```

## Change Log

| Date       | Version | Description    | Author       |
| ---------- | ------- | -------------- | ------------ |
| 2025-08-31 | 1.0     | 初始建立       | Scrum Master |
| 2025-08-31 | 2.0     | 按標準範本重構 | Scrum Master |

## Dev Agent Record

此章節將由開發代理在實作期間填寫。

### Agent Model Used

待開發代理填寫

### Debug Log References

待開發代理填寫

### Completion Notes List

待開發代理填寫

### File List

待開發代理填寫

## QA Results

此章節將由 QA 代理在完成故事實作後填寫驗證結果。
