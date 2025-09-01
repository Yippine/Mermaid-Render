# Technical Assumptions

## Repository Structure: Monorepo

使用Monorepo架構統一管理前後端程式碼，便於共享類型定義和工具鏈。

## Service Architecture

**漸進式微服務架構**：MVP階段採用簡化的Monolith設計，但預留微服務擴展接口。核心模組：

- **渲染服務**：獨立的渲染引擎，可獨立擴展
- **匯出服務**：圖片生成與處理
- **API層**：RESTful API，預留GraphQL接口
- **前端應用**：Next.js SSG/SSR混合模式

**重要決策理由**：這種架構讓我們能快速交付MVP，同時為Phase 2/3的心智圖、XMind整合、AI功能預留完美的微服務拆分路徑。

## Testing Requirements

**全測試金字塔**：

- **單元測試**：核心渲染邏輯、工具函數
- **整合測試**：API端點、資料庫操作
- **E2E測試**：關鍵使用者流程（編輯→預覽→匯出）
- **視覺回歸測試**：圖表渲染結果驗證
- **效能測試**：大型圖表渲染效能

## Additional Technical Assumptions and Requests

- **前端技術棧**：Next.js 14 + TypeScript + Tailwind CSS
  - 圖形渲染：Cytoscape.js + ELK.js（多引擎架構）
  - 動畫：Framer Motion
  - UI元件：Radix UI
  - 程式碼編輯器：Monaco Editor
  - 狀態管理：Zustand
- **後端技術棧**：Node.js + Fastify + Prisma ORM
  - 資料庫：PostgreSQL（支援複雜查詢）
  - 快取：Redis（預覽結果快取）
  - 圖片處理：Sharp + Puppeteer
- **部署與基礎設施**：
  - Vercel部署（前端）
  - Railway/PlanetScale（資料庫）
  - CloudFlare CDN（靜態資源）
- **未來擴展預留**：
  - AI服務接口：OpenAI API + LangChain（Phase 3）
  - XMind解析模組：預留檔案解析接口（Phase 2）
  - 心智圖引擎：可插拔的圖表引擎架構（Phase 2）
