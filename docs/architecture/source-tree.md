# Mermaid-Render 原始碼樹狀結構

## 專案整體目錄結構

```
Mermaid-Render/
├── 📁 .bmad-core/                    # BMad Method 核心配置
│   ├── 📁 tasks/                     # 任務範本
│   ├── 📁 templates/                 # 文件範本
│   ├── 📁 checklists/               # 檢查清單
│   ├── 📁 data/                     # 參考資料
│   └── 📁 utils/                    # 實用工具
├── 📁 .claude/                      # Claude Code 配置
│   └── 📁 commands/                 # Claude Code 指令規範
│       ├── 📄 standards.md          # 規範管理指令
│       ├── 📄 git.md               # Git 相關指令（待建立）
│       └── 📄 deploy.md            # 部署相關指令（待建立）
├── 📁 docs/                         # 文件目錄
│   ├── 📄 prd.md                    # 專案需求文件
│   ├── 📄 architecture.md           # 技術架構文件
│   ├── 📁 standards/                # 統一規範目錄
│   │   ├── 📄 index.md             # 規範總覽索引
│   │   ├── 📄 language-guidelines.md # 語言使用規範
│   │   ├── 📄 file-naming.md       # 檔案命名規範（待建立）
│   │   ├── 📄 api-design.md        # API 設計規範（待建立）
│   │   └── 📄 testing.md           # 測試規範（待建立）
│   ├── 📁 architecture/             # 架構細節
│   │   ├── 📄 coding-standards.md   # 開發標準
│   │   ├── 📄 tech-stack.md        # 技術棧說明
│   │   └── 📄 source-tree.md       # 目錄結構文件
│   ├── 📁 prd/                     # PRD分片文件
│   ├── 📁 qa/                      # 測試文件
│   └── 📁 stories/                 # 使用者故事
├── 📄 CLAUDE.md                    # Claude Code 專案配置文件
├── 📁 config/                      # 配置檔案集中管理
│   ├── 📁 build/                   # 建置配置
│   │   ├── 📄 next.config.js       # Next.js 配置
│   │   ├── 📄 tailwind.config.js   # Tailwind CSS 配置
│   │   └── 📄 postcss.config.js    # PostCSS 配置
│   ├── 📁 development/             # 開發工具配置
│   │   ├── 📄 .eslintrc.json       # ESLint 規則
│   │   ├── 📄 .prettierrc          # Prettier 格式化
│   │   └── 📄 .prettierignore      # Prettier 忽略檔案
│   ├── 📁 testing/                 # 測試配置
│   │   ├── 📄 jest.config.js       # Jest 測試配置
│   │   ├── 📄 jest.setup.js        # Jest 設定檔
│   │   └── 📄 playwright.config.ts # Playwright E2E 配置
│   └── 📁 docker/                  # Docker 相關
│       ├── 📄 docker-compose.yml   # 完整服務編排
│       ├── 📄 docker-compose.dev.yml # 開發環境配置
│       ├── 📄 Dockerfile.frontend  # 前端映像檔
│       └── 📄 Dockerfile.backend   # 後端映像檔
├── 📁 src/                         # 前端原始碼
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── 📄 layout.tsx           # 根佈局
│   │   ├── 📄 page.tsx             # 首頁
│   │   ├── 📄 globals.css          # 全域樣式
│   │   ├── 📁 graph/               # 圖表相關頁面
│   │   │   ├── 📄 page.tsx         # 圖表編輯頁
│   │   │   └── 📁 [id]/            # 動態路由
│   │   │       └── 📄 page.tsx     # 特定圖表檢視
│   │   ├── 📁 share/               # 分享功能
│   │   │   └── 📁 [code]/          # 分享連結
│   │   │       └── 📄 page.tsx     # 分享檢視頁面
│   │   └── 📁 api/                 # API 路由
│   │       ├── 📁 graphs/          # 圖表API
│   │       │   ├── 📄 route.ts     # CRUD操作
│   │       │   └── 📁 [id]/
│   │       │       ├── 📄 route.ts # 單一圖表操作
│   │       │       └── 📁 share/
│   │       │           └── 📄 route.ts # 分享功能
│   │       └── 📁 ai/              # AI相關API
│   │           ├── 📄 generate.ts  # 圖表生成
│   │           └── 📄 optimize.ts  # 圖表最佳化
│   ├── 📁 components/              # React組件
│   │   ├── 📁 ui/                  # 基礎UI組件
│   │   │   ├── 📄 button.tsx       # 按鈕組件
│   │   │   ├── 📄 input.tsx        # 輸入組件
│   │   │   ├── 📄 modal.tsx        # 模態框
│   │   │   └── 📄 tooltip.tsx      # 提示框
│   │   ├── 📁 graph/               # 圖表相關組件
│   │   │   ├── 📄 GraphRenderer.tsx     # 主要圖表渲染器
│   │   │   ├── 📄 GraphControls.tsx     # 圖表控制面板
│   │   │   ├── 📄 GraphToolbar.tsx      # 工具列
│   │   │   ├── 📄 NodeEditor.tsx        # 節點編輯器
│   │   │   ├── 📄 EdgeEditor.tsx        # 邊線編輯器
│   │   │   └── 📄 LayoutSelector.tsx    # 佈局選擇器
│   │   ├── 📁 animation/           # 動畫組件
│   │   │   ├── 📄 SequencePlayer.tsx    # 序列播放器
│   │   │   ├── 📄 AnimationControls.tsx # 動畫控制器
│   │   │   └── 📄 CameraController.tsx  # 相機控制器
│   │   ├── 📁 editor/              # 編輯器組件
│   │   │   ├── 📄 MermaidEditor.tsx     # Mermaid編輯器
│   │   │   ├── 📄 CodeEditor.tsx        # 程式碼編輯器
│   │   │   └── 📄 PreviewPane.tsx       # 預覽面板
│   │   └── 📁 layout/              # 佈局組件
│   │       ├── 📄 Header.tsx       # 頁頭
│   │       ├── 📄 Sidebar.tsx      # 側邊欄
│   │       └── 📄 Footer.tsx       # 頁腳
│   ├── 📁 hooks/                   # 自訂React Hooks
│   │   ├── 📄 useGraph.ts          # 圖表狀態管理
│   │   ├── 📄 useGraphAnimation.ts # 圖表動畫
│   │   ├── 📄 useGraphLayout.ts    # 佈局管理
│   │   ├── 📄 useMermaidParser.ts  # Mermaid解析
│   │   └── 📄 useShareLink.ts      # 分享連結管理
│   ├── 📁 lib/                     # 核心函式庫
│   │   ├── 📁 graph/               # 圖表核心邏輯
│   │   │   ├── 📄 types.ts         # 圖表型別定義
│   │   │   ├── 📄 GraphRenderer.ts # 圖表渲染引擎
│   │   │   ├── 📄 LayoutEngine.ts  # 佈局引擎
│   │   │   ├── 📄 AnimationEngine.ts # 動畫引擎
│   │   │   └── 📄 CytoscapeAdapter.ts # Cytoscape適配器
│   │   ├── 📁 parsers/             # 解析器
│   │   │   ├── 📄 MermaidParser.ts # Mermaid解析器
│   │   │   ├── 📄 GraphMLParser.ts # GraphML解析器
│   │   │   └── 📄 JsonParser.ts    # JSON解析器
│   │   ├── 📁 ai/                  # AI整合
│   │   │   ├── 📄 OpenAIService.ts # OpenAI服務
│   │   │   ├── 📄 PromptTemplates.ts # 提示範本
│   │   │   └── 📄 GraphOptimizer.ts # 圖表最佳化
│   │   ├── 📁 utils/               # 實用工具
│   │   │   ├── 📄 colorUtils.ts    # 顏色工具
│   │   │   ├── 📄 geometryUtils.ts # 幾何計算
│   │   │   ├── 📄 stringUtils.ts   # 字串處理
│   │   │   └── 📄 validationUtils.ts # 驗證工具
│   │   └── 📁 stores/              # 狀態管理
│   │       ├── 📄 graphStore.ts    # 圖表狀態
│   │       ├── 📄 uiStore.ts       # UI狀態
│   │       └── 📄 settingsStore.ts # 設定狀態
│   ├── 📁 styles/                  # 樣式文件
│   │   ├── 📄 globals.css          # 全域樣式
│   │   ├── 📄 components.css       # 組件樣式
│   │   └── 📄 graph.css           # 圖表專用樣式
│   └── 📁 types/                   # TypeScript型別定義
│       ├── 📄 graph.types.ts       # 圖表型別
│       ├── 📄 api.types.ts         # API型別
│       ├── 📄 ui.types.ts          # UI型別
│       └── 📄 global.d.ts          # 全域型別宣告
├── 📁 server/                      # 後端程式碼
│   ├── 📄 index.ts                 # 伺服器入口
│   ├── 📁 routes/                  # API路由
│   │   ├── 📄 graphs.ts            # 圖表路由
│   │   ├── 📄 share.ts             # 分享路由
│   │   ├── 📄 ai.ts                # AI路由
│   │   └── 📄 auth.ts              # 認證路由
│   ├── 📁 services/                # 業務邏輯服務
│   │   ├── 📄 GraphService.ts      # 圖表服務
│   │   ├── 📄 ShareService.ts      # 分享服務
│   │   ├── 📄 AIService.ts         # AI服務
│   │   └── 📄 UserService.ts       # 使用者服務
│   ├── 📁 middleware/              # 中介軟體
│   │   ├── 📄 auth.ts              # 認證中介軟體
│   │   ├── 📄 rateLimit.ts         # 頻率限制
│   │   └── 📄 errorHandler.ts      # 錯誤處理
│   ├── 📁 utils/                   # 伺服器工具
│   │   ├── 📄 database.ts          # 資料庫工具
│   │   ├── 📄 redis.ts             # Redis工具
│   │   └── 📄 validation.ts        # 驗證工具
│   └── 📁 types/                   # 後端型別
│       ├── 📄 api.types.ts         # API型別
│       └── 📄 database.types.ts    # 資料庫型別
├── 📁 prisma/                      # Prisma ORM
│   ├── 📄 schema.prisma            # 資料庫架構
│   ├── 📄 seed.ts                  # 資料庫種子
│   └── 📁 migrations/              # 資料庫遷移
├── 📁 tests/                       # 測試程式碼
│   ├── 📁 __mocks__/               # Mock檔案
│   ├── 📁 components/              # 組件測試
│   ├── 📁 hooks/                   # Hook測試
│   ├── 📁 lib/                     # 函式庫測試
│   ├── 📁 api/                     # API測試
│   ├── 📁 e2e/                     # 端到端測試
│   └── 📄 setup.ts                 # 測試設置
├── 📁 public/                      # 靜態資源
│   ├── 📁 images/                  # 圖片資源
│   ├── 📁 icons/                   # 圖示
│   └── 📄 favicon.ico              # 網站圖示
├── 📄 package.json                 # 專案相依性
├── 📄 package-lock.json            # 鎖定版本
├── 📄 tsconfig.json                # TypeScript配置
├── 📄 next.config.js               # Next.js配置
├── 📄 tailwind.config.js           # Tailwind配置
├── 📄 postcss.config.js            # PostCSS配置
├── 📄 .eslintrc.json               # ESLint配置
├── 📄 .prettierrc                  # Prettier配置
├── 📄 .gitignore                   # Git忽略檔案
├── 📄 .env.example                 # 環境變數範例
├── 📄 .env.local                   # 本地環境變數
├── 📄 README.md                    # 專案說明
├── 📄 LICENSE                      # 授權條款
└── 📄 docker-compose.yml           # Docker配置
```

