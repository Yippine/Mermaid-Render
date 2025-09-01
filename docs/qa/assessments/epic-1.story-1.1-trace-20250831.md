# 需求追溯矩陣

## Story: epic-1.story-1.1 - 專案基礎架構建立

### 覆蓋率摘要

- 總需求數量: 7
- 完全覆蓋: 5 (71%)
- 部分覆蓋: 2 (29%)
- 未覆蓋: 0 (0%)

### 需求對應關係

#### AC1: 建立 Next.js 14 + TypeScript 前端專案結構

**覆蓋率: 完全覆蓋**

Given-When-Then 對應:

- **單元測試**: `src/app/__tests__/page.test.tsx::HomePage`
  - Given: Next.js 應用程式已建立並配置完成
  - When: 渲染 HomePage 元件
  - Then: 應該正確顯示 Mermaid Render 標題和專案資訊

- **E2E 測試**: `tests/e2e/basic.spec.ts::主頁面應該正確載入`
  - Given: 瀏覽器訪問根路徑
  - When: 頁面載入完成
  - Then: 頁面標題和內容應該正確顯示

#### AC2: 建立 Node.js + Fastify 後端專案結構

**覆蓋率: 部分覆蓋**

Given-When-Then 對應:

- **整合測試**: `tests/e2e/basic.spec.ts` (間接驗證)
  - Given: 後端服務器運行
  - When: 前端頁面載入
  - Then: Hello World API 回應正常 (隱含測試)

**覆蓋缺口**: 缺乏直接的後端 API 測試

#### AC3: 配置 ESLint、Prettier、Husky git hooks

**覆蓋率: 完全覆蓋**

Given-When-Then 對應:

- **程式碼品質驗證**: 開發流程中自動執行
  - Given: 程式碼提交前觸發 pre-commit hook
  - When: ESLint 和 Prettier 執行檢查
  - Then: 程式碼品質符合標準 (從故事 Dev Notes 確認通過)

#### AC4: 建立基礎 CI/CD 流程（GitHub Actions）

**覆蓋率: 完全覆蓋**

Given-When-Then 對應:

- **CI/CD 驗證**: GitHub Actions 工作流程
  - Given: 程式碼推送到 repository
  - When: GitHub Actions 觸發 CI 流程
  - Then: 自動化測試和建置成功 (從故事 Dev Notes 確認存在)

#### AC5: 配置開發環境 Docker 化（可選）

**覆蓋率: 完全覆蓋**

Given-When-Then 對應:

- **Docker 配置驗證**: 配置檔案存在性檢查
  - Given: Docker 配置檔案已建立
  - When: 開發環境啟動
  - Then: 前後端服務在容器中正常運行 (從故事 Dev Notes 確認完成)

#### AC6: 建立基本的測試框架設定（Jest + Testing Library）

**覆蓋率: 完全覆蓋**

Given-When-Then 對應:

- **測試框架驗證**: 實際測試執行
  - Given: Jest 和 React Testing Library 已配置
  - When: 執行 npm run test
  - Then: 3/3 測試通過 (從故事 Dev Notes 確認)

#### AC7: 專案能夠成功啟動並顯示「Hello World」頁面

**覆蓋率: 部分覆蓋**

Given-When-Then 對應:

- **前端驗證**: `src/app/__tests__/page.test.tsx` 和 `tests/e2e/basic.spec.ts`
  - Given: 前端應用程式啟動
  - When: 訪問主頁面
  - Then: Hello World 內容正確顯示

- **後端驗證**: 缺乏直接測試
  - Given: 後端 API 啟動
  - When: 訪問 /api/hello 端點
  - Then: 回應 Hello World JSON 資料

**覆蓋缺口**: 缺乏後端 API 端點的直接測試

### 關鍵缺口

1. **後端 API 測試缺失**
   - 缺口: 沒有後端 API 端點的直接測試
   - 風險: 中等 - 後端功能可能在重構時出錯
   - 行動: 建議實作 Fastify 整合測試，測試 /api/hello 和 /health 端點

2. **資料庫連接測試缺失**
   - 缺口: server.ts 中有 "TODO: 實際檢查資料庫連接" 註解
   - 風險: 中等 - 資料庫連接問題無法及早發現
   - 行動: 實作資料庫健康檢查測試

### 測試設計建議

基於識別的缺口，建議：

1. **新增後端整合測試**
   - 測試類型: 整合測試
   - 檔案位置: `server/tests/api.test.js`
   - 測試內容: API 端點回應驗證

2. **新增效能測試**
   - 測試類型: 效能測試
   - 工具: k6 或 Artillery
   - 測試內容: 基本負載測試

3. **新增資料庫連接測試**
   - 測試類型: 健康檢查測試
   - 內容: 驗證 Prisma 資料庫連接

### 風險評估

- **高風險**: 無 (所有關鍵需求都有某種程度的覆蓋)
- **中等風險**: 後端 API 和資料庫連接 (缺乏直接測試)
- **低風險**: 前端功能 (完整的單元+E2E 測試覆蓋)

### 品質指標

✅ **良好指標**:

- 每個 AC 都有至少一種測試覆蓋
- 前端有多層級測試 (單元+E2E)
- E2E 測試涵蓋關鍵使用者旅程
- 響應式設計測試

⚠️ **改進空間**:

- 後端測試覆蓋不足
- 缺乏 API 合約測試
- 缺乏錯誤情境測試

### 建議優先順序

1. **P0**: 新增後端 API 基本測試
2. **P1**: 實作資料庫連接健康檢查
3. **P2**: 新增 API 錯誤處理測試
4. **P3**: 考慮契約測試 (Pact 或類似工具)
