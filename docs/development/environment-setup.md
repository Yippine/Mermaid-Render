# 開發環境設定指南

本文件提供 Mermaid-Render 專案的完整開發環境設定指南，確保所有開發者能夠快速建立一致的開發環境。

## 📋 系統需求

### 基本需求
- **Node.js**: 20.0.0 或更高版本
- **npm**: 9.0.0 或更高版本 (或 yarn 3.0+, pnpm 8.0+)
- **Git**: 2.34.0 或更高版本
- **操作系統**: Windows 10+, macOS 12+, Ubuntu 20.04+

### 推薦工具
- **IDE**: VS Code 1.80+ (推薦)
- **瀏覽器**: Chrome 100+, Firefox 100+, Safari 15+
- **終端**: PowerShell 7+ (Windows), zsh (macOS/Linux)

## 🚀 快速開始

### 1. 克隆專案
```bash
# 克隆專案倉庫
git clone https://github.com/your-org/mermaid-render.git
cd mermaid-render

# 檢查 Node.js 版本
node --version  # 應該是 v20.0.0+
npm --version   # 應該是 9.0.0+
```

### 2. 安裝依賴
```bash
# 安裝所有依賴 (根目錄 + 前端 + 後端)
npm install

# 或使用指定的套件管理器
# yarn install
# pnpm install
```

### 3. 環境變數設定
```bash
# 複製環境變數範本
cp .env.example .env.local
cp server/.env.example server/.env.local

# 編輯環境變數 (詳細配置見下方)
nano .env.local
nano server/.env.local
```

### 4. 資料庫設定
```bash
# 啟動本地 PostgreSQL (使用 Docker)
docker-compose -f docker-compose.dev.yml up -d postgres redis

# 等待資料庫啟動 (約 10-15 秒)
sleep 15

# 執行資料庫遷移
cd server
npx prisma migrate dev
npx prisma generate

# 載入種子資料
npx prisma db seed
```

### 5. 啟動開發服務
```bash
# 終端 1: 啟動前端開發服務器
npm run dev

# 終端 2: 啟動後端開發服務器
npm run server

# 終端 3: 啟動資料庫服務 (如果未使用 Docker)
npm run db:dev
```

### 6. 驗證安裝
打開瀏覽器訪問：
- **前端**: http://localhost:3000
- **後端 API**: http://localhost:4000/health
- **API 文件**: http://localhost:4000/docs

## 🔧 詳細配置

### 環境變數配置

#### 前端環境變數 (.env.local)
```env
# Next.js 配置
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_VERSION=1.0.0-dev

# API 配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws

# 外部服務 (開發環境可選)
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=

# 功能開關
NEXT_PUBLIC_ENABLE_SEQUENCE_MODE=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=false
NEXT_PUBLIC_ENABLE_COLLABORATION=false
```

#### 後端環境變數 (server/.env.local)
```env
# 應用配置
NODE_ENV=development
PORT=4000
HOST=localhost

# 資料庫配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/mermaidrender_dev"
REDIS_URL="redis://localhost:6379"

# 認證配置
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=24h

# 外部服務 API 金鑰
OPENAI_API_KEY=your-openai-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# 開發工具
ENABLE_SWAGGER=true
ENABLE_DEBUG_LOGS=true
ENABLE_CORS=true

# 效能設定
RENDER_CACHE_TTL=300
EXPORT_QUEUE_CONCURRENCY=3
```

### 資料庫設定

#### 使用 Docker (推薦)
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: mermaid-render-postgres-dev
    environment:
      POSTGRES_DB: mermaidrender_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    command: postgres -c log_statement=all

  redis:
    image: redis:7-alpine
    container_name: mermaid-render-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:
```

#### 手動安裝
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 redis-server

# macOS (使用 Homebrew)
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# Windows (使用 Chocolatey)
choco install postgresql redis
```

### 開發工具設定

#### VS Code 配置
建立 `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "node_modules": true,
    ".next": true,
    "dist": true,
    "coverage": true
  },
  "search.exclude": {
    "node_modules": true,
    ".next": true,
    "dist": true,
    "coverage": true
  }
}
```

#### VS Code 推薦擴展 (.vscode/extensions.json)
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

## 🏗️ 專案結構

### 目錄結構說明
```
Mermaid-Render/
├── src/                      # 前端源碼
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # 根佈局
│   │   ├── page.tsx         # 首頁
│   │   └── api/             # API 路由
│   ├── components/          # React 組件
│   │   ├── ui/              # 基礎 UI 組件
│   │   ├── editor/          # 編輯器組件
│   │   └── preview/         # 預覽組件
│   ├── lib/                 # 工具庫和設定
│   ├── hooks/               # 自定義 React Hooks
│   ├── stores/              # Zustand 狀態管理
│   ├── types/               # TypeScript 類型定義
│   └── styles/              # 全域樣式
├── server/                   # 後端源碼
│   ├── src/                 # 源碼目錄
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 業務邏輯
│   │   ├── lib/             # 工具庫
│   │   └── types/           # 類型定義
│   ├── prisma/              # 資料庫相關
│   │   ├── schema.prisma    # 資料庫架構
│   │   ├── migrations/      # 遷移檔案
│   │   └── seed.ts          # 種子資料
│   └── tests/               # 後端測試
├── docs/                     # 專案文件
├── .github/                  # GitHub Actions
├── public/                   # 靜態資源
└── package.json              # 專案配置
```