## 關鍵檔案說明

### 核心應用程式

- `src/app/layout.tsx` - Next.js根佈局，定義全域設定
- `src/app/page.tsx` - 主頁面，提供圖表編輯介面
- `src/components/graph/GraphRenderer.tsx` - 核心圖表渲染組件
- `src/lib/graph/GraphRenderer.ts` - 圖表渲染引擎核心邏輯

### 圖表處理

- `src/lib/parsers/MermaidParser.ts` - Mermaid語法解析器
- `src/lib/graph/LayoutEngine.ts` - 多種佈局演算法實作
- `src/lib/graph/AnimationEngine.ts` - 動畫系統核心
- `src/hooks/useGraphAnimation.ts` - 動畫控制Hook

### AI整合

- `src/lib/ai/OpenAIService.ts` - OpenAI API整合服務
- `src/lib/ai/PromptTemplates.ts` - AI提示範本管理
- `src/app/api/ai/generate.ts` - AI圖表生成API

### 狀態管理

- `src/lib/stores/graphStore.ts` - 圖表資料狀態
- `src/lib/stores/uiStore.ts` - 使用者介面狀態
- `src/hooks/useGraph.ts` - 圖表操作Hook

### 後端服務

- `server/index.ts` - Fastify伺服器入口
- `server/services/GraphService.ts` - 圖表業務邏輯
- `server/routes/graphs.ts` - 圖表API路由
- `prisma/schema.prisma` - 資料庫架構定義

## 開發工作流程

### 1. 新功能開發流程

```bash
# 1. 建立功能分支
git checkout -b feature/new-feature

# 2. 依序開發
# - 定義型別 (src/types/)
# - 實作核心邏輯 (src/lib/)
# - 建立Hook (src/hooks/)
# - 開發組件 (src/components/)
# - 建立API路由 (src/app/api/)
# - 撰寫測試 (tests/)

# 3. 測試與整合
npm run test
npm run build
npm run lint

# 4. 提交與合併
git commit -m "feat: 新功能描述"
git push origin feature/new-feature
```

### 2. 資料夾使用指南

**新增組件時：**

1. 基礎UI組件 → `src/components/ui/`
2. 圖表相關組件 → `src/components/graph/`
3. 佈局組件 → `src/components/layout/`

**新增API時：**

1. App Router API → `src/app/api/`
2. 後端邏輯 → `server/services/`
3. 路由處理 → `server/routes/`

**新增工具函數時：**

1. 前端工具 → `src/lib/utils/`
2. 後端工具 → `server/utils/`
3. 共用型別 → `src/types/`

---

_此結構設計確保程式碼組織清晰、易於維護且符合 Next.js 最佳實務_
