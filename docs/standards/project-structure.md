# Mermaid-Render 專案結構規範

## 📋 目錄組織原則

### 1. 根目錄最小化原則

- **目標**：根目錄檔案數量控制在 15 個以內
- **實施**：配置檔案歸類到 `config/` 目錄
- **效果**：提升專案整潔度和可維護性

### 2. 配置檔案分類管理

```
config/
├── build/          # 建置相關配置
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── development/    # 開發工具配置
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── .prettierignore
├── testing/        # 測試配置
│   ├── jest.config.js
│   ├── jest.setup.js
│   └── playwright.config.ts
└── docker/         # Docker 相關
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    ├── Dockerfile.frontend
    └── Dockerfile.backend
```

### 3. 符號連結策略

由於 Next.js、ESLint 等工具要求配置檔案在根目錄，使用符號連結保持相容性：

```bash
# 建置配置（Next.js 要求）
next.config.js -> config/build/next.config.js
tailwind.config.js -> config/build/tailwind.config.js
postcss.config.js -> config/build/postcss.config.js

# 開發工具配置
.eslintrc.json -> config/development/.eslintrc.json
.prettierrc -> config/development/.prettierrc
.prettierignore -> config/development/.prettierignore
```

## 📂 標準目錄結構

```
Mermaid-Render/
├── 📄 核心檔案 (10個)
│   ├── package.json              # 專案配置
│   ├── tsconfig.json             # TypeScript 配置
│   ├── README.md                 # 專案說明
│   ├── LICENSE                   # 授權條款
│   ├── CLAUDE.md                 # AI 代理配置
│   ├── .env.example              # 環境變數範本
│   ├── .gitignore                # Git 忽略清單
│   └── next-env.d.ts             # Next.js 型別定義
├── 📁 config/                    # 配置檔案集中管理
│   ├── build/                    # 建置配置
│   ├── development/              # 開發工具配置
│   ├── testing/                  # 測試配置
│   └── docker/                   # 容器化配置
├── 📁 src/                       # 前端原始碼
│   ├── app/                      # Next.js App Router
│   ├── components/               # React 組件
│   ├── lib/                      # 核心邏輯與工具
│   ├── hooks/                    # 自訂 React Hooks
│   ├── types/                    # TypeScript 型別定義
│   └── styles/                   # 樣式檔案
├── 📁 server/                    # 後端原始碼
│   ├── src/                      # 伺服器源碼
│   ├── prisma/                   # 資料庫配置
│   └── tests/                    # 後端測試
├── 📁 tests/                     # 前端測試
│   └── e2e/                      # 端到端測試
├── 📁 docs/                      # 專案文件
│   ├── standards/                # 開發規範
│   ├── architecture/             # 技術架構
│   ├── prd/                      # 產品需求
│   └── stories/                  # 使用者故事
├── 📁 .github/                   # GitHub 工作流程
│   └── workflows/                # CI/CD 配置
├── 📁 .bmad-core/                # BMad Method 配置
├── 📁 .claude/                   # Claude Code 配置
└── 📁 .husky/                    # Git Hooks 配置
```

## 🎯 檔案命名規範

### 1. 配置檔案

- **格式**：`<tool>.<config-type>.js/json/ts`
- **範例**：`jest.config.js`、`playwright.config.ts`

### 2. 元件檔案

- **格式**：PascalCase + 功能描述
- **範例**：`GraphRenderer.tsx`、`NodeEditor.tsx`

### 3. 工具函數

- **格式**：camelCase + `.utils.ts`
- **範例**：`colorUtils.ts`、`geometryUtils.ts`

### 4. 型別定義

- **格式**：描述性名稱 + `.types.ts`
- **範例**：`graph.types.ts`、`api.types.ts`

## 📋 新檔案放置指南

### 🔧 新增配置檔案

1. **判斷類別**：建置/開發/測試/部署
2. **放置位置**：對應的 `config/` 子目錄
3. **建立連結**：如工具要求根目錄，建立符號連結
4. **更新文件**：在此規範中記錄

### 🎨 新增元件

```bash
# 基礎 UI 元件
src/components/ui/

# 圖表相關元件
src/components/graph/

# 佈局元件
src/components/layout/

# 動畫元件
src/components/animation/
```

### 🔧 新增工具函數

```bash
# 圖表邏輯
src/lib/graph/

# 通用工具
src/lib/utils/

# AI 整合
src/lib/ai/

# 狀態管理
src/lib/stores/
```

## 🧪 測試檔案組織

### 1. 前端測試

```bash
src/components/__tests__/     # 元件測試
src/lib/__tests__/           # 工具函數測試
tests/e2e/                   # 端到端測試
```

### 2. 後端測試

```bash
server/tests/unit/           # 單元測試
server/tests/integration/    # 整合測試
server/tests/api/           # API 測試
```

## 📝 維護原則

### 1. 定期清理

- 每月檢查根目錄檔案數量
- 移除不需要的臨時檔案
- 合併重複的配置

### 2. 文件同步

- 新增目錄時更新此規範
- README.md 保持最新的專案結構圖
- 確保符號連結正常運作

### 3. 自動化檢查

- Git pre-commit hook 檢查檔案數量
- CI/CD 驗證專案結構完整性

---

_遵循此規範可確保專案結構清晰、易於導航和維護_