### 重要配置檔案
- `next.config.js` - Next.js 配置
- `tailwind.config.js` - Tailwind CSS 配置
- `tsconfig.json` - TypeScript 配置
- `eslint.config.js` - ESLint 配置
- `.prettierrc` - Prettier 配置
- `jest.config.js` - Jest 測試配置
- `playwright.config.ts` - E2E 測試配置

## 🧪 開發工作流程

### 日常開發流程
```bash
# 1. 更新本地代碼
git pull origin main

# 2. 安裝新依賴 (如果有)
npm install

# 3. 啟動開發環境
npm run dev:full  # 同時啟動前後端

# 4. 建立新功能分支
git checkout -b feature/your-feature-name

# 5. 開發過程中的檢查
npm run lint      # 代碼品質檢查
npm run type      # TypeScript 類型檢查
npm run test      # 運行測試

# 6. 提交代碼
git add .
git commit -m "feat: add your feature description"

# 7. 推送並建立 PR
git push origin feature/your-feature-name
```

### 常用開發命令
```bash
# 前端開發
npm run dev              # 啟動 Next.js 開發服務器
npm run build            # 建置前端專案
npm run start            # 啟動生產模式
npm run lint:fix         # 修復 lint 問題

# 後端開發  
npm run server           # 啟動 Fastify 開發服務器
npm run server:build     # 建置後端專案
npm run server:start     # 啟動生產模式後端

# 資料庫相關
npm run db:migrate       # 執行資料庫遷移
npm run db:seed          # 載入種子資料
npm run db:reset         # 重置資料庫
npm run db:studio        # 開啟 Prisma Studio

# 測試相關
npm run test             # 運行所有測試
npm run test:watch       # 監聽模式運行測試
npm run test:e2e         # 運行端到端測試
npm run test:coverage    # 生成測試覆蓋率報告

# 工具命令
npm run clean            # 清理建置檔案
npm run reset            # 完全重置專案狀態
npm run check            # 檢查專案健康狀態
```

## 🚨 故障排除

### 常見問題解決

#### 1. Node.js 版本問題
```bash
# 檢查版本
node --version

# 使用 nvm 安裝正確版本
nvm install 20.0.0
nvm use 20.0.0

# 或使用 fnm (更快)
fnm install 20.0.0
fnm use 20.0.0
```

#### 2. 依賴安裝失敗
```bash
# 清理 npm 快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install

# 或使用 yarn
rm -rf node_modules yarn.lock
yarn install
```

#### 3. 資料庫連接問題
```bash
# 檢查 PostgreSQL 狀態
docker ps  # 檢查容器是否運行
docker logs mermaid-render-postgres-dev  # 檢查日誌

# 重新啟動資料庫
docker-compose -f docker-compose.dev.yml restart postgres

# 測試連接
npm run db:check
```

#### 4. 編輯器問題
```bash
# 重新生成 TypeScript 定義
npx prisma generate
npm run build:types

# 重啟 TypeScript 服務器 (VS Code)
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

#### 5. 埠號衝突
```bash
# 檢查埠號使用情況
lsof -i :3000  # 前端埠號
lsof -i :4000  # 後端埠號

# 終止佔用埠號的程序
kill -9 <PID>

# 或修改 package.json 使用其他埠號
```

### 效能調優

#### 開發模式效能優化
```bash
# 增加 Node.js 記憶體限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 使用更快的套件管理器
npm install -g pnpm
pnpm install  # 比 npm 快 2-3 倍

# 啟用 Next.js 快速更新
echo "FAST_REFRESH=true" >> .env.local
```

### 除錯工具

#### 前端除錯
```javascript
// React Developer Tools
// Redux DevTools (如果使用)
// Next.js 除錯配置
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // 開啟除錯功能
    isrMemoryCacheSize: 0,
  },
}
```

#### 後端除錯
```bash
# 使用 Node.js inspector
node --inspect server/src/server.ts

# 或使用 VS Code 除錯配置 (.vscode/launch.json)
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/src/server.ts",
      "outFiles": ["${workspaceFolder}/server/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## 📚 開發資源

### 官方文件
- [Next.js 文件](https://nextjs.org/docs)
- [Fastify 文件](https://www.fastify.io/docs/)
- [Prisma 文件](https://www.prisma.io/docs)
- [Tailwind CSS 文件](https://tailwindcss.com/docs)

### 專案特定資源
- [架構設計文件](../architecture/system-architecture.md)
- [API 規範文件](../api/api-specification.md)
- [UI/UX 設計規範](../front-end-spec.md)
- [測試策略文件](../testing/testing-strategy.md)

### 開發者工具
- [VS Code Mermaid 擴展](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
- [Mermaid Live Editor](https://mermaid.live/)
- [Prisma Studio](https://www.prisma.io/studio)

## 🤝 貢獻指南

### 程式碼規範
請參考：
- [編碼標準](../architecture/coding-standards.md)
- [Git 工作流程](../development/git-workflow.md)
- [Code Review 指南](../development/code-review-guide.md)

### 提交 PR 前的檢查清單
- [ ] 程式碼通過所有 lint 檢查
- [ ] 所有測試通過
- [ ] 類型檢查無錯誤
- [ ] 新功能有相應的測試
- [ ] 文件已更新
- [ ] 在本地環境完整測試

---

**文件版本**: v1.0  
**最後更新**: 2025-08-31  
**維護者**: 開發團隊

如有問題或建議，請建立 GitHub Issue 或聯繫開發團隊。