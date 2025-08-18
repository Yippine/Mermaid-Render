# Mermaid-Render 技術棧詳細說明

## 前端技術棧

### 核心框架
- **Next.js 14** - React全端框架，App Router模式
- **React 18** - 使用者介面函式庫，支援並行功能
- **TypeScript 5.0+** - 型別安全的JavaScript超集

### UI與樣式
- **Tailwind CSS 3.0+** - 實用優先的CSS框架
- **Radix UI** - 無障礙設計的無頭UI組件
- **Framer Motion** - 生產級動畫函式庫
- **Lucide React** - 精美的開源圖示庫

### 圖形與視覺化
- **Cytoscape.js** - 圖形理論分析與視覺化函式庫
- **ELK.js** - Eclipse佈局核心的JavaScript版本
- **D3.js** - 資料驅動的文件操作（輔助使用）

### 狀態管理與資料
- **Zustand** - 輕量級狀態管理
- **TanStack Query (React Query)** - 伺服器狀態管理
- **Zod** - TypeScript優先的架構驗證

### 開發工具
- **ESLint** - JavaScript/TypeScript程式碼檢查
- **Prettier** - 程式碼格式化工具
- **Husky** - Git hooks管理
- **lint-staged** - 暫存檔案的程式碼檢查

## 後端技術棧

### 運行環境與框架
- **Node.js 20+** - JavaScript運行環境
- **Fastify** - 高效能Web框架
- **TypeScript** - 型別安全的後端開發

### 資料庫與持久化
- **PostgreSQL 15** - 主要關聯式資料庫
- **Prisma ORM** - 下一代TypeScript ORM
- **Redis 7** - 記憶體中資料結構儲存（快取與會話）

### 認證與安全
- **NextAuth.js** - 完整的認證解決方案
- **bcrypt** - 密碼雜湊
- **JSON Web Tokens (JWT)** - 無狀態認證

### AI與機器學習
- **OpenAI API** - GPT模型整合
- **LangChain** - LLM應用程式開發框架
- **Pinecone** - 向量資料庫（未來功能）

## 開發與部署工具

### 版本控制與協作
- **Git** - 版本控制系統
- **GitHub** - 程式碼託管與協作平台
- **GitHub Actions** - CI/CD自動化

### 測試框架
- **Jest** - JavaScript測試框架
- **React Testing Library** - React組件測試
- **Playwright** - 端到端測試
- **Supertest** - HTTP斷言庫（API測試）

### 建置與打包
- **Webpack 5** - 模組打包器（Next.js內建）
- **SWC** - 快速TypeScript/JavaScript編譯器
- **PostCSS** - CSS轉換工具

### 監控與分析
- **Vercel Analytics** - 網站流量分析
- **Sentry** - 錯誤追蹤與效能監控
- **Plausible** - 隱私友善的網站分析

## 雲端服務與部署

### 主機服務
- **Vercel** - 前端部署與邊緣運算
- **Railway/Render** - 後端API部署
- **Cloudflare** - CDN與DNS管理

### 資料庫託管
- **Supabase** - PostgreSQL託管服務
- **Upstash** - Redis託管服務
- **Vercel KV** - 邊緣鍵值儲存

### 檔案儲存
- **Cloudinary** - 圖片與影片管理
- **Vercel Blob** - 檔案儲存解決方案

## 套件版本管理

### 前端核心依賴
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "cytoscape": "^3.26.0",
  "elkjs": "^0.8.2",
  "framer-motion": "^10.16.0",
  "@radix-ui/react-*": "^1.0.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^4.35.0"
}
```

### 後端核心依賴
```json
{
  "fastify": "^4.24.0",
  "@prisma/client": "^5.6.0",
  "prisma": "^5.6.0",
  "redis": "^4.6.0",
  "openai": "^4.20.0",
  "langchain": "^0.0.190",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0"
}
```

### 開發工具依賴
```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0",
  "husky": "^8.0.0",
  "lint-staged": "^15.0.0",
  "jest": "^29.0.0",
  "@testing-library/react": "^13.0.0",
  "playwright": "^1.40.0"
}
```

## 效能考量

### 前端效能優化
- **Code Splitting** - 動態匯入和路由層級程式碼分割
- **Tree Shaking** - 移除未使用的程式碼
- **Image Optimization** - Next.js內建圖片最佳化
- **Bundle Analysis** - 定期分析包大小

### 後端效能優化
- **連接池** - 資料庫連接最佳化
- **快取策略** - Redis多層快取
- **壓縮** - Gzip/Brotli回應壓縮
- **限流** - API速率限制

### 資料庫效能
- **索引最佳化** - 查詢效能最佳化
- **連接池** - 高效連接管理
- **查詢最佳化** - Prisma查詢最佳化
- **讀寫分離** - 主從複製（未來考慮）

## 安全性考量

### 前端安全
- **CSP** - 內容安全政策
- **XSS防護** - DOMPurify清理使用者輸入
- **CSRF防護** - NextAuth.js內建保護

### 後端安全
- **輸入驗證** - Zod架構驗證
- **SQL注入防護** - Prisma ORM保護
- **速率限制** - API呼叫頻率限制
- **CORS設定** - 跨域請求控制

### 資料安全
- **加密儲存** - 敏感資料加密
- **環境變數** - 敏感配置隔離
- **存取控制** - 角色基礎權限
- **稽核日誌** - 操作記錄追蹤

---

*此技術棧將隨專案需求與技術發展持續更新*